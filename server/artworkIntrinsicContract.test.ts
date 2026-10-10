import { describe, expect, it } from "vitest";
import { render } from "./test-renderer";
import { intrinsicSize, remoteIntrinsicSize } from "../client/src/lib/responsiveImage";

const prefetch = { documents: async () => [] as never };

describe("artwork platform intrinsic sizing", () => {
  it("menurunkan ukuran dari pola URL penyedia, bukan tebakan", () => {
    expect(remoteIntrinsicSize("https://i1.sndcdn.com/artworks-abc-t500x500.jpg")).toEqual([500, 500]);
    expect(remoteIntrinsicSize("https://i1.sndcdn.com/artworks-abc-t200x200.jpg")).toEqual([200, 200]);
    expect(remoteIntrinsicSize("https://i1.sndcdn.com/avatars-000123-abc-t500x500.jpg")).toEqual([500, 500]);
    expect(remoteIntrinsicSize("https://i.scdn.co/image/ab67616d00001e02deadbeef")).toEqual([300, 300]);
    expect(remoteIntrinsicSize("https://i.scdn.co/image/ab67616d0000aa54deadbeef")).toEqual([640, 640]);
    expect(
      remoteIntrinsicSize("https://is1-ssl.mzstatic.com/image/thumb/abc/300x300bb.webp")
    ).toEqual([300, 300]);
    expect(remoteIntrinsicSize("https://i.ytimg.com/vi/abc/hqdefault.jpg")).toEqual([480, 360]);
    expect(remoteIntrinsicSize("https://i.ytimg.com/vi/abc/maxresdefault.jpg")).toEqual([1280, 720]);
    expect(remoteIntrinsicSize("https://example.com/whatever.png")).toBeUndefined();
    expect(remoteIntrinsicSize(undefined)).toBeUndefined();
  });

  it("membiarkan manifest lokal menang atas pola jarak jauh", () => {
    expect(intrinsicSize("/assets/akbar-logo.webp")).toEqual([512, 357]);
    expect(intrinsicSize("https://i1.sndcdn.com/artworks-abc-t500x500.jpg")).toEqual([500, 500]);
  });

  it("setiap gambar jarak jauh & media proxy terkirim dengan dimensi", async () => {
    for (const route of [
      "/music",
      "/visuals",
      "/universe",
      "/en/visuals",
    ]) {
      const page = await render(route, prefetch);
      const images = (page.html.match(/<img[^>]*>/g) || []).filter(img =>
        /src="(?:https?:\/\/|\/media\/)/.test(img)
      );
      expect(
        images.length,
        `${route} tanpa gambar jarak jauh / media proxy`
      ).toBeGreaterThan(0);
      for (const img of images) {
        const src = (img.match(/src="([^"]*)"/) || [])[1] || "";
        expect(img, `${route} ${src} tanpa width/height`).toMatch(/width="\d+"/);
        expect(img, `${route} ${src} tanpa width/height`).toMatch(/height="\d+"/);
      }
    }
  });
});
