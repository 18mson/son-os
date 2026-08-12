"use client";

import React, { useState, useRef, useEffect } from "react";
import { useWindowStore } from "@/store/windowStore";
import { useSettingsStore } from "@/store/settingsStore";
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
          <p className="text-emerald-400 font-bold">Son-OS Terminal v1.2.0 (x86_64-crosh-linux)</p>
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
            <p><span className="text-amber-300 w-28 inline-block font-mono">help</span> - Menampilkan pesan bantuan ini</p>
            <p><span className="text-amber-300 w-28 inline-block font-mono">whoami</span> - Informasi singkat tentang pengembang</p>
            <p><span className="text-amber-300 w-28 inline-block font-mono">skills</span> - Daftar keahlian &amp; tech stack</p>
            <p><span className="text-amber-300 w-28 inline-block font-mono">apps / ls</span> - Daftar aplikasi terinstall di Son-OS</p>
            <p><span className="text-amber-300 w-28 inline-block font-mono">open &lt;app&gt;</span> - Membuka window aplikasi (cth: open calculator)</p>
            <p><span className="text-amber-300 w-28 inline-block font-mono">theme &lt;dark|light&gt;</span> - Ubah tema tampilan OS</p>
            <p><span className="text-amber-300 w-28 inline-block font-mono">brightness &lt;0-100&gt;</span> - Ubah kecerahan layar sistem</p>
            <p><span className="text-amber-300 w-28 inline-block font-mono">volume &lt;0-100&gt;</span> - Ubah volume master sistem</p>
            <p><span className="text-amber-300 w-28 inline-block font-mono">calc &lt;expr&gt;</span> - Hitung ekspresi matematika (cth: calc 25 * 4)</p>
            <p><span className="text-amber-300 w-28 inline-block font-mono">reboot</span> - Muat ulang sistem OS</p>
            <p><span className="text-amber-300 w-28 inline-block font-mono">date</span> - Waktu &amp; tanggal sistem</p>
            <p><span className="text-amber-300 w-28 inline-block font-mono">clear</span> - Bersihkan layar terminal</p>
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
            <p>• Frontend: React 19, Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Zustand, Framer Motion</p>
            <p>• Backend &amp; Utils: Node.js, Express, REST API, WebSockets, FFmpeg WASM, pdf-lib</p>
          </div>
        );
        break;

      case "apps":
      case "ls":
        outputNode = (
          <div className="space-y-1 text-xs text-zinc-300">
            <p className="font-bold text-amber-400">Aplikasi Terinstall (Gunakan &apos;open &lt;id&gt;&apos; untuk menjalankan):</p>
            <p className="font-mono text-zinc-400">
              {APPS.map((a) => a.id).join(", ")}
            </p>
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
            outputNode = <p className="text-rose-400 text-xs">Aplikasi &apos;{targetAppId}&apos; tidak ditemukan. Ketik &apos;apps&apos; untuk melihat daftar.</p>;
          }
        }
        break;

      case "theme":
        if (args[0] === "light") {
          setSettingsTheme("light");
          if (theme !== "light") toggleTheme();
          outputNode = <p className="text-amber-400 text-xs font-semibold">Tema sistem diubah ke Mode Terang (Light).</p>;
        } else if (args[0] === "dark") {
          setSettingsTheme("dark");
          if (theme !== "dark") toggleTheme();
          outputNode = <p className="text-indigo-400 text-xs font-semibold">Tema sistem diubah ke Mode Gelap (Dark).</p>;
        } else {
          toggleSettingsTheme();
          toggleTheme();
          outputNode = <p className="text-emerald-400 text-xs font-semibold">Tema sistem berhasil diganti secara otomatis.</p>;
        }
        break;

      case "brightness":
        if (!args[0]) {
          outputNode = <p className="text-zinc-300 text-xs">Kecerahan layar saat ini: <span className="text-amber-400 font-bold">{brightness}%</span></p>;
        } else {
          const val = parseInt(args[0], 10);
          if (isNaN(val) || val < 0 || val > 100) {
            outputNode = <p className="text-rose-400 text-xs">Error: Kecerahan harus berupa angka 0-100.</p>;
          } else {
            setBrightness(val);
            outputNode = <p className="text-amber-400 text-xs">Kecerahan layar diubah ke {val}%.</p>;
          }
        }
        break;

      case "volume":
        if (!args[0]) {
          outputNode = <p className="text-zinc-300 text-xs">Volume master saat ini: <span className="text-blue-400 font-bold">{volume}%</span></p>;
        } else {
          const val = parseInt(args[0], 10);
          if (isNaN(val) || val < 0 || val > 100) {
            outputNode = <p className="text-rose-400 text-xs">Error: Volume harus berupa angka 0-100.</p>;
          } else {
            setVolume(val);
            outputNode = <p className="text-blue-400 text-xs">Volume master sistem diubah ke {val}%.</p>;
          }
        }
        break;

      case "calc":
        if (!args.join("")) {
          outputNode = <p className="text-rose-400 text-xs">Error: Masukkan ekspresi matematika. Contoh: calc 15 * 8</p>;
        } else {
          try {
            const expr = args.join(" ");
            // Safe mathematical evaluation (only numbers & operators)
            if (/^[0-9+\-*/().\s]+$/.test(expr)) {
              const res = Function(`"use strict"; return (${expr})`)();
              outputNode = <p className="text-emerald-400 text-xs font-bold">{expr} = {res}</p>;
            } else {
              outputNode = <p className="text-rose-400 text-xs">Error: Ekspresi mengandung karakter tidak valid.</p>;
            }
          } catch {
            outputNode = <p className="text-rose-400 text-xs">Error: Gagal menghitung ekspresi matematika.</p>;
          }
        }
        break;

      case "reboot":
      case "reload":
        outputNode = <p className="text-amber-400 text-xs">Memuat ulang sistem OS...</p>;
        setTimeout(() => {
          if (typeof window !== "undefined") window.location.reload();
        }, 800);
        break;

      case "settings":
        const setApp = APPS.find((a) => a.id === "settings");
        if (setApp) openWindow(setApp);
        outputNode = <p className="text-emerald-400 text-xs">Membuka Pengaturan Sistem...</p>;
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
