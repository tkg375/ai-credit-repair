export interface SimulationScenario {
  id: string;
  title: string;
  description: string;
  inputs: { key: string; label: string; type: "number" | "select"; min?: number; max?: number; options?: { value: string; label: string }[] }[];
}

export const scenarios: SimulationScenario[] = [
  {
    id: "pay_off_balance",
    title: "Pay Off a Balance",
    description: "See how paying off a credit card or loan balance affects your score.",
    inputs: [
      { key: "currentBalance", label: "Current Balance ($)", type: "number", min: 0, max: 100000 },
      { key: "creditLimit", label: "Credit Limit ($)", type: "number", min: 0, max: 100000 },
      { key: "paymentAmount", label: "Payment Amount ($)", type: "number", min: 0, max: 100000 },
    ],
  },
  {
    id: "remove_late_payment",
    title: "Remove a Late Payment",
    description: "Estimate the impact of removing a late payment from your report.",
    inputs: [
      { key: "latePayments", label: "Current Late Payments on File", type: "number", min: 1, max: 20 },
      { key: "severity", label: "Severity", type: "select", options: [
        { value: "30", label: "30 Days Late" },
        { value: "60", label: "60 Days Late" },
        { value: "90", label: "90+ Days Late" },
      ]},
    ],
  },
  {
    id: "remove_collection",
    title: "Remove a Collection",
    description: "See the potential impact of removing a collection account.",
    inputs: [
      { key: "collectionBalance", label: "Collection Balance ($)", type: "number", min: 0, max: 50000 },
      { key: "totalCollections", label: "Total Collections on File", type: "number", min: 1, max: 10 },
    ],
  },
  {
    id: "reduce_utilization",
    title: "Reduce Credit Utilization",
    description: "See how lowering your overall utilization impacts your score.",
    inputs: [
      { key: "currentUtilization", label: "Current Utilization (%)", type: "number", min: 0, max: 100 },
      { key: "targetUtilization", label: "Target Utilization (%)", type: "number", min: 0, max: 100 },
    ],
  },
  {
    id: "open_new_account",
    title: "Open a New Account",
    description: "Estimate the short-term and long-term effects of opening a new credit account.",
    inputs: [
      { key: "currentAccounts", label: "Current Number of Accounts", type: "number", min: 0, max: 30 },
      { key: "accountType", label: "Account Type", type: "select", options: [
        { value: "credit_card", label: "Credit Card" },
        { value: "auto_loan", label: "Auto Loan" },
        { value: "personal_loan", label: "Personal Loan" },
      ]},
    ],
  },
  {
    id: "add_authorized_user",
    title: "Become an Authorized User",
    description: "Estimate the impact of being added as an authorized user on an established account.",
    inputs: [
      { key: "accountAge", label: "Account Age (years)", type: "number", min: 1, max: 30 },
      { key: "utilization", label: "Account Utilization (%)", type: "number", min: 0, max: 100 },
    ],
  },
];

export interface SimulationResult {
  newScoreMin: number;
  newScoreMax: number;
  explanation: string;
  impact: "positive" | "negative" | "neutral";
}

