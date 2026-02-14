import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { firestore, COLLECTIONS } from "@/lib/db";

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const reportId = body.reportId;

    // Pull user's actual report items to personalize the plan
    const reportItems = await firestore.query(COLLECTIONS.reportItems, [
      { field: "userId", op: "EQUAL", value: user.uid },
    ]);

    const items = reportItems.map((item) => item.data);

    // Analyze the user's actual situation
    const collections = items.filter(
      (i) =>
        String(i.status).includes("COLLECTION") ||
        String(i.accountType).toLowerCase().includes("collection")
    );
    const chargeOffs = items.filter(
      (i) =>
        String(i.status).includes("CHARGE") ||
        String(i.status).includes("WRITTEN")
    );
    const latePayments = items.filter(
      (i) =>
        String(i.status).includes("LATE") ||
        String(i.status).includes("DELINQUENT") ||
        (Array.isArray(i.latePayments) && i.latePayments.length > 0)
    );
    const medicalCollections = collections.filter((i) =>
      String(i.accountType).toLowerCase().includes("medical")
    );
    const highUtilization = items.filter((i) => {
      const balance = Number(i.balance) || 0;
      const limit = Number(i.creditLimit) || 0;
      return limit > 0 && balance / limit > 0.3;
    });

    const totalDebt = items.reduce(
      (sum, i) => sum + (Number(i.balance) || 0),
      0
    );
    const collectionDebt = collections.reduce(
      (sum, i) => sum + (Number(i.balance) || 0),
      0
    );

    // Load credit score
    const scores = await firestore.query(COLLECTIONS.creditScores, [
      { field: "userId", op: "EQUAL", value: user.uid },
    ]);
    const currentScore = scores.length > 0 ? Number(scores[0].data.score) : null;

    // Build personalized steps based on actual data
    const steps: {
      order: number;
      title: string;
      description: string;
      category: string;
      impact: "HIGH" | "MEDIUM" | "LOW";
      timeframe: string;
      completed: boolean;
    }[] = [];
    let stepOrder = 1;

    // Step: Dispute collections (if any)
    if (collections.length > 0) {
      const collectorNames = collections
        .map((c) => String(c.creditorName))
        .slice(0, 3)
        .join(", ");
      steps.push({
        order: stepOrder++,
        title: "Dispute Collection Accounts",
        description: `You have ${collections.length} collection account${collections.length > 1 ? "s" : ""} totaling $${collectionDebt.toLocaleString()} from ${collectorNames}${collections.length > 3 ? " and others" : ""}. Send debt validation letters to each collector requesting proof of debt ownership. Collections are the most damaging items on your report — removing even one can boost your score 20-40 points.`,
        category: "DISPUTE",
        impact: "HIGH",
        timeframe: "1-2 weeks to send, 30 days for response",
        completed: false,
      });
    }

    // Step: Medical collections (HIPAA angle)
    if (medicalCollections.length > 0) {
      const medicalTotal = medicalCollections.reduce(
        (sum, i) => sum + (Number(i.balance) || 0),
        0
      );
      steps.push({
        order: stepOrder++,
        title: "Challenge Medical Collections via HIPAA",
        description: `You have ${medicalCollections.length} medical collection${medicalCollections.length > 1 ? "s" : ""} totaling $${medicalTotal.toLocaleString()}. Medical collectors frequently violate HIPAA privacy rules. Request proof of HIPAA-compliant authorization and verify your insurance was properly billed before the debt went to collections. Paid medical collections under $500 must be removed under current FCRA rules.`,
        category: "DISPUTE",
        impact: "HIGH",
        timeframe: "2-4 weeks",
        completed: false,
      });
    }

    // Step: Charge-offs
    if (chargeOffs.length > 0) {
      const chargeOffNames = chargeOffs
        .map((c) => String(c.creditorName))
        .slice(0, 3)
        .join(", ");
      steps.push({
        order: stepOrder++,
        title: "Negotiate Charge-Off Removal",
        description: `You have ${chargeOffs.length} charge-off${chargeOffs.length > 1 ? "s" : ""} from ${chargeOffNames}. Contact the original creditor's executive office and negotiate a pay-for-delete or settlement with deletion agreement. Always get the agreement in writing before sending any payment. A charge-off removal can add 30-50 points to your score.`,
        category: "DISPUTE",
        impact: "HIGH",
        timeframe: "2-6 weeks",
        completed: false,
      });
    }

    // Step: Pay down high utilization
    if (highUtilization.length > 0) {
      const utilizationDetails = highUtilization
        .map((i) => {
          const balance = Number(i.balance) || 0;
          const limit = Number(i.creditLimit) || 0;
          const util = limit > 0 ? Math.round((balance / limit) * 100) : 0;
          return `${i.creditorName} (${util}% used - $${balance.toLocaleString()}/$${limit.toLocaleString()})`;
        })
        .join("; ");
      steps.push({
        order: stepOrder++,
        title: "Pay Down High Credit Card Balances",
        description: `Your cards with high utilization: ${utilizationDetails}. Credit utilization is 30% of your score. Pay these down to below 30%, ideally below 10%, for an immediate score boost of 20-50 points. Pay the highest utilization cards first.`,
        category: "UTILIZATION",
        impact: "HIGH",
        timeframe: "1-3 months",
        completed: false,
      });
    }

    // Step: Late payment goodwill
    if (latePayments.length > 0) {
      const lateNames = latePayments
        .map((c) => String(c.creditorName))
        .slice(0, 3)
        .join(", ");
      steps.push({
        order: stepOrder++,
        title: "Send Goodwill Letters for Late Payments",
        description: `You have late payment records on ${latePayments.length} account${latePayments.length > 1 ? "s" : ""} including ${lateNames}. Write to each creditor's executive office requesting removal as a goodwill gesture. Mention your loyalty as a customer and any hardship circumstances. Even one late payment removal can add 10-20 points.`,
        category: "DISPUTE",
        impact: "MEDIUM",
        timeframe: "2-4 weeks",
        completed: false,
      });
    }

    // Step: Set up auto-pay (always relevant)
    steps.push({
      order: stepOrder++,
      title: "Set Up Automatic Payments on All Accounts",
      description:
        "Enroll every open account in automatic payments — at least the minimum due. Payment history is 35% of your credit score and a single missed payment can drop your score 50-100 points. Set up alerts 5 days before each due date as a safety net.",
      category: "PAYMENT",
      impact: "HIGH",
      timeframe: "1 week",
      completed: false,
    });

    // Step: Request credit limit increases
    if (highUtilization.length > 0 || items.some((i) => Number(i.creditLimit) > 0)) {
      steps.push({
        order: stepOrder++,
        title: "Request Credit Limit Increases",
        description:
          "Call each credit card issuer and request a credit limit increase. This instantly lowers your utilization ratio without paying down balances. Ask for a soft-pull increase first — many issuers offer this. A higher limit with the same balance can improve your score by 10-30 points.",
        category: "UTILIZATION",
        impact: "MEDIUM",
        timeframe: "1-2 weeks",
        completed: false,
      });
    }

    // Step: Bureau disputes (always relevant if there are negative items)
    if (items.filter((i) => i.isDisputable).length > 0) {
      steps.push({
        order: stepOrder++,
        title: "File Disputes with All Three Credit Bureaus",
        description: `File formal disputes with Equifax, Experian, and TransUnion for each inaccurate item. Cite specific errors: wrong balances, incorrect dates, accounts that aren't yours, or incomplete information. Bureaus have 30 days to investigate or must delete the item. Use the dispute letters generated in the Disputes tab — they include the correct bureau addresses.`,
        category: "DISPUTE",
        impact: "HIGH",
        timeframe: "30-45 days",
        completed: false,
      });
    }

    // Step: Authorized user
    steps.push({
      order: stepOrder++,
      title: "Become an Authorized User on a Strong Account",
      description:
        "Ask a family member or trusted person with excellent credit to add you as an authorized user on their oldest credit card with perfect payment history. Their account history gets added to your report, instantly boosting your average account age and payment history. This can add 20-50 points.",
      category: "CREDIT_MIX",
      impact: "MEDIUM",
      timeframe: "1-2 weeks",
      completed: false,
    });

    // Step: Don't close old accounts
    steps.push({
      order: stepOrder++,
      title: "Keep Old Accounts Open",
      description:
        "Never close your oldest credit cards, even if you don't use them. Length of credit history is 15% of your score. Use each old card for a small recurring charge (like a subscription) and set it to auto-pay. This keeps the accounts active and aging in your favor.",
      category: "CREDIT_MIX",
      impact: "MEDIUM",
      timeframe: "Ongoing",
      completed: false,
    });

    // Step: Monitor
    steps.push({
      order: stepOrder++,
      title: "Monitor Your Credit Monthly",
      description:
        "Pull your free credit reports from AnnualCreditReport.com and upload them here monthly. Track your score changes, catch new errors early, and follow up on any disputes that haven't been resolved. Consistent monitoring is the key to maintaining an 800+ score.",
      category: "GENERAL",
      impact: "LOW",
      timeframe: "Ongoing",
      completed: false,
    });

    // Build summary
    const summaryParts: string[] = [];
    if (currentScore) {
      summaryParts.push(
        `Your current score is ${currentScore}.`
      );
    }
    if (collections.length > 0) {
      summaryParts.push(
        `You have ${collections.length} collection${collections.length > 1 ? "s" : ""} totaling $${collectionDebt.toLocaleString()} that should be disputed immediately.`
      );
    }
    if (highUtilization.length > 0) {
      summaryParts.push(
        `${highUtilization.length} card${highUtilization.length > 1 ? "s are" : " is"} above 30% utilization — paying these down will give you the fastest score boost.`
      );
    }
    summaryParts.push(
      `Follow these ${steps.length} steps in order for maximum impact.`
    );

    const summary = summaryParts.join(" ");
    const title = currentScore
      ? `Your Path from ${currentScore} to 800`
      : "Your Path to 800";

    // Create the action plan
    const planId = await firestore.addDoc(COLLECTIONS.actionPlans, {
      userId: user.uid,
      reportId: reportId || null,
      title,
      summary,
      steps,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      planId,
      title,
      stepsCount: steps.length,
    });
  } catch (err) {
    console.error("Generate plan error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
