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
  themeColor: "#0a1128",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "Bilal Electronique | بلال إلكترون - أزيلال",
  description:
    "مستلزمات الفراش والإلكترونيك، ساعات ذكية، عطور، ونظارات بأفضل الأسعار وبجودة مضمونة - أزيلال والنواحي. 06.20.78.66.75",
  keywords: [
    "Bilal Electronique",
    "بلال إلكترون",
    "أزيلال",
    "إلكترونيات أزيلال",
    "مستلزمات الفراش",
    "عطور ونظارات",
    "Azilal",
  ],
  authors: [{ name: "Bilal Electronique" }],
  openGraph: {
    title: "Bilal Electronique | بلال إلكترون - أزيلال",
    description: "بيع جميع مستلزمات الفراش والإلكترونيك - أزيلال والنواحي",
    type: "website",
    locale: "ar_MA",
    images: [
      {
        url: "/uploads/poster.png",
        width: 1200,
        height: 1200,
        alt: "Bilal Electronique Azilal",
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
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${outfit.variable}`}>
      <body className="min-h-screen bg-[#070b19] text-slate-100 font-sans selection:bg-amber-400 selection:text-black">
        {children}
      </body>
    </html>
  );
}
