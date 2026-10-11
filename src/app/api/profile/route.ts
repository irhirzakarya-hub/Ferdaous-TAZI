import { NextResponse } from "next/server";
import { getProfile, saveProfile } from "@/lib/profile";
import { ProfileData } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const profile = await getProfile();
  return NextResponse.json(profile, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}

export async function POST(req: Request) {
  try {
    const body: ProfileData = await req.json();

    if (!body || !body.businessName) {
      return NextResponse.json(
        { success: false, message: "بيانات غير صالحة" },
        { status: 400 }
      );
    }

    const result = await saveProfile(body);
    return NextResponse.json({
      success: true,
      profile: body,
      isReadOnly: result.isReadOnly,
      message: result.isReadOnly
        ? "تم حفظ التعديلات في الجلسة بنجاح (يمكنك تنزيل ملف JSON للنشر على Vercel)"
        : "تم حفظ التعديلات بنجاح في ملف profile.json",
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { success: false, message: error.message || "حدث خطأ أثناء الحفظ" },
      { status: 500 }
    );
  }
}
