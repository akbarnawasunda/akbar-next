/**
 * Waktu studio — Bandung Barat, WIB (Asia/Jakarta).
 *
 * Situs ini dipakai dari banyak zona waktu, jadi tanggal dan jam selalu
 * dihitung memakai zona Asia/Jakarta (tanpa bergantung pada zona perangkat
 * pengunjung). Modul ini murni dan bebas DOM supaya bisa diuji langsung
 * maupun dipakai dari komponen React (lihat `StudioClock.tsx`).
 */

export const JAKARTA_TIME_ZONE = "Asia/Jakarta";

/** Mode ulang tahun: hanya tanggal 1 November (waktu Jakarta), tiap tahun. */
export const BIRTHDAY_MONTH = 11;
export const BIRTHDAY_DAY = 1;

export type JakartaParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  /** Nama hari bahasa Inggris dari Intl ("Sunday"), dipakai untuk aritmetika. */
  weekday: string;
};

const partsFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: JAKARTA_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
  weekday: "long",
});

const WEEKDAY_TO_INDEX: Record<string, number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

/** Pecah satu instan menjadi komponen tanggal/jam menurut zona Jakarta. */
export function jakartaParts(date: Date): JakartaParts {
  const lookup: Record<string, string> = {};
  for (const part of partsFormatter.formatToParts(date)) {
    if (part.type !== "literal") lookup[part.type] = part.value;
  }
  return {
    year: Number(lookup.year),
    month: Number(lookup.month),
    day: Number(lookup.day),
    hour: Number(lookup.hour) % 24, // sebagian ICU memakai "24" untuk tengah malam
    minute: Number(lookup.minute),
    second: Number(lookup.second),
    weekday: lookup.weekday ?? "Sunday",
  };
}

/** Indeks hari (0 = Minggu) menurut kalender Jakarta. */
export function jakartaWeekdayIndex(date: Date): number {
  return WEEKDAY_TO_INDEX[jakartaParts(date).weekday] ?? 0;
}

/**
 * Apakah instan ini jatuh pada 1 November di Jakarta?
 * Dibandingkan per komponen tanggal, bukan per offset milidetik, supaya
 * pergantian hari tetap tepat walau offset WIB (+07:00) tidak ber-DST.
 */
export function isBirthday(date: Date = new Date()): boolean {
  const parts = jakartaParts(date);
  return parts.month === BIRTHDAY_MONTH && parts.day === BIRTHDAY_DAY;
}

/** tanggal ulang tahun untuk tahun Jakarta berjalan, mis. "01 November 2026". */
export function birthdayLabelForYear(year: number): string {
  return `${String(BIRTHDAY_DAY).padStart(2, "0")} November ${year}`;
}

/** Sisa milidetik sampai tengah malam Jakarta berikutnya. */
export function msUntilJakartaMidnight(date: Date = new Date()): number {
  const parts = jakartaParts(date);
  const elapsed =
    ((parts.hour * 60 + parts.minute) * 60 + parts.second) * 1000 +
    date.getMilliseconds();
  return Math.max(0, 86_400_000 - elapsed);
}

const dateFormatters = {
  id: new Intl.DateTimeFormat("id-ID", {
    timeZone: JAKARTA_TIME_ZONE,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }),
  en: new Intl.DateTimeFormat("en-GB", {
    timeZone: JAKARTA_TIME_ZONE,
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }),
} as const;

/** "Sabtu, 3 Oktober 2026" (id) / "Sat, 03 Oct 2026" (en). */
export function jakartaDateLabel(
  date: Date,
  locale: "id" | "en" = "id"
): string {
  return dateFormatters[locale].format(date);
}

/** "14.03.21" — jam 24 jam dengan titik, bukan titik dua. */
export function jakartaTimeLabel(date: Date): string {
  const { hour, minute, second } = jakartaParts(date);
  return [hour, minute, second]
    .map(value => String(value).padStart(2, "0"))
    .join(".");
}

/** Satu baris lengkap untuk footer: "Sabtu, 3 Oktober 2026 · 14.03.21 WIB". */
export function jakartaClockLabel(
  date: Date,
  locale: "id" | "en" = "id"
): string {
  return `${jakartaDateLabel(date, locale)} · ${jakartaTimeLabel(date)} WIB`;
}
