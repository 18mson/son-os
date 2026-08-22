"use client";

import React, { useState } from "react";
import {
  User,
  Briefcase,
  Code2,
  GraduationCap,
  Sparkles,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  CheckCircle2,
  Award,
  Zap,
  Globe,
  Layers,
  Cpu,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { useWindowStore } from "@/store/windowStore";
import { useTranslation } from "@/i18n";

type TabType = "overview" | "experience" | "skills" | "education" | "accomplishments";

export const AboutApp: React.FC = () => {
  const { theme } = useWindowStore();
  const { t, language } = useTranslation();
  const isLight = theme === "light";
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  const experiences = t.aboutApp.experiences;

  const skillGroups = [
    {
      category: language === "en" ? "Programming Languages" : "Bahasa Pemrograman",
      icon: <Code2 size={16} className="text-blue-400" />,
      items: [
        { name: "JavaScript (ES6+)", level: language === "en" ? "Expert" : "Ahli" },
        { name: "TypeScript", level: language === "en" ? "Advanced" : "Mahir" },
        { name: "Java", level: language === "en" ? "Intermediate" : "Menengah" },
        { name: "SQL", level: language === "en" ? "Intermediate" : "Menengah" },
        { name: "PHP", level: language === "en" ? "Basic / Intermediate" : "Dasar / Menengah" },
      ],
    },
    {
      category: language === "en" ? "Frontend Frameworks & UI" : "Frontend Frameworks & UI",
      icon: <Layers size={16} className="text-cyan-400" />,
      items: [
        { name: "React.js", level: language === "en" ? "Expert" : "Ahli" },
        { name: "Next.js (App / Pages)", level: language === "en" ? "Expert" : "Ahli" },
        { name: "Vue.js", level: language === "en" ? "Intermediate" : "Menengah" },
        { name: "Tailwind CSS", level: language === "en" ? "Expert" : "Ahli" },
        { name: "Redux / Redux Toolkit", level: language === "en" ? "Advanced" : "Mahir" },
        { name: "SWR / TanStack Query", level: language === "en" ? "Advanced" : "Mahir" },
        { name: "Material UI", level: language === "en" ? "Advanced" : "Mahir" },
        { name: "Legion UI", level: language === "en" ? "Advanced" : "Mahir" },
        { name: "Framer Motion", level: language === "en" ? "Advanced" : "Mahir" },
        { name: "Zustand", level: language === "en" ? "Advanced" : "Mahir" },
      ],
    },
    {
      category: language === "en" ? "Backend, Cloud & Database" : "Backend, Cloud & Database",
      icon: <Cpu size={16} className="text-emerald-400" />,
      items: [
        { name: "Node.js & Express.js", level: language === "en" ? "Advanced" : "Mahir" },
        { name: "AdonisJS", level: language === "en" ? "Intermediate" : "Menengah" },
        { name: "Supabase", level: language === "en" ? "Advanced" : "Mahir" },
        { name: "RESTful API Design", level: language === "en" ? "Expert" : "Ahli" },
        { name: "PostgreSQL & MySQL", level: language === "en" ? "Intermediate" : "Menengah" },
        { name: "NoSQL Database", level: language === "en" ? "Intermediate" : "Menengah" },
      ],
    },
    {
      category: language === "en" ? "Testing & Code Quality" : "Testing & Kualitas Kode",
      icon: <ShieldCheck size={16} className="text-purple-400" />,
      items: [
        { name: "Vitest", level: language === "en" ? "Advanced" : "Mahir" },
        { name: "Jest", level: language === "en" ? "Advanced" : "Mahir" },
        { name: "React Testing Library", level: language === "en" ? "Advanced" : "Mahir" },
        { name: "Unit & Integration Testing", level: language === "en" ? "Advanced" : "Mahir" },
      ],
    },
    {
      category: language === "en" ? "Web Analytics & Tracking" : "Web Analitik & Pelacakan",
      icon: <TrendingUp size={16} className="text-amber-400" />,
      items: [
        { name: "Google Analytics 4 (GA4)", level: language === "en" ? "Advanced" : "Mahir" },
        { name: "Google Tag Manager (GTM)", level: language === "en" ? "Advanced" : "Mahir" },
        { name: "Custom Dimensions & Events", level: language === "en" ? "Advanced" : "Mahir" },
        { name: "Enhanced eCommerce Tracking", level: language === "en" ? "Advanced" : "Mahir" },
      ],
    },
    {
      category: language === "en" ? "AI & Developer Productivity Tools" : "Alat AI & Produktivitas Pengembang",
      icon: <Sparkles size={16} className="text-pink-400" />,
      items: [
        { name: "GitHub Copilot", level: language === "en" ? "Daily" : "Harian" },
        { name: "Cursor AI", level: language === "en" ? "Daily" : "Harian" },
        { name: "ChatGPT & Claude", level: language === "en" ? "Daily" : "Harian" },
        { name: "Gemini & Antigravity", level: language === "en" ? "Daily" : "Harian" },
        { name: "Vertex AI", level: language === "en" ? "Intermediate" : "Menengah" },
      ],
    },
  ];

  return (
    <div
      className={`flex flex-col h-full w-full select-none font-sans overflow-hidden ${
        isLight ? "bg-slate-100 text-slate-900" : "bg-zinc-950 text-zinc-100"
      }`}
    >
      {/* Profile Header Hero */}
      <div
        className={`shrink-0 border-b p-5 sm:p-6 transition-colors ${
          isLight
            ? "bg-linear-to-r from-blue-50 via-indigo-50/50 to-white border-slate-300"
            : "bg-linear-to-r from-blue-950/40 via-indigo-950/20 to-zinc-900/60 border-white/10"
        }`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Avatar Badge */}
            <div className="relative">
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-linear-to-tr from-blue-600 via-indigo-600 to-violet-700 flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-indigo-500/20 ring-2 ring-white/20">
                MS
              </div>
              <div
                className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-zinc-950 flex items-center justify-center"
                title={language === "en" ? "Available for opportunities & collaborations" : "Tersedia untuk peluang kerja / kolaborasi"}
              >
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className={`text-xl sm:text-2xl font-black tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
                  Muhamad Son&apos;ani
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/15 text-blue-400 border border-blue-500/30">
                  Frontend Specialist
                </span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-blue-500 mt-0.5">
                {t.aboutApp.heroRole} • {t.aboutApp.experienceTotalValue}
              </p>
              <div className={`flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs ${isLight ? "text-slate-600" : "text-zinc-400"}`}>
                <span className="flex items-center gap-1">
                  <MapPin size={13} className="text-rose-400" /> Tangerang / Bandung, Indonesia
                </span>
                <span className="flex items-center gap-1">
                  <Mail size={13} className="text-amber-400" /> 18mson@gmail.com
                </span>
                <span className="flex items-center gap-1">
                  <Phone size={13} className="text-emerald-400" /> +62 822 1626 7796
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-start sm:justify-end shrink-0">
            <a
              href="https://wa.me/6282216267796"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <Phone size={13} />
              <span>WhatsApp</span>
            </a>
            <a
              href="https://linkedin.com/in/muhamad-son-ani"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-all cursor-pointer"
            >
              <ExternalLink size={13} />
              <span>LinkedIn</span>
            </a>
            <a
              href="https://github.com/18mson"
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                isLight
                  ? "bg-white hover:bg-slate-100 text-slate-800 border-slate-300"
                  : "bg-white/10 hover:bg-white/15 text-white border-white/10"
              }`}
            >
              <Globe size={13} />
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </div>

      {/* Tabs Header Navigation */}
      <div
        className={`flex items-center gap-1 px-4 py-2 border-b overflow-x-auto no-scrollbar shrink-0 ${
          isLight ? "bg-slate-200/70 border-slate-300" : "bg-zinc-900/80 border-white/10"
        }`}
      >
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "overview"
              ? "bg-blue-600 text-white shadow-sm"
              : isLight
              ? "text-slate-600 hover:bg-slate-300/60"
              : "text-zinc-400 hover:bg-white/5"
          }`}
        >
          <User size={14} /> {t.aboutApp.tabOverview}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("experience")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "experience"
              ? "bg-blue-600 text-white shadow-sm"
              : isLight
              ? "text-slate-600 hover:bg-slate-300/60"
              : "text-zinc-400 hover:bg-white/5"
          }`}
        >
          <Briefcase size={14} /> {t.aboutApp.tabExperience} ({experiences.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("skills")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "skills"
              ? "bg-blue-600 text-white shadow-sm"
              : isLight
              ? "text-slate-600 hover:bg-slate-300/60"
              : "text-zinc-400 hover:bg-white/5"
          }`}
        >
          <Code2 size={14} /> {t.aboutApp.tabSkills}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("education")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "education"
              ? "bg-blue-600 text-white shadow-sm"
              : isLight
              ? "text-slate-600 hover:bg-slate-300/60"
              : "text-zinc-400 hover:bg-white/5"
          }`}
        >
          <GraduationCap size={14} /> {t.aboutApp.tabEducation}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("accomplishments")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "accomplishments"
              ? "bg-blue-600 text-white shadow-sm"
              : isLight
              ? "text-slate-600 hover:bg-slate-300/60"
              : "text-zinc-400 hover:bg-white/5"
          }`}
        >
          <Award size={14} /> {t.aboutApp.tabAccomplishments}
        </button>
      </div>

      {/* Main Tab Content Area with Smooth Scroll */}
      <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-6">
        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-6 max-w-4xl mx-auto">
            {/* Bio Summary Card */}
            <div
              className={`p-5 rounded-2xl border ${
                isLight ? "bg-white border-slate-200 shadow-xs" : "bg-zinc-900/70 border-white/10"
              }`}
            >
              <h2 className="text-sm font-bold text-blue-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Sparkles size={16} /> {t.aboutApp.bioTitle}
              </h2>
              <p className={`text-sm leading-relaxed ${isLight ? "text-slate-700" : "text-zinc-300"}`}>
                {t.aboutApp.bioParagraph1}
              </p>
              <p className={`text-sm leading-relaxed mt-3 ${isLight ? "text-slate-700" : "text-zinc-300"}`}>
                {t.aboutApp.bioParagraph2}
              </p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className={`p-4 rounded-xl border text-center ${isLight ? "bg-white border-slate-200" : "bg-zinc-900/60 border-white/5"}`}>
                <span className="text-2xl font-black text-blue-500">6.5+</span>
                <span className={`block text-[11px] font-semibold mt-0.5 ${isLight ? "text-slate-600" : "text-zinc-400"}`}>
                  {language === "en" ? "Years Experience" : "Tahun Pengalaman"}
                </span>
              </div>
              <div className={`p-4 rounded-xl border text-center ${isLight ? "bg-white border-slate-200" : "bg-zinc-900/60 border-white/5"}`}>
                <span className="text-2xl font-black text-emerald-500">8+</span>
                <span className={`block text-[11px] font-semibold mt-0.5 ${isLight ? "text-slate-600" : "text-zinc-400"}`}>
                  {language === "en" ? "Enterprise Projects" : "Proyek Enterprise"}
                </span>
              </div>
              <div className={`p-4 rounded-xl border text-center ${isLight ? "bg-white border-slate-200" : "bg-zinc-900/60 border-white/5"}`}>
                <span className="text-2xl font-black text-purple-500">100%</span>
                <span className={`block text-[11px] font-semibold mt-0.5 ${isLight ? "text-slate-600" : "text-zinc-400"}`}>
                  Agile / Scrum
                </span>
              </div>
              <div className={`p-4 rounded-xl border text-center ${isLight ? "bg-white border-slate-200" : "bg-zinc-900/60 border-white/5"}`}>
                <span className="text-2xl font-black text-amber-500">S1</span>
                <span className={`block text-[11px] font-semibold mt-0.5 ${isLight ? "text-slate-600" : "text-zinc-400"}`}>
                  {language === "en" ? "Computer Science" : "Teknik Informatika"}
                </span>
              </div>
            </div>

            {/* Personal Details & Objective Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Personal Details */}
              <div
                className={`p-5 rounded-2xl border space-y-3 ${
                  isLight ? "bg-white border-slate-200" : "bg-zinc-900/60 border-white/10"
                }`}
              >
                <h3 className="text-xs font-bold uppercase tracking-wider text-blue-500 flex items-center gap-2">
                  <User size={15} /> {t.aboutApp.personalDetails}
                </h3>
                <div className="space-y-2 text-xs divide-y divide-white/5">
                  <div className="flex justify-between py-1">
                    <span className={isLight ? "text-slate-500" : "text-zinc-400"}>{t.aboutApp.fullNameLabel}:</span>
                    <span className="font-semibold">{t.aboutApp.fullNameValue}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className={isLight ? "text-slate-500" : "text-zinc-400"}>{t.aboutApp.domicileLabel}:</span>
                    <span className="font-semibold">{t.aboutApp.domicileValue}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className={isLight ? "text-slate-500" : "text-zinc-400"}>{t.aboutApp.educationLabel}:</span>
                    <span className="font-semibold">{t.aboutApp.educationValue}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className={isLight ? "text-slate-500" : "text-zinc-400"}>{t.aboutApp.specializationLabel}:</span>
                    <span className="font-semibold">{t.aboutApp.specializationValue}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className={isLight ? "text-slate-500" : "text-zinc-400"}>{t.aboutApp.experienceTotalLabel}:</span>
                    <span className="font-semibold text-emerald-400">{t.aboutApp.experienceTotalValue}</span>
                  </div>
                </div>
              </div>

              {/* Career Objective & Focus */}
              <div
                className={`p-5 rounded-2xl border space-y-3 ${
                  isLight ? "bg-white border-slate-200" : "bg-zinc-900/60 border-white/10"
                }`}
              >
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-500 flex items-center gap-2">
                  <Zap size={15} /> {t.aboutApp.careerFocusTitle}
                </h3>
                <div className="space-y-3 text-xs leading-relaxed">
                  <div className={`p-3 rounded-xl ${isLight ? "bg-blue-50 text-blue-900" : "bg-blue-500/10 text-blue-200"}`}>
                    <strong className="block mb-1 font-semibold">
                      {language === "en" ? "Career Objective:" : "Tujuan Karier:"}
                    </strong>
                    {language === "en"
                      ? "Dedicated Software Engineer & Frontend Specialist building resilient, scalable, and delightful web applications."
                      : "Mendedikasikan keahlian teknik sebagai Software Engineer / Senior Frontend Engineer untuk membangun aplikasi web modern, teruji, dan scalable."}
                  </div>
                  <ul className={`space-y-1.5 list-disc pl-4 ${isLight ? "text-slate-600" : "text-zinc-300"}`}>
                    <li>{t.aboutApp.careerFocus1}</li>
                    <li>{t.aboutApp.careerFocus2}</li>
                    <li>{t.aboutApp.careerFocus3}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: EXPERIENCE */}
        {activeTab === "experience" && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div>
              <h2 className={`text-base font-bold tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
                {t.aboutApp.expSectionTitle}
              </h2>
              <p className={`text-xs ${isLight ? "text-slate-600" : "text-zinc-400"}`}>
                {t.aboutApp.expSectionSubtitle}
              </p>
            </div>

            <div className="relative border-l-2 border-indigo-500/30 pl-4 sm:pl-6 ml-2 sm:ml-4 space-y-8">
              {experiences.map((exp, idx) => (
                <div key={idx} className="relative group">
                  {/* Timeline Dot */}
                  <div className="absolute -left-6.25 sm:-left-8.25 top-1.5 w-4 h-4 rounded-full bg-zinc-950 border-2 border-indigo-500 flex items-center justify-center">
                    <div className={`w-2 h-2 rounded-full ${exp.current ? "bg-emerald-400 animate-ping" : "bg-indigo-400"}`} />
                  </div>

                  <div
                    className={`p-5 rounded-2xl border transition-all ${
                      isLight
                        ? "bg-white border-slate-200 shadow-xs hover:border-slate-300"
                        : "bg-zinc-900/70 border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                      <div>
                        <h3 className={`text-base font-bold ${isLight ? "text-slate-900" : "text-white"}`}>
                          {exp.role}
                        </h3>
                        <p className="text-xs font-semibold text-blue-500">
                          {exp.company}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {exp.current && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            {t.aboutApp.currentlyActive}
                          </span>
                        )}
                        <span className={`text-xs font-mono font-medium px-2.5 py-1 rounded-lg ${
                          isLight ? "bg-slate-100 text-slate-700" : "bg-white/5 text-zinc-300"
                        }`}>
                          {exp.period}
                        </span>
                      </div>
                    </div>

                    <div className={`text-xs font-medium mb-3 pb-2 border-b ${
                      isLight ? "text-indigo-600 border-slate-200" : "text-indigo-300 border-white/5"
                    }`}>
                      {t.aboutApp.projectLabel}: <span className="font-bold">{exp.project}</span>
                    </div>

                    <ul className={`space-y-1.5 text-xs list-disc pl-4 mb-4 leading-relaxed ${
                      isLight ? "text-slate-700" : "text-zinc-300"
                    }`}>
                      {exp.points.map((pt, ptIdx) => (
                        <li key={ptIdx}>{pt}</li>
                      ))}
                    </ul>

                    {/* Tech Badges */}
                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/5">
                      {exp.tools.map((tool, tIdx) => (
                        <span
                          key={tIdx}
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${
                            isLight
                              ? "bg-slate-100 text-slate-700 border border-slate-200"
                              : "bg-white/5 text-zinc-300 border border-white/5"
                          }`}
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: SKILLS */}
        {activeTab === "skills" && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div>
              <h2 className={`text-base font-bold tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
                {t.aboutApp.skillsSectionTitle}
              </h2>
              <p className={`text-xs ${isLight ? "text-slate-600" : "text-zinc-400"}`}>
                {t.aboutApp.skillsSectionSubtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {skillGroups.map((group, idx) => (
                <div
                  key={idx}
                  className={`p-5 rounded-2xl border space-y-3 ${
                    isLight ? "bg-white border-slate-200" : "bg-zinc-900/70 border-white/10"
                  }`}
                >
                  <div className="flex items-center gap-2 border-b pb-2.5 border-white/5">
                    {group.icon}
                    <h3 className={`text-xs font-bold uppercase tracking-wider ${isLight ? "text-slate-900" : "text-white"}`}>
                      {group.category}
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {group.items.map((item, itemIdx) => (
                      <div
                        key={itemIdx}
                        className={`p-2.5 rounded-xl border flex flex-col justify-between ${
                          isLight ? "bg-slate-50 border-slate-200" : "bg-white/5 border-white/5"
                        }`}
                      >
                        <span className={`text-xs font-bold ${isLight ? "text-slate-800" : "text-zinc-200"}`}>
                          {item.name}
                        </span>
                        <span className="text-[10px] text-blue-500 font-semibold mt-1">
                          {item.level}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: EDUCATION & TRAINING */}
        {activeTab === "education" && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div>
              <h2 className={`text-base font-bold tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
                {t.aboutApp.eduSectionTitle}
              </h2>
              <p className={`text-xs ${isLight ? "text-slate-600" : "text-zinc-400"}`}>
                {t.aboutApp.eduSectionSubtitle}
              </p>
            </div>

            {/* Formal Education */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-500 flex items-center gap-2">
                <GraduationCap size={15} /> {t.aboutApp.eduSectionTitle}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {t.aboutApp.educations.map((edu, idx) => (
                  <div
                    key={idx}
                    className={`p-5 rounded-2xl border space-y-1.5 ${
                      isLight ? "bg-white border-slate-200" : "bg-zinc-900/70 border-white/10"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-500">{edu.period}</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/10 text-blue-400">
                        {edu.degree}
                      </span>
                    </div>
                    <h4 className={`text-sm font-black ${isLight ? "text-slate-900" : "text-white"}`}>
                      {edu.institution}
                    </h4>
                    <p className={`text-xs ${isLight ? "text-slate-600" : "text-zinc-400"}`}>
                      {edu.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Courses & Certifications */}
            <div className="space-y-3 pt-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-500 flex items-center gap-2">
                <Award size={15} /> {t.aboutApp.trainingSectionTitle}
              </h3>

              <div
                className={`rounded-2xl border overflow-hidden ${
                  isLight ? "bg-white border-slate-200" : "bg-zinc-900/70 border-white/10"
                }`}
              >
                <div className="divide-y divide-white/5">
                  {t.aboutApp.trainings.map((tr, idx) => (
                    <div key={idx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h4 className={`text-xs font-bold ${isLight ? "text-slate-900" : "text-white"}`}>
                          {tr.title}
                        </h4>
                        <p className={`text-[11px] ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                          Provider: {tr.provider} • {tr.period}
                        </p>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 w-fit">
                        ✓ {tr.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: ACCOMPLISHMENTS */}
        {activeTab === "accomplishments" && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div>
              <h2 className={`text-base font-bold tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
                {t.aboutApp.accomplishmentsSectionTitle}
              </h2>
              <p className={`text-xs ${isLight ? "text-slate-600" : "text-zinc-400"}`}>
                {t.aboutApp.accomplishmentsSectionSubtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {t.aboutApp.accomplishments.map((acc, idx) => {
                const icons = [
                  <TrendingUp key="1" size={18} />,
                  <Zap key="2" size={18} />,
                  <CheckCircle2 key="3" size={18} />,
                  <Cpu key="4" size={18} />,
                ];
                const colors = [
                  "bg-blue-500/15 text-blue-400",
                  "bg-emerald-500/15 text-emerald-400",
                  "bg-amber-500/15 text-amber-400",
                  "bg-purple-500/15 text-purple-400",
                ];

                return (
                  <div
                    key={idx}
                    className={`p-5 rounded-2xl border space-y-2.5 ${
                      isLight ? "bg-white border-slate-200" : "bg-zinc-900/70 border-white/10"
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl ${colors[idx % colors.length]} flex items-center justify-center`}>
                      {icons[idx % icons.length]}
                    </div>
                    <h3 className={`text-sm font-bold ${isLight ? "text-slate-900" : "text-white"}`}>
                      {acc.title}
                    </h3>
                    <p className={`text-xs leading-relaxed ${isLight ? "text-slate-600" : "text-zinc-300"}`}>
                      {acc.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* App Footer Bar */}
      <div
        className={`px-4 py-2 border-t flex flex-wrap items-center justify-between text-[11px] shrink-0 ${
          isLight ? "bg-slate-200/50 border-slate-300 text-slate-600" : "bg-zinc-900/60 border-white/5 text-zinc-400"
        }`}
      >
        <span>{t.aboutApp.footerCv}</span>
        <span className="font-mono text-[10px]">Son-OS Profile Engine v2.8</span>
      </div>
    </div>
  );
};
