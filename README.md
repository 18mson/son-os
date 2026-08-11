# 💻 Son-OS — Hybrid ChromeOS & Aluminium OS Web Desktop & Portfolio

**Son-OS** adalah web portfolio interaktif berbasis desktop yang mengadopsi estetika **ChromeOS** dan visi **Aluminium OS** (penerus ChromeOS dengan integrasi Android desktop). Dilengkapi dengan *window manager* serbaguna, *floating app dock* & *status tray* independen, *desktop widgets & shortcuts*, *quick settings panel*, serta dukungan aplikasi internal maupun *iframe preview*.

---

## 🚀 Fitur Utama & Konten

### 1. 🪟 Desktop Window Manager
- **Draggable & Resizable Window**: Window aplikasi dapat digeser (*drag*) dan diatur posisinya dengan mulus.
- **Window Controls**: Dukungan tombol **Minimize**, **Maximize/Restore**, dan **Close**.
- **Double-Click Titlebar Snap**: Mengklasifikasikan aksi *double-click* titlebar atau *drag to top edge* untuk memaksimalkan (*maximize*) window.
- **Dynamic Z-Index Layering**: Window yang diklik otomatis berada di tumpukan paling atas.
- **Mobile Responsive Auto-Fullscreen**: Di layar perangkat seluler (< 768px), window yang dibuka otomatis berukuran penuh (*fullscreen*) tanpa mengganggu navigasi.

### 2. ⛵ Floating Dual-Cluster Shelf (App Dock & Status Tray)
- **App Dock (Center-Bottom)**: Floating glass pill di tengah-bawah layar berisi tombol launcher, *pinned apps*, dan *running app indicators* khas ChromeOS.
- **Drag & Drop Reorder Shelf**: Urutan aplikasi yang disematkan (*pinned apps*) di dock dapat di-drag dan otomatis tersimpan ke `localStorage`.
- **Status Tray (Fixed Bottom-Right)**: Floating status pill independen di pojok kanan-bawah berisi jam, tanggal, indikator Wi-Fi, dan baterai.
- **ChromeOS Active Running Indicator**: Indikator dot / bar biru khas ChromeOS untuk menandai aplikasi yang sedang aktif atau di-minimize.

### 3. 🔔 Interactive Quick Settings Panel
- **Anchored Floating Panel**: Mengklik Status Tray di pojok kanan-bawah membuka panel Quick Settings melayang.
- **Quick Controls**: Toggle suara sistem (mute/unmute), ganti tema wallpaper secara instan, status koneksi Wi-Fi & indikator baterai, serta shortcut langsung ke Settings App.
- **Auto-Dismiss Backdrop**: Klik di luar panel otomatis menutup Quick Settings.

### 4. 🖥️ Aluminium OS Desktop Layer (Widgets & Shortcuts)
- **Desktop Widgets (Info-at-a-Glance)**:
  - **Clock Widget** — Jam digital besar + tanggal di desktop (klik untuk membuka Clock App).
  - **Weather Widget** — Suhu real-time + kondisi cuaca terhubung ke Open-Meteo API (klik untuk membuka Weather App).
- **Interactive Desktop Shortcuts**:
  - Pengguna dapat menambahkan shortcut aplikasi dari launcher ke desktop ("Add to Desktop").
  - Shortcut dapat di-drag bebas dan posisinya (`x,y`) tersimpan permanen di `localStorage`.
  - Double-click shortcut untuk membuka aplikasi, atau klik kanan untuk hapus shortcut.
- **Marquee Selection Box (Multi-Select)**: Melakukan *click & drag* pointer di area kosong desktop menggambar kotak seleksi semi-transparan untuk men-select shortcut.

### 5. 📣 System Notification Toast System
- **ChromeOS Toast Notification**: Notifikasi melayang bergaya OS asli yang muncul otomatis saat pengguna mengubah preferensi (Pin/Unpin App, Tambah Shortcut, Ganti Wallpaper, Mute Audio).

### 6. 🚀 Application Launcher Overlay
- **Live Search Bar**: Pencarian aplikasi & proyek secara real-time berdasarkan judul dan deskripsi.
- **Keyboard Auto-focus**: Input pencarian otomatis aktif saat launcher dibuka.
- **Context Menu Integration**: Klik kanan pada item launcher untuk langsung **"Pin to Shelf"** atau **"Tambah ke Desktop"**.
- **AnimatePresence**: Animasi smooth saat launcher dibuka atau ditutup.

### 7. 🖱️ Right-Click Desktop Context Menu
- **Ganti Wallpaper**: Pilihan wallpaper dinamis (*Dark Minimal*, *Deep Ocean*, *Sunset Glow*, *Emerald Forest*) dengan animasi ambient glow.
- **Aksi Cepat**: Buka launcher, tutup semua window sekaligus, dan lihat informasi "Tentang Son-OS".
- **Klik Luar Auto-close**: Menu konteks otomatis menutup saat pengguna mengklik area luar.

