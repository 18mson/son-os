import type { Metadata, Viewport } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Son-OS — ChromeOS-inspired Web Desktop & Portfolio",
  description: "Interactive web desktop portfolio with ChromeOS aesthetic, window manager, floating shelf, and app launcher. Built with Next.js, TypeScript, Tailwind CSS, Zustand, and Framer Motion.",
  keywords: [
    "Son-OS",
    "Web Desktop Portfolio",
    "ChromeOS Web App",
    "Sony Portfolio",
    "Next.js",
    "TypeScript",
    "Tailwind CSS",
    "React Window Manager",
    "Zustand",
    "Framer Motion",
  ],
  authors: [{ name: "Sony", url: "https://github.com/18mson" }],
  creator: "Sony",
  publisher: "Son-OS",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Son-OS — ChromeOS-inspired Web Desktop & Portfolio",
    description: "Interactive web desktop portfolio with ChromeOS aesthetic, window manager, floating shelf, and app launcher.",
    url: "https://son-os.vercel.app",
    siteName: "Son-OS Portfolio",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Son-OS — ChromeOS-inspired Web Desktop & Portfolio",
    description: "Interactive web desktop portfolio with ChromeOS aesthetic, window manager, floating shelf, and app launcher.",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Son-OS",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full dark" suppressHydrationWarning>
      <body
        className={`${roboto.className} h-full w-full overflow-hidden bg-zinc-950 text-zinc-100 antialiased select-none`}
        suppressHydrationWarning
      >
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var raw = localStorage.getItem('sonos_settings');
                  var theme = 'dark';
                  var scale = 'normal';
                  if (raw) {
                    var parsed = JSON.parse(raw);
                    if (parsed.state && parsed.state.theme) theme = parsed.state.theme;
                    if (parsed.state && parsed.state.textScale) scale = parsed.state.textScale;
                  } else {
                    var legacyTheme = localStorage.getItem('sonos_theme');
                    if (legacyTheme) theme = legacyTheme;
                  }
                  document.documentElement.setAttribute('data-theme', theme);
                  document.documentElement.setAttribute('data-text-scale', scale);
                  if (theme === 'light') {
                    document.documentElement.classList.add('light');
                    document.documentElement.classList.remove('dark');
                  } else {
                    document.documentElement.classList.add('dark');
                    document.documentElement.classList.remove('light');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        {/* Semantic HTML & Noscript Fallback for SEO Crawlers */}
        <noscript>
          <div className="p-8 bg-zinc-900 text-zinc-100 font-sans max-w-3xl mx-auto my-12 rounded-2xl border border-white/20 shadow-2xl">
            <h1 className="text-3xl font-bold text-white mb-2">Son-OS — ChromeOS-inspired Web Desktop & Portfolio</h1>
            <p className="text-zinc-300 text-base mb-6">
              Welcome to Son-OS. This is an interactive web desktop portfolio built by Sony using Next.js, TypeScript, Tailwind CSS, Zustand, and Framer Motion.
            </p>
            <h2 className="text-xl font-semibold text-blue-400 mb-2">Featured Projects</h2>
            <ul className="list-disc pl-5 space-y-2 mb-6 text-sm text-zinc-300">
              <li>
                <strong>Japanese Quiz:</strong> Interactive Japanese vocabulary & kana quiz app with multiplayer battleground. (https://japanese-quiz-coral.vercel.app/)
              </li>
              <li>
                <strong>Lovely Ever:</strong> Digital wedding invitation & event management SaaS platform. (https://lovelyever.com)
              </li>
            </ul>
            <h2 className="text-xl font-semibold text-blue-400 mb-2">Contact</h2>
            <p className="text-sm text-zinc-300">
              Reach out via GitHub at <a href="https://github.com/18mson" className="text-blue-400 underline">github.com/18mson</a>.
            </p>
          </div>
        </noscript>

        {children}
      </body>
    </html>
  );
}
