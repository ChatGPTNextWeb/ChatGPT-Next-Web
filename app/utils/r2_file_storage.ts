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

const getR2Client = () => {
  return new S3Client({
    region: "auto",
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID!,
      secretAccessKey: R2_SECRET_ACCESS_KEY!,
    },
  });
};

export default class S3FileStorage {
  static async get(fileName: string) {
    const file = await getR2Client().send(
      new GetObjectCommand({
        Bucket: R2_BUCKET,
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
        Bucket: R2_BUCKET,
        Key: fileName,
      }),
      { expiresIn: 60 },
    );

    console.log(signedUrl);

    await fetch(signedUrl, {
      method: "PUT",
      body: data,
    });

    return `/api/file/${fileName}`;
  }
}
