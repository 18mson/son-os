import React from "react";
import { APPS } from "@/data/apps";
import { AppDefinition } from "@/store/windowStore";

interface CommandContext {
  openWindow: (app: AppDefinition) => void;
  toggleTheme: () => void;
  setSettingsTheme: (theme: "light" | "dark") => void;
  toggleSettingsTheme: () => void;
  brightness: number;
  setBrightness: (val: number) => void;
  volume: number;
  setVolume: (val: number) => void;
  clearTerminal: () => void;
}

export const processTerminalCommand = (
  trimmed: string,
  ctx: CommandContext
): React.ReactNode | null => {
  const parts = trimmed.split(" ");
  const command = parts[0].toLowerCase();
  const args = parts.slice(1);

  switch (command) {
    case "help":
      return (
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

    case "whoami":
      return (
        <div className="space-y-1 text-xs text-zinc-300">
          <p className="font-bold text-emerald-400">Sony - Fullstack Software Engineer</p>
          <p>Pengembang web enthusiast yang suka membangun aplikasi modern, responsif, dan interaktif seperti Son-OS.</p>
        </div>
      );

    case "skills":
      return (
        <div className="space-y-1 text-xs text-zinc-300">
          <p className="font-bold text-indigo-400">Tech Stack &amp; Skills:</p>
          <p><span className="text-zinc-400">Frontend:</span> React, Next.js, TypeScript, Tailwind CSS, Zustand, Framer Motion</p>
          <p><span className="text-zinc-400">Backend:</span> Node.js, Express, REST APIs, PostgreSQL</p>
          <p><span className="text-zinc-400">Tools:</span> Git, Docker, WebAssembly, IndexedDB</p>
        </div>
      );

    case "apps":
    case "ls":
      return (
        <div className="space-y-1 text-xs text-zinc-300">
          <p className="font-semibold text-amber-400">Aplikasi Terpasang (Installed Apps):</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 pt-1">
            {APPS.map((a) => (
              <p key={a.id}>
                <span className="text-blue-300 font-mono">{a.id}</span> - {a.title}
              </p>
            ))}
          </div>
        </div>
      );

    case "open": {
      if (!args[0]) {
        return <p className="text-rose-400 text-xs">Sintaks salah. Gunakan: open &lt;app-id&gt; (cth: open calculator)</p>;
      }
      const query = args.join(" ").toLowerCase();
      const matchedApp = APPS.find(
        (a) => a.id === query || a.title.toLowerCase().includes(query)
      );

      if (matchedApp) {
        ctx.openWindow(matchedApp);
        return <p className="text-emerald-400 text-xs">Membuka aplikasi &apos;{matchedApp.title}&apos;...</p>;
      }
      return <p className="text-rose-400 text-xs">Aplikasi &apos;{args[0]}&apos; tidak ditemukan. Ketik &apos;apps&apos; untuk melihat daftar ID.</p>;
    }

    case "theme": {
      const sub = args[0]?.toLowerCase();
      if (sub === "light") {
        ctx.setSettingsTheme("light");
        return <p className="text-emerald-400 text-xs">Tema diubah ke Light Mode.</p>;
      } else if (sub === "dark") {
        ctx.setSettingsTheme("dark");
        return <p className="text-emerald-400 text-xs">Tema diubah ke Dark Mode.</p>;
      }
      ctx.toggleTheme();
      ctx.toggleSettingsTheme();
      return <p className="text-emerald-400 text-xs">Tema OS telah diganti.</p>;
    }

    case "brightness": {
      const val = parseInt(args[0]);
      if (isNaN(val) || val < 0 || val > 100) {
        return <p className="text-rose-400 text-xs font-mono">Batas tingkat kecerahan adalah 0 - 100. Saat ini: {ctx.brightness}%</p>;
      }
      ctx.setBrightness(val);
      return <p className="text-emerald-400 text-xs font-mono">Kecerahan layar diset ke {val}%</p>;
    }

    case "volume": {
      const val = parseInt(args[0]);
      if (isNaN(val) || val < 0 || val > 100) {
        return <p className="text-rose-400 text-xs font-mono">Batas tingkat volume adalah 0 - 100. Saat ini: {ctx.volume}%</p>;
      }
      ctx.setVolume(val);
      return <p className="text-emerald-400 text-xs font-mono">Volume master diset ke {val}%</p>;
    }

    case "calc": {
      if (!args[0]) {
        return <p className="text-rose-400 text-xs font-mono">Sintaks salah. Contoh: calc 15 * 4</p>;
      }
      try {
        const sanitized = args.join(" ").replace(/[^0-9+\-*/.() ]/g, "");
        const res = eval(sanitized);
        return <p className="text-emerald-400 text-xs font-mono">= {res}</p>;
      } catch {
        return <p className="text-rose-400 text-xs font-mono">Gagal menghitung ekspresi.</p>;
      }
    }

    case "date":
      return <p className="text-indigo-300 text-xs font-mono">{new Date().toString()}</p>;

    case "reboot":
      setTimeout(() => window.location.reload(), 1000);
      return <p className="text-amber-400 text-xs font-mono">Memuat ulang Son-OS dalam 1 detik...</p>;

    case "clear":
      ctx.clearTerminal();
      return null;

    default:
      return (
        <p className="text-rose-400 text-xs">
          Perintah &apos;{command}&apos; tidak dikenal. Ketik <span className="text-amber-300 font-bold">&apos;help&apos;</span> untuk daftar perintah.
        </p>
      );
  }
};
