"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Save,
  ArrowRight,
  Upload,
  Lock,
  Unlock,
  CheckCircle,
  AlertCircle,
  FileJson,
  Phone,
  Image as ImageIcon,
  Shield,
  Eye,
  LogOut,
  Cloud,
  Database,
  Trash2,
  Briefcase,
  QrCode,
  Download,
  ExternalLink,
  Link as LinkIcon,
  RefreshCw,
} from "lucide-react";
import { ProfileData } from "@/lib/types";
import { DEFAULT_PROFILE } from "@/lib/constants";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);
  const [showPin, setShowPin] = useState(false);

  const [profile, setProfile] = useState<ProfileData>(DEFAULT_PROFILE);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingQr, setUploadingQr] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error" | "info"; msg: string } | null>(
    null
  );

  const [activeTab, setActiveTab] = useState<"basic" | "contact" | "qrcode" | "media" | "cloud">("basic");

  // File uploads
  const fileInputRef = useRef<HTMLInputElement>(null);
  const qrFileInputRef = useRef<HTMLInputElement>(null);

  // Storage status
  const [storageStatus, setStorageStatus] = useState<{
    hasKv: boolean;
    hasBlob: boolean;
    hasGithub: boolean;
    isCloudReady: boolean;
  }>({ hasKv: false, hasBlob: false, hasGithub: false, isCloudReady: false });

  useEffect(() => {
    // Eradicate obsolete Bilal keys
    if (typeof window !== "undefined") {
      localStorage.removeItem("bilal_profile_override");
      localStorage.removeItem("bilal_admin_auth");
      localStorage.removeItem("bilal_github_token");
    }

    async function loadData() {
      try {
        const res = await fetch(`/api/profile?t=${Date.now()}`, { cache: "no-store" });
        if (res.ok) {
          const resJson = await res.json();
          const { _storageCapabilities, ...data } = resJson;
          if (_storageCapabilities) {
            setStorageStatus(_storageCapabilities);
          }

          // Strict sanitization for Ferdaous TAZI
          const cleanData = { ...data };
          cleanData.businessName =
            typeof cleanData.businessName === "string"
              ? cleanData.businessName
              : cleanData.businessName?.fr || "Ferdaous TAZI";
          cleanData.title =
            typeof cleanData.title === "string"
              ? cleanData.title
              : (cleanData.title as any)?.fr || "Directrice executive";
          cleanData.organization =
            typeof cleanData.organization === "string"
              ? cleanData.organization
              : (cleanData.organization as any)?.fr || "REMESS";
          cleanData.description =
            typeof cleanData.description === "string"
              ? cleanData.description
              : cleanData.description?.fr || "";
          cleanData.phone = cleanData.phone || "0661633888";
          cleanData.phoneDisplay = cleanData.phoneDisplay || cleanData.phone;
          cleanData.whatsapp = cleanData.whatsapp || cleanData.phone || "0661633888";
          cleanData.email = cleanData.email || "F.tazi@remess.ma";
          cleanData.qrCodeUrl = cleanData.qrCodeUrl ?? "";
          cleanData.qrCodeImage = cleanData.qrCodeImage ?? "";

          if (
            !cleanData.posterImage ||
            cleanData.posterImage.includes("img-1792") ||
            cleanData.posterImage.includes("poster.png") ||
            !cleanData.posterImage.includes("ferdaous")
          ) {
            cleanData.posterImage = "/uploads/ferdaous_tazi.jpg";
          }

          setProfile(cleanData);
        }
      } catch (err) {
        console.warn("Could not fetch profile", err);
      }
    }
    loadData();

    if (sessionStorage.getItem("ferdaous_admin_auth") === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const showToast = (type: "success" | "error" | "info", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4500);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const entered = pinInput.trim();
    const customPin = (profile.adminPin && profile.adminPin.trim()) || "2026";
    if (entered === customPin || entered === "2026") {
      setIsAuthenticated(true);
      sessionStorage.setItem("ferdaous_admin_auth", "true");
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("ferdaous_admin_auth");
    setPinInput("");
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const cleanPhone = (profile.phone || "0661633888").trim();
      const cleanWhatsapp = (profile.whatsapp || cleanPhone || "0661633888").trim();
      const rawWa = cleanWhatsapp.replace(/[^0-9]/g, "");
      const intlWa = rawWa.startsWith("0") ? `212${rawWa.slice(1)}` : rawWa;

      const payload: ProfileData = {
        ...profile,
        phone: cleanPhone,
        phoneDisplay: cleanPhone,
        whatsapp: cleanWhatsapp,
        whatsappLink: `https://wa.me/${intlWa}`,
        email: (profile.email || "F.tazi@remess.ma").trim(),
        linkedin: (profile.linkedin || "https://www.linkedin.com/in/ferdaous-tazi-961758361/").trim(),
        title:
          typeof profile.title === "string"
            ? profile.title.trim()
            : (profile.title as any)?.fr || "Directrice executive",
        subtitle:
          typeof profile.title === "string"
            ? profile.title.trim()
            : (profile.title as any)?.fr || "Directrice executive",
        organization:
          typeof profile.organization === "string"
            ? profile.organization.trim()
            : (profile.organization as any)?.fr || "REMESS",
        slogan:
          typeof profile.organization === "string"
            ? profile.organization.trim()
            : (profile.organization as any)?.fr || "REMESS",
        qrCodeUrl: typeof profile.qrCodeUrl === "string" ? profile.qrCodeUrl.trim() : "",
        qrCodeImage: profile.qrCodeImage || "",
        posterImage: profile.posterImage || "/uploads/ferdaous_tazi.jpg",
      };

      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();
      if (res.ok && resData.success) {
        localStorage.setItem("ferdaous_profile_override", JSON.stringify(payload));
        setProfile(payload);
        showToast("success", resData.message || "✓ Modifications enregistrées avec succès !");
      } else {
        localStorage.setItem("ferdaous_profile_override", JSON.stringify(payload));
        showToast("info", "✓ Enregistré localement dans le navigateur.");
      }
    } catch {
      showToast("error", "Une erreur est survenue lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  // Image Upload handler
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("prefix", "ferdaous_tazi");
    formData.append("oldImage", profile.posterImage || "");

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const newUrl = data.url || data.dataUrl;
        setProfile((prev) => ({ ...prev, posterImage: newUrl }));
        showToast("success", "✓ Photo de profil mise à jour avec succès !");
      } else {
        showToast("error", data.message || "Échec du téléchargement de l'image.");
      }
    } catch {
      showToast("error", "Erreur réseau lors du téléversement de l'image.");
    } finally {
      setUploadingImage(false);
    }
  };

  // QR Code Image Upload handler
  const handleQrImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingQr(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("prefix", "ferdaous_qrcode");
    formData.append("oldImage", profile.qrCodeImage || "");

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const newUrl = data.url || data.dataUrl;
        setProfile((prev) => ({ ...prev, qrCodeImage: newUrl }));
        showToast("success", "✓ Image personnalisée du QR Code enregistrée avec succès !");
      } else {
        showToast("error", data.message || "Échec du téléchargement du QR Code.");
      }
    } catch {
      showToast("error", "Erreur réseau lors du téléversement du QR Code.");
    } finally {
      setUploadingQr(false);
    }
  };

  const handleResetToDefault = () => {
    if (confirm("Voulez-vous vraiment réinitialiser les données officielles de Mme Ferdaous TAZI ?")) {
      setProfile(DEFAULT_PROFILE);
      localStorage.removeItem("ferdaous_profile_override");
      showToast("info", "Données officielles restaurées. Cliquez sur Enregistrer pour appliquer.");
    }
  };

  // Helper getters
  const getNameValue = () => {
    if (typeof profile.businessName === "string") return profile.businessName;
    if (profile.businessName && typeof profile.businessName === "object") {
      return profile.businessName.fr || profile.businessName.ar || "";
    }
    return profile.businessName ?? "";
  };

  const getTitleValue = () => {
    if (typeof profile.title === "string") return profile.title;
    if (typeof profile.subtitle === "string") return profile.subtitle;
    if (profile.subtitle && typeof profile.subtitle === "object") {
      return profile.subtitle.fr || profile.subtitle.ar || "";
    }
    return profile.title ?? "";
  };

  const getOrgValue = () => {
    if (typeof profile.organization === "string") return profile.organization;
    if (typeof profile.slogan === "string") return profile.slogan;
    if (profile.organization && typeof profile.organization === "object") {
      return (profile.organization as any).fr || (profile.organization as any).ar || "";
    }
    if (profile.slogan && typeof profile.slogan === "object") {
      return (profile.slogan as any).fr || (profile.slogan as any).ar || "";
    }
    return profile.organization ?? "";
  };

  const getDescValue = () => {
    if (typeof profile.description === "string") return profile.description;
    if (profile.description && typeof profile.description === "object") {
      return profile.description.fr || profile.description.ar || "";
    }
    return profile.description ?? "";
  };

  // ==========================================================================
  // LOGIN SCREEN
  // ==========================================================================
  if (!isAuthenticated) {
    return (
      <div
        className="nfc-page-wrapper"
        style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 25 }}
          className="luxury-card card-gold-accent-line"
          style={{ width: "100%", maxWidth: "420px", padding: "38px 28px", textAlign: "center" }}
        >
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "20px",
              background: "rgba(229, 192, 110, 0.15)",
              border: "1px solid rgba(229, 192, 110, 0.35)",
              color: "#e5c06e",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 18px",
            }}
          >
            <Lock style={{ width: 30, height: 30 }} />
          </motion.div>

          <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#ffffff", marginBottom: "6px" }}>
            Espace Administration
          </h2>
          <p style={{ fontSize: "13px", color: "#e5c06e", marginBottom: "4px", fontWeight: 700 }}>
            Ferdaous TAZI · REMESS
          </p>
          <p style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "24px" }}>
            Veuillez saisir votre code PIN sécurisé (par défaut : 2026)
          </p>

          <form onSubmit={handleLogin}>
            <div style={{ position: "relative", marginBottom: "18px" }}>
              <input
                type={showPin ? "text" : "password"}
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError(false);
                }}
                placeholder="Code PIN (ex: 2026)"
                style={{
                  width: "100%",
                  padding: "15px 18px",
                  borderRadius: "15px",
                  background: "rgba(4, 13, 11, 0.9)",
                  border: pinError ? "2px solid #ef4444" : "1px solid rgba(229, 192, 110, 0.35)",
                  color: "#ffffff",
                  fontSize: "17px",
                  textAlign: "center",
                  letterSpacing: "4px",
                  outline: "none",
                }}
                autoFocus
              />
            </div>

            {pinError && (
              <motion.p
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ color: "#ef4444", fontSize: "12px", marginBottom: "14px" }}
              >
                Code PIN incorrect. Veuillez réessayer (2026).
              </motion.p>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="btn-gold-hero"
              style={{ marginBottom: "16px" }}
            >
              <Unlock style={{ width: 18, height: 18 }} />
              <span>Connexion Administrateur</span>
            </motion.button>

            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                color: "#94a3b8",
                fontSize: "12px",
                textDecoration: "none",
              }}
            >
              <ArrowRight style={{ width: 14, height: 14 }} />
              <span>Retour à la carte</span>
            </Link>
          </form>
        </motion.div>
      </div>
    );
  }

  // ==========================================================================
  // DASHBOARD MAIN
  // ==========================================================================
  return (
    <div className="nfc-page-wrapper" style={{ paddingBottom: "80px" }}>
      {/* Toast Notification with AnimatePresence */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            style={{
              position: "fixed",
              top: "20px",
              right: "20px",
              left: "20px",
              maxWidth: "460px",
              margin: "0 auto",
              zIndex: 100,
              padding: "14px 20px",
              borderRadius: "16px",
              background:
                toast.type === "success"
                  ? "#064e3b"
                  : toast.type === "error"
                  ? "#7f1d1d"
                  : "#1e293b",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "#ffffff",
              fontSize: "13px",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: "10px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            }}
          >
            {toast.type === "success" && <CheckCircle style={{ width: 18, height: 18, color: "#34d399" }} />}
            {toast.type === "error" && <AlertCircle style={{ width: 18, height: 18, color: "#f87171" }} />}
            <span>{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Bar */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          backdropFilter: "blur(22px)",
          backgroundColor: "rgba(4, 13, 11, 0.9)",
          borderBottom: "1px solid rgba(229, 192, 110, 0.2)",
          padding: "12px 0",
        }}
      >
        <div
          className="admin-container"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "12px",
                background: "rgba(229, 192, 110, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#e5c06e",
              }}
            >
              <Shield style={{ width: 20, height: 20 }} />
            </div>
            <div>
              <div style={{ fontSize: "14.5px", fontWeight: 800, color: "#ffffff" }}>
                Tableau de Bord REMESS
              </div>
              <div style={{ fontSize: "11px", color: "#e5c06e" }}>
                Ferdaous TAZI · Administration
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {/* View live public page */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/"
                target="_blank"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "9px 15px",
                  borderRadius: "14px",
                  background: "rgba(11, 33, 28, 0.85)",
                  border: "1px solid rgba(229, 192, 110, 0.3)",
                  color: "#f8fafc",
                  fontSize: "12px",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                <Eye style={{ width: 14, height: 14 }} />
                <span>Voir la Carte</span>
              </Link>
            </motion.div>

            {/* Save trigger */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSave}
              disabled={saving}
              className="btn-gold-hero"
              style={{
                width: "auto",
                padding: "9px 18px",
                fontSize: "13px",
                borderRadius: "14px",
              }}
            >
              <Save style={{ width: 15, height: 15 }} />
              <span>{saving ? "Enregistrement..." : "Enregistrer"}</span>
            </motion.button>

            {/* Logout */}
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={handleLogout}
              style={{
                padding: "9px 13px",
                borderRadius: "14px",
                background: "rgba(255, 255, 255, 0.06)",
                border: "none",
                color: "#94a3b8",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              <LogOut style={{ width: 16, height: 16 }} />
            </motion.button>
          </div>
        </div>
      </header>

      {/* Main Form Body */}
      <main className="admin-container" style={{ paddingTop: "24px" }}>
        {/* Navigation Tabs */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            overflowX: "auto",
            paddingBottom: "12px",
            marginBottom: "20px",
          }}
        >
          {[
            { id: "basic", label: "Identité & Présentation", icon: Briefcase },
            { id: "contact", label: "Coordonnées (Téléphone / WhatsApp / Email)", icon: Phone },
            { id: "qrcode", label: "QR Code & Carte", icon: QrCode },
            { id: "media", label: "Photo de Profil", icon: ImageIcon },
            { id: "cloud", label: "Cloud Vercel & Sync", icon: Cloud },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 16px",
                  borderRadius: "14px",
                  background: active ? "var(--gold-gradient)" : "rgba(11, 33, 28, 0.7)",
                  border: active
                    ? "1px solid rgba(229, 192, 110, 0.6)"
                    : "1px solid rgba(255, 255, 255, 0.08)",
                  color: active ? "#040d0b" : "#94a3b8",
                  fontSize: "13px",
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                <Icon style={{ width: 16, height: 16 }} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Panes with Motion Reveal */}
        <AnimatePresence mode="wait">
          {/* TAB 1: BASIC INFO & BIO */}
          {activeTab === "basic" && (
            <motion.div
              key="basic"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="luxury-card"
              style={{ padding: "26px 22px" }}
            >
              <h3 style={{ fontSize: "17px", fontWeight: 800, color: "#ffffff", marginBottom: "18px" }}>
                Identité Professionnelle
              </h3>

              {/* Name */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "12px", color: "#e5c06e", fontWeight: 700, marginBottom: "6px" }}>
                  Nom & Prénom
                </label>
                <input
                  type="text"
                  value={getNameValue()}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      businessName: e.target.value,
                    })
                  }
                  style={inputStyle}
                />
              </div>

              {/* Directrice executive field under name */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "12.5px", color: "#e5c06e", fontWeight: 700, marginBottom: "6px" }}>
                  Directrice executive
                </label>
                <input
                  type="text"
                  placeholder="Ex: Directrice executive"
                  value={getTitleValue()}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      title: e.target.value,
                      subtitle: e.target.value,
                    })
                  }
                  style={inputStyle}
                />
                <span style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px", display: "block" }}>
                  Champ affiché directement sous le nom sur la carte
                </span>
              </div>

              {/* REMESS field under title */}
              <div style={{ marginBottom: "18px" }}>
                <label style={{ display: "block", fontSize: "12.5px", color: "#e5c06e", fontWeight: 700, marginBottom: "6px" }}>
                  REMESS
                </label>
                <input
                  type="text"
                  placeholder="Ex: REMESS"
                  value={getOrgValue()}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      organization: e.target.value,
                      slogan: e.target.value,
                    })
                  }
                  style={inputStyle}
                />
                <span style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px", display: "block" }}>
                  Organisation affichée sous le titre de poste
                </span>
              </div>

              {/* Presentation Text */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "12px", color: "#e5c06e", fontWeight: 700, marginBottom: "6px" }}>
                  Texte de Présentation Officiel
                </label>
                <textarea
                  rows={8}
                  value={getDescValue()}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      description: e.target.value,
                    })
                  }
                  style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
                />
              </div>

              {/* Admin PIN */}
              <div style={{ maxWidth: "300px" }}>
                <label style={{ display: "block", fontSize: "12px", color: "#e5c06e", fontWeight: 700, marginBottom: "6px" }}>
                  Code PIN Administrateur
                </label>
                <input
                  type="text"
                  value={profile.adminPin}
                  onChange={(e) => setProfile({ ...profile, adminPin: e.target.value })}
                  style={inputStyle}
                />
              </div>
            </motion.div>
          )}

          {/* TAB 2: CONTACT & NETWORKS */}
          {activeTab === "contact" && (
            <motion.div
              key="contact"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="luxury-card"
              style={{ padding: "26px 22px" }}
            >
              <h3 style={{ fontSize: "17px", fontWeight: 800, color: "#ffffff", marginBottom: "18px" }}>
                Coordonnées Directes
              </h3>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
                {/* Phone */}
                <div>
                  <label style={{ display: "block", fontSize: "12.5px", color: "#e5c06e", fontWeight: 700, marginBottom: "6px" }}>
                    Téléphone (Appels)
                  </label>
                  <input
                    type="text"
                    placeholder="0661633888"
                    value={profile.phone ?? ""}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        phone: e.target.value,
                        phoneDisplay: e.target.value,
                      })
                    }
                    style={inputStyle}
                  />
                  <span style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px", display: "block" }}>
                    Numéro pour les appels vocaux directs
                  </span>
                </div>

                {/* WhatsApp */}
                <div>
                  <label style={{ display: "block", fontSize: "12.5px", color: "#e5c06e", fontWeight: 700, marginBottom: "6px" }}>
                    WhatsApp (Messagerie)
                  </label>
                  <input
                    type="text"
                    placeholder="0661633888"
                    value={profile.whatsapp ?? ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      const raw = val.replace(/[^0-9]/g, "");
                      const intl = raw.startsWith("0") ? `212${raw.slice(1)}` : raw;
                      setProfile({
                        ...profile,
                        whatsapp: val,
                        whatsappLink: `https://wa.me/${intl}`,
                      });
                    }}
                    style={inputStyle}
                  />
                  <span style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px", display: "block" }}>
                    Numéro dédié à la messagerie WhatsApp
                  </span>
                </div>

                {/* Email */}
                <div>
                  <label style={{ display: "block", fontSize: "12.5px", color: "#e5c06e", fontWeight: 700, marginBottom: "6px" }}>
                    Adresse Email (F.tazi@remess.ma)
                  </label>
                  <input
                    type="email"
                    placeholder="F.tazi@remess.ma"
                    value={profile.email ?? ""}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    style={inputStyle}
                  />
                  <span style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px", display: "block" }}>
                    Adresse de réception des courriels professionnels
                  </span>
                </div>

                {/* LinkedIn */}
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", fontSize: "12.5px", color: "#e5c06e", fontWeight: 700, marginBottom: "6px" }}>
                    Lien Profil LinkedIn
                  </label>
                  <input
                    type="url"
                    placeholder="https://www.linkedin.com/in/ferdaous-tazi-961758361/"
                    value={profile.linkedin ?? ""}
                    onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
                    style={inputStyle}
                  />
                  <span style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px", display: "block" }}>
                    Lien direct vers le profil professionnel LinkedIn
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB: QR CODE & CARTE */}
          {activeTab === "qrcode" && (
            <motion.div
              key="qrcode"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="luxury-card"
              style={{ padding: "26px 22px" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                <QrCode style={{ width: 22, height: 22, color: "#e5c06e" }} />
                <h3 style={{ fontSize: "17px", fontWeight: 800, color: "#ffffff", margin: 0 }}>
                  Gestion & Liaison du QR Code
                </h3>
              </div>
              <p style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "22px" }}>
                Générez, personnalisez et reliez le QR Code directement à la page principale de la carte ou à un lien externe de votre choix.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
                {/* Left side: Configuration & Quick links */}
                <div>
                  {/* Target URL Input */}
                  <div style={{ marginBottom: "20px" }}>
                    <label style={{ display: "block", fontSize: "12.5px", color: "#e5c06e", fontWeight: 700, marginBottom: "6px" }}>
                      Lien de Destination du QR Code (URL cible)
                    </label>
                    <input
                      type="url"
                      placeholder={typeof window !== "undefined" ? window.location.origin : "https://votre-carte.com"}
                      value={profile.qrCodeUrl ?? ""}
                      onChange={(e) => setProfile({ ...profile, qrCodeUrl: e.target.value })}
                      style={inputStyle}
                    />
                    <span style={{ fontSize: "11px", color: "#94a3b8", marginTop: "5px", display: "block" }}>
                      {profile.qrCodeUrl
                        ? `Le QR Code redirigera les scanners vers : ${profile.qrCodeUrl}`
                        : "Lien automatique actif : Redirige vers la page d'accueil de cette carte digitale."}
                    </span>
                  </div>

                  {/* Preset Quick Buttons */}
                  <div style={{ marginBottom: "22px" }}>
                    <span style={{ display: "block", fontSize: "11.5px", color: "#ffffff", fontWeight: 700, marginBottom: "8px" }}>
                      Raccourcis de liaison rapide :
                    </span>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <button
                        type="button"
                        onClick={() => {
                          const origin = typeof window !== "undefined" ? window.location.origin : "";
                          setProfile({ ...profile, qrCodeUrl: origin });
                          showToast("info", "✓ Lié à la page principale de la carte !");
                        }}
                        className="btn-glass-action"
                        style={{ justifyContent: "flex-start", fontSize: "12px", padding: "10px 14px", width: "100%" }}
                      >
                        <LinkIcon style={{ width: 15, height: 15, color: "#34d399" }} />
                        <span>Lier à la Page Principale (Accueil de la Carte)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const ln = (profile.linkedin && profile.linkedin.trim()) || "https://www.linkedin.com/in/ferdaous-tazi-961758361/";
                          setProfile({ ...profile, qrCodeUrl: ln });
                          showToast("info", "✓ Lié au profil LinkedIn !");
                        }}
                        className="btn-glass-action"
                        style={{ justifyContent: "flex-start", fontSize: "12px", padding: "10px 14px", width: "100%" }}
                      >
                        <ExternalLink style={{ width: 15, height: 15, color: "#60a5fa" }} />
                        <span>Lier au profil LinkedIn officiel</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const wa = (profile.whatsappLink && profile.whatsappLink.trim()) || "https://wa.me/212661633888";
                          setProfile({ ...profile, qrCodeUrl: wa });
                          showToast("info", "✓ Lié à WhatsApp direct !");
                        }}
                        className="btn-glass-action"
                        style={{ justifyContent: "flex-start", fontSize: "12px", padding: "10px 14px", width: "100%" }}
                      >
                        <Phone style={{ width: 15, height: 15, color: "#34d399" }} />
                        <span>Lier à la discussion WhatsApp directe</span>
                      </button>

                      {profile.qrCodeUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            setProfile({ ...profile, qrCodeUrl: "" });
                            showToast("info", "✓ Réinitialisé au lien automatique par défaut.");
                          }}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "#94a3b8",
                            fontSize: "11px",
                            cursor: "pointer",
                            textAlign: "left",
                            padding: "4px 8px",
                            textDecoration: "underline",
                          }}
                        >
                          Effacer et revenir au lien automatique (URL de visite)
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Custom Uploaded QR Code Image */}
                  <div
                    style={{
                      background: "rgba(4, 13, 11, 0.6)",
                      border: "1px dashed rgba(229, 192, 110, 0.35)",
                      borderRadius: "14px",
                      padding: "16px",
                    }}
                  >
                    <span style={{ display: "block", fontSize: "12px", color: "#e5c06e", fontWeight: 700, marginBottom: "4px" }}>
                      Image Personnalisée du QR Code (Optionnel)
                    </span>
                    <p style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "12px", lineHeight: 1.5 }}>
                      Si vous disposez d'un fichier QR Code fourni par un imprimeur pour une carte NFC ou un flyer, importez-le ici.
                    </p>

                    <input
                      ref={qrFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleQrImageFileChange}
                      style={{ display: "none" }}
                    />

                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                      <button
                        type="button"
                        onClick={() => qrFileInputRef.current?.click()}
                        disabled={uploadingQr}
                        className="btn-glass-action"
                        style={{ fontSize: "12px" }}
                      >
                        <Upload style={{ width: 14, height: 14 }} />
                        <span>{uploadingQr ? "Téléversement..." : "Importer une image QR Code"}</span>
                      </button>

                      {profile.qrCodeImage && (
                        <button
                          type="button"
                          onClick={() => {
                            setProfile({ ...profile, qrCodeImage: "" });
                            showToast("info", "Image personnalisée retirée. QR Code dynamique réactivé.");
                          }}
                          style={{
                            background: "rgba(239, 68, 68, 0.15)",
                            border: "1px solid rgba(239, 68, 68, 0.3)",
                            color: "#f87171",
                            borderRadius: "10px",
                            padding: "7px 12px",
                            fontSize: "11.5px",
                            cursor: "pointer",
                            fontWeight: 600,
                          }}
                        >
                          Retirer l'image & Utiliser le QR généré
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right side: Live QR Preview Card */}
                <div
                  style={{
                    background: "radial-gradient(ellipse at top, rgba(16, 44, 38, 0.7), rgba(4, 13, 11, 0.95))",
                    border: "1px solid rgba(229, 192, 110, 0.25)",
                    borderRadius: "18px",
                    padding: "20px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                  }}
                >
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#e5c06e", marginBottom: "14px", textTransform: "uppercase", letterSpacing: "1px" }}>
                    Aperçu en Direct du QR Code
                  </span>

                  <div
                    style={{
                      background: "#ffffff",
                      padding: "16px",
                      borderRadius: "18px",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                      marginBottom: "16px",
                    }}
                  >
                    <img
                      src={
                        profile.qrCodeImage && profile.qrCodeImage.trim()
                          ? profile.qrCodeImage
                          : `https://api.qrserver.com/v1/create-qr-code/?size=400x400&color=040d0b&bgcolor=e5c06e&data=${encodeURIComponent(
                              (profile.qrCodeUrl && profile.qrCodeUrl.trim()) ||
                              (typeof window !== "undefined" ? window.location.origin : "https://remess.ma")
                            )}`
                      }
                      alt="QR Code Preview"
                      style={{ width: "180px", height: "180px", objectFit: "contain", display: "block" }}
                    />
                  </div>

                  <div style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "14px", maxWidth: "260px", wordBreak: "break-all" }}>
                    <strong style={{ color: "#ffffff" }}>Cible : </strong>
                    {(profile.qrCodeUrl && profile.qrCodeUrl.trim()) || (typeof window !== "undefined" ? window.location.origin : "/")}
                  </div>

                  {/* Actions for QR code */}
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center", width: "100%" }}>
                    <button
                      type="button"
                      onClick={() => {
                        const qrUrlToDownload =
                          profile.qrCodeImage && profile.qrCodeImage.trim()
                            ? profile.qrCodeImage
                            : `https://api.qrserver.com/v1/create-qr-code/?size=600x600&color=040d0b&bgcolor=e5c06e&data=${encodeURIComponent(
                                (profile.qrCodeUrl && profile.qrCodeUrl.trim()) ||
                                (typeof window !== "undefined" ? window.location.origin : "https://remess.ma")
                              )}`;
                        
                        const a = document.createElement("a");
                        a.href = qrUrlToDownload;
                        a.download = "qr_code_ferdaous_tazi.png";
                        a.target = "_blank";
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                        showToast("success", "✓ Téléchargement du QR Code lancé !");
                      }}
                      className="btn-glass-action"
                      style={{ fontSize: "11.5px", padding: "8px 12px" }}
                    >
                      <Download style={{ width: 14, height: 14, color: "#e5c06e" }} />
                      <span>Télécharger PNG</span>
                    </button>

                    <a
                      href={(profile.qrCodeUrl && profile.qrCodeUrl.trim()) || "/"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-glass-action"
                      style={{ fontSize: "11.5px", padding: "8px 12px", textDecoration: "none" }}
                    >
                      <ExternalLink style={{ width: 14, height: 14 }} />
                      <span>Tester le lien</span>
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: MEDIA */}
          {activeTab === "media" && (
            <motion.div
              key="media"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="luxury-card"
              style={{ padding: "26px 22px" }}
            >
              <h3 style={{ fontSize: "17px", fontWeight: 800, color: "#ffffff", marginBottom: "18px" }}>
                Photo de Profil Officielle
              </h3>

              <div style={{ maxWidth: "340px", margin: "0 auto", textAlign: "center", padding: "24px", background: "rgba(4, 13, 11, 0.7)", borderRadius: "20px", border: "1px solid rgba(229, 192, 110, 0.2)" }}>
                <div
                  style={{
                    position: "relative",
                    width: "140px",
                    height: "140px",
                    borderRadius: "50%",
                    overflow: "hidden",
                    margin: "0 auto 16px",
                    border: "3px solid #e5c06e",
                    boxShadow: "0 0 20px rgba(229, 192, 110, 0.3)",
                  }}
                >
                  <Image
                    src={profile.posterImage || "/uploads/ferdaous_tazi.jpg"}
                    alt="Ferdaous TAZI"
                    fill
                    style={{ objectFit: "cover" }}
                  />
                </div>

                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={handleImageFileChange}
                />

                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="btn-gold-hero"
                  style={{ width: "auto", padding: "10px 20px", fontSize: "12px" }}
                >
                  <Upload style={{ width: 14, height: 14 }} />
                  <span>{uploadingImage ? "Téléchargement..." : "Changer la Photo"}</span>
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* TAB 4: CLOUD VERCEL */}
          {activeTab === "cloud" && (
            <motion.div
              key="cloud"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="luxury-card"
              style={{ padding: "26px 22px" }}
            >
              <h3 style={{ fontSize: "17px", fontWeight: 800, color: "#ffffff", marginBottom: "18px" }}>
                Synchronisation Globale & Stockage Vercel
              </h3>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "14px", marginBottom: "24px" }}>
                <div
                  style={{
                    padding: "16px",
                    borderRadius: "14px",
                    background: storageStatus.hasKv ? "rgba(16, 185, 129, 0.15)" : "rgba(255, 255, 255, 0.04)",
                    border: storageStatus.hasKv
                      ? "1px solid rgba(16, 185, 129, 0.4)"
                      : "1px solid rgba(255, 255, 255, 0.08)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                    <Database style={{ width: 18, height: 18, color: storageStatus.hasKv ? "#34d399" : "#94a3b8" }} />
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "#ffffff" }}>
                      Vercel KV / Upstash Redis
                    </span>
                  </div>
                  <div style={{ fontSize: "12px", color: storageStatus.hasKv ? "#34d399" : "#94a3b8" }}>
                    {storageStatus.hasKv
                      ? "✓ Connecté & Actif : Sauvegarde automatique en temps réel."
                      : "Non configuré (Variables KV_REST_API_URL absentes)."}
                  </div>
                </div>

                <div
                  style={{
                    padding: "16px",
                    borderRadius: "14px",
                    background: storageStatus.hasBlob ? "rgba(16, 185, 129, 0.15)" : "rgba(255, 255, 255, 0.04)",
                    border: storageStatus.hasBlob
                      ? "1px solid rgba(16, 185, 129, 0.4)"
                      : "1px solid rgba(255, 255, 255, 0.08)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                    <Cloud style={{ width: 18, height: 18, color: storageStatus.hasBlob ? "#34d399" : "#94a3b8" }} />
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "#ffffff" }}>
                      Vercel Blob Storage
                    </span>
                  </div>
                  <div style={{ fontSize: "12px", color: storageStatus.hasBlob ? "#34d399" : "#94a3b8" }}>
                    {storageStatus.hasBlob
                      ? "✓ Connecté & Actif : Hébergement cloud des images."
                      : "Non configuré (BLOB_READ_WRITE_TOKEN absent)."}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(profile, null, 2));
                    const downloadAnchor = document.createElement("a");
                    downloadAnchor.setAttribute("href", dataStr);
                    downloadAnchor.setAttribute("download", "ferdaous_tazi_profile.json");
                    document.body.appendChild(downloadAnchor);
                    downloadAnchor.click();
                    downloadAnchor.remove();
                  }}
                  className="btn-glass-action"
                  style={{ fontSize: "12px" }}
                >
                  <FileJson style={{ width: 14, height: 14 }} />
                  <span>Exporter profile.json</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleResetToDefault}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "10px 18px",
                    borderRadius: "14px",
                    background: "rgba(239, 68, 68, 0.15)",
                    border: "1px solid rgba(239, 68, 68, 0.35)",
                    color: "#f87171",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  <Trash2 style={{ width: 14, height: 14 }} />
                  <span>Réinitialiser aux valeurs de Ferdaous TAZI</span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "12px",
  background: "rgba(4, 13, 11, 0.85)",
  border: "1px solid rgba(229, 192, 110, 0.25)",
  color: "#ffffff",
  fontSize: "13px",
  outline: "none",
  transition: "border-color 0.2s ease",
};
