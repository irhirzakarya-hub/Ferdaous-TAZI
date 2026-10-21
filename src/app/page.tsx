"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
  Variants,
} from "framer-motion";
import {
  Phone,
  Mail,
  Share2,
  CheckCircle2,
  Copy,
  Check,
  QrCode,
  Download,
  X,
  Building2,
  UserCheck,
} from "lucide-react";
import confetti from "canvas-confetti";
import { ProfileData } from "@/lib/types";
import { DEFAULT_PROFILE } from "@/lib/constants";
import { downloadVCard } from "@/lib/vcard";
import {
  LinkedInRoundIcon,
  WhatsAppRoundIcon,
  WhatsAppIcon,
  LinkedInIcon,
} from "@/components/SocialIcons";

// Verified Gold Shield Badge
function VerifiedBadge({ size = 22 }: { size?: number }) {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 350, damping: 15, delay: 0.2 }}
      style={{ display: "inline-flex" }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        style={{
          display: "inline-block",
          verticalAlign: "middle",
          flexShrink: 0,
          filter: "drop-shadow(0 0 10px rgba(255, 255, 255, 0.45))",
        }}
      >
        <circle cx="12" cy="12" r="10.5" fill="#f8fafc" />
        <path
          d="M7.5 12L10.5 15L16.5 9"
          stroke="#08090b"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </motion.div>
  );
}

// Interactive 3D Tilt Card Component
function TiltCard({
  children,
  className = "",
  style = {},
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 220, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 220, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["9deg", "-9deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-9deg", "9deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        perspective: "1000px",
        ...style,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Background Floating Ambient Particles
function FloatingParticleBackground() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
        overflow: "hidden",
      }}
    >
      <motion.div
        animate={{
          scale: [1, 1.25, 1],
          opacity: [0.22, 0.42, 0.22],
          x: [0, 25, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          position: "absolute",
          top: "-80px",
          right: "-80px",
          width: "380px",
          height: "380px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255, 255, 255, 0.12) 0%, transparent 70%)",
          filter: "blur(70px)",
        }}
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.18, 0.35, 0.18],
          x: [0, -25, 0],
          y: [0, 35, 0],
        }}
        transition={{
          duration: 11,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.5,
        }}
        style={{
          position: "absolute",
          top: "35%",
          left: "-120px",
          width: "360px",
          height: "360px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(148, 163, 184, 0.14) 0%, transparent 70%)",
          filter: "blur(70px)",
        }}
      />
    </div>
  );
}

// Motion Stagger Variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 280,
      damping: 24,
    },
  },
};

