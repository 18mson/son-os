"use client";

import React from "react";
import { User, Code2, Sparkles } from "lucide-react";

export const AboutApp: React.FC = () => (
  <div className="space-y-6 max-w-2xl mx-auto">
    <div className="flex items-center gap-4 border-b border-white/10 pb-5">
      <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
        <User size={32} />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">SonOS Portfolio</h2>
        <p className="text-blue-400 font-medium text-sm">Fullstack Software Engineer & UI/UX Enthusiast</p>
      </div>
    </div>

    <div className="space-y-4 text-zinc-300 text-sm leading-relaxed">
      <p>
        Welcome to <strong className="text-white">SonOS</strong> — a web portfolio designed with a modern ChromeOS desktop aesthetic.
        I build high-performance web applications, intuitive interfaces, and scalable backend infrastructure.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <h3 className="font-semibold text-white mb-1 flex items-center gap-2">
            <Sparkles size={16} className="text-amber-400" /> Focus Areas
          </h3>
          <p className="text-xs text-zinc-400">React, Next.js, Vue 3, TypeScript, Node.js, Cloud Architecture & UI Systems</p>
        </div>
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <h3 className="font-semibold text-white mb-1 flex items-center gap-2">
            <Code2 size={16} className="text-emerald-400" /> Experience
          </h3>
          <p className="text-xs text-zinc-400">Crafting enterprise dashboards, web applications, SaaS platforms, and interactive digital experiences.</p>
        </div>
      </div>
    </div>
  </div>
);
