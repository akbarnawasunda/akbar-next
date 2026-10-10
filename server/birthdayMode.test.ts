/**
 * Kontrak jam studio (WIB) dan mode ulang tahun 1 November.
 *
 * Dua hal yang dijaga di sini:
 * 1. Perhitungan tanggal memakai zona Asia/Jakarta, bukan zona perangkat —
 *    diuji dengan instan absolut supaya hasilnya sama di runner mana pun.
 * 2. Perayaan tanggal 1 November menyala sendiri tiap tahun, hanya pada hari
 *    itu, dan tidak pernah ikut ter-render di HTML hasil SSR (tidak ada
 *    hydration mismatch, tidak ada tanggal basi untuk crawler).
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  BIRTHDAY_DAY,
  BIRTHDAY_MONTH,
  isBirthday,
  jakartaDateLabel,
  jakartaParts,
  jakartaTimeLabel,
  jakartaWeekdayIndex,
  msUntilJakartaMidnight,
} from "../client/src/lib/jakartaTime";
import { render } from "./test-renderer";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

/** Instan absolut untuk pukul `hour:minute` WIB pada tanggal tertentu. */
function wib(
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
  second = 0,
  millisecond = 0
) {
  return new Date(
    Date.UTC(year, month - 1, day, hour - 7, minute, second, millisecond)
  );
}

describe("jam studio WIB", () => {
  it("membaca komponen tanggal dan jam menurut Asia/Jakarta", () => {
    const noonUtc = new Date("2026-06-14T05:00:00Z"); // 12.00 WIB
    expect(jakartaParts(noonUtc)).toMatchObject({
      year: 2026,
      month: 6,
      day: 14,
      hour: 12,
      minute: 0,
      second: 0,
    });
    expect(jakartaTimeLabel(noonUtc)).toBe("12.00.00");

    const midnight = wib(2026, 6, 14, 0, 5, 9);
    expect(jakartaTimeLabel(midnight)).toBe("00.05.09"); // bukan "24.05.09"
    expect(jakartaParts(midnight).hour).toBe(0);
  });

  it("memakai nama hari dan tanggal berbahasa Indonesia", () => {
    const sunday = wib(2026, 6, 14); // Minggu
    expect(jakartaWeekdayIndex(sunday)).toBe(0);
    expect(jakartaDateLabel(sunday, "id")).toBe("Minggu, 14 Juni 2026");
    expect(jakartaDateLabel(sunday, "en")).toBe("Sun, 14 Jun 2026");
  });

  it("menghitung sisa waktu sampai tengah malam Jakarta", () => {
    const late = wib(2026, 6, 14, 23, 59, 59, 500);
    expect(msUntilJakartaMidnight(late)).toBe(500);

    const early = wib(2026, 6, 14, 0, 0, 0, 0);
    expect(msUntilJakartaMidnight(early)).toBe(86_400_000);

    // Sisa waktu selalu membawa kita tepat ke pergantian hari Jakarta.
    for (const at of [wib(2026, 1, 1, 3, 21, 7), wib(2026, 11, 1, 12, 0, 0)]) {
      const next = jakartaParts(new Date(at.valueOf() + msUntilJakartaMidnight(at)));
      expect([next.hour, next.minute, next.second]).toEqual([0, 0, 0]);
    }
  });
});

describe("mode ulang tahun 1 November", () => {
  it("hanya menyala pada tanggal 1 November waktu Jakarta", () => {
    expect(isBirthday(wib(2026, 11, 1))).toBe(true);
    expect(isBirthday(wib(2026, 11, 1, 23, 59, 59))).toBe(true);
    expect(isBirthday(wib(2026, 10, 31, 23, 59, 59))).toBe(false);
    expect(isBirthday(wib(2026, 11, 2, 0, 0, 1))).toBe(false);
    expect(isBirthday(wib(2026, 11, 30, 12, 0, 0))).toBe(false);
  });

  it("memakai batas hari Jakarta, bukan batas UTC", () => {
    // 1 November 00.00 WIB = 31 Oktober 17.00 UTC.
    expect(isBirthday(new Date("2026-10-31T16:59:59Z"))).toBe(false);
    expect(isBirthday(new Date("2026-10-31T17:00:00Z"))).toBe(true);
    // 1 November 23.59 WIB = 1 November 16.59 UTC; lewat itu sudah 2 November.
    expect(isBirthday(new Date("2026-11-01T16:59:59Z"))).toBe(true);
    expect(isBirthday(new Date("2026-11-01T17:00:00Z"))).toBe(false);
  });

  it("menyala otomatis tiap tahun tanpa diubah manual", () => {
    for (let year = 2026; year <= 2035; year += 1) {
      expect(isBirthday(wib(year, BIRTHDAY_MONTH, BIRTHDAY_DAY, 9, 30)), String(year)).toBe(true);
      expect(isBirthday(wib(year, BIRTHDAY_MONTH, BIRTHDAY_DAY, 0, 0)), String(year)).toBe(true);
      expect(isBirthday(wib(year, 4, 21, 9, 30)), String(year)).toBe(false);
    }
  });
});

describe("jam dan perayaan tidak ikut ter-render di server", () => {
  it("mengirim placeholder statis, bukan jam yang bisa basi", async () => {
    const { html } = await render("/", { documents: async () => [] as never });

    expect(html).toContain("data-studio-clock");
    expect(html).toContain("--.--.--");
    // Aksen ulang tahun dan ucapannya hanya hidup setelah mount di klien.
    expect(html).not.toContain('data-birthday="on"');
    expect(html).not.toContain("data-birthday-note");
    expect(html).not.toContain("Hari ini ulang tahun");
    // Slot jam masih placeholder, belum ada detikan yang terkirim ke crawler.
    expect(html).toMatch(/<span class="nf-clock__time">--\.--\.--<\/span>/);
  });
});

describe("splash with live Jakarta clock and birthday accent", () => {
  const preloader = read("app/_components/Preloader.tsx");
  const preloaderScript = read("public/assets/js/preloader.js");

  it("shows the live Jakarta clock and current date", () => {
    expect(preloader).toContain("an-splash-clock");
    expect(preloaderScript).toContain("Asia/Jakarta");
    expect(preloader).toContain("an-splash-date");
    expect(preloaderScript).toContain("setInterval(paintTime, 1000)");
  });

  it("keeps visual progress but does not print elapsed numbers", () => {
    expect(preloader).toContain("an-splash-meter-fill");
    expect(preloaderScript).toContain("paintProgress");
    expect(preloader).not.toContain("an-splash-elapsed");
    expect(preloaderScript).not.toContain("an-splash-elapsed");
    expect(preloaderScript).not.toContain("toFixed(1)");
  });

  it("prepares the November 1 birthday accent in both locales", () => {
    expect(preloader).toContain("an-splash-birthday");
    expect(preloader).toContain("01 November");
    expect(preloaderScript).toMatch(/stamp\.month === 11 && stamp\.day === 1/);
    expect(preloaderScript).toContain('setAttribute("data-birthday", "on")');
  });
});
