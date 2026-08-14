// src/components/apps/photobooth/themes/themes.config.ts

export type PhotoboothLayout = "strip-1col" | "grid-2col" | "strip-1row" | "single";

export type ThemeCategory = "all" | "minimal" | "ornament" | "retro" | "aesthetic";

export type OrnamentType =
  | "none"
  | "film-roll"
  | "polaroid"
  | "y2k-cyber"
  | "kawaii-doodles"
  | "party-confetti"
  | "newspaper"
  | "botanical-love"
  | "pop-art"
  | "retro-tokyo"
  | "cyber-hud";

export interface PhotoboothTheme {
  id: string;
  name: string;
  category: ThemeCategory;
  description: string;
  shotCount: number; // Default recommended shot count
  allowedShotCounts: number[]; // e.g. [3, 4, 6]
  layout: PhotoboothLayout;
  allowedLayouts: PhotoboothLayout[];
  accentColor: string; // Tailwind gradient/color class for UI
  countdownSeconds: number;
  frameColor: string; // Frame background fill
  secondaryColor?: string;
  textColor: string;
  aspectRatio: number; // Photo frame aspect ratio (width/height)
  subtext?: string;
  badgeEmoji: string;
  ornamentType: OrnamentType;
  borderRadius?: number;
  patternType?: "none" | "dots" | "grid" | "stars" | "stripes" | "noise";
}

