/**
 * Applies the required CORS policy to the S3 bucket so the browser
 * can PUT files directly from credit-800.com.
 *
 * Run: node scripts/fix-s3-cors.mjs
 */

import { S3Client, PutBucketCorsCommand, GetBucketCorsCommand, GetBucketLocationCommand } from '@aws-sdk/client-s3';

// Prefer admin creds for bucket-level operations; fall back to app creds
const ACCESS_KEY_ID = process.env.AWS_ADMIN_KEY_ID || process.env.S3_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = process.env.AWS_ADMIN_SECRET_KEY || process.env.S3_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;
const BUCKETS = [...new Set([
  process.env.S3_BUCKET,
  process.env.AWS_S3_BUCKET,
  'reports',
  'ai-credit-repair-080772',
].filter(Boolean))];

if (!ACCESS_KEY_ID || !SECRET_ACCESS_KEY) {
  console.error('Set AWS_ADMIN_KEY_ID + AWS_ADMIN_SECRET_KEY (or S3_ACCESS_KEY_ID + S3_SECRET_ACCESS_KEY) before running.');
  process.exit(1);
}

function makeS3(region = 'us-east-1') {
  return new S3Client({
    region,
    credentials: { accessKeyId: ACCESS_KEY_ID, secretAccessKey: SECRET_ACCESS_KEY },
  });
}

async function getBucketRegion(bucket) {
  // Try us-east-1 first; the Location header tells us the real region
  const s3 = makeS3('us-east-1');
  try {
    const res = await s3.send(new GetBucketLocationCommand({ Bucket: bucket }));
    // us-east-1 returns null/empty, everything else returns the region name
    return res.LocationConstraint || 'us-east-1';
  } catch (err) {
    if (err.$metadata?.httpStatusCode === 301 || err.Code === 'PermanentRedirect') {
      // Extract region from the redirect endpoint header if available
      return err.$response?.headers?.['x-amz-bucket-region'] || 'us-east-1';
    }
    throw err;
  }
}

const CORS_CONFIG = {
  CORSRules: [{
    AllowedHeaders: ['*'],
    AllowedMethods: ['PUT', 'GET'],
    AllowedOrigins: ['https://credit-800.com'],
    ExposeHeaders: ['ETag'],
    MaxAgeSeconds: 3000,
  }],
};

async function applyCors(bucket) {
  console.log(`\n⏳ Applying CORS to bucket: ${bucket}`);
  try {
    const region = await getBucketRegion(bucket);
    console.log(`   Detected region: ${region}`);
    const s3 = makeS3(region);
    await s3.send(new PutBucketCorsCommand({ Bucket: bucket, CORSConfiguration: CORS_CONFIG }));
    const res = await s3.send(new GetBucketCorsCommand({ Bucket: bucket }));
    console.log(`✅ CORS applied to "${bucket}":`, JSON.stringify(res.CORSRules, null, 2));
    return true;
  } catch (err) {
    console.error(`❌ Failed for "${bucket}": ${err.Code || err.name} — ${err.message}`);
    return false;
  }
}

let anySuccess = false;
for (const bucket of BUCKETS) {
  const ok = await applyCors(bucket);
  if (ok) anySuccess = true;
}

if (!anySuccess) {
  console.log('\n⚠️  CORS could not be set with these credentials.');
  console.log('   The app IAM user likely lacks s3:PutBucketCors permission.');
  console.log('   Fix in the AWS Console → S3 → <bucket> → Permissions → CORS:');
  console.log(JSON.stringify(CORS_CONFIG.CORSRules, null, 2));
  process.exit(1);
}
