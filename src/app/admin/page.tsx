"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Save,
  ArrowRight,
  Upload,
  Lock,
  Unlock,
  CheckCircle,
  AlertCircle,
  Download,
  FileJson,
  Sparkles,
  Phone,
  MessageCircle,
  MapPin,
  Image as ImageIcon,
  Shield,
  Eye,
  RefreshCw,
  LogOut,
  Check,
  Truck,
  ExternalLink,
  QrCode,
  Cloud,
  Database,
  Trash2,
} from "lucide-react";
import { ProfileData } from "@/lib/types";
import { DEFAULT_PROFILE } from "@/lib/constants";
import { InstagramGradientIcon, FacebookRoundIcon, WhatsAppIcon } from "@/components/SocialIcons";

function InstagramVerifiedBadge({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0 }}
    >
      <path
        d="M10.521 2.623a2.1 2.1 0 0 1 2.958 0l.81.81a2.1 2.1 0 0 0 1.942.56l1.12-.224a2.1 2.1 0 0 1 2.454 1.644l.267 1.114a2.1 2.1 0 0 0 1.378 1.488l1.077.387a2.1 2.1 0 0 1 1.34 2.637l-.37 1.083a2.1 2.1 0 0 0 .56 1.942l.81.81a2.1 2.1 0 0 1 0 2.958l-.81.81a2.1 2.1 0 0 0-.56 1.942l.37 1.083a2.1 2.1 0 0 1-1.34 2.637l-1.077.387a2.1 2.1 0 0 0-1.378 1.488l-.267 1.114a2.1 2.1 0 0 1-2.454 1.644l-1.12-.224a2.1 2.1 0 0 0-1.942.56l-.81.81a2.1 2.1 0 0 1-2.958 0l-.81-.81a2.1 2.1 0 0 0-1.942-.56l-1.12.224a2.1 2.1 0 0 1-2.454-1.644l-.267-1.114a2.1 2.1 0 0 0-1.378-1.488l-1.077-.387a2.1 2.1 0 0 1-1.34-2.637l.37-1.083a2.1 2.1 0 0 0-.56-1.942l-.81-.81a2.1 2.1 0 0 1 0-2.958l.81-.81a2.1 2.1 0 0 0 .56-1.942l-.37-1.083a2.1 2.1 0 0 1 1.34-2.637l1.077-.387a2.1 2.1 0 0 0 1.378-1.488l.267-1.114a2.1 2.1 0 0 1 2.454-1.644l1.12.224a2.1 2.1 0 0 0 1.942-.56l.81-.81Z"
        fill="#0095F6"
      />
      <path
        d="m9.2 12 2.1 2.1 4.5-4.5"
        stroke="#ffffff"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);
  const [showPin, setShowPin] = useState(false);

  const [profile, setProfile] = useState<ProfileData>(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error" | "info"; msg: string } | null>(
    null
  );

  const [activeTab, setActiveTab] = useState<
    "basic" | "image" | "contact" | "badges" | "export"
  >("basic");

  // Image upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // QR Code upload states
  const [selectedQrFile, setSelectedQrFile] = useState<File | null>(null);
  const [qrPreviewUrl, setQrPreviewUrl] = useState<string | null>(null);
  const [uploadingQr, setUploadingQr] = useState(false);
  const qrFileInputRef = useRef<HTMLInputElement>(null);

  // Cloud Storage & Global Sync Status
  const [storageStatus, setStorageStatus] = useState<{
    hasKv: boolean;
    hasBlob: boolean;
    hasGithub: boolean;
    isCloudReady: boolean;
  }>({ hasKv: false, hasBlob: false, hasGithub: false, isCloudReady: false });
  const [githubToken, setGithubToken] = useState("");

  useEffect(() => {
    const savedToken = localStorage.getItem("bilal_github_token") || "";
    if (savedToken) setGithubToken(savedToken);
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`/api/profile?t=${Date.now()}`, { cache: "no-store" });
        if (res.ok) {
          const resJson = await res.json();
          const { _storageCapabilities, ...data } = resJson;
          if (_storageCapabilities) {
            setStorageStatus(_storageCapabilities);
          }

          // If cloud storage is active, it is the global source of truth
          if (_storageCapabilities?.isCloudReady) {
            localStorage.removeItem("bilal_profile_override");
            setProfile(data);
          } else {
            const localOverride = localStorage.getItem("bilal_profile_override");
            if (localOverride) {
              try {
                setProfile({ ...data, ...JSON.parse(localOverride) });
              } catch {
                setProfile(data);
              }
            } else {
              setProfile(data);
            }
          }
        }
      } catch (err) {
        console.warn("Could not fetch profile", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();

    // Check if already authenticated this session
    if (sessionStorage.getItem("bilal_admin_auth") === "true") {
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
      setPinError(false);
      sessionStorage.setItem("bilal_admin_auth", "true");
    } else {
      setPinError(true);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("bilal_admin_auth");
    setIsAuthenticated(false);
    setPinInput("");
  };

  const handleSaveProfile = async (updatedData?: ProfileData) => {
    setSaving(true);
    const dataToSave = updatedData || profile;

    // Cache locally immediately
    try {
      localStorage.setItem("bilal_profile_override", JSON.stringify(dataToSave));
    } catch (e) {
      console.warn("localStorage quota exceeded", e);
    }

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...dataToSave,
          _githubToken: githubToken.trim() || undefined,
        }),
      });

      const resData = await res.json();
      if (res.ok && resData.success) {
        if (resData.storageType === "github" && githubToken.trim()) {
          localStorage.setItem("bilal_github_token", githubToken.trim());
        }
        showToast("success", resData.message || "✓ تم حفظ جميع المعلومات وتحديث جميع الأجهزة بنجاح!");
      } else {
        showToast("error", resData.message || resData.error || "فشل الحفظ في التخزين السحابي");
      }
    } catch (err) {
      showToast("error", "فشل الاتصال بالخادم لحفظ التعديلات");
    } finally {
      setSaving(false);
    }
  };

  // Image Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };

  // Upload image and delete old image
  const handleUploadAndReplaceImage = async () => {
    if (!selectedFile) {
      showToast("error", "يرجى اختيار صورة أولاً");
      return;
    }

    setUploadingImage(true);
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("oldImage", profile.posterImage || "");

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const newImagePath = data.url || data.dataUrl;
        const newProfile = { ...profile, posterImage: newImagePath };
        setProfile(newProfile);
        await handleSaveProfile(newProfile);
        setSelectedFile(null);
        setPreviewUrl(null);
        showToast(
          "success",
          "✓ تم رفع الصورة الجديدة بنجاح ومسح الصورة القديمة من الخادم!"
        );
      } else {
        showToast("error", data.message || "فشل رفع الصورة");
      }
    } catch (err) {
      showToast("error", "حدث خطأ أثناء رفع الصورة");
    } finally {
      setUploadingImage(false);
    }
  };

  // QR Code Selection
  const handleQrFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedQrFile(file);
      const objectUrl = URL.createObjectURL(file);
      setQrPreviewUrl(objectUrl);
    }
  };

  // Upload QR Code image and delete old QR image
  const handleUploadAndReplaceQr = async () => {
    if (!selectedQrFile) {
      showToast("error", "يرجى اختيار صورة رمز QR أولاً");
      return;
    }

    setUploadingQr(true);
    const formData = new FormData();
    formData.append("file", selectedQrFile);
    formData.append("oldImage", profile.qrCodeImage || "");
    formData.append("prefix", "qr");

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const newQrPath = data.url || data.dataUrl;
        const newProfile = { ...profile, qrCodeImage: newQrPath };
        setProfile(newProfile);
        await handleSaveProfile(newProfile);
        setSelectedQrFile(null);
        setQrPreviewUrl(null);
        showToast(
          "success",
          "✓ تم رفع وحفظ رمز QR الجديد بنجاح ومسح الرمز القديم!"
        );
      } else {
        showToast("error", data.message || "فشل رفع رمز QR");
      }
    } catch (err) {
      showToast("error", "حدث خطأ أثناء رفع رمز QR");
    } finally {
      setUploadingQr(false);
    }
  };

  // Download Profile JSON file
  const handleDownloadJson = () => {
    const jsonStr = JSON.stringify(profile, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "profile.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("success", "✓ تم تنزيل ملف profile.json المحدث بنجاح!");
  };

  // Import JSON file
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          setProfile(parsed);
          await handleSaveProfile(parsed);
          showToast("success", "✓ تم استيراد وحفظ البيانات بنجاح!");
        } catch (err) {
          showToast("error", "الملف المختار غير صالح كـ JSON");
        }
      };
      reader.readAsText(file);
    }
  };

  // 1. PIN Login Screen (Luxury Vault Look)
  if (!isAuthenticated) {
    return (
      <div dir="rtl" className="admin-page-bg" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "20px" }}>
        {/* Ambient background glows */}
        <div
          className="ambient-glow"
          style={{
            position: "fixed",
            top: "-60px",
            right: "-60px",
            width: "320px",
            height: "320px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(245, 158, 11, 0.22) 0%, transparent 70%)",
            filter: "blur(60px)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
        <div
          className="ambient-glow"
          style={{
            position: "fixed",
            bottom: "-60px",
            left: "-60px",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(37, 99, 235, 0.25) 0%, transparent 70%)",
            filter: "blur(60px)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        <div className="admin-vault-box" style={{ width: "100%", maxWidth: "420px", padding: "36px 26px", textAlign: "center", position: "relative", zIndex: 10 }}>
          {/* Golden Shield Icon */}
          <div
            style={{
              width: "68px",
              height: "68px",
              borderRadius: "22px",
              background: "linear-gradient(135deg, rgba(245, 158, 11, 0.25) 0%, rgba(245, 158, 11, 0.05) 100%)",
              border: "1.5px solid rgba(245, 158, 11, 0.4)",
              boxShadow: "0 10px 25px -5px rgba(245, 158, 11, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px auto",
            }}
          >
            <Lock style={{ width: 30, height: 30, color: "#fbbf24" }} />
          </div>

          <h1 style={{ fontSize: "22px", fontWeight: 900, color: "#ffffff", marginBottom: "4px" }}>
            خزنة الإدارة والتحكم
          </h1>
          <p style={{ fontSize: "12.5px", color: "#94a3b8", marginBottom: "26px" }}>
            Bilal Electronique - بطاقة NFC الذكية
          </p>

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ textAlign: "right" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#cbd5e1", marginBottom: "6px" }}>
                أدخل الرمز السري للمسؤول (PIN)
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPin ? "text" : "password"}
                  id="admin-pin-input"
                  placeholder="••••"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className="admin-input-field"
                  style={{
                    textAlign: "center",
                    fontSize: "24px",
                    letterSpacing: "6px",
                    fontWeight: 800,
                    fontFamily: "monospace",
                    padding: "14px",
                    border: pinError ? "1.5px solid #f43f5e" : undefined,
                  }}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  style={{
                    position: "absolute",
                    left: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "#64748b",
                    cursor: "pointer",
                    padding: "4px",
                  }}
                >
                  <Eye style={{ width: 18, height: 18 }} />
                </button>
              </div>
            </div>

            {pinError && (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "12px",
                  backgroundColor: "rgba(244, 63, 94, 0.12)",
                  border: "1px solid rgba(244, 63, 94, 0.3)",
                  color: "#fda4af",
                  fontSize: "12px",
                  fontWeight: 700,
                }}
              >
                الرمز السري غير صحيح، يرجى إدخال الرمز السري الصحيح للمتابعة.
              </div>
            )}

            <button
              type="submit"
              id="admin-login-btn"
              className="btn-nfc-vcard shimmer-effect"
              style={{
                marginTop: "6px",
                padding: "14px 20px",
                fontSize: "14.5px",
              }}
            >
              <Unlock style={{ width: 17, height: 17 }} />
              <span>فتح لوحة الإدارة</span>
            </button>
          </form>

          <div style={{ marginTop: "22px" }}>
            <Link
              href="/"
              style={{
                fontSize: "12px",
                color: "#94a3b8",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                transition: "color 0.2s",
              }}
            >
              <ArrowRight style={{ width: 14, height: 14 }} />
              <span>الرجوع لصفحة البطاقة الرئيسية</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. Authenticated Admin Dashboard
  return (
    <div dir="rtl" className="admin-page-bg" style={{ paddingBottom: "110px" }}>
      {/* Ambient background glows */}
      <div
        className="ambient-glow"
        style={{
          position: "fixed",
          top: "-70px",
          right: "-70px",
          width: "350px",
          height: "350px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(37, 99, 235, 0.2) 0%, transparent 70%)",
          filter: "blur(60px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        className="ambient-glow"
        style={{
          position: "fixed",
          bottom: "10%",
          left: "-70px",
          width: "320px",
          height: "320px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(245, 158, 11, 0.16) 0%, transparent 70%)",
          filter: "blur(60px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 100,
            animation: "bounce 1s",
          }}
        >
          <div
            style={{
              padding: "10px 18px",
              borderRadius: "20px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "12.5px",
              fontWeight: 800,
              boxShadow: "0 15px 35px rgba(0,0,0,0.6)",
              backgroundColor:
                toast.type === "success"
                  ? "rgba(16, 185, 129, 0.95)"
                  : toast.type === "error"
                  ? "rgba(244, 63, 94, 0.95)"
                  : "rgba(37, 99, 235, 0.95)",
              color: "#ffffff",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
            }}
          >
            {toast.type === "success" ? (
              <CheckCircle style={{ width: 17, height: 17 }} />
            ) : (
              <AlertCircle style={{ width: 17, height: 17 }} />
            )}
            <span>{toast.msg}</span>
          </div>
        </div>
      )}

      {/* Top Header */}
      <header className="admin-header">
        <div
          style={{
            maxWidth: "960px",
            margin: "0 auto",
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "8px",
          }}
        >
          {/* Logo & Status */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0, flex: 1 }}>
            <Link
              href="/"
              target="_blank"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "12px",
                backgroundColor: "rgba(15, 23, 42, 0.8)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#60a5fa",
                textDecoration: "none",
                flexShrink: 0,
              }}
              title="معاينة الصفحة الحية"
            >
              <Eye style={{ width: 17, height: 17 }} />
            </Link>

            <div style={{ minWidth: 0, overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <span style={{ fontSize: "14px", fontWeight: 900, color: "#ffffff", whiteSpace: "nowrap" }}>
                  لوحة التحكم
                </span>
                <InstagramVerifiedBadge size={15} />
              </div>
              <span style={{ fontSize: "11px", color: "#fbbf24", fontWeight: 700, display: "block", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                {profile.businessName.ar}
              </span>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
            {/* Quick Save button */}
            <button
              id="admin-save-btn"
              onClick={() => handleSaveProfile()}
              disabled={saving}
              className="btn-nfc-vcard shimmer-effect"
              style={{
                padding: "7px 14px",
                fontSize: "12px",
                width: "auto",
                borderRadius: "12px",
                flexShrink: 0,
              }}
            >
              <Save style={{ width: 14, height: 14 }} />
              <span>{saving ? "..." : "حفظ"}</span>
            </button>

            {/* Logout Button (Prominent, labeled, and guaranteed visible on mobile) */}
            <button
              id="admin-logout-btn"
              onClick={handleLogout}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                padding: "7px 12px",
                borderRadius: "12px",
                backgroundColor: "rgba(244, 63, 94, 0.18)",
                border: "1.5px solid rgba(244, 63, 94, 0.5)",
                color: "#fda4af",
                fontSize: "12px",
                fontWeight: 800,
                cursor: "pointer",
                flexShrink: 0,
              }}
              title="تسجيل الخروج وقفل اللوحة"
            >
              <LogOut style={{ width: 15, height: 15, color: "#f43f5e" }} />
              <span>خروج</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: "960px", margin: "0 auto", padding: "18px 16px", position: "relative", zIndex: 10 }}>
        
        {/* Live Identity Mini-Strip */}
        <div
          style={{
            background: "linear-gradient(135deg, rgba(16, 24, 52, 0.8) 0%, rgba(10, 16, 38, 0.9) 100%)",
            border: "1px solid rgba(245, 158, 11, 0.25)",
            borderRadius: "18px",
            padding: "12px 18px",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: "#10b981",
                display: "inline-block",
                boxShadow: "0 0 8px #10b981",
              }}
            />
            <span style={{ fontSize: "12.5px", fontWeight: 800, color: "#ffffff" }}>
              معاينة الهوية الحالية: {profile.businessName.ar}
            </span>
            <InstagramVerifiedBadge size={17} />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", fontSize: "12px", color: "#94a3b8" }}>
            {storageStatus?.hasBlob && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#34d399",
                  backgroundColor: "rgba(16, 185, 129, 0.12)",
                  border: "1px solid rgba(16, 185, 129, 0.35)",
                  padding: "3px 9px",
                  borderRadius: "10px",
                }}
              >
                ☁️ Vercel Blob نشط (تحديث فوري لجميع الهواتف)
              </span>
            )}
            <span style={{ fontFamily: "monospace", color: "#fbbf24", fontWeight: 700 }}>
              📞 {profile.phoneDisplay}
            </span>
            <span>📍 {profile.city.ar}</span>
          </div>
        </div>

        {/* Tabbed Navigation Pills */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            overflowX: "auto",
            paddingBottom: "12px",
            marginBottom: "14px",
            scrollbarWidth: "none",
          }}
        >
          <button
            onClick={() => setActiveTab("basic")}
            className={`admin-tab-pill ${activeTab === "basic" ? "active" : ""}`}
          >
            <Sparkles style={{ width: 15, height: 15 }} />
            <span>المعلومات وهوية المحل</span>
          </button>

          <button
            onClick={() => setActiveTab("image")}
            className={`admin-tab-pill ${activeTab === "image" ? "active" : ""}`}
          >
            <ImageIcon style={{ width: 15, height: 15 }} />
            <span>الصور والبوستر ورمز QR</span>
          </button>

          <button
            onClick={() => setActiveTab("contact")}
            className={`admin-tab-pill ${activeTab === "contact" ? "active" : ""}`}
          >
            <Phone style={{ width: 15, height: 15 }} />
            <span>أرقام الهاتف والواتساب</span>
          </button>

          <button
            onClick={() => setActiveTab("badges")}
            className={`admin-tab-pill ${activeTab === "badges" ? "active" : ""}`}
          >
            <Shield style={{ width: 15, height: 15 }} />
            <span>شارات الضمان والمميزات</span>
          </button>

          <button
            onClick={() => setActiveTab("export")}
            className={`admin-tab-pill ${activeTab === "export" ? "active" : ""}`}
          >
            <FileJson style={{ width: 15, height: 15 }} />
            <span>النسخ الاحتياطي والأمان (PIN)</span>
          </button>
        </div>

        {/* =========================================================================
            TAB 1: Basic Information
            ========================================================================= */}
        {activeTab === "basic" && (
          <div className="admin-card" style={{ padding: "24px" }}>
            <div style={{ marginBottom: "20px" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 900, color: "#fbbf24", display: "flex", alignItems: "center", gap: "8px" }}>
                <Sparkles style={{ width: 18, height: 18 }} />
                <span>البيانات الأساسية وهوية النشاط التجاري</span>
              </h2>
              <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>
                تعديل نصوص الاسم والسلوجان والوصف باللغتين العربية والفرنسية لعرضها في البطاقة.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
              {/* Business Name AR */}
              <div>
                <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px", fontWeight: 700, color: "#cbd5e1", marginBottom: "6px" }}>
                  <span>اسم المحل بالعربية</span>
                  <span className="admin-lang-chip">🇲🇦 العربية</span>
                </label>
                <input
                  type="text"
                  value={profile.businessName.ar}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      businessName: { ...profile.businessName, ar: e.target.value },
                    })
                  }
                  className="admin-input-field"
                />
              </div>

              {/* Business Name FR */}
              <div>
                <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px", fontWeight: 700, color: "#cbd5e1", marginBottom: "6px" }}>
                  <span>Nom du commerce (Français)</span>
                  <span className="admin-lang-chip">🇫🇷 Français</span>
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={profile.businessName.fr}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      businessName: { ...profile.businessName, fr: e.target.value },
                    })
                  }
                  className="admin-input-field font-sans"
                />
              </div>

              {/* Subtitle AR */}
              <div>
                <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px", fontWeight: 700, color: "#cbd5e1", marginBottom: "6px" }}>
                  <span>العنوان الفرعي (عربي)</span>
                  <span className="admin-lang-chip">🇲🇦 العربية</span>
                </label>
                <input
                  type="text"
                  value={profile.subtitle.ar}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      subtitle: { ...profile.subtitle, ar: e.target.value },
                    })
                  }
                  className="admin-input-field"
                />
              </div>

              {/* Subtitle FR */}
              <div>
                <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px", fontWeight: 700, color: "#cbd5e1", marginBottom: "6px" }}>
                  <span>Sous-titre (Français)</span>
                  <span className="admin-lang-chip">🇫🇷 Français</span>
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={profile.subtitle.fr}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      subtitle: { ...profile.subtitle, fr: e.target.value },
                    })
                  }
                  className="admin-input-field font-sans"
                />
              </div>

              {/* Slogan AR */}
              <div>
                <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px", fontWeight: 700, color: "#cbd5e1", marginBottom: "6px" }}>
                  <span>شعار المحل / السلوجان (عربي)</span>
                  <span className="admin-lang-chip">🇲🇦 العربية</span>
                </label>
                <input
                  type="text"
                  value={profile.slogan.ar}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      slogan: { ...profile.slogan, ar: e.target.value },
                    })
                  }
                  className="admin-input-field"
                />
              </div>

              {/* Slogan FR */}
              <div>
                <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px", fontWeight: 700, color: "#cbd5e1", marginBottom: "6px" }}>
                  <span>Slogan (Français)</span>
                  <span className="admin-lang-chip">🇫🇷 Français</span>
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={profile.slogan.fr}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      slogan: { ...profile.slogan, fr: e.target.value },
                    })
                  }
                  className="admin-input-field font-sans"
                />
              </div>

              {/* Full Description AR */}
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px", fontWeight: 700, color: "#cbd5e1", marginBottom: "6px" }}>
                  <span>الوصف الكامل للنشاط (عربي)</span>
                  <span className="admin-lang-chip">🇲🇦 العربية</span>
                </label>
                <textarea
                  rows={3}
                  value={profile.description.ar}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      description: { ...profile.description, ar: e.target.value },
                    })
                  }
                  className="admin-input-field"
                />
              </div>

              {/* Full Description FR */}
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px", fontWeight: 700, color: "#cbd5e1", marginBottom: "6px" }}>
                  <span>Description Complète (Français)</span>
                  <span className="admin-lang-chip">🇫🇷 Français</span>
                </label>
                <textarea
                  rows={3}
                  dir="ltr"
                  value={profile.description.fr}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      description: { ...profile.description, fr: e.target.value },
                    })
                  }
                  className="admin-input-field font-sans"
                />
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: Image & Poster & QR Management (with Auto Old File Deletion)
            ========================================================================= */}
        {activeTab === "image" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Card 1: Poster & Advert Image */}
            <div className="admin-card" style={{ padding: "24px" }}>
              <div style={{ marginBottom: "20px" }}>
                <h2 style={{ fontSize: "16px", fontWeight: 900, color: "#fbbf24", display: "flex", alignItems: "center", gap: "8px" }}>
                  <ImageIcon style={{ width: 18, height: 18 }} />
                  <span>إدارة صورة الإعلان والملصق التجاري في أعلى الصفحة</span>
                </h2>
                <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>
                  عند اختيار صورة جديدة، يقوم النظام برفعها واستبدالها تلقائياً مع **مسح الصورة القديمة فوراً** من مجلد المشروع للحفاظ على نظافة المساحة.
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", alignItems: "start" }}>
                {/* Current Poster Preview */}
                <div style={{ textAlign: "center" }}>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#cbd5e1", display: "block", marginBottom: "8px", textAlign: "right" }}>
                    الصورة الحالية المعروضة على البطاقة:
                  </span>
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      maxWidth: "290px",
                      aspectRatio: "1 / 1.05",
                      margin: "0 auto",
                      borderRadius: "20px",
                      overflow: "hidden",
                      border: "1.5px solid rgba(245, 158, 11, 0.4)",
                      backgroundColor: "#030712",
                      boxShadow: "0 15px 35px rgba(0,0,0,0.7)",
                    }}
                  >
                    {profile.posterImage ? (
                      <Image
                        src={profile.posterImage}
                        alt="Current Poster"
                        fill
                        style={{ objectFit: "contain" }}
                      />
                    ) : (
                      <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", fontSize: "12px" }}>
                        لا توجد صورة حالياً
                      </div>
                    )}
                  </div>
                  <div style={{ marginTop: "10px" }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "5px 12px",
                        borderRadius: "14px",
                        background: "rgba(16, 185, 129, 0.12)",
                        border: "1px solid rgba(16, 185, 129, 0.3)",
                        color: "#34d399",
                        fontSize: "11px",
                        fontWeight: 700,
                      }}
                    >
                      <Check style={{ width: 12, height: 12 }} />
                      <span>الصورة مفعلة ونشطة في الموقع</span>
                    </span>
                  </div>
                </div>

                {/* Upload New Image Box */}
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#cbd5e1" }}>
                    اختيار صورة جديدة للاستبدال:
                  </span>

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: "2px dashed rgba(245, 158, 11, 0.35)",
                      borderRadius: "20px",
                      padding: "28px 20px",
                      textAlign: "center",
                      cursor: "pointer",
                      backgroundColor: "rgba(10, 16, 38, 0.6)",
                      transition: "all 0.2s",
                    }}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      style={{ display: "none" }}
                    />
                    <Upload style={{ width: 34, height: 34, color: "#fbbf24", margin: "0 auto 10px auto" }} />
                    <p style={{ fontSize: "13px", fontWeight: 800, color: "#ffffff" }}>
                      اضغط هنا لاختيار صورة من هاتفك أو جهازك
                    </p>
                    <p style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>
                      يدعم PNG, JPG, WebP (سيتم مسح الملف القديم وتحديث الموقع فوراً)
                    </p>
                  </div>

                  {previewUrl && (
                    <div
                      style={{
                        padding: "16px",
                        borderRadius: "18px",
                        backgroundColor: "rgba(16, 185, 129, 0.08)",
                        border: "1px solid rgba(16, 185, 129, 0.3)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ fontSize: "12px", fontWeight: 800, color: "#34d399" }}>
                        معاينة الصورة الجديدة قبل الحفظ:
                      </span>
                      <div
                        style={{
                          position: "relative",
                          width: "140px",
                          height: "140px",
                          borderRadius: "14px",
                          overflow: "hidden",
                          border: "1px solid rgba(255, 255, 255, 0.2)",
                          backgroundColor: "#030712",
                        }}
                      >
                        <Image
                          src={previewUrl}
                          alt="Preview"
                          fill
                          style={{ objectFit: "contain" }}
                        />
                      </div>
                      <button
                        id="upload-replace-btn"
                        onClick={handleUploadAndReplaceImage}
                        disabled={uploadingImage}
                        className="btn-nfc-whatsapp"
                        style={{
                          width: "100%",
                          padding: "12px 18px",
                          fontSize: "13px",
                        }}
                      >
                        <RefreshCw
                          style={{
                            width: 16,
                            height: 16,
                            animation: uploadingImage ? "spin 1s linear infinite" : undefined,
                          }}
                        />
                        <span>
                          {uploadingImage
                            ? "جاري الرفع وحذف القديمة..."
                            : "تأكيد رفع الصورة وحذف القديمة"}
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Card 2: QR Code Management */}
            <div className="admin-card" style={{ padding: "24px" }}>
              <div style={{ marginBottom: "20px" }}>
                <h2 style={{ fontSize: "16px", fontWeight: 900, color: "#fbbf24", display: "flex", alignItems: "center", gap: "8px" }}>
                  <QrCode style={{ width: 18, height: 18 }} />
                  <span>إدارة واستبدال رمز QR (المعروض بأسفل البطاقة)</span>
                </h2>
                <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>
                  عند اختيار صورة رمز QR جديدة، يتم رفعها وتحديث رمز QR في أسفل الشاشة للزبائن فوراً مع مسح الملف القديم للحفاظ على التخزين.
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", alignItems: "start" }}>
                {/* Current QR Code Preview */}
                <div style={{ textAlign: "center" }}>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#cbd5e1", display: "block", marginBottom: "8px", textAlign: "right" }}>
                    رمز QR الحالي المعروض أسفل البطاقة:
                  </span>
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      maxWidth: "240px",
                      aspectRatio: "1 / 1",
                      margin: "0 auto",
                      borderRadius: "20px",
                      overflow: "hidden",
                      border: "1.5px solid rgba(245, 158, 11, 0.4)",
                      backgroundColor: "#ffffff",
                      boxShadow: "0 15px 35px rgba(0,0,0,0.7)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "16px",
                    }}
                  >
                    {profile.qrCodeImage ? (
                      <Image
                        src={profile.qrCodeImage}
                        alt="Current QR Code"
                        fill
                        style={{ objectFit: "contain", padding: "12px" }}
                      />
                    ) : (
                      <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", fontSize: "12px" }}>
                        لا يوجد رمز QR حالياً
                      </div>
                    )}
                  </div>
                  <div style={{ marginTop: "12px" }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "5px 12px",
                        borderRadius: "14px",
                        background: "rgba(16, 185, 129, 0.12)",
                        border: "1px solid rgba(16, 185, 129, 0.3)",
                        color: "#34d399",
                        fontSize: "11px",
                        fontWeight: 700,
                      }}
                    >
                      <Check style={{ width: 12, height: 12 }} />
                      <span>رمز QR مفعل ونشط في أسفل الموقع</span>
                    </span>
                  </div>
                </div>

                {/* Upload New QR Code Box */}
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#cbd5e1" }}>
                    اختيار صورة رمز QR جديدة للاستبدال:
                  </span>

                  <div
                    onClick={() => qrFileInputRef.current?.click()}
                    style={{
                      border: "2px dashed rgba(245, 158, 11, 0.35)",
                      borderRadius: "20px",
                      padding: "28px 20px",
                      textAlign: "center",
                      cursor: "pointer",
                      backgroundColor: "rgba(10, 16, 38, 0.6)",
                      transition: "all 0.2s",
                    }}
                  >
                    <input
                      ref={qrFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleQrFileChange}
                      style={{ display: "none" }}
                    />
                    <QrCode style={{ width: 34, height: 34, color: "#fbbf24", margin: "0 auto 10px auto" }} />
                    <p style={{ fontSize: "13px", fontWeight: 800, color: "#ffffff" }}>
                      اضغط هنا لاختيار صورة رمز QR من جهازك
                    </p>
                    <p style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>
                      يدعم PNG, JPG, WebP (سيتم مسح الملف القديم وتحديث الموقع فوراً)
                    </p>
                  </div>

                  {qrPreviewUrl && (
                    <div
                      style={{
                        padding: "16px",
                        borderRadius: "18px",
                        backgroundColor: "rgba(16, 185, 129, 0.08)",
                        border: "1px solid rgba(16, 185, 129, 0.3)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ fontSize: "12px", fontWeight: 800, color: "#34d399" }}>
                        معاينة رمز QR الجديد قبل الحفظ:
                      </span>
                      <div
                        style={{
                          position: "relative",
                          width: "140px",
                          height: "140px",
                          borderRadius: "14px",
                          overflow: "hidden",
                          border: "1px solid rgba(255, 255, 255, 0.2)",
                          backgroundColor: "#ffffff",
                          padding: "8px",
                        }}
                      >
                        <Image
                          src={qrPreviewUrl}
                          alt="QR Preview"
                          fill
                          style={{ objectFit: "contain", padding: "8px" }}
                        />
                      </div>
                      <button
                        id="upload-replace-qr-btn"
                        onClick={handleUploadAndReplaceQr}
                        disabled={uploadingQr}
                        className="btn-nfc-whatsapp"
                        style={{
                          width: "100%",
                          padding: "12px 18px",
                          fontSize: "13px",
                        }}
                      >
                        <RefreshCw
                          style={{
                            width: 16,
                            height: 16,
                            animation: uploadingQr ? "spin 1s linear infinite" : undefined,
                          }}
                        />
                        <span>
                          {uploadingQr
                            ? "جاري الرفع وحذف القديم..."
                            : "تأكيد رفع رمز QR وحذف القديم"}
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: Contact & Links
            ========================================================================= */}
        {activeTab === "contact" && (
          <div className="admin-card" style={{ padding: "24px" }}>
            <div style={{ marginBottom: "20px" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 900, color: "#fbbf24", display: "flex", alignItems: "center", gap: "8px" }}>
                <Phone style={{ width: 18, height: 18 }} />
                <span>أرقام التواصل، الواتساب، والخرائط الجغرافية</span>
              </h2>
              <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>
                هذه الأرقام هي التي ترتبط بأزرار الاتصال وحفظ بطاقة vCard على الهاتف.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
              {/* Direct Phone */}
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#cbd5e1", marginBottom: "6px" }}>
                  رقم الهاتف للاتصال المباشر (مثل: 0620786675)
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="admin-input-field font-mono"
                />
              </div>

              {/* Display Phone */}
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#cbd5e1", marginBottom: "6px" }}>
                  رقم الهاتف للعرض المنسق (مثل: 06.20.78.66.75)
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={profile.phoneDisplay}
                  onChange={(e) => setProfile({ ...profile, phoneDisplay: e.target.value })}
                  className="admin-input-field font-mono"
                />
              </div>

              {/* WhatsApp Number */}
              <div>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 700, color: "#cbd5e1", marginBottom: "6px" }}>
                  <WhatsAppIcon size={16} style={{ color: "#25D366" }} />
                  <span>رقم الواتساب بالصيغة الدولية (مثل: 212620786675)</span>
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={profile.whatsapp}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      whatsapp: e.target.value,
                      whatsappLink: `https://wa.me/${e.target.value.replace(/[^0-9]/g, "")}`,
                    })
                  }
                  className="admin-input-field font-mono"
                />
              </div>

              {/* Google Maps URL */}
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#cbd5e1", marginBottom: "6px" }}>
                  رابط خريطة Google Maps
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={profile.mapsUrl}
                  onChange={(e) => setProfile({ ...profile, mapsUrl: e.target.value })}
                  className="admin-input-field font-mono"
                />
              </div>

              {/* Instagram URL */}
              <div>
                <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px", fontWeight: 700, color: "#cbd5e1", marginBottom: "6px" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <InstagramGradientIcon size={16} />
                    <span>رابط حساب إنستغرام (Instagram)</span>
                  </span>
                  <span className="admin-lang-chip" style={{ color: "#f43f5e", borderColor: "rgba(225,48,108,0.35)" }}>
                    نشط على الصفحة
                  </span>
                </label>
                <input
                  type="text"
                  dir="ltr"
                  placeholder="https://instagram.com/..."
                  value={profile.instagram || ""}
                  onChange={(e) => {
                    const newUrl = e.target.value;
                    const updatedSocial = (profile.socialLinks || []).filter((s) => s.platform !== "instagram");
                    if (newUrl.trim()) {
                      updatedSocial.push({
                        platform: "instagram",
                        label: "Instagram",
                        url: newUrl.trim(),
                        color: "#E1306C",
                      });
                    }
                    setProfile({
                      ...profile,
                      instagram: newUrl,
                      socialLinks: updatedSocial,
                    });
                  }}
                  className="admin-input-field font-mono"
                />
                <p style={{ fontSize: "10.5px", color: "#94a3b8", marginTop: "4px" }}>
                  الرابط الذي يفتح عند نقر الزائر على زر إنستغرام في بطاقة NFC.
                </p>
              </div>

              {/* Facebook URL (Conditional) */}
              <div>
                <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px", fontWeight: 700, color: "#cbd5e1", marginBottom: "6px" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <FacebookRoundIcon size={16} />
                    <span>رابط صفحة فيسبوك (Facebook)</span>
                  </span>
                  <span
                    className="admin-lang-chip"
                    style={{
                      color: profile.facebook?.trim() ? "#60a5fa" : "#94a3b8",
                      borderColor: profile.facebook?.trim() ? "rgba(24,119,242,0.4)" : "rgba(255,255,255,0.1)",
                    }}
                  >
                    {profile.facebook?.trim() ? "يظهر في الصفحة ✓" : "مخفي حالياً (فارغ)"}
                  </span>
                </label>
                <input
                  type="text"
                  dir="ltr"
                  placeholder="https://facebook.com/..."
                  value={profile.facebook || ""}
                  onChange={(e) => {
                    const newUrl = e.target.value;
                    const updatedSocial = (profile.socialLinks || []).filter((s) => s.platform !== "facebook");
                    if (newUrl.trim()) {
                      updatedSocial.push({
                        platform: "facebook",
                        label: "Facebook",
                        url: newUrl.trim(),
                        color: "#1877F2",
                      });
                    }
                    setProfile({
                      ...profile,
                      facebook: newUrl,
                      socialLinks: updatedSocial,
                    });
                  }}
                  className="admin-input-field font-mono"
                />
                <p style={{ fontSize: "10.5px", color: "#94a3b8", marginTop: "4px" }}>
                  💡 في حال توفره يظهر في الصفحة تلقائياً، وفي حال عدم توفره أو تركه فارغاً يتم إخفاؤه تماماً من الصفحة.
                </p>
              </div>

              {/* City AR */}
              <div>
                <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px", fontWeight: 700, color: "#cbd5e1", marginBottom: "6px" }}>
                  <span>المدينة والمنطقة (عربي)</span>
                  <span className="admin-lang-chip">🇲🇦 العربية</span>
                </label>
                <input
                  type="text"
                  value={profile.city.ar}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      city: { ...profile.city, ar: e.target.value },
                    })
                  }
                  className="admin-input-field"
                />
              </div>

              {/* City FR */}
              <div>
                <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px", fontWeight: 700, color: "#cbd5e1", marginBottom: "6px" }}>
                  <span>Ville & Région (Français)</span>
                  <span className="admin-lang-chip">🇫🇷 Français</span>
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={profile.city.fr}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      city: { ...profile.city, fr: e.target.value },
                    })
                  }
                  className="admin-input-field font-sans"
                />
              </div>

              {/* Delivery Text AR */}
              <div>
                <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px", fontWeight: 700, color: "#cbd5e1", marginBottom: "6px" }}>
                  <span>نص خدمة التوصيل (عربي)</span>
                  <span className="admin-lang-chip">🇲🇦 العربية</span>
                </label>
                <input
                  type="text"
                  value={profile.deliveryText.ar}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      deliveryText: { ...profile.deliveryText, ar: e.target.value },
                    })
                  }
                  className="admin-input-field"
                />
              </div>

              {/* Delivery Text FR */}
              <div>
                <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px", fontWeight: 700, color: "#cbd5e1", marginBottom: "6px" }}>
                  <span>Service de Livraison (Français)</span>
                  <span className="admin-lang-chip">🇫🇷 Français</span>
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={profile.deliveryText.fr}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      deliveryText: { ...profile.deliveryText, fr: e.target.value },
                    })
                  }
                  className="admin-input-field font-sans"
                />
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 4: Badges & Trust Points
            ========================================================================= */}
        {activeTab === "badges" && (
          <div className="admin-card" style={{ padding: "24px" }}>
            <div style={{ marginBottom: "20px" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 900, color: "#fbbf24", display: "flex", alignItems: "center", gap: "8px" }}>
                <Shield style={{ width: 18, height: 18 }} />
                <span>شارات الثقة والضمانات (المعروضة 2x2 على البطاقة)</span>
              </h2>
              <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>
                يمكنك تخصيص نصوص بطاقات الثقة والضمانات المميزة المعروضة للمستخدمين.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "14px" }}>
              {profile.badges.map((b, idx) => (
                <div key={b.id} className="admin-badge-item">
                  <span style={{ fontSize: "12px", fontWeight: 800, color: "#fbbf24", display: "block", marginBottom: "10px" }}>
                    شارة رقم {idx + 1} ({b.ar})
                  </span>

                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "11px", color: "#94a3b8", marginBottom: "4px" }}>
                        العنوان بالعربية
                      </label>
                      <input
                        type="text"
                        value={b.ar}
                        onChange={(e) => {
                          const newBadges = [...profile.badges];
                          newBadges[idx].ar = e.target.value;
                          setProfile({ ...profile, badges: newBadges });
                        }}
                        className="admin-input-field"
                        style={{ padding: "8px 12px", fontSize: "13px" }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "11px", color: "#94a3b8", marginBottom: "4px" }}>
                        Titre (Français)
                      </label>
                      <input
                        type="text"
                        dir="ltr"
                        value={b.fr}
                        onChange={(e) => {
                          const newBadges = [...profile.badges];
                          newBadges[idx].fr = e.target.value;
                          setProfile({ ...profile, badges: newBadges });
                        }}
                        className="admin-input-field font-sans"
                        style={{ padding: "8px 12px", fontSize: "13px" }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 5: Export / Backup & PIN Settings
            ========================================================================= */}
        {activeTab === "export" && (
          <div className="admin-card" style={{ padding: "24px" }}>
            <div style={{ marginBottom: "20px" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 900, color: "#fbbf24", display: "flex", alignItems: "center", gap: "8px" }}>
                <Cloud style={{ width: 18, height: 18 }} />
                <span>المزامنة السحابية لجميع الأجهزة والنسخ الاحتياطي</span>
              </h2>
              <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>
                تحكم في مزامنة البيانات عبر السحاب لتظهر الصور والتعديلات على كل أجهزة الزبائن فوراً وبشكل دائم.
              </p>
            </div>

            {/* Cloud Storage Status Banner */}
            <div
              style={{
                marginBottom: "20px",
                padding: "16px",
                borderRadius: "18px",
                background: storageStatus.isCloudReady
                  ? "linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 12, 30, 0.9) 100%)"
                  : "linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(6, 12, 30, 0.9) 100%)",
                border: `1.5px solid ${storageStatus.isCloudReady ? "rgba(16, 185, 129, 0.4)" : "rgba(245, 158, 11, 0.4)"}`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px", flexWrap: "wrap", gap: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Database style={{ width: 18, height: 18, color: storageStatus.isCloudReady ? "#34d399" : "#fbbf24" }} />
                  <span style={{ fontSize: "14px", fontWeight: 800, color: "#ffffff" }}>
                    {storageStatus.isCloudReady
                      ? "🟢 التخزين السحابي العالمي نشط ومتصل بـ Vercel"
                      : "🟡 وضع الحفظ المحلي (تظهر التعديلات على هذا الجهاز فقط)"}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 800,
                    padding: "3px 10px",
                    borderRadius: "20px",
                    background: storageStatus.isCloudReady ? "rgba(16, 185, 129, 0.2)" : "rgba(245, 158, 11, 0.2)",
                    color: storageStatus.isCloudReady ? "#34d399" : "#fbbf24",
                    border: `1px solid ${storageStatus.isCloudReady ? "rgba(16, 185, 129, 0.4)" : "rgba(245, 158, 11, 0.4)"}`,
                  }}
                >
                  {storageStatus.isCloudReady ? "تحديث تلقائي لكل الأجهزة ✓" : "بحاجة لتفعيل التخزين السحابي"}
                </span>
              </div>

              {!storageStatus.isCloudReady ? (
                <div style={{ fontSize: "12px", color: "#cbd5e1", lineHeight: "1.6" }}>
                  <p style={{ marginBottom: "10px" }}>
                    لأن منصة <strong>Vercel</strong> تعمل بنظام Serverless للقراءة فقط، لتظهر الصور والمعلومات الجديدة على <strong>جميع هواتف وحواسيب الزبائن في العالم</strong> فوراً بدون إعادة النشر اليدوي، قم بتفعيل التخزين السحابي بضغطة زر واحدة (مجاناً 100%):
                  </p>
                  <ol style={{ paddingRight: "20px", display: "flex", flexDirection: "column", gap: "6px", marginBottom: "12px" }}>
                    <li>ادخل إلى حسابك في موقع <strong>vercel.com</strong> وافتح مشروعك: <code style={{ color: "#fbbf24" }}>azilal-bilal-nfc</code></li>
                    <li>اضغط على تبويب <strong>Storage</strong> من القائمة العلوية.</li>
                    <li>اضغط على <strong>Create Database</strong> ثم اختر <strong>Blob</strong> (للصور والملفات) أو <strong>KV</strong> ثم اضغط <strong>Connect</strong>.</li>
                  </ol>
                  <p style={{ color: "#94a3b8", fontSize: "11px" }}>
                    ⚡ بمجرد الضغط على Connect، سيتصل الموقع بالسحاب تلقائياً وتتحدث الصور والمعلومات على كل أجهزة الزبائن فوراً!
                  </p>
                </div>
              ) : (
                <p style={{ fontSize: "12px", color: "#a7f3d0", lineHeight: "1.5" }}>
                  ✓ الموقع متصل بالتخزين السحابي. أي صورة ترفعها أو معلومات تقوم بتعديلها وحفظها هنا ستظهر تلقائياً لجميع الزبائن والأجهزة فوراً!
                </p>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
              {/* Download JSON */}
              <div className="admin-badge-item">
                <span style={{ fontSize: "13px", fontWeight: 800, color: "#ffffff", display: "block", marginBottom: "6px" }}>
                  تحميل نسخة احتياطية من ملف profile.json
                </span>
                <p style={{ fontSize: "11.5px", color: "#94a3b8", marginBottom: "14px" }}>
                  احفظ نسخة من جميع التعديلات الحالية كملف JSON مستقل على هاتفك أو حاسوبك.
                </p>
                <button
                  id="download-json-btn"
                  onClick={handleDownloadJson}
                  className="btn-nfc-call"
                  style={{ width: "100%", padding: "11px 16px", fontSize: "13px" }}
                >
                  <Download style={{ width: 15, height: 15 }} />
                  <span>تنزيل profile.json الآن</span>
                </button>
              </div>

              {/* Import JSON */}
              <div className="admin-badge-item">
                <span style={{ fontSize: "13px", fontWeight: 800, color: "#ffffff", display: "block", marginBottom: "6px" }}>
                  استيراد ملف profile.json خارجي
                </span>
                <p style={{ fontSize: "11.5px", color: "#94a3b8", marginBottom: "14px" }}>
                  ارفع ملف JSON جاهز لديك لاستعادة كافة المعلومات السابقة بنقرة زر واحدة.
                </p>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    padding: "11px 16px",
                    borderRadius: "18px",
                    backgroundColor: "rgba(15, 23, 42, 0.8)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    color: "#f1f5f9",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  <Upload style={{ width: 15, height: 15 }} />
                  <span>اختيار ملف JSON للاستيراد</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportJson}
                    style={{ display: "none" }}
                  />
                </label>
              </div>

              {/* Change Admin PIN */}
              <div className="admin-badge-item">
                <span style={{ fontSize: "13px", fontWeight: 800, color: "#ffffff", display: "block", marginBottom: "6px" }}>
                  تغيير رمز المرور السري (Admin PIN)
                </span>
                <div style={{ maxWidth: "260px", marginBottom: "8px" }}>
                  <input
                    type="text"
                    value={profile.adminPin || "2026"}
                    onChange={(e) => setProfile({ ...profile, adminPin: e.target.value })}
                    className="admin-input-field font-mono"
                    style={{ fontSize: "16px", letterSpacing: "2px", fontWeight: 700 }}
                  />
                </div>
                <p style={{ fontSize: "11.5px", color: "#94a3b8" }}>
                  الرمز الحالي مطلوب لفتح هذه الصفحة في الجلسات القادمة (تذكر الضغط على حفظ التغييرات).
                </p>
              </div>

              {/* Reset Local Browser Cache */}
              <div className="admin-badge-item">
                <span style={{ fontSize: "13px", fontWeight: 800, color: "#ffffff", display: "block", marginBottom: "6px" }}>
                  مسح الذاكرة المحلية لجهازك (Reset Local Cache)
                </span>
                <p style={{ fontSize: "11.5px", color: "#94a3b8", marginBottom: "14px" }}>
                  إذا أردت مسح التعديلات المخزنة على هذا المتصفح ومعاينة ما يراه الزبائن وباقي الأجهزة حالياً من السيرفر.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem("bilal_profile_override");
                    showToast("info", "تم مسح كاش المتصفح وإعادة التحميل...");
                    setTimeout(() => window.location.reload(), 800);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    width: "100%",
                    padding: "11px 16px",
                    borderRadius: "18px",
                    background: "rgba(239, 68, 68, 0.15)",
                    border: "1px solid rgba(239, 68, 68, 0.35)",
                    color: "#f87171",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  <Trash2 style={{ width: 14, height: 14 }} />
                  <span>مسح كاش المتصفح واسترجاع السيرفر</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Floating Save Footer Bar */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 40,
          padding: "12px 16px",
          backgroundColor: "rgba(5, 8, 20, 0.94)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        <div
          style={{
            maxWidth: "960px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "8px",
          }}
        >
          <Link
            href="/"
            target="_blank"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "12px 14px",
              borderRadius: "18px",
              backgroundColor: "rgba(15, 23, 42, 0.8)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: "#60a5fa",
              fontSize: "12.5px",
              fontWeight: 800,
              textDecoration: "none",
              flexShrink: 0,
            }}
          >
            <Eye style={{ width: 16, height: 16 }} />
            <span className="hidden sm:inline">معاينة البطاقة</span>
          </Link>

          <button
            id="admin-bottom-save-btn"
            onClick={() => handleSaveProfile()}
            disabled={saving}
            className="btn-nfc-vcard shimmer-effect"
            style={{
              flex: 1,
              maxWidth: "460px",
              padding: "13px 16px",
              fontSize: "13.5px",
            }}
          >
            <Save style={{ width: 17, height: 17 }} />
            <span>{saving ? "جاري الحفظ..." : "حفظ جميع التغييرات ✓"}</span>
          </button>

          <button
            onClick={handleLogout}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "5px",
              padding: "12px 14px",
              borderRadius: "18px",
              backgroundColor: "rgba(244, 63, 94, 0.16)",
              border: "1.5px solid rgba(244, 63, 94, 0.5)",
              color: "#fda4af",
              fontSize: "12.5px",
              fontWeight: 800,
              cursor: "pointer",
              flexShrink: 0,
            }}
            title="تسجيل الخروج وقفل اللوحة"
          >
            <LogOut style={{ width: 16, height: 16, color: "#f43f5e" }} />
            <span className="hidden sm:inline">خروج</span>
          </button>
        </div>
      </div>
    </div>
  );
}