export function simulateScoreChange(
  currentScore: number,
  scenarioId: string,
  params: Record<string, number>
): SimulationResult {
  const clamp = (val: number) => Math.max(300, Math.min(850, Math.round(val)));

  switch (scenarioId) {
    case "pay_off_balance": {
      const { currentBalance = 0, creditLimit = 1, paymentAmount = 0 } = params;
      const currentUtil = creditLimit > 0 ? (currentBalance / creditLimit) * 100 : 0;
      const newBalance = Math.max(0, currentBalance - paymentAmount);
      const newUtil = creditLimit > 0 ? (newBalance / creditLimit) * 100 : 0;
      const utilDrop = currentUtil - newUtil;
      const boost = utilDrop > 0 ? Math.round(utilDrop * 0.7) : 0;
      return {
        newScoreMin: clamp(currentScore + Math.max(0, boost - 10)),
        newScoreMax: clamp(currentScore + boost + 5),
        explanation: `Reducing utilization from ${Math.round(currentUtil)}% to ${Math.round(newUtil)}% could boost your score. Utilization accounts for ~30% of your score.`,
        impact: boost > 0 ? "positive" : "neutral",
      };
    }

    case "remove_late_payment": {
      const { latePayments = 1, severity = 30 } = params;
      const severityMultiplier = severity >= 90 ? 1.5 : severity >= 60 ? 1.2 : 1.0;
      const singleImpact = latePayments === 1 ? 30 : 20;
      const boost = Math.round(singleImpact * severityMultiplier);
      return {
        newScoreMin: clamp(currentScore + boost - 10),
        newScoreMax: clamp(currentScore + boost + 15),
        explanation: `Removing a ${severity}-day late payment could significantly help. Payment history is 35% of your score — the single largest factor.`,
        impact: "positive",
      };
    }

    case "remove_collection": {
      const { collectionBalance = 0, totalCollections = 1 } = params;
      const balanceImpact = collectionBalance > 5000 ? 15 : collectionBalance > 1000 ? 10 : 5;
      const isOnly = totalCollections <= 1;
      const boost = isOnly ? 40 + balanceImpact : 20 + balanceImpact;
      return {
        newScoreMin: clamp(currentScore + boost - 15),
        newScoreMax: clamp(currentScore + boost + 20),
        explanation: `Removing ${isOnly ? "your only" : "a"} collection account ($${collectionBalance.toLocaleString()}) could provide a substantial score increase. Collections heavily impact payment history.`,
        impact: "positive",
      };
    }

    case "reduce_utilization": {
      const { currentUtilization = 50, targetUtilization = 10 } = params;
      const drop = currentUtilization - targetUtilization;
      if (drop <= 0) {
        return {
          newScoreMin: currentScore,
          newScoreMax: currentScore,
          explanation: "Target utilization is not lower than current. No change expected.",
          impact: "neutral",
        };
      }
      let boost = Math.round(drop * 0.6);
      if (targetUtilization <= 10) boost += 10;
      if (targetUtilization <= 1) boost += 5;
      return {
        newScoreMin: clamp(currentScore + boost - 8),
        newScoreMax: clamp(currentScore + boost + 8),
        explanation: `Dropping utilization from ${currentUtilization}% to ${targetUtilization}% targets the ideal range. Under 10% is optimal, under 30% is good.`,
        impact: "positive",
      };
    }

    case "open_new_account": {
      const { currentAccounts = 3 } = params;
      const hardInquiryHit = -8;
      const mixBonus = currentAccounts < 3 ? 5 : 0;
      const avgAgeHit = currentAccounts > 0 ? -5 : 0;
      const net = hardInquiryHit + mixBonus + avgAgeHit;
      return {
        newScoreMin: clamp(currentScore + net - 5),
        newScoreMax: clamp(currentScore + net + 10),
        explanation: `Opening a new account adds a hard inquiry (-5 to -10 pts short-term) and lowers average account age. However, it may improve credit mix (+5 pts) over time.`,
        impact: net < -3 ? "negative" : "neutral",
      };
    }

    case "add_authorized_user": {
      const { accountAge = 5, utilization = 10 } = params;
      const ageBonus = Math.min(20, accountAge * 3);
      const utilBonus = utilization <= 10 ? 10 : utilization <= 30 ? 5 : 0;
      const boost = ageBonus + utilBonus;
      return {
        newScoreMin: clamp(currentScore + boost - 10),
        newScoreMax: clamp(currentScore + boost + 5),
        explanation: `Being added to a ${accountAge}-year-old account with ${utilization}% utilization can boost your average age of accounts and lower overall utilization.`,
        impact: "positive",
      };
    }

    default:
      return {
        newScoreMin: currentScore,
        newScoreMax: currentScore,
        explanation: "Unknown scenario.",
        impact: "neutral",
      };
  }
}
