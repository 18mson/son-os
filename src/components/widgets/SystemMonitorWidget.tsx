"use client";

import React from "react";
import { ShieldCheck, Cpu, Battery } from "lucide-react";
import { useWindowStore } from "@/store/windowStore";
import { APPS } from "@/config/appsConfig";

export const SystemMonitorWidget: React.FC = () => {
  const { openWindow } = useWindowStore();

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
      className="group relative p-4 rounded-3xl bg-zinc-950/40 border border-white/10 hover:border-white/25 hover:bg-zinc-950/60 backdrop-blur-xl shadow-2xl transition-all duration-300 cursor-pointer select-none flex flex-col justify-between w-64 h-36 hover:scale-102 hover:-translate-y-1"
    >
      <div className="flex items-center justify-between text-zinc-400 group-hover:text-white transition-colors">
        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
          <ShieldCheck size={14} /> System Health
        </span>
        <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
          Optimal
        </span>
      </div>

      <div className="space-y-2 pt-1">
        {/* RAM Usage */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] font-medium text-zinc-300">
            <span className="flex items-center gap-1 text-zinc-400"><Cpu size={12} /> RAM (Web Heap)</span>
            <span className="font-bold text-white">42% (3.4 GB)</span>
          </div>
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full w-[42%]" />
          </div>
        </div>

        {/* Battery / Power */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] font-medium text-zinc-300">
            <span className="flex items-center gap-1 text-zinc-400"><Battery size={12} /> Daya AC</span>
            <span className="font-bold text-white">100% (Charging)</span>
          </div>
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full w-full" />
          </div>
        </div>
      </div>
    </div>
  );
};
