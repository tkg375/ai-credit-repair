// Statute of Limitations by state (in years) for different debt types
export const STATUTE_OF_LIMITATIONS: Record<string, { written: number; oral: number; promissory: number; openEnded: number }> = {
  AL: { written: 6, oral: 6, promissory: 6, openEnded: 3 },
  AK: { written: 3, oral: 3, promissory: 3, openEnded: 3 },
  AZ: { written: 6, oral: 3, promissory: 6, openEnded: 6 },
  AR: { written: 5, oral: 3, promissory: 5, openEnded: 5 },
  CA: { written: 4, oral: 2, promissory: 4, openEnded: 4 },
  CO: { written: 6, oral: 6, promissory: 6, openEnded: 6 },
  CT: { written: 6, oral: 3, promissory: 6, openEnded: 6 },
  DE: { written: 3, oral: 3, promissory: 3, openEnded: 3 },
  DC: { written: 3, oral: 3, promissory: 3, openEnded: 3 },
  FL: { written: 5, oral: 4, promissory: 5, openEnded: 4 },
  GA: { written: 6, oral: 4, promissory: 6, openEnded: 4 },
  HI: { written: 6, oral: 6, promissory: 6, openEnded: 6 },
  ID: { written: 5, oral: 4, promissory: 5, openEnded: 5 },
  IL: { written: 5, oral: 5, promissory: 5, openEnded: 5 },
  IN: { written: 6, oral: 6, promissory: 6, openEnded: 6 },
  IA: { written: 5, oral: 5, promissory: 5, openEnded: 5 },
  KS: { written: 5, oral: 3, promissory: 5, openEnded: 5 },
  KY: { written: 5, oral: 5, promissory: 5, openEnded: 5 },
  LA: { written: 3, oral: 3, promissory: 3, openEnded: 3 },
  ME: { written: 6, oral: 6, promissory: 6, openEnded: 6 },
  MD: { written: 3, oral: 3, promissory: 3, openEnded: 3 },
  MA: { written: 6, oral: 6, promissory: 6, openEnded: 6 },
  MI: { written: 6, oral: 6, promissory: 6, openEnded: 6 },
  MN: { written: 6, oral: 6, promissory: 6, openEnded: 6 },
  MS: { written: 3, oral: 3, promissory: 3, openEnded: 3 },
  MO: { written: 5, oral: 5, promissory: 5, openEnded: 5 },
  MT: { written: 5, oral: 5, promissory: 5, openEnded: 5 },
  NE: { written: 5, oral: 4, promissory: 5, openEnded: 5 },
  NV: { written: 6, oral: 4, promissory: 6, openEnded: 4 },
  NH: { written: 3, oral: 3, promissory: 3, openEnded: 3 },
  NJ: { written: 6, oral: 6, promissory: 6, openEnded: 6 },
  NM: { written: 6, oral: 4, promissory: 6, openEnded: 6 },
  NY: { written: 6, oral: 6, promissory: 6, openEnded: 6 },
  NC: { written: 3, oral: 3, promissory: 3, openEnded: 3 },
  ND: { written: 6, oral: 6, promissory: 6, openEnded: 6 },
  OH: { written: 6, oral: 6, promissory: 6, openEnded: 6 },
  OK: { written: 5, oral: 3, promissory: 5, openEnded: 5 },
  OR: { written: 6, oral: 6, promissory: 6, openEnded: 6 },
  PA: { written: 4, oral: 4, promissory: 4, openEnded: 4 },
  RI: { written: 10, oral: 10, promissory: 10, openEnded: 10 },
  SC: { written: 3, oral: 3, promissory: 3, openEnded: 3 },
  SD: { written: 6, oral: 6, promissory: 6, openEnded: 6 },
  TN: { written: 6, oral: 6, promissory: 6, openEnded: 6 },
  TX: { written: 4, oral: 4, promissory: 4, openEnded: 4 },
  UT: { written: 6, oral: 4, promissory: 6, openEnded: 6 },
  VT: { written: 6, oral: 6, promissory: 6, openEnded: 6 },
  VA: { written: 5, oral: 3, promissory: 5, openEnded: 5 },
  WA: { written: 6, oral: 3, promissory: 6, openEnded: 6 },
  WV: { written: 10, oral: 5, promissory: 10, openEnded: 10 },
  WI: { written: 6, oral: 6, promissory: 6, openEnded: 6 },
  WY: { written: 8, oral: 8, promissory: 8, openEnded: 8 },
};

