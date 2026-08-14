// src/components/apps/photobooth/themes/themes.config.ts

export type PhotoboothLayout = "single" | "strip" | "grid";

export interface PhotoboothTheme {
  id: string;
  name: string;
  description: string;
  framePath: string; // path asset PNG transparan/SVG
  shotCount: number; // 1 (polaroid) / 4 (strip) / 4 (grid)
  layout: PhotoboothLayout;
  accentColor: string;
  countdownSeconds: number;
  frameColor: string;
  textColor: string;
  aspectRatio: number; // aspect ratio foto (w/h), e.g. 4/3, 1/1, 3/2
  subtext?: string;
  badgeEmoji?: string;
}

export const PHOTOBOOTH_THEMES: PhotoboothTheme[] = [
  {
    id: "film-strip",
    name: "Classic Film Strip",
    description: "4 foto vertikal bergaya photobooth strip retro analog",
    framePath: "/assets/photobooth/frames/film-strip.png",
    shotCount: 4,
    layout: "strip",
    accentColor: "bg-linear-to-br from-indigo-500 to-purple-600",
    countdownSeconds: 3,
    frameColor: "#121214", // Dark sleek frame
    textColor: "#f4f4f5",
    aspectRatio: 4 / 3,
    subtext: "SON-OS VINTAGE BOOTH",
    badgeEmoji: "🎞️",
  },
  {
    id: "polaroid",
    name: "Minimal Polaroid",
    description: "1 shot instant portrait dengan border polaroid putih ikonik",
    framePath: "/assets/photobooth/frames/polaroid.png",
    shotCount: 1,
    layout: "single",
    accentColor: "bg-linear-to-br from-amber-500 to-rose-500",
    countdownSeconds: 3,
    frameColor: "#fdfdfd", // White classic polaroid frame
    textColor: "#18181b",
    aspectRatio: 1, // 1:1 square instant photo
    subtext: "MEMORIES • TODAY",
    badgeEmoji: "📸",
  },
  {
    id: "grid-4",
    name: "Modern 2x2 Grid",
    description: "4 foto dalam layout grid 2x2 modern dan estetik",
    framePath: "/assets/photobooth/frames/grid-4.png",
    shotCount: 4,
    layout: "grid",
    accentColor: "bg-linear-to-br from-pink-500 to-rose-600",
    countdownSeconds: 3,
    frameColor: "#ffffff",
    textColor: "#27272a",
    aspectRatio: 4 / 3,
    subtext: "SON-OS PHOTO STUDIO",
    badgeEmoji: "✨",
  },
];

export const DEFAULT_THEME_ID = "film-strip";

export function getThemeById(id: string): PhotoboothTheme {
  return PHOTOBOOTH_THEMES.find((t) => t.id === id) || PHOTOBOOTH_THEMES[0];
}
