"use client";

import React from "react";
import { ShieldCheck, Cpu, Battery } from "lucide-react";
import { useWindowStore } from "@/store/windowStore";
import { APPS } from "@/config/appsConfig";

export const SystemMonitorWidget: React.FC = () => {
  const { openWindow, theme } = useWindowStore();
  const isLight = theme === "light";

  const handleOpenSettings = () => {
    const settingsApp = APPS.find((a) => a.id === "settings");
    if (settingsApp) {
      openWindow(settingsApp);
    }
  };

  return (
    <div
      data-widget
      onClick={handleOpenSettings}
      title="Buka Pengaturan Sistem"
      className={`group relative p-4 rounded-3xl overflow-hidden backdrop-blur-2xl transition-all duration-300 cursor-pointer select-none flex flex-col justify-between w-64 h-36 hover:scale-102 hover:-translate-y-1 ${
        isLight
          ? "bg-white/30 hover:bg-white/45 border border-white/50 shadow-lg shadow-black/5 text-slate-900"
          : "bg-black/30 hover:bg-black/45 border border-white/15 shadow-2xl text-zinc-100"
      }`}
    >
      <div className={`flex items-center justify-between transition-colors ${
        isLight ? "text-slate-600 group-hover:text-slate-900" : "text-zinc-400 group-hover:text-white"
      }`}>
        <span className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
          isLight ? "text-emerald-700" : "text-emerald-400"
        }`}>
          <ShieldCheck size={14} /> System Health
        </span>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
          isLight ? "bg-emerald-100 text-emerald-800 border-emerald-300" : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
        }`}>
          Optimal
        </span>
      </div>

      <div className="space-y-2 pt-1">
        {/* RAM Usage */}
        <div className="space-y-1">
          <div className={`flex justify-between text-[11px] font-medium ${
            isLight ? "text-slate-700" : "text-zinc-300"
          }`}>
            <span className={`flex items-center gap-1 ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
              <Cpu size={12} /> RAM (Web Heap)
            </span>
            <span className={`font-bold ${isLight ? "text-slate-900" : "text-white"}`}>42% (3.4 GB)</span>
          </div>
          <div className={`h-1.5 w-full rounded-full overflow-hidden ${
            isLight ? "bg-slate-200" : "bg-white/10"
          }`}>
            <div className="h-full bg-blue-500 rounded-full w-[42%]" />
          </div>
        </div>

        {/* Battery / Power */}
        <div className="space-y-1">
          <div className={`flex justify-between text-[11px] font-medium ${
            isLight ? "text-slate-700" : "text-zinc-300"
          }`}>
            <span className={`flex items-center gap-1 ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
              <Battery size={12} /> Daya AC
            </span>
            <span className={`font-bold ${isLight ? "text-slate-900" : "text-white"}`}>100% (Charging)</span>
          </div>
          <div className={`h-1.5 w-full rounded-full overflow-hidden ${
            isLight ? "bg-slate-200" : "bg-white/10"
          }`}>
            <div className="h-full bg-emerald-500 rounded-full w-full" />
          </div>
        </div>
      </div>
    </div>
  );
};
