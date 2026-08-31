"use client";

import React from "react";
import {
  RotateCcw,
  Sparkles,
  Layers,
  Cpu,
  ShieldCheck,
  Globe,
  ExternalLink,
  Code2,
  Bell,
  Command,
  Sliders,
  AppWindow,
  MousePointerClick,
  SunMedium,
  CheckCircle2,
} from "lucide-react";
import { useTranslation } from "@/i18n";

interface AboutTabProps {
  isLight: boolean;
  onResetSettings: () => void;
}

export const AboutTab: React.FC<AboutTabProps> = ({ isLight, onResetSettings }) => {
  const { language } = useTranslation();
  const isEn = language === "en";

  const coreFeatures = [
    {
      icon: <AppWindow className="text-blue-500" size={18} />,
      title: isEn ? "Desktop Window Manager" : "Desktop Window Manager",
      desc: isEn
        ? "Draggable & resizable windows with smooth physics, window controls (minimize/maximize/close), double-click titlebar snap, dynamic z-index layering, and mobile auto-fullscreen."
        : "Jendela draggable & resizable dengan fisika mulus, kontrol jendela (minimize/maximize/close), double-click titlebar snap, dynamic z-index layering, dan auto-fullscreen di layar seluler.",
    },
    {
      icon: <Layers className="text-cyan-500" size={18} />,
      title: isEn ? "Floating Dual-Cluster Shelf" : "Floating Dual-Cluster Shelf (Dock & Tray)",
      desc: isEn
        ? "Center-bottom floating glass app dock (launcher, pinned apps, drag & drop reorder, active running indicator) and independent bottom-right floating status tray."
        : "Floating glass app dock di tengah-bawah (launcher, pinned apps, drag & drop reorder, running indicator) serta status tray independen di kanan-bawah.",
    },
    {
      icon: <Sliders className="text-amber-500" size={18} />,
      title: isEn ? "Interactive Quick Settings Panel" : "Interactive Quick Settings Panel",
      desc: isEn
        ? "Floating quick settings menu anchored to status tray with instant system sound toggles, theme and wallpaper switchers, battery & Wi-Fi indicators, and settings shortcut."
        : "Menu pengaturan cepat melayang terhubung ke status tray dengan toggle suara sistem, ganti tema/wallpaper instan, status baterai & Wi-Fi, serta shortcut ke Settings.",
    },
    {
      icon: <SunMedium className="text-orange-500" size={18} />,
      title: isEn ? "Aluminium OS Desktop Layer" : "Aluminium OS Desktop Layer (Widgets & Wallpaper)",
      desc: isEn
        ? "Desktop widgets (Clock & Live Weather via Open-Meteo API), dynamic realtime wallpaper with astronomical SunCalc sun & moon positioning, grid-snapping shortcuts, and marquee selection box."
        : "Widget desktop (Jam & Cuaca Live via Open-Meteo API), wallpaper realtime dinamis (posisi matahari & fase bulan SunCalc), shortcut desktop grid-snapping, dan kotak seleksi marquee.",
    },
    {
      icon: <Bell className="text-purple-500" size={18} />,
      title: isEn ? "System Notification Toast System" : "System Notification Toast System",
      desc: isEn
        ? "Native OS floating banner notifications that appear seamlessly upon preference changes (Pin/Unpin App, Add Shortcut, Change Wallpaper, Mute Audio)."
        : "Notifikasi melayang bergaya OS asli yang muncul otomatis saat pengguna mengubah preferensi (Pin/Unpin, Shortcut, Ganti Wallpaper, Mute Audio).",
    },
    {
      icon: <Command className="text-emerald-500" size={18} />,
      title: isEn ? "Application Launcher Overlay" : "Application Launcher Overlay",
      desc: isEn
        ? "Live search bar for apps & projects, keyboard auto-focus, right-click context menu to 'Pin to Shelf' or 'Add to Desktop', and smooth AnimatePresence transitions."
        : "Pencarian aplikasi & proyek secara real-time, keyboard auto-focus, context menu 'Pin to Shelf' / 'Tambah ke Desktop', dan animasi buka/tutup yang halus.",
    },
    {
      icon: <MousePointerClick className="text-rose-500" size={18} />,
      title: isEn ? "Desktop Context Menu" : "Right-Click Desktop Context Menu",
      desc: isEn
        ? "Right-click anywhere on the desktop to change wallpapers with ambient glow preview, quick action shortcuts, and view system information."
        : "Klik kanan di area desktop untuk mengganti wallpaper dinamis dengan animasi ambient glow, akses cepat launcher/window, dan info sistem.",
    },
    {
      icon: <ShieldCheck className="text-indigo-500" size={18} />,
      title: isEn ? "Keyboard Shortcuts & Accessibility" : "Keyboard Shortcuts & Aksesibilitas",
      desc: isEn
        ? "Keyboard navigation with Esc to close active windows/launcher, Alt+Space / Ctrl+Space for launcher toggle, focus-visible outlines, and complete Light/Dark mode."
        : "Navigasi keyboard dengan Esc untuk menutup window/launcher, Alt+Space untuk toggle launcher, ring fokus aksesibilitas, dan mode tema Terang/Gelap lengkap.",
    },
  ];

  const techStack = [
    { name: "Next.js 16 (App Router)", category: "Core Framework", icon: <Cpu size={14} className="text-blue-500" /> },
    { name: "TypeScript 5", category: "Language", icon: <Code2 size={14} className="text-blue-400" /> },
    { name: "Tailwind CSS v4", category: "Styling & Tokens", icon: <Sparkles size={14} className="text-cyan-400" /> },
    { name: "Zustand", category: "State Management", icon: <Layers size={14} className="text-amber-500" /> },
    { name: "Framer Motion", category: "Motion & Physics", icon: <Sparkles size={14} className="text-pink-500" /> },
    { name: "Lucide React", category: "Iconography", icon: <Globe size={14} className="text-emerald-500" /> },
    { name: "SunCalc Engine", category: "Astronomical Math", icon: <SunMedium size={14} className="text-orange-500" /> },
  ];

  const integratedApps = [
    { name: "Settings", icon: "⚙️" },
    { name: "Weather", icon: "🌤️" },
    { name: "Clock", icon: "🕐" },
    { name: "Calculator", icon: "🧮" },
    { name: "Notes", icon: "📝" },
    { name: "Calendar", icon: "📅" },
    { name: "Music Player", icon: "🎵" },
    { name: "Gallery", icon: "🖼️" },
    { name: "Terminal", icon: "💻" },
    { name: "Paint", icon: "🎨" },
    { name: "Snake Game", icon: "🎮" },
    { name: "Japanese Quiz", icon: "🌐" },
    { name: "Lovely Ever", icon: "💍" },
    { name: "About Me", icon: "👤" },
    { name: "Contact", icon: "✉️" },
  ];

  return (
    <div className="space-y-6 max-w-4xl pb-4">
      {/* Title */}
      <div>
        <h2 className={`text-base font-bold tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
          {isEn ? "About Son-OS" : "Tentang Son-OS"}
        </h2>
        <p className={`text-xs ${isLight ? "text-slate-600" : "text-zinc-400"}`}>
          {isEn
            ? "Operating system specifications, core features, architecture, and tech stack"
            : "Spesifikasi sistem operasi web desktop, fitur utama, arsitektur, dan teknologi"}
        </p>
      </div>

      {/* Hero OS Card */}
      <div
        className={`p-5 sm:p-6 rounded-3xl border space-y-4 relative overflow-hidden ${isLight
            ? "bg-linear-to-br from-white via-slate-50 to-blue-50/40 border-slate-200 shadow-sm"
            : "bg-linear-to-br from-zinc-900/90 via-zinc-900/60 to-blue-950/20 border-white/10"
          }`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-linear-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white font-black text-2xl shadow-xl shrink-0 ring-4 ring-blue-500/20">
            S
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className={`text-xl font-black tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
                Son-OS
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                v2.5 Aluminium Edition
              </span>
            </div>
            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
              Hybrid ChromeOS & Aluminium OS Web Desktop & Portfolio
            </p>
          </div>
        </div>

        <p className={`text-xs leading-relaxed ${isLight ? "text-slate-700" : "text-zinc-300"}`}>
          {isEn
            ? "Son-OS is an interactive desktop-based web portfolio that blends the clean aesthetics of ChromeOS with the vision of Aluminium OS. Equipped with a versatile window manager, independent floating dual-cluster shelf (app dock & status tray), desktop widgets & shortcuts, quick settings panel, system audio, and a suite of integrated web apps."
            : "Son-OS adalah web portfolio interaktif berbasis desktop yang mengadopsi estetika ChromeOS dan visi Aluminium OS (penerus ChromeOS dengan integrasi Android desktop). Dilengkapi dengan window manager serbaguna, floating dual-cluster shelf (app dock & status tray), desktop widgets & shortcuts, quick settings panel, sistem audio, serta berbagai aplikasi bawaan terintegrasi."}
        </p>

        {/* Quick Badges */}
        <div className="flex flex-wrap gap-2 pt-1 text-[11px] font-medium">
          <span className={`px-2.5 py-1 rounded-xl border flex items-center gap-1.5 ${isLight ? "bg-white/80 border-slate-200 text-slate-700" : "bg-white/5 border-white/10 text-zinc-300"
            }`}>
            <CheckCircle2 size={13} className="text-emerald-500" /> Next.js 16 App Router
          </span>
          <span className={`px-2.5 py-1 rounded-xl border flex items-center gap-1.5 ${isLight ? "bg-white/80 border-slate-200 text-slate-700" : "bg-white/5 border-white/10 text-zinc-300"
            }`}>
            <CheckCircle2 size={13} className="text-blue-500" /> React 19 & TypeScript
          </span>
          <span className={`px-2.5 py-1 rounded-xl border flex items-center gap-1.5 ${isLight ? "bg-white/80 border-slate-200 text-slate-700" : "bg-white/5 border-white/10 text-zinc-300"
            }`}>
            <CheckCircle2 size={13} className="text-cyan-500" /> Tailwind CSS v4
          </span>
          <span className={`px-2.5 py-1 rounded-xl border flex items-center gap-1.5 ${isLight ? "bg-white/80 border-slate-200 text-slate-700" : "bg-white/5 border-white/10 text-zinc-300"
            }`}>
            <CheckCircle2 size={13} className="text-amber-500" /> Zustand State
          </span>
        </div>
      </div>

      {/* Tech Stack Grid */}
      <div className="space-y-3">
        <h3 className={`text-xs font-bold uppercase tracking-wider ${isLight ? "text-slate-700" : "text-zinc-300"}`}>
          🛠️ {isEn ? "Technology Stack" : "Teknologi yang Digunakan"}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {techStack.map((tech, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-2xl border flex items-center gap-2.5 transition-all ${isLight ? "bg-white border-slate-200 shadow-xs" : "bg-zinc-900/70 border-white/10"
                }`}
            >
              <div className={`p-2 rounded-xl shrink-0 ${isLight ? "bg-slate-100" : "bg-white/5"}`}>
                {tech.icon}
              </div>
              <div className="min-w-0">
                <span className="text-[10px] opacity-70 block truncate">{tech.category}</span>
                <span className={`text-xs font-bold truncate block ${isLight ? "text-slate-800" : "text-white"}`}>
                  {tech.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Core Features Grid */}
      <div className="space-y-3">
        <h3 className={`text-xs font-bold uppercase tracking-wider ${isLight ? "text-slate-700" : "text-zinc-300"}`}>
          🚀 {isEn ? "Key Features & Capabilities" : "Fitur Utama & Kemampuan Sistem"}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {coreFeatures.map((feat, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl border space-y-2 transition-all ${isLight
                  ? "bg-white border-slate-200 hover:border-blue-400/40 hover:shadow-xs shadow-xs"
                  : "bg-zinc-900/70 border-white/10 hover:border-white/20"
                }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl ${isLight ? "bg-slate-100" : "bg-white/5"}`}>
                  {feat.icon}
                </div>
                <h4 className={`text-xs font-bold ${isLight ? "text-slate-900" : "text-white"}`}>
                  {feat.title}
                </h4>
              </div>
              <p className={`text-[11px] leading-relaxed ${isLight ? "text-slate-600" : "text-zinc-400"}`}>
                {feat.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Integrated Applications List */}
      <div className="space-y-3">
        <h3 className={`text-xs font-bold uppercase tracking-wider ${isLight ? "text-slate-700" : "text-zinc-300"}`}>
          📱 {isEn ? "Integrated Applications" : "Aplikasi Bawaan Terintegrasi"}
        </h3>
        <div
          className={`p-4 rounded-2xl border ${isLight ? "bg-white border-slate-200 shadow-xs" : "bg-zinc-900/70 border-white/10"
            }`}
        >
          <div className="flex flex-wrap gap-2">
            {integratedApps.map((app, idx) => (
              <span
                key={idx}
                className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all ${isLight
                    ? "bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100"
                    : "bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10"
                  }`}
              >
                <span>{app.icon}</span>
                <span>{app.name}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Developer & Actions Footer */}
      <div
        className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${isLight ? "bg-white border-slate-200 shadow-xs" : "bg-zinc-900/80 border-white/10"
          }`}
      >
        <div className="space-y-1">
          <h4 className={`text-xs font-bold ${isLight ? "text-slate-900" : "text-white"}`}>
            {isEn ? "Created & Developed by Sony (18mson)" : "Dibuat & Dikembangkan oleh Sony (18mson)"}
          </h4>
          <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-zinc-400">
            <a
              href="https://github.com/18mson/son-os"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-400 font-semibold flex items-center gap-1 cursor-pointer"
            >
              GitHub Repository <ExternalLink size={12} />
            </a>
            <span>•</span>
            <span>MIT License</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onResetSettings}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 text-xs font-semibold transition-all cursor-pointer shrink-0"
        >
          <RotateCcw size={14} /> {isEn ? "Reset Factory Settings" : "Reset Pengaturan ke Bawaan Pabrik"}
        </button>
      </div>
    </div>
  );
};
