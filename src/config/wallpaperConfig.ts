export type FractalType = "cosmic" | "cyber" | "geometry" | "sierpinski" | "koch" | "quantum" | "none";

export interface WallpaperItem {
  id: string;
  name: string;
  nameEn: string;
  nameId: string;
  category: "realtime" | "fractal" | "classic";
  descriptionEn: string;
  descriptionId: string;
  bgClass: string;
  glowTopLeft: string;
  glowBottomRight: string;
  fractalType: FractalType;
  previewGradient: string;
  accentColor: string;
}

export interface WallpaperConfig {
  bgClass: string;
  glowTopLeft: string;
  glowBottomRight: string;
  fractalType: FractalType;
}

export const WALLPAPERS_LIST: WallpaperItem[] = [
  // --- DYNAMIC REAL-TIME WALLPAPERS ---
  {
    id: "realtime-coastal",
    name: "Coastal Realtime",
    nameEn: "Coastal Realtime Sun & Shadow",
    nameId: "Pesisir Pantai Real-Time",
    category: "realtime",
    descriptionEn: "Dynamic coastal landscape with real-time astronomical sun/moon arc, horizon crossfade, and cliff tree shadows",
    descriptionId: "Pemandangan pantai dinamis dengan pergerakan matahari/bulan astronomis & bayangan pohon real-time",
    bgClass: "bg-linear-to-b from-sky-400 via-amber-200 to-teal-800",
    glowTopLeft: "bg-amber-400/40",
    glowBottomRight: "bg-teal-500/40",
    fractalType: "none",
    previewGradient: "bg-linear-to-r from-sky-400 via-amber-400 to-indigo-900",
    accentColor: "#f59e0b",
  },
  // --- STATIC FRACTAL WALLPAPERS ---
  {
    id: "fractal-cyber",
    name: "Cyber Matrix",
    nameEn: "Cyber Matrix Fractal",
    nameId: "Fraktal Matriks Siber",
    category: "fractal",
    descriptionEn: "High-tech recursive hexagonal grid and static neon cyan circuit traces",
    descriptionId: "Grid heksagonal rekursif berteknologi tinggi dan sirkuit sian statis",
    bgClass: "bg-linear-to-br from-zinc-950 via-slate-950 to-cyan-950",
    glowTopLeft: "bg-cyan-500/40",
    glowBottomRight: "bg-fuchsia-600/40",
    fractalType: "cyber",
    previewGradient: "bg-linear-to-r from-cyan-900 via-zinc-950 to-fuchsia-950",
    accentColor: "#22d3ee",
  },
  {
    id: "fractal-cosmic",
    name: "Cosmic Mandelbrot",
    nameEn: "Cosmic Mandelbrot",
    nameId: "Fraktal Kosmik Mandelbrot",
    category: "fractal",
    descriptionEn: "Deep space galactic spiral with static logarithmic golden fractal geometry",
    descriptionId: "Spiral galaksi luar angkasa dengan geometri fraktal logaritmik statis",
    bgClass: "bg-linear-to-br from-slate-950 via-purple-950 to-indigo-950",
    glowTopLeft: "bg-purple-600/40",
    glowBottomRight: "bg-indigo-500/40",
    fractalType: "cosmic",
    previewGradient: "bg-linear-to-br from-indigo-900 via-purple-950 to-slate-950",
    accentColor: "#c084fc",
  },
  {
    id: "fractal-geometry",
    name: "Golden Fibonacci",
    nameEn: "Golden Fibonacci Spiral",
    nameId: "Fraktal Fibonacci Emas",
    category: "fractal",
    descriptionEn: "Sacred geometry with static golden ratio spiral and Metatron matrix",
    descriptionId: "Geometri sakral dengan spiral rasio emas statis dan matriks Metatron",
    bgClass: "bg-linear-to-br from-stone-950 via-zinc-950 to-amber-950",
    glowTopLeft: "bg-amber-500/35",
    glowBottomRight: "bg-yellow-600/30",
    fractalType: "geometry",
    previewGradient: "bg-linear-to-tr from-amber-800 via-zinc-900 to-stone-950",
    accentColor: "#fbbf24",
  },
  {
    id: "fractal-sierpinski",
    name: "Sierpinski Gasket",
    nameEn: "Sierpinski Gasket Fractal",
    nameId: "Fraktal Segitiga Sierpinski",
    category: "fractal",
    descriptionEn: "Recursive self-similar geometric triangle mesh with emerald accents",
    descriptionId: "Struktur geometri segitiga fraktal rekursif dengan aksen zamrud",
    bgClass: "bg-linear-to-br from-slate-950 via-emerald-950 to-teal-950",
    glowTopLeft: "bg-emerald-500/40",
    glowBottomRight: "bg-teal-500/40",
    fractalType: "sierpinski",
    previewGradient: "bg-linear-to-br from-emerald-900 via-teal-950 to-slate-950",
    accentColor: "#34d399",
  },
  {
    id: "fractal-koch",
    name: "Koch Snowflake",
    nameEn: "Koch Snowflake Fractal",
    nameId: "Fraktal Kepingan Salju Koch",
    category: "fractal",
    descriptionEn: "Hexagonal 6-fold symmetric recursive snowflake star geometry",
    descriptionId: "Geometri kepingan salju bintang 6-sudut fraktal simetris statis",
    bgClass: "bg-linear-to-br from-slate-950 via-sky-950 to-blue-950",
    glowTopLeft: "bg-sky-500/40",
    glowBottomRight: "bg-cyan-600/40",
    fractalType: "koch",
    previewGradient: "bg-linear-to-br from-sky-900 via-blue-950 to-slate-950",
    accentColor: "#38bdf8",
  },
  {
    id: "fractal-quantum",
    name: "Quantum Tesseract",
    nameEn: "Quantum Tesseract",
    nameId: "Fraktal Tesseract Kuantum",
    category: "fractal",
    descriptionEn: "Static 4D hypercube isometric projection and orbital energy rings",
    descriptionId: "Proyeksi isometrik hiperkubus 4D dan orbit energi kuantum statis",
    bgClass: "bg-linear-to-br from-zinc-950 via-blue-950 to-slate-950",
    glowTopLeft: "bg-blue-600/40",
    glowBottomRight: "bg-violet-600/40",
    fractalType: "quantum",
    previewGradient: "bg-linear-to-bl from-blue-900 via-slate-950 to-violet-950",
    accentColor: "#60a5fa",
  },

  // --- CLASSIC GRADIENT WALLPAPERS ---
  {
    id: "default",
    name: "SonOS Mesh",
    nameEn: "SonOS Deep Mesh",
    nameId: "SonOS Mesh Klasik",
    category: "classic",
    descriptionEn: "Classic indigo and slate minimalist gradient background",
    descriptionId: "Latar gradien minimalis nila dan batu tulis klasik",
    bgClass: "bg-linear-to-br from-slate-950 via-zinc-900 to-indigo-950",
    glowTopLeft: "bg-indigo-600/35",
    glowBottomRight: "bg-purple-600/35",
    fractalType: "none",
    previewGradient: "bg-linear-to-br from-indigo-900 via-slate-950 to-blue-950",
    accentColor: "#6366f1",
  },
];

