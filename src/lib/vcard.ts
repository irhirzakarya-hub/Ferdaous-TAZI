import { ProfileData } from "./types";

export function generateVCard(profile: ProfileData): string {
  const name = `${profile.businessName.ar} (${profile.businessName.fr})`;
  const phone = profile.phone || "0620786675";
  const intlPhone = phone.startsWith("0") ? `+212${phone.slice(1)}` : `+${phone}`;
  const city = `${profile.city.ar} - ${profile.city.fr}`;
  const note = `${profile.subtitle.ar} - ${profile.subtitle.fr}\n${profile.deliveryText.ar}`;

  return [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${name}`,
    `N:Electronique;Bilal;;;`,
    `ORG:${profile.businessName.fr}`,
    `TITLE:${profile.subtitle.ar}`,
    `TEL;TYPE=CELL,VOICE:${intlPhone}`,
    `TEL;TYPE=WORK,VOICE:${phone}`,
    `ADR;TYPE=WORK:;;${city};;;;Morocco`,
    `NOTE:${note.replace(/\n/g, "\\n")}`,
    `URL:${profile.whatsappLink || `https://wa.me/${intlPhone.replace("+", "")}`}`,
    "END:VCARD",
  ].join("\r\n");
}

export function downloadVCard(profile: ProfileData) {
  const vcardText = generateVCard(profile);
  const blob = new Blob([vcardText], { type: "text/vcard;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `Bilal_Electronique_${profile.phone}.vcf`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
