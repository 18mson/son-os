"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Delete } from "lucide-react";

export const CalculatorApp: React.FC = () => {
  const [display, setDisplay] = useState<string>("0");
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState<boolean>(false);
  const [expression, setExpression] = useState<string>("");

  const inputDigit = useCallback(
    (digit: string) => {
      if (waitingForOperand) {
        setDisplay(digit);
        setWaitingForOperand(false);
      } else {
        setDisplay(display === "0" ? digit : display + digit);
      }
    },
    [display, waitingForOperand]
  );

  const inputDot = useCallback(() => {
    if (waitingForOperand) {
      setDisplay("0.");
      setWaitingForOperand(false);
    } else if (!display.includes(".")) {
      setDisplay(display + ".");
    }
  }, [display, waitingForOperand]);

  const clearAll = useCallback(() => {
    setDisplay("0");
    setPrevValue(null);
    setOperation(null);
    setWaitingForOperand(false);
    setExpression("");
  }, []);

  const deleteLast = useCallback(() => {
    if (waitingForOperand) return;
    if (display.length === 1 || (display.length === 2 && display.startsWith("-"))) {
      setDisplay("0");
    } else {
      setDisplay(display.slice(0, -1));
    }
  }, [display, waitingForOperand]);

  const toggleSign = useCallback(() => {
    const value = parseFloat(display);
    if (value !== 0) {
      setDisplay((value * -1).toString());
    }
  }, [display]);

  const inputPercent = useCallback(() => {
    const value = parseFloat(display);
    setDisplay((value / 100).toString());
  }, [display]);

  const performOperation = useCallback(
    (nextOperation: string) => {
      const inputValue = parseFloat(display);

      if (prevValue == null) {
        setPrevValue(inputValue);
        setExpression(`${inputValue} ${nextOperation}`);
      } else if (operation) {
        const currentValue = prevValue || 0;
        let newValue = currentValue;

        switch (operation) {
          case "+":
            newValue = currentValue + inputValue;
            break;
          case "-":
            newValue = currentValue - inputValue;
            break;
          case "×":
          case "*":
            newValue = currentValue * inputValue;
            break;
          case "÷":
          case "/":
            newValue = inputValue !== 0 ? currentValue / inputValue : 0;
            break;
        }

        setPrevValue(newValue);
        setDisplay(String(newValue));
        setExpression(`${newValue} ${nextOperation}`);
      }

      setWaitingForOperand(true);
      setOperation(nextOperation);
    },
    [display, operation, prevValue]
  );

  const handleEquals = useCallback(() => {
    if (!operation || prevValue == null) return;

    const inputValue = parseFloat(display);
    let newValue = prevValue;

    switch (operation) {
      case "+":
        newValue = prevValue + inputValue;
        break;
      case "-":
        newValue = prevValue - inputValue;
        break;
      case "×":
      case "*":
        newValue = prevValue * inputValue;
        break;
      case "÷":
      case "/":
        newValue = inputValue !== 0 ? prevValue / inputValue : 0;
        break;
    }

    setExpression(`${prevValue} ${operation} ${inputValue} =`);
    setDisplay(String(newValue));
    setPrevValue(null);
    setOperation(null);
    setWaitingForOperand(true);
  }, [display, operation, prevValue]);

  // Keyboard Event Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") {
        inputDigit(e.key);
      } else if (e.key === ".") {
        inputDot();
      } else if (e.key === "+" || e.key === "-") {
        performOperation(e.key);
      } else if (e.key === "*") {
        performOperation("×");
      } else if (e.key === "/") {
        e.preventDefault();
        performOperation("÷");
      } else if (e.key === "Enter" || e.key === "=") {
        e.preventDefault();
        handleEquals();
      } else if (e.key === "Backspace") {
        deleteLast();
      } else if (e.key === "Escape") {
        clearAll();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [inputDigit, inputDot, performOperation, handleEquals, deleteLast, clearAll]);

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 p-4 select-none max-w-sm mx-auto" data-calculator-app>
      {/* Display Screen */}
      <div className="flex flex-col justify-end items-end p-4 rounded-2xl bg-zinc-900 border border-white/10 shadow-inner mb-4 h-28 overflow-hidden shrink-0">
        <span className="text-xs font-mono text-zinc-400 min-h-4 truncate max-w-full">
          {expression}
        </span>
        <span className="text-3xl font-bold font-mono tracking-tight text-white truncate max-w-full">
          {display}
        </span>
      </div>

      {/* Button Grid */}
      <div className="grid grid-cols-4 gap-2 flex-1">
        {/* Row 1 */}
        <button
          onClick={clearAll}
          className="p-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-rose-400 font-semibold text-sm transition-colors focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-hidden min-h-11"
        >
          AC
        </button>
        <button
          onClick={toggleSign}
          className="p-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-sm transition-colors focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-hidden min-h-11"
        >
          ±
        </button>
        <button
          onClick={inputPercent}
          className="p-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-sm transition-colors focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-hidden min-h-11"
        >
          %
        </button>
        <button
          onClick={() => performOperation("÷")}
          className={`p-3 rounded-xl font-bold text-base transition-colors focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-hidden min-h-11 ${
            operation === "÷"
              ? "bg-amber-500 text-white"
              : "bg-amber-600/80 hover:bg-amber-500 text-white"
          }`}
        >
          ÷
        </button>

        {/* Row 2 */}
        <button
          onClick={() => inputDigit("7")}
          className="p-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-base transition-colors focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-hidden min-h-11"
        >
          7
        </button>
        <button
          onClick={() => inputDigit("8")}
          className="p-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-base transition-colors focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-hidden min-h-11"
        >
          8
        </button>
        <button
          onClick={() => inputDigit("9")}
          className="p-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-base transition-colors focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-hidden min-h-11"
        >
          9
        </button>
        <button
          onClick={() => performOperation("×")}
          className={`p-3 rounded-xl font-bold text-base transition-colors focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-hidden min-h-11 ${
            operation === "×"
              ? "bg-amber-500 text-white"
              : "bg-amber-600/80 hover:bg-amber-500 text-white"
          }`}
        >
          ×
        </button>

        {/* Row 3 */}
        <button
          onClick={() => inputDigit("4")}
          className="p-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-base transition-colors focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-hidden min-h-11"
        >
          4
        </button>
        <button
          onClick={() => inputDigit("5")}
          className="p-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-base transition-colors focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-hidden min-h-11"
        >
          5
        </button>
        <button
          onClick={() => inputDigit("6")}
          className="p-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-base transition-colors focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-hidden min-h-11"
        >
          6
        </button>
        <button
          onClick={() => performOperation("-")}
          className={`p-3 rounded-xl font-bold text-base transition-colors focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-hidden min-h-11 ${
            operation === "-"
              ? "bg-amber-500 text-white"
              : "bg-amber-600/80 hover:bg-amber-500 text-white"
          }`}
        >
          -
        </button>

        {/* Row 4 */}
        <button
          onClick={() => inputDigit("1")}
          className="p-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-base transition-colors focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-hidden min-h-11"
        >
          1
        </button>
        <button
          onClick={() => inputDigit("2")}
          className="p-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-base transition-colors focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-hidden min-h-11"
        >
          2
        </button>
        <button
          onClick={() => inputDigit("3")}
          className="p-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-base transition-colors focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-hidden min-h-11"
        >
          3
        </button>
        <button
          onClick={() => performOperation("+")}
          className={`p-3 rounded-xl font-bold text-base transition-colors focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-hidden min-h-11 ${
            operation === "+"
              ? "bg-amber-500 text-white"
              : "bg-amber-600/80 hover:bg-amber-500 text-white"
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
    </div>
  );
};