### 8. 📱 Aplikasi Terintegrasi (Apps Content)
- ⚙️ **Settings App**: Pengaturan wallpaper desktop, toggle audio efek, reset preferensi OS (`localStorage.clear()`), dan informasi sistem.
- 🌤️ **Weather App**: Aplikasi prakiraan cuaca real-time terhubung ke Open-Meteo API dengan preset kota populer.
- 🕐 **Clock App**: Jam digital & analog, stopwatch dengan fitur lap, dan countdown timer.
- 🧮 **Calculator App**: Kalkulator standar OS dengan operasi aritmatika & dukungan input keyboard.
- 📝 **Notes App**: Catatan cepat dengan fitur simpan otomatis (*auto-save*) ke `localStorage`, pencarian, dan pilihan warna aksen.
- 📅 **Calendar App**: Grid kalender bulanan dengan navigasi, penanda hari ini, dan manajemen jadwal acara / pengingat.
- 🎵 **Music Player App**: Mini audio player dengan koleksi lagu lofi/ambient, equalizer animasi, dan kontrol playback.
- 🖼️ **Gallery App**: Galeri desain & portofolio dengan filter kategori dan tampilan lightbox interaktif (zoom, rotasi, download).
- 💻 **Terminal App**: Terminal CLI interaktif dengan dukungan perintah (`help`, `whoami`, `skills`, `apps`, `open <app>`, `clear`, `date`).
- 🎨 **Paint App**: Kanvas corat-coret bebas dengan pilihan warna kustom, eraser, ukuran kuas, undo, dan ekspor PNG.
- 🎮 **Snake Game App**: Game retro klasik Snake dengan papan skor tertinggi (*high score*) berbasis `localStorage`.
- 🌐 **Japanese Quiz App**: Aplikasi kuis kosakata & kana bahasa Jepang interaktif dengan fitur multiplayer battleground (terhubung via *iframe preview* & fallback timeout loader).
- 💍 **Lovely Ever App**: Platform SaaS undangan pernikahan digital & event management (terhubung via *iframe preview*).
- 👤 **About Me App**: Profil Sony sebagai Fullstack Software Engineer, mencakup bidang fokus, keahlian, dan pengalamannya.
- ✉️ **Contact App**: Formulir pesan interaktif langsung bagi calon klien atau kolaborator.

### 9. ⌨️ Keyboard Shortcuts & Aksesibilitas
- <kbd>Esc</kbd>: Menutup launcher atau window aktif.
- <kbd>Alt</kbd> + <kbd>Space</kbd> / <kbd>Ctrl</kbd> + <kbd>Space</kbd>: Toggle buka/tutup Application Launcher.
- **Focus Visible State**: Ring fokus yang jelas (`focus-visible:ring-2`) untuk navigasi keyboard yang ramah aksesibilitas.
- **SEO & Crawler Fallback**: Metadata SEO lengkap (OpenGraph, Twitter Card) agar konten utama dapat diindeks oleh mesin pencari.

---

## 📁 Struktur Direktori Web (Project Structure)

```
son-os/
├── public/                     # Static assets (SVG icons, favicons)
├── src/
│   ├── app/                    # Next.js App Router (Page & Layout)
│   │   ├── globals.css         # Styling utama & utility Tailwind CSS v4
│   │   ├── layout.tsx          # Root Layout & Metadata SEO
│   │   └── page.tsx            # Home Entrypoint (Desktop view)
│   ├── components/             # Komponen UI Web Desktop
│   │   ├── apps/               # Komponen Konten Aplikasi (Settings, Terminal, Weather, dll)
│   │   ├── widgets/            # Widget Desktop (ClockWidget, WeatherWidget)
│   │   ├── AppContent.tsx      # Dynamic Loader & Switcher aplikasi
│   │   ├── AppIcon.tsx         # Component rendering icon Lucide
│   │   ├── BootScreen.tsx      # Animasi startup/booting Son-OS
│   │   ├── ContextMenu.tsx     # Context menu klik kanan desktop
│   │   ├── Desktop.tsx         # Desktop environment, selection box, & wallpaper layer
│   │   ├── DesktopShortcut.tsx # Component icon shortcut desktop (draggable)
│   │   ├── Launcher.tsx        # App Launcher overlay & search
│   │   ├── QuickSettingsPanel.tsx # Floating Quick Settings panel system tray
│   │   ├── Shelf.tsx           # ChromeOS Floating App Dock & Status Tray
│   │   ├── SystemNotificationToast.tsx # System toast notification floating banner
│   │   └── Window.tsx          # Window container manager (drag/resize/maximize)
│   ├── config/
│   │   └── appsConfig.ts       # Re-export aplikasi terdaftar
│   ├── data/
│   │   └── apps.ts             # Definisi daftar aplikasi & propertinya
│   └── store/
│       └── windowStore.ts      # State management global (Zustand)
├── .gitignore                  # Aturan git ignore
├── next.config.ts              # Konfigurasi Next.js
├── package.json                # Project dependencies
├── postcss.config.mjs          # Konfigurasi PostCSS
├── tsconfig.json               # Konfigurasi TypeScript
└── vercel.json                 # Konfigurasi deploy Vercel
```

---

## 🛠️ Teknologi yang Digunakan (Tech Stack)

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Animation**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 💻 Cara Menjalankan Secara Lokal

1. **Clone repository ini**:
   ```bash
   git clone https://github.com/18mson/son-os.git
   cd son-os
   ```

2. **Install dependensi**:
   ```bash
   npm install
   ```

3. **Jalankan development server**:
   ```bash
   npm run dev
   ```

4. Buka browser di `http://localhost:3000`.

---

## 🚢 Deploy ke Vercel

Aplikasi ini dioptimalkan untuk di-deploy ke **Vercel**:

```bash
npm run build
```

Atau lakukan koneksi repositori GitHub ke akun Vercel untuk otomatisasi *Continuous Deployment* (CD).
