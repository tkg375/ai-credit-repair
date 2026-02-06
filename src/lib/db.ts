export { firestore } from "./firebase-admin";

export const COLLECTIONS = {
  users: "users",
  creditReports: "creditReports",
  reportItems: "reportItems",
  disputes: "disputes",
  creditScores: "creditScores",
  actionPlans: "actionPlans",
} as const;