export const WALLPAPER_CONFIGS: Record<string, WallpaperConfig> = {
  // Fractal
  "fractal-cosmic": {
    bgClass: "bg-linear-to-br from-slate-950 via-purple-950 to-indigo-950",
    glowTopLeft: "bg-purple-600/40",
    glowBottomRight: "bg-indigo-500/40",
    fractalType: "cosmic",
  },
  "fractal-cyber": {
    bgClass: "bg-linear-to-br from-zinc-950 via-slate-950 to-cyan-950",
    glowTopLeft: "bg-cyan-500/40",
    glowBottomRight: "bg-fuchsia-600/40",
    fractalType: "cyber",
  },
  "fractal-geometry": {
    bgClass: "bg-linear-to-br from-stone-950 via-zinc-950 to-amber-950",
    glowTopLeft: "bg-amber-500/35",
    glowBottomRight: "bg-yellow-600/30",
    fractalType: "geometry",
  },
  "fractal-sierpinski": {
    bgClass: "bg-linear-to-br from-slate-950 via-emerald-950 to-teal-950",
    glowTopLeft: "bg-emerald-500/40",
    glowBottomRight: "bg-teal-500/40",
    fractalType: "sierpinski",
  },
  "fractal-koch": {
    bgClass: "bg-linear-to-br from-slate-950 via-sky-950 to-blue-950",
    glowTopLeft: "bg-sky-500/40",
    glowBottomRight: "bg-cyan-600/40",
    fractalType: "koch",
  },
  "fractal-quantum": {
    bgClass: "bg-linear-to-br from-zinc-950 via-blue-950 to-slate-950",
    glowTopLeft: "bg-blue-600/40",
    glowBottomRight: "bg-violet-600/40",
    fractalType: "quantum",
  },
  "realtime-coastal": {
    bgClass: "bg-black",
    glowTopLeft: "bg-amber-500/20",
    glowBottomRight: "bg-teal-500/20",
    fractalType: "none",
  },
  // Classic
  default: {
    bgClass: "bg-linear-to-br from-slate-950 via-zinc-900 to-indigo-950",
    glowTopLeft: "bg-indigo-600/35",
    glowBottomRight: "bg-purple-600/35",
    fractalType: "none",
  },
  ocean: {
    bgClass: "bg-linear-to-br from-slate-950 via-cyan-950 to-blue-950",
    glowTopLeft: "bg-cyan-500/40",
    glowBottomRight: "bg-blue-600/40",
    fractalType: "none",
  },
  sunset: {
    bgClass: "bg-linear-to-br from-zinc-950 via-rose-950 to-amber-950",
    glowTopLeft: "bg-rose-500/40",
    glowBottomRight: "bg-amber-500/40",
    fractalType: "none",
  },
  emerald: {
    bgClass: "bg-linear-to-br from-slate-950 via-emerald-950 to-teal-950",
    glowTopLeft: "bg-emerald-500/40",
    glowBottomRight: "bg-teal-600/40",
    fractalType: "none",
  },
  cyberpunk: {
    bgClass: "bg-linear-to-br from-zinc-950 via-fuchsia-950 to-purple-950",
    glowTopLeft: "bg-fuchsia-500/40",
    glowBottomRight: "bg-purple-600/40",
    fractalType: "none",
  },
  abstract: {
    bgClass: "bg-linear-to-br from-slate-900 via-zinc-900 to-stone-950",
    glowTopLeft: "bg-slate-500/30",
    glowBottomRight: "bg-stone-500/30",
    fractalType: "none",
  },
};

