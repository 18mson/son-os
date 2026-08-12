export interface WallpaperConfig {
  bgClass: string;
  glowTopLeft: string;
  glowBottomRight: string;
}

export const WALLPAPER_CONFIGS: Record<string, WallpaperConfig> = {
  default: {
    bgClass: "bg-linear-to-br from-slate-950 via-zinc-900 to-indigo-950",
    glowTopLeft: "bg-indigo-600/35",
    glowBottomRight: "bg-purple-600/35",
  },
  ocean: {
    bgClass: "bg-linear-to-br from-slate-950 via-cyan-950 to-blue-950",
    glowTopLeft: "bg-cyan-500/40",
    glowBottomRight: "bg-blue-600/40",
  },
  sunset: {
    bgClass: "bg-linear-to-br from-zinc-950 via-rose-950 to-amber-950",
    glowTopLeft: "bg-rose-500/40",
    glowBottomRight: "bg-amber-500/40",
  },
  emerald: {
    bgClass: "bg-linear-to-br from-slate-950 via-emerald-950 to-teal-950",
    glowTopLeft: "bg-emerald-500/40",
    glowBottomRight: "bg-teal-600/40",
  },
  cyberpunk: {
    bgClass: "bg-linear-to-br from-zinc-950 via-fuchsia-950 to-purple-950",
    glowTopLeft: "bg-fuchsia-500/40",
    glowBottomRight: "bg-purple-600/40",
  },
  abstract: {
    bgClass: "bg-linear-to-br from-slate-900 via-zinc-900 to-stone-950",
    glowTopLeft: "bg-slate-500/30",
    glowBottomRight: "bg-stone-500/30",
  },
};

export const LIGHT_WALLPAPER_CONFIGS: Record<string, WallpaperConfig> = {
  default: {
    bgClass: "bg-linear-to-br from-slate-200 via-blue-100 to-indigo-200",
    glowTopLeft: "bg-blue-400/30",
    glowBottomRight: "bg-indigo-400/30",
  },
  ocean: {
    bgClass: "bg-linear-to-br from-cyan-100 via-sky-200 to-blue-300",
    glowTopLeft: "bg-cyan-300/40",
    glowBottomRight: "bg-blue-400/40",
  },
  sunset: {
    bgClass: "bg-linear-to-br from-amber-100 via-rose-200 to-orange-200",
    glowTopLeft: "bg-rose-300/40",
    glowBottomRight: "bg-amber-400/40",
  },
  emerald: {
    bgClass: "bg-linear-to-br from-emerald-100 via-teal-200 to-cyan-200",
    glowTopLeft: "bg-emerald-300/40",
    glowBottomRight: "bg-teal-400/40",
  },
  cyberpunk: {
    bgClass: "bg-linear-to-br from-fuchsia-100 via-pink-200 to-purple-200",
    glowTopLeft: "bg-fuchsia-300/40",
    glowBottomRight: "bg-purple-400/40",
  },
  abstract: {
    bgClass: "bg-linear-to-br from-slate-200 via-gray-300 to-zinc-200",
    glowTopLeft: "bg-slate-300/40",
    glowBottomRight: "bg-zinc-400/40",
  },
};
