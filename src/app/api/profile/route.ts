import { NextResponse } from "next/server";
import { getProfile, saveProfile, getStorageCapabilities } from "@/lib/profile";
import { ProfileData } from "@/lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0",
        Pragma: "no-cache",
        Expires: "0",
      },
    }
  );
}

export async function POST(req: Request) {
  try {
    const body: ProfileData & { _githubToken?: string } = await req.json();

    if (!body || !body.businessName) {
      return NextResponse.json(
        { success: false, message: "Données de profil non valides" },
        { status: 400 }
      );
    }

    const githubToken = body._githubToken || req.headers.get("x-github-token") || undefined;
    const cleanBody = { ...body };
    delete cleanBody._githubToken;

    const result = await saveProfile(cleanBody, { githubToken });
    const capabilities = getStorageCapabilities();

    let userMsg = "✓ Modifications enregistrées avec succès dans profile.json";
    if (result.storageType === "vercel-kv") {
      userMsg = "✓ Sauvegarde cloud Vercel KV réussie et synchronisée en temps réel !";
    } else if (result.storageType === "vercel-blob") {
      userMsg = "✓ Sauvegarde cloud Vercel Blob réussie et synchronisée en temps réel !";
    } else if (result.storageType === "github") {
      userMsg = "✓ Modifications enregistrées et synchronisées avec le dépôt GitHub !";
    } else if (result.isReadOnly) {
      userMsg = "Modifications enregistrées localement dans votre session.";
    }

    return NextResponse.json(
      {
        success: result.success,
        profile: cleanBody,
        isReadOnly: result.isReadOnly,
        storageType: result.storageType,
        capabilities,
        message: userMsg,
        error: result.error,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { success: false, message: error.message || "حدث خطأ أثناء الحفظ" },
      { status: 500 }
    );
  }
}
