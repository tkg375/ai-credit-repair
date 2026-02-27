export interface LetterTemplate {
  id: string;
  title: string;
  category:
    | "bureau_dispute"
    | "goodwill"
    | "pay_for_delete"
    | "debt_validation"
    | "cease_desist"
    | "method_of_verification"
    | "inquiry_removal";
  categoryLabel: string;
  description: string;
  useCase: string;
  legalBasis: string;
  generate: (params: {
    consumerName: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    creditorName: string;
    accountNumber: string;
    bureau?: string;
    reason?: string;
    date?: string;
  }) => string;
}

export const TEMPLATE_CATEGORIES = [
  { id: "all", label: "All Templates" },
  { id: "bureau_dispute", label: "Bureau Disputes" },
  { id: "goodwill", label: "Goodwill Letters" },
  { id: "pay_for_delete", label: "Pay for Delete" },
  { id: "debt_validation", label: "Debt Validation" },
  { id: "cease_desist", label: "Cease & Desist" },
  { id: "method_of_verification", label: "Method of Verification" },
  { id: "inquiry_removal", label: "Inquiry Removal" },
];

export const letterTemplates: LetterTemplate[] = [
  {
    id: "bureau-dispute-inaccurate",
    title: "Bureau Dispute — Inaccurate Information",
    category: "bureau_dispute",
    categoryLabel: "Bureau Dispute",
    description:
      "Formally dispute an account that contains inaccurate information on your credit report with the reporting bureau.",
    useCase: "Use when a bureau is reporting incorrect balance, status, or account details.",
    legalBasis: "FCRA §611 (15 U.S.C. § 1681i)",
    generate: ({ consumerName, address, city, state, zip, creditorName, accountNumber, bureau, reason, date }) =>
      `${consumerName}
${address}
${city}, ${state} ${zip}

${date || new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}

${bureau || "[Bureau Name]"}
[Bureau Address]

Re: Dispute of Inaccurate Information — ${creditorName}, Account #${accountNumber}

To Whom It May Concern:

I am writing to formally dispute inaccurate information appearing on my credit report. Under the Fair Credit Reporting Act, 15 U.S.C. § 1681i, you are required to investigate disputed information and correct or delete inaccurate, incomplete, or unverifiable information.

The following account is being reported inaccurately:

  Creditor: ${creditorName}
  Account Number: ${accountNumber}
  Reason for Dispute: ${reason || "[Describe the inaccuracy]"}

I am requesting that you conduct a thorough investigation of this account. If the information cannot be verified as accurate within the required 30-day period, it must be deleted from my credit report.

Please send me the results of your investigation and an updated copy of my credit report.

Sincerely,
${consumerName}`,
  },
  {
    id: "goodwill-late-payment",
    title: "Goodwill Letter — Late Payment Removal",
    category: "goodwill",
    categoryLabel: "Goodwill",
    description:
      "Request that a creditor remove a late payment from your credit report as a goodwill gesture, citing your otherwise positive history.",
    useCase: "Use when you have an isolated late payment on an otherwise good account.",
    legalBasis: "Voluntary creditor discretion (no statutory requirement)",
    generate: ({ consumerName, address, city, state, zip, creditorName, accountNumber, reason, date }) =>
      `${consumerName}
${address}
${city}, ${state} ${zip}

${date || new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}

${creditorName}
[Creditor Address]

Re: Goodwill Request — Account #${accountNumber}

To Whom It May Concern:

I am writing to respectfully request a goodwill adjustment to my credit file. I have been a loyal customer and have maintained a generally positive payment history with ${creditorName}.

Account Number: ${accountNumber}
Reason: ${reason || "I experienced a temporary financial hardship that caused a late payment."}

I take full responsibility for the late payment and have since ensured all payments are made on time. This isolated incident does not reflect my dedication to meeting my financial obligations.

I kindly ask that you consider removing this late payment notation as a goodwill gesture. This would have a meaningful positive impact on my credit profile and my ability to achieve important financial goals.

Thank you for your consideration. I greatly value my relationship with ${creditorName}.

Sincerely,
${consumerName}`,
  },
  {
    id: "pay-for-delete",
    title: "Pay for Delete Agreement Request",
    category: "pay_for_delete",
    categoryLabel: "Pay for Delete",
    description:
      "Offer to pay an outstanding balance in exchange for deletion of the negative entry from your credit report.",
    useCase: "Use when negotiating with a collector on an unpaid collection account.",
    legalBasis: "Creditor/collector discretion; FDCPA compliance required",
    generate: ({ consumerName, address, city, state, zip, creditorName, accountNumber, reason, date }) =>
      `${consumerName}
${address}
${city}, ${state} ${zip}

${date || new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}

${creditorName}
[Creditor Address]

Re: Pay for Delete Proposal — Account #${accountNumber}

To Whom It May Concern:

I am writing regarding the above-referenced account currently appearing on my credit report. I am interested in resolving this matter and am prepared to offer a payment in exchange for deletion of this account from my credit file.

Account Number: ${accountNumber}
${reason ? `Notes: ${reason}` : ""}

I propose the following arrangement:
  - I will pay ${reason || "[agreed-upon amount]"} as full and final settlement
  - In exchange, ${creditorName} will delete all references to this account from all three credit bureaus within 30 days of payment receipt

Please confirm your agreement to these terms in writing before I submit payment. This letter is not an acknowledgment of the debt but an offer to resolve it under the above conditions.

Sincerely,
${consumerName}`,
  },
  {
    id: "debt-validation",
    title: "Debt Validation Request",
    category: "debt_validation",
    categoryLabel: "Debt Validation",
    description:
      "Request that a debt collector provide complete documentation validating the debt before you acknowledge or pay it.",
    useCase: "Use within 30 days of receiving initial collection contact.",
    legalBasis: "FDCPA §809 (15 U.S.C. § 1692g)",
    generate: ({ consumerName, address, city, state, zip, creditorName, accountNumber, date }) =>
      `${consumerName}
${address}
${city}, ${state} ${zip}

${date || new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}

${creditorName}
[Collector Address]

Re: Debt Validation Request — Account #${accountNumber}

To Whom It May Concern:

Pursuant to my rights under the Fair Debt Collection Practices Act, 15 U.S.C. § 1692g, I am formally requesting validation of the above-referenced debt within 30 days of receiving this letter.

Please provide the following:
  1. The name and address of the original creditor
  2. The amount of the original debt and a complete payment history
  3. Proof that your company is licensed to collect debts in my state
  4. A copy of any signed agreement or contract creating this obligation
  5. Proof that the statute of limitations has not expired

Until you provide this verification, please cease all collection activity including reporting to credit bureaus. Any continued collection activity without validation may constitute a violation of the FDCPA.

This letter is not a refusal to pay, but a request for verification as is my legal right.

Sincerely,
${consumerName}`,
  },
  {
    id: "cease-desist",
    title: "Cease and Desist Letter",
    category: "cease_desist",
    categoryLabel: "Cease & Desist",
    description:
      "Demand that a debt collector stop all communication with you regarding a particular debt.",
    useCase: "Use when harassed by a collector you want to stop contacting you.",
    legalBasis: "FDCPA §805(c) (15 U.S.C. § 1692c(c))",
    generate: ({ consumerName, address, city, state, zip, creditorName, accountNumber, date }) =>
      `${consumerName}
${address}
${city}, ${state} ${zip}

${date || new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}

${creditorName}
[Collector Address]

Re: Cease and Desist — Account #${accountNumber}

To Whom It May Concern:

Pursuant to my rights under the Fair Debt Collection Practices Act, 15 U.S.C. § 1692c(c), I hereby demand that you immediately cease all further communication with me regarding the above-referenced account.

This includes all contact via:
  - Telephone (home, work, or cell)
  - Mail or email
  - Text messages or automated calls
  - Any third-party communication

You may only contact me to confirm that no further contact will be made, or to advise that you or the creditor intend to take a specific action as permitted by law.

Be advised that any further contact in violation of this notice may subject your company to civil liability under the FDCPA.

Sincerely,
${consumerName}`,
  },
  {
    id: "method-of-verification",
    title: "Method of Verification Request",
    category: "method_of_verification",
    categoryLabel: "Method of Verification",
    description:
      "After a bureau claims it verified a disputed item, request the exact method and evidence used to verify the information.",
    useCase: "Use after a bureau returns a 'verified' result on your dispute without explanation.",
    legalBasis: "FCRA §611(a)(6)(B)(iii) (15 U.S.C. § 1681i)",
    generate: ({ consumerName, address, city, state, zip, creditorName, accountNumber, bureau, date }) =>
      `${consumerName}
${address}
${city}, ${state} ${zip}

${date || new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}

${bureau || "[Bureau Name]"}
[Bureau Address]

Re: Method of Verification Request — ${creditorName}, Account #${accountNumber}

To Whom It May Concern:

I previously disputed the above-referenced account and received notice that it was "verified." Pursuant to my rights under 15 U.S.C. § 1681i(a)(6)(B)(iii), I am now requesting the specific method of verification used to confirm the accuracy of this information.

Please provide:
  1. The name and address of the person or entity that verified the information
  2. The business records, documents, or data used to verify the dispute
  3. The date on which verification was completed
  4. A description of the reinvestigation procedure used

If this information cannot be provided, the account must be deleted from my credit report immediately as it cannot be verified.

Sincerely,
${consumerName}`,
  },
  {
    id: "inquiry-removal",
    title: "Unauthorized Inquiry Removal Request",
    category: "inquiry_removal",
    categoryLabel: "Inquiry Removal",
    description:
      "Request removal of a hard inquiry you did not authorize from your credit report.",
    useCase: "Use when you see a hard inquiry you do not recognize or did not consent to.",
    legalBasis: "FCRA §604 (15 U.S.C. § 1681b) — permissible purpose requirement",
    generate: ({ consumerName, address, city, state, zip, creditorName, accountNumber, bureau, date }) =>
      `${consumerName}
${address}
${city}, ${state} ${zip}

${date || new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}

${bureau || "[Bureau Name]"}
[Bureau Address]

Re: Unauthorized Hard Inquiry Removal — ${creditorName}${accountNumber ? `, Ref #${accountNumber}` : ""}

To Whom It May Concern:

I am writing to request the removal of an unauthorized hard inquiry from my credit report. Under the Fair Credit Reporting Act, 15 U.S.C. § 1681b, a consumer reporting agency may only furnish a consumer report when there is a permissible purpose. I did not authorize ${creditorName} to access my credit file.

Inquiry Details:
  Creditor/Company: ${creditorName}
  ${accountNumber ? `Reference: ${accountNumber}` : ""}

I request that this unauthorized inquiry be immediately removed from my credit report. If ${creditorName} claims to have authorization, please provide documentation of my alleged consent.

Sincerely,
${consumerName}`,
  },
];

export function getTemplateById(id: string): LetterTemplate | undefined {
  return letterTemplates.find((t) => t.id === id);
}
