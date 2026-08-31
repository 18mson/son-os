"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, StickyNote, Search, Clock, CheckCircle2, ChevronLeft } from "lucide-react";
import { useTranslation } from "@/i18n";
import { useWindowStore } from "@/store/windowStore";

interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
  color: string;
}

const DEFAULT_NOTES: Note[] = [
  {
    id: "welcome-note",
    title: "Selamat datang di Son-OS Notes! 📝",
    content: `Aplikasi catatan ini dilengkapi dengan fitur simpan otomatis (auto-save) langsung ke localStorage browser Anda.

Fitur Utama:
- Auto-save instan
- Pencarian kata kunci
- Pilihan aksen warna catatan
- Pengurutan berdasarkan yang terbaru

Semua data tersimpan secara lokal dan privasi Anda terjaga.`,
    updatedAt: Date.now(),
    color: "from-amber-500/20 to-orange-500/10 border-amber-500/30",
  },
  {
    id: "todo-list",
    title: "Daftar Tugas Portofolio 🚀",
    content: `- Implem fitur drag and drop window
- Sempurnakan tampilan dark mode & light mode
- Tambahkan game mini di Son-OS
- Hubungkan dengan API audio & wallpaper`,
    updatedAt: Date.now() - 3600000,
    color: "from-blue-500/20 to-indigo-500/10 border-blue-500/30",
  },
];

