import React from "react";
import { LayoutGrid } from "lucide-react";

interface ShelfMobileDeckProps {
  theme: string;
  launcherOpen: boolean;
  quickSettingsOpen: boolean;
  hasActiveWindow?: boolean;
  toggleLauncher: () => void;
  toggleQuickSettings: () => void;
  renderAppIcons: () => React.ReactNode;
  totalShelfItemsCount: number;
  time: string;
}

export const ShelfMobileDeck: React.FC<ShelfMobileDeckProps> = ({
  theme,
  launcherOpen,
  quickSettingsOpen,
  hasActiveWindow = false,
  toggleLauncher,
  toggleQuickSettings,
  renderAppIcons,
  totalShelfItemsCount,
  time,
}) => {
  return (
    <div
      data-shelf-dock
      className={`flex md:hidden fixed bottom-2 left-2 right-2 z-70 items-center justify-between px-2 py-1.5 rounded-full backdrop-blur-2xl border select-none max-w-[calc(100vw-16px)] transition-all duration-300 ${
        hasActiveWindow && !launcherOpen && !quickSettingsOpen


          ? "translate-y-24 opacity-0 pointer-events-none"
          : "translate-y-0 opacity-100"
      } ${
        theme === "light"
          ? "bg-white/90 border-slate-300/80 text-slate-900 shadow-xl shadow-slate-400/20"
          : "bg-zinc-950/90 border-white/15 text-zinc-100 shadow-2xl shadow-black/90"
      }`}
    >
      {/* Mobile Launcher Button */}
      <button
        data-launcher-button
        onClick={(e) => {
          e.stopPropagation();
          toggleLauncher();
        }}
        title="Launcher"
        aria-label="Toggle App Launcher"
        className={`p-2 min-w-9 min-h-9 flex items-center justify-center rounded-full transition-all duration-200 shrink-0 ${
          theme === "light"
            ? launcherOpen
              ? "bg-zinc-950 text-white"
              : "bg-white/90 text-zinc-800"
            : launcherOpen
            ? "bg-white text-zinc-950"
            : "bg-white/10 text-zinc-200"
        }`}
      >
        <LayoutGrid size={17} />
      </button>

      {totalShelfItemsCount > 0 && <div className="h-5 w-px bg-white/15 mx-1 shrink-0" />}

      {/* Scrollable App Icons in Center */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar flex-1 justify-center px-1">
        {renderAppIcons()}
      </div>

      <div className="h-5 w-px bg-white/15 mx-1 shrink-0" />

      {/* Mobile Status Button */}
      <button
        data-status-tray
        onClick={(e) => {
          e.stopPropagation();
          toggleQuickSettings();
        }}
        title="Quick Settings"
        aria-label="Open Quick Settings"
        className={`px-2.5 py-1 min-h-9 rounded-full text-xs font-semibold shrink-0 transition-colors ${
          quickSettingsOpen ? "bg-blue-600 text-white" : "text-zinc-200 hover:bg-white/10"
        }`}
      >
        <span>{time || "10:30 AM"}</span>
      </button>
    </div>
  );
};
