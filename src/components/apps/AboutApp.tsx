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
  FolderKanban,
  Rocket,
  ShoppingBag,
  Laptop,
  Languages,
} from "lucide-react";
import { useWindowStore } from "@/store/windowStore";
import { useTranslation } from "@/i18n";
import { APPS } from "@/data/apps";

type TabType = "overview" | "portfolio" | "experience" | "skills" | "education" | "accomplishments";

export const AboutApp: React.FC = () => {
  const { theme, openWindow } = useWindowStore();
  const { t, language } = useTranslation();
  const isLight = theme === "light";
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  const handleLaunchApp = (appId?: string) => {
    if (!appId) return;
    const targetApp = APPS.find((a) => a.id === appId);
    if (targetApp) {
      openWindow(targetApp);
    }
  };

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
      className={`flex flex-col h-full w-full select-none font-sans overflow-hidden ${isLight ? "bg-slate-100 text-slate-900" : "bg-zinc-950 text-zinc-100"
        }`}
    >
      {/* Profile Header Hero */}
      <div
        className={`shrink-0 border-b p-5 sm:p-6 transition-colors ${isLight
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
                  <MapPin size={13} className="text-rose-400" /> Bandung, Indonesia
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
              href="https://linkedin.com/in/muhamad-son-ani-549230153"
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
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${isLight
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
        className={`flex items-center gap-1 px-4 py-2 border-b overflow-x-auto no-scrollbar shrink-0 ${isLight ? "bg-slate-200/70 border-slate-300" : "bg-zinc-900/80 border-white/10"
          }`}
      >
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${activeTab === "overview"
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
          onClick={() => setActiveTab("portfolio")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${activeTab === "portfolio"
            ? "bg-blue-600 text-white shadow-sm"
            : isLight
              ? "text-slate-600 hover:bg-slate-300/60"
              : "text-zinc-400 hover:bg-white/5"
            }`}
        >
          <FolderKanban size={14} /> {t.aboutApp.tabPortfolio} ({t.aboutApp.portfolioProjects.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("experience")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${activeTab === "experience"
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
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${activeTab === "skills"
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
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${activeTab === "education"
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
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${activeTab === "accomplishments"
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
              className={`p-5 rounded-2xl border ${isLight ? "bg-white border-slate-200 shadow-xs" : "bg-zinc-900/70 border-white/10"
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
                <span className="text-2xl font-black text-emerald-500">6</span>
                <span className={`block text-[11px] font-semibold mt-0.5 ${isLight ? "text-slate-600" : "text-zinc-400"}`}>
                  {language === "en" ? "Career Positions" : "Posisi Karier"}
                </span>
              </div>
              <div className={`p-4 rounded-xl border text-center ${isLight ? "bg-white border-slate-200" : "bg-zinc-900/60 border-white/5"}`}>
                <span className="text-2xl font-black text-purple-500">4</span>
                <span className={`block text-[11px] font-semibold mt-0.5 ${isLight ? "text-slate-600" : "text-zinc-400"}`}>
                  {language === "en" ? "Trainings & Certs" : "Pelatihan & Kursus"}
                </span>
              </div>
              <div className={`p-4 rounded-xl border text-center ${isLight ? "bg-white border-slate-200" : "bg-zinc-900/60 border-white/5"}`}>
                <span className="text-2xl font-black text-amber-500">S1</span>
                <span className={`block text-[11px] font-semibold mt-0.5 ${isLight ? "text-slate-600" : "text-zinc-400"}`}>
                  STTB (2014–2018)
                </span>
              </div>
            </div>

            {/* Personal Details & Objective Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Personal Details */}
              <div
                className={`p-5 rounded-2xl border space-y-3 ${isLight ? "bg-white border-slate-200" : "bg-zinc-900/60 border-white/10"
                  }`}
              >
                <h3 className="text-xs font-bold uppercase tracking-wider text-blue-500 flex items-center gap-2">
                  <User size={15} /> {t.aboutApp.personalDetails}
                </h3>
                <div className="space-y-1.5 text-xs divide-y divide-white/5">
                  <div className="flex justify-between py-1">
                    <span className={isLight ? "text-slate-500" : "text-zinc-400"}>{t.aboutApp.fullNameLabel}:</span>
                    <span className="font-semibold">{t.aboutApp.fullNameValue}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className={isLight ? "text-slate-500" : "text-zinc-400"}>{t.aboutApp.birthPlaceDateLabel}:</span>
                    <span className="font-semibold">{t.aboutApp.birthPlaceDateValue}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className={isLight ? "text-slate-500" : "text-zinc-400"}>{t.aboutApp.genderLabel}:</span>
                    <span className="font-semibold">{t.aboutApp.genderValue}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className={isLight ? "text-slate-500" : "text-zinc-400"}>{t.aboutApp.religionLabel}:</span>
                    <span className="font-semibold">{t.aboutApp.religionValue}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className={isLight ? "text-slate-500" : "text-zinc-400"}>{t.aboutApp.healthLabel}:</span>
                    <span className="font-semibold text-emerald-400">{t.aboutApp.healthValue}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className={isLight ? "text-slate-500" : "text-zinc-400"}>{t.aboutApp.languagesLabel}:</span>
                    <span className="font-semibold">{t.aboutApp.languagesValue}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className={isLight ? "text-slate-500" : "text-zinc-400"}>{t.aboutApp.educationLabel}:</span>
                    <span className="font-semibold">{t.aboutApp.educationValue}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className={isLight ? "text-slate-500" : "text-zinc-400"}>{t.aboutApp.experienceTotalLabel}:</span>
                    <span className="font-semibold text-blue-400">{t.aboutApp.experienceTotalValue}</span>
                  </div>
                </div>
              </div>

              {/* Career Objective & Profile Traits */}
              <div
                className={`p-5 rounded-2xl border space-y-3 ${isLight ? "bg-white border-slate-200" : "bg-zinc-900/60 border-white/10"
                  }`}
              >
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-500 flex items-center gap-2">
                  <Zap size={15} /> {t.aboutApp.careerFocusTitle}
                </h3>
                <div className="space-y-3 text-xs leading-relaxed">
                  <div className={`p-3 rounded-xl ${isLight ? "bg-blue-50 text-blue-900" : "bg-blue-500/10 text-blue-200"}`}>
                    <strong className="block mb-1 font-semibold">
                      {t.aboutApp.objectiveLabel}:
                    </strong>
                    <span className="font-medium">{t.aboutApp.objectiveValue}</span>
                  </div>
                  <ul className={`space-y-2 list-disc pl-4 ${isLight ? "text-slate-600" : "text-zinc-300"}`}>
                    <li>{t.aboutApp.careerFocus1}</li>
                    <li>{t.aboutApp.careerFocus2}</li>
                    <li>{t.aboutApp.careerFocus3}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PORTFOLIO */}
        {activeTab === "portfolio" && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div>
              <h2 className={`text-base font-bold tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
                {t.aboutApp.portfolioSectionTitle}
              </h2>
              <p className={`text-xs ${isLight ? "text-slate-600" : "text-zinc-400"}`}>
                {t.aboutApp.portfolioSectionSubtitle}
              </p>
            </div>

            <div className="space-y-6">
              {t.aboutApp.portfolioProjects.map((proj) => {
                const isSonOs = proj.id === "son-os";
                const isJapaneseQuiz = proj.id === "japanese-quiz";

                return (
                  <div
                    key={proj.id}
                    className={`rounded-2xl border overflow-hidden transition-all duration-300 ${isLight
                        ? "bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300"
                        : "bg-zinc-900/80 border-white/10 hover:border-white/20 shadow-xl"
                      }`}
                  >
                    {/* Mockup Header Window Bar */}
                    <div
                      className={`relative px-4 py-3 border-b flex flex-wrap items-center justify-between gap-2 overflow-hidden ${isLight ? "bg-slate-100/90 border-slate-200" : "bg-zinc-950/70 border-white/10"
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        {/* Traffic light dots */}
                        <div className="flex items-center gap-1.5 mr-2">
                          <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                          <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                          <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                        </div>
                        <span className="text-[11px] font-mono font-bold tracking-wide opacity-75">
                          {proj.id === "son-os" ? "son-os://desktop-env" : "app://japanese-quiz"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase bg-blue-500/15 text-blue-400 border border-blue-500/30">
                          {proj.badge}
                        </span>
                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${isLight ? "bg-slate-200 text-slate-700" : "bg-white/10 text-zinc-300"
                            }`}
                        >
                          {proj.category}
                        </span>
                      </div>
                    </div>

                    {/* Visual Hero Mockup Banner */}
                    <div className={`relative p-6 sm:p-8 bg-linear-to-r ${proj.gradient} text-white overflow-hidden`}>
                      {/* Decorative Background Patterns */}
                      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] bg-size-[16px_16px]" />
                      <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-2xl" />

                      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center text-white shadow-2xl shrink-0">
                            {isSonOs ? <Laptop size={32} /> : <Languages size={32} />}
                          </div>
                          <div>
                            <h3 className="text-lg sm:text-xl font-black tracking-tight text-white drop-shadow-sm">
                              {proj.title}
                            </h3>
                            <p className="text-xs sm:text-sm font-medium text-white/90 mt-1 max-w-xl line-clamp-2">
                              {proj.tagline}
                            </p>
                          </div>
                        </div>

                        {/* Quick Action in banner if Japanese Quiz */}
                        {isJapaneseQuiz && (
                          <button
                            type="button"
                            onClick={() => handleLaunchApp("japanese-quiz")}
                            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-zinc-900 hover:bg-zinc-100 font-bold text-xs shadow-lg transition-all transform hover:scale-105 active:scale-95 cursor-pointer shrink-0"
                          >
                            <Rocket size={15} className="text-rose-600" />
                            <span>{t.aboutApp.portfolioLaunchSonOs}</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Main Content Body */}
                    <div className="p-5 sm:p-6 space-y-5">
                      {/* Description */}
                      <p className={`text-xs sm:text-sm leading-relaxed ${isLight ? "text-slate-700" : "text-zinc-300"}`}>
                        {proj.description}
                      </p>

                      {/* Highlights */}
                      <div className="space-y-2">
                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-blue-500 flex items-center gap-1.5">
                          <Sparkles size={14} /> Key Architecture & Features
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {proj.highlights.map((hl, hIdx) => (
                            <div
                              key={hIdx}
                              className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs leading-normal ${isLight
                                  ? "bg-slate-50/80 border-slate-200/80 text-slate-800"
                                  : "bg-white/5 border-white/5 text-zinc-200"
                                }`}
                            >
                              <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                              <span>{hl}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Tech Stack Tags */}
                      <div className="space-y-2 pt-1">
                        <h4 className={`text-[11px] font-bold uppercase tracking-wider ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                          Tech Stack & Technologies
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {proj.techStack.map((tech, techIdx) => (
                            <span
                              key={techIdx}
                              className={`text-[11px] font-medium px-2.5 py-1 rounded-lg border transition-all ${isLight
                                  ? "bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200/70"
                                  : "bg-zinc-800/90 text-zinc-200 border-white/10 hover:bg-white/10"
                                }`}
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Action Bar Footer */}
                      <div
                        className={`pt-4 border-t flex flex-wrap items-center justify-between gap-3 ${isLight ? "border-slate-200" : "border-white/10"
                          }`}
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          {isSonOs ? (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/25 text-xs font-bold">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                              <span>{t.aboutApp.portfolioCurrentSystem}</span>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleLaunchApp(proj.appId)}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-linear-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all transform hover:scale-[1.02] active:scale-95 cursor-pointer"
                            >
                              <Rocket size={14} />
                              <span>{t.aboutApp.portfolioLaunchSonOs}</span>
                            </button>
                          )}

                          {isSonOs && (
                            <button
                              type="button"
                              onClick={() => handleLaunchApp("app-store")}
                              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${isLight
                                  ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                                  : "bg-blue-500/15 text-blue-300 border-blue-500/30 hover:bg-blue-500/25"
                                }`}
                            >
                              <ShoppingBag size={14} />
                              <span>{t.aboutApp.portfolioExploreApps}</span>
                            </button>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {proj.liveUrl && (
                            <a
                              href={proj.liveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${isLight
                                  ? "bg-white hover:bg-slate-100 text-slate-800 border-slate-300"
                                  : "bg-white/10 hover:bg-white/15 text-white border-white/10"
                                }`}
                            >
                              <Globe size={14} className="text-blue-400" />
                              <span>{t.aboutApp.portfolioLiveDemo}</span>
                              <ExternalLink size={12} className="opacity-60" />
                            </a>
                          )}

                          {proj.githubUrl && (
                            <a
                              href={proj.githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${isLight
                                  ? "bg-white hover:bg-slate-100 text-slate-800 border-slate-300"
                                  : "bg-white/10 hover:bg-white/15 text-white border-white/10"
                                }`}
                            >
                              <Code2 size={14} className="text-indigo-400" />
                              <span>{t.aboutApp.portfolioSourceCode}</span>
                              <ExternalLink size={12} className="opacity-60" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
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
                    className={`p-5 rounded-2xl border transition-all ${isLight
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
                        <span className={`text-xs font-mono font-medium px-2.5 py-1 rounded-lg ${isLight ? "bg-slate-100 text-slate-700" : "bg-white/5 text-zinc-300"
                          }`}>
                          {exp.period}
                        </span>
                      </div>
                    </div>

                    <div className={`text-xs font-medium mb-3 pb-2 border-b ${isLight ? "text-indigo-600 border-slate-200" : "text-indigo-300 border-white/5"
                      }`}>
                      {t.aboutApp.projectLabel}: <span className="font-bold">{exp.project}</span>
                    </div>

                    <ul className={`space-y-1.5 text-xs list-disc pl-4 mb-4 leading-relaxed ${isLight ? "text-slate-700" : "text-zinc-300"
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
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${isLight
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
                  className={`p-5 rounded-2xl border space-y-3 ${isLight ? "bg-white border-slate-200" : "bg-zinc-900/70 border-white/10"
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
                        className={`p-2.5 rounded-xl border flex flex-col justify-between ${isLight ? "bg-slate-50 border-slate-200" : "bg-white/5 border-white/5"
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
                    className={`p-5 rounded-2xl border space-y-1.5 ${isLight ? "bg-white border-slate-200" : "bg-zinc-900/70 border-white/10"
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
                className={`rounded-2xl border overflow-hidden ${isLight ? "bg-white border-slate-200" : "bg-zinc-900/70 border-white/10"
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
                    className={`p-5 rounded-2xl border space-y-2.5 ${isLight ? "bg-white border-slate-200" : "bg-zinc-900/70 border-white/10"
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
        className={`px-4 py-2 border-t flex flex-wrap items-center justify-between text-[11px] shrink-0 ${isLight ? "bg-slate-200/50 border-slate-300 text-slate-600" : "bg-zinc-900/60 border-white/5 text-zinc-400"
          }`}
      >
        <span>{t.aboutApp.footerCv}</span>
        <span className="font-mono text-[10px]">Son-OS Profile Engine v2.8</span>
      </div>
    </div>
  );
};
