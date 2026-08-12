import React from "react";
import { Search, ShoppingBag } from "lucide-react";
import { APPS } from "@/config/appsConfig";
import { AppDefinition } from "@/store/windowStore";

interface LauncherSearchBarProps {
  isLight: boolean;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  onOpenApp: (app: AppDefinition) => void;
}

export const LauncherSearchBar: React.FC<LauncherSearchBarProps> = ({
  isLight,
  searchQuery,
  setSearchQuery,
  searchInputRef,
  onOpenApp,
}) => {
  const appStoreApp = APPS.find((a) => a.id === "app-store");

  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex-1 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border transition-all ${
          isLight
            ? "bg-slate-100 border-slate-300 text-slate-900 focus-within:border-blue-500 focus-within:bg-white"
            : "bg-white/8 border-white/10 text-white focus-within:border-blue-500/60 focus-within:bg-white/12"
        }`}
      >
        <Search size={17} className={isLight ? "text-slate-400" : "text-zinc-400"} />
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Cari aplikasi atau fitur Son-OS..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-transparent text-xs font-medium outline-hidden placeholder:text-zinc-400"
        />
      </div>

      {appStoreApp && (
        <button
          onClick={() => onOpenApp(appStoreApp)}
          className="flex items-center gap-1.5 px-3 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-colors cursor-pointer shrink-0"
        >
          <ShoppingBag size={15} /> App Store
        </button>
      )}
    </div>
  );
};
