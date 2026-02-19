/**
 * One-time AWS setup script for ai-credit-repair.
 * Creates: S3 bucket, Lambda IAM role, Lambda function, app IAM user.
 * Updates .env with all real values when complete.
 *
 * Run: node scripts/setup-aws.mjs
 */

import { STSClient, GetCallerIdentityCommand } from '@aws-sdk/client-sts';
import {
  S3Client,
  CreateBucketCommand,
  PutBucketCorsCommand,
  PutPublicAccessBlockCommand,
  HeadBucketCommand,
} from '@aws-sdk/client-s3';
import {
  IAMClient,
  CreateRoleCommand,
  AttachRolePolicyCommand,
  GetRoleCommand,
  CreatePolicyCommand,
  GetPolicyCommand,
  CreateUserCommand,
  GetUserCommand,
  AttachUserPolicyCommand,
  CreateAccessKeyCommand,
} from '@aws-sdk/client-iam';
import {
  LambdaClient,
  CreateFunctionCommand,
  GetFunctionCommand,
  UpdateFunctionCodeCommand,
  UpdateFunctionConfigurationCommand,
} from '@aws-sdk/client-lambda';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const REGION = 'us-east-1';
const LAMBDA_FUNCTION_NAME = 'analyze-report';
const LAMBDA_ROLE_NAME = 'analyze-report-lambda-role';
const LAMBDA_POLICY_NAME = 'analyze-report-s3-policy';
const APP_IAM_USER = 'ai-credit-repair-app';
const APP_IAM_POLICY = 'ai-credit-repair-app-policy';

// ── Credentials (admin — used only during setup) ─────────────────────────────
// Pass via environment: AWS_ADMIN_KEY_ID and AWS_ADMIN_SECRET_KEY
const ADMIN_KEY_ID = process.env.AWS_ADMIN_KEY_ID;
const ADMIN_SECRET  = process.env.AWS_ADMIN_SECRET_KEY;

if (!ADMIN_KEY_ID || !ADMIN_SECRET) {
  console.error('Set AWS_ADMIN_KEY_ID and AWS_ADMIN_SECRET_KEY before running.');
  process.exit(1);
}

const creds = { accessKeyId: ADMIN_KEY_ID, secretAccessKey: ADMIN_SECRET };

const sts    = new STSClient({ region: REGION, credentials: creds });
const s3     = new S3Client({ region: REGION, credentials: creds });
const iam    = new IAMClient({ region: 'us-east-1', credentials: creds }); // IAM is global
const lambda = new LambdaClient({ region: REGION, credentials: creds });

// ── .env parser ───────────────────────────────────────────────────────────────
function readEnv() {
  const raw = readFileSync(resolve(ROOT, '.env'), 'utf8');
  const env = {};
  for (const line of raw.split('\n')) {
    const match = line.match(/^([A-Z0-9_]+)\s*=\s*"([\s\S]*?)"\s*$/);
    if (match) env[match[1]] = match[2];
    else {
      const plain = line.match(/^([A-Z0-9_]+)\s*=\s*(\S+)\s*$/);
      if (plain) env[plain[1]] = plain[2];
    }
  }
  return env;
}

