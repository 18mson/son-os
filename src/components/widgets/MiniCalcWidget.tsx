"use client";

import React, { useState } from "react";
import { Calculator } from "lucide-react";
import { useWindowStore } from "@/store/windowStore";
import { APPS } from "@/config/appsConfig";

export const MiniCalcWidget: React.FC = () => {
  const { openWindow } = useWindowStore();
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
      className="group relative p-3 rounded-3xl bg-zinc-950/40 border border-white/10 hover:border-white/25 hover:bg-zinc-950/60 backdrop-blur-xl shadow-2xl transition-all duration-300 select-none flex flex-col justify-between w-64 h-48 hover:scale-102 hover:-translate-y-1"
    >
      <div className="flex items-center justify-between text-zinc-400 pb-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
          <Calculator size={14} /> Kalkulator
        </span>
        <button
          onClick={handleOpenApp}
          title="Buka Aplikasi Kalkulator Lengkap"
          className="text-[10px] text-purple-400 hover:text-purple-300 font-semibold cursor-pointer"
        >
          Buka App ↗
        </button>
      </div>

      {/* Screen */}
      <div className="bg-zinc-900/90 border border-white/10 rounded-xl px-3 py-1.5 text-right font-mono text-lg text-white truncate font-bold shadow-inner">
        {display}
      </div>

      {/* Mini Keypad */}
      <div className="grid grid-cols-4 gap-1.5 pt-1 text-xs">
        <button onClick={handleClear} className="p-1.5 rounded-lg bg-rose-500/20 text-rose-300 font-bold hover:bg-rose-500/30">C</button>
        <button onClick={() => handleOp("÷")} className="p-1.5 rounded-lg bg-white/10 text-amber-300 font-bold hover:bg-white/20">÷</button>
        <button onClick={() => handleOp("×")} className="p-1.5 rounded-lg bg-white/10 text-amber-300 font-bold hover:bg-white/20">×</button>
        <button onClick={() => handleOp("-")} className="p-1.5 rounded-lg bg-white/10 text-amber-300 font-bold hover:bg-white/20">-</button>

        <button onClick={() => handleNum("7")} className="p-1.5 rounded-lg bg-white/5 text-zinc-200 hover:bg-white/10 font-medium">7</button>
        <button onClick={() => handleNum("8")} className="p-1.5 rounded-lg bg-white/5 text-zinc-200 hover:bg-white/10 font-medium">8</button>
        <button onClick={() => handleNum("9")} className="p-1.5 rounded-lg bg-white/5 text-zinc-200 hover:bg-white/10 font-medium">9</button>
        <button onClick={() => handleOp("+")} className="p-1.5 rounded-lg bg-white/10 text-amber-300 font-bold hover:bg-white/20">+</button>

        <button onClick={() => handleNum("4")} className="p-1.5 rounded-lg bg-white/5 text-zinc-200 hover:bg-white/10 font-medium">4</button>
        <button onClick={() => handleNum("5")} className="p-1.5 rounded-lg bg-white/5 text-zinc-200 hover:bg-white/10 font-medium">5</button>
        <button onClick={() => handleNum("6")} className="p-1.5 rounded-lg bg-white/5 text-zinc-200 hover:bg-white/10 font-medium">6</button>
        <button onClick={handleEqual} className="row-span-2 p-1.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-500 flex items-center justify-center">=</button>

        <button onClick={() => handleNum("1")} className="p-1.5 rounded-lg bg-white/5 text-zinc-200 hover:bg-white/10 font-medium">1</button>
        <button onClick={() => handleNum("2")} className="p-1.5 rounded-lg bg-white/5 text-zinc-200 hover:bg-white/10 font-medium">2</button>
        <button onClick={() => handleNum("3")} className="p-1.5 rounded-lg bg-white/5 text-zinc-200 hover:bg-white/10 font-medium">3</button>
      </div>
    </div>
  );
};
