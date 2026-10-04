/**
 * Kontrak AKSARA SUNDA + daftar frasa panggung.
 *
 * Suite ini lahir dari dua kerusakan nyata, dan tugasnya memastikan
 * keduanya tidak pernah terulang diam-diam:
 *
 * 1. Alias "DJ AKBAR REMIX" HILANG dari layar karena frasa kedua panggung
 *    ditulis dengan aksara Sunda, lalu disusun partikel — titik-titik tidak
 *    pernah bisa membentuk tanda tempel aksara (rarangkén), jadi yang
 *    tersisa gumpalan. Sejak sekarang: frasa partikel wajib Latin, dan
 *    kedua nama wajib hadir sebagai TEKS di HTML yang dikirim server.
 * 2. Aksara tampil rusak karena dipasang kecil, dengan line-height sempit,
 *    dan tanpa kunci baca. Sejak sekarang: setiap deret aksara wajib punya
 *    bacaan Latin, dan CSS-nya wajib memberi ruang vertikal.
 *
 * Sesuai docs/notes/testing-policy.md: yang diuji lewat HTML adalah
 * perilaku (apa yang benar-benar diterima pengunjung); yang diuji lewat
 * source hanyalah aturan CSS/konstanta yang memang tidak pernah muncul
 * sebagai teks.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { render } from "../client/src/entry-server";
import {
  SUNDA_LABEL,
  SUNDA_NAME,
  SUNDA_NAME_PARTS,
} from "../client/src/content/sundaneseScript";
import {
  PHRASE_SCROLL_TARGET,
  RELEASE_PROGRESS,
  STAGE_PHRASES,
  STAGE_PHRASE_META,
  phraseFor,
} from "../client/src/signature/stagePhrases";

const source = (path: string) =>
  readFileSync(resolve(process.cwd(), path), "utf8");

/** Blok Unicode aksara Sunda + perluasannya. */
const SUNDANESE = /[\u1B80-\u1BBF\u1CC0-\u1CC7]/;
/** Apa pun di luar aksara Sunda dan spasi. */
const NON_SUNDANESE = /[^\u1B80-\u1BBF\u1CC0-\u1CC7\s]/;

const entries = [SUNDA_NAME, ...SUNDA_NAME_PARTS];

describe("aksara Sunda — isi", () => {
  it("hanya berisi karakter aksara Sunda, tanpa huruf Latin yang nyasar", () => {
    for (const entry of entries) {
      expect(SUNDANESE.test(entry.script), entry.latin).toBe(true);
      expect(NON_SUNDANESE.test(entry.script), entry.latin).toBe(false);
    }
  });

  it("selalu punya bacaan Latin — aksara tidak pernah tampil tanpa kunci", () => {
    for (const entry of entries) {
      expect(entry.latin.trim().length).toBeGreaterThan(0);
      expect(NON_SUNDANESE.test(entry.latin)).toBe(true);
    }
  });

  it("menyusun nama lengkap dari dua potongan yang sama", () => {
    expect(SUNDA_NAME_PARTS.map(part => part.script).join(" ")).toBe(
      SUNDA_NAME.script
    );
    expect(SUNDA_NAME_PARTS.map(part => part.latin).join(" ")).toBe(
      SUNDA_NAME.latin
    );
  });

  it("tidak menempelkan klaim makna apa pun pada aksaranya", () => {
    // Label yang menemani aksara hanya boleh menyebut SISTEM TULISANNYA,
    // bukan arti, filosofi, atau sejarah apa pun.
    expect(SUNDA_LABEL.id).toBe("AKSARA SUNDA");
    expect(SUNDA_LABEL.en).toBe("SUNDANESE SCRIPT");
  });
});

