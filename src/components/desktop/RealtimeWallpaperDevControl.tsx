"use client";

import React, { useState, useEffect } from "react";
import { Clock, Play, Pause, RotateCcw, ChevronUp, ChevronDown, Calendar, Sun, Moon } from "lucide-react";

interface RealtimeWallpaperDevControlProps {
  currentDate: Date;
  onOverrideChange: (overrideDate: Date | null) => void;
  phase: string;
  moonPhaseName: string;
  isOverrideActive: boolean;
}

export const RealtimeWallpaperDevControl: React.FC<RealtimeWallpaperDevControlProps> = ({
  currentDate,
  onOverrideChange,
  phase,
  moonPhaseName,
  isOverrideActive,
}) => {
  // Only render in development mode (tree-shaken in production)
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <DevControlInternal
      currentDate={currentDate}
      onOverrideChange={onOverrideChange}
      phase={phase}
      moonPhaseName={moonPhaseName}
      isOverrideActive={isOverrideActive}
    />
  );
};

const DevControlInternal: React.FC<RealtimeWallpaperDevControlProps> = ({
  currentDate,
  onOverrideChange,
  phase,
  moonPhaseName,
  isOverrideActive,
}) => {
  const [baseDate] = useState(() => new Date());

  const [initialDebugState] = useState<{ date: Date | null; diffMin: number }>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const debugTimeParam = params.get("debugTime");
      if (debugTimeParam) {
        const parsed = new Date(debugTimeParam);
        if (!isNaN(parsed.getTime())) {
          const diffMinutes = Math.round((parsed.getTime() - Date.now()) / 60000);
          return { date: parsed, diffMin: diffMinutes };
        }
      }
    }
    return { date: null, diffMin: 0 };
  });

  const [isOpen, setIsOpen] = useState(() => initialDebugState.date !== null);
  const [offsetMinutes, setOffsetMinutes] = useState(() => initialDebugState.diffMin);
  const [isPlaying, setIsPlaying] = useState(false);

  // Fast-forward playback simulator (1 hour per second in playback mode)
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setOffsetMinutes((prev) => (prev + 30) % (30 * 24 * 60)); // loops over 30 days
    }, 200);

    return () => clearInterval(timer);
  }, [isPlaying]);

  // Synchronize override date with parent whenever offsetMinutes changes
  useEffect(() => {
    if (offsetMinutes === 0 && !initialDebugState.date) {
      onOverrideChange(null);
    } else {
      const targetDate = new Date(baseDate.getTime() + offsetMinutes * 60000);
      onOverrideChange(targetDate);
    }
  }, [offsetMinutes, baseDate, onOverrideChange, initialDebugState.date]);

  const handleSliderChange = (minutes: number) => {
    setIsPlaying(false);
    setOffsetMinutes(minutes);
  };

  const handlePresetTime = (hour: number, minute: number = 0) => {
    setIsPlaying(false);
    const target = new Date(baseDate);
    target.setHours(hour, minute, 0, 0);
    const diffMin = Math.round((target.getTime() - baseDate.getTime()) / 60000);
    setOffsetMinutes(diffMin);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setOffsetMinutes(0);
  };

  const formattedDate = currentDate.toLocaleDateString("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const formattedTime = currentDate.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div className="fixed top-3 left-3 z-50 pointer-events-auto select-none font-sans text-xs">
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl shadow-lg border backdrop-blur-xl transition-all cursor-pointer ${
            isOverrideActive
              ? "bg-amber-500/90 text-white border-amber-400/80 shadow-amber-500/20"
              : "bg-slate-900/80 text-zinc-300 border-white/10 hover:bg-slate-900/95 hover:text-white"
          }`}
          title="Dev-Only Time Override Controller"
        >
          <Clock size={14} className={isOverrideActive ? "animate-pulse" : ""} />
          <span className="font-semibold tracking-wide">
            {isOverrideActive ? `Time Debug: ${formattedTime}` : "Dev Time Scrubber"}
          </span>
          <ChevronDown size={14} />
        </button>
      ) : (
        <div className="w-84 p-4 rounded-3xl bg-slate-950/90 backdrop-blur-2xl border border-white/15 shadow-2xl text-white space-y-3.5 animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <Clock size={15} />
              <span>Dev Time Override</span>
            </div>
            <div className="flex items-center gap-1.5">
              {isOverrideActive && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-2 py-0.5 rounded-lg bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 transition-all text-[11px] cursor-pointer flex items-center gap-1"
                >
                  <RotateCcw size={11} /> Reset
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                <ChevronUp size={14} />
              </button>
            </div>
          </div>

          {/* Time & Phase Display */}
          <div className="bg-white/5 rounded-2xl p-2.5 border border-white/10 space-y-1">
            <div className="flex items-center justify-between font-mono text-sm font-bold text-amber-300">
              <span>{formattedTime}</span>
              <span className="text-xs font-normal text-zinc-400 flex items-center gap-1">
                <Calendar size={12} /> {formattedDate}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-zinc-300 pt-1 border-t border-white/5">
              <span className="flex items-center gap-1 capitalize">
                {phase === "night" || phase === "dusk" ? <Moon size={12} className="text-cyan-400" /> : <Sun size={12} className="text-amber-400" />}
                Fase: <strong>{phase}</strong>
              </span>
              <span className="text-zinc-400">
                Bulan: <strong className="text-cyan-300">{moonPhaseName}</strong>
              </span>
            </div>
          </div>

          {/* Scrubber Slider (0 to 30 days) */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] text-zinc-400 font-medium">
              <span>Sekarang (0h)</span>
              <span className="text-amber-300 font-mono">
                {offsetMinutes >= 0 ? `+${(offsetMinutes / 60).toFixed(1)} jam` : `${(offsetMinutes / 60).toFixed(1)} jam`}
                {Math.abs(offsetMinutes) >= 1440 ? ` (~${(offsetMinutes / 1440).toFixed(1)} hari)` : ""}
              </span>
              <span>+30 Hari</span>
            </div>
            <input
              type="range"
              min={0}
              max={30 * 24 * 60} // 30 days
              step={15} // 15-minute steps
              value={Math.max(0, offsetMinutes)}
              onChange={(e) => handleSliderChange(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>

          {/* Quick Preset Buttons */}
          <div className="grid grid-cols-5 gap-1 pt-1">
            <button
              type="button"
              onClick={() => handlePresetTime(7, 30)}
              className="px-1.5 py-1.5 rounded-xl bg-white/5 hover:bg-amber-500/20 hover:border-amber-400/40 border border-white/10 text-center transition-all cursor-pointer text-[10px]"
              title="Pagi Cerah (Wallpaper terang, matahari belum muncul)"
            >
              🌅 07:30
            </button>
            <button
              type="button"
              onClick={() => handlePresetTime(9, 30)}
              className="px-1.5 py-1.5 rounded-xl bg-white/5 hover:bg-amber-500/20 hover:border-amber-400/40 border border-white/10 text-center transition-all cursor-pointer text-[10px]"
              title="Matahari Masuk dari Kiri Atas"
            >
              🌤️ 09:30
            </button>
            <button
              type="button"
              onClick={() => handlePresetTime(12, 0)}
              className="px-1.5 py-1.5 rounded-xl bg-white/5 hover:bg-amber-500/20 hover:border-amber-400/40 border border-white/10 text-center transition-all cursor-pointer text-[10px]"
              title="Siang Terik (Langit tengah atas)"
            >
              ☀️ 12:00
            </button>
            <button
              type="button"
              onClick={() => handlePresetTime(17, 45)}
              className="px-1.5 py-1.5 rounded-xl bg-white/5 hover:bg-amber-500/20 hover:border-amber-400/40 border border-white/10 text-center transition-all cursor-pointer text-[10px]"
              title="Matahari Terbenam (Kanan atas laut)"
            >
              🌇 17:45
            </button>
            <button
              type="button"
              onClick={() => handlePresetTime(22, 0)}
              className="px-1.5 py-1.5 rounded-xl bg-white/5 hover:bg-cyan-500/20 hover:border-cyan-400/40 border border-white/10 text-center transition-all cursor-pointer text-[10px]"
              title="Bulan Malam (Muncul dari kiri atas ke kanan)"
            >
              🌙 22:00
            </button>
          </div>

          {/* Controls: Step & Simulator Playback */}
          <div className="flex items-center justify-between pt-1 border-t border-white/10">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleSliderChange(offsetMinutes - 60)}
                className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] transition-all cursor-pointer"
                title="-1 Jam"
              >
                -1h
              </button>
              <button
                type="button"
                onClick={() => handleSliderChange(offsetMinutes + 60)}
                className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] transition-all cursor-pointer"
                title="+1 Jam"
              >
                +1h
              </button>
              <button
                type="button"
                onClick={() => handleSliderChange(offsetMinutes + 1440)}
                className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] transition-all cursor-pointer"
                title="+1 Hari"
              >
                +1d
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${
                isPlaying
                  ? "bg-amber-500 text-black shadow-md"
                  : "bg-blue-600/80 hover:bg-blue-600 text-white"
              }`}
            >
              {isPlaying ? <Pause size={12} /> : <Play size={12} />}
              <span>{isPlaying ? "Pause" : "Play Cycle"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