export const STATE_NAMES: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", DC: "District of Columbia",
  FL: "Florida", GA: "Georgia", HI: "Hawaii", ID: "Idaho", IL: "Illinois",
  IN: "Indiana", IA: "Iowa", KS: "Kansas", KY: "Kentucky", LA: "Louisiana",
  ME: "Maine", MD: "Maryland", MA: "Massachusetts", MI: "Michigan", MN: "Minnesota",
  MS: "Mississippi", MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada",
  NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico", NY: "New York",
  NC: "North Carolina", ND: "North Dakota", OH: "Ohio", OK: "Oklahoma", OR: "Oregon",
  PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota",
  TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont", VA: "Virginia",
  WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
};

export type LetterType =
  | "debt_validation"
  | "pay_for_delete"
  | "goodwill"
  | "method_of_verification"
  | "cease_and_desist"
  | "debt_dispute"
  | "original_creditor_request";

export interface LetterParams {
  userName: string;
  userAddress?: string;
  creditorName: string;
  accountNumber: string;
  balance?: number;
  bureau?: string;
  reason?: string;
  offerAmount?: number;
  latePaymentDate?: string;
  circumstance?: string;
}

export function generateLetter(type: LetterType, params: LetterParams): string {
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  switch (type) {
    case "debt_validation":
      return generateDebtValidationLetter(params, today);
    case "pay_for_delete":
      return generatePayForDeleteLetter(params, today);
    case "goodwill":
      return generateGoodwillLetter(params, today);
    case "method_of_verification":
      return generateMethodOfVerificationLetter(params, today);
    case "cease_and_desist":
      return generateCeaseAndDesistLetter(params, today);
    case "original_creditor_request":
      return generateOriginalCreditorRequestLetter(params, today);
    default:
      return generateDebtDisputeLetter(params, today);
  }
}

function generateDebtValidationLetter(params: LetterParams, today: string): string {
  return `${today}

${params.creditorName}
[Collection Agency Address]

Re: Debt Validation Request
Account Number: ${params.accountNumber}
Alleged Balance: ${params.balance ? `$${params.balance.toLocaleString()}` : "[Amount]"}

To Whom It May Concern:

I am writing in response to your contact regarding the above-referenced account. This letter is being sent within 30 days of your initial communication, and I am exercising my rights under the Fair Debt Collection Practices Act (FDCPA), 15 U.S.C. § 1692g.

I DISPUTE THIS DEBT IN ITS ENTIRETY and request that you provide validation of this debt.

Please provide the following documentation:

1. Proof that you are licensed to collect debts in my state
2. Complete payment history from the original creditor
3. A copy of the original signed contract or agreement with my signature
4. Proof that you own this debt or are authorized to collect on it
5. The name and address of the original creditor
6. The amount of the debt when it was first incurred and itemization of all fees and interest
7. Documentation showing the debt is within the statute of limitations

IMPORTANT NOTICE: Until you provide proper validation, you must cease all collection activities. You may not:
- Contact me by phone or mail regarding this debt
- Report this debt to any credit reporting agency
- File or threaten to file a lawsuit

If you cannot provide this validation, you must remove any reference to this account from my credit reports and cease all collection efforts immediately.

Please respond within 30 days. If I do not receive proper validation, I will assume this debt is not valid and will file complaints with the FTC and my state Attorney General.

Sincerely,

${params.userName}

---
Sent via Certified Mail, Return Receipt Requested
This letter was generated using Credit 800.
`;
}

function generatePayForDeleteLetter(params: LetterParams, today: string): string {
  const offerAmount = params.offerAmount || (params.balance ? Math.round(params.balance * 0.4) : 0);

  return `${today}

${params.creditorName}
[Creditor/Collection Agency Address]

Re: Pay-for-Delete Settlement Offer
Account Number: ${params.accountNumber}
Current Balance: ${params.balance ? `$${params.balance.toLocaleString()}` : "[Amount]"}

To Whom It May Concern:

I am writing to propose a mutually beneficial resolution regarding the above-referenced account.

I am prepared to pay $${offerAmount.toLocaleString()} as PAYMENT IN FULL to settle this account, contingent upon your agreement to the following terms:

PROPOSED TERMS:
1. Upon receipt of payment, you will DELETE all references to this account from all three credit bureaus (Equifax, Experian, and TransUnion) within 30 days
2. You will not sell, transfer, or assign this account to any other party
3. You will provide written confirmation of this agreement before I submit payment
4. You will provide written confirmation that the account has been deleted after payment is received

This offer is made without any admission of liability. I am proposing this settlement solely to resolve this matter efficiently.

Please note:
- This is a limited-time offer valid for 30 days from the date of this letter
- Payment will be made via certified check or money order only
- Payment will not be made until I receive your written agreement to these terms

If you agree to these terms, please respond in writing. Upon receipt of your written agreement, I will submit payment within 10 business days.

If these terms are not acceptable, please contact me to discuss alternative arrangements.

Sincerely,

${params.userName}

---
This letter was generated using Credit 800.
`;
}

