import { useEffect, useState } from "react";
import {
  birthdayLabelForYear,
  isBirthday,
  jakartaClockLabel,
  jakartaDateLabel,
  jakartaParts,
  jakartaTimeLabel,
  msUntilJakartaMidnight,
} from "@/lib/jakartaTime";
import "./StudioClock.css";

/**
 * Jam studio + mode ulang tahun.
 *
 * Semua nilai waktu dihitung di klien setelah halaman ter-mount. Render
 * pertama (termasuk HTML dari SSR) sengaja tidak memuat jam, jadi tidak ada
 * hydration mismatch dan tidak ada jam basi yang ikut terkirim ke crawler.
 */

/** Jam Jakarta yang hidup. `null` di server dan pada render pertama. */
export function useJakartaNow(intervalMs = 1000): Date | null {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();

    const timer = window.setInterval(() => {
      if (!document.hidden) tick();
    }, intervalMs);

    // Tab kembali aktif: langsung segarkan, jangan menunggu tick berikutnya.
    const onVisible = () => {
      if (!document.hidden) tick();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [intervalMs]);

  return now;
}

/**
 * Apakah sekarang 1 November di Jakarta? Diperiksa ulang tepat setelah
 * tengah malam Jakarta, jadi mode ini menyala dan padam sendiri tanpa
 * reload dan tanpa perlu diubah manual tiap tahun.
 */
export function useBirthdayMode(): boolean {
  const [active, setActive] = useState(false);

  useEffect(() => {
    let timer = 0;

    const check = () => {
      const now = new Date();
      setActive(isBirthday(now));
      timer = window.setTimeout(check, msUntilJakartaMidnight(now) + 1000);
    };

    check();
    return () => window.clearTimeout(timer);
  }, []);

  return active;
}

/** Menandai <html> supaya CSS bisa menyisipkan aksen hari ulang tahun. */
export function BirthdayMode() {
  const active = useBirthdayMode();

  useEffect(() => {
    const root = document.documentElement;
    if (active) root.dataset.birthday = "on";
    else delete root.dataset.birthday;
    return () => {
      delete root.dataset.birthday;
    };
  }, [active]);

  return null;
}

/**
 * Jam studio: tanggal + jam Jakarta yang berdetak tiap detik.
 * `aria-hidden` karena pembaca layar tidak perlu dibacakan tiap detik —
 * keterangan statisnya sudah ada di `title`.
 */
export function StudioClock({ locale = "id" }: { locale?: "id" | "en" }) {
  const now = useJakartaNow(1000);

  return (
    <span
      className="nf-clock"
      data-studio-clock
      aria-hidden="true"
      title={
        now
          ? jakartaClockLabel(now, locale)
          : locale === "en"
            ? "Bandung Barat studio time (WIB)"
            : "Waktu studio Bandung Barat (WIB)"
      }
    >
      <span className="nf-clock__pulse" />
      <span className="nf-clock__date">
        {now ? jakartaDateLabel(now, locale) : "Bandung Barat · WIB"}
      </span>
      <span className="nf-clock__time">
        {now ? jakartaTimeLabel(now) : "--.--.--"}
      </span>
    </span>
  );
}

/** Lencana kecil untuk header. */
export function BirthdayChip({ locale = "id" }: { locale?: "id" | "en" }) {
  const active = useBirthdayMode();
  if (!active) return null;

  return (
    <span className="nf-birthday-chip" data-birthday-chip>
      <span aria-hidden="true">✦</span>
      {locale === "en"
        ? "Akbar's birthday · 01 Nov"
        : "Ulang tahun Akbar · 01 Nov"}
    </span>
  );
}

/** Satu baris ucapan di hero beranda / footer. */
export function BirthdayNote({ locale = "id" }: { locale?: "id" | "en" }) {
  const active = useBirthdayMode();
  if (!active) return null;

  const now = new Date();
  const year = jakartaParts(now).year;

  return (
    <p className="nf-birthday-note" data-birthday-note>
      <span className="nf-birthday-note__rule" aria-hidden="true" />
      {locale === "en"
        ? `Today is Akbar Nawasunda's birthday — ${birthdayLabelForYear(year)}. Thank you for listening.`
        : `Hari ini ulang tahun Akbar Nawasunda — ${birthdayLabelForYear(year)}. Terima kasih sudah mendengarkan.`}
    </p>
  );
}
