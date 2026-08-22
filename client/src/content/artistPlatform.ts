export type Release = { title: string; format: string; year: string; href: string; platform: string };
export type Video = { title: string; label: string; href: string; image: string };

export const MANUS_ASSET_ORIGIN = "https://akbarfolio-424qdvsv.manus.space";
export const publicStorageAsset = (path: string) => `${MANUS_ASSET_ORIGIN}${path}`;

export const officialBrand = {
  logo: publicStorageAsset("/manus-storage/logo-an-transparent_c606ed92.png"),
  socialPreview: publicStorageAsset("/manus-storage/og-image_79f65fc5.png"),
  favicon: publicStorageAsset("/manus-storage/favicon_d67eea7c.png"),
};

export const platformLinks = [
  { label: "Spotify", href: "https://open.spotify.com/intl-id/artist/7KOQuIQLuxyklLox0RDMMw" },
  { label: "YouTube", href: "https://www.youtube.com/@akbarnawasunda" },
  { label: "SoundCloud", href: "https://soundcloud.com/akbarnawasunda" },
  { label: "Instagram", href: "https://www.instagram.com/akbarnawasunda" },
];

export const currentRelease = {
  eyebrow: "CURRENT FREQUENCY · 2025",
  title: "MASIH MENCINTAINYA — PAPINKA",
  type: "DJ AKBAR REMIX",
  href: "https://soundcloud.com/akbarnawasunda/masih-mencintainya-papinka-2025-akbar-nawasunda",
  image: officialBrand.socialPreview,
};

export const releases: Release[] = [
  { title: "Masih Mencintainya — Papinka", format: "Remix", year: "2025", platform: "SoundCloud", href: "https://soundcloud.com/akbarnawasunda/masih-mencintainya-papinka-2025-akbar-nawasunda" },
  { title: "Lali Dalane", format: "Single", year: "2024", platform: "Spotify", href: "https://open.spotify.com/intl-id/album/3r5GTZnjOFsSfHx5YeANIS?si=9MJhKIkeRkmOBYMbtKP5wg" },
  { title: "Pada Imut Aisyah Tak Belagu", format: "Single", year: "2025", platform: "Apple Music", href: "https://music.apple.com/id/song/pada-imut-aisyah-tak-belagu/1868511241?l=id" },
  { title: "DJ Rantau Den Panjauah", format: "Remix", year: "2024", platform: "Spotify", href: "https://open.spotify.com/intl-id/track/32xyWKqnleBI5U56jvnGUa?si=b22bacdf3ab24e2e" },
  { title: "Kamu Nanyeak", format: "Single", year: "2025", platform: "Apple Music", href: "https://music.apple.com/id/song/kamu-nanyeak/1821914972?l=id" },
];

export const videos: Video[] = [
  { title: "Garam dan Madu × Backpacker", label: "LATEST VISUAL", href: "https://youtu.be/rv4DK8nVWd0", image: officialBrand.socialPreview },
  { title: "Akbar Nawasunda — Official Visual", label: "YOUTUBE PREMIERE", href: "https://youtu.be/BOTdDcx31Zc", image: officialBrand.socialPreview },
  { title: "Breakbeat Session", label: "DJ AKBAR REMIX", href: "https://youtu.be/g37Cn8ajC6M", image: officialBrand.socialPreview },
];

export const futureModules = [
  { number: "01", title: "RELEASE HUB", copy: "Structured for future singles, remixes, playlists, pre-saves, and platform smart links." },
  { number: "02", title: "LIVE SIGNAL", copy: "Ready for announced shows, ticket links, city filters, and festival-ready event cards." },
  { number: "03", title: "FAN ACCESS", copy: "A live email opt-in now, with room for gated drops, early access, and community tools later." },
];
