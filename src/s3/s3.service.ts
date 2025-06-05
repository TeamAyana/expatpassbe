import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';

@Injectable()
export class S3Service {
  private readonly s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.ACCESS_KEY_ID!,
      secretAccessKey: process.env.ACCESS_KEY_SECRET!,
    },
  });

  async uploadFile(fileName: string, file: Buffer) {
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: fileName,
        Body: file,
      }),
    );
  }
}
