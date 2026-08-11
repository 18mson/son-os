"use client";

import React, { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";

export const ContactApp: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setSubmitted(true);
  };

  return (
    <div className="max-w-xl mx-auto space-y-5">
      <div className="text-center">
        <h2 className="text-xl font-bold text-white">Get In Touch</h2>
        <p className="text-xs text-zinc-400 mt-1">Send a message or reach out for opportunities</p>
      </div>

      {submitted ? (
        <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-3">
          <CheckCircle2 size={40} className="text-emerald-400 mx-auto" />
          <h3 className="text-base font-semibold text-white">Pesan Terkirim!</h3>
          <p className="text-xs text-zinc-300">Terima kasih sudah menghubungi. Saya akan segera membalas pesan Anda.</p>
          <button
            onClick={() => setSubmitted(false)}
            className="px-4 py-2 rounded-lg bg-white/10 text-xs text-zinc-200 hover:bg-white/15 transition-colors"
          >
            Kirim pesan lain
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs text-zinc-300 block mb-1">Your Name</label>
            <input
              type="text"
              required
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-sm text-white focus:outline-none focus:border-blue-400"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-300 block mb-1">Your Email</label>
            <input
              type="email"
              required
              placeholder="john@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-sm text-white focus:outline-none focus:border-blue-400"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-300 block mb-1">Message</label>
            <textarea
              rows={4}
              required
              placeholder="Hello..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/15 text-sm text-white focus:outline-none focus:border-blue-400 resize-none"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-linear-to-r from-amber-500 to-orange-600 text-white font-medium text-sm flex items-center justify-center gap-2 hover:opacity-95 transition-opacity"
          >
            <Send size={15} /> Send Message
          </button>
        </form>
      )}
    </div>
  );
};
