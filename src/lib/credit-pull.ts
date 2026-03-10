/**
 * Credit Bureau API Abstraction Layer
 *
 * This module provides a single interface for pulling consumer credit reports
 * from any supported provider. Swap the implementation by setting:
 *   CREDIT_PULL_PROVIDER=crs|bloom|softpull|stub
 *
 * All implementations must:
 * - Use soft inquiries only (no hard pulls)
 * - Never log or persist the full SSN
 * - Return normalized data in the CreditPullResult format
 *
 * FCRA compliance notes:
 * - Every call to pullCreditReport MUST have a corresponding consent record ID
 * - The consentId is passed to every provider implementation for logging
 * - Permissible purpose: consumer's written authorization (FCRA § 604(a)(2))
 */

export interface CreditPullIdentity {
  firstName: string;
  lastName: string;
  /** ISO date: YYYY-MM-DD */
  dateOfBirth: string;
  /**
   * Full SSN — used ONLY for the credit pull API call.
   * NEVER stored, logged, or persisted by this module.
   */
  ssn: string;
  address: string;
  city: string;
  state: string;
  zip: string;
}

export interface CreditTradeline {
  creditorName: string;
  accountNumber: string;
  accountType: string;
  /** Current balance in dollars */
  balance: number | null;
  creditLimit: number | null;
  status: string;
  dateOpened: string | null;
  dateOfFirstDelinquency: string | null;
  lastActivityDate: string | null;
  isNegative: boolean;
  bureau: "EQUIFAX" | "EXPERIAN" | "TRANSUNION";
  latePayments?: string[];
}

export interface CreditPullResult {
  /** External report ID from the bureau/provider */
  externalReportId: string;
  /** VantageScore 3.0 or 4.0 */
  vantageScore: number | null;
  bureau: "EQUIFAX" | "EXPERIAN" | "TRANSUNION" | "TRI_MERGE";
  tradelines: CreditTradeline[];
  pulledAt: string;
  provider: string;
}

export type CreditPullProvider = "crs" | "bloom" | "softpull" | "stub";

// ---------------------------------------------------------------------------
// Stub provider — returns mock data for development/testing
// Replace with real provider before going to production
// ---------------------------------------------------------------------------

