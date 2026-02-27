export type AccountType =
  | "checking"
  | "savings"
  | "investment"
  | "retirement"
  | "crypto"
  | "real_estate"
  | "vehicle"
  | "other_asset"
  | "credit_card"
  | "mortgage"
  | "student_loan"
  | "auto_loan"
  | "other_liability";

export type AccountSource = "manual" | "plaid";

export interface PortfolioAccount {
  id: string;
  userId: string;
  name: string;
  institution: string;
  type: AccountType;
  source: AccountSource;
  balance: number;
  currency: string;
  plaidItemId?: string;
  plaidAccountId?: string;
  lastSyncedAt?: string;
  isHidden: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioSnapshot {
  id: string;
  userId: string;
  date: string;
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  createdAt: string;
}

export interface PlaidItem {
  id: string;
  userId: string;
  accessToken: string;
  itemId: string;
  institutionId: string;
  institutionName: string;
  status: "active" | "error" | "login_required";
  createdAt: string;
  updatedAt: string;
}

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  checking: "Checking",
  savings: "Savings",
  investment: "Investments",
  retirement: "Retirement",
  crypto: "Crypto",
  real_estate: "Real Estate",
  vehicle: "Vehicle",
  other_asset: "Other Asset",
  credit_card: "Credit Card",
  mortgage: "Mortgage",
  student_loan: "Student Loan",
  auto_loan: "Auto Loan",
  other_liability: "Other Liability",
};
