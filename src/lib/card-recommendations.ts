export interface CreditCard {
  id: string;
  name: string;
  issuer: string;
  type: "secured" | "unsecured" | "credit_builder";
  annualFee: number;
  deposit: number | null;
  aprRange: string;
  reportsToBureaus: string[];
  features: string[];
  bestFor: string;
  scoreRange: { min: number; max: number };
  colorClass: string;
}

export const creditCards: CreditCard[] = [
  {
    id: "discover-secured",
    name: "Discover it Secured",
    issuer: "Discover",
    type: "secured",
    annualFee: 0,
    deposit: 200,
    aprRange: "28.24% Variable",
    reportsToBureaus: ["Equifax", "Experian", "TransUnion"],
    features: ["2% cash back at restaurants and gas stations (up to $1,000/quarter)", "1% cash back on all other purchases", "Cashback Match first year", "Free FICO score", "No annual fee", "Automatic reviews for upgrade to unsecured"],
    bestFor: "Best overall secured card",
    scoreRange: { min: 300, max: 650 },
    colorClass: "from-orange-400 to-orange-600",
  },
  {
    id: "capital-one-platinum-secured",
    name: "Platinum Secured",
    issuer: "Capital One",
    type: "secured",
    annualFee: 0,
    deposit: 200,
    aprRange: "30.74% Variable",
    reportsToBureaus: ["Equifax", "Experian", "TransUnion"],
    features: ["No annual fee", "Access to higher credit line after 6 months", "Automatic upgrade consideration", "CreditWise free credit monitoring", "Fraud coverage"],
    bestFor: "Building credit with Capital One",
    scoreRange: { min: 300, max: 600 },
    colorClass: "from-blue-600 to-blue-800",
  },
  {
    id: "opensky-secured",
    name: "OpenSky Secured Visa",
    issuer: "OpenSky",
    type: "secured",
    annualFee: 35,
    deposit: 200,
    aprRange: "25.64% Variable",
    reportsToBureaus: ["Equifax", "Experian", "TransUnion"],
    features: ["No credit check required", "Reports to all 3 bureaus", "Choose deposit from $200-$3,000", "No bank account required"],
    bestFor: "No credit check needed",
    scoreRange: { min: 300, max: 850 },
    colorClass: "from-sky-400 to-sky-600",
  },
  {
    id: "chime-credit-builder",
    name: "Credit Builder Visa",
    issuer: "Chime",
    type: "credit_builder",
    annualFee: 0,
    deposit: null,
    aprRange: "No interest charged",
    reportsToBureaus: ["Equifax", "Experian", "TransUnion"],
    features: ["No annual fee", "No interest charges", "No credit check", "No minimum deposit", "Spend money you already have in your account", "Automatic payments"],
    bestFor: "No fees at all",
    scoreRange: { min: 300, max: 850 },
    colorClass: "from-green-400 to-green-600",
  },
  {
    id: "self-credit-builder",
    name: "Credit Builder Account",
    issuer: "Self",
    type: "credit_builder",
    annualFee: 0,
    deposit: null,
    aprRange: "15.92% - 15.97%",
    reportsToBureaus: ["Equifax", "Experian", "TransUnion"],
    features: ["Not a credit card — it's a credit-builder loan", "Build savings while building credit", "Plans starting at $25/month", "No credit check to apply", "Reports to all 3 bureaus"],
    bestFor: "Build credit and savings simultaneously",
    scoreRange: { min: 300, max: 850 },
    colorClass: "from-purple-400 to-purple-600",
  },
  {
    id: "citi-secured",
    name: "Secured Mastercard",
    issuer: "Citi",
    type: "secured",
    annualFee: 0,
    deposit: 200,
    aprRange: "29.24% Variable",
    reportsToBureaus: ["Equifax", "Experian", "TransUnion"],
    features: ["No annual fee", "$200 minimum deposit", "Review for upgrade after 18 months", "Access to Citi entertainment benefits", "Free FICO score"],
    bestFor: "Citi banking customers",
    scoreRange: { min: 300, max: 650 },
    colorClass: "from-blue-500 to-indigo-600",
  },
  {
    id: "boa-secured",
    name: "Customized Cash Rewards Secured",
    issuer: "Bank of America",
    type: "secured",
    annualFee: 0,
    deposit: 200,
    aprRange: "29.24% Variable",
    reportsToBureaus: ["Equifax", "Experian", "TransUnion"],
    features: ["3% cash back in a category of your choice", "2% at grocery stores and wholesale clubs", "1% on all other purchases", "No annual fee", "$200 minimum deposit"],
    bestFor: "Best rewards on a secured card",
    scoreRange: { min: 300, max: 650 },
    colorClass: "from-red-500 to-red-700",
  },
  {
    id: "first-progress-platinum",
    name: "Platinum Select Mastercard",
    issuer: "First Progress",
    type: "secured",
    annualFee: 39,
    deposit: 200,
    aprRange: "19.99% Variable",
    reportsToBureaus: ["Equifax", "Experian", "TransUnion"],
    features: ["No credit check", "Low APR for a secured card", "Choose deposit from $200-$2,000", "Reports to all 3 bureaus"],
    bestFor: "Lowest APR secured card",
    scoreRange: { min: 300, max: 850 },
    colorClass: "from-yellow-500 to-amber-600",
  },
  {
    id: "applied-bank-secured",
    name: "Secured Visa Gold",
    issuer: "Applied Bank",
    type: "secured",
    annualFee: 48,
    deposit: 200,
    aprRange: "9.99% Fixed",
    reportsToBureaus: ["Equifax", "Experian", "TransUnion"],
    features: ["Very low fixed APR", "Reports to all 3 bureaus", "No credit check", "$200-$1,000 credit limit based on deposit"],
    bestFor: "Lowest fixed APR option",
    scoreRange: { min: 300, max: 850 },
    colorClass: "from-amber-400 to-amber-600",
  },
  {
    id: "credit-one-platinum",
    name: "Platinum Visa",
    issuer: "Credit One Bank",
    type: "unsecured",
    annualFee: 75,
    deposit: null,
    aprRange: "29.74% - 35.74%",
    reportsToBureaus: ["Equifax", "Experian", "TransUnion"],
    features: ["Unsecured — no deposit required", "1% cash back on eligible purchases", "Free credit score tracking", "Pre-qualification without impacting credit"],
    bestFor: "Unsecured option for bad credit",
    scoreRange: { min: 500, max: 650 },
    colorClass: "from-slate-600 to-slate-800",
  },
];

export function getRecommendations(
  creditScore: number,
  goals: string[]
): CreditCard[] {
  let filtered = creditCards.filter(
    (card) => creditScore >= card.scoreRange.min && creditScore <= card.scoreRange.max
  );

  if (goals.includes("no_fees")) {
    filtered = filtered.sort((a, b) => a.annualFee - b.annualFee);
  }
  if (goals.includes("no_deposit")) {
    filtered = filtered.sort((a, b) => {
      if (a.deposit === null && b.deposit !== null) return -1;
      if (a.deposit !== null && b.deposit === null) return 1;
      return 0;
    });
  }
  if (goals.includes("rewards")) {
    filtered = filtered.sort((a, b) => {
      const aRewards = a.features.some((f) => f.toLowerCase().includes("cash back"));
      const bRewards = b.features.some((f) => f.toLowerCase().includes("cash back"));
      if (aRewards && !bRewards) return -1;
      if (!aRewards && bRewards) return 1;
      return 0;
    });
  }
  if (goals.includes("all_bureaus")) {
    filtered = filtered.filter((c) => c.reportsToBureaus.length === 3);
  }

  return filtered;
}
