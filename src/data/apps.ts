import { AppDefinition } from "@/store/windowStore";

export const APPS: AppDefinition[] = [
  {
    id: "japanese-quiz",
    title: "Japanese Quiz",
    icon: "Languages",
    accentColor: "bg-linear-to-br from-red-500 to-rose-600",
    description: "Interactive Japanese vocabulary & kana quiz app with multiplayer battleground",
    type: "iframe",
    liveUrl: "https://japanese-quiz-coral.vercel.app/",
    githubUrl: "https://github.com/18mson/japanese-quiz.git",
    defaultSize: { w: 940, h: 620 },
  },
  {
    id: "lovely-ever",
    title: "Lovely Ever",
    icon: "Heart",
    accentColor: "bg-linear-to-br from-pink-500 to-rose-500",
    description: "Digital wedding invitation & event management SaaS platform",
    type: "iframe",
    liveUrl: "https://lovelyever.com",
    defaultSize: { w: 940, h: 620 },
  },
  {
    id: "about",
    title: "About Me",
    icon: "User",
    accentColor: "bg-linear-to-br from-blue-500 to-indigo-600",
    description: "Learn more about who I am, my experience, and what I build",
    type: "static",
    defaultSize: { w: 520, h: 540 },
  },
  {
    id: "contact",
    title: "Contact",
    icon: "Mail",
    accentColor: "bg-linear-to-br from-amber-500 to-orange-600",
    description: "Get in touch with me for opportunities or collaborations",
    type: "static",
    defaultSize: { w: 480, h: 500 },
  },
];
