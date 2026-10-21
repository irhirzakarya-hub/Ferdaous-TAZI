import fs from "fs";
import path from "path";
import { ProfileData } from "./types";
import { DEFAULT_PROFILE } from "./constants";

const DATA_FILE_PATH = path.join(process.cwd(), "data", "profile.json");
const PUBLIC_DATA_FILE_PATH = path.join(process.cwd(), "public", "data", "profile.json");

const KV_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "";
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "";

export { DEFAULT_PROFILE };

export function getStorageCapabilities() {
  return {
    hasKv: Boolean(KV_URL && KV_TOKEN),
    hasBlob: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
    hasGithub: Boolean(process.env.GITHUB_TOKEN),
    isCloudReady: Boolean(
      (KV_URL && KV_TOKEN) ||
      process.env.BLOB_READ_WRITE_TOKEN ||
      process.env.GITHUB_TOKEN
    ),
  };
}

export function sanitizeProfile(data: any): ProfileData {
  if (!data || typeof data !== "object") return DEFAULT_PROFILE;

  const rawBusinessName =
    typeof data.businessName === "string"
      ? data.businessName
      : data.businessName?.fr || data.businessName?.ar || "";

  const rawDesc =
    typeof data.description === "string"
      ? data.description
      : data.description?.fr || data.description?.ar || "";

  // If data has legacy Bilal text, literie, or old phone: wipe it completely
  const isLegacyBilal =
    rawBusinessName.toLowerCase().includes("bilal") ||
    rawDesc.toLowerCase().includes("bilal") ||
    rawDesc.toLowerCase().includes("literie") ||
    String(data.phone || "").includes("0620786675") ||
    String(data.phone || "").includes("06.20.78");

  if (isLegacyBilal) {
    return DEFAULT_PROFILE;
  }

  const title =
    (typeof data.title === "string" && data.title) ||
    (typeof data.subtitle === "string"
      ? data.subtitle
      : data.subtitle?.fr || "Directrice executive");

  const organization =
    (typeof data.organization === "string" && data.organization) ||
    (typeof data.slogan === "string"
      ? data.slogan
      : data.slogan?.fr || "REMESS");

  let posterImage = typeof data.posterImage === "string" ? data.posterImage.trim() : "";
  if (
    posterImage &&
    (posterImage === "/uploads/ferdaous_tazi.jpg" ||
      posterImage.includes("img-1792") ||
      posterImage.includes("poster.png"))
  ) {
    posterImage = "";
  }

  const phone =
    data.phone && !String(data.phone).includes("062078")
      ? String(data.phone).trim()
      : "0661633888";

  const whatsapp =
    data.whatsapp && !String(data.whatsapp).includes("062078")
      ? String(data.whatsapp).trim()
      : phone;

  const rawWa = whatsapp.replace(/[^0-9]/g, "");
  const intlWa = rawWa.startsWith("0") ? `212${rawWa.slice(1)}` : rawWa;

  return {
    ...DEFAULT_PROFILE,
    ...data,
    businessName: data.businessName || "Ferdaous TAZI",
    title: title || "Directrice executive",
    organization: organization || "REMESS",
    subtitle: title || "Directrice executive",
    slogan: organization || "REMESS",
    phone,
    phoneDisplay: data.phoneDisplay || phone,
    whatsapp,
    whatsappLink: `https://wa.me/${intlWa}`,
    email: data.email || "F.tazi@remess.ma",
    linkedin: data.linkedin || "https://www.linkedin.com/in/ferdaous-tazi-961758361/",
    posterImage,
    qrCodeImage: data.qrCodeImage ?? "",
    qrCodeUrl: data.qrCodeUrl ?? "",
    adminPin: data.adminPin || "2026",
  };
}

async function getLocalFallbackProfile(): Promise<ProfileData> {
  try {
    if (fs.existsSync(DATA_FILE_PATH)) {
      const raw = await fs.promises.readFile(DATA_FILE_PATH, "utf-8");
      return sanitizeProfile(JSON.parse(raw));
    }
    if (fs.existsSync(PUBLIC_DATA_FILE_PATH)) {
      const raw = await fs.promises.readFile(PUBLIC_DATA_FILE_PATH, "utf-8");
      return sanitizeProfile(JSON.parse(raw));
    }
  } catch (error) {
    console.warn("Could not read profile from file system, using fallback", error);
  }
  return DEFAULT_PROFILE;
}

export async function getProfile(): Promise<ProfileData> {
  // 1. Try Vercel KV / Upstash Redis (Fastest & direct Key-Value)
  if (KV_URL && KV_TOKEN) {
    try {
      const res = await fetch(`${KV_URL}/get/ferdaous_profile_data`, {
        headers: { Authorization: `Bearer ${KV_TOKEN}` },
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.result) {
          const parsed = typeof data.result === "string" ? JSON.parse(data.result) : data.result;
          if (parsed && parsed.businessName) {
            return sanitizeProfile(parsed);
          }
        }
      }
    } catch (e) {
      console.warn("Could not read profile from KV:", e);
    }
  }

  // 2. Try Vercel Blob Storage
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { list, put } = await import("@vercel/blob");
      const { blobs } = await list();

      // Look for the saved profile-data.json file
      const profileBlob = blobs.find(
        (b) => b.pathname === "profile-data.json" || b.pathname.endsWith("/profile-data.json")
      );

      if (profileBlob) {
        const res = await fetch(`${profileBlob.url}?t=${Date.now()}`, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
          },
        });
        if (res.ok) {
          const parsed = await res.json();
          if (parsed && parsed.businessName) {
            return sanitizeProfile(parsed);
          }
        }
      }

      // Auto-recovery: Only accept new ferdaous image blobs
      const imageBlobs = blobs
        .filter(
          (b) =>
            b.pathname.startsWith("uploads/") &&
            !b.pathname.includes("img-1792") &&
            !b.pathname.includes("poster.png")
        )
        .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

      if (imageBlobs.length > 0) {
        const latestImageUrl = imageBlobs[0].url;
        const localProfile = await getLocalFallbackProfile();
        const autoSyncedProfile = sanitizeProfile({
          ...localProfile,
          posterImage: latestImageUrl,
        });

        // Persist profile-data.json immediately so all devices synchronize
        try {
          await put("profile-data.json", JSON.stringify(autoSyncedProfile, null, 2), {
            access: "public",
            addRandomSuffix: false,
            allowOverwrite: true,
            cacheControlMaxAge: 0,
            contentType: "application/json",
          });
        } catch (autoErr) {
          console.warn("Auto-sync profile-data.json warning:", autoErr);
        }

        return autoSyncedProfile;
      }
    } catch (e) {
      console.error("Could not read profile from Vercel Blob:", e);
    }
  }

  // 3. Try Local File System (data/profile.json or public/data/profile.json)
  return getLocalFallbackProfile();
}

