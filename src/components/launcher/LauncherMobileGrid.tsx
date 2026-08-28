import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Pin,
  FolderKanban,
  Wrench,
  Gamepad2,
  Sliders,
  Layers,
  X,
} from "lucide-react";
import { AppDefinition, AppCategory } from "@/store/windowStore";
import { AppIcon } from "../AppIcon";
import { useTranslation, getAppTranslation } from "@/i18n";

type CategoryFilter = "all" | "pinned" | "portfolio" | "utility" | "entertainment" | "system";

interface LauncherMobileGridProps {
  launcherOpen: boolean;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  activeCategory: CategoryFilter;
  setActiveCategory: (cat: CategoryFilter) => void;
  pinnedApps: string[];
  pinnedAppDefs: AppDefinition[];
  APPS: AppDefinition[];
  handleOpenApp: (app: AppDefinition) => void;
  handleAppContextMenu: (e: React.MouseEvent, appId: string) => void;
  togglePinApp: (appId: string) => void;
  handleClose: () => void;
}

export const LauncherMobileGrid: React.FC<LauncherMobileGridProps> = ({
  launcherOpen,
  searchQuery,
  setSearchQuery,
  activeCategory,
  setActiveCategory,
  pinnedApps,
  pinnedAppDefs,
  APPS,
  handleOpenApp,
  handleAppContextMenu,
  togglePinApp,
  handleClose,
}) => {
  const { t, language } = useTranslation();

  const categoryConfigs: {
    id: CategoryFilter;
    label: string;
    icon: React.ReactNode;
  }[] = useMemo(() => [
    { id: "all", label: t.launcher.allCategories, icon: <Layers size={12} /> },
    { id: "pinned", label: `${t.launcher.pinnedApps} (${pinnedApps.length})`, icon: <Pin size={12} /> },
    { id: "portfolio", label: t.launcher.portfolio, icon: <FolderKanban size={12} /> },
    { id: "utility", label: t.launcher.utility, icon: <Wrench size={12} /> },
    { id: "entertainment", label: t.launcher.entertainment, icon: <Gamepad2 size={12} /> },
    { id: "system", label: t.launcher.system, icon: <Sliders size={12} /> },
  ], [t, pinnedApps.length]);

  const searchFilteredApps = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return APPS.filter((a) => {
      const appMeta = getAppTranslation(a.id, language);
      const title = appMeta?.title || a.title;
      const description = appMeta?.description || a.description;
      return (
        title.toLowerCase().includes(q) ||
        (description && description.toLowerCase().includes(q))
      );
    });
  }, [searchQuery, APPS, language]);

  const getAppsByCategory = (cat: AppCategory) => {
    return APPS.filter((app) => {
      const appCategories = Array.isArray(app.category) ? app.category : [app.category || "utility"];
      return appCategories.includes(cat);
    });
  };

  const renderTile = (app: AppDefinition, showBadge = false) => {
    const appMeta = getAppTranslation(app.id, language);
    const translatedTitle = appMeta?.title || app.title;
    const isPinned = pinnedApps.includes(app.id);

    return (
      <div
        key={app.id}
        onClick={() => handleOpenApp(app)}
        onContextMenu={(e) => handleAppContextMenu(e, app.id)}
        className="group relative flex flex-col items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 active:bg-white/15 active:scale-95 cursor-pointer touch-manipulation transition-all select-none"
      >
        {/* Pin Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            togglePinApp(app.id);
          }}
          title={isPinned ? t.launcher.unpinFromShelf : t.launcher.pinToShelf}
          className={`absolute top-1.5 right-1.5 z-10 p-1.5 rounded-full cursor-pointer transition-all ${
            isPinned
              ? "bg-blue-600 text-white shadow-xs"
              : "bg-white/10 text-zinc-400 hover:text-white"
          }`}
        >
          {isPinned ? <Pin size={10} className="fill-current" /> : <Pin size={10} />}
        </button>

        <div className={`w-12 h-12 rounded-2xl ${app.accentColor} flex items-center justify-center text-white shadow-md mt-1`}>
          <AppIcon name={app.icon} size={22} />
        </div>
        <span className="text-[11px] font-medium text-zinc-200 text-center line-clamp-1 w-full mt-2">
          {translatedTitle}
        </span>
        {showBadge && app.category && (
          <span className="text-[9px] text-zinc-500 line-clamp-1 capitalize mt-0.5">
            {Array.isArray(app.category) ? app.category[0] : app.category}
          </span>
        )}
      </div>
    );
  };

  return (
    <AnimatePresence>
      {launcherOpen && (
        <motion.div
          key="launcher-mobile-sheet"
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 350, damping: 32 }}
          className="fixed inset-0 z-75 bg-zinc-950/98 backdrop-blur-3xl flex flex-col justify-between select-none"
        >
          {/* Header Search Bar */}
          <div className="p-4 pt-12 border-b border-white/10 space-y-3 shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 border border-white/15 text-white">
                <Search size={16} className="text-zinc-400" />
                <input
                  type="text"
                  placeholder={t.launcher.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-xs text-white placeholder-zinc-400 outline-hidden"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="p-1 text-zinc-400 hover:text-white cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="px-3.5 py-2.5 rounded-xl bg-white/10 text-xs font-semibold text-white cursor-pointer active:scale-95 transition-transform shrink-0"
              >
                {t.common.close}
              </button>
            </div>

            {/* Category Filter Pills */}
            {!searchQuery && (
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {categoryConfigs.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-semibold whitespace-nowrap cursor-pointer transition-all ${
                      activeCategory === cat.id
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-white/5 text-zinc-400 hover:text-white"
                    }`}
                  >
                    {cat.icon}
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Main App Content Scroll */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5 no-scrollbar">
            {searchQuery ? (
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-white/5 mb-3">
                  <span className="text-xs font-semibold text-zinc-400">
                    {searchFilteredApps.length} {searchFilteredApps.length === 1 ? "app found" : "apps found"}
                  </span>
                </div>
                {searchFilteredApps.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-zinc-400">
                    <p className="text-sm font-medium">{t.launcher.noResults}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3 pb-8">
                    {searchFilteredApps.map((app) => renderTile(app, true))}
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Category: ALL -> Pinned Section + Flat All Apps Grid */}
                {activeCategory === "all" && (
                  <>
                    {/* Pinned Apps Section */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-blue-400 px-1">
                        <Pin size={12} className="fill-current" />
                        <span>{t.launcher.pinnedApps}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-500/20 font-mono">
                          {pinnedAppDefs.length}
                        </span>
                      </div>
                      {pinnedAppDefs.length === 0 ? (
                        <div className="p-4 rounded-2xl border border-dashed border-white/10 text-center text-zinc-500 text-xs">
                          {language === "en" ? "No pinned apps yet" : "Belum ada aplikasi yang disematkan"}
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 gap-3">
                          {pinnedAppDefs.map((app) => renderTile(app))}
                        </div>
                      )}
                    </div>

                    {/* All Apps Grid */}
                    <div className="space-y-2 pb-6">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 px-1 pt-2 border-t border-white/5">
                        <Layers size={12} />
                        <span>{t.launcher.allApps}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/10 font-mono">
                          {APPS.length}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {APPS.map((app) => renderTile(app))}
                      </div>
                    </div>
                  </>
                )}

                {/* Category: PINNED ONLY */}
                {activeCategory === "pinned" && (
                  <div className="space-y-2 pb-6">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-blue-400 px-1">
                      <Pin size={12} className="fill-current" />
                      <span>{t.launcher.pinnedApps}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-500/20 font-mono">
                        {pinnedAppDefs.length}
                      </span>
                    </div>
                    {pinnedAppDefs.length === 0 ? (
                      <div className="p-6 rounded-2xl border border-dashed border-white/10 text-center text-zinc-400 text-xs">
                        <p className="font-semibold mb-1">
                          {language === "en" ? "No pinned apps" : "Tidak ada aplikasi yang disematkan"}
                        </p>
                        <p className="text-zinc-500">
                          {language === "en" ? "Tap the pin icon on any app to pin it here" : "Ketuk ikon pin pada aplikasi untuk menyematkannya"}
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-3">
                        {pinnedAppDefs.map((app) => renderTile(app))}
                      </div>
                    )}
                  </div>
                )}

                {/* Category: PORTFOLIO */}
                {activeCategory === "portfolio" && (
                  <div className="space-y-2 pb-6">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 px-1">
                      <FolderKanban size={12} />
                      <span>{t.launcher.portfolio}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 font-mono">
                        {getAppsByCategory("portfolio").length}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {getAppsByCategory("portfolio").map((app) => renderTile(app))}
                    </div>
                  </div>
                )}

                {/* Category: UTILITY */}
                {activeCategory === "utility" && (
                  <div className="space-y-2 pb-6">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 px-1">
                      <Wrench size={12} />
                      <span>{t.launcher.utility}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 font-mono">
                        {getAppsByCategory("utility").length}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {getAppsByCategory("utility").map((app) => renderTile(app))}
                    </div>
                  </div>
                )}

                {/* Category: ENTERTAINMENT / GAMES */}
                {activeCategory === "entertainment" && (
                  <div className="space-y-2 pb-6">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-purple-400 px-1">
                      <Gamepad2 size={12} />
                      <span>{t.launcher.entertainment}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-500/20 font-mono">
                        {getAppsByCategory("entertainment").length}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {getAppsByCategory("entertainment").map((app) => renderTile(app))}
                    </div>
                  </div>
                )}

                {/* Category: SYSTEM */}
                {activeCategory === "system" && (
                  <div className="space-y-2 pb-6">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 px-1">
                      <Sliders size={12} />
                      <span>{t.launcher.system}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-500/20 font-mono">
                        {getAppsByCategory("system").length}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {getAppsByCategory("system").map((app) => renderTile(app))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
