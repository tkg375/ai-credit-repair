export { firestore } from "./firebase-admin";

export const COLLECTIONS = {
  users: "users",
  creditReports: "creditReports",
  reportItems: "reportItems",
  disputes: "disputes",
  creditScores: "creditScores",
  actionPlans: "actionPlans",
  reportChanges: "reportChanges",
  notifications: "notifications",
  portfolioAccounts: "portfolioAccounts",
  portfolioSnapshots: "portfolioSnapshots",
  plaidItems: "plaidItems",
  budgetEntries: "budgetEntries",
  goals: "goals",
  creditFreezes: "creditFreezes",
  creditorLetters: "creditorLetters",
  // Autopilot
  autopilotRuns: "autopilotRuns",
  fcraConsents: "fcraConsents",
  auditLogs: "auditLogs",
  autopilotWaitlist: "autopilotWaitlist",
  // Vault
  documents: "documents",
  // Referrals
  referrals: "referrals",
} as const;
