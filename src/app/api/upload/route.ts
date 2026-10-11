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

    if (!file) {
      return NextResponse.json(
        { success: false, message: "لم يتم اختيار أي صورة" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Prepare Base64 data url as a universal fallback (ideal for Vercel JSON persistence)
    const mimeType = file.type || "image/png";
    const base64Data = buffer.toString("base64");
    const dataUrl = `data:${mimeType};base64,${base64Data}`;

    // Try saving to public/uploads directory if filesystem is writable
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    let relativeUrl = dataUrl;
    let savedToDisk = false;

    try {
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      // Delete old image if provided and exists
      if (oldImage && oldImage.startsWith("/uploads/")) {
        await deleteOldImage(oldImage);
      }

      const prefix = (formData.get("prefix") as string) || "img";
      const extension = path.extname(file.name) || ".png";
      const filename = `${prefix}-${Date.now()}${extension}`;
      const filePath = path.join(uploadsDir, filename);

      await fs.promises.writeFile(filePath, buffer);
      relativeUrl = `/uploads/${filename}`;
      savedToDisk = true;
    } catch (diskErr) {
      console.warn("Could not save to disk (serverless read-only), using base64 data URL fallback", diskErr);
    }

    return NextResponse.json({
      success: true,
      url: relativeUrl,
      dataUrl,
      savedToDisk,
      message: savedToDisk
        ? "تم رفع الصورة وحفظها بنجاح وحذف الصورة السابقة"
        : "تم تحويل الصورة وحفظها بنجاح",
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { success: false, message: error.message || "فشل تحميل الصورة" },
      { status: 500 }
    );
  }
}
