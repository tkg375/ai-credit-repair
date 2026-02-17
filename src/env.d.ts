// Cloudflare Workers environment types

interface CloudflareEnv {
  ASSETS: Fetcher;
  FIREBASE_PROJECT_ID: string;
  FIREBASE_CLIENT_EMAIL: string;
  CREDIT_REPORTS_BUCKET: R2Bucket;
  GEMINI_API_KEY: string;
}

declare module "@opennextjs/cloudflare" {
  export function defineCloudflareConfig(): unknown;
  export function getCloudflareContext(): Promise<{
    env: CloudflareEnv;
    ctx: ExecutionContext;
  }>;
}
