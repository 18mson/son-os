import React from "react";
import { Type } from "lucide-react";

interface AccessibilityTabProps {
  isLight: boolean;
  reducedMotion: boolean;
  toggleReducedMotion: () => void;
  highContrast: boolean;
  toggleHighContrast: () => void;
  textScale: 'small' | 'normal' | 'large';
  setTextScale: (scale: 'small' | 'normal' | 'large') => void;
}

export const AccessibilityTab: React.FC<AccessibilityTabProps> = ({
  isLight,
  reducedMotion,
  toggleReducedMotion,
  highContrast,
  toggleHighContrast,
  textScale,
  setTextScale,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className={`text-base font-bold tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
          Aksesibilitas & Pengalaman Pengguna
        </h2>
        <p className={`text-xs ${isLight ? "text-slate-600" : "text-zinc-400"}`}>
          Sesuaikan animasi, kontras, dan ukuran teks agar lebih nyaman digunakan.
        </p>
      </div>

      {/* Reduced Motion Toggle */}
      <div
        className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
          isLight ? "bg-white border-slate-200 shadow-sm" : "bg-zinc-900/80 border-white/10"
        }`}
      >
        <div>
          <h3 className={`text-sm font-bold ${isLight ? "text-slate-900" : "text-white"}`}>
            Kurangi Gerakan (Reduced Motion)
          </h3>
          <p className={`text-xs mt-0.5 ${isLight ? "text-slate-600" : "text-zinc-400"}`}>
            Kurangi transisi dan efek blur berat untuk performa HP 2GB RAM lebih cepat.
          </p>
        </div>

        <button
          type="button"
          onClick={toggleReducedMotion}
          className={`w-12 h-6 rounded-full transition-colors relative p-1 shrink-0 cursor-pointer ${
            reducedMotion ? "bg-blue-600" : "bg-zinc-700"
          }`}
        >
          <div
            className={`w-4 h-4 rounded-full bg-white transition-transform ${
              reducedMotion ? "translate-x-6" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {/* High Contrast Toggle */}
      <div
        className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
          isLight ? "bg-white border-slate-200 shadow-sm" : "bg-zinc-900/80 border-white/10"
        }`}
      >
        <div>
          <h3 className={`text-sm font-bold ${isLight ? "text-slate-900" : "text-white"}`}>
            Kontras Tinggi (High Contrast)
          </h3>
          <p className={`text-xs mt-0.5 ${isLight ? "text-slate-600" : "text-zinc-400"}`}>
            Tingkatkan keterbacaan teks dan ketajaman elemen UI.
          </p>
        </div>

        <button
          type="button"
          onClick={toggleHighContrast}
          className={`w-12 h-6 rounded-full transition-colors relative p-1 shrink-0 cursor-pointer ${
            highContrast ? "bg-blue-600" : "bg-zinc-700"
          }`}
        >
          <div
            className={`w-4 h-4 rounded-full bg-white transition-transform ${
              highContrast ? "translate-x-6" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {/* Text Scale Selector */}
      <div
        className={`p-4 rounded-2xl border space-y-3 ${
          isLight ? "bg-white border-slate-200 shadow-sm" : "bg-zinc-900/80 border-white/10"
        }`}
      >
        <div className="flex items-center gap-2">
          <Type size={16} className="text-purple-500" />
          <h3 className={`text-xs font-bold uppercase tracking-wider ${isLight ? "text-slate-700" : "text-zinc-300"}`}>
            Ukuran Teks Sistem
          </h3>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {(["small", "normal", "large"] as const).map((scale) => (
            <button
              key={scale}
              onClick={() => setTextScale(scale)}
              className={`py-2 px-3 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer border ${
                textScale === scale
                  ? "bg-purple-600 text-white border-purple-500 shadow-md"
                  : isLight
                  ? "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
                  : "bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10"
              }`}
            >
              {scale}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
