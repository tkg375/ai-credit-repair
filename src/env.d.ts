// Cloudflare Workers environment types

interface CloudflareEnv {
  ASSETS: Fetcher;
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
