import type { Metadata, Viewport } from "next";
import { Cairo, Outfit } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-cairo",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-outfit",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#06110f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://remess.ma"),
  title: "Ferdaous TAZI | Directrice exécutive · REMESS - Économie Sociale & Solidaire",
  description:
    "Directrice exécutive du Réseau Marocain de l'Économie Sociale et Solidaire (REMESS). Finance solidaire, stratégie financière, égalité de genre, gouvernance de projets et facilitatrice certifiée GET Ahead (BIT). Contact : 0661633888 - F.tazi@remess.ma",
  keywords: [
    "Ferdaous TAZI",
    "REMESS",
    "Économie Sociale et Solidaire",
    "Finance Solidaire",
    "GET Ahead BIT",
    "Entrepreneuriat Féminin",
    "Rabat",
    "Maroc",
    "Gouvernance de Projets",
  ],
  authors: [{ name: "Ferdaous TAZI" }],
  openGraph: {
    title: "Ferdaous TAZI | Directrice exécutive · REMESS",
    description:
      "Profil professionnel officiel · Directrice exécutive du Réseau Marocain de l'Économie Sociale et Solidaire (REMESS)",
    type: "profile",
    locale: "fr_MA",
    images: [
      {
        url: "/uploads/ferdaous_tazi.jpg",
        width: 1024,
        height: 1024,
        alt: "Mme Ferdaous TAZI - Directrice exécutive REMESS",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" dir="ltr" className={`${cairo.variable} ${outfit.variable}`}>
      <body className="min-h-screen bg-[#050f0d] text-slate-100 font-sans selection:bg-[#d4af37] selection:text-black">
        {children}
      </body>
    </html>
  );
}
