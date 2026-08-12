import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingBag } from "lucide-react";
import { AppDefinition } from "@/store/windowStore";
import { AppIcon } from "../AppIcon";

interface LauncherMobileGridProps {
  launcherOpen: boolean;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  filteredApps: AppDefinition[];
  installedAppsList: AppDefinition[];
  handleOpenApp: (app: AppDefinition) => void;
  handleAppContextMenu: (e: React.MouseEvent, appId: string) => void;
  openWindow: (app: AppDefinition) => void;
  handleClose: () => void;
  APPS: AppDefinition[];
}

export const LauncherMobileGrid: React.FC<LauncherMobileGridProps> = ({
  launcherOpen,
  searchQuery,
  setSearchQuery,
  filteredApps,
  installedAppsList,
  handleOpenApp,
  handleAppContextMenu,
  openWindow,
  handleClose,
  APPS,
}) => {
  return (
    <AnimatePresence>
      {launcherOpen && (
        <motion.div
          key="launcher-mobile-sheet"
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 350, damping: 32 }}
          className="fixed inset-0 z-45 bg-zinc-950/98 backdrop-blur-3xl flex flex-col justify-between select-none"
        >
          {/* Header Search Bar */}
          <div className="p-4 pt-12 border-b border-white/10 flex items-center gap-3">
            <div className="flex-1 flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/10 border border-white/15 text-white">
              <Search size={18} className="text-zinc-400" />
              <input
                type="text"
                placeholder="Cari aplikasi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-sm text-white placeholder-zinc-400 outline-hidden"
              />
            </div>
            <button
              onClick={handleClose}
              className="px-3 py-2 rounded-xl bg-white/10 text-xs font-semibold text-white cursor-pointer active:scale-95 transition-transform"
            >
              Tutup
            </button>
          </div>

          {/* App Grid */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {installedAppsList.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center">
                <ShoppingBag size={36} className="text-blue-500 mb-2" />
                <p className="text-xs text-zinc-400">Belum ada aplikasi terinstal.</p>
                <button
                  onClick={() => {
                    const appStore = APPS.find((a) => a.id === "app-store");
                    if (appStore) openWindow(appStore);
                    handleClose();
                  }}
                  className="mt-3 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-md cursor-pointer"
                >
                  Buka App Store
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3 pb-8">
                {(searchQuery ? filteredApps : installedAppsList).map((app) => (
                  <button
                    key={app.id}
                    onClick={() => {
                      handleOpenApp(app);
                    }}
                    onContextMenu={(e) => handleAppContextMenu(e, app.id)}
                    className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white/5 border border-white/5 active:bg-white/20 active:scale-95 cursor-pointer touch-manipulation transition-all"
                  >
                    <div className={`w-12 h-12 rounded-2xl ${app.accentColor} flex items-center justify-center text-white shadow-md`}>
                      <AppIcon name={app.icon} size={22} />
                    </div>
                    <span className="text-[11px] font-medium text-zinc-200 text-center line-clamp-1">
                      {app.title}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
