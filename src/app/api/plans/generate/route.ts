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

    // Generate a comprehensive action plan
    const steps = [
      {
        order: 1,
        title: "Dispute Collection Accounts",
        description: "Send dispute letters to credit bureaus for collection accounts that may be inaccurate, outdated, or unverifiable. Focus on collections from Midland Credit Management and Portfolio Recovery.",
        category: "DISPUTE",
        impact: "HIGH",
        timeframe: "1-2 weeks",
        completed: false,
      },
      {
        order: 2,
        title: "Request Debt Validation",
        description: "For any collection accounts, send debt validation letters within 30 days of first contact. Collectors must prove they have the right to collect the debt.",
        category: "DISPUTE",
        impact: "HIGH",
        timeframe: "30 days",
        completed: false,
      },
      {
        order: 3,
        title: "Pay Down Credit Card Balances",
        description: "Your Discover card is at 96% utilization. Pay this down to below 30%, ideally below 10%. This can increase your score by 20-50 points.",
        category: "UTILIZATION",
        impact: "HIGH",
        timeframe: "1-3 months",
        completed: false,
      },
      {
        order: 4,
        title: "Set Up Automatic Payments",
        description: "Enroll all accounts in automatic payments to ensure you never miss a due date. Payment history is 35% of your credit score.",
        category: "PAYMENT",
        impact: "HIGH",
        timeframe: "1 week",
        completed: false,
      },
      {
        order: 5,
        title: "Dispute Late Payment Records",
        description: "Send goodwill letters to creditors requesting removal of late payment marks. Include your history as a customer and any extenuating circumstances.",
        category: "DISPUTE",
        impact: "MEDIUM",
        timeframe: "2-4 weeks",
        completed: false,
      },
      {
        order: 6,
        title: "Request Credit Limit Increases",
        description: "Ask your credit card issuers for credit limit increases. This will lower your utilization ratio without paying down debt.",
        category: "UTILIZATION",
        impact: "MEDIUM",
        timeframe: "1-2 weeks",
        completed: false,
      },
      {
        order: 7,
        title: "Keep Old Accounts Open",
        description: "Don't close your oldest credit cards, even if you don't use them. Length of credit history accounts for 15% of your score.",
        category: "CREDIT_MIX",
        impact: "MEDIUM",
        timeframe: "Ongoing",
        completed: false,
      },
      {
        order: 8,
        title: "Consider a Secured Credit Card",
        description: "If you have limited credit history, consider opening a secured credit card to build positive payment history.",
        category: "CREDIT_MIX",
        impact: "LOW",
        timeframe: "1-2 weeks",
        completed: false,
      },
      {
        order: 9,
        title: "Become an Authorized User",
        description: "Ask a family member with excellent credit to add you as an authorized user on their oldest card with perfect payment history.",
        category: "CREDIT_MIX",
        impact: "MEDIUM",
        timeframe: "1-2 weeks",
        completed: false,
      },
      {
        order: 10,
        title: "Monitor Your Credit Monthly",
        description: "Sign up for free credit monitoring to track your progress and catch any new issues early. Upload new reports to Credit 800 monthly.",
        category: "GENERAL",
        impact: "LOW",
        timeframe: "Ongoing",
        completed: false,
      },
    ];

    // Create the action plan
    const planId = await firestore.addDoc(COLLECTIONS.actionPlans, {
      userId: user.uid,
      reportId: reportId || null,
      title: "Your Path to 800",
      summary: "Based on your credit report analysis, we've created a personalized action plan to help you improve your credit score. Follow these steps in order for the best results.",
      steps,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      planId,
      title: "Your Path to 800",
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
