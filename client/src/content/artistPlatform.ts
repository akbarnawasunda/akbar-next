export type Release = { title: string; format: string; year: string; href: string; platform: string; image?: string };
export type Video = { title: string; label: string; href: string; image: string };

export const officialBrand = {
  logo: "/assets/akbar-logo.webp",
  logoFallback: "/assets/akbar-logo-fallback.webp",
  socialPreview: "/assets/akbar-social-preview.webp",
  portrait: "/assets/akbar-official-portrait.webp",
  portraitFallback: "/assets/akbar-official-portrait.webp",
  favicon: "/assets/akbar-favicon.jpg",
  rmxMark: "/assets/akbar-rmx-mark.webp",
  editorialPortrait: "/assets/akbar-future-red.webp",
  archivePortrait: "/assets/akbar-future-yellow.webp",
};

export const portraitStudies = [
  {
    id: "neon-portrait",
    src: "/media/portrait/neon-portrait.jpg",
    width: 3016,
    height: 4032,
    titleId: "Potret Neon",
    titleEn: "Neon Portrait",
    copyId: "Potret dekat dengan cahaya warna dan bingkai yang lebih hening.",
    copyEn: "A close portrait study shaped by colour, light, and a quieter frame.",
    altId: "Potret Akbar Nawasunda dengan cahaya magenta dan biru",
    altEn: "Akbar Nawasunda portrait with magenta and blue light",
  },
  {
    id: "kx07-portrait",
    src: "/media/portrait/kx07-portrait.jpg",
    width: 1055,
    height: 1491,
    titleId: "Studi KX-07",
    titleEn: "KX-07 Study",
    copyId: "Potongan visual yang lebih keras: kontras, tanda, dan wajah yang ditahan.",
    copyEn: "A harder visual cut: contrast, markings, and a face held just out of reach.",
    altId: "Potret editorial Akbar Nawasunda dengan masker dan elemen grafis kuning magenta",
    altEn: "Editorial Akbar Nawasunda portrait with a mask and yellow magenta graphics",
  },
] as const;

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
  shortBio: "Produser, remixer, dan DJ asal Bandung Barat. Mulai berkarya pada 2020 sebagai DJ Akbar Remix, kini merilis karya orisinal sebagai Akbar Nawasunda di platform musik digital.",
  longBio: "Perjalanan musik Akbar Nawasunda dimulai pada 2020 sebagai bedroom producer independen dengan nama DJ Akbar Remix. Eksperimennya membawa lagu-lagu populer ke wilayah Breakbeat, Jedag Jedug, dan Jungle Dutch bergaya Bandung. Kini, di bawah nama Akbar Nawasunda, ia merilis karya orisinal yang memadukan melodi pop, electronic bass, dan energi remix untuk platform musik digital global.",
  genres: ["Breakbeat", "Indo Bass", "Jedag Jedug", "Jungle Dutch", "Kendang Chops"],
  bookingEmail: "akbarnawasunda@gmail.com",
  services: ["Remix requests", "Custom arrangements", "Collaborations", "Music licensing"],
  licensing: "Untuk penggunaan musik pada konten, hubungi melalui email. Penggunaan komersial akan dibicarakan secara terpisah; penggunaan non-komersial dengan credit sangat diapresiasi.",
};

export const currentRelease = {
  eyebrow: "RILISAN TERBARU · 2025",
  title: "MASIH MENCINTAINYA — PAPINKA",
  type: "DJ AKBAR REMIX",
  href: "https://soundcloud.com/akbarnawasunda/masih-mencintainya-papinka-2025-akbar-nawasunda",
  image: "https://i1.sndcdn.com/artworks-Zyzr6WJb8jUksH1v-u0tohw-t500x500.jpg",
};

export const releases: Release[] = [
  { title: "Masih Mencintainya — Papinka", format: "Remix", year: "2025", platform: "SoundCloud", href: "https://soundcloud.com/akbarnawasunda/masih-mencintainya-papinka-2025-akbar-nawasunda", image: "https://i1.sndcdn.com/artworks-Zyzr6WJb8jUksH1v-u0tohw-t500x500.jpg" },
  { title: "Ngertenono Ati Medium Hall", format: "Remix", year: "2025", platform: "SoundCloud", href: "https://soundcloud.com/akbarnawasunda/ngertenono_ati_medium_hall_mbfrecords", image: "https://i1.sndcdn.com/artworks-3yBxworMu4rYkKQo-jWKhvg-t500x500.jpg" },
  { title: "Lali Dalane", format: "Single", year: "2024", platform: "Spotify", href: "https://open.spotify.com/intl-id/album/3r5GTZnjOFsSfHx5YeANIS?si=9MJhKIkeRkmOBYMbtKP5wg", image: "https://i.scdn.co/image/ab67616d0000aa54c24c088e7cda8fba473c8d5f" },
  { title: "Pada Imut Aisyah Tak Belagu", format: "Single", year: "2025", platform: "Apple Music", href: "https://music.apple.com/id/song/pada-imut-aisyah-tak-belagu/1868511241?l=id", image: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/f2/40/e5/f240e5cf-1a0f-bb1b-6a0b-1d772744ff30/698308345017_cover.jpg/632x632cc.webp" },
  { title: "DJ Rantau Den Panjauah", format: "Remix", year: "2024", platform: "Spotify", href: "https://open.spotify.com/intl-id/track/32xyWKqnleBI5U56jvnGUa?si=b22bacdf3ab24e2e", image: "https://i.scdn.co/image/ab67616d0000b273d769a33006faeb8803afc5da" },
  { title: "Kamu Nanyeak", format: "Single", year: "2025", platform: "Apple Music", href: "https://music.apple.com/id/song/kamu-nanyeak/1821914972?l=id", image: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/a0/a1/c2/a0a1c2d6-866a-0a82-fe62-8d643b320bf9/5063740331938_cover.jpg/1200x1200bb.jpg" },
  { title: "ROSE & Bruno Mars — APT (Rmx)", format: "Remix", year: "2024", platform: "SoundCloud", href: "https://soundcloud.com/akbarnawasunda/rose-bruno-mars-apt-2024-dj-akbar-remix", image: "https://i1.sndcdn.com/artworks-5dZROzMX9gkyFfzy-8VIoSA-t500x500.jpg" },
  { title: "Die With A Smile × Warga +62", format: "Bootleg", year: "2024", platform: "SoundCloud", href: "https://soundcloud.com/akbarnawasunda/dj-die-with-a-smile-x-warga-62-x-est-ce-que-tu-maimes-breakbeat-2024-dj-akbar-remix", image: "https://i1.sndcdn.com/artworks-Wsjyv1dXaUqLUexc-wVuSww-t500x500.jpg" },
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
