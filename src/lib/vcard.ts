import { ProfileData, LocalizedString } from "./types";

function resolveStr(val?: LocalizedString | string, fallback = ""): string {
  if (!val) return fallback;
  if (typeof val === "string") return val;
  return val.fr || val.ar || fallback;
}

export function generateVCard(profile: ProfileData): string {
  const fullName = resolveStr(profile.businessName, "Ferdaous TAZI");
  const phone = profile.phone || "0661633888";
  const intlPhone = phone.startsWith("0") ? `+212${phone.slice(1)}` : `+${phone}`;
  const email = profile.email || "F.tazi@remess.ma";
  const org = resolveStr(profile.organization, resolveStr(profile.slogan, "REMESS"));
  const title = profile.title || resolveStr(profile.subtitle, "Directrice executive");
  const city = resolveStr(profile.city, "Rabat, Maroc");
  const linkedin = profile.linkedin || "https://www.linkedin.com/in/ferdaous-tazi-961758361/";
  const whatsappUrl = profile.whatsappLink || `https://wa.me/${intlPhone.replace("+", "")}`;

  const note = [
    `${title} - ${org}`,
    `Finance solidaire · Stratégie financière · Veille de financements`,
    `Facilitatrice certifiée GET Ahead - Bureau International du Travail (BIT/OIT)`,
    `Égalité de genre & Entrepreneuriat féminin`,
  ].join("\\n");

  return [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${fullName}`,
    `N:TAZI;Ferdaous;;Mme;`,
    `ORG:${org}`,
    `TITLE:${title}`,
    `TEL;TYPE=CELL,VOICE:${intlPhone}`,
    `TEL;TYPE=WORK,VOICE:${phone}`,
    `EMAIL;TYPE=WORK,INTERNET:${email}`,
    `ADR;TYPE=WORK:;;${city};;;;Morocco`,
    `URL;TYPE=WORK:${profile.website || "https://www.remess.ma"}`,
    `URL;TYPE=LinkedIn:${linkedin}`,
    `URL;TYPE=WhatsApp:${whatsappUrl}`,
    `X-SOCIALPROFILE;type=linkedin:${linkedin}`,
    `NOTE:${note}`,
    "END:VCARD",
  ].join("\r\n");
}

export function downloadVCard(profile: ProfileData) {
  const vcardText = generateVCard(profile);
  const blob = new Blob([vcardText], { type: "text/vcard;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  const safeName = resolveStr(profile.businessName, "Ferdaous_TAZI").replace(/\s+/g, "_");
  link.setAttribute("download", `${safeName}_REMESS.vcf`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
