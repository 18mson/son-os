import React from "react";
import { Volume2, VolumeX } from "lucide-react";
import { useTranslation } from "@/i18n";

interface SoundTabProps {
  isLight: boolean;
  soundEnabled: boolean;
  toggleSound: () => void;
  volume: number;
  setVolume: (v: number) => void;
}

export const SoundTab: React.FC<SoundTabProps> = ({
  isLight,
  soundEnabled,
  toggleSound,
  volume,
  setVolume,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <h2 className={`text-base font-bold tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
          {t.settings.sound.title}
        </h2>
        <p className={`text-xs ${isLight ? "text-slate-600" : "text-zinc-400"}`}>
          {t.settings.sound.subtitle}
        </p>
      </div>

      {/* Toggle Efek Suara */}
      <div
        className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
          isLight ? "bg-white border-slate-200 shadow-sm" : "bg-zinc-900/80 border-white/10"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${soundEnabled ? "bg-green-500/20 text-green-500" : "bg-zinc-700/40 text-zinc-400"}`}>
            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </div>
          <div>
            <h3 className={`text-sm font-bold ${isLight ? "text-slate-900" : "text-white"}`}>
              {t.settings.sound.soundEffects}
            </h3>
            <p className={`text-xs mt-0.5 ${isLight ? "text-slate-600" : "text-zinc-400"}`}>
              {t.settings.sound.soundEffectsDesc}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={toggleSound}
          className={`w-12 h-6 rounded-full transition-colors relative p-1 shrink-0 cursor-pointer ${
            soundEnabled ? "bg-blue-600" : "bg-zinc-700"
          }`}
        >
          <div
            className={`w-4 h-4 rounded-full bg-white transition-transform ${
              soundEnabled ? "translate-x-6" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {/* Volume Slider */}
      <div
        className={`p-4 rounded-2xl border space-y-3 ${
          isLight ? "bg-white border-slate-200 shadow-sm" : "bg-zinc-900/80 border-white/10"
        }`}
      >
        <div className="flex items-center justify-between">
          <h3 className={`text-xs font-bold uppercase tracking-wider ${isLight ? "text-slate-700" : "text-zinc-300"}`}>
            {t.settings.sound.masterVolume}
          </h3>
          <span className="font-mono text-xs font-semibold">{Math.round(volume)}%</span>
        </div>

        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="w-full accent-blue-600 cursor-pointer h-1.5 rounded-lg bg-zinc-700/50"
        />
      </div>
    </div>
  );
};