function generateGoodwillLetter(params: LetterParams, today: string): string {
  return `${today}

${params.creditorName}
Customer Service Department
[Creditor Address]

Re: Goodwill Adjustment Request
Account Number: ${params.accountNumber}

Dear Customer Service Manager,

I have been a loyal customer of ${params.creditorName} and am writing to request a goodwill adjustment to my account history.

${params.latePaymentDate ? `On or around ${params.latePaymentDate}, a late payment was reported on my account.` : "A late payment was reported on my account."} ${params.circumstance || "This was due to circumstances beyond my control, and I take full responsibility for the oversight."}

Since that time, I have maintained a perfect payment history with your company. I value our relationship and have been a responsible customer.

I am respectfully requesting that you consider removing this late payment notation from my credit report as a gesture of goodwill. This single mark is significantly impacting my credit score and my ability to [obtain a mortgage/refinance my home/qualify for better rates].

I understand that you are under no obligation to make this adjustment, but I am hopeful that given my otherwise positive account history, you will consider this request.

YOUR POSITIVE PAYMENT HISTORY AND LOYALTY MATTER:
- [Number] years as a customer
- Current account in good standing
- No other late payments

If approved, please update my account with Equifax, Experian, and TransUnion to remove the late payment notation.

Thank you for your time and consideration. I look forward to continuing our positive relationship.

Sincerely,

${params.userName}

---
This letter was generated using Credit 800.
`;
}

function generateMethodOfVerificationLetter(params: LetterParams, today: string): string {
  const bureauAddresses: Record<string, string> = {
    EQUIFAX: "Equifax Information Services LLC\nP.O. Box 740256\nAtlanta, GA 30374",
    EXPERIAN: "Experian\nP.O. Box 4500\nAllen, TX 75013",
    TRANSUNION: "TransUnion LLC\nConsumer Dispute Center\nP.O. Box 2000\nChester, PA 19016",
  };

  return `${today}

${bureauAddresses[params.bureau || "EQUIFAX"] || params.bureau}

Re: Request for Method of Verification
Account: ${params.creditorName} - ${params.accountNumber}

To Whom It May Concern:

I recently disputed the above-referenced account, and you responded that the information was "verified." Under the Fair Credit Reporting Act (FCRA) Section 611(a)(7), I am entitled to know the method of verification used.

I am formally requesting that you provide:

1. The METHOD used to verify this account
2. The NAME, ADDRESS, and TELEPHONE NUMBER of the person contacted at the furnisher
3. The DATE the verification was made
4. All documentation obtained during your investigation
5. A description of the procedures used to determine accuracy

According to FCRA Section 611(a)(6)(B)(iii), you must provide this information within 15 days of my request.

LEGAL BASIS:
The FCRA requires that disputed information be verified through a "reasonable investigation." Simply parroting back what the furnisher claims is not a reasonable investigation. If you cannot provide documentation of a genuine investigation, this item must be deleted.

If I do not receive a satisfactory response within 15 days, I will:
1. File a complaint with the Consumer Financial Protection Bureau (CFPB)
2. File a complaint with the Federal Trade Commission (FTC)
3. Consider legal action under FCRA Section 616 and 617

Please respond in writing to the address below.

Sincerely,

${params.userName}
${params.userAddress || "[Your Address]"}

---
Sent via Certified Mail, Return Receipt Requested
This letter was generated using Credit 800.
`;
}

function generateCeaseAndDesistLetter(params: LetterParams, today: string): string {
  return `${today}

${params.creditorName}
[Collection Agency Address]

Re: Cease and Desist Communication
Account Number: ${params.accountNumber}

To Whom It May Concern:

Pursuant to my rights under the Fair Debt Collection Practices Act (FDCPA), 15 U.S.C. § 1692c(c), I am formally requesting that you CEASE AND DESIST all communication with me regarding the above-referenced account.

Effective immediately, you must:

1. STOP all telephone calls to me, my family, and my workplace
2. STOP all written correspondence except as required by law
3. STOP all contact with third parties about this debt

The only communications permitted after receipt of this letter are:
- To notify me that collection efforts are being terminated
- To notify me of specific legal action being taken

Be advised that I am documenting all contacts. Any violation of this cease and desist request will result in:
- Complaints filed with the FTC and CFPB
- Complaints filed with my state Attorney General
- Legal action seeking statutory damages of $1,000 per violation plus actual damages and attorney fees

This letter does not constitute an acknowledgment of liability for any debt.

Sincerely,

${params.userName}

---
Sent via Certified Mail, Return Receipt Requested
This letter was generated using Credit 800.
`;
}