export default function HomePage() {
  const [profile, setProfile] = useState<ProfileData>(DEFAULT_PROFILE);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [savedContactDone, setSavedContactDone] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.href);
      // Clean obsolete old keys
      localStorage.removeItem("bilal_profile_override");
      localStorage.removeItem("bilal_admin_auth");
      localStorage.removeItem("bilal_github_token");
    }
  }, []);

  // Fetch profile from API or LocalStorage fallback
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch(`/api/profile?t=${Date.now()}`, { cache: "no-store" });
        if (res.ok) {
          const resJson = await res.json();
          const { _storageCapabilities, ...data } = resJson;

          // Sanitize any lingering old Bilal data
          const sanitized = { ...data };
          sanitized.businessName = sanitized.businessName || "Ferdaous TAZI";
          sanitized.title = sanitized.title || "Directrice executive";
          sanitized.organization = sanitized.organization || "REMESS";
          sanitized.phone = sanitized.phone || "0661633888";
          sanitized.phoneDisplay = sanitized.phoneDisplay || sanitized.phone || "06 61 63 38 88";
          sanitized.whatsapp = sanitized.whatsapp || sanitized.phone || "0661633888";
          sanitized.email = sanitized.email || "F.tazi@remess.ma";

          sanitized.qrCodeUrl = sanitized.qrCodeUrl ?? "";
          sanitized.qrCodeImage = sanitized.qrCodeImage ?? "";

          if (
            sanitized.posterImage &&
            (sanitized.posterImage.includes("img-1792") ||
              sanitized.posterImage.includes("poster.png") ||
              (!sanitized.posterImage.includes("ferdaous") &&
                !sanitized.posterImage.includes("blob.vercel-storage.com") &&
                !sanitized.posterImage.startsWith("data:image/")))
          ) {
            sanitized.posterImage = "/uploads/ferdaous_tazi.jpg";
          }

          setProfile(sanitized);

          if (!_storageCapabilities?.isCloudReady) {
            const localOverride = localStorage.getItem("ferdaous_profile_override");
            if (localOverride) {
              try {
                const parsed = JSON.parse(localOverride);
                if (parsed.phone && !parsed.phone.includes("062078")) {
                  setProfile((prev) => ({ ...prev, ...parsed }));
                }
              } catch (e) {
                console.error(e);
              }
            }
          } else {
            localStorage.removeItem("ferdaous_profile_override");
          }
        }
      } catch (err) {
        console.warn("Could not fetch profile API", err);
      }
    }
    fetchProfile();
  }, []);

  // Helpers to safely resolve string or LocalizedString
  const getName = () => {
    if (!profile.businessName) return "Ferdaous TAZI";
    if (typeof profile.businessName === "string") return profile.businessName;
    return profile.businessName.fr || profile.businessName.ar || "Ferdaous TAZI";
  };

  const getTitle = (): string => {
    let raw = "";
    if (typeof profile.title === "string" && profile.title) {
      raw = profile.title;
    } else if (typeof profile.subtitle === "string") {
      raw = profile.subtitle;
    } else if (profile.subtitle && typeof profile.subtitle === "object") {
      raw = profile.subtitle.fr || profile.subtitle.ar || "Directrice executive";
    }

    if (
      !raw ||
      raw.toLowerCase().includes("literie") ||
      raw.toLowerCase().includes("bilal") ||
      raw.toLowerCase().includes("بيع")
    ) {
      return "Directrice executive";
    }
    return raw;
  };

  const getOrg = (): string => {
    let raw = "";
    if (typeof profile.organization === "string" && profile.organization) {
      raw = profile.organization;
    } else if (typeof profile.slogan === "string") {
      raw = profile.slogan;
    } else if (profile.slogan && typeof profile.slogan === "object") {
      raw = profile.slogan.fr || profile.slogan.ar || "REMESS";
    }

    if (
      !raw ||
      raw.toLowerCase().includes("bilal") ||
      raw.toLowerCase().includes("مكان واحد")
    ) {
      return "REMESS";
    }
    return raw;
  };

  const getDescription = () => {
    if (!profile.description) return "";
    if (typeof profile.description === "string") return profile.description;
    return profile.description.fr || profile.description.ar || "";
  };

  const handleSaveContact = () => {
    confetti({
      particleCount: 140,
      spread: 85,
      origin: { y: 0.6 },
      colors: ["#ffffff", "#e2e8f0", "#94a3b8", "#64748b", "#cbd5e1"],
    });
    downloadVCard(profile);
    setSavedContactDone(true);
    setTimeout(() => setSavedContactDone(false), 4500);
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
          title: `${getName()} - ${getTitle()}`,
          text: `${getName()} | ${getOrg()}`,
          url: window.location.href,
        });
      } catch {
        setShareModalOpen(true);
      }
    } else {
      setShareModalOpen(true);
    }
  };

  const phoneCallNumber = profile.phone || "0661633888";
  const whatsappNumber = profile.whatsapp || profile.phone || "0661633888";

  const getWhatsAppUrl = () => {
    const rawWa = whatsappNumber.replace(/[^0-9]/g, "");
    const intlWa = rawWa.startsWith("0") ? `212${rawWa.slice(1)}` : rawWa;
    const text = `Bonjour Mme Ferdaous TAZI, je vous contacte depuis votre carte digitale professionnelle REMESS.`;
    return `https://wa.me/${intlWa}?text=${encodeURIComponent(text)}`;
  };

  const linkedinUrl =
    profile.linkedin?.trim() || "https://www.linkedin.com/in/ferdaous-tazi-961758361/";

  const emailAddress = profile.email || "F.tazi@remess.ma";

  // Dynamic / Custom QR code
  const qrTargetLink =
    (profile.qrCodeUrl && profile.qrCodeUrl.trim()) ||
    currentUrl ||
    (typeof window !== "undefined" ? window.location.origin : "https://www.linkedin.com/in/ferdaous-tazi-961758361/");

  const dynamicQrCode = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&color=08090b&bgcolor=f1f5f9&data=${encodeURIComponent(
    qrTargetLink
  )}`;

  const qrDisplayUrl =
    profile.qrCodeImage && profile.qrCodeImage.trim()
      ? profile.qrCodeImage
      : dynamicQrCode;

  return (
    <div
      dir="ltr"
      className="nfc-page-wrapper selection:bg-[#e2e8f0] selection:text-[#08090b]"
    >
      {/* Background Floating Ambient Particles */}
      <FloatingParticleBackground />

      {/* Top Header */}
      <motion.header
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          backdropFilter: "blur(22px)",
          WebkitBackdropFilter: "blur(22px)",
          backgroundColor: "rgba(8, 9, 12, 0.94)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
          padding: "10px 0",
        }}
      >
        <div
          className="nfc-mobile-container"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "8px",
          }}
        >
          {/* QR Code button */}
          <motion.button
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setQrModalOpen(true)}
            aria-label="QR Code"
            style={{
              width: "35px",
              height: "35px",
              borderRadius: "50%",
              background: "rgba(22, 26, 35, 0.9)",
              border: "1px solid rgba(255, 255, 255, 0.18)",
              color: "#e2e8f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <QrCode style={{ width: 16, height: 16 }} />
          </motion.button>

          {/* Share button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.92 }}
            onClick={handleShareNative}
            aria-label="Partager"
            style={{
              width: "35px",
              height: "35px",
              borderRadius: "50%",
              background: "rgba(22, 26, 35, 0.9)",
              border: "1px solid rgba(255, 255, 255, 0.18)",
              color: "#e2e8f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <Share2 style={{ width: 16, height: 16 }} />
          </motion.button>
        </div>
      </motion.header>

      {/* Main Container with Staggered Motion */}
      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="nfc-mobile-container"
        style={{ paddingTop: "20px", position: "relative", zIndex: 10 }}
      >
        {/* ==========================================================================
            HERO EXECUTIVE PROFILE CARD (WITH 3D TILT & ROTATING CONIC AURA)
            ========================================================================== */}
        <motion.section variants={itemVariants} style={{ marginBottom: "20px" }}>
          <TiltCard className="animated-conic-border">
            <div className="animated-conic-inner" style={{ padding: "28px 22px 24px" }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                }}
              >
                {/* Rotating Halo Portrait Avatar (Only if image is present) */}
                {profile.posterImage && profile.posterImage.trim() ? (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="avatar-halo-ring"
                    style={{ marginBottom: "18px", cursor: "pointer" }}
                    onClick={() => setImageModalOpen(true)}
                  >
                    <div
                      style={{
                        position: "relative",
                        width: "128px",
                        height: "128px",
                        borderRadius: "50%",
                        overflow: "hidden",
                        backgroundColor: "#0d0f14",
                        zIndex: 1,
                      }}
                    >
                      <Image
                        src={profile.posterImage}
                        alt={getName()}
                        fill
                        sizes="140px"
                        priority
                        style={{ objectFit: "cover" }}
                      />
                    </div>

                    {/* Verified Badge on avatar */}
                    <div
                      style={{
                        position: "absolute",
                        bottom: "4px",
                        right: "4px",
                        background: "#08090b",
                        borderRadius: "50%",
                        padding: "3px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.7)",
                        zIndex: 3,
                      }}
                    >
                      <VerifiedBadge size={25} />
                    </div>
                  </motion.div>
                ) : null}

                {/* Name */}
                <motion.h1
                  variants={itemVariants}
                  style={{
                    fontSize: "28px",
                    fontWeight: 900,
                    letterSpacing: "-0.5px",
                    color: "#ffffff",
                    lineHeight: 1.2,
                    marginBottom: "8px",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    flexWrap: "wrap",
                  }}
                >
                  <span>{getName()}</span>
                  {(!profile.posterImage || !profile.posterImage.trim()) && <VerifiedBadge size={24} />}
                </motion.h1>

                {/* Directrice executive field directly under name */}
                <motion.div
                  variants={itemVariants}
                  style={{
                    fontSize: "17px",
                    fontWeight: 700,
                    color: "#cbd5e1",
                    marginBottom: "8px",
                    lineHeight: 1.4,
                    letterSpacing: "0.2px",
                  }}
                >
                  {getTitle()}
                </motion.div>

                {/* REMESS field directly under title */}
                <motion.div
                  variants={itemVariants}
                  whileHover={{ scale: 1.03 }}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "7px",
                    padding: "6px 18px",
                    borderRadius: "30px",
                    background: "rgba(255, 255, 255, 0.08)",
                    border: "1px solid rgba(255, 255, 255, 0.22)",
                    color: "#f8fafc",
                    fontSize: "13px",
                    fontWeight: 800,
                    letterSpacing: "0.6px",
                    marginBottom: "20px",
                    boxShadow: "0 0 16px rgba(255, 255, 255, 0.1)",
                  }}
                >
                  <Building2 style={{ width: 14, height: 14, flexShrink: 0 }} />
                  <span>{getOrg()}</span>
                </motion.div>

                {/* Primary Action Button: Save Contact (vCard) */}
                <motion.button
                  variants={itemVariants}
                  whileHover={{ scale: 1.025, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSaveContact}
                  className="btn-gold-hero"
                  style={{ marginBottom: "10px" }}
                >
                  {savedContactDone ? (
                    <>
                      <CheckCircle2 style={{ width: 20, height: 20, color: "#08090b" }} />
                      <span>✓ Contact Enregistré !</span>
                    </>
                  ) : (
                    <>
                      <Download style={{ width: 20, height: 20 }} />
                      <span>Enregistrer le Contact (vCard)</span>
                    </>
                  )}
                </motion.button>

                <p style={{ fontSize: "11px", color: "#64748b" }}>
                  Téléchargement instantané dans votre carnet d'adresses
                </p>
              </div>
            </div>
          </TiltCard>
        </motion.section>

        {/* ==========================================================================
            EXECUTIVE DIRECT ACTIONS GRID (0661633888, WhatsApp, Email, LinkedIn)
            ========================================================================== */}
        <motion.section variants={itemVariants} style={{ marginBottom: "22px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "10px",
            }}
          >
            {/* Phone */}
            <motion.a
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              href={`tel:${phoneCallNumber}`}
              className="btn-glass-action"
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: "10px",
                padding: "14px 16px",
              }}
            >
              <div
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "12px",
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.18)",
                  color: "#f8fafc",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Phone style={{ width: 18, height: 18 }} />
              </div>
              <div style={{ textAlign: "left", overflow: "hidden" }}>
                <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                  Téléphone
                </div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#ffffff", whiteSpace: "nowrap" }}>
                  {phoneCallNumber}
                </div>
              </div>
            </motion.a>

            {/* WhatsApp */}
            <motion.a
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-glass-action"
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: "10px",
                padding: "14px 16px",
              }}
            >
              <div
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "12px",
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.18)",
                  color: "#f8fafc",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <WhatsAppIcon size={20} />
              </div>
              <div style={{ textAlign: "left", overflow: "hidden" }}>
                <div style={{ fontSize: "11px", color: "#94a3b8" }}>WhatsApp</div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#ffffff", whiteSpace: "nowrap" }}>
                  {whatsappNumber}
                </div>
              </div>
            </motion.a>

            {/* Email: F.tazi@remess.ma */}
            <motion.a
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              href={`mailto:${emailAddress}?subject=${encodeURIComponent("Prise de contact - REMESS / Ferdaous TAZI")}`}
              className="btn-glass-action"
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: "10px",
                padding: "14px 16px",
              }}
            >
              <div
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "12px",
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.18)",
                  color: "#e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Mail style={{ width: 18, height: 18 }} />
              </div>
              <div style={{ textAlign: "left", overflow: "hidden" }}>
                <div style={{ fontSize: "11px", color: "#94a3b8" }}>Email</div>
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#ffffff",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {emailAddress}
                </div>
              </div>
            </motion.a>

            {/* LinkedIn: Ferdaous TAZI */}
            <motion.a
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-glass-action"
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: "10px",
                padding: "14px 16px",
              }}
            >
              <div
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "12px",
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.18)",
                  color: "#f8fafc",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <LinkedInIcon size={19} />
              </div>
              <div style={{ textAlign: "left", overflow: "hidden" }}>
                <div style={{ fontSize: "11px", color: "#94a3b8" }}>LinkedIn</div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#ffffff", whiteSpace: "nowrap" }}>
                  Ferdaous TAZI
                </div>
              </div>
            </motion.a>
          </div>
        </motion.section>

        {/* ==========================================================================
            EXECUTIVE BIOGRAPHY (TEXT EXACT FOURNI)
            ========================================================================== */}
        <motion.section
          variants={itemVariants}
          className="luxury-card card-gold-accent-line"
          style={{ padding: "26px 20px", marginBottom: "26px" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "12px",
                background: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#e2e8f0",
              }}
            >
              <UserCheck style={{ width: 20, height: 20 }} />
            </div>
            <div>
              <h2 style={{ fontSize: "17px", fontWeight: 800, color: "#ffffff" }}>
                Profil & Mission
              </h2>
              <p style={{ fontSize: "11px", color: "#94a3b8" }}>Ferdaous TAZI · REMESS</p>
            </div>
          </div>

          {/* Exact bio text */}
          <div
            style={{
              fontSize: "13.5px",
              lineHeight: 1.8,
              color: "#cbd5e1",
              whiteSpace: "pre-line",
            }}
          >
            {getDescription()}
          </div>
        </motion.section>

        {/* ==========================================================================
            EXECUTIVE FOOTER
            ========================================================================== */}
        <footer style={{ textAlign: "center", padding: "10px 0 20px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 12px",
              borderRadius: "20px",
              background: "rgba(255, 255, 255, 0.04)",
              color: "#64748b",
              fontSize: "11px",
              marginBottom: "8px",
            }}
          >
            <span>Ferdaous TAZI</span>
            <span>•</span>
            <span>REMESS</span>
          </div>
          <p style={{ fontSize: "11px", color: "#475569" }}>
            © {new Date().getFullYear()} {getName()} · {getOrg()}
          </p>
        </footer>
      </motion.main>

      {/* ==========================================================================
          FLOATING BOTTOM BAR FOR MOBILE
          ========================================================================== */}
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 280, damping: 25, delay: 0.3 }}
        className="floating-bottom-bar"
      >
        <div
          style={{
            width: "100%",
            maxWidth: "480px",
            marginLeft: "auto",
            marginRight: "auto",
            paddingLeft: "16px",
            paddingRight: "16px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr auto",
            gap: "8px",
            alignItems: "center",
          }}
        >
          {/* Call button */}
          <motion.a
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            href={`tel:${phoneCallNumber}`}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              padding: "11px 8px",
              borderRadius: "14px",
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.18)",
              color: "#f8fafc",
              fontSize: "12px",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            <Phone style={{ width: 14, height: 14 }} />
            <span>{phoneCallNumber}</span>
          </motion.a>

          {/* WhatsApp */}
          <motion.a
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            href={getWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              padding: "11px 8px",
              borderRadius: "14px",
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.18)",
              color: "#f8fafc",
              fontSize: "12px",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            <WhatsAppIcon size={14} />
            <span>WhatsApp</span>
          </motion.a>

          {/* Email */}
          <motion.a
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            href={`mailto:${emailAddress}`}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              padding: "11px 8px",
              borderRadius: "14px",
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              color: "#e2e8f0",
              fontSize: "12px",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            <Mail style={{ width: 14, height: 14 }} />
            <span>Email</span>
          </motion.a>

          {/* Save vCard icon trigger */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={handleSaveContact}
            aria-label="Save vCard"
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "14px",
              background: "var(--gold-gradient)",
              color: "#08090b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(255, 255, 255, 0.25)",
            }}
          >
            <Download style={{ width: 19, height: 19 }} />
          </motion.button>
        </div>
      </motion.div>

      {/* ==========================================================================
          MODALS WITH ANIMATE PRESENCE
          ========================================================================== */}
      <AnimatePresence>
        {/* QR CODE MODAL */}
        {qrModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={() => setQrModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <QrCode style={{ width: 20, height: 20, color: "#f8fafc" }} />
                  <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#ffffff" }}>
                    QR Code
                  </h3>
                </div>
                <button
                  onClick={() => setQrModalOpen(false)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#94a3b8",
                    cursor: "pointer",
                    padding: "4px",
                  }}
                >
                  <X style={{ width: 20, height: 20 }} />
                </button>
              </div>

              {/* QR Card */}
              <div
                style={{
                  background: "#ffffff",
                  padding: "18px",
                  borderRadius: "20px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                  width: "230px",
                  height: "230px",
                  boxShadow: "0 10px 25px rgba(0, 0, 0, 0.4)",
                }}
              >
                <img
                  src={qrDisplayUrl}
                  alt="QR Code Ferdaous TAZI"
                  style={{ width: "190px", height: "190px", objectFit: "contain" }}
                />
              </div>

              <div style={{ textAlign: "center", marginBottom: "16px" }}>
                <div style={{ fontSize: "15px", fontWeight: 800, color: "#ffffff" }}>
                  {getName()}
                </div>
                <div style={{ fontSize: "12px", color: "#cbd5e1" }}>
                  {getTitle()} · {getOrg()}
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "#94a3b8",
                    marginTop: "6px",
                    maxWidth: "260px",
                    margin: "6px auto 0",
                    wordBreak: "break-all",
                  }}
                >
                  <span style={{ color: "#cbd5e1" }}>Destination : </span>
                  {qrTargetLink}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCopyLink}
                  className="btn-gold-hero"
                  style={{ width: "100%" }}
                >
                  {copied ? (
                    <>
                      <Check style={{ width: 17, height: 17 }} />
                      <span>Lien Copié !</span>
                    </>
                  ) : (
                    <>
                      <Copy style={{ width: 17, height: 17 }} />
                      <span>Copier le Lien Direct</span>
                    </>
                  )}
                </motion.button>

                <button
                  type="button"
                  onClick={() => {
                    const downloadUrl =
                      profile.qrCodeImage && profile.qrCodeImage.trim()
                        ? profile.qrCodeImage
                        : `https://api.qrserver.com/v1/create-qr-code/?size=600x600&color=08090b&bgcolor=f1f5f9&data=${encodeURIComponent(
                            qrTargetLink
                          )}`;
                    const a = document.createElement("a");
                    a.href = downloadUrl;
                    a.download = "qr_code_ferdaous_tazi.png";
                    a.target = "_blank";
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                  }}
                  className="btn-glass-action"
                  style={{ width: "100%", justifyContent: "center", fontSize: "12px", padding: "10px" }}
                >
                  <Download style={{ width: 15, height: 15, color: "#cbd5e1" }} />
                  <span>Télécharger le QR Code (PNG)</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* SHARE MODAL */}
        {shareModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={() => setShareModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Share2 style={{ width: 20, height: 20, color: "#f8fafc" }} />
                  <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#ffffff" }}>
                    Partager la Carte
                  </h3>
                </div>
                <button
                  onClick={() => setShareModalOpen(false)}
                  style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}
                >
                  <X style={{ width: 20, height: 20 }} />
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
                {/* WhatsApp Share */}
                <motion.a
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                    `Ferdaous TAZI - Directrice executive REMESS : ${currentUrl}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-glass-action"
                  style={{ justifyContent: "flex-start", gap: "12px", color: "#f8fafc" }}
                >
                  <WhatsAppRoundIcon size={24} />
                  <span style={{ color: "#ffffff" }}>WhatsApp</span>
                </motion.a>

                {/* LinkedIn Share */}
                <motion.a
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-glass-action"
                  style={{ justifyContent: "flex-start", gap: "12px" }}
                >
                  <LinkedInRoundIcon size={24} />
                  <span style={{ color: "#ffffff" }}>LinkedIn</span>
                </motion.a>

                {/* Email Share */}
                <motion.a
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  href={`mailto:?subject=${encodeURIComponent(
                    `Contact : Ferdaous TAZI - REMESS`
                  )}&body=${encodeURIComponent(
                    `Bonjour,\n\nVoici le contact de Mme Ferdaous TAZI (Directrice executive REMESS) :\n${currentUrl}\n\nCordialement.`
                  )}`}
                  className="btn-glass-action"
                  style={{ justifyContent: "flex-start", gap: "12px" }}
                >
                  <div
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      background: "#f8fafc",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#08090b",
                    }}
                  >
                    <Mail style={{ width: 14, height: 14 }} />
                  </div>
                  <span style={{ color: "#ffffff" }}>Email</span>
                </motion.a>
              </div>

              {/* Copy direct link */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCopyLink}
                className="btn-gold-hero"
              >
                {copied ? (
                  <>
                    <Check style={{ width: 17, height: 17 }} />
                    <span>Lien Copié !</span>
                  </>
                ) : (
                  <>
                    <Copy style={{ width: 17, height: 17 }} />
                    <span>Copier le Lien</span>
                  </>
                )}
              </motion.button>
            </motion.div>
          </motion.div>
        )}

        {/* FULLSCREEN PORTRAIT PREVIEW */}
        {imageModalOpen && profile.posterImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={() => setImageModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              style={{
                position: "relative",
                maxWidth: "420px",
                width: "100%",
                aspectRatio: "1/1",
                borderRadius: "26px",
                overflow: "hidden",
                border: "2px solid #e2e8f0",
                boxShadow: "0 25px 60px rgba(0,0,0,0.85)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={profile.posterImage || "/uploads/ferdaous_tazi.jpg"}
                alt={getName()}
                fill
                style={{ objectFit: "cover" }}
              />
              <button
                onClick={() => setImageModalOpen(false)}
                style={{
                  position: "absolute",
                  top: "12px",
                  right: "12px",
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: "rgba(0,0,0,0.65)",
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
