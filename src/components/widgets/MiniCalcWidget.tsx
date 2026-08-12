"use client";

import React, { useState } from "react";
import { Calculator } from "lucide-react";
import { useWindowStore } from "@/store/windowStore";
import { APPS } from "@/config/appsConfig";

export const MiniCalcWidget: React.FC = () => {
  const { openWindow, theme } = useWindowStore();
  const isLight = theme === "light";
  const [display, setDisplay] = useState<string>("0");
  const [prev, setPrev] = useState<number | null>(null);
  const [op, setOp] = useState<string | null>(null);

  const handleNum = (n: string) => {
    setDisplay((p) => (p === "0" ? n : p + n));
  };

  const handleOp = (o: string) => {
    setPrev(parseFloat(display));
    setOp(o);
    setDisplay("0");
  };

  const handleEqual = () => {
    if (prev === null || op === null) return;
    const current = parseFloat(display);
    let res = 0;
    switch (op) {
      case "+": res = prev + current; break;
      case "-": res = prev - current; break;
      case "×": res = prev * current; break;
      case "÷": res = current !== 0 ? prev / current : 0; break;
    }
    setDisplay(String(res));
    setPrev(null);
    setOp(null);
  };

  const handleClear = () => {
    setDisplay("0");
    setPrev(null);
    setOp(null);
  };

  const handleOpenApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const calcApp = APPS.find((a) => a.id === "calculator");
    if (calcApp) openWindow(calcApp);
  };

  return (
    <div
      data-widget
      className={`group relative p-3 rounded-3xl overflow-hidden [clip-path:inset(0_round_1.5rem)] backdrop-blur-xl transition-colors duration-300 select-none flex flex-col justify-between w-64 h-48 shadow-none ${
        isLight
          ? "bg-white/45 hover:bg-white/55 border border-white/70 text-slate-900"
          : "bg-zinc-950/45 hover:bg-zinc-950/55 border border-white/15 text-zinc-100"
      }`}
    >
      <div className={`flex items-center justify-between pb-1 ${
        isLight ? "text-slate-600" : "text-zinc-400"
      }`}>
        <span className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
          isLight ? "text-purple-600" : "text-purple-400"
        }`}>
          <Calculator size={14} /> Kalkulator
        </span>
        <button
          onClick={handleOpenApp}
          title="Buka Aplikasi Kalkulator Lengkap"
          className={`text-[10px] font-semibold cursor-pointer ${
            isLight ? "text-purple-700 hover:text-purple-900" : "text-purple-400 hover:text-purple-300"
          }`}
        >
          Buka App ↗
        </button>
      </div>

      {/* Screen */}
      <div className={`border rounded-xl px-3 py-1.5 text-right font-mono text-lg truncate font-bold shadow-inner ${
        isLight
          ? "bg-slate-100/90 border-slate-300 text-slate-900"
          : "bg-zinc-900/90 border-white/10 text-white"
      }`}>
        {display}
      </div>

      {/* Mini Keypad */}
      <div onPointerDown={(e) => e.stopPropagation()} className="grid grid-cols-4 gap-1.5 pt-1 text-xs">
        <button onClick={handleClear} className="p-1.5 rounded-lg bg-rose-500/20 text-rose-500 font-bold hover:bg-rose-500/30">C</button>
        <button onClick={() => handleOp("÷")} className={`p-1.5 rounded-lg font-bold ${isLight ? "bg-amber-100 text-amber-700 hover:bg-amber-200" : "bg-white/10 text-amber-300 hover:bg-white/20"}`}>÷</button>
        <button onClick={() => handleOp("×")} className={`p-1.5 rounded-lg font-bold ${isLight ? "bg-amber-100 text-amber-700 hover:bg-amber-200" : "bg-white/10 text-amber-300 hover:bg-white/20"}`}>×</button>
        <button onClick={() => handleOp("-")} className={`p-1.5 rounded-lg font-bold ${isLight ? "bg-amber-100 text-amber-700 hover:bg-amber-200" : "bg-white/10 text-amber-300 hover:bg-white/20"}`}>-</button>

        <button onClick={() => handleNum("7")} className={`p-1.5 rounded-lg font-medium ${isLight ? "bg-slate-200/80 text-slate-800 hover:bg-slate-300" : "bg-white/5 text-zinc-200 hover:bg-white/10"}`}>7</button>
        <button onClick={() => handleNum("8")} className={`p-1.5 rounded-lg font-medium ${isLight ? "bg-slate-200/80 text-slate-800 hover:bg-slate-300" : "bg-white/5 text-zinc-200 hover:bg-white/10"}`}>8</button>
        <button onClick={() => handleNum("9")} className={`p-1.5 rounded-lg font-medium ${isLight ? "bg-slate-200/80 text-slate-800 hover:bg-slate-300" : "bg-white/5 text-zinc-200 hover:bg-white/10"}`}>9</button>
        <button onClick={() => handleOp("+")} className={`p-1.5 rounded-lg font-bold ${isLight ? "bg-amber-100 text-amber-700 hover:bg-amber-200" : "bg-white/10 text-amber-300 hover:bg-white/20"}`}>+</button>

        <button onClick={() => handleNum("4")} className={`p-1.5 rounded-lg font-medium ${isLight ? "bg-slate-200/80 text-slate-800 hover:bg-slate-300" : "bg-white/5 text-zinc-200 hover:bg-white/10"}`}>4</button>
        <button onClick={() => handleNum("5")} className={`p-1.5 rounded-lg font-medium ${isLight ? "bg-slate-200/80 text-slate-800 hover:bg-slate-300" : "bg-white/5 text-zinc-200 hover:bg-white/10"}`}>5</button>
        <button onClick={() => handleNum("6")} className={`p-1.5 rounded-lg font-medium ${isLight ? "bg-slate-200/80 text-slate-800 hover:bg-slate-300" : "bg-white/5 text-zinc-200 hover:bg-white/10"}`}>6</button>
        <button onClick={handleEqual} className="row-span-2 p-1.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-500 flex items-center justify-center">=</button>

        <button onClick={() => handleNum("1")} className={`p-1.5 rounded-lg font-medium ${isLight ? "bg-slate-200/80 text-slate-800 hover:bg-slate-300" : "bg-white/5 text-zinc-200 hover:bg-white/10"}`}>1</button>
        <button onClick={() => handleNum("2")} className={`p-1.5 rounded-lg font-medium ${isLight ? "bg-slate-200/80 text-slate-800 hover:bg-slate-300" : "bg-white/5 text-zinc-200 hover:bg-white/10"}`}>2</button>
        <button onClick={() => handleNum("3")} className={`p-1.5 rounded-lg font-medium ${isLight ? "bg-slate-200/80 text-slate-800 hover:bg-slate-300" : "bg-white/5 text-zinc-200 hover:bg-white/10"}`}>3</button>
      </div>
    </div>
  );
};