export async function saveProfile(
  data: ProfileData,
  options?: { githubToken?: string }
): Promise<{ success: boolean; isReadOnly?: boolean; storageType?: string; error?: string }> {
  let savedToCloud = false;
  let storageType = "local";
  let lastError = "";

  const cleanData = sanitizeProfile(data);

  // 1. Save to Vercel KV / Upstash Redis if configured
  if (KV_URL && KV_TOKEN) {
    try {
      const payload = JSON.stringify(JSON.stringify(cleanData));
      await Promise.allSettled([
        fetch(`${KV_URL}/set/ferdaous_profile_data`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${KV_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: payload,
        }),
        fetch(`${KV_URL}/set/bilal_profile_data`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${KV_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: payload,
        }),
      ]);
      savedToCloud = true;
      storageType = "vercel-kv";
    } catch (e) {
      console.warn("Failed to save to KV:", e);
    }
  }

  // 2. Save to Vercel Blob if configured
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { put } = await import("@vercel/blob");
      const blob = await put("profile-data.json", JSON.stringify(cleanData, null, 2), {
        access: "public",
        addRandomSuffix: false,
        allowOverwrite: true,
        cacheControlMaxAge: 0,
        contentType: "application/json",
      });
      console.log("Successfully saved profile to Vercel Blob at:", blob.url);
      savedToCloud = true;
      storageType = storageType === "vercel-kv" ? "kv+blob" : "vercel-blob";
    } catch (e: unknown) {
      const err = e as Error;
      lastError = err?.message || String(e);
      console.error("Failed to save to Vercel Blob:", e);
    }
  }

  // 3. Save to GitHub via API if GitHub token is present
  const gitToken = options?.githubToken || process.env.GITHUB_TOKEN;
  if (gitToken) {
    try {
      const repo = process.env.GITHUB_REPO || "irhirzakarya-hub/Ferdaous-TAZI";
      const filePath = "data/profile.json";
      let sha = "";
      const getRes = await fetch(`https://api.github.com/repos/${repo}/contents/${filePath}`, {
        headers: {
          Authorization: `Bearer ${gitToken}`,
          Accept: "application/vnd.github.v3+json",
        },
        cache: "no-store",
      });
      if (getRes.ok) {
        const fileInfo = await getRes.json();
        sha = fileInfo.sha;
      }
      const content = Buffer.from(JSON.stringify(cleanData, null, 2)).toString("base64");
      const putRes = await fetch(`https://api.github.com/repos/${repo}/contents/${filePath}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${gitToken}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "chore: update profile data from admin dashboard",
          content,
          sha: sha || undefined,
        }),
      });
      if (putRes.ok) {
        savedToCloud = true;
        storageType = "github";
      }
    } catch (e) {
      console.warn("Failed to save to GitHub:", e);
    }
  }

  // 4. Try Local File System (works on local machine, throws on Vercel read-only)
  let savedToFile = false;
  try {
    const jsonString = JSON.stringify(cleanData, null, 2);

    const dataDir = path.dirname(DATA_FILE_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    await fs.promises.writeFile(DATA_FILE_PATH, jsonString, "utf-8");

    const publicDataDir = path.dirname(PUBLIC_DATA_FILE_PATH);
    if (!fs.existsSync(publicDataDir)) {
      fs.mkdirSync(publicDataDir, { recursive: true });
    }
    await fs.promises.writeFile(PUBLIC_DATA_FILE_PATH, jsonString, "utf-8");

    savedToFile = true;
  } catch (err) {
    // Expected on Vercel read-only filesystem
  }

  return {
    success: savedToCloud || savedToFile,
    isReadOnly: !savedToCloud && !savedToFile,
    storageType,
    error: lastError || undefined,
  };
}

export async function deleteOldImage(imageUrlOrPath: string): Promise<boolean> {
  if (!imageUrlOrPath) return false;

  // 1. If it is a Vercel Blob URL, delete it from Vercel Blob store
  if (imageUrlOrPath.includes("public.blob.vercel-storage.com") && process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { del } = await import("@vercel/blob");
      await del(imageUrlOrPath);
      console.log("Deleted old Vercel Blob image:", imageUrlOrPath);
      return true;
    } catch (err) {
      console.warn("Failed to delete old blob image:", err);
    }
  }

  // 2. If it is a local upload path, delete it from local disk
  if (imageUrlOrPath.startsWith("/uploads/")) {
    try {
      const filename = path.basename(imageUrlOrPath);
      const filePath = path.join(process.cwd(), "public", "uploads", filename);
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        return true;
      }
    } catch (err) {
      console.warn("Failed to delete old local image:", err);
    }
  }

  return false;
}
