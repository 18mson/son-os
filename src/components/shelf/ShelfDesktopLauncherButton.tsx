import React from "react";
import { LayoutGrid } from "lucide-react";

interface ShelfDesktopLauncherButtonProps {
  theme: string;
  launcherOpen: boolean;
  toggleLauncher: () => void;
}

export const ShelfDesktopLauncherButton: React.FC<ShelfDesktopLauncherButtonProps> = ({
  theme,
  launcherOpen,
  toggleLauncher,
}) => {
  return (
    <button
      data-launcher-button
      onClick={(e) => {
        e.stopPropagation();
        toggleLauncher();
      }}
      title="Launcher"
      aria-label="Toggle App Launcher"
      className={`fixed bottom-3 left-3 z-50 p-2.5 min-w-11 min-h-11 flex items-center justify-center rounded-full backdrop-blur-2xl transition-all duration-200 group focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-hidden hover:scale-105 active:scale-95 ${
        theme === "light"
          ? launcherOpen
            ? "bg-zinc-950 text-white border border-zinc-800 shadow-xl scale-105"
            : "bg-white/90 text-zinc-800 border border-black/10 hover:bg-white shadow-md shadow-black/10"
          : launcherOpen
          ? "bg-white text-zinc-950 border border-white/40 shadow-xl scale-105"
          : "bg-zinc-950/90 text-zinc-300 border border-white/15 hover:bg-zinc-900 hover:text-white shadow-2xl shadow-black/80"
      }`}
    >
      <LayoutGrid size={19} className="transition-transform group-hover:scale-110" />
    </button>
  );
};
