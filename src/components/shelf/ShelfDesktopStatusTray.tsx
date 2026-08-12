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
      className={`px-3 py-1.5 rounded-full text-xs transition-all duration-200 cursor-pointer flex items-center gap-3 shrink-0 ${
        quickSettingsOpen
          ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
          : theme === "light"
          ? "hover:bg-slate-200/80 text-slate-800"
          : "hover:bg-white/10 text-zinc-200"
      }`}
    >
      <div className="flex items-center gap-1.5 opacity-90">
        <Wifi size={13} />
        <Battery size={14} />
      </div>
      <div className="flex flex-col items-end leading-tight">
        <span className="font-semibold">{time || "10:30 AM"}</span>
        <span className="text-[10px] opacity-75">{dateStr}</span>
      </div>
    </button>
  );
};
