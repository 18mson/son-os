import React from "react";
import { Volume2, VolumeX, Volume1, Sun, Moon } from "lucide-react";

interface ShelfDesktopStatusTrayProps {
  theme: string;
  quickSettingsOpen: boolean;
  toggleQuickSettings: () => void;
  time: string;
  dateStr: string;
  volume: number;
  soundEnabled: boolean;
}

export const ShelfDesktopStatusTray: React.FC<ShelfDesktopStatusTrayProps> = ({
  theme,
  quickSettingsOpen,
  toggleQuickSettings,
  time,
  dateStr,
  volume,
  soundEnabled,
}) => {
  const isLight = theme === "light";

  const VolumeIcon = !soundEnabled || volume === 0
    ? VolumeX
    : volume < 50
    ? Volume1
    : Volume2;

  return (
    <button
      data-status-tray
      onClick={(e) => {
        e.stopPropagation();
        toggleQuickSettings();
      }}
      title="Quick Settings & Status System"
      aria-label="Open Quick Settings & Status System"
      className={`fixed bottom-3 right-3 z-50 px-3.5 py-2 min-h-11 rounded-full text-xs backdrop-blur-2xl border transition-all duration-200 cursor-pointer flex items-center gap-3 shrink-0 hover:scale-105 active:scale-95 ${
        quickSettingsOpen
          ? "bg-blue-600 text-white border-blue-500 shadow-xl shadow-blue-600/30 scale-105"
          : isLight
          ? "bg-white/90 text-slate-800 border-slate-300/80 hover:bg-white shadow-xl shadow-slate-400/25"
          : "bg-zinc-950/90 text-zinc-200 border-white/15 hover:bg-zinc-900 shadow-2xl shadow-black/80"
      }`}
    >
      <div className="flex items-center gap-2 opacity-90">
        {/* Theme indicator */}
        {isLight
          ? <Sun size={13} className={quickSettingsOpen ? "text-white" : "text-amber-500"} />
          : <Moon size={13} className={quickSettingsOpen ? "text-white" : "text-blue-400"} />
        }
        {/* Volume indicator */}
        <VolumeIcon
          size={14}
          className={!soundEnabled || volume === 0
            ? quickSettingsOpen ? "text-white/60" : "text-zinc-400"
            : ""
          }
        />
      </div>
      <div className="flex flex-col items-end leading-tight font-sans">
        <span className="font-bold text-xs">{time || "10:30 AM"}</span>
        <span className="text-[10px] opacity-75">{dateStr}</span>
      </div>
    </button>
  );
};
