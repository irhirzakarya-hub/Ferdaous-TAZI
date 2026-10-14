import { NextResponse } from "next/server";
import { getProfile, saveProfile, getStorageCapabilities } from "@/lib/profile";
import { ProfileData } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const profile = await getProfile();
  const capabilities = getStorageCapabilities();
  return NextResponse.json(
    {
      ...profile,
      _storageCapabilities: capabilities,
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}

export async function POST(req: Request) {
  try {
    const body: ProfileData & { _githubToken?: string } = await req.json();

    if (!body || !body.businessName) {
      return NextResponse.json(
        { success: false, message: "بيانات غير صالحة" },
        { status: 400 }
      );
    }

    const githubToken = body._githubToken || req.headers.get("x-github-token") || undefined;
    const cleanBody = { ...body };
    delete cleanBody._githubToken;

    const result = await saveProfile(cleanBody, { githubToken });
    const capabilities = getStorageCapabilities();

    let userMsg = "✓ تم حفظ التعديلات بنجاح في ملف profile.json";
    if (result.storageType === "vercel-kv") {
      userMsg = "✓ تم الحفظ السحابي في Vercel KV وتحديث جميع الأجهزة فوراً!";
    } else if (result.storageType === "vercel-blob") {
      userMsg = "✓ تم الحفظ السحابي في Vercel Blob وتحديث جميع الأجهزة فوراً!";
    } else if (result.storageType === "github") {
      userMsg = "✓ تم حفظ التعديلات وإرسال Commit تلقائي إلى GitHub لمزامنة جميع الأجهزة!";
    } else if (result.isReadOnly) {
      userMsg = "تم الحفظ محلياً في الجلسة. لتحديث باقي الأجهزة تلقائياً، قم بتفعيل Vercel Storage بضغطة زر واحدة.";
    }

    return NextResponse.json({
      success: true,
      profile: cleanBody,
      isReadOnly: result.isReadOnly,
      storageType: result.storageType,
      capabilities,
      message: userMsg,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { success: false, message: error.message || "حدث خطأ أثناء الحفظ" },
      { status: 500 }
    );
  }
}
