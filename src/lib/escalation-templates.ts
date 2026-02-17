export interface EscalationTemplate {
  round: number;
  title: string;
  description: string;
  generateLetter: (params: {
    creditorName: string;
    bureau: string;
    accountNumber: string;
    originalDisputeDate: string;
    reason: string;
    consumerName: string;
    consumerAddress: string;
  }) => string;
}

export const escalationTemplates: EscalationTemplate[] = [
  {
    round: 2,
    title: "Method of Verification Demand",
    description: "Demand the bureau provide the method used to verify the disputed information, as required under FCRA Section 611(a)(6)(B)(iii).",
    generateLetter: ({ creditorName, bureau, accountNumber, originalDisputeDate, reason, consumerName, consumerAddress }) => `${consumerName}
${consumerAddress}

Date: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}

${bureau}
Consumer Disputes Department

Re: SECOND NOTICE — Demand for Method of Verification
Account: ${creditorName} — ${accountNumber}

To Whom It May Concern:

On ${originalDisputeDate}, I submitted a dispute regarding the above-referenced account on the basis that: ${reason}.

As of the date of this letter, I have not received a satisfactory response or the account continues to report inaccurately on my credit file.

Pursuant to the Fair Credit Reporting Act, 15 U.S.C. § 1681i(a)(6)(B)(iii), I am formally requesting that you provide me with:

1. The method of verification used to confirm the accuracy of this account
2. The name, address, and telephone number of the person contacted at the furnisher
3. A copy of any documents provided by the furnisher to verify this account

Under FCRA Section 611(a)(7), you are required to provide this information within 15 days of receiving this request. Failure to do so requires deletion of the disputed item.

Additionally, if your investigation consisted solely of reviewing the information provided by the furnisher without conducting a meaningful reinvestigation, this would constitute a violation of your obligations under the FCRA.

I expect your prompt attention to this matter. If the information cannot be properly verified, I demand its immediate deletion from my credit file.

Sincerely,
${consumerName}`,
  },
  {
    round: 3,
    title: "Intent to File Regulatory Complaints",
    description: "Final demand letter warning of CFPB complaint and potential legal action if the item is not resolved.",
    generateLetter: ({ creditorName, bureau, accountNumber, originalDisputeDate, reason, consumerName, consumerAddress }) => `${consumerName}
${consumerAddress}

Date: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}

${bureau}
Consumer Disputes Department

Re: FINAL NOTICE — Intent to File Regulatory Complaints
Account: ${creditorName} — ${accountNumber}

To Whom It May Concern:

This letter serves as my FINAL NOTICE regarding the above-referenced account, which I first disputed on ${originalDisputeDate} on the basis that: ${reason}.

Despite my previous disputes and requests for method of verification, this account continues to report inaccurately on my credit file. Your failure to conduct a proper reinvestigation and provide the method of verification as required by law is unacceptable.

Please be advised that if this matter is not resolved within 15 days of your receipt of this letter, I intend to:

1. FILE A FORMAL COMPLAINT with the Consumer Financial Protection Bureau (CFPB) detailing your repeated failure to properly investigate my dispute and provide method of verification as required under 15 U.S.C. § 1681i

2. FILE A COMPLAINT with the Federal Trade Commission (FTC) regarding your violations of the Fair Credit Reporting Act

3. FILE A COMPLAINT with my State Attorney General's office regarding violations of state consumer protection laws

4. CONSULT WITH A CONSUMER RIGHTS ATTORNEY regarding potential claims under 15 U.S.C. § 1681n (willful noncompliance) and 15 U.S.C. § 1681o (negligent noncompliance), which provide for statutory damages, punitive damages, and attorney's fees

Under the FCRA, you have a legal obligation to ensure maximum possible accuracy of the information you report. Your continued reporting of disputed information without proper verification demonstrates a willful disregard for your legal obligations.

I strongly urge you to delete this inaccurate account from my credit file immediately to avoid further action.

Sincerely,
${consumerName}`,
  },
];

export function getEscalationTemplate(round: number): EscalationTemplate | undefined {
  return escalationTemplates.find((t) => t.round === round);
}
