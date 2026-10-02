/**
 * Image system — satu sumber kebenaran untuk gambar publik.
 *
 * Tujuan: situs ini akan memakai banyak fotografi dan artwork, jadi setiap
 * gambar harus punya (1) ukuran intrinsik supaya layout tidak bergeser,
 * (2) kandidat ukuran/format yang benar untuk lebar layar, (3) urutan fallback
 * yang jelas kalau sumber CMS gagal, dan (4) aturan prioritas unduh yang
 * eksplisit (hero boleh `eager`, sisanya `lazy`).
 *
 * Semua data di bawah ini diturunkan dari asset lokal yang benar-benar ada.
 * Jangan menambah entri tanpa memverifikasi file-nya; entri palsu membuat
 * gambar gagal muat di production.
 */

/** Ukuran intrinsik asset lokal (px). Diukur dari header file, bukan tebakan. */
export const INTRINSIC_SIZES: Record<string, readonly [number, number]> = {
  "/assets/akbar-editorial-stage-bg.webp": [1600, 900],
  "/assets/akbar-future-red.webp": [667, 1000],
  "/assets/akbar-future-yellow.webp": [800, 1000],
  "/assets/akbar-logo.webp": [512, 357],
  "/assets/akbar-logo-fallback.webp": [1000, 1000],
  "/assets/akbar-mascot-doodle.webp": [420, 420],
  "/assets/akbar-nawasunda-official-portrait-1000.webp": [800, 1000],
  "/assets/akbar-nawasunda-official-portrait.jpg": [1122, 1402],
  "/assets/akbar-nawasunda-official-portrait.webp": [1122, 1402],
  "/assets/akbar-night-frequency-hero-mobile-optimized.webp": [900, 900],
  "/assets/akbar-night-frequency-hero-optimized.webp": [1800, 1800],
  "/assets/akbar-night-frequency-stage-mobile-optimized.webp": [900, 900],
  "/assets/akbar-night-frequency-stage-optimized.webp": [1440, 1440],
  "/assets/akbar-official-portrait-optimized.webp": [720, 900],
  "/assets/akbar-rmx-mark.webp": [900, 900],
  "/assets/akbar-social-preview-optimized.webp": [1000, 1000],
  "/assets/akbar-social-preview.webp": [1000, 1000],
};

/**
 * Versi ringan untuk layar ≤640px. Dipakai `<picture>` lewat media query,
 * jadi perangkat mobile tidak pernah mengunduh artwork desktop penuh.
 */
export const MOBILE_VARIANTS: Record<string, string> = {
  "/assets/akbar-night-frequency-stage-optimized.webp":
    "/assets/akbar-night-frequency-stage-mobile-optimized.webp",
  "/assets/akbar-night-frequency-stage.webp":
    "/assets/akbar-night-frequency-stage-mobile-optimized.webp",
  "/assets/akbar-night-frequency-hero-optimized.webp":
    "/assets/akbar-night-frequency-hero-mobile-optimized.webp",
  "/assets/akbar-night-frequency-hero.webp":
    "/assets/akbar-night-frequency-hero-mobile-optimized.webp",
  "/assets/akbar-nawasunda-official-portrait.webp":
    "/assets/akbar-official-portrait-optimized.webp",
  "/assets/akbar-nawasunda-official-portrait.jpg":
    "/assets/akbar-official-portrait-optimized.webp",
  "/assets/akbar-official-portrait.webp":
    "/assets/akbar-official-portrait-optimized.webp",
  "/assets/akbar-social-preview.webp":
    "/assets/akbar-social-preview-optimized.webp",
};

/**
 * Kandidat AVIF. Kosong selama belum ada file .avif di `client/public/assets`
 * (kecuali maskot). Isi hanya setelah file-nya benar-benar ada di repo.
 */
export const AVIF_VARIANTS: Record<string, string> = {
  "/assets/akbar-mascot-doodle.webp": "/assets/akbar-mascot-doodle.avif",
};

/** Preset `sizes` supaya setiap pemakaian gambar tidak menebak sendiri. */
export const IMAGE_SIZES = {
  hero: "100vw",
  full: "(max-width: 640px) 100vw, (max-width: 1180px) 92vw, 1180px",
  artwork: "(max-width: 640px) 76vw, (max-width: 1024px) 44vw, 420px",
  card: "(max-width: 640px) 46vw, (max-width: 1024px) 30vw, 320px",
  portrait: "(max-width: 640px) 100vw, (max-width: 900px) 70vw, 480px",
  thumbnail: "(max-width: 640px) 30vw, 160px",
} as const;

export type ImageSizePreset = keyof typeof IMAGE_SIZES;

const DEFAULT_BREAKPOINT = "(max-width: 640px)";