const COLOR_OPTIONS = [
  { name: "Amber", class: "from-amber-500/20 to-orange-500/10 border-amber-500/30", dot: "bg-amber-500" },
  { name: "Blue", class: "from-blue-500/20 to-indigo-500/10 border-blue-500/30", dot: "bg-blue-500" },
  { name: "Emerald", class: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30", dot: "bg-emerald-500" },
  { name: "Purple", class: "from-purple-500/20 to-pink-500/10 border-purple-500/30", dot: "bg-purple-500" },
  { name: "Rose", class: "from-rose-500/20 to-red-500/10 border-rose-500/30", dot: "bg-rose-500" },
];

export const NotesApp: React.FC = () => {
  const { theme } = useWindowStore();
  const isLight = theme === "light";

  const [notes, setNotes] = useState<Note[]>(() => {
    if (typeof window === "undefined") return DEFAULT_NOTES;
    const saved = localStorage.getItem("sonos_notes");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_NOTES;
      }
    }
    return DEFAULT_NOTES;
  });

  const { language } = useTranslation();
  const [activeNoteId, setActiveNoteId] = useState<string>(notes[0]?.id || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving">("saved");
  const [mobileView, setMobileView] = useState<"list" | "editor">("list");

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("sonos_notes_data", JSON.stringify(notes));
    } catch {
      // ignore
    }
  }, [notes]);

  const activeNote = notes.find((n) => n.id === activeNoteId) || notes[0];

  const handleCreateNote = () => {
    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: "Catatan Baru",
      content: "",
      updatedAt: Date.now(),
      color: "from-blue-500/20 to-indigo-500/10 border-blue-500/30",
    };
    setNotes([newNote, ...notes]);
    setActiveNoteId(newNote.id);
    setMobileView("editor");
  };

  const handleDeleteNote = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    if (activeNoteId === id) {
      setActiveNoteId(updated[0]?.id || "");
    }
  };

  const handleUpdateActiveNote = (field: "title" | "content" | "color", value: string) => {
    if (!activeNote) return;
    setSaveStatus("saving");
    const updated = notes.map((n) =>
      n.id === activeNote.id
        ? {
            ...n,
            [field]: value,
            updatedAt: Date.now(),
          }
        : n
    );
    setNotes(updated);
    setTimeout(() => setSaveStatus("saved"), 300);
  };

  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTimestamp = (ts: number) => {
    const d = new Date(ts);
    const localeCode = language === "en" ? "en-US" : "id-ID";
    return `${d.toLocaleDateString(localeCode, { month: "short", day: "numeric" })} ${d.toLocaleTimeString(localeCode, { hour: "2-digit", minute: "2-digit" })}`;
  };

  return (
    <div className={`flex h-full select-none font-sans overflow-hidden transition-colors ${
      isLight ? "bg-slate-100 text-slate-900" : "bg-zinc-950 text-zinc-100"
    }`}>
      {/* Sidebar - Notes List */}
      <div className={`w-full sm:w-64 border-r flex-col shrink-0 transition-colors ${
        isLight ? "bg-slate-200/80 border-slate-300" : "bg-zinc-900/90 border-white/10"
      } ${mobileView === "list" ? "flex" : "hidden sm:flex"}`}>
        {/* Sidebar Header & Search */}
        <div className={`p-3 border-b space-y-2 ${isLight ? "border-slate-300" : "border-white/10"}`}>
          <div className="flex items-center justify-between">
            <h2 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
              isLight ? "text-slate-800" : "text-zinc-200"
            }`}>
              <StickyNote size={14} className="text-amber-500" /> Catatan ({notes.length})
            </h2>
            <button
              onClick={handleCreateNote}
              className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-hidden min-h-8 min-w-8 flex items-center justify-center shadow-md cursor-pointer"
              title="Buat Catatan Baru"
            >
              <Plus size={16} />
            </button>
          </div>

          <div className="relative">
            <Search size={13} className={`absolute left-2.5 top-1/2 -translate-y-1/2 ${
              isLight ? "text-slate-400" : "text-zinc-400"
            }`} />
            <input
              type="text"
              placeholder="Cari..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-8 pr-2 py-1.5 rounded-xl text-xs focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-hidden transition-colors ${
                isLight
                  ? "bg-white border border-slate-300 text-slate-800 placeholder-slate-400"
                  : "bg-white/5 border border-white/10 text-white placeholder-zinc-400"
              }`}
            />
          </div>
        </div>

        {/* Notes Items */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5 no-scrollbar">
          {filteredNotes.map((n) => {
            const isActive = activeNote?.id === n.id;
            return (
              <div
                key={n.id}
                onClick={() => {
                  setActiveNoteId(n.id);
                  setMobileView("editor");
                }}
                className={`group relative p-2.5 rounded-xl cursor-pointer border transition-all ${
                  isActive
                    ? isLight
                      ? "bg-white border-blue-400 shadow-sm text-slate-900"
                      : "bg-white/15 border-white/20 shadow-md text-white"
                    : isLight
                    ? "bg-slate-100/80 border-slate-200 hover:bg-white text-slate-700"
                    : "bg-white/5 border-white/5 hover:bg-white/10 text-zinc-300"
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <h3 className={`text-xs font-semibold truncate flex-1 ${
                    isLight && isActive ? "text-blue-600 font-bold" : ""
                  }`}>{n.title || "Tanpa Judul"}</h3>
                  <button
                    onClick={(e) => handleDeleteNote(n.id, e)}
                    className="opacity-100 sm:opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition-opacity cursor-pointer"
                    title="Hapus"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
                <p className={`text-[11px] line-clamp-1 mt-0.5 font-sans ${
                  isLight ? "text-slate-500" : "text-zinc-400"
                }`}>
                  {n.content || "Tidak ada konten..."}
                </p>
                <span className={`text-[9px] block mt-1 ${
                  isLight ? "text-slate-400" : "text-zinc-500"
                }`}>
                  {formatTimestamp(n.updatedAt)}
                </span>
              </div>
            );
          })}

          {filteredNotes.length === 0 && (
            <p className={`text-center text-xs py-6 ${
              isLight ? "text-slate-500" : "text-zinc-500"
            }`}>Tidak ada catatan ditemukan</p>
          )}
        </div>
      </div>

      {/* Main Editor Area */}
      {activeNote ? (
        <div className={`flex-1 flex-col h-full p-3 sm:p-6 overflow-hidden transition-colors ${
          isLight ? "bg-white" : "bg-zinc-950"
        } ${mobileView === "editor" ? "flex" : "hidden sm:flex"}`}>
          {/* Mobile Back Button */}
          <div className="sm:hidden mb-2">
            <button
              onClick={() => setMobileView("list")}
              className={`flex items-center gap-1 text-xs font-medium py-1 px-2 rounded-lg ${
                isLight ? "bg-slate-100 text-blue-600" : "bg-white/5 text-amber-400"
              }`}
            >
              <ChevronLeft size={16} /> Kembalikan ke Daftar Catatan
            </button>
          </div>

          {/* Header Controls */}
          <div className={`flex items-center justify-between border-b pb-3 mb-3 shrink-0 ${
            isLight ? "border-slate-200" : "border-white/10"
          }`}>
            {/* Color accent selector */}
            <div className="flex items-center gap-1.5">
              <span className={`text-[10px] font-medium ${
                isLight ? "text-slate-500" : "text-zinc-400"
              }`}>Warna:</span>
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.name}
                  onClick={() => handleUpdateActiveNote("color", c.class)}
                  className={`w-4 h-4 rounded-full ${c.dot} transition-transform cursor-pointer ${
                    activeNote.color === c.class
                      ? "scale-125 ring-2 " + (isLight ? "ring-slate-400" : "ring-white/50")
                      : "hover:scale-110 opacity-70"
                  }`}
                  title={c.name}
                />
              ))}
            </div>

            {/* Saved Indicator Badge */}
            <div className={`flex items-center gap-2 text-[10px] ${
              isLight ? "text-slate-500" : "text-zinc-400"
            }`}>
              {saveStatus === "saved" ? (
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                  <CheckCircle2 size={12} /> {language === "en" ? "Saved" : "Tersimpan"}
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Clock size={11} /> {formatTimestamp(activeNote.updatedAt)}
                </span>
              )}
            </div>
          </div>

          {/* Note Title Input */}
          <input
            type="text"
            value={activeNote.title}
            onChange={(e) => handleUpdateActiveNote("title", e.target.value)}
            placeholder="Judul Catatan..."
            className={`text-lg font-bold bg-transparent border-none outline-hidden mb-2 shrink-0 ${
              isLight ? "text-slate-900 placeholder-slate-400" : "text-white placeholder-zinc-500"
            }`}
          />

          {/* Note Content Textarea */}
          <textarea
            value={activeNote.content}
            onChange={(e) => handleUpdateActiveNote("content", e.target.value)}
            placeholder="Mulai mengetik catatan Anda..."
            className={`flex-1 w-full bg-transparent text-sm border-none outline-hidden resize-none font-sans leading-relaxed select-text ${
              isLight ? "text-slate-700 placeholder-slate-400" : "text-zinc-200 placeholder-zinc-600"
            }`}
          />

          {/* Status Bar */}
          <div className={`border-t pt-2 shrink-0 flex items-center justify-between text-[10px] ${
            isLight ? "border-slate-200 text-slate-500" : "border-white/10 text-zinc-500"
          }`}>
            <span>{activeNote.content.length} karakter</span>
            <span>{activeNote.content.trim() ? activeNote.content.trim().split(/\s+/).length : 0} kata</span>
          </div>
        </div>
      ) : (
        <div className={`flex-1 flex flex-col items-center justify-center p-8 text-sm ${
          isLight ? "text-slate-400" : "text-zinc-500"
        }`}>
          Pilih atau buat catatan baru
        </div>
      )}
    </div>
  );
};
