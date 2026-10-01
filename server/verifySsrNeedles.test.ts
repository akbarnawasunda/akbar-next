/**
 * Menjaga scripts/verify-ssr.sh tetap jujur.
 *
 * Skrip itu memeriksa server produksi dengan "needle": potongan teks yang harus
 * muncul di body hasil render tiap rute. Kalau copy halaman diubah, needle-nya
 * basi dan CI baru merah setelah build penuh — mahal dan membingungkan.
 *
 * Tes ini membaca baris `check` dari skrip tersebut, merender rutenya lewat
 * jalur SSR yang sama, lalu memastikan needle-nya memang masih ada. Jadi copy
 * yang berubah langsung ketahuan dalam hitungan detik.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { render } from "../client/src/entry-server";

type Row = { url: string; needle: string };

const CHECK_ROW = /^check\s+"([^"]+)"\s+"([^"]*)"/;

// Rute yang butuh sesi/redirect dan tidak bisa dinilai dari render murni.
const SKIPPED = new Set(["/admin"]);

function checkRows(): Row[] {
  const script = readFileSync(
    resolve(process.cwd(), "scripts/verify-ssr.sh"),
    "utf8"
  );

  return script
    .split("\n")
    .map(line => line.trim().match(CHECK_ROW))
    .filter((match): match is RegExpMatchArray => Boolean(match))
    .map(match => ({ url: match[1], needle: match[2] }))
    .filter(row => row.needle && !SKIPPED.has(row.url));
}

function decode(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'");
}

describe("needle verify-ssr.sh", () => {
  const rows = checkRows();

  it("menemukan baris check di dalam skrip", () => {
    expect(rows.length).toBeGreaterThan(5);
  });

  it.each(rows)("masih ada di body $url: $needle", async ({ url, needle }) => {
    const { html } = await render(url, { documents: async () => [] as never });
    expect(decode(html)).toContain(needle);
  });
});
