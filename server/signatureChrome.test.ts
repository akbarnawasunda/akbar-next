/**
 * Kontrak lapisan signature global (particle field, cursor, tirai rute,
 * panggung wordmark).
 *
 * Lapisan-lapisan ini hanya hidup setelah mount di browser, jadi tidak pernah
 * muncul di HTML hasil render. Karena itu pemeriksaan "shell masih memasangnya"
 * memang tidak bisa lewat tes render — satu-satunya penjaga otomatis adalah
 * membaca source shell, dan itulah satu-satunya alasan tes source di file ini
 * (lihat docs/notes/testing-policy.md pasal 3). Sisi pengunjung tetap diuji
 * lewat HTML: lapisan tersebut wajib TIDAK ada di SSR.
 *
 * Konteks: PR #7 pernah melepas ketiga lapisan itu dari shell dan mengunci
 * `data-live="false"` di panggung wordmark. Identitas situs hilang tanpa satu
 * pun tes yang gagal — file ini menutup celah itu.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { render } from "../client/src/entry-server";

const source = (path: string) =>
  readFileSync(resolve(process.cwd(), path), "utf8");

describe("lapisan signature global", () => {
  it("tetap dipasang oleh public shell", () => {
    const shell = source("client/src/shell/PublicShell.tsx");
    for (const layer of [
      "SignatureBackground",
      "RouteSignalCurtain",
      "SignalMark",
    ]) {
      expect(shell, `shell kehilangan <${layer} />`).toContain(`<${layer} />`);
    }
    // Partikel harus dirender sebelum konten berat lain agar urutan paint
    // lapisan tetap sama seperti rancangan awal.
    expect(shell.indexOf("<SignatureBackground />")).toBeLessThan(
      shell.indexOf("<GlobalAudioPlayer />")
    );
  });

  it("mengembalikan status live panggung wordmark ke runtime", () => {
    const stage = source("client/src/components/signature/SignatureStage.tsx");
    // `data-live` tidak boleh dipatok mati: CSS memakai atribut itu untuk
    // meruntuhkan jalur scroll 140vh saat efeknya memang tidak jalan.
    expect(stage).not.toContain('data-live="false"');
    expect(stage).toContain("data-live={live}");
    expect(stage).toMatch(/const live = ready && tier !== "off"/);
    // Nama + alias tetap di DOM (teks nyata) walau partikel hidup, supaya
    // mesin pencari dan screen reader membacanya. Baris era lama dihapus
    // (Phase 3 §2 baris 1); isian journey tinggal di /universe.
    expect(stage).toContain("<p className=\"sr-only\">{alsoKnownAs}</p>");
    expect(stage).toContain("AKBAR");
    expect(stage).not.toContain("an-signature-stage-eras");
  });

  it("tidak membocorkan lapisan client ke HTML SSR", async () => {
    const prefetch = { documents: async () => [] as never };
    for (const route of ["/", "/music", "/en/live"]) {
      const page = await render(route, prefetch);
      for (const needle of [
        "<canvas",
        "an-signature-field",
        "an-signal-mark",
        "an-route-signal",
      ]) {
        expect(page.html, `${route} membocorkan ${needle}`).not.toContain(
          needle
        );
      }
    }
  });
});
