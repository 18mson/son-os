"use client";

import React, { useState, useRef, useEffect } from "react";
import { useWindowStore } from "@/store/windowStore";
import { useSettingsStore } from "@/store/settingsStore";
import { processTerminalCommand } from "./terminal/terminalCommands";

interface CommandHistory {
  command: string;
  output: React.ReactNode;
}

export const TerminalApp: React.FC = () => {
  const [input, setInput] = useState<string>("");
  const [history, setHistory] = useState<CommandHistory[]>([
    {
      command: "",
      output: (
        <div className="space-y-1 text-zinc-300">
          <p className="text-emerald-400 font-bold">Son-OS Terminal (x86_64-crosh-linux)</p>
          <p>Ketik <span className="text-amber-300 font-semibold">&apos;help&apos;</span> untuk melihat daftar perintah yang tersedia.</p>
        </div>
      ),
    },
  ]);

  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState<number>(-1);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const openWindow = useWindowStore((state) => state.openWindow);
  const toggleTheme = useWindowStore((state) => state.toggleTheme);
  const theme = useWindowStore((state) => state.theme);

  const {
    setTheme: setSettingsTheme,
    toggleTheme: toggleSettingsTheme,
    brightness,
    setBrightness,
    volume,
    setVolume,
  } = useSettingsStore();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const clearTerminal = () => setHistory([]);

  const handleCommand = (cmdStr: string) => {
    const trimmed = cmdStr.trim();
    if (!trimmed) return;

    setCmdHistory((prev) => [...prev, trimmed]);
    setHistoryIdx(-1);

    const outputNode = processTerminalCommand(trimmed, {
      openWindow,
      toggleTheme,
      setSettingsTheme,
      toggleSettingsTheme,
      brightness,
      setBrightness,
      volume,
      setVolume,
      clearTerminal,
    });

    if (outputNode !== null || trimmed.toLowerCase() !== "clear") {
      setHistory((prev) => [...prev, { command: trimmed, output: outputNode }]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleCommand(input);
      setInput("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (cmdHistory.length === 0) return;
      const nextIdx = historyIdx < cmdHistory.length - 1 ? historyIdx + 1 : historyIdx;
      setHistoryIdx(nextIdx);
      setInput(cmdHistory[cmdHistory.length - 1 - nextIdx] || "");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIdx > 0) {
        const nextIdx = historyIdx - 1;
        setHistoryIdx(nextIdx);
        setInput(cmdHistory[cmdHistory.length - 1 - nextIdx] || "");
      } else if (historyIdx === 0) {
        setHistoryIdx(-1);
        setInput("");
      }
    }
  };

  const isLight = theme === "light";

  return (
    <div
      className={`h-full w-full p-4 font-mono text-xs select-text overflow-y-auto ${
        isLight ? "bg-slate-900 text-slate-100" : "bg-zinc-950 text-zinc-100"
      }`}
      onClick={() => inputRef.current?.focus()}
    >
      <div className="space-y-3">
        {history.map((item, idx) => (
          <div key={idx} className="space-y-1">
            {item.command && (
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">sony@sonos</span>
                <span className="text-zinc-500">:</span>
                <span className="text-blue-400 font-bold">~</span>
                <span className="text-zinc-400">$</span>
                <span className="text-zinc-100 font-semibold">{item.command}</span>
              </div>
            )}
            {item.output && <div className="pl-2">{item.output}</div>}
          </div>
        ))}
      </div>

      {/* Interactive Input Prompt */}
      <div className="flex items-center gap-2 mt-3 pt-1">
        <span className="text-emerald-400 font-bold">sony@sonos</span>
        <span className="text-zinc-500">:</span>
        <span className="text-blue-400 font-bold">~</span>
        <span className="text-zinc-400">$</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          className="flex-1 bg-transparent text-zinc-100 font-semibold outline-hidden border-none"
        />
      </div>

      <div ref={bottomRef} />
    </div>
  );
};
