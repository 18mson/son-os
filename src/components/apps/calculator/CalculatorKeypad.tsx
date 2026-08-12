import React from "react";
import { Delete } from "lucide-react";

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
  return (
    <div className="grid grid-cols-4 gap-2">
      {/* Row 1 */}
      <button
        onClick={clearAll}
        className="p-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-semibold text-sm transition-colors focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-hidden min-h-11"
      >
        AC
      </button>
      <button
        onClick={toggleSign}
        className="p-3 rounded-xl bg-white/10 hover:bg-white/15 text-zinc-200 font-semibold text-sm transition-colors focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-hidden min-h-11"
      >
        ±
      </button>
      <button
        onClick={inputPercent}
        className="p-3 rounded-xl bg-white/10 hover:bg-white/15 text-zinc-200 font-semibold text-sm transition-colors focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-hidden min-h-11"
      >
        %
      </button>
      <button
        onClick={() => performOperation("÷")}
        className={`p-3 rounded-xl font-bold text-base transition-colors focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-hidden min-h-11 ${
          operation === "÷" ? "bg-amber-500 text-white" : "bg-amber-600/80 hover:bg-amber-500 text-white"
        }`}
      >
        ÷
      </button>

      {/* Row 2 */}
      {["7", "8", "9"].map((num) => (
        <button
          key={num}
          onClick={() => inputDigit(num)}
          className="p-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-base transition-colors focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-hidden min-h-11"
        >
          {num}
        </button>
      ))}
      <button
        onClick={() => performOperation("×")}
        className={`p-3 rounded-xl font-bold text-base transition-colors focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-hidden min-h-11 ${
          operation === "×" ? "bg-amber-500 text-white" : "bg-amber-600/80 hover:bg-amber-500 text-white"
        }`}
      >
        ×
      </button>

      {/* Row 3 */}
      {["4", "5", "6"].map((num) => (
        <button
          key={num}
          onClick={() => inputDigit(num)}
          className="p-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-base transition-colors focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-hidden min-h-11"
        >
          {num}
        </button>
      ))}
      <button
        onClick={() => performOperation("-")}
        className={`p-3 rounded-xl font-bold text-base transition-colors focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-hidden min-h-11 ${
          operation === "-" ? "bg-amber-500 text-white" : "bg-amber-600/80 hover:bg-amber-500 text-white"
        }`}
      >
        -
      </button>

      {/* Row 4 */}
      {["1", "2", "3"].map((num) => (
        <button
          key={num}
          onClick={() => inputDigit(num)}
          className="p-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-base transition-colors focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-hidden min-h-11"
        >
          {num}
        </button>
      ))}
      <button
        onClick={() => performOperation("+")}
        className={`p-3 rounded-xl font-bold text-base transition-colors focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-hidden min-h-11 ${
          operation === "+" ? "bg-amber-500 text-white" : "bg-amber-600/80 hover:bg-amber-500 text-white"
        }`}
      >
        +
      </button>

      {/* Row 5 */}
      <button
        onClick={() => inputDigit("0")}
        className="p-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-base transition-colors focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-hidden min-h-11"
      >
        0
      </button>
      <button
        onClick={inputDot}
        className="p-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-base transition-colors focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-hidden min-h-11"
      >
        .
      </button>
      <button
        onClick={deleteLast}
        className="p-3 rounded-xl bg-white/10 hover:bg-white/15 text-zinc-300 font-semibold text-base flex items-center justify-center transition-colors focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-hidden min-h-11"
        title="Backspace"
      >
        <Delete size={18} />
      </button>
      <button
        onClick={handleEquals}
        className="p-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-base shadow-lg shadow-blue-600/30 transition-colors focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-hidden min-h-11"
      >
        =
      </button>
    </div>
  );
};
