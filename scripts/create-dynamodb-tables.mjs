/**
 * create-dynamodb-tables.mjs
 *
 * Run once to provision all DynamoDB tables needed by the app.
 *
 * Usage:
 *   AWS_REGION=us-east-1 \
 *   AWS_ACCESS_KEY_ID=xxx \
 *   AWS_SECRET_ACCESS_KEY=xxx \
 *   DYNAMODB_TABLE_PREFIX=credit800 \
 *   node scripts/create-dynamodb-tables.mjs
 */

import { DynamoDBClient, CreateTableCommand, ListTablesCommand, DescribeTableCommand } from "@aws-sdk/client-dynamodb";

const region = process.env.AWS_REGION || "us-east-1";
const prefix = process.env.DYNAMODB_TABLE_PREFIX || "credit800";

const client = new DynamoDBClient({
  region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function tableExists(name) {
  try {
    await client.send(new DescribeTableCommand({ TableName: name }));
    return true;
  } catch {
    return false;
  }
}

async function createTable(params) {
  const name = params.TableName;
  if (await tableExists(name)) {
    console.log(`  ✓ ${name} (already exists)`);
    return;
  }
  await client.send(new CreateTableCommand(params));
  console.log(`  ✓ ${name} (created)`);
}

// Standard table: PK = id, GSI by-userId
function standardTable(collection) {
  return {
    TableName: `${prefix}-${collection}`,
    BillingMode: "PAY_PER_REQUEST",
    AttributeDefinitions: [
      { AttributeName: "id", AttributeType: "S" },
      { AttributeName: "userId", AttributeType: "S" },
    ],
    KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
    GlobalSecondaryIndexes: [
      {
        IndexName: "by-userId",
        KeySchema: [{ AttributeName: "userId", KeyType: "HASH" }],
        Projection: { ProjectionType: "ALL" },
      },
    ],
  };
}

async function main() {
  console.log(`\nCreating DynamoDB tables with prefix "${prefix}" in ${region}...\n`);

  // Users table — PK = id (userId), GSI by-email for login lookup
  await createTable({
    TableName: `${prefix}-users`,
    BillingMode: "PAY_PER_REQUEST",
    AttributeDefinitions: [
      { AttributeName: "id", AttributeType: "S" },
      { AttributeName: "email", AttributeType: "S" },
    ],
    KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
    GlobalSecondaryIndexes: [
      {
        IndexName: "by-email",
        KeySchema: [{ AttributeName: "email", KeyType: "HASH" }],
        Projection: { ProjectionType: "ALL" },
      },
    ],
  });

  // Referrals table — PK = id, GSI by-referralCode
  await createTable({
    TableName: `${prefix}-referrals`,
    BillingMode: "PAY_PER_REQUEST",
    AttributeDefinitions: [
      { AttributeName: "id", AttributeType: "S" },
      { AttributeName: "referralCode", AttributeType: "S" },
    ],
    KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
    GlobalSecondaryIndexes: [
      {
        IndexName: "by-referralCode",
        KeySchema: [{ AttributeName: "referralCode", KeyType: "HASH" }],
        Projection: { ProjectionType: "ALL" },
      },
    ],
  });

  // All other collections — standard table with by-userId GSI
  const standardCollections = [
    "creditReports",
    "reportItems",
    "disputes",
    "creditScores",
    "actionPlans",
    "reportChanges",
    "notifications",
    "portfolioAccounts",
    "portfolioSnapshots",
    "plaidItems",
    "budgetEntries",
    "goals",
    "creditFreezes",
    "creditorLetters",
    "autopilotRuns",
    "fcraConsents",
    "auditLogs",
    "autopilotWaitlist",
    "documents",
  ];

  for (const collection of standardCollections) {
    await createTable(standardTable(collection));
  }

  console.log("\nAll tables ready.\n");
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
