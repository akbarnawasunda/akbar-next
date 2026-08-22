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

export const allPlatformLinks = [
  ...platformLinks,
  { label: "Apple Music", href: "https://music.apple.com/id/song/pada-imut-aisyah-tak-belagu/1868511241?l=id" },
  { label: "Deezer", href: "https://www.deezer.com/us/artist/322209491" },
  { label: "Amazon Music", href: "https://music.amazon.com/albums/B0G4GBYQKJ" },
  { label: "Tidal", href: "https://tidal.com/track/443331782" },
  { label: "TikTok", href: "https://www.tiktok.com/@akbarnawasunda" },
  { label: "X", href: "https://x.com/akbarnawasunda" },
];

export const verifiedArtistProfile = {
  aliases: ["DJ Akbar Remix"],
  location: "Bandung Barat, Indonesia",
  shortBio: "Produser dan remixer asal Bandung Barat. Mulai berkarya pada 2020 sebagai DJ Akbar Remix, kini merilis karya orisinal sebagai Akbar Nawasunda di platform musik digital.",
  longBio: "Perjalanan musik Akbar Nawasunda dimulai pada 2020 sebagai bedroom producer independen dengan nama DJ Akbar Remix. Eksperimennya membawa lagu-lagu populer ke wilayah Breakbeat, Jedag Jedug, dan Jungle Dutch bergaya Bandung. Kini, di bawah nama Akbar Nawasunda, ia merilis karya orisinal yang memadukan melodi pop, electronic bass, dan energi remix untuk platform musik digital global.",
  genres: ["Breakbeat", "Indo Bass", "Jedag Jedug", "Jungle Dutch", "Kendang Chops"],
  bookingEmail: "akbarnawasunda@gmail.com",
  services: ["Remix requests", "Custom arrangements", "Collaborations", "Music licensing"],
  licensing: "Untuk penggunaan musik pada konten, hubungi melalui email. Penggunaan komersial akan dibicarakan secara terpisah; penggunaan non-komersial dengan credit sangat diapresiasi.",
};

export const currentRelease = {
  eyebrow: "CURRENT FREQUENCY · 2025",
  title: "MASIH MENCINTAINYA — PAPINKA",
  type: "DJ AKBAR REMIX",
  href: "https://soundcloud.com/akbarnawasunda/masih-mencintainya-papinka-2025-akbar-nawasunda",
  image: officialBrand.socialPreview,
};

export const releases: Release[] = [
  { title: "Masih Mencintainya — Papinka", format: "Remix", year: "2025", platform: "SoundCloud", href: "https://soundcloud.com/akbarnawasunda/masih-mencintainya-papinka-2025-akbar-nawasunda" },
  { title: "Ngertenono Ati Medium Hall", format: "Remix", year: "2025", platform: "SoundCloud", href: "https://soundcloud.com/akbarnawasunda/ngertenono_ati_medium_hall_mbfrecords" },
  { title: "Lali Dalane", format: "Single", year: "2024", platform: "Spotify", href: "https://open.spotify.com/intl-id/album/3r5GTZnjOFsSfHx5YeANIS?si=9MJhKIkeRkmOBYMbtKP5wg" },
  { title: "Pada Imut Aisyah Tak Belagu", format: "Single", year: "2025", platform: "Apple Music", href: "https://music.apple.com/id/song/pada-imut-aisyah-tak-belagu/1868511241?l=id" },
  { title: "DJ Rantau Den Panjauah", format: "Remix", year: "2024", platform: "Spotify", href: "https://open.spotify.com/intl-id/track/32xyWKqnleBI5U56jvnGUa?si=b22bacdf3ab24e2e" },
  { title: "Kamu Nanyeak", format: "Single", year: "2025", platform: "Apple Music", href: "https://music.apple.com/id/song/kamu-nanyeak/1821914972?l=id" },
  { title: "ROSE & Bruno Mars — APT (Rmx)", format: "Remix", year: "2024", platform: "SoundCloud", href: "https://soundcloud.com/akbarnawasunda/rose-bruno-mars-apt-2024-dj-akbar-remix" },
  { title: "Die With A Smile × Warga +62", format: "Bootleg", year: "2024", platform: "SoundCloud", href: "https://soundcloud.com/akbarnawasunda/dj-die-with-a-smile-x-warga-62-x-est-ce-que-tu-maimes-breakbeat-2024-dj-akbar-remix" },
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
