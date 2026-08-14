// src/components/apps/photobooth/filters/filters.config.ts

export interface PhotoboothFilter {
  id: string;
  name: string;
  category: "natural" | "vintage" | "color" | "artistic";
  description: string;
  cssFilter: string; // Used for realtime live video preview
  colorCorrection: {
    saturation: number;
    contrast: number;
    brightness: number;
    warmth: number;
    sharpness: number;
  };
  canvasFilter?: string; // Standard Canvas 2D filter string
  badgeEmoji: string;
  previewColor: string; // Color preview swatch
}

export const PHOTOBOOTH_FILTERS: PhotoboothFilter[] = [
  {
    id: "normal",
    name: "Natural",
    category: "natural",
    description: "Warna asli natural dengan detail tajam",
    cssFilter: "none",
    colorCorrection: {
      saturation: 1.0,
      contrast: 1.0,
      brightness: 1.0,
      warmth: 0.0,
      sharpness: 0.25,
    },
    badgeEmoji: "✨",
    previewColor: "bg-zinc-700",
  },
  {
    id: "bw-noir",
    name: "B&W Noir",
    category: "artistic",
    description: "Monochrome klasik dengan kontras tegas & deep shadows",
    cssFilter: "grayscale(100%) contrast(125%) brightness(105%)",
    canvasFilter: "grayscale(100%) contrast(1.25) brightness(1.05)",
    colorCorrection: {
      saturation: 0.0,
      contrast: 1.25,
      brightness: 1.05,
      warmth: 0.0,
      sharpness: 0.35,
    },
    badgeEmoji: "🖤",
    previewColor: "bg-zinc-900",
  },
  {
    id: "vintage-warm",
    name: "Kodak Warm",
    category: "vintage",
    description: "Nuansa nostalgia hangat bernuansa film analog 90s",
    cssFilter: "sepia(25%) saturate(120%) contrast(110%) brightness(102%)",
    canvasFilter: "sepia(25%) saturate(1.2) contrast(1.1) brightness(1.02)",
    colorCorrection: {
      saturation: 1.2,
      contrast: 1.1,
      brightness: 1.02,
      warmth: 0.18,
      sharpness: 0.25,
    },
    badgeEmoji: "🎞️",
    previewColor: "bg-amber-600",
  },
  {
    id: "cool-fuji",
    name: "Fuji Teal",
    category: "vintage",
    description: "Tone sejuk dengan nuansa hijau-kebiruan khas film Jepang",
    cssFilter: "hue-rotate(-10deg) saturate(115%) contrast(108%) brightness(104%)",
    canvasFilter: "hue-rotate(-10deg) saturate(1.15) contrast(1.08) brightness(1.04)",
    colorCorrection: {
      saturation: 1.15,
      contrast: 1.08,
      brightness: 1.04,
      warmth: -0.12,
      sharpness: 0.3,
    },
    badgeEmoji: "🍃",
    previewColor: "bg-teal-600",
  },
  {
    id: "cyber-neon",
    name: "Cyber Neon",
    category: "color",
    description: "Warna pekat vibrant cyberpunk berani dan futuristik",
    cssFilter: "saturate(160%) contrast(125%) hue-rotate(15deg)",
    canvasFilter: "saturate(1.6) contrast(1.25) hue-rotate(15deg)",
    colorCorrection: {
      saturation: 1.6,
      contrast: 1.25,
      brightness: 1.0,
      warmth: 0.05,
      sharpness: 0.4,
    },
    badgeEmoji: "⚡",
    previewColor: "bg-pink-600",
  },
  {
    id: "soft-pastel",
    name: "Soft Pastel",
    category: "natural",
    description: "Cahaya lembut dreamy dengan tone pink pastel kawaii",
    cssFilter: "brightness(112%) contrast(92%) saturate(125%)",
    canvasFilter: "brightness(1.12) contrast(0.92) saturate(1.25)",
    colorCorrection: {
      saturation: 1.25,
      contrast: 0.92,
      brightness: 1.12,
      warmth: 0.08,
      sharpness: 0.1,
    },
    badgeEmoji: "🌸",
    previewColor: "bg-rose-400",
  },
  {
    id: "sepia-retro",
    name: "Sepia 1970",
    category: "vintage",
    description: "Sentuhan cokelat antik bergaya foto arsip klasik",
    cssFilter: "sepia(75%) contrast(110%) brightness(95%)",
    canvasFilter: "sepia(75%) contrast(1.1) brightness(0.95)",
    colorCorrection: {
      saturation: 0.8,
      contrast: 1.1,
      brightness: 0.95,
      warmth: 0.4,
      sharpness: 0.2,
    },
    badgeEmoji: "📜",
    previewColor: "bg-yellow-800",
  },
  {
    id: "cinema-moody",
    name: "Cinema Moody",
    category: "artistic",
    description: "Grading teal & orange sinematik dengan bayangan dramatis",
    cssFilter: "contrast(130%) saturate(120%) brightness(96%)",
    canvasFilter: "contrast(1.3) saturate(1.2) brightness(0.96)",
    colorCorrection: {
      saturation: 1.2,
      contrast: 1.3,
      brightness: 0.96,
      warmth: 0.1,
      sharpness: 0.35,
    },
    badgeEmoji: "🎬",
    previewColor: "bg-indigo-900",
  },
  {
    id: "fade-vintage",
    name: "Faded Film",
    category: "vintage",
    description: "Bayangan matte terangkat bergaya kamera saku retro",
    cssFilter: "contrast(88%) brightness(108%) saturate(90%)",
    canvasFilter: "contrast(0.88) brightness(1.08) saturate(0.9)",
    colorCorrection: {
      saturation: 0.9,
      contrast: 0.88,
      brightness: 1.08,
      warmth: 0.05,
      sharpness: 0.15,
    },
    badgeEmoji: "☁️",
    previewColor: "bg-slate-500",
  },
  {
    id: "vivid-pop",
    name: "Vivid Pop",
    category: "color",
    description: "Saturasi ekstra punchy dengan warna mencolok",
    cssFilter: "saturate(180%) contrast(115%) brightness(105%)",
    canvasFilter: "saturate(1.8) contrast(1.15) brightness(1.05)",
    colorCorrection: {
      saturation: 1.8,
      contrast: 1.15,
      brightness: 1.05,
      warmth: 0.0,
      sharpness: 0.35,
    },
    badgeEmoji: "🍭",
    previewColor: "bg-violet-600",
  },
];

export const DEFAULT_FILTER_ID = "normal";

export function getFilterById(id: string): PhotoboothFilter {
  return PHOTOBOOTH_FILTERS.find((f) => f.id === id) || PHOTOBOOTH_FILTERS[0];
}