export const LIGHT_WALLPAPER_CONFIGS: Record<string, WallpaperConfig> = {
  // Fractal (Light Mode)
  "fractal-cosmic": {
    bgClass: "bg-linear-to-br from-slate-200 via-purple-100 to-indigo-200",
    glowTopLeft: "bg-purple-400/30",
    glowBottomRight: "bg-indigo-400/30",
    fractalType: "cosmic",
  },
  "fractal-cyber": {
    bgClass: "bg-linear-to-br from-slate-200 via-sky-100 to-cyan-200",
    glowTopLeft: "bg-cyan-300/40",
    glowBottomRight: "bg-fuchsia-300/30",
    fractalType: "cyber",
  },
  "fractal-geometry": {
    bgClass: "bg-linear-to-br from-amber-50 via-orange-100 to-amber-200",
    glowTopLeft: "bg-amber-300/40",
    glowBottomRight: "bg-yellow-300/40",
    fractalType: "geometry",
  },
  "fractal-sierpinski": {
    bgClass: "bg-linear-to-br from-emerald-100 via-teal-100 to-cyan-200",
    glowTopLeft: "bg-emerald-300/40",
    glowBottomRight: "bg-teal-300/40",
    fractalType: "sierpinski",
  },
  "fractal-koch": {
    bgClass: "bg-linear-to-br from-sky-100 via-blue-100 to-cyan-200",
    glowTopLeft: "bg-sky-300/40",
    glowBottomRight: "bg-cyan-300/40",
    fractalType: "koch",
  },
  "fractal-quantum": {
    bgClass: "bg-linear-to-br from-blue-100 via-indigo-100 to-slate-200",
    glowTopLeft: "bg-blue-300/40",
    glowBottomRight: "bg-indigo-300/40",
    fractalType: "quantum",
  },
  "realtime-coastal": {
    bgClass: "bg-slate-900",
    glowTopLeft: "bg-amber-300/30",
    glowBottomRight: "bg-teal-300/30",
    fractalType: "none",
  },
  // Classic (Light Mode)
  default: {
    bgClass: "bg-linear-to-br from-slate-200 via-blue-100 to-indigo-200",
    glowTopLeft: "bg-blue-400/30",
    glowBottomRight: "bg-indigo-400/30",
    fractalType: "none",
  },
  ocean: {
    bgClass: "bg-linear-to-br from-cyan-100 via-sky-200 to-blue-300",
    glowTopLeft: "bg-cyan-300/40",
    glowBottomRight: "bg-blue-400/40",
    fractalType: "none",
  },
  sunset: {
    bgClass: "bg-linear-to-br from-amber-100 via-rose-200 to-orange-200",
    glowTopLeft: "bg-rose-300/40",
    glowBottomRight: "bg-amber-400/40",
    fractalType: "none",
  },
  emerald: {
    bgClass: "bg-linear-to-br from-emerald-100 via-teal-200 to-cyan-200",
    glowTopLeft: "bg-emerald-300/40",
    glowBottomRight: "bg-teal-400/40",
    fractalType: "none",
  },
  cyberpunk: {
    bgClass: "bg-linear-to-br from-fuchsia-100 via-pink-200 to-purple-200",
    glowTopLeft: "bg-fuchsia-300/40",
    glowBottomRight: "bg-purple-400/40",
    fractalType: "none",
  },
  abstract: {
    bgClass: "bg-linear-to-br from-slate-200 via-gray-300 to-zinc-200",
    glowTopLeft: "bg-slate-300/40",
    glowBottomRight: "bg-zinc-400/40",
    fractalType: "none",
  },
};

export const WALLPAPERS_CYCLE_IDS = WALLPAPERS_LIST.map((w) => w.id);

export function getWallpaperById(id: string): WallpaperItem | undefined {
  return WALLPAPERS_LIST.find((w) => w.id === id);
}

export function getWallpaperDisplayName(id: string, language: string = "id"): string {
  const wp = getWallpaperById(id);
  if (!wp) {
    if (id.startsWith("http://") || id.startsWith("https://") || id.startsWith("/")) {
      return language === "en" ? "Custom Image" : "Gambar Kustom";
    }
    return id;
  }
  return language === "en" ? wp.nameEn : wp.nameId;
}
