import { describe, expect, it } from "vitest";
import { artworkThumb, releases } from "../client/src/content/artistPlatform";

describe("artwork thumbnail", () => {
  it("meminta ukuran kecil dari tiap CDN artwork", () => {
    expect(
      artworkThumb("https://i1.sndcdn.com/artworks-abc-t500x500.jpg")
    ).toBe("https://i1.sndcdn.com/artworks-abc-t200x200.jpg");
    expect(
      artworkThumb("https://i.scdn.co/image/ab67616d0000b273d769a330")
    ).toBe("https://i.scdn.co/image/ab67616d00001e02d769a330");
    expect(
      artworkThumb(
        "https://is1-ssl.mzstatic.com/image/thumb/x/y/1200x1200bb.jpg"
      )
    ).toBe("https://is1-ssl.mzstatic.com/image/thumb/x/y/300x300bb.webp");
  });

  it("mengembalikan URL apa adanya kalau pola CDN tidak dikenal", () => {
    expect(artworkThumb("/assets/akbar-social-preview.webp")).toBe(
      "/assets/akbar-social-preview.webp"
    );
    expect(artworkThumb(undefined)).toBeUndefined();
  });

  it("menghasilkan URL valid untuk seluruh katalog bawaan", () => {
    for (const release of releases) {
      const thumb = artworkThumb(release.image);
      expect(thumb).toBeTruthy();
      expect(() => new URL(thumb!, "https://akbarnawasunda.com")).not.toThrow();
    }
  });
});
