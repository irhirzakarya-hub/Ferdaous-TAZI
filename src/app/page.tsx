"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Phone,
  MessageCircle,
  MapPin,
  UserPlus,
  Share2,
  Sparkles,
  CheckCircle2,
  Truck,
  ShieldCheck,
  BadgePercent,
  ThumbsUp,
  Clock,
  Smartphone,
  BedDouble,
  Wrench,
  Maximize2,
  X,
  Copy,
  Check,
  Lock,
  ExternalLink,
  Flame,
  QrCode,
  Download,
} from "lucide-react";
import confetti from "canvas-confetti";
import { ProfileData } from "@/lib/types";
import { DEFAULT_PROFILE } from "@/lib/constants";
import { downloadVCard } from "@/lib/vcard";
import {
  InstagramIcon,
  InstagramGradientIcon,
  FacebookIcon,
  FacebookRoundIcon,
  WhatsAppIcon,
  WhatsAppRoundIcon,
} from "@/components/SocialIcons";
function InstagramVerifiedBadge({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{
        display: "inline-block",
        verticalAlign: "middle",
        flexShrink: 0,
        filter: "drop-shadow(0 0 8px rgba(0, 149, 246, 0.75))",
      }}
    >
      <circle cx="12" cy="12" r="10.5" fill="#0095F6" />
      <path
        d="M7.5 12L10.5 15L16.5 9"
        stroke="#FFFFFF"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function HomePage() {
  const [lang, setLang] = useState<"ar" | "fr">("ar");
  const [profile, setProfile] = useState<ProfileData>(DEFAULT_PROFILE);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [savedContactDone, setSavedContactDone] = useState(false);

  // Load profile from API or LocalStorage override
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch(`/api/profile?t=${Date.now()}`, { cache: "no-store" });
        if (res.ok) {
          const resJson = await res.json();
          const { _storageCapabilities, ...data } = resJson;
          setProfile(data);

          // Only use localOverride if server has no cloud storage configured
          if (!_storageCapabilities?.isCloudReady) {
            const localOverride = localStorage.getItem("bilal_profile_override");
            if (localOverride) {
              try {
                setProfile((prev) => ({ ...prev, ...JSON.parse(localOverride) }));
              } catch (e) {
                console.error(e);
              }
            }
          } else {
            // Cloud storage is active on Vercel: clean obsolete local override
            localStorage.removeItem("bilal_profile_override");
          }
        }
      } catch (err) {
        console.warn("Could not fetch profile API, checking localStorage", err);
        const localOverride = localStorage.getItem("bilal_profile_override");
        if (localOverride) {
          try {
            setProfile(JSON.parse(localOverride));
          } catch (e) {
            console.error(e);
          }
        }
      }
    }
    fetchProfile();
  }, []);

  const isAr = lang === "ar";

  const handleSaveContact = () => {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ["#f59e0b", "#3b82f6", "#10b981", "#ffffff"],
    });
    downloadVCard(profile);
    setSavedContactDone(true);
    setTimeout(() => setSavedContactDone(false), 4000);
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleShareNative = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `${profile.businessName[lang]} - ${profile.city[lang]}`,
          text: `${profile.subtitle[lang]} - ${profile.slogan[lang]}`,
          url: window.location.href,
        });
      } catch {
        setShareModalOpen(true);
      }
    } else {
      setShareModalOpen(true);
    }
  };

  const getWhatsAppUrl = (productName?: string) => {
    const rawPhone = profile.whatsapp.replace(/[^0-9]/g, "");
    let text = isAr
      ? `مرحباً أخي بلال، أتواصل معك من خلال البطاقة الذكية لـ Bilal Electronique.`
      : `Bonjour Bilal, je vous contacte depuis votre carte digitale Bilal Electronique.`;

    if (productName) {
      text += isAr
        ? ` أريد الاستفسار عن: *${productName}*.`
        : ` Je souhaite avoir des informations sur : *${productName}*.`;
    }

    return `https://wa.me/${rawPhone}?text=${encodeURIComponent(text)}`;
  };

  const instagramUrl =
    profile.instagram?.trim() ||
    profile.socialLinks?.find((s) => s.platform === "instagram" && s.url?.trim())?.url?.trim() ||
    "";

  const facebookUrl =
    profile.facebook?.trim() ||
    profile.socialLinks?.find((s) => s.platform === "facebook" && s.url?.trim())?.url?.trim() ||
    "";

  const hasInstagram = Boolean(instagramUrl);
  const hasFacebook = Boolean(facebookUrl);

  const getInstagramHandle = (url: string) => {
    try {
      const match = url.match(/instagram\.com\/([a-zA-Z0-9._]+)/);
      return match ? `@${match[1]}` : "@bilal_electronique_212_ma_99";
    } catch {
      return "@bilal_electronique_212_ma_99";
    }
  };



  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case "BadgePercent":
        return <BadgePercent style={{ width: 20, height: 20, color: "#fbbf24" }} />;
      case "ShieldCheck":
        return <ShieldCheck style={{ width: 20, height: 20, color: "#34d399" }} />;
      case "ThumbsUp":
        return <ThumbsUp style={{ width: 20, height: 20, color: "#60a5fa" }} />;
      case "Clock":
        return <Clock style={{ width: 20, height: 20, color: "#c084fc" }} />;
      default:
        return <Sparkles style={{ width: 20, height: 20, color: "#fbbf24" }} />;
    }
  };

  const getBadgeBg = (iconName: string) => {
    switch (iconName) {
      case "BadgePercent":
        return "linear-gradient(135deg, rgba(245, 158, 11, 0.25) 0%, rgba(245, 158, 11, 0.05) 100%)";
      case "ShieldCheck":
        return "linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(16, 185, 129, 0.05) 100%)";
      case "ThumbsUp":
        return "linear-gradient(135deg, rgba(37, 99, 235, 0.25) 0%, rgba(37, 99, 235, 0.05) 100%)";
      case "Clock":
        return "linear-gradient(135deg, rgba(168, 85, 247, 0.25) 0%, rgba(168, 85, 247, 0.05) 100%)";
      default:
        return "rgba(245, 158, 11, 0.15)";
    }
  };

  return (
    <div dir={isAr ? "rtl" : "ltr"} className="nfc-page-wrapper">
      {/* Ambient background glows */}
      <div
        className="ambient-glow"
        style={{
          position: "fixed",
          top: "-80px",
          right: "-80px",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(37, 99, 235, 0.25) 0%, transparent 70%)",
          filter: "blur(50px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        className="ambient-glow"
        style={{
          position: "fixed",
          bottom: "15%",
          left: "-80px",
          width: "280px",
          height: "280px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(245, 158, 11, 0.18) 0%, transparent 70%)",
          filter: "blur(50px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Top Header */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          backgroundColor: "rgba(5, 8, 20, 0.88)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
          padding: "10px 0",
        }}
      >
        <div
          className="nfc-mobile-container"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Active NFC Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "7px",
              padding: "5px 12px",
              borderRadius: "30px",
              background: "rgba(16, 185, 129, 0.12)",
              border: "1px solid rgba(16, 185, 129, 0.25)",
              color: "#34d399",
              fontSize: "11px",
              fontWeight: 700,
            }}
          >
            <span
              className="radar-dot"
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                backgroundColor: "#10b981",
                display: "inline-block",
              }}
            />
            <span>{isAr ? "بطاقة NFC الذكية" : "NFC Connecté"}</span>
          </div>

          {/* Language Switcher & Share */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              id="header-share-btn"
              onClick={handleShareNative}
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "#e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
              title={isAr ? "مشاركة البطاقة" : "Partager"}
            >
              <Share2 style={{ width: 15, height: 15 }} />
            </button>

            {/* Language Pill Switch */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: "rgba(10, 15, 35, 0.9)",
                borderRadius: "30px",
                padding: "3px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <button
                id="lang-ar-btn"
                onClick={() => setLang("ar")}
                style={{
                  padding: "4px 10px",
                  borderRadius: "20px",
                  fontSize: "11px",
                  fontWeight: 800,
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  background: isAr
                    ? "linear-gradient(135deg, #2563eb, #1d4ed8)"
                    : "transparent",
                  color: isAr ? "#ffffff" : "#94a3b8",
                  boxShadow: isAr ? "0 2px 8px rgba(37,99,235,0.4)" : "none",
                }}
              >
                عربي
              </button>
              <button
                id="lang-fr-btn"
                onClick={() => setLang("fr")}
                style={{
                  padding: "4px 10px",
                  borderRadius: "20px",
                  fontSize: "11px",
                  fontWeight: 800,
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  background: !isAr
                    ? "linear-gradient(135deg, #2563eb, #1d4ed8)"
                    : "transparent",
                  color: !isAr ? "#ffffff" : "#94a3b8",
                  boxShadow: !isAr ? "0 2px 8px rgba(37,99,235,0.4)" : "none",
                }}
              >
                FR
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="nfc-mobile-container" style={{ paddingTop: "14px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          
          {/* 🌟 1. HERO PROFILE: THE POSTER IMAGE AT THE VERY TOP (كما طلب الزبون) */}
          {profile.posterImage && (
            <div style={{ position: "relative" }}>
              {/* الشارات موضوعة فوق الإطار مباشرة كما طلب الزبون */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0 10px",
                  marginBottom: "-13px",
                  position: "relative",
                  zIndex: 20,
                }}
              >
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "6px 14px",
                    borderRadius: "30px",
                    background: "rgba(6, 12, 30, 0.95)",
                    backdropFilter: "blur(14px)",
                    WebkitBackdropFilter: "blur(14px)",
                    border: "1.5px solid rgba(0, 149, 246, 0.55)",
                    boxShadow: "0 4px 14px rgba(0, 0, 0, 0.6), 0 0 14px rgba(0, 149, 246, 0.3)",
                  }}
                >
                  <InstagramVerifiedBadge size={20} />
                  <span style={{ fontSize: "12px", fontWeight: 800, color: "#ffffff", letterSpacing: "0.2px" }}>
                    {isAr ? "موثوق ومعتمد" : "Vérifié & Certifié"}
                  </span>
                </div>

                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "5px 12px",
                    borderRadius: "20px",
                    background: "rgba(6, 12, 30, 0.95)",
                    backdropFilter: "blur(14px)",
                    WebkitBackdropFilter: "blur(14px)",
                    border: "1.5px solid rgba(16, 185, 129, 0.45)",
                    boxShadow: "0 4px 14px rgba(0, 0, 0, 0.6)",
                    color: "#34d399",
                    fontSize: "11px",
                    fontWeight: 700,
                  }}
                >
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      backgroundColor: "#10b981",
                      display: "inline-block",
                      boxShadow: "0 0 6px #10b981",
                    }}
                  />
                  <span>{isAr ? "متوفر حالياً" : "Disponible"}</span>
                </div>
              </div>

              <div
                className="poster-lux-frame"
                onClick={() => setImageModalOpen(true)}
                style={{ cursor: "pointer", paddingTop: "18px" }}
              >

                {/* Contained image inside mobile frame */}
                <div
                  className="poster-img-container"
                  style={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: "1 / 1.05",
                    maxHeight: "420px",
                    borderRadius: "20px",
                    overflow: "hidden",
                    backgroundColor: "#030712",
                  }}
                >
                  <Image
                    src={profile.posterImage}
                    alt={profile.businessName[lang]}
                    fill
                    sizes="(max-width: 480px) 100vw, 440px"
                    style={{
                      objectFit: "contain",
                      objectPosition: "center",
                    }}
                    priority
                  />
                </div>

                {/* Floating Bottom Info Bar */}
                <div className="poster-floating-badge-bottom">
                  <div className="zoom-pill-btn">
                    <Maximize2 style={{ width: 12, height: 12 }} />
                    <span>{isAr ? "اضغط للمعاينة الكاملة" : "Plein Écran"}</span>
                  </div>
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 800,
                      fontFamily: "monospace",
                      color: "#fbbf24",
                      background: "rgba(245, 158, 11, 0.15)",
                      padding: "4px 8px",
                      borderRadius: "8px",
                      border: "1px solid rgba(245, 158, 11, 0.3)",
                    }}
                  >
                    {profile.phoneDisplay}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 2. Identity Information Card */}
          <div className="luxury-card" style={{ padding: "18px 16px", textAlign: "center" }}>
            {/* Business Title */}
            <h1
              style={{
                fontSize: "24px",
                fontWeight: 900,
                color: "#ffffff",
                letterSpacing: "0.2px",
                marginBottom: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              <span>{profile.businessName[lang]}</span>
              <InstagramVerifiedBadge size={22} />
            </h1>

            {/* Subtitle */}
            <p
              style={{
                fontSize: "13.5px",
                fontWeight: 700,
                color: "#fbbf24",
                marginBottom: "8px",
              }}
            >
              {profile.subtitle[lang]}
            </p>

            {/* Location Tag */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                padding: "4px 12px",
                borderRadius: "30px",
                backgroundColor: "rgba(15, 23, 42, 0.8)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "#cbd5e1",
                fontSize: "11px",
                fontWeight: 600,
                marginBottom: "8px",
              }}
            >
              <MapPin style={{ width: 13, height: 13, color: "#f43f5e" }} />
              <span>{profile.city[lang]}</span>
            </div>

            {/* Slogan */}
            <p
              style={{
                fontSize: "12px",
                color: "#94a3b8",
                lineHeight: "1.5",
                maxWidth: "340px",
                margin: "0 auto",
              }}
            >
              {profile.slogan[lang]}
            </p>
          </div>

          {/* 3. Primary NFC Action Buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {/* Golden 1-Tap Save Contact (vCard) */}
            <button
              id="nfc-save-contact-btn"
              onClick={handleSaveContact}
              className="btn-nfc-vcard shimmer-effect"
            >
              <UserPlus className="anim-icon-user" style={{ width: 19, height: 19, color: "#0c1222" }} />
              <span>
                {savedContactDone
                  ? isAr
                    ? "✓ تم حفظ جهة الاتصال في الهاتف!"
                    : "✓ Contact Enregistré !"
                  : isAr
                  ? "حفظ جهة الاتصال في الهاتف (vCard)"
                  : "Enregistrer le Contact (vCard)"}
              </span>
            </button>

            {/* Direct WhatsApp and Direct Call */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
              }}
            >
              <a
                id="nfc-whatsapp-btn"
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-nfc-whatsapp"
              >
                <WhatsAppIcon className="anim-icon-whatsapp" size={19} />
                <span>{isAr ? "واتساب مباشر" : "WhatsApp"}</span>
              </a>

              <a
                id="nfc-call-btn"
                href={`tel:${profile.phone}`}
                className="btn-nfc-call"
              >
                <Phone className="anim-icon-phone" style={{ width: 18, height: 18 }} />
                <span>{isAr ? "اتصال فوري" : "Appeler"}</span>
              </a>
            </div>

            {/* Social Media Channels (Instagram & Conditional Facebook) */}
            {(hasInstagram || hasFacebook) && (
              <div style={{ marginTop: "2px" }}>
                {hasInstagram && hasFacebook ? (
                  /* Both Instagram and Facebook available: 2-column luxury grid */
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "10px",
                    }}
                  >
                    <a
                      id="nfc-instagram-btn"
                      href={instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-nfc-instagram"
                    >
                      <InstagramGradientIcon size={20} />
                      <span>{isAr ? "إنستغرام" : "Instagram"}</span>
                    </a>

                    <a
                      id="nfc-facebook-btn"
                      href={facebookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-nfc-facebook"
                    >
                      <FacebookRoundIcon size={20} />
                      <span>{isAr ? "فيسبوك" : "Facebook"}</span>
                    </a>
                  </div>
                ) : hasInstagram ? (
                  /* Only Instagram available (Facebook hidden from page) */
                  <a
                    id="nfc-instagram-banner"
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="instagram-luxury-banner"
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0, flex: 1 }}>
                      <InstagramGradientIcon size={28} style={{ flexShrink: 0 }} />
                      <div style={{ minWidth: 0, overflow: "hidden", textAlign: isAr ? "right" : "left" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                          <span style={{ fontSize: "13px", fontWeight: 800, color: "#ffffff", whiteSpace: "nowrap" }}>
                            {isAr ? "تابعنا على إنستغرام" : "Instagram"}
                          </span>
                          <InstagramVerifiedBadge size={15} />
                        </div>
                        <p
                          style={{
                            fontSize: "10.5px",
                            color: "#fbcfe8",
                            marginTop: "1px",
                            fontFamily: "monospace",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            direction: "ltr",
                            textAlign: isAr ? "right" : "left",
                          }}
                        >
                          {getInstagramHandle(instagramUrl)}
                        </p>
                      </div>
                    </div>

                    <div
                      style={{
                        flexShrink: 0,
                        padding: "5px 10px",
                        borderRadius: "10px",
                        background: "linear-gradient(135deg, #e1306c 0%, #c13584 100%)",
                        color: "#ffffff",
                        fontSize: "11px",
                        fontWeight: 800,
                        whiteSpace: "nowrap",
                        boxShadow: "0 3px 10px rgba(225, 48, 108, 0.35)",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <span>{isAr ? "متابعة" : "Suivre"}</span>
                      <ExternalLink style={{ width: 11, height: 11 }} />
                    </div>
                  </a>
                ) : (
                  /* Only Facebook available (Instagram hidden) */
                  <a
                    id="nfc-facebook-banner"
                    href={facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-nfc-facebook"
                    style={{ padding: "14px 18px" }}
                  >
                    <FacebookRoundIcon size={22} />
                    <span>{isAr ? "صفحتنا الرسمية على فيسبوك (Facebook)" : "Notre Page Facebook"}</span>
                    <ExternalLink style={{ width: 14, height: 14, opacity: 0.8 }} />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* 4. Express Delivery Alert Banner */}
          <div className="delivery-lux-bar">
            <div className="delivery-truck-circle">
              <Truck className="truck-bounce" style={{ width: 22, height: 22 }} />
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "11px",
                  fontWeight: 800,
                  color: "#fbbf24",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                <span>{isAr ? "خدمة التوصيل السريع" : "Service de Livraison"}</span>
                <span
                  style={{
                    width: "5px",
                    height: "5px",
                    borderRadius: "50%",
                    backgroundColor: "#10b981",
                  }}
                />
              </div>
              <p
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#ffffff",
                  marginTop: "2px",
                  lineHeight: "1.3",
                }}
              >
                {profile.deliveryText[lang]}
              </p>
            </div>
          </div>

          {/* 5. 2x2 Trust & Guarantee Cards */}
          <div>
            <h2
              style={{
                fontSize: "13px",
                fontWeight: 800,
                color: "#e2e8f0",
                marginBottom: "8px",
                padding: "0 4px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <ShieldCheck style={{ width: 15, height: 15, color: "#34d399" }} />
              <span>{isAr ? "ضمانات ومميزات التعامل معنا" : "Nos Engagements"}</span>
            </h2>

            <div className="trust-cards-grid">
              {profile.badges.map((b) => (
                <div key={b.id} className="trust-card-item">
                  <div
                    className="trust-icon-box"
                    style={{ background: getBadgeBg(b.icon) }}
                  >
                    {getBadgeIcon(b.icon)}
                  </div>
                  <div>
                    <h3
                      style={{
                        fontSize: "13px",
                        fontWeight: 800,
                        color: "#ffffff",
                        marginBottom: "3px",
                      }}
                    >
                      {b[lang]}
                    </h3>
                    <p
                      style={{
                        fontSize: "10.5px",
                        color: "#94a3b8",
                        lineHeight: "1.35",
                      }}
                    >
                      {isAr ? b.descAr : b.descFr}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>



          {/* 7. Location & Map Quick Card */}
          <div
            className="luxury-card"
            style={{
              padding: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "10px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "14px",
                  background: "rgba(244, 63, 94, 0.15)",
                  border: "1px solid rgba(244, 63, 94, 0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#f43f5e",
                  flexShrink: 0,
                }}
              >
                <MapPin style={{ width: 20, height: 20 }} />
              </div>
              <div>
                <h4 style={{ fontSize: "13px", fontWeight: 800, color: "#f8fafc" }}>
                  {isAr ? "موقعنا في أزيلال" : "Notre Localisation"}
                </h4>
                <p style={{ fontSize: "11px", color: "#94a3b8" }}>
                  {profile.city[lang]}
                </p>
              </div>
            </div>

            <a
              id="google-maps-link"
              href={profile.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                padding: "8px 12px",
                borderRadius: "12px",
                background: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "#f1f5f9",
                fontSize: "11px",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              <span>{isAr ? "فتح الخريطة" : "Voir Carte"}</span>
              <ExternalLink style={{ width: 12, height: 12 }} />
            </a>
          </div>

          {/* 🌟 8. Luxury QR Code Card (رمز الاستجابة السريع لمشاركة وحفظ البطاقة) */}
          {(profile.qrCodeImage || "/uploads/qr.png") && (
            <div
              className="luxury-card"
              style={{
                padding: "20px 16px",
                textAlign: "center",
                background: "linear-gradient(145deg, rgba(16, 24, 52, 0.85) 0%, rgba(10, 16, 38, 0.95) 100%)",
                border: "1.5px solid rgba(245, 158, 11, 0.35)",
                boxShadow: "0 15px 35px -10px rgba(0, 0, 0, 0.8), 0 0 25px -5px rgba(245, 158, 11, 0.15)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Top ambient pill */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "4px 12px",
                  borderRadius: "20px",
                  background: "rgba(245, 158, 11, 0.12)",
                  border: "1px solid rgba(245, 158, 11, 0.3)",
                  color: "#fbbf24",
                  fontSize: "11px",
                  fontWeight: 800,
                  marginBottom: "10px",
                  letterSpacing: "0.4px",
                }}
              >
                <QrCode style={{ width: 13, height: 13 }} />
                <span>{isAr ? "رمز الاستجابة السريع (QR Code)" : "Code QR de Partage"}</span>
              </div>

              <h3
                style={{
                  fontSize: "15px",
                  fontWeight: 900,
                  color: "#ffffff",
                  marginBottom: "4px",
                }}
              >
                {isAr ? "امسح الرمز لمشاركة البطاقة فوراً" : "Scannez pour Enregistrer"}
              </h3>

              <p
                style={{
                  fontSize: "11.5px",
                  color: "#94a3b8",
                  maxWidth: "320px",
                  margin: "0 auto 16px auto",
                  lineHeight: "1.4",
                }}
              >
                {isAr
                  ? "امسح الرمز بكاميرا هاتفك لفتح البطاقة وحفظ جهة الاتصال مباشرة"
                  : "Scannez avec votre téléphone pour ouvrir et enregistrer le contact"}
              </p>

              {/* QR Image Container with Luxury Glow */}
              <div
                style={{
                  position: "relative",
                  display: "inline-block",
                  padding: "12px",
                  borderRadius: "22px",
                  background: "#ffffff",
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.7), 0 0 25px rgba(245, 158, 11, 0.25)",
                  border: "2.5px solid rgba(245, 158, 11, 0.45)",
                  cursor: "pointer",
                  transition: "transform 0.25s ease",
                }}
                onClick={() => setQrModalOpen(true)}
                title={isAr ? "اضغط للتكبير" : "Agrandir"}
              >
                <div
                  style={{
                    position: "relative",
                    width: "160px",
                    height: "160px",
                  }}
                >
                  <Image
                    src={profile.qrCodeImage || "/uploads/qr.png"}
                    alt="QR Code"
                    fill
                    style={{ objectFit: "contain" }}
                  />
                </div>

                {/* Bottom badge on QR */}
                <div
                  style={{
                    position: "absolute",
                    bottom: "-10px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                    color: "#0c1222",
                    fontSize: "10px",
                    fontWeight: 900,
                    padding: "2px 10px",
                    borderRadius: "10px",
                    whiteSpace: "nowrap",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.5)",
                  }}
                >
                  ⚡ SCAN ME
                </div>
              </div>

              {/* Action Buttons below QR */}
              <div
                style={{
                  marginTop: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                }}
              >
                <a
                  href={profile.qrCodeImage || "/uploads/qr.png"}
                  download="bilal-electronique-qr.png"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 14px",
                    borderRadius: "14px",
                    background: "rgba(255, 255, 255, 0.08)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    color: "#f1f5f9",
                    fontSize: "12px",
                    fontWeight: 700,
                    textDecoration: "none",
                  }}
                >
                  <Download style={{ width: 14, height: 14, color: "#60a5fa" }} />
                  <span>{isAr ? "تحميل الرمز" : "Télécharger"}</span>
                </a>

                <button
                  onClick={() => setQrModalOpen(true)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 14px",
                    borderRadius: "14px",
                    background: "rgba(37, 99, 235, 0.18)",
                    border: "1px solid rgba(37, 99, 235, 0.35)",
                    color: "#93c5fd",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  <Maximize2 style={{ width: 14, height: 14 }} />
                  <span>{isAr ? "تكبير الرمز" : "Plein écran"}</span>
                </button>
              </div>
            </div>
          )}

          {/* 9. Footer */}
          <footer
            style={{
              paddingTop: "16px",
              paddingBottom: "12px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            {/* Quick Social Icons in Footer */}
            {(hasInstagram || hasFacebook || profile.whatsapp || profile.phone) && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  marginBottom: "4px",
                }}
              >
                {hasInstagram && (
                  <a
                    id="footer-instagram-link"
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Instagram"
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      background: "rgba(225, 48, 108, 0.15)",
                      border: "1px solid rgba(225, 48, 108, 0.35)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#f43f5e",
                      transition: "transform 0.2s",
                    }}
                  >
                    <InstagramGradientIcon size={20} />
                  </a>
                )}

                {hasFacebook && (
                  <a
                    id="footer-facebook-link"
                    href={facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Facebook"
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      background: "rgba(24, 119, 242, 0.15)",
                      border: "1px solid rgba(24, 119, 242, 0.35)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#60a5fa",
                      transition: "transform 0.2s",
                    }}
                  >
                    <FacebookRoundIcon size={20} />
                  </a>
                )}

                <a
                  id="footer-whatsapp-link"
                  href={getWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="WhatsApp"
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: "rgba(16, 185, 129, 0.15)",
                    border: "1px solid rgba(16, 185, 129, 0.35)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#25D366",
                    transition: "transform 0.2s",
                  }}
                >
                  <WhatsAppIcon size={18} />
                </a>

                <a
                  id="footer-phone-link"
                  href={`tel:${profile.phone}`}
                  title={isAr ? "اتصال" : "Appeler"}
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: "rgba(37, 99, 235, 0.15)",
                    border: "1px solid rgba(37, 99, 235, 0.35)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#60a5fa",
                  }}
                >
                  <Phone style={{ width: 16, height: 16 }} />
                </a>
              </div>
            )}

            <p style={{ fontSize: "11px", color: "#64748b" }}>
              © {new Date().getFullYear()} {profile.businessName[lang]} - {profile.city[lang]}
            </p>
          </footer>
        </div>
      </main>

      {/* Floating Bottom Dock for Mobile Smartphones */}
      <div className="mobile-bottom-dock">
        <div className="dock-content">
          <a
            id="float-call-btn"
            href={`tel:${profile.phone}`}
            className="btn-nfc-call"
            style={{ flex: 1, padding: "11px 14px", borderRadius: "16px", fontSize: "13px" }}
          >
            <Phone className="anim-icon-phone" style={{ width: 16, height: 16 }} />
            <span>{profile.phoneDisplay}</span>
          </a>

          <a
            id="float-whatsapp-btn"
            href={getWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-nfc-whatsapp"
            style={{ flex: 1, padding: "11px 14px", borderRadius: "16px", fontSize: "13px" }}
          >
            <WhatsAppIcon className="anim-icon-whatsapp" size={17} />
            <span>{isAr ? "واتساب مباشر" : "WhatsApp"}</span>
          </a>
        </div>
      </div>

      {/* Full-Screen Poster Zoom Lightbox */}
      {imageModalOpen && profile.posterImage && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            backgroundColor: "rgba(0, 0, 0, 0.94)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
          onClick={() => setImageModalOpen(false)}
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "480px",
              height: "78vh",
              maxHeight: "620px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              id="close-image-modal"
              onClick={() => setImageModalOpen(false)}
              style={{
                position: "absolute",
                top: "-45px",
                right: isAr ? "0" : "auto",
                left: !isAr ? "0" : "auto",
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.15)",
                border: "none",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <X style={{ width: 20, height: 20 }} />
            </button>

            {/* High Res Container */}
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "100%",
                borderRadius: "20px",
                overflow: "hidden",
                border: "1.5px solid rgba(245, 158, 11, 0.4)",
                backgroundColor: "#030712",
                boxShadow: "0 25px 60px rgba(0,0,0,0.9)",
              }}
            >
              <Image
                src={profile.posterImage}
                alt={profile.businessName[lang]}
                fill
                style={{ objectFit: "contain" }}
                priority
              />
            </div>

            {/* Quick Action under lightbox */}
            <div
              style={{
                marginTop: "12px",
                display: "flex",
                gap: "10px",
                justifyContent: "center",
              }}
            >
              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-nfc-whatsapp"
                style={{ padding: "10px 18px", fontSize: "13px" }}
              >
                <WhatsAppIcon className="anim-icon-whatsapp" size={17} />
                <span>{isAr ? "تواصل حول العرض" : "Commander"}</span>
              </a>
              <button
                onClick={() => setImageModalOpen(false)}
                style={{
                  padding: "10px 18px",
                  borderRadius: "16px",
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  color: "#cbd5e1",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {isAr ? "إغلاق" : "Fermer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full-Screen QR Lightbox Modal */}
      {qrModalOpen && (profile.qrCodeImage || "/uploads/qr.png") && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            backgroundColor: "rgba(0, 0, 0, 0.94)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setQrModalOpen(false)}
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "360px",
              textAlign: "center",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setQrModalOpen(false)}
              style={{
                position: "absolute",
                top: "-45px",
                right: isAr ? "0" : "auto",
                left: !isAr ? "0" : "auto",
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.15)",
                border: "none",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <X style={{ width: 20, height: 20 }} />
            </button>

            <div
              style={{
                position: "relative",
                width: "260px",
                height: "260px",
                margin: "0 auto",
                padding: "16px",
                borderRadius: "24px",
                backgroundColor: "#ffffff",
                border: "2px solid rgba(245, 158, 11, 0.5)",
                boxShadow: "0 25px 60px rgba(0,0,0,0.9), 0 0 35px rgba(245, 158, 11, 0.3)",
              }}
            >
              <div style={{ position: "relative", width: "100%", height: "100%" }}>
                <Image
                  src={profile.qrCodeImage || "/uploads/qr.png"}
                  alt="QR Code High Res"
                  fill
                  style={{ objectFit: "contain" }}
                  priority
                />
              </div>
            </div>

            <p style={{ marginTop: "16px", fontSize: "15px", fontWeight: 900, color: "#ffffff" }}>
              {profile.businessName[lang]}
            </p>
            <p style={{ fontSize: "12px", color: "#fbbf24", marginTop: "3px" }}>
              {isAr ? "امسح الرمز بكاميرا الهاتف لمشاركة وحفظ البطاقة" : "Scannez avec l'appareil photo"}
            </p>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {shareModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            backgroundColor: "rgba(0, 0, 0, 0.85)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
          onClick={() => setShareModalOpen(false)}
        >
          <div
            className="luxury-card"
            style={{
              width: "100%",
              maxWidth: "360px",
              padding: "24px 20px",
              textAlign: "center",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShareModalOpen(false)}
              style={{
                position: "absolute",
                top: "14px",
                right: isAr ? "14px" : "auto",
                left: !isAr ? "14px" : "auto",
                background: "none",
                border: "none",
                color: "#94a3b8",
                cursor: "pointer",
              }}
            >
              <X style={{ width: 18, height: 18 }} />
            </button>

            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "16px",
                background: "rgba(37, 99, 235, 0.2)",
                color: "#60a5fa",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 12px auto",
              }}
            >
              <Share2 style={{ width: 22, height: 22 }} />
            </div>

            <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#ffffff", marginBottom: "6px" }}>
              {isAr ? "مشاركة البطاقة الذكية" : "Partager la Carte"}
            </h3>

            <p style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "16px" }}>
              {isAr
                ? "انسخ الرابط لمشاركته مع زبنائك في واتساب ومواقع التواصل"
                : "Copiez le lien pour le partager avec vos clients"}
            </p>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 12px",
                borderRadius: "14px",
                background: "#030612",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <input
                type="text"
                readOnly
                value={typeof window !== "undefined" ? window.location.href : ""}
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "#cbd5e1",
                  fontSize: "11px",
                  fontFamily: "monospace",
                }}
              />
              <button
                id="copy-link-btn"
                onClick={handleCopyLink}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "6px 12px",
                  borderRadius: "10px",
                  background: "#2563eb",
                  border: "none",
                  color: "#ffffff",
                  fontSize: "11px",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                {copied ? <Check style={{ width: 12, height: 12 }} /> : <Copy style={{ width: 12, height: 12 }} />}
                <span>{copied ? (isAr ? "تم" : "Copié") : (isAr ? "نسخ" : "Copier")}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
