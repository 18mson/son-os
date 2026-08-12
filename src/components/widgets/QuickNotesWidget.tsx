"use client";

import React, { useState } from "react";
import { StickyNote, Edit3 } from "lucide-react";
import { useWindowStore } from "@/store/windowStore";
import { APPS } from "@/config/appsConfig";

export const QuickNotesWidget: React.FC = () => {
  const { openWindow, theme } = useWindowStore();
  const isLight = theme === "light";
  const [noteText, setNoteText] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const savedText = localStorage.getItem("sonos_quick_note_widget");
      if (savedText) return savedText;
    }
    return "Tulis Catatan Cepat...";
  });

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNoteText(val);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("sonos_quick_note_widget", val);
      } catch {
        // ignore
      }
    }
  };

  const handleOpenApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const notesApp = APPS.find((a) => a.id === "notes");
    if (notesApp) {
      openWindow(notesApp);
    }
  };

  return (
    <div
      data-widget
      className={`group relative p-4 rounded-3xl overflow-hidden [clip-path:inset(0_round_1.5rem)] backdrop-blur-xl transition-colors duration-300 select-none flex flex-col justify-between w-64 h-36 shadow-none ${
        isLight
          ? "bg-amber-300/35 hover:bg-amber-300/45 border border-amber-300/60 text-amber-950"
          : "bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/30 text-amber-100"
      }`}
    >
      <div className={`flex items-center justify-between pb-1 ${isLight ? "text-amber-700" : "text-amber-400"}`}>
        <span className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
          <StickyNote size={14} /> Catatan Cepat
        </span>
        <button
          onClick={handleOpenApp}
          title="Buka Aplikasi Notes"
          className={`p-1 rounded-lg transition-colors cursor-pointer ${
            isLight ? "hover:bg-amber-200 text-amber-800" : "hover:bg-amber-500/20 text-amber-400"
          }`}
        >
          <Edit3 size={13} />
        </button>
      </div>

      <textarea
        value={noteText}
        onChange={handleChange}
        onPointerDown={(e) => e.stopPropagation()}
        placeholder="Ketik catatan di sini..."
        className={`w-full flex-1 bg-transparent text-xs resize-none outline-hidden font-sans leading-relaxed pt-1 ${
          isLight ? "text-amber-950 placeholder-amber-700/50" : "text-amber-100 placeholder-amber-400/50"
        }`}
      />
    </div>
  );
};