/**
 * Ukuran intrinsik artwork platform (URL jarak jauh).
 *
 * Dimensinya diturunkan dari pola URL yang penyedia memang pakai — bukan
 * tebakan: SoundCloud menaruh ukuran di sufiks nama file, mzstatic di segmen
 * path, Spotify selalu bujur sangkar (token 300 atau 640), dan YouTube punya
 * tabel tetap per varian. Dipakai supaya gambar artwork dari CMS tetap
 * mengirim `width`/`height` dan tidak menggeser layout saat datang.
 */
export function remoteIntrinsicSize(
  src?: string | null
): readonly [number, number] | undefined {
  if (!src) return undefined;

  if (/sndcdn\.com/.test(src)) {
    const sized = src.match(/-t(\d+)x(\d+)(?:\.\w+)?$/);
    if (sized) return [Number(sized[1]), Number(sized[2])];
    if (/\/avatars-/.test(src)) return [500, 500];
  }

  if (/i\.scdn\.co\/image\//.test(src)) {
    return /ab67616d00001e02/.test(src) ? [300, 300] : [640, 640];
  }

  if (/mzstatic\.com/.test(src)) {
    const sized = src.match(/\/(\d+)x(\d+)[a-z]{2}\.(?:jpg|jpeg|png|webp)$/i);
    if (sized) return [Number(sized[1]), Number(sized[2])];
  }

  if (/(?:ytimg\.com|youtube\.com)/.test(src)) {
    const variant = src.match(/\/(mq|hq|sd|maxres)default\.(?:jpg|jpeg|webp)$/i);
    if (variant) {
      const table = {
        mq: [320, 180],
        hq: [480, 360],
        sd: [640, 480],
        maxres: [1280, 720],
      } as const;
      return table[variant[1].toLowerCase() as keyof typeof table];
    }
  }

  return undefined;
}

export function intrinsicSize(src?: string | null) {
  if (!src) return undefined;
  return INTRINSIC_SIZES[src] ?? remoteIntrinsicSize(src);
}

/** Rasio lebar/tinggi dari ukuran intrinsik; `undefined` kalau tidak diketahui. */
export function aspectRatioOf(src?: string | null) {
  const size = intrinsicSize(src);
  return size ? `${size[0]} / ${size[1]}` : undefined;
}

/**
 * Kandidat `srcSet` dari varian yang benar-benar terdaftar. Hanya mengembalikan
 * nilai kalau ada lebih dari satu kandidat dengan lebar berbeda — `sizes` tanpa
 * `srcSet` adalah atribut mati (bug yang sebelumnya ada di dua komponen).
 */
export function srcSetFor(src?: string | null) {
  if (!src) return undefined;
  const candidates = new Map<string, number>([[src, intrinsicSize(src)?.[0] ?? 0]]);
  const mobile = MOBILE_VARIANTS[src];
  if (mobile) {
    const width = intrinsicSize(mobile)?.[0] ?? 0;
    if (width > 0) candidates.set(mobile, width);
  }
  const usable = [...candidates.entries()].filter(([, width]) => width > 0);
  if (usable.length < 2) return undefined;
  return usable
    .sort((a, b) => a[1] - b[1])
    .map(([url, width]) => `${url} ${width}w`)
    .join(", ");
}

/**
 * Sumber `<picture>` untuk lebar layar kecil. Mengembalikan daftar kosong
 * kalau varian mobile tidak ada, sehingga `<img src>` tetap dipakai.
 */
export function pictureSourcesFor(
  src?: string | null,
  breakpoint = DEFAULT_BREAKPOINT
) {
  if (!src) return [] as { srcSet: string; media: string; type?: string }[];
  const sources: { srcSet: string; media: string; type?: string }[] = [];
  const avif = AVIF_VARIANTS[src];
  if (avif) {
    sources.push({
      srcSet: `${avif} ${intrinsicSize(avif)?.[0] ?? ""}`.trim(),
      media: breakpoint,
      type: "image/avif",
    });
  }
  const mobile = MOBILE_VARIANTS[src];
  if (mobile) {
    sources.push({ srcSet: mobile, media: breakpoint, type: "image/webp" });
  }
  return sources;
}

/**
 * Urutan fallback: sumber utama → cadangan dari CMS → aset brand lokal.
 * Dikembalikan sebagai daftar tanpa duplikat supaya `onError` bisa berjalan
 * maju satu langkah setiap kali gagal.
 */
export function fallbackChain(
  src: string | undefined,
  backupSrc: string | undefined,
  localFallback: string
) {
  return [src, backupSrc, localFallback].filter(
    (value, index, list): value is string =>
      Boolean(value) && list.indexOf(value) === index
  );
}

/**
 * Aturan prioritas unduh. Hanya hero/above-the-fold yang boleh `eager`;
 * memanggil ini untuk gambar di bawah fold akan menunda LCP.
 */
export function loadingPolicy(priority: boolean) {
  return {
    loading: priority ? ("eager" as const) : ("lazy" as const),
    fetchPriority: priority ? ("high" as const) : ("auto" as const),
  };
}
