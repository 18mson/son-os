import React from "react";
import { Clock, LayoutGrid, Zap, Globe, Check } from "lucide-react";
import { DesktopWidgetConfig } from "@/store/windowStore";
import { useTranslation } from "@/i18n";

interface SystemTabProps {
  isLight: boolean;
  clockFormat: '12h' | '24h';
  setClockFormat: (fmt: '12h' | '24h') => void;
  desktopWidgets: DesktopWidgetConfig[];
  removeWidget: (id: string) => void;
  toggleWidgetGallery: () => void;
  reducedMotion: boolean;
  toggleReducedMotion: () => void;
}

export const SystemTab: React.FC<SystemTabProps> = ({
  isLight,
  clockFormat,
  setClockFormat,
  desktopWidgets,
  removeWidget,
  toggleWidgetGallery,
  reducedMotion,
  toggleReducedMotion,
}) => {
  const { t, language, setLanguage, languages } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <h2 className={`text-base font-bold tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
          {t.settings.system.title}
        </h2>
        <p className={`text-xs ${isLight ? "text-slate-600" : "text-zinc-400"}`}>
          {t.settings.system.subtitle}
        </p>
      </div>

      {/* Language Selector */}
      <div
        className={`p-4 rounded-2xl border space-y-3 ${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-zinc-900/80 border-white/10"
          }`}
      >
        <div className="flex items-center gap-2">
          <Globe size={16} className="text-blue-500" />
          <div>
            <h3 className={`text-xs font-bold uppercase tracking-wider ${isLight ? "text-slate-700" : "text-zinc-300"}`}>
              {t.settings.languageSectionTitle}
            </h3>
            <p className={`text-[11px] mt-0.5 ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
              {t.settings.languageSectionSubtitle}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {languages.map((lang) => {
            const isSelected = language === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => setLanguage(lang.code)}
                className={`p-3.5 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${isSelected
                    ? "bg-blue-600/10 border-blue-500 text-blue-400 ring-2 ring-blue-500/20 shadow-md"
                    : isLight
                      ? "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300"
                      : "bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10 hover:border-white/20"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl" role="img" aria-label={lang.name}>
                    {lang.flag}
                  </span>
                  <div>
                    <div className="text-xs font-bold flex items-center gap-1.5">
                      <span className={isSelected ? "text-blue-500 font-extrabold" : (isLight ? "text-slate-800" : "text-white")}>
                        {lang.nativeName}
                      </span>
                    </div>
                    <span className={`text-[10px] block ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                      {lang.name}
                    </span>
                  </div>
                </div>

                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-sm">
                    <Check size={14} className="stroke-3" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Format Jam */}
      <div
        className={`p-4 rounded-2xl border space-y-3 ${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-zinc-900/80 border-white/10"
          }`}
      >
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-indigo-500" />
          <h3 className={`text-xs font-bold uppercase tracking-wider ${isLight ? "text-slate-700" : "text-zinc-300"}`}>
            {t.settings.system.timeFormat}
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setClockFormat("12h")}
            className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${clockFormat === "12h"
                ? "bg-blue-600 text-white border-blue-500 shadow-md"
                : isLight
                  ? "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
                  : "bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10"
              }`}
          >
            {t.settings.system.time12h}
          </button>
          <button
            type="button"
            onClick={() => setClockFormat("24h")}
            className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${clockFormat === "24h"
                ? "bg-blue-600 text-white border-blue-500 shadow-md"
                : isLight
                  ? "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
                  : "bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10"
              }`}
          >
            {t.settings.system.time24h}
          </button>
        </div>
      </div>

      {/* Reduced Motion Toggle */}
      <div
        className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-zinc-900/80 border-white/10"
          }`}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${isLight ? "bg-amber-100 text-amber-600" : "bg-amber-500/20 text-amber-400"}`}>
            <Zap size={20} />
          </div>
          <div>
            <h3 className={`text-sm font-bold ${isLight ? "text-slate-900" : "text-white"}`}>
              {t.settings.system.reducedMotionTitle}
            </h3>
            <p className={`text-xs mt-0.5 ${isLight ? "text-slate-600" : "text-zinc-400"}`}>
              {t.settings.system.reducedMotionDesc}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={toggleReducedMotion}
          className={`w-12 h-6 rounded-full transition-colors relative p-1 shrink-0 cursor-pointer ${reducedMotion ? "bg-blue-600" : "bg-zinc-700"
            }`}
        >
          <div
            className={`w-4 h-4 rounded-full bg-white transition-transform ${reducedMotion ? "translate-x-6" : "translate-x-0"
              }`}
          />
        </button>
      </div>

      {/* Pengelolaan Widget */}
      <div
        className={`p-4 rounded-2xl border space-y-3 ${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-zinc-900/80 border-white/10"
          }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutGrid size={16} className="text-emerald-500" />
            <h3 className={`text-xs font-bold uppercase tracking-wider ${isLight ? "text-slate-700" : "text-zinc-300"}`}>
              {t.settings.system.activeWidgetsTitle} ({desktopWidgets.length})
            </h3>
          </div>
          <button
            type="button"
            onClick={toggleWidgetGallery}
            className="text-xs font-semibold text-blue-500 hover:text-blue-400 cursor-pointer"
          >
            {t.settings.system.openWidgetGallery}
          </button>
        </div>

        <div className="space-y-2">
          {desktopWidgets.length === 0 ? (
            <p className="text-xs opacity-75">{t.settings.system.noActiveWidgets}</p>
          ) : (
            desktopWidgets.map((w) => (
              <div
                key={w.id}
                className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${isLight ? "bg-slate-50 border-slate-200" : "bg-white/5 border-white/10"
                  }`}
              >
                <span className="font-semibold capitalize">{w.type} Widget</span>
                <button
                  type="button"
                  onClick={() => removeWidget(w.id)}
                  className="text-rose-500 hover:text-rose-400 font-medium cursor-pointer"
                >
                  {t.settings.system.remove}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
