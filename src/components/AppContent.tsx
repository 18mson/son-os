"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const JapaneseQuizApp = dynamic(() => import("./apps/JapaneseQuizApp").then((mod) => mod.JapaneseQuizApp), {
  loading: () => (
    <div className="flex flex-col items-center justify-center h-full p-8 text-zinc-400 gap-3">
      <Loader2 className="animate-spin text-rose-400" size={28} />
      <span className="text-xs font-medium">Memuat Japanese Quiz...</span>
    </div>
  ),
});

const LovelyEverApp = dynamic(() => import("./apps/LovelyEverApp").then((mod) => mod.LovelyEverApp), {
  loading: () => (
    <div className="flex flex-col items-center justify-center h-full p-8 text-zinc-400 gap-3">
      <Loader2 className="animate-spin text-pink-400" size={28} />
      <span className="text-xs font-medium">Memuat LovelyEver...</span>
    </div>
  ),
});

const AboutApp = dynamic(() => import("./apps/AboutApp").then((mod) => mod.AboutApp), {
  loading: () => (
    <div className="flex flex-col items-center justify-center h-full p-8 text-zinc-400 gap-3">
      <Loader2 className="animate-spin text-blue-400" size={28} />
      <span className="text-xs font-medium">Memuat About...</span>
    </div>
  ),
});

const ContactApp = dynamic(() => import("./apps/ContactApp").then((mod) => mod.ContactApp), {
  loading: () => (
    <div className="flex flex-col items-center justify-center h-full p-8 text-zinc-400 gap-3">
      <Loader2 className="animate-spin text-amber-400" size={28} />
      <span className="text-xs font-medium">Memuat Contact...</span>
    </div>
  ),
});

const ClockApp = dynamic(() => import("./apps/ClockApp").then((mod) => mod.ClockApp), {
  loading: () => (
    <div className="flex flex-col items-center justify-center h-full p-8 text-zinc-400 gap-3">
      <Loader2 className="animate-spin text-cyan-400" size={28} />
      <span className="text-xs font-medium">Memuat Jam...</span>
    </div>
  ),
});

const CalculatorApp = dynamic(() => import("./apps/CalculatorApp").then((mod) => mod.CalculatorApp), {
  loading: () => (
    <div className="flex flex-col items-center justify-center h-full p-8 text-zinc-400 gap-3">
      <Loader2 className="animate-spin text-emerald-400" size={28} />
      <span className="text-xs font-medium">Memuat Kalkulator...</span>
    </div>
  ),
});

const NotesApp = dynamic(() => import("./apps/NotesApp").then((mod) => mod.NotesApp), {
  loading: () => (
    <div className="flex flex-col items-center justify-center h-full p-8 text-zinc-400 gap-3">
      <Loader2 className="animate-spin text-amber-400" size={28} />
      <span className="text-xs font-medium">Memuat Catatan...</span>
    </div>
  ),
});

const CalendarApp = dynamic(() => import("./apps/CalendarApp").then((mod) => mod.CalendarApp), {
  loading: () => (
    <div className="flex flex-col items-center justify-center h-full p-8 text-zinc-400 gap-3">
      <Loader2 className="animate-spin text-blue-400" size={28} />
      <span className="text-xs font-medium">Memuat Kalender...</span>
    </div>
  ),
});

const MusicPlayerApp = dynamic(() => import("./apps/MusicPlayerApp").then((mod) => mod.MusicPlayerApp), {
  loading: () => (
    <div className="flex flex-col items-center justify-center h-full p-8 text-zinc-400 gap-3">
      <Loader2 className="animate-spin text-purple-400" size={28} />
      <span className="text-xs font-medium">Memuat Pemutar Musik...</span>
    </div>
  ),
});

const WeatherApp = dynamic(() => import("./apps/WeatherApp").then((mod) => mod.WeatherApp), {
  loading: () => (
    <div className="flex flex-col items-center justify-center h-full p-8 text-zinc-400 gap-3">
      <Loader2 className="animate-spin text-cyan-400" size={28} />
      <span className="text-xs font-medium">Memuat Cuaca...</span>
    </div>
  ),
});

const GalleryApp = dynamic(() => import("./apps/GalleryApp").then((mod) => mod.GalleryApp), {
  loading: () => (
    <div className="flex flex-col items-center justify-center h-full p-8 text-zinc-400 gap-3">
      <Loader2 className="animate-spin text-emerald-400" size={28} />
      <span className="text-xs font-medium">Memuat Galeri...</span>
    </div>
  ),
});

const TerminalApp = dynamic(() => import("./apps/TerminalApp").then((mod) => mod.TerminalApp), {
  loading: () => (
    <div className="flex flex-col items-center justify-center h-full p-8 text-zinc-400 gap-3">
      <Loader2 className="animate-spin text-zinc-400" size={28} />
      <span className="text-xs font-medium">Memuat Terminal...</span>
    </div>
  ),
});

const PaintApp = dynamic(() => import("./apps/PaintApp").then((mod) => mod.PaintApp), {
  loading: () => (
    <div className="flex flex-col items-center justify-center h-full p-8 text-zinc-400 gap-3">
      <Loader2 className="animate-spin text-purple-400" size={28} />
      <span className="text-xs font-medium">Memuat Paint...</span>
    </div>
  ),
});

const SettingsApp = dynamic(() => import("./apps/SettingsApp").then((mod) => mod.SettingsApp), {
  loading: () => (
    <div className="flex flex-col items-center justify-center h-full p-8 text-zinc-400 gap-3">
      <Loader2 className="animate-spin text-blue-400" size={28} />
      <span className="text-xs font-medium">Memuat Pengaturan...</span>
    </div>
  ),
});

const SnakeGameApp = dynamic(() => import("./apps/SnakeGameApp").then((mod) => mod.SnakeGameApp), {
  loading: () => (
    <div className="flex flex-col items-center justify-center h-full p-8 text-zinc-400 gap-3">
      <Loader2 className="animate-spin text-emerald-400" size={28} />
      <span className="text-xs font-medium">Memuat Snake Game...</span>
    </div>
  ),
});

interface AppContentProps {
  appId: string;
}

export const AppContent: React.FC<AppContentProps> = ({ appId }) => {
  switch (appId) {
    case "japanese-quiz":
      return <JapaneseQuizApp />;
    case "lovely-ever":
      return <LovelyEverApp />;
    case "about":
      return <AboutApp />;
    case "contact":
      return <ContactApp />;
    case "clock":
      return <ClockApp />;
    case "calculator":
      return <CalculatorApp />;
    case "notes":
      return <NotesApp />;
    case "calendar":
      return <CalendarApp />;
    case "music":
      return <MusicPlayerApp />;
    case "weather":
      return <WeatherApp />;
    case "gallery":
      return <GalleryApp />;
    case "terminal":
      return <TerminalApp />;
    case "paint":
      return <PaintApp />;
    case "settings":
      return <SettingsApp />;
    case "snake":
      return <SnakeGameApp />;
    default:
      return (
        <div className="p-6 text-center text-zinc-400">
          <p className="text-lg font-medium text-zinc-200">App Placeholder</p>
          <p className="text-sm mt-1">Content for this app will be updated soon.</p>
        </div>
      );
  }
};