export const PHOTOBOOTH_THEMES: PhotoboothTheme[] = [
  // -------------------------------------------------------------
  // 1. MINIMALIST THEMES
  // -------------------------------------------------------------
  {
    id: "classic-noir-strip",
    name: "Classic Noir Strip",
    category: "minimal",
    description: "4 foto vertikal sleek bergaya strip photobooth studio modern",
    shotCount: 4,
    allowedShotCounts: [3, 4, 6],
    layout: "strip-1col",
    allowedLayouts: ["strip-1col", "grid-2col", "strip-1row"],
    accentColor: "bg-linear-to-br from-zinc-700 to-zinc-900",
    countdownSeconds: 3,
    frameColor: "#121215",
    textColor: "#f4f4f5",
    aspectRatio: 4 / 3,
    subtext: "SON-OS STUDIO NOIR",
    badgeEmoji: "🎞️",
    ornamentType: "none",
    patternType: "none",
  },
  {
    id: "clean-milk",
    name: "Clean Milk Studio",
    category: "minimal",
    description: "Frame putih gading minimalis bergaya majalah estetik Korea",
    shotCount: 4,
    allowedShotCounts: [2, 3, 4, 6],
    layout: "grid-2col",
    allowedLayouts: ["grid-2col", "strip-1col", "strip-1row"],
    accentColor: "bg-linear-to-br from-stone-400 to-zinc-600",
    countdownSeconds: 3,
    frameColor: "#faf8f5",
    textColor: "#1c1917",
    aspectRatio: 4 / 3,
    subtext: "MINIMAL • MOMENTS",
    badgeEmoji: "🥛",
    ornamentType: "none",
    patternType: "none",
  },
  {
    id: "polaroid-single",
    name: "Classic Polaroid",
    category: "minimal",
    description: "1 shot instant portrait dengan border polaroid lebar ikonik",
    shotCount: 1,
    allowedShotCounts: [1, 2],
    layout: "single",
    allowedLayouts: ["single"],
    accentColor: "bg-linear-to-br from-amber-500 to-rose-500",
    countdownSeconds: 3,
    frameColor: "#fcfbf9",
    textColor: "#18181b",
    aspectRatio: 1,
    subtext: "MEMORIES • TODAY",
    badgeEmoji: "📸",
    ornamentType: "polaroid",
    patternType: "none",
  },

  // -------------------------------------------------------------
  // 2. ORNAMENT & PLAYFUL THEMES (Banyak Hiasan & Doodles)
  // -------------------------------------------------------------
  {
    id: "y2k-cyber-sparkle",
    name: "Y2K Cyber Sparkle",
    category: "ornament",
    description: "Penuh ornamen bintang 4-sudut, holographic chrome, sticker pixel & hati",
    shotCount: 4,
    allowedShotCounts: [3, 4, 6],
    layout: "strip-1col",
    allowedLayouts: ["strip-1col", "grid-2col"],
    accentColor: "bg-linear-to-br from-fuchsia-500 via-purple-500 to-cyan-400",
    countdownSeconds: 3,
    frameColor: "#0f0728",
    secondaryColor: "#e879f9",
    textColor: "#f0abfc",
    aspectRatio: 4 / 3,
    subtext: "★ 2000s CYBER ANGEL ★",
    badgeEmoji: "🛸",
    ornamentType: "y2k-cyber",
    patternType: "stars",
  },
  {
    id: "kawaii-doodles",
    name: "Kawaii Doodles & Bows",
    category: "ornament",
    description: "Hiasan pita imut, jejak kaki kucing, doodle hati & sticker pastel",
    shotCount: 4,
    allowedShotCounts: [2, 4, 6],
    layout: "grid-2col",
    allowedLayouts: ["grid-2col", "strip-1col"],
    accentColor: "bg-linear-to-br from-pink-400 via-rose-300 to-pink-500",
    countdownSeconds: 3,
    frameColor: "#fff0f5",
    secondaryColor: "#f43f5e",
    textColor: "#e11d48",
    aspectRatio: 4 / 3,
    subtext: "♡ CUTIE PIE CLUB ♡",
    badgeEmoji: "🎀",
    ornamentType: "kawaii-doodles",
    patternType: "dots",
  },
  {
    id: "party-confetti",
    name: "Party & Confetti",
    category: "ornament",
    description: "Taburan confetti warna-warni, pita pesta, topi ulang tahun ceria",
    shotCount: 4,
    allowedShotCounts: [3, 4, 6],
    layout: "strip-1col",
    allowedLayouts: ["strip-1col", "grid-2col", "strip-1row"],
    accentColor: "bg-linear-to-br from-amber-400 via-rose-500 to-emerald-400",
    countdownSeconds: 3,
    frameColor: "#181824",
    secondaryColor: "#fbbf24",
    textColor: "#fef08a",
    aspectRatio: 4 / 3,
    subtext: "🎉 CELEBRATE TODAY! 🎈",
    badgeEmoji: "🥳",
    ornamentType: "party-confetti",
    patternType: "dots",
  },

  // -------------------------------------------------------------
  // 3. RETRO & ANALOG FILM
  // -------------------------------------------------------------
  {
    id: "kodak-35mm",
    name: "Kodak 35mm Analog",
    category: "retro",
    description: "Perforasi roll film 35mm asli, barcode DX, nomor frame merah & stamp tanggal",
    shotCount: 4,
    allowedShotCounts: [3, 4, 6],
    layout: "strip-1col",
    allowedLayouts: ["strip-1col", "strip-1row"],
    accentColor: "bg-linear-to-br from-amber-600 to-yellow-500",
    countdownSeconds: 3,
    frameColor: "#171512",
    secondaryColor: "#f59e0b",
    textColor: "#fbbf24",
    aspectRatio: 4 / 3,
    subtext: "KODAK GOLD 200 • 35MM",
    badgeEmoji: "🎞️",
    ornamentType: "film-roll",
    patternType: "none",
  },
  {
    id: "tokyo-90s-crt",
    name: "Tokyo 90s Vapor",
    category: "retro",
    description: "Nuansa anime 90s, subtitle katakana Jepang, neon grid & scanlines CRT",
    shotCount: 4,
    allowedShotCounts: [2, 4, 6],
    layout: "grid-2col",
    allowedLayouts: ["grid-2col", "strip-1col"],
    accentColor: "bg-linear-to-br from-cyan-500 to-fuchsia-600",
    countdownSeconds: 3,
    frameColor: "#0a0a14",
    secondaryColor: "#22d3ee",
    textColor: "#06b6d4",
    aspectRatio: 4 / 3,
    subtext: "東京ミッドナイト • TOKYO 1998",
    badgeEmoji: "🌆",
    ornamentType: "retro-tokyo",
    patternType: "grid",
  },

  // -------------------------------------------------------------
  // 4. AESTHETIC & EDITORIAL
  // -------------------------------------------------------------
  {
    id: "editorial-newspaper",
    name: "The Daily Gazette",
    category: "aesthetic",
    description: "Layout koran vintage dengan headline masthead, barcode & stempel kurator",
    shotCount: 4,
    allowedShotCounts: [2, 3, 4, 6],
    layout: "grid-2col",
    allowedLayouts: ["grid-2col", "strip-1col"],
    accentColor: "bg-linear-to-br from-zinc-600 to-stone-800",
    countdownSeconds: 3,
    frameColor: "#f2ede4",
    secondaryColor: "#292524",
    textColor: "#1c1917",
    aspectRatio: 4 / 3,
    subtext: "THE DAILY MEMORIES • VOL. XXIV",
    badgeEmoji: "📰",
    ornamentType: "newspaper",
    patternType: "stripes",
  },
  {
    id: "botanical-love",
    name: "Botanical Romance",
    category: "aesthetic",
    description: "Sulur dedaunan emas elegan, frame oval halus & tipografi pernikahan",
    shotCount: 4,
    allowedShotCounts: [2, 4, 6],
    layout: "grid-2col",
    allowedLayouts: ["grid-2col", "strip-1col", "single"],
    accentColor: "bg-linear-to-br from-emerald-600 to-amber-600",
    countdownSeconds: 3,
    frameColor: "#0d1b14",
    secondaryColor: "#fbbf24",
    textColor: "#fef3c7",
    aspectRatio: 4 / 3,
    subtext: "FOREVER & ALWAYS • EST. 2026",
    badgeEmoji: "🌿",
    ornamentType: "botanical-love",
    patternType: "none",
  },
  {
    id: "pop-art-comic",
    name: "Pop Art Comic",
    category: "aesthetic",
    description: "Pola titik halftone Roy Lichtenstein, balon dialog komik & warna primer tegas",
    shotCount: 4,
    allowedShotCounts: [2, 3, 4, 6],
    layout: "grid-2col",
    allowedLayouts: ["grid-2col", "strip-1col", "strip-1row"],
    accentColor: "bg-linear-to-br from-red-500 via-yellow-400 to-blue-600",
    countdownSeconds: 3,
    frameColor: "#fffbe6",
    secondaryColor: "#dc2626",
    textColor: "#0f172a",
    aspectRatio: 4 / 3,
    subtext: "POW! PHOTO BOOTH HEROES",
    badgeEmoji: "💥",
    ornamentType: "pop-art",
    patternType: "dots",
  },
];

export const DEFAULT_THEME_ID = "classic-noir-strip";

export function getThemeById(id: string): PhotoboothTheme {
  return PHOTOBOOTH_THEMES.find((t) => t.id === id) || PHOTOBOOTH_THEMES[0];
}
