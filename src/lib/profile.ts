import fs from "fs";
import path from "path";
import { ProfileData } from "./types";
import { DEFAULT_PROFILE } from "./constants";

const DATA_FILE_PATH = path.join(process.cwd(), "data", "profile.json");
const PUBLIC_DATA_FILE_PATH = path.join(process.cwd(), "public", "data", "profile.json");

export { DEFAULT_PROFILE };

export async function getProfile(): Promise<ProfileData> {
  try {
    if (fs.existsSync(DATA_FILE_PATH)) {
      const raw = await fs.promises.readFile(DATA_FILE_PATH, "utf-8");
      return JSON.parse(raw);
    }
    if (fs.existsSync(PUBLIC_DATA_FILE_PATH)) {
      const raw = await fs.promises.readFile(PUBLIC_DATA_FILE_PATH, "utf-8");
      return JSON.parse(raw);
    }
  } catch (error) {
    console.warn("Could not read profile from file system, using fallback", error);
  }
  return DEFAULT_PROFILE;
}

export async function saveProfile(data: ProfileData): Promise<{ success: boolean; isReadOnly?: boolean }> {
  let savedToFile = false;
  try {
    const jsonString = JSON.stringify(data, null, 2);

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
    console.warn("File system write failed (e.g. running on read-only serverless environment):", err);
    return { success: true, isReadOnly: true };
  }

  return { success: true, isReadOnly: !savedToFile };
}

export async function deleteOldImage(imageRelativePath: string): Promise<boolean> {
  if (!imageRelativePath || !imageRelativePath.startsWith("/uploads/")) {
    return false;
  }
  try {
    const filename = path.basename(imageRelativePath);
    // Don't delete initial poster if someone wants to keep it as fallback unless it's an uploaded file
    const filePath = path.join(process.cwd(), "public", "uploads", filename);
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
      return true;
    }
  } catch (err) {
    console.warn("Failed to delete old image:", err);
  }
  return false;
}
