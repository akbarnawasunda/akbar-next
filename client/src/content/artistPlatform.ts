export type Release = {
  title: string;
  format: string;
  year: string;
  href: string;
  platform: string;
};

export type Video = {
  title: string;
  label: string;
  href: string;
  image: string;
};

export const platformLinks = [
  { label: "Spotify", href: "https://open.spotify.com/artist/5teZ2VRr7VBSDqZ0ueP3hd" },
  { label: "YouTube", href: "https://www.youtube.com/@akbarnawasunda" },
  { label: "SoundCloud", href: "https://soundcloud.com/akbarnawasunda" },
  { label: "Instagram", href: "https://www.instagram.com/akbarnawasunda" },
];

export const currentRelease = {
  eyebrow: "CURRENT FREQUENCY · 2026",
  title: "GARAm & MADU × BACKPACKER",
  type: "VISUAL RELEASE",
  href: "https://youtu.be/rv4DK8nVWd0?si=c9KvLgfdQhHfjmMJ",
  image: "/manus-storage/an-night-frequency-release_0b545b29.jpg",
};

export const releases: Release[] = [
  { title: "Lali Dalane", format: "Single", year: "2024", platform: "Spotify", href: "https://open.spotify.com/intl-id/album/3r5GTZnjOFsSfHx5YeANIS?si=9MJhKIkeRkmOBYMbtKP5wg" },
  { title: "Pada Imut Aisyah Tak Belagu", format: "Single", year: "2025", platform: "Apple Music", href: "https://music.apple.com/id/song/pada-imut-aisyah-tak-belagu/1868511241?l=id" },
  { title: "DJ Rantau Den Panjauah", format: "Remix", year: "2024", platform: "Spotify", href: "https://open.spotify.com/intl-id/track/32xyWKqnleBI5U56jvnGUa?si=b22bacdf3ab24e2e" },
  { title: "Kamu Nanyeak", format: "Single", year: "2025", platform: "Apple Music", href: "https://music.apple.com/id/song/kamu-nanyeak/1821914972?l=id" },
];

export const videos: Video[] = [
  { title: "Garam dan Madu × Backpacker", label: "LATEST VISUAL", href: "https://youtu.be/rv4DK8nVWd0?si=c9KvLgfdQhHfjmMJ", image: "/manus-storage/an-night-frequency-stage_113bf174.jpg" },
  { title: "Kalah — Aftershine", label: "DJ AKBAR REMIX", href: "https://www.youtube.com/@akbarnawasunda", image: "/manus-storage/an-night-frequency-hero_7e2eb970.jpg" },
  { title: "DJ Die With A Smile", label: "BREAKBEAT SESSION", href: "https://www.youtube.com/@akbarnawasunda", image: "/manus-storage/an-night-frequency-release_0b545b29.jpg" },
];

export const futureModules = [
  { number: "01", title: "RELEASE HUB", copy: "Structured for future singles, remixes, playlists, pre-saves, and platform smart links." },
  { number: "02", title: "LIVE SIGNAL", copy: "Ready for announced shows, ticket links, city filters, and festival-ready event cards." },
  { number: "03", title: "FAN ACCESS", copy: "A live email opt-in now, with room for gated drops, early access, and community tools later." },
];
