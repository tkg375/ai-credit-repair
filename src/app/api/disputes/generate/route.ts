import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { firestore, COLLECTIONS } from "@/lib/db";

function generateDisputeLetterContent(params: {
  creditorName: string;
  accountNumber: string;
  bureau: string;
  reason: string;
  userName: string;
  balance?: number;
}): string {
  const { creditorName, accountNumber, reason, userName, balance } = params;
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const balanceStr = balance !== undefined ? `$${balance.toLocaleString()}` : "Unknown";

  return `${today}

${creditorName}
[Insert Creditor/Collection Agency Address]
[City, State ZIP]

Re: Debt Validation and Dispute Request
Account Number: ${accountNumber}
Alleged Balance: ${balanceStr}

To Whom It May Concern:

I am writing regarding the above-referenced account. I dispute this debt and request validation pursuant to my rights under the Fair Debt Collection Practices Act (FDCPA), 15 U.S.C. § 1692g.

ACCOUNT INFORMATION:
Creditor/Collection Agency: ${creditorName}
Account Number: ${accountNumber}
Alleged Balance: ${balanceStr}

REASON FOR DISPUTE:
${reason}

VALIDATION REQUEST:
Under the FDCPA, I am entitled to request validation of this debt. Please provide the following:

1. The amount of the debt and how it was calculated, including all fees and interest
2. The name and address of the original creditor
3. A copy of any judgment (if applicable)
4. Proof that you are licensed to collect debts in my state
5. A copy of the original signed credit agreement or contract
6. Complete payment history from the original creditor
7. Proof that the statute of limitations has not expired
8. Proof that you own the debt or are authorized to collect on it

LEGAL NOTICE:
Until you provide proper validation, you must cease all collection activities including:
- Contacting me by phone, mail, or any other means
- Reporting this account to any credit reporting agency
- Filing or continuing any legal action

Under the FDCPA, you have 30 days to provide this validation. If you cannot validate this debt, you must:
1. Cease all collection efforts immediately
2. Remove any negative reporting from all credit bureaus (Equifax, Experian, TransUnion)
3. Notify me in writing that collection efforts have ceased

CREDIT REPORTING NOTICE:
Under the Fair Credit Reporting Act (FCRA), Section 623, you are prohibited from reporting information you know to be inaccurate. If you cannot validate this debt, continued reporting constitutes a violation of federal law.

Please respond in writing within 30 days. If I do not receive proper validation, I will file complaints with the Consumer Financial Protection Bureau (CFPB), the Federal Trade Commission (FTC), and my state Attorney General.

Sincerely,

${userName}
[Your Address]
[City, State ZIP]

---
SEND THIS LETTER VIA CERTIFIED MAIL WITH RETURN RECEIPT REQUESTED

This dispute letter was generated using Credit 800.
The information contained herein is provided for educational purposes only.
`;
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { itemId, creditorName, accountNumber, bureau, reason, balance } = await req.json();

    // Generate the dispute letter
    const letterContent = generateDisputeLetterContent({
      creditorName,
      accountNumber,
      bureau,
      reason: reason || "Information is inaccurate or unverifiable",
      userName: user.email?.split("@")[0] || "Consumer",
      balance,
    });

    // Create dispute record
    const disputeId = await firestore.addDoc(COLLECTIONS.disputes, {
      userId: user.uid,
      itemId,
      creditorName,
      bureau,
      reason: reason || "Information is inaccurate or unverifiable",
      status: "DRAFT",
      letterContent,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Update the report item to mark it's been disputed
    await firestore.updateDoc(COLLECTIONS.reportItems, itemId, {
      isDisputable: false,
      disputeStatus: "DRAFT",
      disputeId,
    });

    return NextResponse.json({
      disputeId,
      letterContent,
    });
  } catch (err) {
    console.error("Generate dispute error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
