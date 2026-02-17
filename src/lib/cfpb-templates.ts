export interface CFPBComplaintType {
  id: string;
  title: string;
  category: string;
  description: string;
  generateComplaint: (params: {
    creditorName: string;
    bureau: string;
    accountNumber: string;
    reason: string;
    originalDisputeDate?: string;
    consumerName: string;
    additionalDetails?: string;
  }) => string;
}

export const cfpbComplaintTypes: CFPBComplaintType[] = [
  {
    id: "inaccurate-reporting",
    title: "Inaccurate Information on Credit Report",
    category: "Credit reporting",
    description: "The credit bureau is reporting information that is inaccurate, incomplete, or unverifiable.",
    generateComplaint: ({ creditorName, bureau, accountNumber, reason, originalDisputeDate, consumerName, additionalDetails }) =>
      `I am writing to file a formal complaint against ${bureau} regarding inaccurate information being reported on my credit file.

Account in Question: ${creditorName} — Account ending in ${accountNumber}

Issue: ${reason}

${originalDisputeDate ? `I first disputed this information directly with ${bureau} on ${originalDisputeDate}. Despite my dispute, the inaccurate information continues to appear on my credit report.` : "I have attempted to resolve this matter directly with the credit bureau but have been unsuccessful."}

Under the Fair Credit Reporting Act (FCRA), 15 U.S.C. § 1681e(b), consumer reporting agencies have a duty to follow reasonable procedures to assure maximum possible accuracy. ${bureau} has failed to meet this obligation regarding my account.

${additionalDetails ? `Additional Details: ${additionalDetails}` : ""}

I am requesting that the CFPB investigate this matter and ensure that ${bureau} corrects or removes this inaccurate information from my credit report.

Consumer: ${consumerName}`,
  },
  {
    id: "failure-to-investigate",
    title: "Failure to Properly Investigate Dispute",
    category: "Credit reporting",
    description: "The bureau failed to conduct a proper reinvestigation of your dispute or did not respond within 30 days.",
    generateComplaint: ({ creditorName, bureau, accountNumber, reason, originalDisputeDate, consumerName, additionalDetails }) =>
      `I am filing a complaint against ${bureau} for failing to properly investigate my dispute as required by the Fair Credit Reporting Act.

Account in Question: ${creditorName} — Account ending in ${accountNumber}
Original Dispute Date: ${originalDisputeDate || "See attached documentation"}
Dispute Reason: ${reason}

${bureau} has failed to:
- Conduct a reasonable reinvestigation of the disputed information (15 U.S.C. § 1681i(a)(1))
- Provide me with the results of their reinvestigation within 30 days (15 U.S.C. § 1681i(a)(1))
- Provide the method of verification when requested (15 U.S.C. § 1681i(a)(6)(B)(iii))

It appears that the bureau merely forwarded my dispute to the furnisher and reported back their response without conducting an independent investigation, which does not meet the legal standard of a "reasonable reinvestigation."

${additionalDetails ? `Additional Details: ${additionalDetails}` : ""}

I request that the CFPB investigate ${bureau}'s dispute handling procedures and ensure compliance with the FCRA.

Consumer: ${consumerName}`,
  },
  {
    id: "failure-to-remove",
    title: "Failure to Remove Unverifiable Information",
    category: "Credit reporting",
    description: "The bureau failed to remove information that could not be verified during their investigation.",
    generateComplaint: ({ creditorName, bureau, accountNumber, reason, originalDisputeDate, consumerName, additionalDetails }) =>
      `I am filing a complaint against ${bureau} for failing to remove unverifiable information from my credit report.

Account in Question: ${creditorName} — Account ending in ${accountNumber}
Original Dispute Date: ${originalDisputeDate || "See attached documentation"}
Dispute Reason: ${reason}

Under 15 U.S.C. § 1681i(a)(5)(A), if the completeness or accuracy of any item of information is disputed and the information cannot be verified, the consumer reporting agency shall promptly delete that item of information.

I have disputed this account and requested method of verification. The bureau has either:
- Failed to verify the information within the required timeframe, OR
- Failed to provide adequate method of verification upon request

Despite this, the disputed information remains on my credit file in violation of the FCRA.

${additionalDetails ? `Additional Details: ${additionalDetails}` : ""}

I request that the CFPB compel ${bureau} to remove this unverifiable information from my credit report immediately.

Consumer: ${consumerName}`,
  },
  {
    id: "mixed-file",
    title: "Mixed Credit File / Wrong Person's Information",
    category: "Credit reporting",
    description: "Your credit report contains accounts or information belonging to another person.",
    generateComplaint: ({ creditorName, bureau, accountNumber, reason, consumerName, additionalDetails }) =>
      `I am filing a complaint against ${bureau} regarding a mixed credit file issue. My credit report contains information that does not belong to me.

Account in Question: ${creditorName} — Account ending in ${accountNumber}
Issue: ${reason}

My credit report contains account information that belongs to another individual. This is commonly known as a "mixed file" issue and represents a serious failure of ${bureau}'s matching procedures.

Under the FCRA, consumer reporting agencies must follow reasonable procedures to assure maximum possible accuracy of consumer reports (15 U.S.C. § 1681e(b)). The inclusion of another person's information on my credit file demonstrates a clear failure of these procedures.

${additionalDetails ? `Additional Details: ${additionalDetails}` : ""}

I request that the CFPB investigate ${bureau}'s file matching procedures and ensure that all information not belonging to me is immediately removed from my credit report.

Consumer: ${consumerName}`,
  },
  {
    id: "furnisher-violation",
    title: "Furnisher Reporting Inaccurate Information",
    category: "Credit reporting",
    description: "A creditor or debt collector continues to report inaccurate information to the bureaus after being notified.",
    generateComplaint: ({ creditorName, bureau, accountNumber, reason, originalDisputeDate, consumerName, additionalDetails }) =>
      `I am filing a complaint against ${creditorName} for furnishing inaccurate information to ${bureau} in violation of the Fair Credit Reporting Act.

Account in Question: ${creditorName} — Account ending in ${accountNumber}
Original Dispute Date: ${originalDisputeDate || "See attached documentation"}
Issue: ${reason}

Under 15 U.S.C. § 1681s-2(a), furnishers of information have a duty not to report information they know or have reasonable cause to believe is inaccurate. Additionally, under 15 U.S.C. § 1681s-2(b), upon receiving notice of a dispute from a consumer reporting agency, the furnisher must:

1. Conduct an investigation with respect to the disputed information
2. Review all relevant information provided by the consumer reporting agency
3. Report the results of the investigation to the consumer reporting agency
4. If the information is found to be inaccurate, report that to all consumer reporting agencies

${creditorName} has failed to meet these obligations by continuing to furnish inaccurate information despite being notified of the dispute.

${additionalDetails ? `Additional Details: ${additionalDetails}` : ""}

I request that the CFPB investigate ${creditorName}'s reporting practices and ensure compliance with the FCRA.

Consumer: ${consumerName}`,
  },
];

export function getCFPBComplaintType(id: string): CFPBComplaintType | undefined {
  return cfpbComplaintTypes.find((t) => t.id === id);
}
