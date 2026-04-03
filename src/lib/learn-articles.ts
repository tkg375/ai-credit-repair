export type SectionType =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "callout"; text: string; variant: "info" | "warning" | "tip" }
  | { type: "table"; headers: string[]; rows: string[][] };

export interface LearnArticle {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  publishDate: string;
  sections: SectionType[];
  relatedSlugs: string[];
}

export const learnCategories = [
  "Understanding Credit",
  "Dispute Rights",
  "Building Credit",
  "Debt Management",
  "Identity Protection",
];

export const learnArticles: LearnArticle[] = [
  {
    slug: "how-credit-scores-work",
    title: "How Credit Scores Are Calculated: A Complete Breakdown",
    excerpt:
      "Learn exactly how FICO and VantageScore calculate your credit score — including which factors matter most and how to improve each one.",
    category: "Understanding Credit",
    readTime: "7 min",
    publishDate: "2026-01-15",
    relatedSlugs: ["credit-utilization-explained", "how-to-read-your-credit-report", "building-credit-from-scratch"],
    sections: [
      {
        type: "p",
        text: "Your credit score is a three-digit number — typically between 300 and 850 — that lenders use to decide whether to extend credit and at what interest rate. Understanding exactly how it's calculated gives you the power to move it deliberately rather than hope it improves on its own.",
      },
      {
        type: "h2",
        text: "The Two Major Scoring Models",
      },
      {
        type: "p",
        text: "The two dominant credit scoring models are FICO and VantageScore. FICO is used in over 90% of lending decisions. VantageScore is used by many free credit monitoring services. Both use the same 300–850 range and consider similar factors, but weigh them differently.",
      },
      {
        type: "callout",
        variant: "info",
        text: "Most mortgage lenders use older FICO models (FICO 8 or FICO 2/4/5), not newer ones. If you're preparing for a home purchase, ask your lender which model they use — the strategies that move FICO 8 also move older models.",
      },
      {
        type: "h2",
        text: "The 5 FICO Score Factors",
      },
      {
        type: "h3",
        text: "1. Payment History (35%)",
      },
      {
        type: "p",
        text: "Payment history is the single most important factor. It tracks whether you've paid your bills on time across all credit accounts — credit cards, loans, mortgages, and lines of credit.",
      },
      {
        type: "ul",
        items: [
          "A single 30-day late payment can drop your score 60–100 points, depending on your starting score",
          "The more recent the late payment, the more damage it causes",
          "Late payments stay on your report for 7 years, but their impact fades after 2 years",
          "One late payment on an otherwise spotless record is easier to recover from than a pattern",
        ],
      },
      {
        type: "callout",
        variant: "tip",
        text: "Set up autopay for at least the minimum payment on every account. You can always pay more manually — but autopay prevents the catastrophic score damage of a missed payment.",
      },
      {
        type: "h3",
        text: "2. Credit Utilization (30%)",
      },
      {
        type: "p",
        text: "Credit utilization measures how much of your available revolving credit you're currently using. If your credit card limit is $10,000 and your balance is $3,000, your utilization is 30%. This factor is calculated both per-card and across all cards combined.",
      },
      {
        type: "table",
        headers: ["Utilization Range", "Score Impact"],
        rows: [
          ["0–1%", "Maximum benefit"],
          ["1–10%", "Excellent"],
          ["10–30%", "Good"],
          ["30–50%", "Negative impact starting"],
          ["50%+", "Significant damage"],
          ["75%+", "Severe damage"],
        ],
      },
      {
        type: "p",
        text: "Unlike late payments, utilization has no memory. Paying down your balances can raise your score in as little as one billing cycle — making it the fastest lever you have.",
      },
      {
        type: "h3",
        text: "3. Length of Credit History (15%)",
      },
      {
        type: "p",
        text: "This factor considers the age of your oldest account, your newest account, and the average age of all accounts. A 10-year-old credit card is a significant asset to your score — even if you rarely use it.",
      },
      {
        type: "callout",
        variant: "warning",
        text: "Think twice before closing old credit cards. Closing a card doesn't immediately remove its history (it stays for up to 10 years), but it reduces your available credit, raising your utilization — and eventually the account will disappear entirely, lowering your average account age.",
      },
      {
        type: "h3",
        text: "4. Credit Mix (10%)",
      },
      {
        type: "p",
        text: "Having different types of credit — revolving (credit cards, HELOCs) and installment (auto loans, mortgages, student loans, personal loans) — demonstrates to lenders that you can handle varied debt obligations responsibly. You don't need every type, but a healthy mix helps.",
      },
      {
        type: "h3",
        text: "5. New Credit Inquiries (10%)",
      },
      {
        type: "p",
        text: "When you apply for credit, the lender performs a hard inquiry on your report. Each hard inquiry can lower your score by 5–10 points. Multiple inquiries in a short window look risky to lenders — with one exception: rate shopping for a mortgage, auto loan, or student loan within a 14–45 day window counts as a single inquiry under newer FICO models.",
      },
      {
        type: "h2",
        text: "Score Ranges and What They Mean",
      },
      {
        type: "table",
        headers: ["Score Range", "Classification", "Typical Impact"],
        rows: [
          ["800–850", "Exceptional", "Best rates on all products"],
          ["740–799", "Very Good", "Better than average rates"],
          ["670–739", "Good", "Near or above average rates"],
          ["580–669", "Fair", "Higher rates, some approvals"],
          ["300–579", "Poor", "Denials or secured products only"],
        ],
      },
      {
        type: "h2",
        text: "How Long Does It Take to Improve?",
      },
      {
        type: "p",
        text: "Improvement speed depends on what's holding your score down. Reducing utilization is the fastest — results visible in 30–60 days. Removing a collection or resolving a late payment dispute takes 30–90 days after the bureau updates. Recovering from a bankruptcy or foreclosure takes 2–7 years, though scores often start recovering 1–2 years after discharge.",
      },
      {
        type: "callout",
        variant: "tip",
        text: "Focus on payment history and utilization first — they account for 65% of your score. Getting these two right will produce the fastest, largest improvements.",
      },
    ],
  },
  {
    slug: "how-to-read-your-credit-report",
    title: "How to Read Your Credit Report: A Section-by-Section Guide",
    excerpt:
      "Your credit report contains four major sections. Learn what each one means, what to look for, and how errors in each section affect your credit score.",
    category: "Understanding Credit",
    readTime: "8 min",
    publishDate: "2026-01-22",
    relatedSlugs: ["how-credit-scores-work", "how-to-dispute-credit-report-errors", "fcra-rights"],
    sections: [
      {
        type: "p",
        text: "You're entitled to a free credit report from each of the three major bureaus — Equifax, Experian, and TransUnion — every 12 months at AnnualCreditReport.com. Most people never look at theirs. That's a mistake: studies show roughly 1 in 5 Americans has a material error on at least one report, and those errors can cost hundreds of dollars a year in higher interest rates.",
      },
      {
        type: "h2",
        text: "The Three Bureaus Are Independent",
      },
      {
        type: "p",
        text: "Equifax, Experian, and TransUnion operate as independent companies. They don't automatically share data with each other. A creditor may report to all three, two, or just one — which is why your score can differ significantly across bureaus. Always pull and review all three reports.",
      },
      {
        type: "h2",
        text: "Section 1: Personal Information",
      },
      {
        type: "p",
        text: "This section contains identifying information: your full name (including variations), current and previous addresses, date of birth, Social Security number (partially masked), phone numbers, and employment history.",
      },
      {
        type: "callout",
        variant: "warning",
        text: "Personal information errors are often the first sign of a mixed file (your data mixed with someone else's) or identity theft. If you see addresses you've never lived at, names that aren't yours, or employers you've never worked for — investigate immediately.",
      },
      {
        type: "p",
        text: "Personal information doesn't directly affect your score, but inaccuracies here can indicate serious problems and make it harder for disputes to be properly matched to your accounts.",
      },
      {
        type: "h2",
        text: "Section 2: Account Information (Trade Lines)",
      },
      {
        type: "p",
        text: "This is the most important section. Every credit account you've ever had is listed here — open, closed, positive, and negative. Each trade line shows:",
      },
      {
        type: "ul",
        items: [
          "Creditor name and account number (partially masked)",
          "Account type (credit card, auto loan, mortgage, etc.)",
          "Date opened and date of last activity",
          "Credit limit or original loan amount",
          "Current balance and monthly payment",
          "Account status: open, closed, paid, charged off, in collections",
          "Payment history: a month-by-month record often shown as a grid",
          "Who is responsible: individual, joint, or authorized user",
        ],
      },
      {
        type: "h3",
        text: "Common Trade Line Errors to Look For",
      },
      {
        type: "ul",
        items: [
          "Accounts you don't recognize (could be identity theft or mixed file)",
          "Late payments that were actually paid on time",
          "Incorrect balances that are higher than your actual balance",
          "Accounts showing as open that you closed",
          "Duplicate entries for the same account",
          "Wrong dates opened or first delinquency dates",
          "Collection accounts that exceed their 7-year reporting window",
        ],
      },
      {
        type: "h3",
        text: "Understanding the Date of First Delinquency",
      },
      {
        type: "p",
        text: "The date of first delinquency (DOFD) is critical — it's what determines when a negative item must be removed from your report. Under the FCRA, most negative items must be deleted 7 years from the DOFD, not from when they were sent to collections or when you last made a payment. If a collector reports a more recent DOFD to keep a debt on your report longer, that's a violation.",
      },
      {
        type: "h2",
        text: "Section 3: Public Records",
      },
      {
        type: "p",
        text: "Public records include bankruptcies. (As of 2017, tax liens and civil judgments were removed from credit reports by all three bureaus.) These are among the most damaging items and have specific reporting timelines:",
      },
      {
        type: "table",
        headers: ["Public Record Type", "Reporting Period"],
        rows: [
          ["Chapter 7 Bankruptcy", "10 years from filing date"],
          ["Chapter 13 Bankruptcy", "7 years from filing date"],
          ["Tax Liens", "No longer reported (removed 2017)"],
          ["Civil Judgments", "No longer reported (removed 2017)"],
        ],
      },
      {
        type: "h2",
        text: "Section 4: Inquiries",
      },
      {
        type: "p",
        text: "Inquiries are divided into two types: hard inquiries and soft inquiries.",
      },
      {
        type: "h3",
        text: "Hard Inquiries",
      },
      {
        type: "p",
        text: "Hard inquiries occur when you apply for credit — a credit card, auto loan, mortgage, or personal loan. They appear on your report and can lower your score by 5–10 points. Hard inquiries remain on your report for 2 years but only impact your score for the first 12 months.",
      },
      {
        type: "h3",
        text: "Soft Inquiries",
      },
      {
        type: "p",
        text: "Soft inquiries do not affect your score. They appear only on your own copy of your report. Soft inquiries include: checking your own credit, pre-approval offers, employer background checks, and account reviews by existing creditors.",
      },
      {
        type: "h2",
        text: "How to Get Your Free Reports",
      },
      {
        type: "ol",
        items: [
          "Visit AnnualCreditReport.com — the only officially authorized free source",
          "Select all three bureaus or pull one at a time",
          "Download and save each report as a PDF",
          "Review every section carefully for errors",
          "Dispute any inaccuracies within 30 days of finding them",
        ],
      },
      {
        type: "callout",
        variant: "tip",
        text: "Instead of pulling all three at once, consider spacing them out — one bureau every 4 months. This gives you ongoing free monitoring throughout the year.",
      },
    ],
  },
  {
    slug: "fcra-rights",
    title: "Your Rights Under the Fair Credit Reporting Act (FCRA)",
    excerpt:
      "The FCRA gives you powerful legal rights to dispute inaccurate information, sue for damages, and force bureaus to delete unverifiable items. Here's what you're entitled to.",
    category: "Dispute Rights",
    readTime: "6 min",
    publishDate: "2026-02-01",
    relatedSlugs: ["how-to-dispute-credit-report-errors", "how-to-read-your-credit-report", "handling-collection-accounts"],
    sections: [
      {
        type: "p",
        text: "The Fair Credit Reporting Act (FCRA) is a federal law enacted in 1970 that governs how consumer credit information is collected, shared, and used. It gives consumers significant rights — rights that most people never exercise because they don't know they exist.",
      },
      {
        type: "h2",
        text: "The Right to Dispute (FCRA § 611)",
      },
      {
        type: "p",
        text: "This is the cornerstone right. You can dispute any information on your credit report that you believe is inaccurate, incomplete, or unverifiable. The bureau must:",
      },
      {
        type: "ul",
        items: [
          "Acknowledge your dispute within 5 business days",
          "Investigate the disputed information within 30 days (45 days if you provide additional evidence)",
          "Forward your dispute to the information furnisher (the creditor or collector)",
          "Delete or correct any information that cannot be verified or is found to be inaccurate",
          "Notify you of the investigation results within 5 business days of completion",
          "Provide you with a free copy of your updated credit report if the dispute results in a change",
        ],
      },
      {
        type: "callout",
        variant: "warning",
        text: "If the bureau fails to complete the investigation within 30 days, they must delete the disputed item — regardless of whether it's accurate. Keep records of when you submitted your dispute (certified mail return receipts are best).",
      },
      {
        type: "h2",
        text: "The Right to Method of Verification (§ 611(a)(6)(B)(iii))",
      },
      {
        type: "p",
        text: "After a bureau claims to have verified a disputed item, you can demand to know exactly how they verified it. This is called a Method of Verification (MOV) request. The bureau must provide:",
      },
      {
        type: "ul",
        items: [
          "The name, business address, and telephone number of the furnisher they contacted",
          "A description of the procedure used to verify the information",
          "This information must be provided within 15 days of your request",
        ],
      },
      {
        type: "p",
        text: "Many disputes are resolved at this stage because bureaus often can't produce genuine verification — they simply re-affirm the information with the furnisher electronically without reviewing any documentation.",
      },
      {
        type: "h2",
        text: "The Right to Accurate Reporting (§ 623)",
      },
      {
        type: "p",
        text: "Furnishers — the creditors, lenders, and collectors who report your information — have their own obligations under the FCRA. They must:",
      },
      {
        type: "ul",
        items: [
          "Report only accurate, complete, and current information",
          "Investigate disputes forwarded by the bureaus",
          "Correct or delete information they know to be inaccurate",
          "Report accurate dates, especially the date of first delinquency",
          "Not report information that was previously deleted due to a dispute",
        ],
      },
      {
        type: "h2",
        text: "The Right to Sue for Damages (§ 616 & § 617)",
      },
      {
        type: "p",
        text: "If a bureau or furnisher violates the FCRA — willfully or negligently — you have the right to sue in federal or state court. This is a powerful right that many don't know about.",
      },
      {
        type: "table",
        headers: ["Violation Type", "Available Damages"],
        rows: [
          ["Negligent violation", "Actual damages + attorney fees + court costs"],
          ["Willful violation", "$100–$1,000 statutory damages OR actual damages (whichever is greater) + punitive damages + attorney fees"],
          ["Class action (willful)", "Up to $500,000 or 1% of net worth"],
        ],
      },
      {
        type: "callout",
        variant: "tip",
        text: "The attorney fees provision is critical — it means consumer protection attorneys often take FCRA cases on contingency. If a bureau violates your rights, you may be able to hire an attorney at no cost to you.",
      },
      {
        type: "h2",
        text: "The Right to Free Annual Credit Reports",
      },
      {
        type: "p",
        text: "You're entitled to one free credit report from each of the three major bureaus every 12 months. Access them at AnnualCreditReport.com — the only federally authorized source. The FCRA also entitles you to a free report if you're denied credit, employment, housing, or insurance based on your credit report (you must request it within 60 days of the denial).",
      },
      {
        type: "h2",
        text: "The Right to Block Fraudulent Information",
      },
      {
        type: "p",
        text: "If you're a victim of identity theft, the FCRA gives you the right to permanently block fraudulent information from appearing on your credit report. You must provide a copy of an identity theft report (filed at IdentityTheft.gov) and a statement identifying the fraudulent information. The block must take effect within 4 business days.",
      },
      {
        type: "h2",
        text: "Key FCRA Timelines at a Glance",
      },
      {
        type: "table",
        headers: ["Event", "FCRA Timeline"],
        rows: [
          ["Bureau acknowledges dispute", "5 business days"],
          ["Bureau completes investigation", "30 days (45 with additional evidence)"],
          ["Bureau notifies you of results", "5 business days after completion"],
          ["MOV response due", "15 days after request"],
          ["Most negative items removed", "7 years from date of first delinquency"],
          ["Chapter 7 bankruptcy removed", "10 years from filing"],
          ["Hard inquiries removed", "2 years (impact fades after 12 months)"],
        ],
      },
    ],
  },
  {
    slug: "how-to-dispute-credit-report-errors",
    title: "How to Dispute Errors on Your Credit Report (Step-by-Step)",
    excerpt:
      "A practical, step-by-step guide to disputing inaccurate information on your credit report — including what to write, where to send it, and what to do if the bureau ignores you.",
    category: "Dispute Rights",
    readTime: "9 min",
    publishDate: "2026-02-08",
    relatedSlugs: ["fcra-rights", "sample-dispute-letter-guide", "handling-collection-accounts"],
    sections: [
      {
        type: "p",
        text: "Disputing errors on your credit report is a legal right under the FCRA, and when done correctly, it's one of the most effective ways to improve your credit score. Many people avoid it because they think it's complicated. It isn't — but it does require doing it the right way.",
      },
      {
        type: "h2",
        text: "Before You Dispute: Build Your Case",
      },
      {
        type: "p",
        text: "A dispute without evidence is just a complaint. Before writing anything, pull your credit reports from all three bureaus and identify each item you want to dispute. For each item, document exactly what's wrong:",
      },
      {
        type: "ul",
        items: [
          "Wrong balance (e.g., shows $3,200 but you paid it down to $800)",
          "Wrong status (e.g., shows 'in collections' but was paid and discharged)",
          "Account isn't yours (could be identity theft or a mixed file)",
          "Incorrect date of first delinquency (affects when it must be removed)",
          "Duplicate entry for the same account",
          "Late payment that was actually paid on time (find your bank records)",
          "Collection account past the 7-year reporting window",
        ],
      },
      {
        type: "callout",
        variant: "tip",
        text: "Gather supporting documentation before you start: bank statements, payment confirmations, account closure letters. A dispute backed by evidence is significantly harder for a bureau to reject.",
      },
      {
        type: "h2",
        text: "Step 1: Write Your Dispute Letter",
      },
      {
        type: "p",
        text: "Your dispute letter must be specific. Vague disputes like 'this account isn't mine' are processed electronically in seconds — bureaus forward a 2-digit code to the furnisher who confirms or denies it. The more specific you are, the more likely the furnisher can't provide adequate verification.",
      },
      {
        type: "p",
        text: "Your letter should include: your full name and contact information, the specific account name and number (masked), the exact inaccuracy, your legal basis for the dispute (FCRA § 611), what you want done (deletion, correction), and a list of any enclosures.",
      },
      {
        type: "h2",
        text: "Step 2: Send via Certified Mail",
      },
      {
        type: "p",
        text: "Always send dispute letters via USPS Certified Mail with Return Receipt Requested. This gives you proof of the date the bureau received your dispute — which starts the 30-day investigation clock. Keep the green return receipt card and the tracking confirmation.",
      },
      {
        type: "table",
        headers: ["Bureau", "Dispute Mailing Address"],
        rows: [
          ["Equifax", "P.O. Box 740256, Atlanta, GA 30374-0256"],
          ["Experian", "P.O. Box 4500, Allen, TX 75013"],
          ["TransUnion", "Consumer Dispute Center, P.O. Box 2000, Chester, PA 19016"],
        ],
      },
      {
        type: "callout",
        variant: "info",
        text: "Bureaus accept online disputes too, but certified mail creates a paper trail and gives you stronger legal standing if you need to escalate. Online disputes are also processed through automated e-OSCAR systems that are easier for furnishers to rubber-stamp.",
      },
      {
        type: "h2",
        text: "Step 3: Track the 30-Day Deadline",
      },
      {
        type: "p",
        text: "The bureau must complete its investigation within 30 days of receiving your dispute (45 days if you provide additional documentation after they've started). Write the deadline date in your records the moment you get the return receipt. If you don't receive a response by the deadline, the bureau is required to delete the disputed item.",
      },
      {
        type: "h2",
        text: "Step 4: Review the Results",
      },
      {
        type: "p",
        text: "The bureau will send you a notice with the results — either by mail or online, depending on how you submitted. The possible outcomes are: deleted, updated/corrected, or verified (no change). If the item is deleted or corrected, the bureau must also send a free updated copy of your credit report.",
      },
      {
        type: "h2",
        text: "Step 5: If Verified — Send a Method of Verification Request",
      },
      {
        type: "p",
        text: "If the bureau claims the information was 'verified' but you still believe it's wrong, your next step is a Method of Verification (MOV) letter. Under FCRA § 611(a)(6)(B)(iii), you can demand to know exactly how the bureau verified the item — specifically: who they contacted and what documentation they reviewed.",
      },
      {
        type: "p",
        text: "Many disputed items are removed at this stage because bureaus can't produce real documentation of their verification process — they often just send an automated code to the furnisher who clicks 'verified' without reviewing anything. The MOV request forces them to demonstrate genuine investigation.",
      },
      {
        type: "h2",
        text: "Step 6: Escalation — When Round 2 Fails",
      },
      {
        type: "p",
        text: "If both rounds with the bureau fail and you're certain the item is inaccurate, escalate with these strategies:",
      },
      {
        type: "ol",
        items: [
          "File a CFPB complaint at consumerfinance.gov/complaint — this gets priority attention from compliance teams at the bureau, not the dispute department",
          "Dispute directly with the furnisher (the original creditor or collector) under FCRA § 623",
          "Send an Intent to Sue letter citing specific FCRA violations",
          "Consult with a consumer protection attorney — many take FCRA cases on contingency",
        ],
      },
      {
        type: "callout",
        variant: "warning",
        text: "Never pay a 'credit repair company' to dispute items you can dispute yourself for free. Everything a credit repair company does, you can do under your own rights. If a company promises 'guaranteed' deletions, it's likely a scam.",
      },
      {
        type: "h2",
        text: "Dispute Tips That Actually Work",
      },
      {
        type: "ul",
        items: [
          "Dispute one item at a time — shotgun disputes with 10+ items in one letter are easy to dismiss and may get flagged as 'frivolous'",
          "Keep a dispute log with dates, tracking numbers, and responses for every item",
          "Never acknowledge a debt is yours if it isn't — even in passing",
          "Follow up 35 days after sending if you haven't received confirmation",
          "Save every piece of correspondence — you may need it in court",
          "Dispute with all three bureaus separately — one deletion doesn't automatically flow to the others",
        ],
      },
    ],
  },
  {
    slug: "handling-collection-accounts",
    title: "How to Handle Collection Accounts (and Get Them Off Your Report)",
    excerpt:
      "Collection accounts can stay on your report for 7 years, but there are legal strategies to get them removed sooner — including debt validation, pay-for-delete, and disputing inaccurate details.",
    category: "Debt Management",
    readTime: "8 min",
    publishDate: "2026-02-15",
    relatedSlugs: ["fcra-rights", "how-to-dispute-credit-report-errors", "debt-payoff-strategies"],
    sections: [
      {
        type: "p",
        text: "A collection account is created when a creditor gives up trying to collect a debt and sells or transfers it to a third-party debt collector. Collections are among the most damaging items on a credit report — a single collection can drop a good score by 100+ points. But they're also one of the most frequently inaccurate items, giving you real leverage.",
      },
      {
        type: "h2",
        text: "Step 1: Validate the Debt First",
      },
      {
        type: "p",
        text: "Before you pay anything or engage with a collector, request debt validation. Under the Fair Debt Collection Practices Act (FDCPA) § 809(b), if you send a written validation request within 30 days of first contact, the collector must stop all collection activity — including credit reporting — until they provide proof the debt is valid.",
      },
      {
        type: "p",
        text: "Request that the collector provide:",
      },
      {
        type: "ul",
        items: [
          "Verification of the original debt (amount and nature)",
          "A copy of the original signed credit agreement",
          "The name and address of the original creditor",
          "Proof they are licensed to collect in your state",
          "A complete payment history showing how the amount was calculated",
          "Proof that the statute of limitations has not expired",
        ],
      },
      {
        type: "callout",
        variant: "warning",
        text: "Many debt collectors cannot produce the original signed agreement — especially for old debts that have been sold multiple times. If they can't validate, they must cease collection activity and delete the account from your credit report.",
      },
      {
        type: "h2",
        text: "Step 2: Check the Statute of Limitations",
      },
      {
        type: "p",
        text: "Every state has a statute of limitations (SOL) on debt — the window during which a collector can successfully sue you to collect. SOLs typically range from 3 to 6 years depending on your state and debt type. After the SOL expires, the debt is 'time-barred' — the collector can still contact you, but they cannot win in court.",
      },
      {
        type: "callout",
        variant: "warning",
        text: "Making a payment — even a small 'good faith' payment — on a time-barred debt can restart the statute of limitations clock in some states. Acknowledging the debt in writing can do the same. Never pay without fully understanding your state's laws and the debt's age.",
      },
      {
        type: "p",
        text: "The SOL is separate from the 7-year credit reporting window. A debt can be too old to sue over but still appear on your credit report. Both timelines start from the date of first delinquency on the original account.",
      },
      {
        type: "h2",
        text: "Step 3: Dispute Any Inaccuracies",
      },
      {
        type: "p",
        text: "Collection accounts are riddled with errors. Common ones include: wrong balance (inflated with fees and interest), wrong date of first delinquency (reaged to appear newer), duplicate entries (original account + collection), wrong account information, or accounts past the 7-year reporting window. If any detail is wrong, dispute it with the bureau — the collector often can't produce the documentation needed to verify.",
      },
      {
        type: "h2",
        text: "Step 4: Negotiate (If the Debt is Valid)",
      },
      {
        type: "p",
        text: "If the debt is valid, within the statute of limitations, and the collection account is reporting accurately — your best options are negotiation.",
      },
      {
        type: "h3",
        text: "Pay-for-Delete",
      },
      {
        type: "p",
        text: "A pay-for-delete agreement is an offer to pay the debt in full (or as a settlement) in exchange for the collector removing the account from your credit report. This is not guaranteed under law — collectors aren't required to delete paid accounts — but many will agree to it, especially smaller collectors.",
      },
      {
        type: "callout",
        variant: "tip",
        text: "Always get the pay-for-delete agreement in writing before sending any payment. Once the money is gone, your leverage is gone. The written agreement should specify the amount, that it satisfies the debt in full, and that the collector will delete the tradeline from all three bureaus within 30 days.",
      },
      {
        type: "h3",
        text: "Settlement (Without Deletion)",
      },
      {
        type: "p",
        text: "If pay-for-delete isn't an option, you can negotiate to pay less than the full balance in a settlement. Collectors who purchased old debts often paid pennies on the dollar — they have room to negotiate. Start at 25–30% of the balance and work up from there. Get the settlement agreement in writing before paying.",
      },
      {
        type: "p",
        text: "Note: Under FICO 9 and VantageScore 3.0+, paid collections are ignored and don't affect your score. But many lenders use older FICO models where paid collections still count. Check with your lender about which scoring model they use.",
      },
      {
        type: "h2",
        text: "The 7-Year Rule",
      },
      {
        type: "p",
        text: "Collection accounts must be removed from your credit report 7 years from the date of first delinquency on the original account — not from when it was sent to collections, not from when the collector first reported it. If a collection on your report is approaching or has passed this 7-year mark, send a deletion request to the bureau citing FCRA § 605(a)(4).",
      },
    ],
  },
  {
    slug: "credit-utilization-explained",
    title: "Credit Utilization Explained: The Fastest Way to Raise Your Score",
    excerpt:
      "Credit utilization accounts for 30% of your FICO score — and unlike most other factors, it can be improved in as little as one billing cycle. Here's exactly how it works and how to optimize it.",
    category: "Building Credit",
    readTime: "6 min",
    publishDate: "2026-02-22",
    relatedSlugs: ["how-credit-scores-work", "building-credit-from-scratch", "prepare-credit-for-mortgage"],
    sections: [
      {
        type: "p",
        text: "Credit utilization is the ratio of your current credit card balances to your total credit limits. It accounts for roughly 30% of your FICO score — second only to payment history — and it's the fastest factor you can change. Pay down a balance today and your score can reflect it within one billing cycle.",
      },
      {
        type: "h2",
        text: "How Utilization Is Calculated",
      },
      {
        type: "p",
        text: "Utilization is calculated two ways: per card and aggregate (across all cards). Both matter. You can have low aggregate utilization but still be hurt if one card is maxed out.",
      },
      {
        type: "ul",
        items: [
          "Per-card: (Balance ÷ Limit) × 100 for each individual card",
          "Aggregate: (Total Balances ÷ Total Limits) × 100 across all revolving accounts",
          "Only revolving credit (credit cards, HELOCs) is included — installment loans like auto loans and mortgages don't factor into utilization",
        ],
      },
      {
        type: "h2",
        text: "The Key Thresholds",
      },
      {
        type: "table",
        headers: ["Utilization", "Effect on Score"],
        rows: [
          ["0%", "Slightly worse than 1% — shows no activity"],
          ["1–10%", "Maximum score benefit"],
          ["10–29%", "Good range"],
          ["30%", "Common misconception — this is NOT the target, it's where damage starts"],
          ["50%+", "Significant score damage"],
          ["90%+", "Severe damage, same impact as a maxed-out card"],
        ],
      },
      {
        type: "callout",
        variant: "warning",
        text: "The '30% rule' is widely misunderstood. Keeping utilization under 30% doesn't mean 30% is fine — 30% is actually the threshold where your score begins to be significantly penalized. For the best scores, aim for under 10%.",
      },
      {
        type: "h2",
        text: "When Is Your Balance Reported?",
      },
      {
        type: "p",
        text: "Most card issuers report your balance to the credit bureaus on your statement closing date — not your payment due date. This means even if you pay your balance in full every month, a high statement balance is being reported and hurting your utilization.",
      },
      {
        type: "callout",
        variant: "tip",
        text: "To optimize reported utilization: pay your balance down to under 10% of your limit a few days before your statement closing date. The statement balance is what gets reported — not what you owe on the due date.",
      },
      {
        type: "h2",
        text: "6 Strategies to Lower Your Utilization",
      },
      {
        type: "ol",
        items: [
          "Pay before the statement close date — not just before the due date",
          "Make multiple payments per month to keep the running balance low",
          "Request credit limit increases from your card issuers — same balance + higher limit = lower utilization",
          "Spread balances across multiple cards rather than concentrating on one",
          "Keep old, unused cards open — they contribute available credit with zero balance",
          "Open a new card (only if you qualify) to add available credit",
        ],
      },
      {
        type: "h2",
        text: "Requesting a Credit Limit Increase",
      },
      {
        type: "p",
        text: "Most major card issuers allow you to request a credit limit increase online or by calling the number on the back of your card. You'll typically be asked for your current income. Key things to know:",
      },
      {
        type: "ul",
        items: [
          "Some issuers do a soft pull (no score impact) for existing cardholders; others do a hard pull — ask which before requesting",
          "Waiting 6–12 months after opening a card before requesting an increase gives the best results",
          "Issuers are more likely to grant increases to accounts with on-time payment history",
          "If denied, you can try again in 6 months — don't apply repeatedly",
        ],
      },
      {
        type: "h2",
        text: "How Fast Will Utilization Changes Show?",
      },
      {
        type: "p",
        text: "Because utilization is recalculated every month based on your current balances, improvements reflect quickly. Pay down a card balance before the statement closes this month and your score can increase next month — sometimes by 20–50 points or more, depending on how much you reduce.",
      },
    ],
  },
  {
    slug: "prepare-credit-for-mortgage",
    title: "How to Get Your Credit Mortgage-Ready",
    excerpt:
      "The 12-month roadmap for optimizing your credit score before applying for a home loan — including score thresholds, common mistakes, and what to do in the final 90 days.",
    category: "Building Credit",
    readTime: "7 min",
    publishDate: "2026-03-01",
    relatedSlugs: ["credit-utilization-explained", "how-credit-scores-work", "how-to-dispute-credit-report-errors"],
    sections: [
      {
        type: "p",
        text: "A mortgage is likely the largest financial commitment of your life — and credit score has a larger impact on your total cost than almost any other factor. A 760+ score versus a 680 score on a $400,000 30-year mortgage can mean $100,000+ in additional interest. Getting your credit right before applying is one of the highest-return financial moves you can make.",
      },
      {
        type: "h2",
        text: "How Mortgage Lenders Use Your Score",
      },
      {
        type: "p",
        text: "Mortgage lenders pull your credit from all three bureaus and use your middle score — not the highest or lowest. If your three bureau scores are 720, 740, and 755, your qualifying score is 740. Joint applicants are typically qualified on the lower of the two middle scores.",
      },
      {
        type: "callout",
        variant: "info",
        text: "Most mortgage lenders still use FICO 2, 4, and 5 (bureau-specific older models) — not the widely-advertised FICO 8 or FICO 10. The factors are similar but weighted somewhat differently. Ask your lender which models they use.",
      },
      {
        type: "h2",
        text: "Score Thresholds and Rate Impact",
      },
      {
        type: "table",
        headers: ["Score Range", "Loan Type Access", "Rate Impact"],
        rows: [
          ["760+", "All conventional, FHA, VA, jumbo", "Best available rates"],
          ["740–759", "All standard products", "0.125–0.25% above best"],
          ["720–739", "Most products", "0.25–0.5% above best"],
          ["700–719", "Standard with some restrictions", "0.5–0.75% above best"],
          ["680–699", "Conventional with higher fees", "0.75–1.0% above best"],
          ["620–679", "FHA, VA, or subprime conventional", "1.0–1.5%+ above best"],
          ["Below 620", "FHA minimum 580; below that, 10% down required", "Limited options"],
        ],
      },
      {
        type: "h2",
        text: "12 Months Out: The Foundation",
      },
      {
        type: "ul",
        items: [
          "Pull all three credit reports and dispute every error — give errors 60–90 days to resolve before your mortgage application",
          "Get all accounts current — no open delinquencies at application is a hard requirement for most conventional loans",
          "Pay down credit card balances to below 10% utilization on each card",
          "Don't close old credit cards — the history and available credit both matter",
          "Don't open any new credit accounts — each hard inquiry can lower your score 5–10 points",
          "Set up autopay on everything to prevent any new late payments",
        ],
      },
      {
        type: "h2",
        text: "6 Months Out: Fine-Tuning",
      },
      {
        type: "ul",
        items: [
          "Stop using credit cards except for small monthly recurring charges (keeps them active without raising balances)",
          "Target 1–5% utilization on each card for maximum score impact",
          "Ensure all dispute resolutions are reflected on your report — follow up if not",
          "Check for any recent negative items that may have appeared",
          "If you have any collection accounts, now is the time to resolve them — settled/paid collections still matter to most mortgage underwriters even if FICO 9 ignores them",
        ],
      },
      {
        type: "h2",
        text: "90 Days Out: Don't Break Anything",
      },
      {
        type: "p",
        text: "The 90 days before applying is a danger zone. Any significant change to your credit profile — good or bad — will be scrutinized. In this window:",
      },
      {
        type: "ul",
        items: [
          "Do not apply for any new credit — no new cards, auto loans, or personal loans",
          "Do not co-sign for anyone — it adds their debt to your DTI",
          "Do not close any credit accounts",
          "Do not make any large purchases on credit (furniture, appliances)",
          "Do not change jobs if you can avoid it — lenders want 2+ years at the same employer or in the same field",
          "Do not make large unexplained deposits or withdrawals — underwriters review bank statements",
        ],
      },
      {
        type: "h2",
        text: "Rate Shopping Without Hurting Your Score",
      },
      {
        type: "p",
        text: "Getting quotes from multiple mortgage lenders is smart — but it involves multiple hard inquiries. Fortunately, FICO treats all mortgage inquiries within a 14–45 day window as a single inquiry for scoring purposes. Shop aggressively within that window: get quotes from 3–5 lenders on the same day or within a few weeks.",
      },
      {
        type: "h2",
        text: "Common Mistakes That Cost Buyers",
      },
      {
        type: "ul",
        items: [
          "Opening a new credit card to get a sign-up bonus right before applying",
          "Paying off an installment loan right before application — losing installment history can briefly lower scores",
          "Making a large cash deposit without documentation (lenders must source it)",
          "Quitting or changing jobs during underwriting",
          "Financing appliances or furniture before closing — the new inquiry and debt load can trigger a full re-underwrite",
          "Disputing accounts after the application — active disputes can block certain mortgage programs",
        ],
      },
    ],
  },
  {
    slug: "building-credit-from-scratch",
    title: "Building Credit from Scratch: A Step-by-Step Roadmap",
    excerpt:
      "Whether you're 18 or 45 with no credit history, here's the proven roadmap to build a strong credit profile from zero — including secured cards, credit builder loans, and authorized user strategy.",
    category: "Building Credit",
    readTime: "7 min",
    publishDate: "2026-03-08",
    relatedSlugs: ["credit-utilization-explained", "how-credit-scores-work", "identity-theft-protection"],
    sections: [
      {
        type: "p",
        text: "No credit history doesn't mean bad credit — it means invisible credit. You're 'credit invisible' to lenders, which makes most of them treat you similarly to someone with bad credit. The goal is to become visible as quickly and positively as possible. This roadmap works whether you're a student, a recent immigrant, or someone who simply avoided credit for years.",
      },
      {
        type: "h2",
        text: "Phase 1: Get Your First Account (Month 1)",
      },
      {
        type: "h3",
        text: "Option A: Secured Credit Card",
      },
      {
        type: "p",
        text: "A secured credit card is the most accessible starting point. You deposit money (typically $200–$500) that becomes your credit limit. Use the card for small purchases — a monthly subscription, gas, groceries — and pay the full balance every month before the statement closes.",
      },
      {
        type: "p",
        text: "Best secured cards report to all three bureaus — confirm this before applying. Cards from Discover, Capital One, and Citi are well-regarded options with paths to upgrade to unsecured cards. Avoid cards with high annual fees or monthly maintenance fees.",
      },
      {
        type: "h3",
        text: "Option B: Authorized User",
      },
      {
        type: "p",
        text: "Ask a family member or close friend with excellent credit (score 700+, on-time payment history, low utilization) to add you as an authorized user on one of their older accounts. Their entire account history will appear on your credit report — you get the benefit of their years of positive history. You don't need to use the card or even have it in your possession.",
      },
      {
        type: "callout",
        variant: "warning",
        text: "Make sure the account you're being added to has a positive history. If the account has late payments or high utilization, it will hurt your score just as much as it hurts theirs.",
      },
      {
        type: "h2",
        text: "Phase 2: Add a Credit Builder Loan (Month 2–3)",
      },
      {
        type: "p",
        text: "A credit builder loan is a special type of loan where the bank holds the funds in a savings account while you make payments. When the loan is paid off, you get the money. The purpose is credit building, not borrowing. Services like Self, Credit Strong, and many credit unions offer these for $20–$30/month.",
      },
      {
        type: "p",
        text: "Why add this alongside a credit card? Because it creates a credit mix (revolving + installment), which accounts for 10% of your score. More importantly, it adds another account reporting positive on-time payments.",
      },
      {
        type: "h2",
        text: "Phase 3: Request a Credit Limit Increase (Month 6)",
      },
      {
        type: "p",
        text: "After 6 months of on-time payments on your secured card, call the issuer and request a credit limit increase or an upgrade to an unsecured card. Many issuers will automatically review your account at the 6-month mark. A higher limit means lower utilization — which helps your score.",
      },
      {
        type: "h2",
        text: "Phase 4: Apply for an Unsecured Card (Month 9–12)",
      },
      {
        type: "p",
        text: "After 9–12 months of positive history, apply for a starter unsecured credit card. You likely won't qualify for premium rewards cards yet, but you should qualify for standard cards. Store cards (Amazon, Target, Home Depot) are generally easier to get approved for than major bank cards at this stage.",
      },
      {
        type: "h2",
        text: "The Rules That Matter",
      },
      {
        type: "ul",
        items: [
          "Never miss a payment — set up autopay for the minimum on every account",
          "Keep utilization under 10% on each card at all times",
          "Don't apply for multiple cards at once — hard inquiries stack up and space applications 6 months apart",
          "Keep older cards open — even if you rarely use them",
          "Don't let any card go completely unused for more than 6 months — some issuers close inactive accounts",
        ],
      },
      {
        type: "h2",
        text: "What to Expect on the Timeline",
      },
      {
        type: "table",
        headers: ["Timeline", "Expected Score", "What's Driving It"],
        rows: [
          ["3 months", "580–620", "Secured card and credit builder loan established"],
          ["6 months", "620–660", "6 months of on-time payments, FICO score generated"],
          ["12 months", "660–700", "Multiple accounts, consistent history, limit increase"],
          ["24 months", "700–740", "Established mix, aging accounts, possible unsecured upgrade"],
          ["36+ months", "740+", "Strong history, diversified mix, long account age"],
        ],
      },
    ],
  },
  {
    slug: "identity-theft-protection",
    title: "How to Protect Your Credit from Identity Theft",
    excerpt:
      "Identity thieves can open accounts in your name, destroy your credit, and take years to fully undo. Here's a complete guide to prevention, detection, and recovery.",
    category: "Identity Protection",
    readTime: "8 min",
    publishDate: "2026-03-15",
    relatedSlugs: ["how-to-read-your-credit-report", "fcra-rights", "how-to-dispute-credit-report-errors"],
    sections: [
      {
        type: "p",
        text: "Identity theft is the fastest-growing crime in the United States. In 2023 alone, the FTC received 1.1 million reports of identity theft. The damage can be devastating: accounts opened in your name, credit score destroyed, years of dispute work to clean up. The best defense is a combination of proactive protection and early detection.",
      },
      {
        type: "h2",
        text: "The Single Most Effective Protection: Credit Freeze",
      },
      {
        type: "p",
        text: "A credit freeze (also called a security freeze) prevents credit bureaus from releasing your credit report to anyone requesting it — which means no lender can approve new credit in your name without you temporarily lifting the freeze. Since 2018, freezing your credit is completely free at all three bureaus.",
      },
      {
        type: "table",
        headers: ["Bureau", "Freeze Method", "Phone"],
        rows: [
          ["Equifax", "equifax.com/personal/credit-report-services/credit-freeze", "1-800-685-1111"],
          ["Experian", "experian.com/freeze", "1-888-397-3742"],
          ["TransUnion", "transunion.com/credit-freeze", "1-888-909-8872"],
        ],
      },
      {
        type: "p",
        text: "You'll receive a PIN or password for each bureau — store these securely. You can temporarily unfreeze online in minutes when you need to apply for credit. After you apply, refreeze immediately.",
      },
      {
        type: "callout",
        variant: "tip",
        text: "Freeze with all three major bureaus AND the two smaller ones: ChexSystems (chexsystems.com/freeze) and Innovis (innovis.com/freeze). ChexSystems is used by banks when you open checking/savings accounts. Innovis is used by some creditors and insurers.",
      },
      {
        type: "h2",
        text: "Early Detection: Signs of Identity Theft",
      },
      {
        type: "ul",
        items: [
          "Accounts on your credit report that you don't recognize",
          "Hard inquiries from lenders you never contacted",
          "Collection calls for debts you don't owe",
          "Bills or collection notices for accounts you didn't open",
          "Credit or loan applications denied for reasons that don't match your situation",
          "Your tax return is rejected because one was already filed with your SSN",
          "Medical bills for care you didn't receive",
          "Notifications about a data breach from a company you have an account with",
        ],
      },
      {
        type: "h2",
        text: "Ongoing Monitoring",
      },
      {
        type: "p",
        text: "Check your credit reports at least every 4 months — Equifax, Experian, and TransUnion each once per year, staggered. Look for new accounts or inquiries you don't recognize. Sign up for free monitoring through services like Credit Karma or your bank — they alert you when new accounts or inquiries appear.",
      },
      {
        type: "h2",
        text: "If You're a Victim: The Recovery Roadmap",
      },
      {
        type: "ol",
        items: [
          "Place an initial fraud alert with one bureau — they're required to notify the others. An initial fraud alert lasts 1 year and requires lenders to verify your identity before opening new accounts.",
          "Report the theft at IdentityTheft.gov (run by the FTC). This generates a personalized recovery plan and an official Identity Theft Report.",
          "File a police report at your local department. Request a copy — you'll need it to dispute fraudulent accounts.",
          "Request an extended fraud alert (lasts 7 years) or a credit freeze.",
          "Dispute all fraudulent accounts with each bureau. Under FCRA § 605B, you can have fraudulent information blocked with just your Identity Theft Report — no investigation period required.",
          "Contact each company where fraud occurred. Use the Identity Theft Report to have accounts closed and charges removed.",
          "Change passwords on all financial accounts. Enable two-factor authentication everywhere.",
        ],
      },
      {
        type: "h2",
        text: "Fraud Alert vs. Credit Freeze",
      },
      {
        type: "table",
        headers: ["", "Fraud Alert", "Credit Freeze"],
        rows: [
          ["What it does", "Requires lenders to verify identity", "Blocks credit report access entirely"],
          ["Duration", "1 year (7 years for victims)", "Indefinite until you lift it"],
          ["Cost", "Free", "Free"],
          ["Impact on applications", "Minor — lenders must call you", "Must temporarily lift for each application"],
          ["Best for", "Suspected risk, precaution", "Maximum protection, confirmed theft"],
        ],
      },
      {
        type: "h2",
        text: "Preventive Habits",
      },
      {
        type: "ul",
        items: [
          "Use a unique, strong password for every financial account — use a password manager",
          "Enable two-factor authentication (2FA) on all financial and email accounts",
          "Never use public WiFi for banking or credit applications",
          "Shred financial documents, pre-approved credit offers, and anything with your SSN before discarding",
          "Don't carry your Social Security card in your wallet",
          "Be suspicious of unsolicited calls, texts, or emails requesting personal information — legitimate companies don't ask for your SSN by phone",
          "Monitor your bank and credit card transactions weekly, not just monthly",
        ],
      },
    ],
  },
  {
    slug: "debt-payoff-strategies",
    title: "Debt Payoff Strategies: Avalanche vs. Snowball (and When to Use Each)",
    excerpt:
      "Two proven methods for paying off debt — one saves the most money, the other is more motivating. Learn which works best for your situation and how to supercharge either approach.",
    category: "Debt Management",
    readTime: "6 min",
    publishDate: "2026-03-22",
    relatedSlugs: ["handling-collection-accounts", "credit-utilization-explained", "prepare-credit-for-mortgage"],
    sections: [
      {
        type: "p",
        text: "Paying off debt is one of the most powerful things you can do for your credit score and financial health — reducing utilization, eliminating derogatory marks, and freeing up cash flow. But not all payoff strategies are equal. The method you choose affects how fast you're debt-free and how much you pay in total interest.",
      },
      {
        type: "h2",
        text: "The Two Core Methods",
      },
      {
        type: "h3",
        text: "The Avalanche Method",
      },
      {
        type: "p",
        text: "Pay the minimum on every debt. Put every extra dollar toward the debt with the highest interest rate. When that debt is paid off, roll its payment into the next-highest-rate debt.",
      },
      {
        type: "ul",
        items: [
          "Mathematically optimal — saves the most money on interest over time",
          "Best for people with high-rate debts (20%+ APR credit cards)",
          "Takes longer to get your first win — can feel discouraging",
          "Requires discipline to stick with it when progress seems slow",
        ],
      },
      {
        type: "h3",
        text: "The Snowball Method",
      },
      {
        type: "p",
        text: "Pay the minimum on every debt. Put every extra dollar toward the debt with the smallest balance — regardless of interest rate. When that debt is paid, roll its payment into the next-smallest.",
      },
      {
        type: "ul",
        items: [
          "Psychologically powerful — quick wins build momentum and motivation",
          "Research shows higher completion rates than avalanche for most people",
          "May cost more in total interest, especially if smallest debts have low rates",
          "Best for people who need motivation or have struggled to stick to a payoff plan",
        ],
      },
      {
        type: "callout",
        variant: "info",
        text: "A 2012 Harvard Business Review study found that focusing on paying off small balances first (snowball method) increases the likelihood of becoming debt-free — even if it costs slightly more in interest. The psychological wins matter for long-term success.",
      },
      {
        type: "h2",
        text: "Which Should You Choose?",
      },
      {
        type: "p",
        text: "The best method is the one you'll actually stick to. If you have strong financial discipline and high-rate debt, avalanche saves you more money. If you need motivation and quick wins to stay on track, snowball is more likely to get you debt-free. If your debts are similar in interest rate, the difference is small — use snowball for the psychological boost.",
      },
      {
        type: "h2",
        text: "Supercharging Either Method",
      },
      {
        type: "ul",
        items: [
          "Call card issuers and ask for lower interest rates — you have more leverage as a long-term customer than you think",
          "Transfer balances to a 0% APR card if you qualify — no interest means every dollar goes to principal",
          "Apply windfalls (tax refunds, bonuses, gifts) as lump-sum payments on your target debt",
          "Automate the minimum on all debts and the extra payment on your target — removes the decision friction",
          "Cut one discretionary expense per month and redirect exactly that amount to debt",
          "Consider a personal loan to consolidate multiple high-rate debts into one lower-rate payment",
        ],
      },
      {
        type: "h2",
        text: "How Debt Payoff Affects Your Credit Score",
      },
      {
        type: "p",
        text: "Paying off credit card debt improves your score fastest because it reduces utilization (30% of your score). Paying off installment loans (auto, personal loan) has a smaller and sometimes briefly negative effect — closing an installment account can reduce your credit mix and lower your average account age.",
      },
      {
        type: "callout",
        variant: "tip",
        text: "If you're paying off a credit card with the intent to close it, consider keeping it open with a $0 balance instead. The available credit helps your utilization, and the account history helps your average age. Only close it if you can't resist overspending on it.",
      },
      {
        type: "h2",
        text: "Debt-to-Income Ratio: The Other Number That Matters",
      },
      {
        type: "p",
        text: "Your debt-to-income ratio (DTI) — total monthly debt payments divided by gross monthly income — isn't part of your credit score, but it's critical for loan approvals, especially mortgages. Most conventional mortgage lenders want a DTI below 43%; the best rates require below 36%. Paying off debts directly lowers your DTI, improving both your credit profile and your loan qualification.",
      },
    ],
  },
];

export function getArticleBySlug(slug: string): LearnArticle | undefined {
  return learnArticles.find((a) => a.slug === slug);
}

export function getRelatedArticles(slugs: string[]): LearnArticle[] {
  return slugs.map((s) => getArticleBySlug(s)).filter(Boolean) as LearnArticle[];
}
