import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { deleteOldImage } from "@/lib/profile";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const oldImage = (formData.get("oldImage") as string) || "";
    const prefix = (formData.get("prefix") as string) || "img";

    if (!file) {
      return NextResponse.json(
        { success: false, message: "لم يتم اختيار أي صورة" },
        { status: 400 }
      );
    }

    const extension = path.extname(file.name) || ".png";
    const filename = `${prefix}-${Date.now()}${extension}`;

    // 1. If Vercel Blob is configured (BLOB_READ_WRITE_TOKEN is set)
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const { put } = await import("@vercel/blob");
        const blob = await put(`uploads/${filename}`, file, {
          access: "public",
        });

        return NextResponse.json({
          success: true,
          url: blob.url,
          dataUrl: blob.url,
          storageType: "vercel-blob",
          message: "✓ تم رفع الصورة وحفظها بنجاح في التخزين السحابي العالمي Vercel Blob",
        });
      } catch (blobErr) {
        console.warn("Vercel Blob upload failed, falling back to local/base64:", blobErr);
      }
    }

    // 2. Prepare Buffer & Base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const mimeType = file.type || "image/png";
    const base64Data = buffer.toString("base64");
    const dataUrl = `data:${mimeType};base64,${base64Data}`;

    // 3. Try saving to public/uploads directory if running on local machine
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    let relativeUrl = dataUrl;
    let savedToDisk = false;

    try {
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      if (oldImage && oldImage.startsWith("/uploads/")) {
        await deleteOldImage(oldImage);
      }

      const filePath = path.join(uploadsDir, filename);
      await fs.promises.writeFile(filePath, buffer);
      relativeUrl = `/uploads/${filename}`;
      savedToDisk = true;
    } catch (diskErr) {
      console.warn("Could not write to local disk (Vercel serverless read-only), using base64 data URL", diskErr);
    }

    return NextResponse.json({
      success: true,
      url: relativeUrl,
      dataUrl,
      savedToDisk,
      storageType: savedToDisk ? "local-disk" : "base64",
      message: savedToDisk
        ? "✓ تم حفظ الصورة بنجاح على القرص المحلي"
        : "✓ تم تحويل الصورة بنجاح كصورة سحابية مدمجة",
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { success: false, message: error.message || "فشل تحميل الصورة" },
      { status: 500 }
    );
  }
}