async function pullStub(
  identity: CreditPullIdentity
): Promise<CreditPullResult> {
  console.warn(
    "[credit-pull] Using STUB provider. Set CREDIT_PULL_PROVIDER to a real provider before production."
  );
  // Simulate network latency
  await new Promise((r) => setTimeout(r, 500));

  return {
    externalReportId: `stub_${Date.now()}`,
    vantageScore: 612,
    bureau: "TRI_MERGE",
    pulledAt: new Date().toISOString(),
    provider: "stub",
    tradelines: [
      {
        creditorName: "Midland Credit Management",
        accountNumber: "****7832",
        accountType: "Collection",
        balance: 1250,
        creditLimit: null,
        status: "COLLECTION",
        dateOpened: "2019-03-15",
        dateOfFirstDelinquency: "2019-08-01",
        lastActivityDate: "2020-02-15",
        isNegative: true,
        bureau: "EQUIFAX",
      },
      {
        creditorName: "Portfolio Recovery Associates",
        accountNumber: "****5566",
        accountType: "Collection",
        balance: 890,
        creditLimit: null,
        status: "COLLECTION",
        dateOpened: "2018-06-20",
        dateOfFirstDelinquency: "2018-11-01",
        lastActivityDate: "2019-04-10",
        isNegative: true,
        bureau: "TRANSUNION",
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// CRS Credit API provider
// Docs: https://crscreditapi.com/documentation
// Env vars: CREDIT_PULL_CRS_API_KEY
// ---------------------------------------------------------------------------

async function pullCRS(
  identity: CreditPullIdentity
): Promise<CreditPullResult> {
  const apiKey = process.env.CREDIT_PULL_CRS_API_KEY;
  if (!apiKey) throw new Error("CREDIT_PULL_CRS_API_KEY is not configured");

  // TODO: Implement CRS Credit API integration
  // Reference: https://crscreditapi.com/documentation
  // Endpoint: POST https://api.crscreditapi.com/v1/reports/soft-pull
  // Headers: { "X-API-Key": apiKey, "Content-Type": "application/json" }
  // Body: { firstName, lastName, dob, ssn, address, city, state, zip }
  //
  // Map response.tradelines to CreditTradeline[]
  // Map response.scores.vantage to vantageScore
  throw new Error(
    "CRS Credit API provider not yet implemented. See credit-pull.ts for integration instructions."
  );
}

// ---------------------------------------------------------------------------
// Bloom Credit provider
// Docs: https://developers.bloomcredit.io
// Env vars: BLOOM_CREDIT_CLIENT_ID, BLOOM_CREDIT_CLIENT_SECRET
// ---------------------------------------------------------------------------

async function pullBloom(
  identity: CreditPullIdentity
): Promise<CreditPullResult> {
  const clientId = process.env.BLOOM_CREDIT_CLIENT_ID;
  const clientSecret = process.env.BLOOM_CREDIT_CLIENT_SECRET;
  if (!clientId || !clientSecret)
    throw new Error(
      "BLOOM_CREDIT_CLIENT_ID and BLOOM_CREDIT_CLIENT_SECRET are not configured"
    );

  // TODO: Implement Bloom Credit integration
  // Step 1 — OAuth2 token exchange:
  //   POST https://api.bloomcredit.io/auth/token
  //   body: { client_id, client_secret, grant_type: "client_credentials" }
  //
  // Step 2 — Pull report:
  //   POST https://api.bloomcredit.io/data/v1/consumer/report
  //   Headers: { Authorization: "Bearer <token>" }
  //   body: { consumer: { first_name, last_name, ssn, dob, address... } }
  //   skus: ["equifax-bronze-soft-vantage-internet", ...] or tri-merge equivalent
  //
  // Map response to CreditPullResult
  throw new Error(
    "Bloom Credit provider not yet implemented. See credit-pull.ts for integration instructions."
  );
}

// ---------------------------------------------------------------------------
// Soft Pull Solutions provider
// Docs: https://softpullsolutions.com/api
// Env vars: CREDIT_PULL_SPS_API_KEY
// ---------------------------------------------------------------------------

async function pullSoftPullSolutions(
  identity: CreditPullIdentity
): Promise<CreditPullResult> {
  const apiKey = process.env.CREDIT_PULL_SPS_API_KEY;
  if (!apiKey)
    throw new Error("CREDIT_PULL_SPS_API_KEY is not configured");

  // TODO: Implement Soft Pull Solutions integration
  // Reference: https://softpullsolutions.com/api-documentation
  throw new Error(
    "Soft Pull Solutions provider not yet implemented. See credit-pull.ts for integration instructions."
  );
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

/**
 * Pull a consumer credit report for the given identity.
 *
 * SECURITY: The SSN in `identity` is used for the API call only and must
 * NEVER be logged, written to a database, or included in error messages.
 * The caller is responsible for clearing the SSN from memory after calling
 * this function.
 *
 * @param identity - Consumer PII needed for identity verification
 * @param consentId - Firestore ID of the user's active FCRA consent record
 */
export async function pullCreditReport(
  identity: CreditPullIdentity,
  consentId: string
): Promise<CreditPullResult> {
  const provider = (process.env.CREDIT_PULL_PROVIDER || "stub") as CreditPullProvider;

  // Log the pull attempt (without any PII or SSN)
  console.log(
    `[credit-pull] Initiating ${provider} soft pull. consentId=${consentId}`
  );

  switch (provider) {
    case "crs":
      return pullCRS(identity);
    case "bloom":
      return pullBloom(identity);
    case "softpull":
      return pullSoftPullSolutions(identity);
    case "stub":
    default:
      return pullStub(identity);
  }
}

/**
 * Map a raw tradeline from a credit pull to the dispute reason string
 * used in the dispute letter generation flow.
 */
export function tradelineToDisputeReason(tradeline: CreditTradeline): string {
  if (tradeline.accountType === "Medical Collection") {
    return "Medical collection — verify HIPAA compliance and insurance coverage";
  }
  if (tradeline.accountType === "Collection") {
    return "Collection account — demand validation of original signed agreement and complete chain of assignment";
  }
  if (tradeline.latePayments && tradeline.latePayments.length > 0) {
    return "Late payment reported — verify accuracy of payment dates and creditor reporting";
  }
  if (tradeline.balance && tradeline.creditLimit) {
    return "Inaccurate balance or account status — request verification of all reported information";
  }
  return "Information is inaccurate or unverifiable — request full investigation under FCRA § 611";
}
