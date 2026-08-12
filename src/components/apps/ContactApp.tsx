"use client";

import React, { useState } from "react";
import { MessageSquare, Mail, Send, CheckCircle2 } from "lucide-react";

export const ContactApp: React.FC = () => {
  const [formData, setFormData] = useState({ name: "", message: "" });
  const [copied, setCopied] = useState(false);

  const waNumber = process.env.NEXT_PUBLIC_WA_NUMBER || "6281234567890";
  const contactEmail = process.env.NEXT_PUBLIC_EMAIL || "contact@sonos.dev";

  const handleSendWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.message) return;
    const text = `Halo, saya ${formData.name}.\n\n${formData.message}`;
    const url = `https://wa.me/${waNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
    setCopied(true);
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.message) return;
    const subject = `Pesan Portofolio dari ${formData.name}`;
    const body = `Nama: ${formData.name}\n\nPesan:\n${formData.message}`;
    const mailtoUrl = `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
    setCopied(true);
  };

  return (
    <div className="flex flex-col h-full w-full p-6 bg-zinc-950 text-zinc-100 select-none overflow-y-auto font-sans no-scrollbar">
      <div className="max-w-md mx-auto w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-amber-500/20">
            <Mail size={24} />
          </div>
          <h2 className="text-lg font-bold text-white tracking-wide">Hubungi Saya</h2>
          <p className="text-xs text-zinc-400">
            Kirim pesan langsung via WhatsApp atau Email.
          </p>
        </div>

        {/* Input Form */}
        <form className="space-y-4 bg-zinc-900/60 border border-white/10 p-5 rounded-2xl shadow-xl">
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
              Nama Anda <span className="text-amber-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Alex Ferguson"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/8 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/50 transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
              Pesan <span className="text-amber-400">*</span>
            </label>
            <textarea
              rows={4}
              required
              placeholder="Tuliskan pesan atau penawaran kerja sama..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/8 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/50 transition-all resize-none"
            />
          </div>

          {copied && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2 justify-center font-medium">
              <CheckCircle2 size={16} />
              <span>Aplikasi pengirim pesan telah dibuka!</span>
            </div>
          )}

          {/* Action Buttons Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={handleSendWhatsApp}
              disabled={!formData.name || !formData.message}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-xs transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
            >
              <MessageSquare size={15} />
              <span>Kirim WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={handleSendEmail}
              disabled={!formData.name || !formData.message}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-xs transition-all shadow-md shadow-amber-600/20 cursor-pointer"
            >
              <Send size={15} />
              <span>Kirim Email</span>
            </button>
          </div>
        </form>

        {/* Info Footer */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center text-[11px] text-zinc-400 space-y-1">
          <p className="font-mono text-zinc-300">WA: {waNumber} | Email: {contactEmail}</p>
          <p className="text-[10px] text-zinc-500">Dapat dikonfigurasi melalui `.env.local`</p>
        </div>
      </div>
    </div>
  );
};
