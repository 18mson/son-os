"use client";

import React, { useState, useRef, useEffect } from "react";
import { useWindowStore } from "@/store/windowStore";
import { APPS } from "@/data/apps";

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
          <p className="text-emerald-400 font-bold">Son-OS Terminal v1.0.0 (x86_64-crosh-linux)</p>
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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const handleCommand = (cmdStr: string) => {
    const trimmed = cmdStr.trim();
    if (!trimmed) return;

    setCmdHistory((prev) => [...prev, trimmed]);
    setHistoryIdx(-1);

    const parts = trimmed.split(" ");
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    let outputNode: React.ReactNode = null;

    switch (command) {
      case "help":
        outputNode = (
          <div className="space-y-1 text-xs text-zinc-300">
            <p className="font-semibold text-blue-400">Daftar Perintah (Commands):</p>
            <p><span className="text-amber-300 w-24 inline-block font-mono">help</span> - Menampilkan pesan bantuan ini</p>
            <p><span className="text-amber-300 w-24 inline-block font-mono">whoami</span> - Informasi singkat tentang Son</p>
            <p><span className="text-amber-300 w-24 inline-block font-mono">skills</span> - Daftar keahlian &amp; tech stack</p>
            <p><span className="text-amber-300 w-24 inline-block font-mono">apps / ls</span> - Daftar aplikasi terinstall di Son-OS</p>
            <p><span className="text-amber-300 w-24 inline-block font-mono">open &lt;app&gt;</span> - Membuka window aplikasi (cth: open calculator)</p>
            <p><span className="text-amber-300 w-24 inline-block font-mono">date</span> - Menampilkan waktu &amp; tanggal sistem</p>
            <p><span className="text-amber-300 w-24 inline-block font-mono">clear</span> - Membersihkan layar terminal</p>
            <p><span className="text-amber-300 w-24 inline-block font-mono">echo &lt;txt&gt;</span> - Menampilkan teks balasan</p>
          </div>
        );
        break;

      case "whoami":
        outputNode = (
          <div className="space-y-1 text-xs text-zinc-300">
            <p className="font-bold text-emerald-400">Sony - Fullstack Software Engineer</p>
            <p>Pengembang web enthusiast yang suka membangun aplikasi modern, responsif, dan interaktif seperti Son-OS.</p>
          </div>
        );
        break;

      case "skills":
        outputNode = (
          <div className="space-y-1 text-xs text-zinc-300">
            <p className="font-bold text-purple-400">Tech Stack &amp; Keahlian:</p>
            <p>• Frontend: React, Next.js (App Router), TypeScript, Tailwind CSS v4, Zustand, Framer Motion</p>
            <p>• Backend: Node.js, Express, REST API, WebSockets</p>
            <p>• Tools: Git, Vercel, Docker, VS Code</p>
          </div>
        );
        break;

      case "apps":
      case "ls":
        outputNode = (
          <div className="space-y-1 text-xs text-zinc-300">
            <p className="font-bold text-amber-400">Aplikasi Terinstall (Gunakan &apos;open &lt;id&gt;&apos; untuk menjalankan):</p>
            <p className="font-mono text-zinc-400">japanese-quiz, lovely-ever, about, contact, clock, calculator, notes, calendar, music, weather, gallery, terminal</p>
          </div>
        );
        break;

      case "open":
        if (!args[0]) {
          outputNode = <p className="text-rose-400 text-xs">Error: Harap masukkan ID aplikasi. Contoh: &apos;open calculator&apos;</p>;
        } else {
          const targetAppId = args[0].toLowerCase();
          const foundApp = APPS.find((a) => a.id === targetAppId);
          if (foundApp) {
            openWindow(foundApp);
            outputNode = <p className="text-emerald-400 text-xs">Membuka aplikasi &apos;{targetAppId}&apos;...</p>;
          } else {
            outputNode = <p className="text-rose-400 text-xs">Aplikasi &apos;{targetAppId}&apos; tidak ditemukan. Gunakan &apos;apps&apos; untuk melihat daftar.</p>;
          }
        }
        break;

      case "clear":
        setHistory([]);
        setInput("");
        return;

      case "date":
        outputNode = <p className="text-xs text-zinc-300 font-mono">{new Date().toString()}</p>;
        break;

      case "echo":
        outputNode = <p className="text-xs text-zinc-300">{args.join(" ")}</p>;
        break;

      default:
        outputNode = (
          <p className="text-rose-400 text-xs">
            Perintah &apos;{command}&apos; tidak dikenal. Ketik <span className="text-amber-300 font-semibold">&apos;help&apos;</span> untuk bantuan.
          </p>
        );
        break;
    }

    setHistory((prev) => [...prev, { command: trimmed, output: outputNode }]);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleCommand(input);
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

  return (
    <div
      data-terminal-app
      onClick={() => inputRef.current?.focus()}
      className="flex flex-col h-full bg-zinc-950 text-zinc-100 select-text p-4 font-mono text-xs cursor-text"
    >
      {/* Terminal Content Area */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {history.map((item, idx) => (
          <div key={idx} className="space-y-1">
            {item.command && (
              <div className="flex items-center gap-1.5 text-zinc-400">
                <span className="text-emerald-400 font-bold">sony@son-os</span>
                <span className="text-zinc-500">:</span>
                <span className="text-blue-400">~</span>
                <span className="text-zinc-400">$</span>
                <span className="text-white font-semibold">{item.command}</span>
              </div>
            )}
            <div>{item.output}</div>
          </div>
        ))}

        {/* Input Prompt Row */}
        <div className="flex items-center gap-1.5 pt-1">
          <span className="text-emerald-400 font-bold">sony@son-os</span>
          <span className="text-zinc-500">:</span>
          <span className="text-blue-400">~</span>
          <span className="text-zinc-400">$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-white outline-hidden border-none font-mono text-xs p-0 m-0"
            autoFocus
          />
        </div>
        <div ref={bottomRef} />
      </div>
    </div>
  );
};
