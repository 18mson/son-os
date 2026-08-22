import React from "react";
import { APPS } from "@/data/apps";
import { AppDefinition } from "@/store/windowStore";
import { getAppTranslation } from "@/i18n";

interface CommandContext {
  openWindow: (app: AppDefinition) => void;
  toggleTheme: () => void;
  setSettingsTheme: (theme: "light" | "dark") => void;
  toggleSettingsTheme: () => void;
  language: string;
  setLanguage: (lang: string) => void;
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
  const isEn = ctx.language === "en";

  switch (command) {
    case "help":
      return (
        <div className="space-y-1 text-xs text-zinc-300">
          <p className="font-semibold text-blue-400">
            {isEn ? "Available Commands:" : "Daftar Perintah (Commands):"}
          </p>
          <p><span className="text-amber-300 w-32 inline-block font-mono">help</span> - {isEn ? "Show this help message" : "Menampilkan pesan bantuan ini"}</p>
          <p><span className="text-amber-300 w-32 inline-block font-mono">whoami</span> - {isEn ? "Brief info about developer" : "Informasi singkat tentang pengembang"}</p>
          <p><span className="text-amber-300 w-32 inline-block font-mono">skills</span> - {isEn ? "Skills & tech stack overview" : "Daftar keahlian & tech stack"}</p>
          <p><span className="text-amber-300 w-32 inline-block font-mono">apps / ls</span> - {isEn ? "List installed applications" : "Daftar aplikasi terinstall di Son-OS"}</p>
          <p><span className="text-amber-300 w-32 inline-block font-mono">open &lt;app&gt;</span> - {isEn ? "Open application window (e.g. open calculator)" : "Membuka window aplikasi (cth: open calculator)"}</p>
          <p><span className="text-amber-300 w-32 inline-block font-mono">lang &lt;en|id&gt;</span> - {isEn ? "Switch system language" : "Ubah bahasa sistem"}</p>
          <p><span className="text-amber-300 w-32 inline-block font-mono">theme &lt;dark|light&gt;</span> - {isEn ? "Switch system theme mode" : "Ubah tema tampilan OS"}</p>
          <p><span className="text-amber-300 w-32 inline-block font-mono">brightness &lt;0-100&gt;</span> - {isEn ? "Change display brightness" : "Ubah kecerahan layar sistem"}</p>
          <p><span className="text-amber-300 w-32 inline-block font-mono">volume &lt;0-100&gt;</span> - {isEn ? "Change master volume" : "Ubah volume master sistem"}</p>
          <p><span className="text-amber-300 w-32 inline-block font-mono">calc &lt;expr&gt;</span> - {isEn ? "Evaluate math expression (e.g. calc 25 * 4)" : "Hitung ekspresi matematika (cth: calc 25 * 4)"}</p>
          <p><span className="text-amber-300 w-32 inline-block font-mono">reboot</span> - {isEn ? "Restart system" : "Muat ulang sistem OS"}</p>
          <p><span className="text-amber-300 w-32 inline-block font-mono">date</span> - {isEn ? "Current date & time" : "Waktu & tanggal sistem"}</p>
          <p><span className="text-amber-300 w-32 inline-block font-mono">clear</span> - {isEn ? "Clear terminal buffer" : "Bersihkan layar terminal"}</p>
        </div>
      );

    case "whoami":
      return (
        <div className="space-y-1 text-xs text-zinc-300">
          <p className="font-bold text-emerald-400">Muhamad Son&apos;ani (Son / Sony) — Frontend Developer</p>
          <p>
            {isEn
              ? "6.5+ years of software engineering experience building scalable enterprise web applications (BRI, Telkom Indonesia) with React.js, Next.js, TypeScript, & Tailwind CSS."
              : "6.5+ tahun pengalaman membangun web aplikasi enterprise berskala besar (BRI, Telkom Indonesia) menggunakan React.js, Next.js, TypeScript, & Tailwind CSS."}
          </p>
          <p className="text-zinc-400">Location: Tangerang / Bandung, Indonesia | Email: 18mson@gmail.com | WA: +62 822 1626 7796</p>
        </div>
      );

    case "skills":
      return (
        <div className="space-y-1 text-xs text-zinc-300">
          <p className="font-bold text-indigo-400">{isEn ? "Tech Stack & Competencies (Curriculum Vitae 2026):" : "Tech Stack & Keahlian (Curriculum Vitae 2026):"}</p>
          <p><span className="text-zinc-400">Languages:</span> JavaScript (ES6+), TypeScript, Java, SQL, PHP</p>
          <p><span className="text-zinc-400">Frontend:</span> React.js, Next.js, Vue.js, AdonisJS, Redux, SWR, Zustand, Tailwind CSS, Material UI, Legion UI</p>
          <p><span className="text-zinc-400">Backend & DB:</span> Node.js, Express.js, Supabase, PostgreSQL, MySQL, REST API</p>
          <p><span className="text-zinc-400">Testing & Analytics:</span> Vitest, Jest, React Testing Library, GA4, GTM</p>
          <p><span className="text-zinc-400">AI & Productivity:</span> GitHub Copilot, Cursor AI, ChatGPT, Claude, Gemini, Antigravity, Vertex AI</p>
        </div>
      );

    case "apps":
    case "ls":
      return (
        <div className="space-y-1 text-xs text-zinc-300">
          <p className="font-semibold text-amber-400">{isEn ? "Installed Applications:" : "Aplikasi Terpasang (Installed Apps):"}</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 pt-1">
            {APPS.map((a) => {
              const meta = getAppTranslation(a.id, ctx.language);
              return (
                <p key={a.id}>
                  <span className="text-blue-300 font-mono">{a.id}</span> - {meta?.title || a.title}
                </p>
              );
            })}
          </div>
        </div>
      );

    case "lang": {
      const code = args[0]?.toLowerCase();
      if (code === "en" || code === "id") {
        ctx.setLanguage(code);
        return (
          <p className="text-emerald-400 text-xs">
            {code === "en"
              ? "Language switched to English."
              : "Bahasa sistem diubah ke Bahasa Indonesia."}
          </p>
        );
      }
      return <p className="text-rose-400 text-xs font-mono">{isEn ? "Usage: lang <en|id>" : "Gunakan: lang <en|id>"}</p>;
    }

    case "open": {
      if (!args[0]) {
        return <p className="text-rose-400 text-xs">{isEn ? "Invalid syntax. Usage: open <app-id> (e.g. open calculator)" : "Sintaks salah. Gunakan: open <app-id> (cth: open calculator)"}</p>;
      }
      const query = args.join(" ").toLowerCase();
      const matchedApp = APPS.find(
        (a) => a.id === query || a.title.toLowerCase().includes(query)
      );

      if (matchedApp) {
        const meta = getAppTranslation(matchedApp.id, ctx.language);
        ctx.openWindow({ ...matchedApp, title: meta?.title || matchedApp.title });
        return <p className="text-emerald-400 text-xs">{isEn ? `Opening '${meta?.title || matchedApp.title}'...` : `Membuka aplikasi '${meta?.title || matchedApp.title}'...`}</p>;
      }
      return <p className="text-rose-400 text-xs">{isEn ? `Application '${args[0]}' not found. Type 'apps' to see valid IDs.` : `Aplikasi '${args[0]}' tidak ditemukan. Ketik 'apps' untuk melihat daftar ID.`}</p>;
    }

    case "theme": {
      const sub = args[0]?.toLowerCase();
      if (sub === "light") {
        ctx.setSettingsTheme("light");
        return <p className="text-emerald-400 text-xs">{isEn ? "Theme switched to Light Mode." : "Tema diubah ke Light Mode."}</p>;
      } else if (sub === "dark") {
        ctx.setSettingsTheme("dark");
        return <p className="text-emerald-400 text-xs">{isEn ? "Theme switched to Dark Mode." : "Tema diubah ke Dark Mode."}</p>;
      }
      ctx.toggleTheme();
      ctx.toggleSettingsTheme();
      return <p className="text-emerald-400 text-xs">{isEn ? "Theme toggled." : "Tema OS telah diganti."}</p>;
    }

    case "brightness": {
      const val = parseInt(args[0]);
      if (isNaN(val) || val < 0 || val > 100) {
        return <p className="text-rose-400 text-xs font-mono">{isEn ? `Brightness range is 0 - 100. Current: ${ctx.brightness}%` : `Batas tingkat kecerahan adalah 0 - 100. Saat ini: ${ctx.brightness}%`}</p>;
      }
      ctx.setBrightness(val);
      return <p className="text-emerald-400 text-xs font-mono">{isEn ? `Screen brightness set to ${val}%` : `Kecerahan layar diset ke ${val}%`}</p>;
    }

    case "volume": {
      const val = parseInt(args[0]);
      if (isNaN(val) || val < 0 || val > 100) {
        return <p className="text-rose-400 text-xs font-mono">{isEn ? `Volume range is 0 - 100. Current: ${ctx.volume}%` : `Batas tingkat volume adalah 0 - 100. Saat ini: ${ctx.volume}%`}</p>;
      }
      ctx.setVolume(val);
      return <p className="text-emerald-400 text-xs font-mono">{isEn ? `Master volume set to ${val}%` : `Volume master diset ke ${val}%`}</p>;
    }

    case "calc": {
      if (!args[0]) {
        return <p className="text-rose-400 text-xs font-mono">{isEn ? "Syntax error. Example: calc 15 * 4" : "Sintaks salah. Contoh: calc 15 * 4"}</p>;
      }
      try {
        const sanitized = args.join(" ").replace(/[^0-9+\-*/.() ]/g, "");
        const res = eval(sanitized);
        return <p className="text-emerald-400 text-xs font-mono">= {res}</p>;
      } catch {
        return <p className="text-rose-400 text-xs font-mono">{isEn ? "Failed to calculate expression." : "Gagal menghitung ekspresi."}</p>;
      }
    }

    case "date":
      return <p className="text-indigo-300 text-xs font-mono">{new Date().toString()}</p>;

    case "reboot":
      setTimeout(() => window.location.reload(), 1000);
      return <p className="text-amber-400 text-xs font-mono">{isEn ? "Rebooting Son-OS in 1 second..." : "Memuat ulang Son-OS dalam 1 detik..."}</p>;

    case "clear":
      ctx.clearTerminal();
      return null;

    default:
      return (
        <p className="text-rose-400 text-xs">
          {isEn ? `Command '${command}' not recognized. Type 'help' for available commands.` : `Perintah '${command}' tidak dikenal. Ketik 'help' untuk daftar perintah.`}
        </p>
      );
  }
};
