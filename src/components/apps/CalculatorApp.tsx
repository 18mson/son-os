"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useWindowStore } from "@/store/windowStore";
import { CalculatorKeypad } from "./calculator/CalculatorKeypad";

export const CalculatorApp: React.FC = () => {
  const { theme } = useWindowStore();
  const isLight = theme === "light";

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
    if (prevValue == null || !operation) return;

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") {
        inputDigit(e.key);
      } else if (e.key === ".") {
        inputDot();
      } else if (e.key === "Backspace") {
        deleteLast();
      } else if (e.key === "Escape") {
        clearAll();
      } else if (e.key === "Enter" || e.key === "=") {
        e.preventDefault();
        handleEquals();
      } else if (e.key === "+") {
        performOperation("+");
      } else if (e.key === "-") {
        performOperation("-");
      } else if (e.key === "*") {
        performOperation("×");
      } else if (e.key === "/") {
        e.preventDefault();
        performOperation("÷");
      } else if (e.key === "%") {
        inputPercent();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [clearAll, deleteLast, handleEquals, inputDigit, inputDot, inputPercent, performOperation]);

  return (
    <div className={`flex flex-col h-full w-full p-4 select-none font-sans overflow-hidden ${
      isLight ? "bg-slate-100 text-slate-900" : "bg-zinc-950 text-zinc-100"
    }`}>
      {/* Expression & Result Display */}
      <div className={`p-4 rounded-2xl border mb-3 flex flex-col justify-end items-end h-28 overflow-hidden transition-all ${
        isLight ? "bg-white border-slate-300 shadow-inner" : "bg-zinc-900/80 border-white/10"
      }`}>
        <div className={`text-xs font-mono mb-1 truncate max-w-full ${
          isLight ? "text-slate-400" : "text-zinc-500"
        }`}>
          {expression || "\u00A0"}
        </div>
        <div className={`text-3xl sm:text-4xl font-mono font-bold tracking-tight truncate max-w-full ${
          isLight ? "text-slate-900" : "text-white"
        }`}>
          {display}
        </div>
      </div>

      {/* Keypad Grid */}
      <CalculatorKeypad
        operation={operation}
        inputDigit={inputDigit}
        inputDot={inputDot}
        clearAll={clearAll}
        deleteLast={deleteLast}
        toggleSign={toggleSign}
        inputPercent={inputPercent}
        performOperation={performOperation}
        handleEquals={handleEquals}
      />
    </div>
  );
};
