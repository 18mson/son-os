"use client";

import React, { useState } from "react";
import { StickyNote, Edit3 } from "lucide-react";
import { useWindowStore } from "@/store/windowStore";
import { APPS } from "@/config/appsConfig";

export const QuickNotesWidget: React.FC = () => {
  const { openWindow } = useWindowStore();
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
      className="group relative p-4 rounded-3xl bg-amber-500/10 border border-amber-500/20 hover:border-amber-500/40 backdrop-blur-xl shadow-2xl transition-all duration-300 select-none flex flex-col justify-between w-64 h-36 hover:scale-102 hover:-translate-y-1"
    >
      <div className="flex items-center justify-between text-amber-400 pb-1">
        <span className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
          <StickyNote size={14} /> Catatan Cepat
        </span>
        <button
          onClick={handleOpenApp}
          title="Buka Aplikasi Notes"
          className="p-1 rounded-lg hover:bg-amber-500/20 text-amber-400 transition-colors cursor-pointer"
        >
          <Edit3 size={13} />
        </button>
      </div>

      <textarea
        value={noteText}
        onChange={handleChange}
        placeholder="Ketik catatan di sini..."
        className="w-full flex-1 bg-transparent text-xs text-amber-100 placeholder-amber-400/50 resize-none outline-hidden font-sans leading-relaxed pt-1"
      />
    </div>
  );
};
