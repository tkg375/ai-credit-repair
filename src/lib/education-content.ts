export interface EducationModule {
  id: string;
  title: string;
  category: string;
  icon: string;
  summary: string;
  content: string;
  relatedIssues: string[];
}

export const categories = [
  "Understanding Credit",
  "Building Credit",
  "Dispute Rights",
  "Debt Management",
  "Identity Protection",
];

export const educationModules: EducationModule[] = [
  {
    id: "how-scores-work",
    title: "How Credit Scores Are Calculated",
    category: "Understanding Credit",
    icon: "📊",
    summary: "Learn the five factors that determine your FICO score and how each one is weighted.",
    content: `Your FICO credit score is calculated using five key factors, each with a different weight:

**Payment History (35%)** — This is the single most important factor. It tracks whether you've paid your bills on time. Even one 30-day late payment can drop your score by 60-100 points. The more recent the late payment, the more damage it does.

**Credit Utilization (30%)** — This measures how much of your available credit you're using. If you have a $10,000 credit limit and a $3,000 balance, your utilization is 30%. Experts recommend keeping this below 10% for the best scores, and never above 30%.

**Length of Credit History (15%)** — Longer credit histories are better. This factor looks at the age of your oldest account, your newest account, and the average age of all accounts. This is why you should think twice before closing old credit cards.

**Credit Mix (10%)** — Having different types of credit (credit cards, auto loans, mortgage, student loans) shows lenders you can handle various types of debt responsibly.

**New Credit Inquiries (10%)** — Each time you apply for credit, a "hard inquiry" appears on your report. Multiple hard inquiries in a short period can lower your score. However, rate shopping for mortgages or auto loans within a 14-45 day window counts as a single inquiry.`,
    relatedIssues: ["low_score", "utilization", "late_payment"],
  },
  {
    id: "understanding-credit-reports",
    title: "Reading Your Credit Report",
    category: "Understanding Credit",
    icon: "📋",
    summary: "Understand the sections of your credit report and what each piece of information means.",
    content: `Your credit report contains four main sections:

**Personal Information** — Your name, addresses, Social Security number, date of birth, and employment history. Errors here (wrong name spelling, addresses you've never lived at) can indicate mixed files or identity theft.

**Account Information (Trade Lines)** — Every credit account you've had: credit cards, loans, mortgages. Each entry shows the creditor name, account number, date opened, credit limit or loan amount, current balance, payment history, and account status (open, closed, delinquent, charged off).

**Public Records** — Bankruptcies, civil judgments, and tax liens. These are the most damaging items and can stay on your report for 7-10 years.

**Inquiries** — Divided into "hard" inquiries (you applied for credit) and "soft" inquiries (background checks, pre-approvals). Only hard inquiries affect your score.

**What to look for:** Check for accounts you don't recognize, incorrect balances, wrong dates, accounts showing as open that you closed, and late payments that were actually on time. Under the FCRA, you can dispute any inaccurate, incomplete, or unverifiable information.`,
    relatedIssues: ["inaccurate_info", "mixed_file", "identity_theft"],
  },
  {
    id: "utilization-strategies",
    title: "Mastering Credit Utilization",
    category: "Building Credit",
    icon: "💳",
    summary: "Practical strategies to lower your credit utilization ratio and boost your score quickly.",
    content: `Credit utilization is the fastest way to improve your score because it has no memory — it only reflects your current balances.

**The Magic Numbers:**
- 0-1% utilization: Maximum score benefit
- 1-10%: Excellent range
- 10-30%: Good range
- 30-50%: Starting to hurt your score
- 50%+: Significantly damaging your score

**Quick Strategies to Lower Utilization:**

1. **Pay before the statement date** — Your balance is typically reported to bureaus on your statement closing date, not your payment due date. Pay down balances before the statement closes.

2. **Request credit limit increases** — Call your card issuers and ask for a limit increase. A higher limit with the same balance = lower utilization. Many issuers allow this online.

3. **Make multiple payments per month** — Instead of one monthly payment, make bi-weekly payments to keep your running balance low.

4. **Spread balances across cards** — It's better to have 20% utilization on three cards than 60% on one card, because per-card utilization matters too.

5. **Keep old cards open** — Even if you don't use them, they contribute to your total available credit, lowering your overall utilization.`,
    relatedIssues: ["utilization", "high_balance", "low_score"],
  },
  {
    id: "building-from-scratch",
    title: "Building Credit from Nothing",
    category: "Building Credit",
    icon: "🏗️",
    summary: "Step-by-step guide for establishing credit when you have no credit history at all.",
    content: `If you have no credit history, here's a proven roadmap:

**Step 1: Start with a Secured Credit Card**
A secured card requires a deposit (usually $200-$500) that becomes your credit limit. Use it for small purchases and pay the full balance every month. Most secured cards report to all three bureaus.

**Step 2: Become an Authorized User**
Ask a family member or trusted friend with good credit to add you as an authorized user on their credit card. Their account history and payment record will appear on your credit report. You don't even need to use the card.

**Step 3: Consider a Credit Builder Loan**
Services like Self offer small loans where your payments are held in savings and released when the loan is paid off. You build credit and savings simultaneously.

**Step 4: Get a Store Card (After 3-6 Months)**
Store cards like Amazon or Target are easier to get approved for than major credit cards. Use them sparingly and pay in full.

**Step 5: Apply for an Unsecured Card (After 6-12 Months)**
After building 6-12 months of positive history, apply for a starter unsecured card. Many secured card issuers will automatically upgrade you.

**Key Rules:**
- Never use more than 10% of your credit limit
- Always pay on time — set up autopay for at least the minimum
- Don't apply for multiple cards at once
- Be patient — building good credit takes 6-12 months minimum`,
    relatedIssues: ["no_history", "thin_file", "low_score"],
  },
  {
    id: "fcra-rights",
    title: "Your Rights Under the FCRA",
    category: "Dispute Rights",
    icon: "⚖️",
    summary: "Know your legal rights when disputing inaccurate information on your credit report.",
    content: `The Fair Credit Reporting Act (FCRA) gives you powerful rights:

**Right to Dispute (Section 611)** — You can dispute any information you believe is inaccurate, incomplete, or unverifiable. The bureau must investigate within 30 days (45 if you provide additional information during the investigation).

**Right to Method of Verification (Section 611(a)(6)(B))** — After an investigation, you can request the method used to verify the disputed information. The bureau must provide this within 15 days.

**Right to Accurate Reporting (Section 623)** — Furnishers (creditors) are required to report accurate information and must investigate disputes forwarded by the bureaus.

**Right to Sue (Section 616 & 617)** — If a bureau or furnisher willfully or negligently violates the FCRA, you can sue for damages. Willful violations allow for statutory damages of $100-$1,000 per violation, plus punitive damages.

**Right to Free Annual Reports** — You're entitled to one free credit report per year from each bureau at AnnualCreditReport.com.

**Key Deadlines:**
- Bureau must acknowledge dispute within 5 business days
- Investigation must complete within 30 days
- Method of verification must be provided within 15 days of request
- Bureaus must notify you of investigation results within 5 business days

**If the bureau fails to meet these deadlines, the disputed item must be deleted.**`,
    relatedIssues: ["dispute", "inaccurate_info", "bureau_violation"],
  },
  {
    id: "dispute-strategies",
    title: "Effective Dispute Strategies",
    category: "Dispute Rights",
    icon: "📝",
    summary: "Learn proven strategies for disputing negative items and getting them removed.",
    content: `Not all disputes are created equal. Here are strategies that actually work:

**Round 1: Direct Dispute with Bureaus**
Start by disputing directly with the credit bureau. Be specific about what's wrong — don't just say "this isn't mine." State exactly what's inaccurate: wrong balance, wrong date, wrong status, account not yours, etc.

**Round 2: Method of Verification Request**
If the bureau "verifies" the item but you believe it's still wrong, send a follow-up letter requesting the method of verification under FCRA Section 611(a)(6)(B)(iii). Many items get removed at this stage because the bureau can't provide adequate documentation.

**Round 3: Escalation**
If Rounds 1 and 2 fail, escalate by:
- Filing a CFPB complaint (this gets priority attention from bureaus)
- Disputing directly with the furnisher/creditor
- Sending an intent-to-sue letter
- Consulting with a consumer rights attorney

**Tips for Effective Disputes:**
- Send disputes via certified mail with return receipt
- Keep copies of everything
- Dispute one item at a time for best results
- Include supporting documentation when possible
- Never admit the debt is yours if it isn't
- Follow up after 30 days if you haven't heard back
- Keep a dispute log with dates and responses`,
    relatedIssues: ["dispute", "collections", "late_payment", "charge_off"],
  },
  {
    id: "dealing-with-collections",
    title: "How to Handle Collection Accounts",
    category: "Debt Management",
    icon: "📞",
    summary: "Strategies for dealing with collection accounts and potentially getting them removed.",
    content: `Collection accounts are among the most damaging items on your credit report. Here's how to handle them:

**Step 1: Verify the Debt**
Within 30 days of first contact, send a debt validation letter requesting proof that:
- The debt is yours
- The amount is correct
- The collector is authorized to collect it

Under the FDCPA, the collector must stop collection activity until they verify the debt.

**Step 2: Check the Statute of Limitations**
Every state has a statute of limitations (SOL) on debt, typically 3-6 years. If the debt is past the SOL, the collector cannot sue you. However, be careful — making a payment or even acknowledging the debt can restart the clock in some states.

**Step 3: Negotiate**
If the debt is valid, consider:
- **Pay for Delete:** Offer to pay the full amount in exchange for the collector removing the account from your credit report. Get the agreement in writing before paying.
- **Settlement:** Negotiate to pay less than the full amount. Start at 25-30% and work up. Again, try to include deletion in the agreement.

**Step 4: Dispute if Inaccurate**
If any detail is wrong — wrong balance, wrong dates, wrong account number — dispute it with the bureaus. Collectors frequently have incomplete records.

**Important:** Never pay a collection directly without a written agreement about reporting. Under newer FICO models (FICO 9+), paid collections are ignored, but many lenders still use older models.`,
    relatedIssues: ["collections", "charge_off", "high_balance"],
  },
  {
    id: "debt-payoff-strategies",
    title: "Debt Payoff Strategies",
    category: "Debt Management",
    icon: "💰",
    summary: "Compare the avalanche and snowball methods to find the best debt payoff strategy for you.",
    content: `Two proven strategies for paying off debt:

**The Avalanche Method (Mathematically Optimal)**
Pay minimums on all debts, then put every extra dollar toward the debt with the highest interest rate. Once that's paid off, roll that payment into the next-highest-rate debt.

Pros: Saves the most money on interest over time
Cons: May take longer to see your first debt paid off

**The Snowball Method (Psychologically Effective)**
Pay minimums on all debts, then put every extra dollar toward the smallest balance. Once that's paid off, roll that payment into the next-smallest balance.

Pros: Quick wins build momentum and motivation
Cons: May cost more in total interest

**Which Should You Choose?**
Research shows the snowball method leads to higher success rates because the psychological wins keep people motivated. However, if you have a debt with a very high interest rate (20%+ credit card), the avalanche method could save you thousands.

**Supercharging Your Payoff:**
- Call card issuers to negotiate lower interest rates
- Consider a balance transfer to a 0% APR card
- Use windfalls (tax refunds, bonuses) for lump-sum payments
- Cut one expense and redirect that money to debt
- Avoid adding new debt while paying off existing debt

**Use our Debt Payoff Optimizer tool to compare strategies with your actual numbers.**`,
    relatedIssues: ["high_balance", "utilization", "collections"],
  },
  {
    id: "identity-theft-basics",
    title: "Protecting Against Identity Theft",
    category: "Identity Protection",
    icon: "🛡️",
    summary: "Learn how to protect yourself from identity theft and what to do if it happens.",
    content: `Identity theft is a growing threat. Here's how to protect yourself and respond if it happens:

**Prevention:**
- Freeze your credit at all three bureaus (it's free). This prevents anyone from opening new accounts in your name.
- Use strong, unique passwords for financial accounts
- Enable two-factor authentication everywhere
- Monitor your credit reports regularly
- Never share your SSN unless absolutely necessary
- Shred financial documents before discarding

**Warning Signs:**
- Accounts you don't recognize on your credit report
- Bills for services you didn't use
- Collection calls for debts you don't owe
- Denied credit unexpectedly
- IRS notification about duplicate tax filing

**If You're a Victim:**
1. Place a fraud alert with one bureau (they must notify the others)
2. File a report at IdentityTheft.gov
3. File a police report
4. Dispute all fraudulent accounts with the bureaus
5. Contact each company where fraud occurred
6. Consider an extended fraud alert (7 years) or credit freeze

Under the FCRA, you have special rights as an identity theft victim, including the right to block fraudulent information from your credit report permanently.`,
    relatedIssues: ["identity_theft", "mixed_file", "unknown_accounts"],
  },
  {
    id: "credit-freeze-guide",
    title: "Credit Freeze Guide",
    category: "Identity Protection",
    icon: "🧊",
    summary: "How to freeze and unfreeze your credit at all three bureaus for free.",
    content: `A credit freeze is the most effective protection against identity theft. Since 2018, it's completely free.

**What a Credit Freeze Does:**
Prevents credit bureaus from releasing your credit report to new creditors. This means no one can open new accounts in your name — including you, until you temporarily lift the freeze.

**How to Freeze at Each Bureau:**

**Equifax:** Visit equifax.com/personal/credit-report-services/credit-freeze or call 1-800-685-1111

**Experian:** Visit experian.com/freeze or call 1-888-397-3742

**TransUnion:** Visit transunion.com/credit-freeze or call 1-888-909-8872

**You'll receive a PIN or password for each bureau.** Keep these safe — you'll need them to temporarily lift or remove the freeze.

**When to Temporarily Lift:**
- Applying for a credit card or loan
- Renting an apartment
- Getting insurance quotes
- Starting new utility service

You can lift a freeze temporarily (for a specific period) or for a specific creditor. Most bureaus allow online unfreezing that takes effect within minutes.

**Freeze vs. Fraud Alert:**
- Freeze: Completely blocks access. Must be lifted for legitimate applications.
- Fraud Alert: Requires creditors to verify your identity before opening accounts. Lasts 1 year (or 7 years for identity theft victims).

**Recommendation:** Freeze your credit at all three bureaus and only unfreeze when you need to apply for credit.`,
    relatedIssues: ["identity_theft", "prevention"],
  },
  {
    id: "goodwill-letters",
    title: "Writing Effective Goodwill Letters",
    category: "Dispute Rights",
    icon: "✉️",
    summary: "How to ask creditors to remove negative marks as a gesture of goodwill.",
    content: `A goodwill letter asks a creditor to remove a negative mark from your credit report as a courtesy, even though the information is technically accurate.

**When Goodwill Letters Work Best:**
- You have an otherwise excellent payment history with the creditor
- The late payment was due to an unusual circumstance (illness, job loss, natural disaster)
- You've since brought the account current
- It's a single late payment, not a pattern

**How to Write an Effective Goodwill Letter:**

1. **Be honest and specific** about what happened
2. **Take responsibility** — don't make excuses
3. **Highlight your positive history** with the creditor
4. **Explain the impact** the negative mark is having on your life
5. **Ask specifically** for the removal as a goodwill gesture
6. **Keep it short** — one page maximum

**Sample Opening:**
"I am writing to respectfully request a goodwill adjustment on my account. I have been a loyal customer since [year] and have maintained an excellent payment record, with the exception of [one late payment in month/year]."

**Tips:**
- Send to the creditor's executive office, not the regular disputes department
- Include your account number
- Follow up by phone 2 weeks later
- If denied, try again in 3-6 months or try a different representative
- Be polite and grateful in all communications

**Success rate:** Goodwill letters work about 20-30% of the time, but they're worth trying because there's no downside.`,
    relatedIssues: ["late_payment", "dispute"],
  },
  {
    id: "mortgage-ready",
    title: "Getting Your Credit Mortgage-Ready",
    category: "Building Credit",
    icon: "🏠",
    summary: "Steps to optimize your credit score before applying for a mortgage.",
    content: `Mortgage lenders use your middle credit score (the middle of your three bureau scores). Here's how to maximize it:

**6+ Months Before Applying:**
- Pull your credit reports and dispute any errors
- Pay down credit card balances to below 10% utilization
- Don't close old credit card accounts
- Don't open any new credit accounts
- Set up autopay on everything to avoid late payments

**3 Months Before Applying:**
- Stop using credit cards except for small recurring charges
- Pay down any remaining balances
- Make sure all disputes are resolved
- Check for any new negative items

**Score Thresholds for Mortgages:**
- 760+: Best rates available
- 740-759: Excellent rates
- 720-739: Very good rates
- 700-719: Good rates
- 680-699: Average rates
- 620-679: Subprime rates
- Below 620: May need FHA or alternative programs

**Common Mistakes to Avoid:**
- Don't change jobs during the mortgage process
- Don't make large deposits or withdrawals without documentation
- Don't co-sign for anyone
- Don't finance furniture or appliances before closing
- Don't let anyone run your credit unnecessarily

**Pro Tip:** When rate shopping for mortgages, all hard inquiries within a 14-45 day window count as a single inquiry. Shop around for the best rate without worrying about score impact.`,
    relatedIssues: ["low_score", "utilization", "late_payment"],
  },
];

export function getRecommendedModules(issues: string[]): EducationModule[] {
  if (issues.length === 0) return educationModules.slice(0, 5);

  const scored = educationModules.map((mod) => {
    const matchCount = mod.relatedIssues.filter((ri) =>
      issues.some((issue) => issue.toLowerCase().includes(ri) || ri.includes(issue.toLowerCase()))
    ).length;
    return { mod, matchCount };
  });

  scored.sort((a, b) => b.matchCount - a.matchCount);
  return scored.map((s) => s.mod);
}