function generateOriginalCreditorRequestLetter(params: LetterParams, today: string): string {
  return `${today}

${params.creditorName}
[Collection Agency Address]

Re: Request for Original Creditor Documentation
Account Number: ${params.accountNumber}

To Whom It May Concern:

I am writing regarding the above-referenced account that you are attempting to collect. Before I can consider any payment, I require documentation proving the validity and ownership of this alleged debt.

Please provide the following:

1. COMPLETE CHAIN OF ASSIGNMENT
   - Documentation showing how this debt was transferred from the original creditor to your company
   - Bill of sale or assignment agreement with this specific account listed
   - All intermediate assignments if the debt was sold multiple times

2. ORIGINAL CREDITOR DOCUMENTATION
   - Original signed credit application or contract bearing my signature
   - Complete account statements from the original creditor
   - The original creditor's terms and conditions

3. ACCOUNT DOCUMENTATION
   - Complete payment history from account opening to charge-off
   - Itemization showing how the current balance was calculated
   - Documentation of all fees and interest applied

4. LICENSING DOCUMENTATION
   - Proof you are licensed to collect debts in my state

IMPORTANT: Many debt buyers purchase portfolios of debt without the original documentation. If you cannot provide the original signed contract, you may not have legal standing to collect this debt.

I am not refusing to pay a legitimate debt. However, I will not pay until you provide proof that:
1. This debt is actually mine
2. You have the legal right to collect it
3. The amount is accurate

Please respond within 30 days.

Sincerely,

${params.userName}

---
Sent via Certified Mail, Return Receipt Requested
This letter was generated using Credit 800.
`;
}

function generateDebtDisputeLetter(params: LetterParams, today: string): string {
  const bureauAddresses: Record<string, string> = {
    EQUIFAX: "Equifax Information Services LLC\nP.O. Box 740256\nAtlanta, GA 30374",
    EXPERIAN: "Experian\nP.O. Box 4500\nAllen, TX 75013",
    TRANSUNION: "TransUnion LLC\nConsumer Dispute Center\nP.O. Box 2000\nChester, PA 19016",
  };

  return `${today}

${bureauAddresses[params.bureau || "EQUIFAX"] || params.bureau}

Re: Dispute of Inaccurate Information
Account: ${params.creditorName} - ${params.accountNumber}

To Whom It May Concern:

I am writing to dispute inaccurate information appearing on my credit report.

ACCOUNT IN DISPUTE:
Creditor Name: ${params.creditorName}
Account Number: ${params.accountNumber}

REASON FOR DISPUTE:
${params.reason || "This information is inaccurate and unverifiable."}

Under the Fair Credit Reporting Act (FCRA), you are required to:
1. Conduct a reasonable investigation within 30 days
2. Forward all relevant information to the furnisher
3. Remove or correct any information that cannot be verified
4. Provide me with written results of your investigation

If this information cannot be verified with original documentation, it must be DELETED from my credit report.

Please investigate and remove this inaccurate information immediately.

Sincerely,

${params.userName}

---
This letter was generated using Credit 800.
`;
}

// Calculate if debt is past statute of limitations
export function isDebtExpired(
  state: string,
  debtType: "written" | "oral" | "promissory" | "openEnded",
  lastActivityDate: Date
): { expired: boolean; expirationDate: Date; daysRemaining: number } {
  const sol = STATUTE_OF_LIMITATIONS[state];
  if (!sol) {
    return { expired: false, expirationDate: new Date(), daysRemaining: -1 };
  }

  const years = sol[debtType];
  const expirationDate = new Date(lastActivityDate);
  expirationDate.setFullYear(expirationDate.getFullYear() + years);

  const now = new Date();
  const expired = now > expirationDate;
  const daysRemaining = expired ? 0 : Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return { expired, expirationDate, daysRemaining };
}

// Calculate credit report removal date (7 years from first delinquency)
export function getCreditReportRemovalDate(firstDelinquencyDate: Date): Date {
  const removalDate = new Date(firstDelinquencyDate);
  removalDate.setFullYear(removalDate.getFullYear() + 7);
  return removalDate;
}
