import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["openai"],
  experimental: {
    serverActions: {
      bodySizeLimit: "25mb",
    },
  },
  env: {
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID ?? "",
    FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL ?? "",
    FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY ?? "",
    GEMINI_API_KEY: process.env.GEMINI_API_KEY ?? "",
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ?? "",
    S3_REGION: process.env.S3_REGION ?? "",
    S3_BUCKET: process.env.S3_BUCKET ?? "",
    S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID ?? "",
    S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY ?? "",
    LAMBDA_FUNCTION_NAME: process.env.LAMBDA_FUNCTION_NAME ?? "",
    LOB_API_KEY: process.env.LOB_API_KEY ?? "",
  },
};

export default nextConfig;
