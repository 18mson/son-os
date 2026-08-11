import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SonOS — ChromeOS-inspired Portfolio",
  description: "Web portfolio with ChromeOS desktop aesthetic, window manager, floating shelf, and application launcher.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full dark">
      <body className={`${inter.className} h-full w-full overflow-hidden bg-zinc-950 text-zinc-100 antialiased select-none`}>
        {children}
      </body>
    </html>
  );
}
