import React from "react";
import { Wifi, Battery } from "lucide-react";

interface ShelfDesktopStatusTrayProps {
  theme: string;
  quickSettingsOpen: boolean;
  toggleQuickSettings: () => void;
  time: string;
  dateStr: string;
}

export const ShelfDesktopStatusTray: React.FC<ShelfDesktopStatusTrayProps> = ({
  theme,
  quickSettingsOpen,
  toggleQuickSettings,
  time,
  dateStr,
}) => {
  return (
    <button
      data-status-tray
      onClick={(e) => {
        e.stopPropagation();
        toggleQuickSettings();
      }}
      title="Quick Settings & Status System"
      aria-label="Open Quick Settings & Status System"
      className={`fixed bottom-3 right-3 z-50 px-3.5 py-2 min-h-11 rounded-full text-xs backdrop-blur-2xl border transition-all duration-200 cursor-pointer flex items-center gap-3 shrink-0 shadow-lg hover:scale-105 active:scale-95 ${
        quickSettingsOpen
          ? "bg-blue-600 text-white border-blue-500 shadow-blue-600/30 scale-105"
          : theme === "light"
          ? "bg-white/90 text-slate-800 border-black/10 hover:bg-white shadow-slate-400/20"
          : "bg-zinc-950/90 text-zinc-200 border-white/15 hover:bg-zinc-900 shadow-black/80"
      }`}
    >
      <div className="flex items-center gap-1.5 opacity-90">
        <Wifi size={14} />
        <Battery size={15} />
      </div>
      <div className="flex flex-col items-end leading-tight font-sans">
        <span className="font-bold text-xs">{time || "10:30 AM"}</span>
        <span className="text-[10px] opacity-75">{dateStr}</span>
      </div>
    </button>
  );
};
