import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";

let _client: PlaidApi | null = null;

export function getPlaidClient(): PlaidApi {
  if (!_client) {
    const env = (process.env.PLAID_ENV ?? "sandbox") as keyof typeof PlaidEnvironments;
    _client = new PlaidApi(
      new Configuration({
        basePath: PlaidEnvironments[env],
        baseOptions: {
          headers: {
            "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID!,
            "PLAID-SECRET": process.env.PLAID_SECRET!,
          },
        },
      })
    );
  }
  return _client;
}
