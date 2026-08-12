export interface CalendarEvent {
  id: string;
  dateKey: string; // YYYY-MM-DD
  title: string;
  time?: string;
}

export interface PublicHoliday {
  date: string;
  description: string;
  isCuti?: boolean;
  hijriInfo?: string;
}

export const INDONESIAN_HOLIDAYS: Record<string, { description: string; isCuti?: boolean; hijriInfo?: string }> = {
  // --- TAHUN 2026 ---
  "2026-01-01": { description: "Tahun Baru 2026 Masehi 🎆" },
  "2026-01-16": { description: "Isra Mi'raj Nabi Muhammad SAW 🕌", hijriInfo: "27 Rajab 1447 H" },
  "2026-02-16": { description: "Cuti Bersama Tahun Baru Imlek 2577 Kongzili 🧧", isCuti: true },
  "2026-02-17": { description: "Tahun Baru Imlek 2577 Kongzili 🧧" },
  "2026-02-18": { description: "Awal Puasa Ramadan 1447 H 🌙", hijriInfo: "1 Ramadan 1447 H" },
  "2026-03-06": { description: "Nuzulul Qur'an 📖", hijriInfo: "17 Ramadan 1447 H" },
  "2026-03-18": { description: "Cuti Bersama Hari Suci Nyepi Saka 1948 🪷", isCuti: true },
  "2026-03-19": { description: "Hari Suci Nyepi Tahun Baru Saka 1948 🪷" },
  "2026-03-20": { description: "Hari Raya Idul Fitri 1447 H 🌙 (Cuti Bersama)", isCuti: true, hijriInfo: "1 Syawal 1447 H" },
  "2026-03-21": { description: "Hari Raya Idul Fitri 1447 H 🌙", hijriInfo: "2 Syawal 1447 H" },
  "2026-03-22": { description: "Hari Raya Idul Fitri 1447 H 🌙 (Cuti Bersama)", isCuti: true },
  "2026-03-23": { description: "Cuti Bersama Hari Raya Idul Fitri 1447 H 🌙", isCuti: true },
  "2026-03-24": { description: "Cuti Bersama Hari Raya Idul Fitri 1447 H 🌙", isCuti: true },
  "2026-04-03": { description: "Wafat Yesus Kristus / Jumat Agung ✝️" },
  "2026-04-05": { description: "Kebangkitan Yesus Kristus (Paskah) ✝️" },
  "2026-05-01": { description: "Hari Buruh Internasional 🛠️" },
  "2026-05-14": { description: "Kenaikan Yesus Kristus ✝️" },
  "2026-05-15": { description: "Cuti Bersama Kenaikan Yesus Kristus ✝️", isCuti: true },
  "2026-05-26": { description: "Hari Arafah 🕋", hijriInfo: "9 Zulhijah 1447 H" },
  "2026-05-27": { description: "Hari Raya Idul Adha 1447 H 🕋", hijriInfo: "10 Zulhijah 1447 H" },
  "2026-05-28": { description: "Cuti Bersama Hari Raya Idul Adha 1447 H 🕋", isCuti: true },
  "2026-05-31": { description: "Hari Raya Waisak 2570 BE 🪷" },
  "2026-06-01": { description: "Hari Lahir Pancasila 🇮🇩" },
  "2026-06-16": { description: "Tahun Baru Islam 1448 H 🕌", hijriInfo: "1 Muharam 1448 H" },
  "2026-06-24": { description: "Hari Tasua 🕌", hijriInfo: "9 Muharam 1448 H" },
  "2026-06-25": { description: "Hari Asyuro 🕌", hijriInfo: "10 Muharam 1448 H" },
  "2026-08-17": { description: "Hari Kemerdekaan Republik Indonesia 🇮🇩" },
  "2026-08-25": { description: "Maulid Nabi Muhammad SAW 🕌", hijriInfo: "12 Rabiulawal 1448 H" },
  "2026-12-24": { description: "Cuti Bersama Hari Raya Natal 🎄", isCuti: true },
  "2026-12-25": { description: "Hari Raya Natal 🎄" },

  // --- TAHUN 2025 ---
  "2025-01-01": { description: "Tahun Baru 2025 Masehi 🎆" },
  "2025-01-27": { description: "Isra Mi'raj Nabi Muhammad SAW 🕌", hijriInfo: "27 Rajab 1446 H" },
  "2025-01-28": { description: "Cuti Bersama Tahun Baru Imlek 2576 Kongzili 🧧", isCuti: true },
  "2025-01-29": { description: "Tahun Baru Imlek 2576 Kongzili 🧧" },
  "2025-03-01": { description: "Awal Puasa Ramadan 1446 H 🌙", hijriInfo: "1 Ramadan 1446 H" },
  "2025-03-17": { description: "Nuzulul Qur'an 📖", hijriInfo: "17 Ramadan 1446 H" },
  "2025-03-28": { description: "Cuti Bersama Hari Suci Nyepi Saka 1947 🪷", isCuti: true },
  "2025-03-29": { description: "Hari Suci Nyepi Tahun Baru Saka 1947 🪷" },
  "2025-03-30": { description: "Hari Raya Idul Fitri 1446 H 🌙", hijriInfo: "1 Syawal 1446 H" },
  "2025-03-31": { description: "Hari Raya Idul Fitri 1446 H 🌙", hijriInfo: "2 Syawal 1446 H" },
  "2025-04-01": { description: "Cuti Bersama Hari Raya Idul Fitri 1446 H 🌙", isCuti: true },
  "2025-04-02": { description: "Cuti Bersama Hari Raya Idul Fitri 1446 H 🌙", isCuti: true },
  "2025-04-03": { description: "Cuti Bersama Hari Raya Idul Fitri 1446 H 🌙", isCuti: true },
  "2025-04-04": { description: "Cuti Bersama Hari Raya Idul Fitri 1446 H 🌙", isCuti: true },
  "2025-04-18": { description: "Wafat Yesus Kristus / Jumat Agung ✝️" },
  "2025-04-20": { description: "Kebangkitan Yesus Kristus (Paskah) ✝️" },
  "2025-05-01": { description: "Hari Buruh Internasional 🛠️" },
  "2025-05-12": { description: "Hari Raya Waisak 2569 BE 🪷" },
  "2025-05-13": { description: "Cuti Bersama Hari Raya Waisak 2569 BE 🪷", isCuti: true },
  "2025-05-29": { description: "Kenaikan Yesus Kristus ✝️" },
  "2025-05-30": { description: "Cuti Bersama Kenaikan Yesus Kristus ✝️", isCuti: true },
  "2025-06-01": { description: "Hari Lahir Pancasila 🇮🇩" },
  "2025-06-05": { description: "Hari Arafah 🕋", hijriInfo: "9 Zulhijah 1446 H" },
  "2025-06-06": { description: "Hari Raya Idul Adha 1446 H 🕋", hijriInfo: "10 Zulhijah 1446 H" },
  "2025-06-09": { description: "Cuti Bersama Hari Raya Idul Adha 1446 H 🕋", isCuti: true },
  "2025-06-26": { description: "Tahun Baru Islam 1447 H 🕌", hijriInfo: "1 Muharam 1447 H" },
  "2025-08-17": { description: "Hari Kemerdekaan Republik Indonesia 🇮🇩" },
  "2025-08-18": { description: "Cuti Bersama Hari Kemerdekaan RI 🇮🇩", isCuti: true },
  "2025-09-04": { description: "Maulid Nabi Muhammad SAW 🕌", hijriInfo: "12 Rabiulawal 1447 H" },
  "2025-12-25": { description: "Hari Raya Natal 🎄" },
  "2025-12-26": { description: "Cuti Bersama Hari Raya Natal 🎄", isCuti: true },
};

export const DEFAULT_EVENTS: CalendarEvent[] = [
  {
    id: "evt-1",
    dateKey: new Date().toISOString().split("T")[0],
    title: "Peluncuran Son-OS Web Desktop 🚀",
    time: "10:00 AM",
  },
  {
    id: "evt-2",
    dateKey: new Date().toISOString().split("T")[0],
    title: "Review Fitur Built-in Apps & Widgets 📱",
    time: "02:30 PM",
  },
];
