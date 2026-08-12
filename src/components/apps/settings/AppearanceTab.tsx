import React from "react";
import { Sun, Moon, Palette, Check } from "lucide-react";

interface AppearanceTabProps {
  isLight: boolean;
  theme: "light" | "dark";
  toggleTheme: () => void;
  wallpaper: string;
  setWallpaper: (wp: string) => void;
  WALLPAPERS: { id: string; name: string; url: string }[];
}

export const AppearanceTab: React.FC<AppearanceTabProps> = ({
  isLight,
  theme,
  toggleTheme,
  wallpaper,
  setWallpaper,
  WALLPAPERS,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className={`text-base font-bold tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
          Tema & Wallpaper
        </h2>
        <p className={`text-xs ${isLight ? "text-slate-600" : "text-zinc-400"}`}>
          Kustomisasi mode warna latar dan tampilan desktop.
        </p>
      </div>

      {/* Mode Gelap / Terang */}
      <div
        className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
          isLight ? "bg-white border-slate-200 shadow-sm" : "bg-zinc-900/80 border-white/10"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${isLight ? "bg-amber-100 text-amber-600" : "bg-indigo-500/20 text-indigo-400"}`}>
            {isLight ? <Sun size={20} /> : <Moon size={20} />}
          </div>
          <div>
            <h3 className={`text-sm font-bold ${isLight ? "text-slate-900" : "text-white"}`}>Mode Tampilan OS</h3>
            <p className={`text-xs mt-0.5 ${isLight ? "text-slate-600" : "text-zinc-400"}`}>
              {theme === "light" ? "Mode Terang (Light Mode)" : "Mode Gelap (Dark Mode)"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={toggleTheme}
          className={`w-12 h-6 rounded-full transition-colors relative p-1 shrink-0 cursor-pointer ${
            theme === "light" ? "bg-blue-600" : "bg-zinc-700"
          }`}
        >
          <div
            className={`w-4 h-4 rounded-full bg-white transition-transform ${
              theme === "light" ? "translate-x-6" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {/* Wallpaper Picker */}
      <div className="space-y-3">
        <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${isLight ? "text-slate-700" : "text-zinc-300"}`}>
          <Palette size={14} className="text-blue-500" /> Wallpaper Desktop
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {WALLPAPERS.map((wp) => (
            <button
              key={wp.id}
              onClick={() => setWallpaper(wp.id)}
              className={`group relative rounded-xl overflow-hidden border-2 transition-all cursor-pointer aspect-video flex items-center justify-center ${
                wallpaper === wp.id
                  ? "border-blue-500 ring-2 ring-blue-500/30 scale-102"
                  : isLight ? "border-slate-200 hover:border-slate-300" : "border-white/10 hover:border-white/20"
              }`}
            >
              <div className={`absolute inset-0 ${wp.url}`} />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
              <span className="relative z-10 text-[11px] font-medium text-white shadow-xs px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-xs">
                {wp.name}
              </span>
              {wallpaper === wp.id && (
                <div className="absolute top-1.5 right-1.5 z-10 w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-xs">
                  <Check size={12} />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
