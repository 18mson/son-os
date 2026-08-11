# SonOS — Portfolio dengan tampilan ChromeOS-like

## Tujuan
Portfolio yang menampilkan project sebagai "app" di dalam desktop environment tiruan bergaya ChromeOS — bisa dibuka, di-drag, di-minimize — tanpa overhead bikin OS beneran (file system, auth, sandboxing).

## Arah Visual: ChromeOS-like
- Tidak ada icon di desktop — wallpaper bersih
- Shelf (taskbar) di center-bottom, floating, isi: launcher button + app di-pin + app terbuka + jam
- Launcher → klik tombol di shelf → grid fullscreen berisi semua app
- Window bisa drag, defaultnya condong maximize/snap
- Kesan: bersih, minimal, fokus 1 app dalam satu waktu

## Stack
- Next.js (App Router) + TypeScript
- Tailwind CSS
- Zustand (state management window & launcher)
- Framer Motion (animasi)
- lucide-react (icon)
- Deploy: Vercel

## Struktur Folder
app/
  page.tsx → render <Desktop />
  layout.tsx
components/
  Desktop.tsx
  Window.tsx
  Shelf.tsx
  Launcher.tsx
  apps/
    JapaneseQuizApp.tsx
    LovelyEverApp.tsx
    DesignArchiveApp.tsx
    AboutApp.tsx
    ContactApp.tsx
    TerminalApp.tsx
store/
  windowStore.ts
data/
  apps.ts → metadata semua app (title, icon, accent, default size)

## Progress Fase (checklist, update status di sini setiap fase selesai)

### Fase 1 — Fondasi Window Manager + Shelf + Launcher [STATUS: selesai]
- [x] Setup Next.js + Tailwind + TypeScript
- [x] Zustand store: windowStore.ts (windows, launcherOpen, actions)
- [x] Window.tsx — title bar, draggable, close/minimize
- [x] Shelf.tsx — center-bottom floating, launcher button, app terbuka, jam
- [x] Launcher.tsx — grid fullscreen overlay, animasi Framer Motion
- [x] Desktop.tsx — wallpaper, render window & shelf & launcher

### Fase 2 — Konten Real Project [STATUS: selesai (4/5 app utama, Design Archive ditunda)]
- [x] data/apps.ts dengan metadata project asli
- [x] Reusable IframeApp component (loading spinner, 8-detik fallback, toolbar URL & link)
- [x] Window japanese-quiz (iframe preview: https://japanese-quiz-coral.vercel.app/)
- [x] Window Lovely Ever (iframe preview: https://lovelyever.com)
- [x] Window About Me (static component)
- [x] Window Contact (static form component)
- [ ] Window Design Archive (ditunda, menunggu aset gambar & deskripsi)

### Fase 3 — Polish & Interaksi [STATUS: selesai]
- [x] Animasi window buka/tutup (Framer Motion AnimatePresence)
- [x] Snap-to-edge/maximize (double-click titlebar & snap ke batas atas desktop)
- [x] Right-click context menu (ganti wallpaper, launcher, tutup semua window, tentang SonOS)
- [x] Keyboard shortcut (Esc untuk tutup window/launcher, Alt+Space / Ctrl+Space toggle launcher)
- [x] Boot animation singkat (ChromeOS-style system startup screen)

### Fase 4 — Responsive & Aksesibilitas [STATUS: belum mulai]
- [ ] Mobile: window fullscreen otomatis
- [ ] Shelf jadi bottom nav sederhana di mobile
- [ ] Visible keyboard focus state
- [ ] Kontras warna & tap target mobile

### Fase 5 — Performance & Deploy [STATUS: belum mulai]
- [ ] Lazy-load konten window berat
- [ ] next/image untuk optimasi gambar
- [ ] Metadata SEO (title, description, OG image)
- [ ] Fallback non-JS untuk crawler
- [ ] Deploy ke Vercel + custom domain

## Yang Sengaja Di-skip (scope realistis untuk portfolio)
- Virtual file system
- Auth/multi-user (kecuali nanti diputuskan perlu preferensi wallpaper/pinned apps per user via localStorage — ini gampang ditambah kapan saja)
- App sandboxing/iframe isolation (semua app = component sendiri, bukan kode pihak ketiga)
- Install/uninstall app dinamis dari user luar

## Catatan Kerja
- Kerjakan SATU FASE SEKALIGUS, jangan lompat ke fase berikutnya sebelum fase sebelumnya saya konfirmasi selesai/oke
- Setiap selesai satu fase, update checklist di atas dan tanya konfirmasi sebelum lanjut
- Wallpaper pakai gradient placeholder dulu — nanti saya kasih gambar sendiri untuk diganti
