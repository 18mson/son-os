"use client";

import React from "react";
import { Delete } from "lucide-react";
import { useWindowStore } from "@/store/windowStore";

interface CalculatorKeypadProps {
  operation: string | null;
  inputDigit: (digit: string) => void;
  inputDot: () => void;
  clearAll: () => void;
  deleteLast: () => void;
  toggleSign: () => void;
  inputPercent: () => void;
  performOperation: (op: string) => void;
  handleEquals: () => void;
}

export const CalculatorKeypad: React.FC<CalculatorKeypadProps> = ({
  operation,
  inputDigit,
  inputDot,
  clearAll,
  deleteLast,
  toggleSign,
  inputPercent,
  performOperation,
  handleEquals,
}) => {
  const { theme } = useWindowStore();
  const isLight = theme === "light";

  const numBtnClass = isLight
    ? "bg-white hover:bg-slate-50 border border-slate-300/80 text-slate-900 shadow-xs active:bg-slate-100"
    : "bg-white/10 hover:bg-white/15 border border-transparent text-white active:bg-white/20";

  const funcBtnClass = isLight
    ? "bg-slate-200/90 hover:bg-slate-300 border border-slate-300/80 text-slate-800 shadow-xs active:bg-slate-300/80"
    : "bg-white/10 hover:bg-white/15 border border-transparent text-zinc-200 active:bg-white/20";

  const opBtnClass = (op: string) => {
    if (operation === op) {
      return "bg-amber-500 text-white shadow-md shadow-amber-500/30 ring-2 ring-amber-400";
    }
    return isLight
      ? "bg-amber-100/90 hover:bg-amber-200/90 border border-amber-300/80 text-amber-800 shadow-xs active:bg-amber-200"
      : "bg-amber-600/80 hover:bg-amber-500 text-white active:bg-amber-600";
  };

  return (
    <div className="grid grid-cols-4 gap-2.5">
      {/* Row 1 */}
      <button
        type="button"
        onClick={clearAll}
        className={`p-3 rounded-2xl font-bold text-sm transition-all focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-hidden min-h-12 flex items-center justify-center cursor-pointer ${
          isLight
            ? "bg-rose-100 hover:bg-rose-200/90 border border-rose-300/80 text-rose-700 shadow-xs active:bg-rose-200"
            : "bg-rose-500/20 hover:bg-rose-500/30 text-rose-300"
        }`}
      >
        AC
      </button>
      <button
        type="button"
        onClick={toggleSign}
        className={`p-3 rounded-2xl font-semibold text-sm transition-all focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-hidden min-h-12 flex items-center justify-center cursor-pointer ${funcBtnClass}`}
      >
        ±
      </button>
      <button
        type="button"
        onClick={inputPercent}
        className={`p-3 rounded-2xl font-semibold text-sm transition-all focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-hidden min-h-12 flex items-center justify-center cursor-pointer ${funcBtnClass}`}
      >
        %
      </button>
      <button
        type="button"
        onClick={() => performOperation("÷")}
        className={`p-3 rounded-2xl font-bold text-lg transition-all focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-hidden min-h-12 flex items-center justify-center cursor-pointer ${opBtnClass("÷")}`}
      >
        ÷
      </button>

      {/* Row 2 */}
      {["7", "8", "9"].map((num) => (
        <button
          key={num}
          type="button"
          onClick={() => inputDigit(num)}
          className={`p-3 rounded-2xl font-semibold text-base transition-all focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-hidden min-h-12 flex items-center justify-center cursor-pointer ${numBtnClass}`}
        >
          {num}
        </button>
      ))}
      <button
        type="button"
        onClick={() => performOperation("×")}
        className={`p-3 rounded-2xl font-bold text-lg transition-all focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-hidden min-h-12 flex items-center justify-center cursor-pointer ${opBtnClass("×")}`}
      >
        ×
      </button>

      {/* Row 3 */}
      {["4", "5", "6"].map((num) => (
        <button
          key={num}
          type="button"
          onClick={() => inputDigit(num)}
          className={`p-3 rounded-2xl font-semibold text-base transition-all focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-hidden min-h-12 flex items-center justify-center cursor-pointer ${numBtnClass}`}
        >
          {num}
        </button>
      ))}
      <button
        type="button"
        onClick={() => performOperation("-")}
        className={`p-3 rounded-2xl font-bold text-lg transition-all focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-hidden min-h-12 flex items-center justify-center cursor-pointer ${opBtnClass("-")}`}
      >
        -
      </button>

      {/* Row 4 */}
      {["1", "2", "3"].map((num) => (
        <button
          key={num}
          type="button"
          onClick={() => inputDigit(num)}
          className={`p-3 rounded-2xl font-semibold text-base transition-all focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-hidden min-h-12 flex items-center justify-center cursor-pointer ${numBtnClass}`}
        >
          {num}
        </button>
      ))}
      <button
        type="button"
        onClick={() => performOperation("+")}
        className={`p-3 rounded-2xl font-bold text-lg transition-all focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-hidden min-h-12 flex items-center justify-center cursor-pointer ${opBtnClass("+")}`}
      >
        +
      </button>

      {/* Row 5 */}
      <button
        type="button"
        onClick={() => inputDigit("0")}
        className={`p-3 rounded-2xl font-semibold text-base transition-all focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-hidden min-h-12 flex items-center justify-center cursor-pointer ${numBtnClass}`}
      >
        0
      </button>
      <button
        type="button"
        onClick={inputDot}
        className={`p-3 rounded-2xl font-semibold text-base transition-all focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-hidden min-h-12 flex items-center justify-center cursor-pointer ${numBtnClass}`}
      >
        .
      </button>
      <button
        type="button"
        onClick={deleteLast}
        className={`p-3 rounded-2xl font-semibold text-base transition-all focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-hidden min-h-12 flex items-center justify-center cursor-pointer ${funcBtnClass}`}
        title="Backspace"
      >
        <Delete size={18} />
      </button>
      <button
        type="button"
        onClick={handleEquals}
        className="p-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg shadow-lg shadow-blue-600/30 transition-all focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-hidden min-h-12 flex items-center justify-center cursor-pointer active:scale-95"
      >
        =
      </button>
    </div>
  );
};
