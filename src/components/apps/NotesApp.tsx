"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, StickyNote, Search, Clock, CheckCircle2 } from "lucide-react";

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
• Buat catatan baru dengan tombol +
• Ubah warna accent catatan
• Hapus catatan yang sudah tidak diperlukan
• Pencarian judul & isi catatan secara real-time

Cobalah menulis catatan atau ide penting Anda di sini!`,
    updatedAt: Date.now(),
    color: "from-amber-500/20 to-yellow-500/10 border-amber-500/30",
  },
];

const COLOR_OPTIONS = [
  { name: "Yellow", class: "from-amber-500/20 to-yellow-500/10 border-amber-500/30", dot: "bg-amber-400" },
  { name: "Blue", class: "from-blue-500/20 to-cyan-500/10 border-blue-500/30", dot: "bg-blue-400" },
  { name: "Purple", class: "from-purple-500/20 to-indigo-500/10 border-purple-500/30", dot: "bg-purple-400" },
  { name: "Emerald", class: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30", dot: "bg-emerald-400" },
  { name: "Rose", class: "from-rose-500/20 to-pink-500/10 border-rose-500/30", dot: "bg-rose-400" },
];

export const NotesApp: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("son-os-notes-v1");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback default
        }
      }
    }
    return DEFAULT_NOTES;
  });

  const [activeNoteId, setActiveNoteId] = useState<string>(() => notes[0]?.id || "");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [savedBadge, setSavedBadge] = useState<boolean>(false);

  // Auto-save to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("son-os-notes-v1", JSON.stringify(notes));
    }
  }, [notes]);

  const activeNote = notes.find((n) => n.id === activeNoteId) || notes[0];

  const handleCreateNote = () => {
    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: "Catatan Baru",
      content: "",
      updatedAt: Date.now(),
      color: COLOR_OPTIONS[Math.floor(Math.random() * COLOR_OPTIONS.length)].class,
    };
    setNotes((prev) => [newNote, ...prev]);
    setActiveNoteId(newNote.id);
  };

  const handleDeleteNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (notes.length <= 1) {
      alert("Minimal harus ada 1 catatan.");
      return;
    }
    const filtered = notes.filter((n) => n.id !== id);
    setNotes(filtered);
    if (activeNoteId === id) {
      setActiveNoteId(filtered[0].id);
    }
  };

  const handleUpdateActiveNote = (field: "title" | "content" | "color", value: string) => {
    if (!activeNote) return;
    setNotes((prev) =>
      prev.map((n) =>
        n.id === activeNote.id
          ? { ...n, [field]: value, updatedAt: Date.now() }
          : n
      )
    );
    setSavedBadge(true);
    setTimeout(() => setSavedBadge(false), 1200);
  };

  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTimestamp = (ts: number) => {
    const d = new Date(ts);
    return `${d.toLocaleDateString([], { month: "short", day: "numeric" })} ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  };

  return (
    <div className="flex h-full bg-zinc-950 text-zinc-100 rounded-xl overflow-hidden border border-white/10 select-none">
      {/* Sidebar - Notes List */}
      <div className="w-56 sm:w-64 bg-zinc-900/90 border-r border-white/10 flex flex-col shrink-0">
        {/* Sidebar Header & Search */}
        <div className="p-3 border-b border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
              <StickyNote size={14} className="text-amber-400" /> Catatan ({notes.length})
            </h2>
            <button
              onClick={handleCreateNote}
              className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-hidden min-h-9 min-w-9 flex items-center justify-center shadow-md"
              title="Buat Catatan Baru"
            >
              <Plus size={16} />
            </button>
          </div>

          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Cari..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-2 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white placeholder-zinc-400 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-hidden"
            />
          </div>
        </div>

        {/* Notes Items */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {filteredNotes.map((n) => {
            const isActive = activeNote?.id === n.id;
            return (
              <div
                key={n.id}
                onClick={() => setActiveNoteId(n.id)}
                className={`group relative p-2.5 rounded-xl cursor-pointer border transition-all ${
                  isActive
                    ? "bg-white/15 border-white/20 shadow-md text-white"
                    : "bg-white/5 border-white/5 hover:bg-white/10 text-zinc-300"
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <h3 className="text-xs font-semibold truncate flex-1">{n.title || "Tanpa Judul"}</h3>
                  <button
                    onClick={(e) => handleDeleteNote(n.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-rose-400 transition-opacity"
                    title="Hapus"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
                <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5 font-sans">
                  {n.content || "Tidak ada konten..."}
                </p>
                <span className="text-[9px] text-zinc-500 block mt-1">
                  {formatTimestamp(n.updatedAt)}
                </span>
              </div>
            );
          })}

          {filteredNotes.length === 0 && (
            <p className="text-center text-xs text-zinc-500 py-6">Tidak ada catatan ditemukan</p>
          )}
        </div>
      </div>

      {/* Main Editor Area */}
      {activeNote ? (
        <div className="flex-1 flex flex-col h-full bg-zinc-950 p-4 sm:p-6 overflow-hidden">
          {/* Header Controls */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3 shrink-0">
            {/* Color accent selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-zinc-400 font-medium">Warna:</span>
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.name}
                  onClick={() => handleUpdateActiveNote("color", c.class)}
                  className={`w-4 h-4 rounded-full ${c.dot} transition-transform ${
                    activeNote.color === c.class ? "scale-125 ring-2 ring-white/50" : "hover:scale-110 opacity-70"
                  }`}
                  title={c.name}
                />
              ))}
            </div>

            {/* Saved Indicator Badge */}
            <div className="flex items-center gap-2 text-[10px] text-zinc-400">
              {savedBadge ? (
                <span className="text-emerald-400 flex items-center gap-1 font-medium">
                  <CheckCircle2 size={12} /> Tersimpan
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
            className="text-lg font-bold bg-transparent text-white placeholder-zinc-500 border-none outline-hidden mb-2 shrink-0"
          />

          {/* Note Content Textarea */}
          <textarea
            value={activeNote.content}
            onChange={(e) => handleUpdateActiveNote("content", e.target.value)}
            placeholder="Mulai mengetik catatan Anda..."
            className="flex-1 w-full bg-transparent text-sm text-zinc-200 placeholder-zinc-600 border-none outline-hidden resize-none font-sans leading-relaxed select-text"
          />

          {/* Status Bar */}
          <div className="border-t border-white/10 pt-2 shrink-0 flex items-center justify-between text-[10px] text-zinc-500">
            <span>{activeNote.content.length} karakter</span>
            <span>{activeNote.content.trim() ? activeNote.content.trim().split(/\s+/).length : 0} kata</span>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-zinc-500 text-sm">
          Pilih atau buat catatan baru
        </div>
      )}
    </div>
  );
};
