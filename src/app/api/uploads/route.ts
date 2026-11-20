import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getStorageProvider } from "@/lib/storage";
import { isValidImageType, isValidImageSize, ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE } from "@/lib/utils";
import prisma from "@/lib/db";

/**
 * POST /api/uploads — Upload an image file
 * Returns an image ID that can be referenced when creating a complaint.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate MIME type
    if (!isValidImageType(file.type)) {
      return NextResponse.json(
        {
          error: `Invalid file type. Allowed types: ${ALLOWED_IMAGE_TYPES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (!isValidImageSize(file.size)) {
      return NextResponse.json(
        {
          error: `File size exceeds the maximum limit of ${MAX_IMAGE_SIZE / 1024 / 1024}MB`,
        },
        { status: 400 }
      );
    }

    // Read file buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Verify file magic bytes (content-based validation)
    const isValidContent = verifyImageMagicBytes(buffer, file.type);
    if (!isValidContent) {
      return NextResponse.json(
        { error: "File content does not match the declared type" },
        { status: 400 }
      );
    }

    // Upload to storage provider
    const storage = getStorageProvider();
    const result = await storage.upload(buffer, file.name, file.type);

    // Create image record (not yet linked to a complaint)
    const image = await prisma.complaintImage.create({
      data: {
        complaintId: "", // Temporary — will be linked on complaint creation
        storageKey: result.key,
        storageProvider: result.provider,
        originalName: file.name,
        mimeType: file.type,
        sizeBytes: result.sizeBytes,
      },
    });

    return NextResponse.json(
      {
        data: {
          id: image.id,
          url: result.url,
          originalName: file.name,
          sizeBytes: result.sizeBytes,
        },
        message: "File uploaded successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Upload failed. Please try again." },
      { status: 500 }
    );
  }
}

/**
 * Verify file content matches declared MIME type by checking magic bytes.
 */
function verifyImageMagicBytes(buffer: Buffer, mimeType: string): boolean {
  if (buffer.length < 4) return false;

  const signatures: Record<string, number[][]> = {
    "image/jpeg": [[0xff, 0xd8, 0xff]],
    "image/png": [[0x89, 0x50, 0x4e, 0x47]],
    "image/gif": [
      [0x47, 0x49, 0x46, 0x38], // GIF8
    ],
    "image/webp": [], // RIFF....WEBP — check separately
  };

  if (mimeType === "image/webp") {
    // RIFF header + WEBP
    return (
      buffer.length >= 12 &&
      buffer[0] === 0x52 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x46 &&
      buffer[8] === 0x57 &&
      buffer[9] === 0x45 &&
      buffer[10] === 0x42 &&
      buffer[11] === 0x50
    );
  }

  const sigs = signatures[mimeType];
  if (!sigs || sigs.length === 0) return true; // Unknown type — allow

  return sigs.some((sig) =>
    sig.every((byte, index) => buffer[index] === byte)
  );
}
