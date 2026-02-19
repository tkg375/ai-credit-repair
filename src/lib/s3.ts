import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const bucket = process.env.S3_BUCKET!;

let s3Client: S3Client | null = null;

async function getS3Client(): Promise<S3Client> {
  if (s3Client) return s3Client;

  // Discover the bucket's actual region via an unauthenticated HEAD request
  // so presigned URLs are signed for the right region regardless of S3_REGION
  let region = process.env.S3_REGION || "us-east-1";
  try {
    const res = await fetch(`https://s3.amazonaws.com/${bucket}`, { method: "HEAD" });
    const detected = res.headers.get("x-amz-bucket-region");
    if (detected) region = detected;
  } catch {
    // fall back to configured region
  }

  s3Client = new S3Client({
    region,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    },
  });
  return s3Client;
}

/** Get a pre-signed URL for a client to PUT an object directly to S3 (5 min expiry) */
export async function getUploadUrl(
  key: string,
  contentType = "application/pdf"
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(await getS3Client(), command, { expiresIn: 300 });
}

/** Get a pre-signed URL for downloading/viewing an object (1 hour expiry) */
export async function getDownloadUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  return getSignedUrl(await getS3Client(), command, { expiresIn: 3600 });
}

/** Read an object's bytes from S3 server-side */
export async function getObject(key: string): Promise<Uint8Array> {
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  const response = await (await getS3Client()).send(command);
  if (!response.Body) throw new Error("No body returned from S3");
  return response.Body.transformToByteArray();
}

/** Upload bytes to S3 server-side */
export async function putObject(
  key: string,
  data: Buffer | Uint8Array,
  contentType = "application/pdf"
): Promise<void> {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: data,
    ContentType: contentType,
  });
  await (await getS3Client()).send(command);
}

/** Delete an object from S3 */
export async function deleteObject(key: string): Promise<void> {
  const command = new DeleteObjectCommand({ Bucket: bucket, Key: key });
  await (await getS3Client()).send(command);
}