function updateEnvValue(key, value) {
  const envPath = resolve(ROOT, '.env');
  let content = readFileSync(envPath, 'utf8');
  // Replace quoted value
  const quotedRe = new RegExp(`^(${key}\\s*=\\s*)"[^"]*"`, 'm');
  if (quotedRe.test(content)) {
    content = content.replace(quotedRe, `$1"${value}"`);
  } else {
    // Replace unquoted value or append
    const unquotedRe = new RegExp(`^(${key}\\s*=\\s*)\\S+`, 'm');
    if (unquotedRe.test(content)) {
      content = content.replace(unquotedRe, `$1"${value}"`);
    } else {
      content += `\n${key}="${value}"`;
    }
  }
  writeFileSync(envPath, content);
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function log(msg)  { console.log(`\n✅ ${msg}`); }
function step(msg) { console.log(`\n⏳ ${msg}...`); }
function warn(msg) { console.log(`\n⚠️  ${msg}`); }

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🚀 Starting AWS setup for ai-credit-repair\n');

  // 1. Get account ID
  step('Getting AWS account info');
  const identity = await sts.send(new GetCallerIdentityCommand({}));
  const accountId = identity.Account;
  log(`Account: ${accountId}`);

  // 2. S3 bucket
  const bucketName = `ai-credit-repair-${accountId.slice(-6)}`;
  step(`Creating S3 bucket: ${bucketName}`);

  let bucketExists = false;
  try {
    await s3.send(new HeadBucketCommand({ Bucket: bucketName }));
    bucketExists = true;
    warn('Bucket already exists — skipping creation');
  } catch {
    // Bucket doesn't exist, create it
  }

  if (!bucketExists) {
    // us-east-1 must NOT have LocationConstraint
    await s3.send(new CreateBucketCommand({ Bucket: bucketName }));
    log(`Bucket created: ${bucketName}`);
  }

  // Block all public access
  await s3.send(new PutPublicAccessBlockCommand({
    Bucket: bucketName,
    PublicAccessBlockConfiguration: {
      BlockPublicAcls: true,
      IgnorePublicAcls: true,
      BlockPublicPolicy: true,
      RestrictPublicBuckets: true,
    },
  }));

  // Set CORS (allows browser PUT for direct S3 uploads)
  await s3.send(new PutBucketCorsCommand({
    Bucket: bucketName,
    CORSConfiguration: {
      CORSRules: [{
        AllowedHeaders: ['*'],
        AllowedMethods: ['PUT', 'GET'],
        AllowedOrigins: ['*'],
        ExposeHeaders: ['ETag'],
        MaxAgeSeconds: 3000,
      }],
    },
  }));
  log('Bucket CORS configured');

  // 3. IAM role for Lambda
  step(`Creating Lambda execution role: ${LAMBDA_ROLE_NAME}`);
  let lambdaRoleArn;

  try {
    const existing = await iam.send(new GetRoleCommand({ RoleName: LAMBDA_ROLE_NAME }));
    lambdaRoleArn = existing.Role.Arn;
    warn('Lambda role already exists — skipping creation');
  } catch {
    const role = await iam.send(new CreateRoleCommand({
      RoleName: LAMBDA_ROLE_NAME,
      AssumeRolePolicyDocument: JSON.stringify({
        Version: '2012-10-17',
        Statement: [{
          Effect: 'Allow',
          Principal: { Service: 'lambda.amazonaws.com' },
          Action: 'sts:AssumeRole',
        }],
      }),
      Description: 'Execution role for ai-credit-repair analyze-report Lambda',
    }));
    lambdaRoleArn = role.Role.Arn;
    log(`Lambda role created: ${lambdaRoleArn}`);

    // Attach basic execution (CloudWatch logs)
    await iam.send(new AttachRolePolicyCommand({
      RoleName: LAMBDA_ROLE_NAME,
      PolicyArn: 'arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole',
    }));
  }

  // Create/attach S3 read policy for Lambda
  const lambdaPolicyArn = `arn:aws:iam::${accountId}:policy/${LAMBDA_POLICY_NAME}`;
  try {
    await iam.send(new GetPolicyCommand({ PolicyArn: lambdaPolicyArn }));
    warn('Lambda S3 policy already exists — skipping');
  } catch {
    await iam.send(new CreatePolicyCommand({
      PolicyName: LAMBDA_POLICY_NAME,
      PolicyDocument: JSON.stringify({
        Version: '2012-10-17',
        Statement: [{
          Effect: 'Allow',
          Action: ['s3:GetObject'],
          Resource: `arn:aws:s3:::${bucketName}/*`,
        }],
      }),
    }));
    await iam.send(new AttachRolePolicyCommand({
      RoleName: LAMBDA_ROLE_NAME,
      PolicyArn: lambdaPolicyArn,
    }));
    log('Lambda S3 read policy attached');
  }

  // Wait for IAM propagation
  step('Waiting 12s for IAM role propagation');
  await sleep(12000);

  // 4. Build Lambda ZIP
  step('Building Lambda deployment package');
  const lambdaDir = resolve(ROOT, 'lambda', 'analyze-report');
  execSync('npm install --omit=dev', { cwd: lambdaDir, stdio: 'inherit' });
  const zipPath = resolve(ROOT, 'lambda', 'analyze-report.zip');
  execSync(`cd "${lambdaDir}" && zip -r "${zipPath}" . --exclude "*.DS_Store"`, { stdio: 'inherit' });
  log(`Lambda ZIP built: ${zipPath}`);

  const zipBytes = readFileSync(zipPath);

  // 5. Read env vars for Lambda configuration
  const env = readEnv();
  const lambdaEnvVars = {
    FIREBASE_PROJECT_ID:    env.FIREBASE_PROJECT_ID    || '',
    FIREBASE_CLIENT_EMAIL:  env.FIREBASE_CLIENT_EMAIL  || '',
    FIREBASE_PRIVATE_KEY:   env.FIREBASE_PRIVATE_KEY   || '',
    GEMINI_API_KEY:         env.GEMINI_API_KEY         || '',
    ANTHROPIC_API_KEY:      env.ANTHROPIC_API_KEY      || '',
    AWS_S3_BUCKET:          bucketName,
    AWS_REGION_CONFIG:      REGION,
  };

  // 6. Create or update Lambda function
  step(`Deploying Lambda function: ${LAMBDA_FUNCTION_NAME}`);
  let functionExists = false;
  try {
    await lambda.send(new GetFunctionCommand({ FunctionName: LAMBDA_FUNCTION_NAME }));
    functionExists = true;
  } catch { /* not found */ }

  if (functionExists) {
    warn('Lambda function exists — updating code + config');
    await lambda.send(new UpdateFunctionCodeCommand({
      FunctionName: LAMBDA_FUNCTION_NAME,
      ZipFile: zipBytes,
    }));
    // Wait for update to complete
    await sleep(3000);
    await lambda.send(new UpdateFunctionConfigurationCommand({
      FunctionName: LAMBDA_FUNCTION_NAME,
      Timeout: 600,
      MemorySize: 512,
      Environment: { Variables: lambdaEnvVars },
    }));
  } else {
    await lambda.send(new CreateFunctionCommand({
      FunctionName: LAMBDA_FUNCTION_NAME,
      Runtime: 'nodejs20.x',
      Role: lambdaRoleArn,
      Handler: 'index.handler',
      Code: { ZipFile: zipBytes },
      Timeout: 600,
      MemorySize: 512,
      Description: 'Background credit report analysis with Gemini/Claude',
      Environment: { Variables: lambdaEnvVars },
    }));
  }
  log(`Lambda function deployed: ${LAMBDA_FUNCTION_NAME}`);

  // 7. Create limited IAM user for the app (minimal permissions)
  step(`Creating app IAM user: ${APP_IAM_USER}`);
  let appKeyId, appSecretKey;

  try {
    await iam.send(new GetUserCommand({ UserName: APP_IAM_USER }));
    warn('App IAM user already exists — skipping user creation (keeping existing credentials in .env)');
  } catch {
    await iam.send(new CreateUserCommand({ UserName: APP_IAM_USER }));

    // Create minimal policy: S3 CRUD + Lambda invoke
    const appPolicyArn = `arn:aws:iam::${accountId}:policy/${APP_IAM_POLICY}`;
    let policyExists = false;
    try {
      await iam.send(new GetPolicyCommand({ PolicyArn: appPolicyArn }));
      policyExists = true;
    } catch { /* not found */ }

    if (!policyExists) {
      await iam.send(new CreatePolicyCommand({
        PolicyName: APP_IAM_POLICY,
        PolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Action: ['s3:GetObject', 's3:PutObject', 's3:DeleteObject'],
              Resource: `arn:aws:s3:::${bucketName}/*`,
            },
            {
              Effect: 'Allow',
              Action: ['lambda:InvokeFunction'],
              Resource: `arn:aws:lambda:${REGION}:${accountId}:function:${LAMBDA_FUNCTION_NAME}`,
            },
          ],
        }),
      }));
    }

    await iam.send(new AttachUserPolicyCommand({
      UserName: APP_IAM_USER,
      PolicyArn: appPolicyArn,
    }));

    // Create access key for the app user
    const keyRes = await iam.send(new CreateAccessKeyCommand({ UserName: APP_IAM_USER }));
    appKeyId    = keyRes.AccessKey.AccessKeyId;
    appSecretKey = keyRes.AccessKey.SecretAccessKey;
    log(`App IAM user created with minimal permissions`);
  }

  // 8. Update .env with real values
  step('Updating .env');
  updateEnvValue('AWS_S3_BUCKET', bucketName);
  updateEnvValue('LAMBDA_FUNCTION_NAME', LAMBDA_FUNCTION_NAME);
  updateEnvValue('AWS_REGION', REGION);
  if (appKeyId) {
    updateEnvValue('AWS_ACCESS_KEY_ID', appKeyId);
    updateEnvValue('AWS_SECRET_ACCESS_KEY', appSecretKey);
  }
  log('.env updated');

  // 9. Summary
  console.log('\n' + '─'.repeat(60));
  console.log('🎉  AWS setup complete!\n');
  console.log(`  S3 Bucket:        ${bucketName}`);
  console.log(`  Lambda function:  ${LAMBDA_FUNCTION_NAME}  (${REGION})`);
  console.log(`  Lambda timeout:   600s / 512MB`);
  if (appKeyId) {
    console.log(`  App IAM user:     ${APP_IAM_USER}`);
    console.log(`  App key ID:       ${appKeyId}`);
  }
  console.log('\n  .env has been updated with all values.');
  if (!env.GEMINI_API_KEY || env.GEMINI_API_KEY === 'your-gemini-api-key-here') {
    console.log('\n  ⚠️  GEMINI_API_KEY is still a placeholder in .env');
    console.log('     Add your Gemini key and re-run to update the Lambda.');
  }
  console.log('─'.repeat(60) + '\n');
}

main().catch(err => {
  console.error('\n❌ Setup failed:', err.message || err);
  process.exit(1);
});
