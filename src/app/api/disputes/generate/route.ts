import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { firestore, COLLECTIONS } from "@/lib/db";
import { resolveCreditorAddress, formatAddress, type CreditorAddress } from "@/lib/creditor-addresses";

function isBureauDispute(reason: string): boolean {
  const r = reason.toLowerCase();
  return r.includes("credit bureau dispute") || r.includes("fcra section 611") || r.includes("fcra 611");
}

function generateBureauDisputeLetterContent(params: {
  creditorName: string;
  bureauAddress: CreditorAddress | null;
  bureauName: string;
  accountNumber: string;
  reason: string;
  userName: string;
  balance?: number;
}): string {
  const { creditorName, bureauAddress, bureauName, accountNumber, reason, userName, balance } = params;
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const balanceStr = balance !== undefined ? `$${balance.toLocaleString()}` : "Unknown";

  const addressBlock = bureauAddress
    ? `${bureauAddress.name}\n${formatAddress(bureauAddress)}`
    : `${bureauName}\n[Insert Bureau Address]\n[City, State ZIP]`;

  return `${today}

${addressBlock}

Re: Formal Dispute Under FCRA Section 611
Account: ${creditorName}
Account Number: ${accountNumber}
Reported Balance: ${balanceStr}

To Whom It May Concern:

I am writing to formally dispute the accuracy of the following account on my credit report, pursuant to my rights under the Fair Credit Reporting Act (FCRA), 15 U.S.C. § 1681i (Section 611).

DISPUTED ACCOUNT INFORMATION:
Creditor/Furnisher: ${creditorName}
Account Number: ${accountNumber}
Reported Balance: ${balanceStr}

REASON FOR DISPUTE:
${reason}

INVESTIGATION REQUEST:
Under FCRA Section 611, I am requesting that you conduct a reasonable investigation into this disputed item. Specifically, I request that you:

1. Contact the furnisher (${creditorName}) to verify the accuracy of every element of this account
2. Verify the account balance, payment history, dates, and account status
3. Verify the account actually belongs to me
4. Verify the original creditor information is accurate
5. Review any documentation I have enclosed supporting my dispute

LEGAL REQUIREMENTS:
Under the FCRA, you are required to:
- Conduct a reasonable investigation within 30 days of receiving this dispute (FCRA § 1681i(a)(1))
- Forward all relevant information I provide to the furnisher (FCRA § 1681i(a)(2))
- Provide me with written results of the investigation within 5 business days of completion (FCRA § 1681i(a)(6))
- Delete or modify the disputed information if it cannot be verified (FCRA § 1681i(a)(5))
- Notify me of my right to add a consumer statement if the dispute is not resolved in my favor

If the furnisher cannot verify this information, it must be promptly deleted from my credit report. Under FCRA § 1681s-2(b), the furnisher is required to conduct its own investigation upon receiving notice from you.

NOTICE OF RIGHTS:
If you fail to investigate this dispute within 30 days, or if you continue to report information you know or have reason to believe is inaccurate, I will file complaints with the Consumer Financial Protection Bureau (CFPB) and may pursue legal action under FCRA § 1681n (willful noncompliance) or § 1681o (negligent noncompliance), which provide for actual damages, statutory damages, punitive damages, and attorney's fees.

Please send the results of your investigation to the address below.

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

function generateDisputeLetterContent(params: {
  creditorName: string;
  creditorAddress?: CreditorAddress | null;
  accountNumber: string;
  bureau: string;
  reason: string;
  userName: string;
  balance?: number;
}): string {
  const { creditorName, creditorAddress, accountNumber, reason, userName, balance } = params;
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const balanceStr = balance !== undefined ? `$${balance.toLocaleString()}` : "Unknown";

  const addressBlock = creditorAddress
    ? formatAddress(creditorAddress)
    : "[Insert Creditor/Collection Agency Address]\n[City, State ZIP]";

  return `${today}

${creditorName}
${addressBlock}

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

    const disputeReason = reason || "Information is inaccurate or unverifiable";
    const bureauDispute = isBureauDispute(disputeReason);

    // Look up address: bureau address for bureau disputes, creditor address otherwise
    let creditorAddress: CreditorAddress | null = null;
    try {
      if (bureauDispute && bureau) {
        // For bureau disputes, address the letter TO the credit bureau
        creditorAddress = await resolveCreditorAddress(bureau);
      } else {
        creditorAddress = await resolveCreditorAddress(creditorName);
      }
    } catch (addrError) {
      console.error("Address lookup failed (non-blocking):", addrError);
    }

    // Generate the appropriate dispute letter
    let letterContent: string;
    if (bureauDispute) {
      letterContent = generateBureauDisputeLetterContent({
        creditorName,
        bureauAddress: creditorAddress,
        bureauName: bureau || "Credit Bureau",
        accountNumber,
        reason: disputeReason,
        userName: user.email?.split("@")[0] || "Consumer",
        balance,
      });
    } else {
      letterContent = generateDisputeLetterContent({
        creditorName,
        creditorAddress,
        accountNumber,
        bureau,
        reason: disputeReason,
        userName: user.email?.split("@")[0] || "Consumer",
        balance,
      });
    }

    // Create dispute record with address metadata
    const disputeId = await firestore.addDoc(COLLECTIONS.disputes, {
      userId: user.uid,
      itemId,
      creditorName,
      bureau,
      reason: disputeReason,
      status: "DRAFT",
      letterContent,
      creditorAddress: creditorAddress
        ? {
            name: creditorAddress.name,
            address: creditorAddress.address,
            city: creditorAddress.city,
            state: creditorAddress.state,
            zip: creditorAddress.zip,
            department: creditorAddress.department || null,
            source: creditorAddress.source,
            confidence: creditorAddress.confidence || null,
          }
        : null,
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
      addressFound: !!creditorAddress,
      addressSource: creditorAddress?.source || null,
      addressConfidence: creditorAddress?.confidence || null,
    });
  } catch (err) {
    console.error("Generate dispute error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