describe("aksara Sunda — pemasangan", () => {
  it("memuat fontnya sendiri dengan unicode-range terkunci", () => {
    const css = source("client/src/index.css");
    const face = css.slice(
      css.indexOf('font-family: "Noto Sans Sundanese"'),
      css.indexOf('font-family: "Noto Sans Sundanese"') + 420
    );
    expect(face).toContain("noto-sans-sundanese-700.woff2");
    // Tanpa unicode-range, font aksara ikut terunduh di setiap halaman
    // Latin — 5 kB sia-sia untuk mayoritas pengunjung.
    expect(face).toMatch(/unicode-range:\s*U\+1B80/i);
  });

  it("memberi ruang vertikal supaya rarangkén tidak terpotong", () => {
    const css = source("client/src/components/signature/SundaScript.css");
    const heights = [...css.matchAll(/line-height:\s*([\d.]+)/g)]
      .map(match => Number(match[1]))
      // Hanya aturan pada deret aksaranya yang relevan; ambil semua lalu
      // pastikan yang terbesar memang milik .an-sunda-script.
      .filter(value => value > 1.6);
    expect(
      heights.length,
      "line-height longgar untuk deret aksara"
    ).toBeGreaterThan(0);
    const scriptBlock = css.slice(
      css.indexOf(".an-sunda-script {"),
      css.indexOf("}", css.indexOf(".an-sunda-script {"))
    );
    expect(scriptBlock).toMatch(/line-height:\s*1\.[89]/);
    expect(scriptBlock).toContain("var(--font-sunda)");
  });

  it("komponennya selalu merender kunci baca bersama aksaranya", () => {
    const tsx = source("client/src/components/signature/SundaScript.tsx");
    expect(tsx).toContain("an-sunda-script");
    expect(tsx).toContain("an-sunda-latin");
    expect(tsx).toContain("SUNDA_LABEL[lang]");
  });
});

describe("frasa panggung", () => {
  it("seluruhnya Latin — partikel tidak pernah diminta menyusun aksara", () => {
    for (const phrase of STAGE_PHRASES) {
      for (const word of phrase) {
        expect(SUNDANESE.test(word), word).toBe(false);
      }
    }
  });

  it("keterangannya sama persis dengan yang disusun partikel", () => {
    expect(STAGE_PHRASE_META).toHaveLength(STAGE_PHRASES.length);
    STAGE_PHRASES.forEach((phrase, index) => {
      expect(STAGE_PHRASE_META[index].text).toBe(phrase.join(" "));
    });
  });

  it("menandai mana nama resmi dan mana alias", () => {
    expect(STAGE_PHRASE_META.map(meta => meta.kind)).toEqual(["name", "alias"]);
  });

  it("punya target scroll yang benar-benar menyusun frasa itu", () => {
    expect(PHRASE_SCROLL_TARGET).toHaveLength(STAGE_PHRASES.length);
    PHRASE_SCROLL_TARGET.forEach((target, index) => {
      // Target harus jatuh di wilayah frasa yang dimaksud…
      expect(phraseFor(target), `target frasa ${index}`).toBe(index);
      // …dan sebelum titik dilepas; sesudah itu tidak ada kata tersusun.
      expect(target).toBeLessThan(RELEASE_PROGRESS);
      expect(target).toBeGreaterThan(0);
    });
  });

  it("tombolnya tidak pernah membajak scroll pengguna", () => {
    const tsx = source("client/src/components/signature/SignatureStage.tsx");
    // Hanya menggulir ke posisi; tidak mencegat event apa pun.
    expect(tsx).toContain("window.scrollTo");
    expect(tsx).not.toContain("preventDefault");
    expect(tsx).not.toContain("wheel");
    // Dan menghormati preferensi gerak.
    expect(tsx).toContain("prefers-reduced-motion: reduce");
  });
});

describe("halaman yang benar-benar dikirim server", () => {
  it("menampilkan kedua nama panggung sebagai teks, bukan hanya partikel", async () => {
    const result = await render("/", { documents: async () => [] as never });
    const html = result.html;
    for (const meta of STAGE_PHRASE_META) {
      // Dirender per kata di dalam <span>, jadi yang diperiksa tiap katanya.
      for (const word of meta.text.split(" ")) {
        expect(html, `${meta.text} hadir sebagai teks`).toContain(word);
      }
    }
    // Alias harus hadir utuh sebagai satu baris teks, bukan kebetulan
    // potongan kata yang tersebar.
    expect(html).toContain("DJ AKBAR REMIX");
  });

  it("menampilkan aksara beserta kunci bacanya di beranda", async () => {
    const result = await render("/", { documents: async () => [] as never });
    expect(result.html).toContain(SUNDA_NAME.script);
    expect(result.html).toContain(SUNDA_LABEL.id);
    expect(result.html).toContain(SUNDA_NAME.latin);
  });

  it("menampilkan hal yang sama di beranda Inggris dengan label Inggris", async () => {
    const result = await render("/en", { documents: async () => [] as never });
    expect(result.html).toContain(SUNDA_NAME.script);
    expect(result.html).toContain(SUNDA_LABEL.en);
  });
});
