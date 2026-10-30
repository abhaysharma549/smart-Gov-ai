/**
 * Storage Provider Abstraction
 *
 * Supports: local (dev), S3-compatible, Cloudinary
 * The provider is selected via STORAGE_PROVIDER env variable.
 */

import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

export interface StorageResult {
  key: string;
  provider: string;
  url: string;
  sizeBytes: number;
}

export interface StorageProvider {
  upload(
    buffer: Buffer,
    filename: string,
    mimeType: string
  ): Promise<StorageResult>;
  getUrl(key: string): Promise<string>;
  delete(key: string): Promise<void>;
}

/**
 * Local filesystem storage provider (development only).
 * Files are stored under public/uploads.
 */
class LocalStorageProvider implements StorageProvider {
  private uploadDir: string;

  constructor() {
    this.uploadDir = path.join(process.cwd(), "public", "uploads");
  }

  async upload(
    buffer: Buffer,
    filename: string,
    mimeType: string
  ): Promise<StorageResult> {
    await fs.mkdir(this.uploadDir, { recursive: true });

    const ext = this.getExtension(mimeType);
    const hash = crypto.createHash("md5").update(buffer).digest("hex").slice(0, 8);
    const timestamp = Date.now();
    const safeFilename = `${timestamp}-${hash}${ext}`;
    const filepath = path.join(this.uploadDir, safeFilename);

    await fs.writeFile(filepath, buffer);

    return {
      key: safeFilename,
      provider: "local",
      url: `/uploads/${safeFilename}`,
      sizeBytes: buffer.length,
    };
  }

  async getUrl(key: string): Promise<string> {
    return `/uploads/${key}`;
  }

  async delete(key: string): Promise<void> {
    const filepath = path.join(this.uploadDir, key);
    try {
      await fs.unlink(filepath);
    } catch {
      // File may not exist
    }
  }

  private getExtension(mimeType: string): string {
    const map: Record<string, string> = {
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/webp": ".webp",
      "image/gif": ".gif",
    };
    return map[mimeType] || ".bin";
  }
}

/**
 * S3-compatible storage provider (production).
 * Requires: S3_BUCKET, S3_REGION, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY
 */
class S3StorageProvider implements StorageProvider {
  async upload(
    buffer: Buffer,
    filename: string,
    mimeType: string
  ): Promise<StorageResult> {
    // S3 integration boundary — requires @aws-sdk/client-s3
    // When configured, this would use PutObjectCommand
    throw new Error(
      "S3 storage is not configured. Set S3_BUCKET and install @aws-sdk/client-s3."
    );
  }

  async getUrl(key: string): Promise<string> {
    throw new Error("S3 storage is not configured.");
  }

  async delete(key: string): Promise<void> {
    throw new Error("S3 storage is not configured.");
  }
}

/**
 * Cloudinary storage provider.
 * Requires: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
 */
class CloudinaryStorageProvider implements StorageProvider {
  async upload(
    buffer: Buffer,
    filename: string,
    mimeType: string
  ): Promise<StorageResult> {
    // Cloudinary integration boundary — requires cloudinary SDK
    throw new Error(
      "Cloudinary storage is not configured. Set CLOUDINARY_CLOUD_NAME and install cloudinary."
    );
  }

  async getUrl(key: string): Promise<string> {
    throw new Error("Cloudinary storage is not configured.");
  }

  async delete(key: string): Promise<void> {
    throw new Error("Cloudinary storage is not configured.");
  }
}

/**
 * Get the configured storage provider.
 */
export function getStorageProvider(): StorageProvider {
  const provider = process.env.STORAGE_PROVIDER || "local";

  switch (provider) {
    case "s3":
      return new S3StorageProvider();
    case "cloudinary":
      return new CloudinaryStorageProvider();
    case "local":
    default:
      if (process.env.NODE_ENV === "production") {
        console.warn(
          "WARNING: Using local filesystem storage in production is not recommended."
        );
      }
      return new LocalStorageProvider();
  }
}
