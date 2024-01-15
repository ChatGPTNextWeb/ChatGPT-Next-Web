import {
  S3Client,
  ListBucketsCommand,
  ListObjectsV2Command,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET = process.env.R2_BUCKET;

const S3_ENDPOINT = process.env.S3_ENDPOINT;
const S3_ACCESS_KEY_ID = process.env.S3_ACCESS_KEY_ID;
const S3_SECRET_ACCESS_KEY = process.env.S3_SECRET_ACCESS_KEY;
const S3_BUCKET = process.env.S3_BUCKET;

const getR2Client = () => {
  return new S3Client({
    region: "auto",
    endpoint:
      S3_ENDPOINT ?? `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: S3_ACCESS_KEY_ID ?? R2_ACCESS_KEY_ID!,
      secretAccessKey: S3_SECRET_ACCESS_KEY ?? R2_SECRET_ACCESS_KEY!,
    },
  });
};

export default class S3FileStorage {
  static async get(fileName: string) {
    const file = await getR2Client().send(
      new GetObjectCommand({
        Bucket: S3_BUCKET ?? R2_BUCKET,
        Key: fileName,
      }),
    );

    if (!file) {
      throw new Error("not found.");
    }

    return file.Body;
  }

  static async put(fileName: string, data: Buffer) {
    const signedUrl = await getSignedUrl(
      getR2Client(),
      new PutObjectCommand({
        Bucket: S3_BUCKET ?? R2_BUCKET,
        Key: fileName,
      }),
      { expiresIn: 60 },
    );

    console.log("[S3]", signedUrl);

    try {
      await fetch(signedUrl, {
        method: "PUT",
        body: data,
      });

      return `/api/file/${fileName}`;
    } catch (e) {
      console.error("[S3]", e);
      throw e;
    }
  }
}
