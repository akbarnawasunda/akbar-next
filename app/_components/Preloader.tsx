/**
 * Splash pembuka (first-paint, pra-hydration).
 *
 * Markup sengaja dikirim sebagai HTML mentah di dalam pembungkus statis —
 * bukan sebagai pohon React. `public/assets/js/preloader.js` (beforeInteractive)
 * memutasi isi splash ini (teks jam WIB, tanggal, kelas `an-splash-quick`,
 * atribut `hidden` kartu ulang tahun) lalu **menghapus `#akbar-preloader`**
 * dari DOM begitu splash selesai, sering kali sebelum React sempat hidrasi.
 *
 * Selama node ini dimiliki React, setiap mutasi/removal itu memicu hydration
 * mismatch (React #418) yang membuat seluruh pohon di-regenerasi di klien —
 * terdeteksi di SEMUA rute publik. Dengan `dangerouslySetInnerHTML`, React
 * tidak pernah menyentuh isi pembungkus saat hidrasi (lihat
 * `shouldSetTextContent`/`prepareToHydrateHostInstance` di react-dom), jadi
 * splash bebas dikelola skrip vanilla dan hidrasi tetap bersih.
 *
 * Pembungkus `#akbar-splash-root` harus tetap ada di DOM; `preloader.js` hanya
 * boleh menghapus node di dalamnya. Jangan kembalikan ini menjadi JSX biasa.
 */

function splashMarkup(english: boolean): string {
  const loadingLabel = english
    ? "Loading the Akbar Nawasunda website"
    : "Memuat situs Akbar Nawasunda";
  const caption = english
    ? "Loading page · Producer · Remixer · West Bandung"
    : "Memuat halaman · Produser · Remixer · Bandung Barat";
  const birthday = english
    ? "Happy birthday, Akbar · 1 November"
    : "Selamat ulang tahun, Akbar · 01 November";

  return `<div id="akbar-preloader" role="status" aria-label="${loadingLabel}" aria-live="polite">
      <div class="an-splash-inner">
        <p class="an-splash-top" aria-hidden="true">
          <span class="an-splash-live">
            <i aria-hidden="true"></i>WIB <span id="an-splash-clock">--.--.--</span>
          </span>
          <span id="an-splash-date">Bandung Barat</span>
        </p>
        <span class="an-splash-line">
          <span class="an-splash-word">Akbar</span>
        </span>
        <span class="an-splash-line">
          <span class="an-splash-word">Nawasunda</span>
        </span>
        <span class="an-splash-aksara" aria-hidden="true" lang="su-Sund">
          ᮃᮊ᮪ᮘᮁ ᮔᮝᮞᮥᮔ᮪ᮓ
        </span>
        <div class="an-splash-steps" aria-hidden="true">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>
        <div class="an-splash-rule" aria-hidden="true"></div>
        <div class="an-splash-meter" aria-hidden="true">
          <i id="an-splash-meter-fill"></i>
        </div>
        <div class="an-splash-caption" aria-hidden="true">
          <span>${caption}</span>
        </div>
        <p class="an-splash-birthday" id="an-splash-birthday" hidden aria-hidden="true">
          ${birthday}
        </p>
      </div>
    </div>`;
}

export function Preloader({ locale }: { locale: "id" | "en" }) {
  return (
    // `suppressHydrationWarning` hanya mematikan perbandingan atribut/isi
    // berbahaya milik wrapper ini: `preloader.js` mengosongkan inner HTML
    // wrapper SEBELUM hidrasi (bagian dari animasi keluar splash), jadi
    // `dangerouslySetInnerHTML.__html` sengaja tidak sama dengan innerHTML DOM
    // saat hidrasi. Perbandingan React (diffHydratedProperties) tidak akan
    // membandingkan apa pun pada elemen ini, dan struktur React sendiri tidak
    // pernah berubah — tidak ada mismatch yang dipadamkan secara sembunyi-sembunyi.
    <div
      id="akbar-splash-root"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: splashMarkup(locale === "en") }}
    />
  );
}
