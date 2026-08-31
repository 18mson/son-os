"use client";

import React, { useState } from "react";
import { MessageSquare, Mail, Send, CheckCircle2 } from "lucide-react";
import { useTranslation } from "@/i18n";
import { useWindowStore } from "@/store/windowStore";

export const ContactApp: React.FC = () => {
  const { t, language } = useTranslation();
  const { theme } = useWindowStore();
  const isLight = theme === "light";

  const [formData, setFormData] = useState({ name: "", message: "" });
  const [copied, setCopied] = useState(false);

  const waNumber = process.env.NEXT_PUBLIC_WA_NUMBER || "6282216267796";
  const contactEmail = process.env.NEXT_PUBLIC_EMAIL || "18mson@gmail.com";

  const handleSendWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.message) return;
    const text =
      language === "en"
        ? `Hello, I'm ${formData.name}.\n\n${formData.message}`
        : `Halo, saya ${formData.name}.\n\n${formData.message}`;
    const url = `https://wa.me/${waNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
    setCopied(true);
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.message) return;
    const subject =
      language === "en"
        ? `Portfolio Inquiry from ${formData.name}`
        : `Pesan Portofolio dari ${formData.name}`;
    const body =
      language === "en"
        ? `Name: ${formData.name}\n\nMessage:\n${formData.message}`
        : `Nama: ${formData.name}\n\nPesan:\n${formData.message}`;
    const mailtoUrl = `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
    setCopied(true);
  };

  return (
    <div className={`flex flex-col h-full w-full p-6 select-none overflow-y-auto font-sans no-scrollbar transition-colors ${
      isLight ? "bg-slate-100 text-slate-900" : "bg-zinc-950 text-zinc-100"
    }`}>
      <div className="max-w-md mx-auto w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-amber-500/20">
            <Mail size={24} />
          </div>
          <h2 className={`text-lg font-bold tracking-wide ${isLight ? "text-slate-900" : "text-white"}`}>
            {t.contactApp.title}
          </h2>
          <p className={`text-xs ${isLight ? "text-slate-600" : "text-zinc-400"}`}>
            {t.contactApp.subtitle}
          </p>
        </div>

        {/* Input Form */}
        <form className={`space-y-4 border p-5 rounded-2xl shadow-xl transition-colors ${
          isLight ? "bg-white border-slate-200 shadow-slate-200/50" : "bg-zinc-900/60 border-white/10"
        }`}>
          <div>
            <label className={`text-xs font-semibold block mb-1.5 ${
              isLight ? "text-slate-700" : "text-zinc-300"
            }`}>
              {t.contactApp.nameLabel} <span className="text-amber-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder={t.contactApp.namePlaceholder}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs border focus:outline-hidden focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/50 transition-all ${
                isLight
                  ? "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400"
                  : "bg-white/8 border-white/10 text-white placeholder-zinc-500"
              }`}
            />
          </div>

          <div>
            <label className={`text-xs font-semibold block mb-1.5 ${
              isLight ? "text-slate-700" : "text-zinc-300"
            }`}>
              {t.contactApp.messageLabel} <span className="text-amber-500">*</span>
            </label>
            <textarea
              rows={4}
              required
              placeholder={t.contactApp.messagePlaceholder}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs border focus:outline-hidden focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/50 transition-all resize-none ${
                isLight
                  ? "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400"
                  : "bg-white/8 border-white/10 text-white placeholder-zinc-500"
              }`}
            />
          </div>

          {copied && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2 justify-center font-medium">
              <CheckCircle2 size={16} />
              <span>{t.contactApp.successMessage}</span>
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
              <span>{t.contactApp.sendWhatsApp}</span>
            </button>

            <button
              type="button"
              onClick={handleSendEmail}
              disabled={!formData.name || !formData.message}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-xs transition-all shadow-md shadow-amber-600/20 cursor-pointer"
            >
              <Send size={15} />
              <span>{t.contactApp.sendEmail}</span>
            </button>
          </div>
        </form>

        {/* Info Footer */}
        <div className={`p-4 rounded-2xl border text-center text-[11px] space-y-1 transition-colors ${
          isLight ? "bg-white border-slate-200 text-slate-600 shadow-xs" : "bg-white/5 border-white/5 text-zinc-400"
        }`}>
          <p className={`font-mono ${isLight ? "text-slate-800" : "text-zinc-300"}`}>
            WA: {waNumber} | Email: {contactEmail}
          </p>
          <p className={`text-[10px] ${isLight ? "text-slate-500" : "text-zinc-500"}`}>
            {t.contactApp.footerNote}
          </p>
        </div>
      </div>
    </div>
  );
};
