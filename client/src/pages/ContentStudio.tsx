import {
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronDown,
  Database,
  Disc3,
  FilePenLine,
  FolderOpen,
  Gamepad2,
  Image as ImageIcon,
  LayoutList,
  Link2,
  MapPin,
  Plus,
  Radio,
  Save,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useLocation, useSearch } from "@/lib/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import AssetPicker from "@/components/AssetPicker";
import {
  StudioLinkListPreview,
  StudioLinkPreview,
} from "@/components/StudioAssetPreview";
import StudioDocumentPreview from "@/components/StudioDocumentPreview";
import StudioVisualArchive from "@/components/StudioVisualArchive";
import StudioPortraitArchive from "@/components/StudioPortraitArchive";
import { StudioPublishChecklist } from "@/components/StudioWorkspaceChrome";
import StudioGalleryAnalytics from "@/components/StudioGalleryAnalytics";
import StudioLeaderboardManager from "@/components/StudioLeaderboardManager";
import StudioPageMirror from "@/components/StudioPageMirror";
import OwnerLoginCard from "@/components/OwnerLoginCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import {
  allPlatformLinks,
  currentRelease,
  officialBrand,
  verifiedArtistProfile,
  portraitStudies,
  videos,
} from "@/content/artistPlatform";
import { publicPortraitStudies } from "@/content/publicContent";
import { slugify } from "@shared/slug";
import {
  EmptyState,
  Eyebrow,
  Panel,
  Pill,
  Stat,
  StatGrid,
  StudioButton,
  StudioHero,
  StudioLink,
  StudioTabs,
} from "@/studio/StudioKit";

const documentTypes = [
  {
    value: "hero",
    label: "Homepage hero",
    eyebrow: "01",
    description: "First impression and primary action",
  },
  {
    value: "profile",
    label: "Artist profile",
    eyebrow: "02",
    description: "Bio, genres, statement, portrait",
  },
  {
    value: "journey",
    label: "Artist Journey",
    eyebrow: "03",
    description: "Biography, milestones, and story image",
  },
  {
    value: "pressKit",
    label: "Press & booking",
    eyebrow: "04",
    description: "EPK copy, contacts, download links",
  },
  {
    value: "siteSettings",
    label: "Site settings / SEO",
    eyebrow: "05",
    description: "Metadata and search presentation",
  },
  {
    value: "legal",
    label: "Privacy / legal",
    eyebrow: "06",
    description: "Reviewed public policy documents",
  },
  {
    value: "release",
    label: "Release",
    eyebrow: "07",
    description: "Music, artwork, platforms, credits",
  },
  {
    value: "visual",
    label: "Visual archive item",
    eyebrow: "08",
    description: "Thumbnail, YouTube ID, URL, and archive card",
  },
  {
    value: "portrait",
    label: "Portrait study",
    eyebrow: "09",
    description: "Foto, caption, alt text, dan urutan tampil",
  },
  {
    value: "photoStory",
    label: "Photo Story",
    eyebrow: "10",
    description: "Foto editorial, caption, alt text, dan link opsional",
  },
  {
    value: "live",
    label: "Live signal",
    eyebrow: "11",
    description: "Standby, announced, or active",
  },
  {
    value: "event",
    label: "Live event",
    eyebrow: "12",
    description: "Date, venue, ticket, poster",
  },
  {
    value: "game",
    label: "JEDAG RUN game",
    eyebrow: "13",
    description: "Game route, copy, BGM, and SFX",
  },
] as const;

type DocumentType = (typeof documentTypes)[number]["value"];
type EditorPayload = Record<string, unknown>;
type EditorDocument = {
  id: number;
  documentType: DocumentType;
  slug: string;
  payload: EditorPayload;
  sortOrder: number;
  isPublished: boolean;
};
type FieldSpec = {
  key: string;
  label: string;
  placeholder?: string;
  hint?: string;
  multiline?: boolean;
  media?: boolean;
  type?: "text" | "url" | "email" | "date" | "select";
  options?: string[];
};

const fieldUsage: Record<string, string> = {
  "hero.heroKicker": "Homepage → label identitas hero",
  "hero.heroTitle": "Homepage → judul hero utama",
  "hero.heroBody": "Homepage → copy pembuka",
  "hero.heroImage":
    "Homepage → foto hero; halaman publik saat ini memakai portrait brand sebagai fallback",
  "hero.primaryActionLabel": "Homepage → tombol aksi utama",
  "hero.primaryActionUrl": "Homepage → tujuan tombol aksi utama",
  "profile.shortBio": "About → bio singkat",
  "profile.longBio":
    "About + Universe → perjalanan musik; EPK memakai snapshot EPK sendiri",
  "profile.location":
    "About + Universe → lokasi/asal; EPK memakai lokasi snapshot sendiri",
  "profile.locationUrl": "About + Universe → link Google Maps lokasi",
  "profile.genresText":
    "About + Universe → daftar genre; EPK memakai genre snapshot sendiri",
  "profile.portraitImage":
    "About + Universe → portrait profile; bukan foto utama kartu Editorial / Press EPK",
  "profile.artistStatement": "About → kutipan artist statement",
  "journey.title": "Homepage + About → judul scene Artist Journey",
  "journey.titleEn": "English homepage → journey title",
  "journey.intro": "Homepage + About → intro biografi / journey Indonesia",
  "journey.introEn": "English homepage + About → journey intro",
  "journey.imageUrl": "Homepage → visual opsional untuk scene Artist Journey",
  "journey.milestonesText":
    "Homepage + Universe → satu baris per milestone: Tahun | Judul ID | Copy ID | Judul EN | Copy EN; format 3 kolom lama tetap diterima",
  "photoStory.title": "Homepage + Visuals → judul frame foto Indonesia",
  "photoStory.titleEn": "English homepage + Visuals → judul frame foto",
  "photoStory.label": "Homepage + Visuals → label kartu foto",
  "photoStory.imageUrl": "Homepage + Visuals → foto story",
  "photoStory.copyId": "Homepage + Visuals → caption Indonesia",
  "photoStory.copyEn": "Homepage + Visuals → caption English",
  "photoStory.altId": "Homepage + Visuals → alt text Indonesia",
  "photoStory.altEn": "Homepage + Visuals → alt text English",
  "photoStory.url": "Homepage + Visuals → link story opsional",
  "pressKit.intro": "EPK → pembuka press & booking",
  "pressKit.bookingEmail": "EPK → kontak booking",
  "pressKit.pressEmail": "EPK → kontak pers",
  "pressKit.editorialImage": "EPK → foto pada kartu Editorial / Press",
  "pressKit.snapshotBio": "EPK → paragraf Artist Snapshot",
  "pressKit.snapshotLocation": "EPK → lokasi pada kartu dan Artist Snapshot",
  "pressKit.snapshotGenresText": "EPK → genre pada Artist Snapshot",
  "pressKit.snapshotAlias": "EPK → alias pada kartu dan Artist Snapshot",
  "pressKit.capabilitiesIntro": "EPK → pengantar Capabilities",
  "pressKit.licensingNote": "EPK → catatan Licensing",
  "pressKit.oneSheetUrl": "EPK → aset one sheet",
  "pressKit.photoPackUrl": "EPK → paket foto",
  "pressKit.logoPackUrl": "EPK → paket logo",
  "pressKit.technicalRiderUrl": "EPK → technical rider",
  "siteSettings.socialPreviewUrl": "Metadata halaman → OG/social preview",
  "siteSettings.canonicalUrl": "Semua halaman → canonical origin",
  "siteSettings.platformLinksText": "Homepage + Music + EPK → platform resmi",
  "release.url": "Homepage + Music + EPK → link rilisan utama",
  "release.embedUrl": "Music → embed player opsional",
  "release.artworkUrl": "Homepage + Music + EPK → cover rilisan",
  "release.spotifyUrl": "Detail rilisan → tombol Spotify",
  "release.appleMusicUrl": "Detail rilisan → tombol Apple Music",
  "release.platformLinksText": "Detail rilisan → link platform lain",
  "visual.url": "Visuals + Homepage → link visual resmi",
  "visual.imageUrl": "Visuals + Homepage → thumbnail visual",
  "portrait.title": "Visuals → judul studi portrait Indonesia",
  "portrait.titleEn": "Visuals → judul studi portrait English",
  "portrait.label": "Visuals → label studi portrait",
  "portrait.imageUrl": "Visuals → foto portrait yang tampil di studi foto",
  "portrait.copyId": "Visuals → caption foto pada halaman Indonesia",
  "portrait.copyEn": "Visuals → caption foto pada halaman English",
  "portrait.altId": "Visuals → alt text foto pada halaman Indonesia",
  "portrait.altEn": "Visuals → alt text foto pada halaman English",
  "event.mapsUrl": "Live + Homepage → lokasi Google Maps",
  "event.posterUrl": "Live + Homepage → poster event",
  "event.ticketUrl": "Live + Homepage → tombol tiket",
  "event.rsvpUrl": "Live + Homepage → tombol RSVP",
  "game.title": "Game page → title dan browser metadata",
  "game.kicker": "Game page → label pembuka",
  "game.intro": "Homepage teaser + game page → copy pengantar",
  "game.bgmUrl": "Game page → background music setelah user menekan Start",
  "game.jumpSfxUrl": "Game page → suara lompat",
  "game.collectSfxUrl": "Game page → suara mengambil frequency note",
  "game.hitSfxUrl": "Game page → suara terkena noise gate",
  "game.dropSfxUrl": "Game page → suara Drop Meter penuh",
  "game.gameOverSfxUrl": "Game page → suara game over",
  "game.shareLabel": "Game page → label tombol share score",
};

function usageForField(documentType: DocumentType, key: string) {
  return (
    fieldUsage[`${documentType}.${key}`] ||
    `Dokumen ${documentType} → dipakai oleh halaman publik yang terkait`
  );
}

const primaryWorkflowTypes: DocumentType[] = [
  "release",
  "event",
  "pressKit",
  "siteSettings",
  "profile",
  "journey",
  "visual",
  "portrait",
  "photoStory",
  "game",
];
const primaryWorkflows = [
  {
    type: "release" as const,
    eyebrow: "01",
    title: "Rilisan lagu",
    description: "Judul, cover, dan semua link streaming.",
    icon: Disc3,
    action: "Tambah rilisan",
  },
  {
    type: "event" as const,
    eyebrow: "02",
    title: "Jadwal pertunjukan",
    description: "Tambah banyak show dengan tiket dan RSVP.",
    icon: CalendarDays,
    action: "Tambah jadwal",
  },
  {
    type: "siteSettings" as const,
    eyebrow: "03",
    title: "Tautan resmi",
    description: "Atur link Spotify, YouTube, dan kanal lain.",
    icon: Link2,
    action: "Edit tautan",
  },
  {
    type: "journey" as const,
    eyebrow: "06",
    title: "Artist Journey",
    description: "Atur biografi singkat dan milestone yang tampil di homepage.",
    icon: FilePenLine,
    action: "Edit journey",
  },
  {
    type: "pressKit" as const,
    eyebrow: "04",
    title: "Press & Booking / EPK",
    description: "Foto editorial, snapshot, kontak, dan aset press.",
    icon: FilePenLine,
    action: "Edit EPK",
  },
  {
    type: "profile" as const,
    eyebrow: "05",
    title: "Profil & lokasi",
    description: "Bio, genre, portrait, dan link Google Maps.",
    icon: MapPin,
    action: "Edit profil",
  },
  {
    type: "visual" as const,
    eyebrow: "06",
    title: "Visual Archive",
    description: "Tambah banyak thumbnail video dan kartu visual.",
    icon: ImageIcon,
    action: "Kelola archive",
  },
  {
    type: "portrait" as const,
    eyebrow: "07",
    title: "Studi foto & portrait",
    description: "Ganti foto, caption, alt text, dan urutan portrait study.",
    icon: ImageIcon,
    action: "Kelola portrait",
  },
  {
    type: "photoStory" as const,
    eyebrow: "08",
    title: "Photo Story",
    description: "Tambah foto dan caption untuk scene cerita visual homepage.",
    icon: ImageIcon,
    action: "Tambah photo story",
  },
  {
    type: "game" as const,
    eyebrow: "09",
    title: "JEDAG RUN / Night Frequency",
    description: "Atur copy game, BGM, SFX, dan status tayang.",
    icon: Gamepad2,
    action: "Edit game & audio",
  },
];

const fieldsByType: Record<DocumentType, FieldSpec[]> = {
  hero: [
    {
      key: "heroKicker",
      label: "Kicker",
      placeholder: "AKBAR NAWASUNDA / PRODUCER",
    },
    { key: "heroTitle", label: "Hero title", placeholder: "Akbar Nawasunda" },
    {
      key: "heroBody",
      label: "Hero copy",
      multiline: true,
      placeholder: "One concise public sentence.",
    },
    {
      key: "heroImage",
      label: "Hero image URL",
      type: "url",
      media: true,
      placeholder: "/manus-storage/... or /assets/...",
    },
    {
      key: "primaryActionLabel",
      label: "Primary action label",
      placeholder: "LISTEN NOW",
    },
    {
      key: "primaryActionUrl",
      label: "Primary action URL",
      type: "url",
      placeholder: "https://...",
    },
  ],
  profile: [
    { key: "shortBio", label: "Short bio", multiline: true },
    { key: "longBio", label: "Long bio", multiline: true },
    {
      key: "location",
      label: "Location",
      placeholder: "Bandung Barat, Indonesia",
    },
    {
      key: "locationUrl",
      label: "Link Google Maps lokasi",
      type: "url",
      hint: "Tempel link dari Google Maps > Bagikan > Salin link. Lokasi publik akan menjadi clickable setelah diisi.",
      placeholder: "https://maps.google.com/...",
    },
    {
      key: "genresText",
      label: "Genres",
      placeholder: "Breakbeat, Indo Bass, Jedag Jedug",
    },
    {
      key: "portraitImage",
      label: "Portrait image URL",
      type: "url",
      media: true,
    },
    { key: "artistStatement", label: "Artist statement", multiline: true },
  ],
  journey: [
    {
      key: "title",
      label: "Judul journey Indonesia",
      placeholder: "PERJALANAN MUSIK.",
    },
    {
      key: "titleEn",
      label: "Journey title English",
      placeholder: "MUSIC JOURNEY.",
    },
    {
      key: "intro",
      label: "Intro Indonesia",
      multiline: true,
      placeholder: "Biografi singkat yang sudah diverifikasi.",
    },
    {
      key: "introEn",
      label: "Intro English",
      multiline: true,
      placeholder: "A concise verified artist journey.",
    },
    {
      key: "imageUrl",
      label: "Foto / artwork journey",
      type: "url",
      media: true,
      hint: "Opsional. Dipakai sebagai visual pembuka journey homepage.",
    },
    {
      key: "milestonesText",
      label: "Milestone journey",
      multiline: true,
      hint: "Satu baris: Tahun | Judul Indonesia | Copy Indonesia | Judul English | Copy English. Kolom English boleh dikosongkan; format 3 kolom lama tetap diterima.",
      placeholder:
        "2020 | DJ Akbar Remix | Awal perjalanan... | DJ Akbar Remix | The beginning...\nSEKARANG | Akbar Nawasunda | Karya orisinal... | Akbar Nawasunda | Original work...",
    },
  ],
  pressKit: [
    { key: "intro", label: "EPK intro", multiline: true },
    {
      key: "editorialImage",
      label: "Foto editorial / Press card",
      type: "url",
      media: true,
      hint: "Foto ini tampil di kartu EDITORIAL / PRESS pada bagian atas halaman EPK. Jika kosong, EPK memakai Portrait image URL dari Profil sebagai fallback.",
    },
    { key: "snapshotBio", label: "Artist Snapshot bio", multiline: true },
    { key: "snapshotLocation", label: "Artist Snapshot location" },
    {
      key: "snapshotGenresText",
      label: "Artist Snapshot genres",
      placeholder: "Breakbeat, Remix, Production",
    },
    { key: "snapshotAlias", label: "Artist Snapshot alias" },
    { key: "capabilitiesIntro", label: "Capabilities intro", multiline: true },
    { key: "licensingNote", label: "Licensing note", multiline: true },
    { key: "bookingEmail", label: "Booking email", type: "email" },
    { key: "pressEmail", label: "Press email", type: "email" },
    { key: "oneSheetUrl", label: "One sheet URL", type: "url", media: true },
    { key: "photoPackUrl", label: "Photo pack URL", type: "url", media: true },
    { key: "logoPackUrl", label: "Logo pack URL", type: "url", media: true },
    {
      key: "technicalRiderUrl",
      label: "Technical rider URL",
      type: "url",
      media: true,
    },
  ],
  siteSettings: [
    { key: "siteTitle", label: "Judul situs" },
    { key: "metaDescription", label: "Deskripsi SEO", multiline: true },
    { key: "ogTitle", label: "Judul saat dibagikan" },
    {
      key: "ogDescription",
      label: "Deskripsi saat dibagikan",
      multiline: true,
    },
    {
      key: "socialPreviewUrl",
      label: "Gambar preview sosial",
      type: "url",
      media: true,
    },
    { key: "canonicalUrl", label: "URL canonical", type: "url" },
    { key: "contactEmail", label: "Email kontak", type: "email" },
    { key: "bookingEmail", label: "Email booking", type: "email" },
    { key: "pressEmail", label: "Email pers", type: "email" },
    {
      key: "platformLinksText",
      label: "Tautan platform resmi",
      hint: "Satu baris untuk satu link: Nama platform | URL",
      multiline: true,
      placeholder:
        "Spotify | https://...\nYouTube | https://...\nSoundCloud | https://...",
    },
  ],
  legal: [
    { key: "title", label: "Document title" },
    { key: "version", label: "Version" },
    { key: "effectiveDate", label: "Effective date", type: "date" },
    { key: "intro", label: "Introduction", multiline: true },
    {
      key: "sectionsText",
      label: "Sections",
      multiline: true,
      placeholder:
        "key | Heading | Body\ncollection | Information we collect | ...",
    },
  ],
  release: [
    { key: "title", label: "Judul rilisan" },
    { key: "year", label: "Tahun" },
    { key: "format", label: "Format", placeholder: "Single / Remix / Bootleg" },
    { key: "platform", label: "Platform utama" },
    {
      key: "url",
      label: "Link rilisan utama",
      hint: "Ini yang dipakai tombol Dengar Sekarang / Open Release.",
      type: "url",
    },
    { key: "embedUrl", label: "Link embed (opsional)", type: "url" },
    { key: "artworkUrl", label: "Cover rilisan", type: "url", media: true },
    { key: "story", label: "Cerita rilisan (opsional)", multiline: true },
    { key: "credits", label: "Kredit (opsional)", multiline: true },
    { key: "spotifyUrl", label: "Link Spotify (opsional)", type: "url" },
    { key: "appleMusicUrl", label: "Link Apple Music (opsional)", type: "url" },
    {
      key: "platformLinksText",
      label: "Link platform lain",
      hint: "Satu baris untuk satu link: Nama platform | URL",
      multiline: true,
      placeholder:
        "SoundCloud | https://...\nSpotify | https://...\nApple Music | https://...",
    },
  ],
  visual: [
    { key: "title", label: "Visual title" },
    { key: "label", label: "Label", placeholder: "VIDEO TERBARU" },
    { key: "youtubeId", label: "YouTube ID", placeholder: "e.g. rv4DK8nVWd0" },
    { key: "url", label: "Official visual URL", type: "url" },
    { key: "imageUrl", label: "Thumbnail URL", type: "url", media: true },
  ],
  photoStory: [
    { key: "title", label: "Judul foto Indonesia" },
    { key: "titleEn", label: "Photo title English" },
    { key: "label", label: "Label", placeholder: "PHOTO STORY" },
    { key: "imageUrl", label: "Foto story", type: "url", media: true },
    { key: "copyId", label: "Caption Indonesia", multiline: true },
    { key: "copyEn", label: "Caption English", multiline: true },
    { key: "altId", label: "Alt text Indonesia" },
    { key: "altEn", label: "Alt text English" },
    { key: "url", label: "Link story opsional", type: "url" },
  ],
  portrait: [
    { key: "title", label: "Judul studi Indonesia" },
    { key: "titleEn", label: "Judul studi English" },
    { key: "label", label: "Label", placeholder: "STUDI POTRET" },
    { key: "imageUrl", label: "Foto portrait", type: "url", media: true },
    {
      key: "copyId",
      label: "Caption Indonesia",
      multiline: true,
      placeholder: "Deskripsi singkat foto ini.",
    },
    {
      key: "copyEn",
      label: "Caption English",
      multiline: true,
      placeholder: "A short description for the English page.",
    },
    {
      key: "altId",
      label: "Alt text Indonesia",
      placeholder: "Deskripsi foto untuk aksesibilitas",
    },
    {
      key: "altEn",
      label: "Alt text English",
      placeholder: "Accessible image description",
    },
  ],
  live: [
    {
      key: "status",
      label: "Status",
      type: "select",
      options: ["standby", "announced", "active"],
    },
    { key: "message", label: "Public message", multiline: true },
    { key: "actionUrl", label: "Action URL", type: "url" },
  ],
  event: [
    {
      key: "title",
      label: "Nama pertunjukan",
      hint: "Satu dokumen = satu jadwal. Klik Tambah jadwal untuk event berikutnya.",
    },
    { key: "date", label: "Tanggal", type: "date" },
    { key: "time", label: "Jam lokal", placeholder: "21:00 WIB" },
    { key: "city", label: "Kota" },
    { key: "venue", label: "Venue" },
    { key: "country", label: "Negara" },
    {
      key: "mapsUrl",
      label: "Link Google Maps",
      type: "url",
      hint: "Opsional. Ambil dari Google Maps > Bagikan > Salin link.",
      placeholder: "https://maps.google.com/...",
    },
    { key: "posterUrl", label: "Poster pertunjukan", type: "url", media: true },
    { key: "ticketUrl", label: "Link tiket", type: "url" },
    { key: "rsvpUrl", label: "Link RSVP", type: "url" },
    {
      key: "status",
      label: "Status",
      type: "select",
      options: ["announced", "sold out", "cancelled", "past"],
    },
  ],
  game: [
    {
      key: "title",
      label: "Judul game",
      placeholder: "JEDAG RUN — NIGHT FREQUENCY",
    },
    {
      key: "kicker",
      label: "Kicker",
      placeholder: "GAME MINI",
    },
    {
      key: "intro",
      label: "Intro game",
      multiline: true,
      placeholder: "Lari ikut ketukan, kumpulkan not, dan kejar drop-nya.",
    },
    {
      key: "bgmUrl",
      label: "Background music / BGM",
      type: "url",
      media: true,
      hint: "Opsional. Upload audio dari AssetPicker. Audio mulai setelah user menekan Start.",
    },
    {
      key: "jumpSfxUrl",
      label: "SFX lompat",
      type: "url",
      media: true,
      hint: "Opsional. Jika kosong, game memakai fallback Web Audio.",
    },
    {
      key: "collectSfxUrl",
      label: "SFX collect note",
      type: "url",
      media: true,
    },
    {
      key: "hitSfxUrl",
      label: "SFX kena obstacle",
      type: "url",
      media: true,
    },
    {
      key: "dropSfxUrl",
      label: "SFX drop",
      type: "url",
      media: true,
    },
    {
      key: "gameOverSfxUrl",
      label: "SFX game over",
      type: "url",
      media: true,
    },
    {
      key: "shareLabel",
      label: "Label tombol share",
      placeholder: "SHARE SCORE",
    },
  ],
};

function fallbackPayload(type: DocumentType): EditorPayload {
  const platformLinksText = allPlatformLinks
    .map(link => `${link.label} | ${link.href}`)
    .join("\n");
  if (type === "hero")
    return {
      heroKicker: "AKBAR NAWASUNDA",
      heroTitle: "AKBAR NAWASUNDA.",
      heroBody: "Produser dan remixer asal Bandung Barat.",
      heroImage: officialBrand.portrait,
      primaryActionLabel: "DENGAR SEKARANG",
      primaryActionUrl: currentRelease.href,
    };
  if (type === "profile")
    return {
      shortBio: verifiedArtistProfile.shortBio,
      longBio: verifiedArtistProfile.longBio,
      location: verifiedArtistProfile.location,
      genresText: verifiedArtistProfile.genres.join(", "),
      portraitImage: officialBrand.portrait,
    };
  if (type === "journey")
    return {
      title: "PERJALANAN MUSIK.",
      titleEn: "MUSIC JOURNEY.",
      intro:
        "Perjalanan musik Akbar Nawasunda dimulai pada 2020 sebagai bedroom producer independen dengan nama DJ Akbar Remix. Eksperimennya membawa lagu-lagu populer ke wilayah Breakbeat, Jedag Jedug, dan Jungle Dutch bergaya Bandung. Kini, di bawah nama Akbar Nawasunda, ia merilis karya orisinal yang memadukan melodi pop, electronic bass, dan energi remix untuk platform musik digital global.",
      introEn:
        "Akbar Nawasunda's musical journey began in 2020 as an independent bedroom producer known as DJ Akbar Remix. His experiments brought popular songs into a Bandung-rooted space of Breakbeat, Jedag Jedug, and Jungle Dutch. Today, he releases original work shaped by pop melody, electronic bass, and remix energy.",
      milestonesText:
        "2020 | DJ Akbar Remix | Awal perjalanan sebagai bedroom producer independen dengan fokus pada reinterpretasi lagu populer. | DJ Akbar Remix | The beginning as an independent bedroom producer focused on reinterpreting popular songs.\nSEKARANG | Akbar Nawasunda | Karya orisinal dan remix yang membawa energi electronic bass ke platform musik digital. | Akbar Nawasunda | Original work and remixes carrying electronic bass energy across digital music platforms.",
    };
  if (type === "pressKit")
    return {
      intro:
        "Informasi untuk promoter, media, playlist editor, dan kolaborator.",
      editorialImage: officialBrand.editorialPortrait,
      snapshotBio: verifiedArtistProfile.longBio,
      snapshotLocation: verifiedArtistProfile.location,
      snapshotGenresText: verifiedArtistProfile.genres.join(", "),
      snapshotAlias: verifiedArtistProfile.aliases.join(" / "),
      capabilitiesIntro:
        "Format kerja yang tersedia untuk performance, produksi, kolaborasi, dan penggunaan musik.",
      licensingNote: verifiedArtistProfile.licensing,
      bookingEmail: verifiedArtistProfile.bookingEmail,
      pressEmail: verifiedArtistProfile.bookingEmail,
    };
  if (type === "siteSettings")
    return {
      siteTitle: "Akbar Nawasunda | Official Website",
      metaDescription:
        "Website resmi Akbar Nawasunda — produser, remixer, dan musisi independen asal Bandung Barat.",
      ogTitle: "Akbar Nawasunda | Official Website",
      ogDescription: "Website resmi Akbar Nawasunda.",
      socialPreviewUrl: officialBrand.socialPreview,
      canonicalUrl: "https://akbarnawasunda.my.id/",
      contactEmail: verifiedArtistProfile.bookingEmail,
      bookingEmail: verifiedArtistProfile.bookingEmail,
      pressEmail: verifiedArtistProfile.bookingEmail,
      platformLinksText,
    };
  if (type === "release")
    return {
      title: currentRelease.title,
      year: "2025",
      format: "Remix",
      platform: "SoundCloud",
      url: currentRelease.href,
      artworkUrl: currentRelease.image,
      isCurrent: true,
      platformLinksText,
    };
  if (type === "visual") {
    const visual = videos[0];
    return {
      title: visual.title,
      label: visual.label,
      url: visual.href,
      youtubeId: visual.href.split("/").pop() || "",
      imageUrl: visual.image,
    };
  }
  if (type === "photoStory") {
    const study = portraitStudies[0];
    return {
      title: study.titleId,
      titleEn: study.titleEn,
      label: "PHOTO STORY",
      imageUrl: study.src,
      copyId: study.copyId,
      copyEn: study.copyEn,
      altId: study.altId,
      altEn: study.altEn,
    };
  }
  if (type === "portrait") {
    const study = portraitStudies[0];
    return {
      title: study.titleId,
      titleEn: study.titleEn,
      label: "STUDI POTRET",
      imageUrl: study.src,
      copyId: study.copyId,
      copyEn: study.copyEn,
      altId: study.altId,
      altEn: study.altEn,
    };
  }
  if (type === "legal")
    return {
      title: "Privacy Policy",
      version: "1.0",
      effectiveDate: "2026-08-14",
      intro:
        "Penjelasan singkat dan terbuka tentang data yang diproses saat kamu memakai situs resmi Akbar Nawasunda.",
      sectionsText: [
        "short-version | Short version | No advertising, no tracking cookies, no selling data — ever.",
        "collection | What we collect | Nama, email, konteks project, pesan, dan data subscriber hanya diproses untuk kebutuhan layanan situs.",
        "cookies | Cookies & storage | Kami tidak mengatur advertising atau tracking cookies. localStorage terbatas dapat digunakan untuk preferensi interface dan data pendukung autentikasi.",
        "services | Third-party services | Vercel, Google Fonts, Umami, database situs, Spotify, YouTube, SoundCloud, dan Apple iTunes Search.",
        "rights | Your rights | Kamu dapat meminta akses, koreksi, atau penghapusan data pribadi melalui kontak resmi.",
      ].join("\n"),
      readyForPublic: false,
    };
  if (type === "event") return { status: "announced" };
  if (type === "game")
    return {
      title: "JEDAG RUN — NIGHT FREQUENCY",
      kicker: "GAME MINI",
      intro: "Lari ikut ketukan, kumpulkan not, dan kejar drop-nya.",
      isEnabled: true,
      shareLabel: "SHARE SCORE",
    };
  return {
    status: "standby",
    message: "Belum ada jadwal pertunjukan yang diumumkan.",
  };
}

function emptyPayload(type: DocumentType): EditorPayload {
  return fallbackPayload(type);
}

function textValue(payload: EditorPayload, key: string) {
  return typeof payload[key] === "string" ? String(payload[key]) : "";
}

function formatPlatformLinks(value: unknown) {
  if (!Array.isArray(value)) return "";
  return value
    .filter(item =>
      Boolean(item && typeof item === "object" && !Array.isArray(item))
    )
    .map(item => {
      const record = item as Record<string, unknown>;
      return `${typeof record.label === "string" ? record.label : ""} | ${typeof record.href === "string" ? record.href : ""}`;
    })
    .filter(line => line !== " | ")
    .join("\n");
}

function preparedPayload(type: DocumentType, payload: EditorPayload) {
  const next = { ...payload };
  if (type === "journey") {
    next.milestones = textValue(next, "milestonesText")
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(Boolean)
      .map(line => {
        const parts = line.split("|").map(value => value.trim());
        const [year, title, body, titleEn, ...bodyEnParts] = parts;
        return {
          year,
          title,
          body,
          ...(titleEn && bodyEnParts.length
            ? { titleEn, bodyEn: bodyEnParts.join(" | ") }
            : {}),
        };
      })
      .filter(item => item.year && item.title && item.body);
    delete next.milestonesText;
  }

  if (type === "profile") {
    next.genres = textValue(next, "genresText")
      .split(",")
      .map(value => value.trim())
      .filter(Boolean);
    delete next.genresText;
  }
  if (type === "pressKit") {
    next.snapshotGenres = textValue(next, "snapshotGenresText")
      .split(",")
      .map(value => value.trim())
      .filter(Boolean);
    delete next.snapshotGenresText;
  }
  if (type === "legal") {
    next.sections = textValue(next, "sectionsText")
      .split(/\\r?\\n/)
      .map(line => line.trim())
      .filter(Boolean)
      .map(line => {
        const [key, heading, ...bodyParts] = line
          .split("|")
          .map(value => value.trim());
        return { key, heading, body: bodyParts.join(" | ") };
      });
    delete next.sectionsText;
  }
  if (type === "release" || type === "siteSettings") {
    const platformLinks = textValue(next, "platformLinksText")
      .split("\n")
      .map(line => {
        const [label, ...hrefParts] = line
          .split("|")
          .map(value => value.trim());
        return { label, href: hrefParts.join(" | ") };
      })
      .filter(link => link.label && link.href);
    if (platformLinks.length) next.platformLinks = platformLinks;
    else delete next.platformLinks;
    delete next.platformLinksText;
  }
  return next;
}

function displayPayload(document: EditorDocument): EditorPayload {
  const next =
    document.documentType === "pressKit"
      ? { ...fallbackPayload("pressKit"), ...document.payload }
      : { ...document.payload };
  if (document.documentType === "profile" && Array.isArray(next.genres))
    next.genresText = next.genres.join(", ");
  if (document.documentType === "journey" && Array.isArray(next.milestones))
    next.milestonesText = next.milestones
      .map(item =>
        [
          String(item.year || ""),
          String(item.title || ""),
          String(item.body || ""),
          String(item.titleEn || ""),
          String(item.bodyEn || ""),
        ].join(" | ")
      )
      .join("\n");
  if (
    document.documentType === "pressKit" &&
    Array.isArray(next.snapshotGenres)
  )
    next.snapshotGenresText = next.snapshotGenres.join(", ");
  if (document.documentType === "legal" && Array.isArray(next.sections))
    next.sectionsText = next.sections
      .map(
        section =>
          `${String(section.key || "")} | ${String(section.heading || "")} | ${String(section.body || "")}`
      )
      .join("\n");
  if (
    (document.documentType === "release" ||
      document.documentType === "siteSettings") &&
    Array.isArray(next.platformLinks)
  )
    next.platformLinksText = formatPlatformLinks(next.platformLinks);
  return next;
}

function StudioOperations() {
  const content = trpc.content.documentsAll.useQuery();
  const leads = trpc.fanSignal.list.useQuery();
  const published = content.data?.filter(item => item.isPublished).length ?? 0;
  const drafts = (content.data?.length ?? 0) - published;
  const media = (content.data ?? []).filter(item =>
    ["visual", "portrait", "photoStory"].includes(item.documentType)
  ).length;
  const spark = (seed: number) =>
    Array.from({ length: 12 }, (_, index) => {
      const value = Math.sin(seed + index * 1.7) * 0.5 + 0.5;
      return 22 + value * 78;
    });

  return (
    <StatGrid>
      <Stat
        icon={Database}
        kicker="Live"
        value={content.isLoading ? "\u2014" : published}
        label="Dokumen tayang di publik"
        tone="cyan"
        spark={spark(published + 1)}
      />
      <Stat
        icon={Save}
        kicker="Queue"
        value={content.isLoading ? "\u2014" : drafts}
        label="Draft menunggu publish"
        tone="violet"
        spark={spark(drafts + 4)}
      />
      <Stat
        icon={ImageIcon}
        kicker="Visual"
        value={content.isLoading ? "\u2014" : media}
        label="Visual, portrait, photo story"
        tone="amber"
        spark={spark(media + 6)}
      />
      <Stat
        icon={Radio}
        kicker="Signal"
        value={leads.isLoading ? "\u2014" : (leads.data?.length ?? 0)}
        label="Fan signal leads"
        tone="mint"
        spark={spark((leads.data?.length ?? 0) + 8)}
      />
    </StatGrid>
  );
}

type StudioTab = "overview" | "compose" | "library" | "archive";
type LibraryStatus = "all" | "published" | "draft";

function libraryDestination(documentType: string) {
  if (documentType === "release") return "Homepage + Music + EPK";
  if (documentType === "journey")
    return "Homepage Artist Journey + About / Universe";
  if (documentType === "photoStory") return "Homepage Photo Story + Visuals";
  if (documentType === "event" || documentType === "live")
    return "Live + Homepage";
  if (documentType === "profile") return "About + Universe + EPK";
  if (documentType === "pressKit") return "EPK";
  if (documentType === "visual") return "Visuals + Homepage";
  if (documentType === "portrait") return "Visuals \u2192 Portrait gallery";
  if (documentType === "legal") return "Privacy / Legal";
  if (documentType === "game") return "JEDAG RUN + teaser homepage";
  return "Homepage + metadata";
}

function StudioField({
  documentType,
  field,
  payload,
  updateField,
}: {
  documentType: DocumentType;
  field: FieldSpec;
  payload: EditorPayload;
  updateField: (key: string, value: string | boolean) => void;
}) {
  const value = textValue(payload, field.key);
  return (
    <div className={field.multiline ? "space-y-2 sm:col-span-2" : "space-y-2"}>
      <div className="flex items-center justify-between gap-3">
        <label className="font-mono text-[10px] font-medium uppercase tracking-[0.15em] text-white/50">
          {field.label}
        </label>
        {field.media ? (
          <span className="rounded-full border border-cyan-200/15 bg-cyan-200/[0.06] px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-cyan-100/70">
            Managed media
          </span>
        ) : null}
      </div>
      {field.type === "select" ? (
        <select
          value={value}
          onChange={event => updateField(field.key, event.target.value)}
          className="h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none transition focus:border-cyan-200/50 focus:ring-2 focus:ring-cyan-200/10"
        >
          {field.options?.map(option => (
            <option value={option} key={option} className="bg-[#12141a]">
              {option}
            </option>
          ))}
        </select>
      ) : field.media ? (
        <AssetPicker
          value={value}
          onChange={nextValue => updateField(field.key, nextValue)}
        />
      ) : field.multiline ? (
        <Textarea
          value={value}
          onChange={event => updateField(field.key, event.target.value)}
          placeholder={field.placeholder}
          rows={4}
          className="min-h-28 rounded-xl border-white/10 bg-black/20 text-white placeholder:text-white/25 focus:border-cyan-200/50 focus:ring-2 focus:ring-cyan-200/10"
        />
      ) : (
        <Input
          type={field.type || "text"}
          value={value}
          onChange={event => updateField(field.key, event.target.value)}
          placeholder={field.placeholder}
          className="h-11 rounded-xl border-white/10 bg-black/20 text-white placeholder:text-white/25 focus:border-cyan-200/50 focus:ring-2 focus:ring-cyan-200/10"
        />
      )}
      <p className="text-[10px] leading-4 text-cyan-100/45">
        Dipakai di: {usageForField(documentType, field.key)}
      </p>
      {field.hint ? (
        <p className="text-[10px] leading-4 text-white/35">{field.hint}</p>
      ) : null}
      {field.type === "url" && !field.media ? (
        <StudioLinkPreview value={value} label={`${field.label} preview`} />
      ) : null}
      {field.key === "platformLinksText" ? (
        <StudioLinkListPreview value={value} label="Platform links preview" />
      ) : null}
    </div>
  );
}

export default function ContentStudio() {
  const search = useSearch();
  const [, navigate] = useLocation();
  const { user, loading } = useAuth();
  const utils = trpc.useUtils();
  const [documentType, setDocumentType] = useState<DocumentType>("hero");
  const [slug, setSlug] = useState("default");
  const [payload, setPayload] = useState<EditorPayload>(() =>
    emptyPayload("hero")
  );
  const [sortOrder, setSortOrder] = useState(0);
  const [isPublished, setIsPublished] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [tab, setTab] = useState<StudioTab>("overview");
  const [libraryQuery, setLibraryQuery] = useState("");
  const [libraryType, setLibraryType] = useState<string>("all");
  const [libraryStatus, setLibraryStatus] = useState<LibraryStatus>("all");
  const documents = trpc.content.documentsAll.useQuery(undefined, {
    enabled: user?.role === "admin",
  });
  const save = trpc.content.saveDocument.useMutation({
    onSuccess: async () => {
      setIsDirty(false);
      toast.success(isPublished ? "Document published." : "Draft saved.");
      await utils.content.documentsAll.invalidate();
      await utils.content.documents.invalidate();
    },
    onError: error =>
      toast.error(error.message || "Document could not be saved."),
  });
  const remove = trpc.content.deleteDocument.useMutation({
    onSuccess: async () => {
      toast.success("Document removed.");
      resetEditor();
      await utils.content.documentsAll.invalidate();
      await utils.content.documents.invalidate();
    },
    onError: error =>
      toast.error(error.message || "Document could not be removed."),
  });
  const focusCompose = useCallback(() => {
    setTab("compose");
    window.requestAnimationFrame(() =>
      document
        .getElementById("studio-compose")
        ?.scrollIntoView({ behavior: "smooth", block: "start" })
    );
  }, []);

  const visualDocuments = useMemo(
    () =>
      (documents.data ?? []).filter(
        document => document.documentType === "visual"
      ),
    [documents.data]
  );
  const portraitDocuments = useMemo(
    () =>
      (documents.data ?? []).filter(
        document => document.documentType === "portrait"
      ),
    [documents.data]
  );
  const filteredDocuments = useMemo(() => {
    const query = libraryQuery.trim().toLowerCase();
    return (documents.data ?? []).filter(document => {
      if (libraryType !== "all" && document.documentType !== libraryType)
        return false;
      if (libraryStatus === "published" && !document.isPublished) return false;
      if (libraryStatus === "draft" && document.isPublished) return false;
      if (!query) return true;
      const haystack = [
        document.slug,
        document.documentType,
        textValue(document.payload, "title"),
        textValue(document.payload, "siteTitle"),
        textValue(document.payload, "heroTitle"),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [documents.data, libraryQuery, libraryStatus, libraryType]);

  // ⌘S / Ctrl+S menyimpan dokumen yang sedang dibuka tanpa meraih tombol.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "s")
        return;
      event.preventDefault();
      const form = document.getElementById(
        "studio-editor-form"
      ) as HTMLFormElement | null;
      if (!form) return;
      setTab("compose");
      form.requestSubmit();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Command palette bisa hanya mengubah query ketika /studio tetap terpasang.
  useEffect(() => {
    const requested = new URLSearchParams(search).get("compose");
    if (!requested) return;
    const known = documentTypes.some(type => type.value === requested);
    if (known) {
      setDocumentType(requested as DocumentType);
      setPayload(emptyPayload(requested as DocumentType));
      setShowAdvanced(
        !primaryWorkflowTypes.includes(requested as DocumentType)
      );
      setTab("compose");
    }
    const remainingSearch = new URLSearchParams(window.location.search);
    remainingSearch.delete("compose");
    const query = remainingSearch.toString();
    const nextLocation =
      `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
    navigate(nextLocation, { replace: true });
  }, [navigate, search]);

  const fields = useMemo(() => fieldsByType[documentType], [documentType]);
  const selectedType = documentTypes.find(type => type.value === documentType);
  const currentWorkflow = primaryWorkflows.find(
    workflow => workflow.type === documentType
  );
  const isPrimaryDocument = primaryWorkflowTypes.includes(documentType);
  useEffect(() => {
    if (!isDirty) return;
    const warnBeforeLeaving = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warnBeforeLeaving);
    return () => window.removeEventListener("beforeunload", warnBeforeLeaving);
  }, [isDirty]);

  const visibleFields = useMemo(() => {
    if (showAdvanced || !isPrimaryDocument) return fields;
    if (documentType === "release")
      return fields.filter(field =>
        [
          "title",
          "year",
          "format",
          "platform",
          "url",
          "artworkUrl",
          "platformLinksText",
        ].includes(field.key)
      );
    if (documentType === "siteSettings")
      return fields.filter(field => field.key === "platformLinksText");
    return fields;
  }, [documentType, fields, isPrimaryDocument, showAdvanced]);

  function resetEditor(nextType: DocumentType = documentType) {
    if (
      isDirty &&
      !window.confirm(
        "Ada perubahan yang belum disimpan. Tetap pindah dan membuang perubahan ini?"
      )
    )
      return;
    setDocumentType(nextType);
    setSlug("default");
    setPayload(emptyPayload(nextType));
    setSortOrder(0);
    setIsPublished(true);
    setEditingId(null);
    setShowAdvanced(!primaryWorkflowTypes.includes(nextType));
    setIsDirty(false);
  }
  function loadDocument(document: EditorDocument) {
    if (
      isDirty &&
      !window.confirm(
        "Ada perubahan yang belum disimpan. Tetap membuka dokumen lain?"
      )
    )
      return;
    setDocumentType(document.documentType);
    setSlug(document.slug);
    setPayload(displayPayload(document));
    setSortOrder(document.sortOrder);
    setIsPublished(document.isPublished);
    setEditingId(document.id);
    setShowAdvanced(!primaryWorkflowTypes.includes(document.documentType));
    setIsDirty(false);
  }
  function openEditorForType(type: DocumentType) {
    const existing = documents.data?.find(
      document => document.documentType === type
    );
    if (existing) loadDocument(existing);
    else resetEditor(type);
    focusCompose();
  }

  function updateField(key: string, value: string | boolean) {
    setPayload(current => ({ ...current, [key]: value }));
    setIsDirty(true);
  }
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextPayload = preparedPayload(documentType, payload);
    const generatedSlug =
      ["release", "event"].includes(documentType) &&
      (!slug.trim() || slug.trim() === "default")
        ? slugify(textValue(nextPayload, "title"))
        : "";
    save.mutate({
      documentType,
      slug:
        slug.trim() && slug.trim() !== "default"
          ? slug.trim()
          : generatedSlug || "default",
      payload: nextPayload,
      sortOrder,
      isPublished,
    });
  }
  function confirmDelete(document: EditorDocument) {
    if (window.confirm(`Remove ${document.documentType} / ${document.slug}?`))
      remove.mutate({ id: document.id });
  }

  if (loading)
    return (
      <div className="studio-os grid min-h-dvh place-items-center text-sm text-white/50">
        <span className="relative z-[1] font-mono text-[11px] uppercase tracking-[0.3em]">
          Memeriksa akses studio…
        </span>
      </div>
    );
  if (!user)
    return (
      <OwnerLoginCard
        title="Studio access"
        description="Sign in with the private owner credentials to manage the website."
      />
    );
  if (user.role !== "admin")
    return (
      <main className="studio-os grid min-h-dvh place-items-center p-6 text-white">
        <section className="st-panel relative z-[1] max-w-md p-8 text-center">
          <ShieldCheck className="mx-auto mb-5 h-9 w-9 text-cyan-200" />
          <h1 className="text-3xl font-semibold">Owner access required</h1>
          <p className="mt-3 text-white/55">
            This editor is reserved for the authenticated site owner.
          </p>
          <a
            className="mt-7 inline-flex items-center gap-2 text-sm text-cyan-100 underline"
            href="/"
          >
            Return to public site <ArrowUpRight size={15} />
          </a>
        </section>
      </main>
    );

  return (
    <DashboardLayout title="Content Studio" kicker="AN // Operate">
      <div className="space-y-6">
        <StudioHero
          kicker="AN // Content operations"
          title={
            <>
              Control the <em>signal.</em>
            </>
          }
          lead="Bentuk situs publik dari satu workspace. Susun konten, pasang media terkelola, dan tentukan kapan sebuah perubahan tayang."
          actions={
            <>
              <StudioButton
                variant="primary"
                onClick={() => focusCompose()}
                type="button"
              >
                <Plus size={14} /> Dokumen baru
              </StudioButton>
              <StudioLink href="/assets">
                <FolderOpen size={14} /> Media library
              </StudioLink>
              <StudioLink href="/" target="_blank" rel="noreferrer">
                Situs publik <ArrowUpRight size={13} />
              </StudioLink>
            </>
          }
          aside={
            <div className="flex flex-col items-start gap-2 sm:items-end">
              <Pill tone="live">
                <span className="studio-dot" /> Protected workspace
              </Pill>
              <Pill tone={isDirty ? "draft" : "accent"}>
                {isDirty ? "Ada perubahan belum disimpan" : "Semua tersimpan"}
              </Pill>
            </div>
          }
        />

        <StudioOperations />

        <StudioTabs
          items={[
            { id: "overview", label: "Overview", icon: LayoutList },
            { id: "compose", label: "Compose", icon: FilePenLine },
            {
              id: "library",
              label: "Library",
              icon: Database,
              count: documents.data?.length ?? 0,
            },
            {
              id: "archive",
              label: "Archives",
              icon: ImageIcon,
              count: visualDocuments.length + portraitDocuments.length,
            },
          ]}
          value={tab}
          onChange={next => setTab(next as StudioTab)}
        />

        {tab === "overview" ? (
          <div className="space-y-5 st-rise">
            <section id="studio-quick-actions">
              <Panel
                eyebrow="Quick actions"
                icon={Sparkles}
                title="Mau update apa hari ini?"
                description="Pilih alur utama di bawah. Studio mengurus tipe dokumen dan slug secara otomatis."
              >
                <div className="grid gap-3 md:grid-cols-3">
                  {primaryWorkflows.map(workflow => {
                    const Icon = workflow.icon;
                    const active = documentType === workflow.type && !editingId;
                    return (
                      <button
                        type="button"
                        key={workflow.type}
                        onClick={() => {
                          resetEditor(workflow.type);
                          focusCompose();
                        }}
                        className={`group rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 ${active ? "border-cyan-200/45 bg-cyan-200/[0.1]" : "border-white/[0.09] bg-black/[0.14] hover:border-cyan-200/25 hover:bg-white/[0.04]"}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <span
                            className={`grid h-10 w-10 place-items-center rounded-xl ${active ? "bg-cyan-200 text-[#071014]" : "bg-white/[0.07] text-cyan-100/70"}`}
                          >
                            <Icon size={17} />
                          </span>
                          <Plus
                            size={15}
                            className="text-white/25 transition group-hover:text-cyan-100/70"
                          />
                        </div>
                        <p className="mt-5 font-mono text-[9px] uppercase tracking-[0.2em] text-cyan-100/45">
                          {workflow.eyebrow} / workflow
                        </p>
                        <h3 className="mt-1 text-sm font-semibold text-white">
                          {workflow.title}
                        </h3>
                        <p className="mt-1 text-xs leading-5 text-white/40">
                          {workflow.description}
                        </p>
                        <span className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-cyan-100/70">
                          {workflow.action} <ArrowUpRight size={12} />
                        </span>
                      </button>
                    );
                  })}
                </div>
              </Panel>
            </section>

            <StudioPageMirror
              documents={documents.data ?? []}
              onEditType={type => openEditorForType(type as DocumentType)}
            />

            <StudioGalleryAnalytics />
          </div>
        ) : null}

        {tab === "compose" ? (
          <div className="grid items-start gap-5 st-rise 2xl:grid-cols-[minmax(0,1.1fr)_minmax(380px,0.9fr)]">
            <section id="studio-compose" className="st-panel">
              <header className="st-panel-head">
                <div className="min-w-0">
                  <Eyebrow icon={FilePenLine}>01 // Compose</Eyebrow>
                  <h2 className="st-title">
                    {editingId
                      ? "Edit konten yang sudah ada"
                      : currentWorkflow?.title || "Mulai dokumen baru"}
                  </h2>
                  <p className="st-sub">
                    {currentWorkflow?.description || selectedType?.description}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Pill tone="draft">
                      {editingId
                        ? "Sumber: CMS tersimpan"
                        : "Sumber: isi publik / fallback terverifikasi"}
                    </Pill>
                    {documentType === "release" || documentType === "event" ? (
                      <Pill>Slug otomatis dari judul</Pill>
                    ) : null}
                  </div>
                </div>
                {editingId ? (
                  <StudioButton type="button" onClick={() => resetEditor()}>
                    Dokumen baru
                  </StudioButton>
                ) : (
                  <Pill tone="accent">
                    <Sparkles size={11} /> Draft first
                  </Pill>
                )}
              </header>

              <div className="px-4 pt-4 sm:px-6">
                <div className="st-savebar" data-dirty={isDirty}>
                  <div className="min-w-0">
                    <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-cyan-100/55">
                      02 // Save state
                    </p>
                    <p className="mt-1 truncate text-xs text-white/65">
                      {editingId
                        ? `Mengedit ${selectedType?.label || documentType}`
                        : `Dokumen baru · ${selectedType?.label || documentType}`}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Pill tone={isDirty ? "draft" : "neutral"}>
                      {isDirty ? "Belum disimpan" : "Tidak ada perubahan"}
                    </Pill>
                    <span className="hidden sm:inline-flex">
                      <Pill tone={isPublished ? "live" : "draft"}>
                        {isPublished ? "Tayang setelah simpan" : "Draft saja"}
                      </Pill>
                    </span>
                    <StudioButton
                      type="submit"
                      form="studio-editor-form"
                      variant="primary"
                      disabled={save.isPending}
                    >
                      <Save size={13} />
                      {isPublished ? "Simpan & tampilkan" : "Simpan draft"}
                    </StudioButton>
                  </div>
                </div>
              </div>

              <form
                id="studio-editor-form"
                onSubmit={submit}
                className="space-y-6 p-4 sm:p-6"
              >
                <StudioPublishChecklist
                  documentType={documentType}
                  payload={payload}
                  isPublished={isPublished}
                />
                {isPrimaryDocument && !showAdvanced ? (
                  <div className="flex flex-col gap-4 rounded-2xl border border-cyan-200/15 bg-cyan-200/[0.055] p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-cyan-100/55">
                        Workflow aktif
                      </p>
                      <p className="mt-1 text-sm font-semibold text-white">
                        {currentWorkflow?.title}
                      </p>
                      <p className="mt-1 text-xs text-white/45">
                        {currentWorkflow?.description}
                      </p>
                    </div>
                    <StudioButton
                      type="button"
                      onClick={() => setShowAdvanced(true)}
                    >
                      Pengaturan lanjutan <ChevronDown size={13} />
                    </StudioButton>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-[1.1fr_0.9fr]">
                    <div className="space-y-2">
                      <label className="font-mono text-[10px] font-medium uppercase tracking-[0.15em] text-white/50">
                        Document type
                      </label>
                      <select
                        value={documentType}
                        onChange={event =>
                          resetEditor(event.target.value as DocumentType)
                        }
                        className="h-12 w-full rounded-xl border border-cyan-200/20 bg-cyan-200/[0.06] px-3 text-sm font-medium text-white outline-none transition focus:border-cyan-200/60"
                      >
                        {documentTypes.map(type => (
                          <option
                            value={type.value}
                            key={type.value}
                            className="bg-[#12141a]"
                          >
                            {type.eyebrow} / {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <label className="font-mono text-[10px] font-medium uppercase tracking-[0.15em] text-white/50">
                          Slug internal
                        </label>
                        <span className="text-[9px] uppercase tracking-[0.12em] text-white/30">
                          Opsional
                        </span>
                      </div>
                      <Input
                        value={slug}
                        onChange={event => {
                          setSlug(event.target.value);
                          setIsDirty(true);
                        }}
                        placeholder="Otomatis dari judul"
                        className="h-12 rounded-xl border-white/10 bg-black/20 text-white placeholder:text-white/25 focus:border-cyan-200/50"
                      />
                    </div>
                  </div>
                )}
                <div className="h-px bg-white/[0.07]" />
                <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
                  {visibleFields.map(field => (
                    <StudioField
                      documentType={documentType}
                      field={field}
                      payload={payload}
                      updateField={updateField}
                      key={field.key}
                    />
                  ))}
                </div>
                {documentType === "release" ? (
                  <label className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-black/15 px-4 py-3 text-xs text-white/65">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-cyan-300"
                      checked={Boolean(payload.isCurrent)}
                      onChange={event =>
                        updateField("isCurrent", event.target.checked)
                      }
                    />{" "}
                    Jadikan rilisan terbaru di homepage
                  </label>
                ) : null}
                {documentType === "legal" ? (
                  <label className="flex items-center gap-3 rounded-xl border border-amber-200/10 bg-amber-200/[0.04] px-4 py-3 text-xs text-amber-100/70">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-amber-300"
                      checked={Boolean(payload.readyForPublic)}
                      onChange={event =>
                        updateField("readyForPublic", event.target.checked)
                      }
                    />{" "}
                    Tampilkan dokumen legal ke publik
                  </label>
                ) : null}
                {documentType === "event" ? (
                  <label className="flex items-center gap-3 rounded-xl border border-cyan-200/10 bg-cyan-200/[0.04] px-4 py-3 text-xs text-cyan-100/70">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-cyan-300"
                      checked={Boolean(payload.isFeatured)}
                      onChange={event =>
                        updateField("isFeatured", event.target.checked)
                      }
                    />{" "}
                    Jadikan jadwal utama / show berikutnya
                  </label>
                ) : null}
                {documentType === "game" ? (
                  <label className="flex items-center gap-3 rounded-xl border border-cyan-200/10 bg-cyan-200/[0.04] px-4 py-3 text-xs text-cyan-100/70">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-cyan-300"
                      checked={payload.isEnabled !== false}
                      onChange={event =>
                        updateField("isEnabled", event.target.checked)
                      }
                    />{" "}
                    Aktifkan route game dan teaser homepage
                  </label>
                ) : null}
                <div className="grid gap-4 border-t border-white/[0.08] pt-5 sm:grid-cols-[0.8fr_1.2fr]">
                  <div className="space-y-2">
                    <label className="font-mono text-[10px] font-medium uppercase tracking-[0.15em] text-white/50">
                      Urutan tampil
                    </label>
                    <Input
                      type="number"
                      min="0"
                      value={sortOrder}
                      onChange={event => {
                        setSortOrder(Number(event.target.value));
                        setIsDirty(true);
                      }}
                      className="h-11 rounded-xl border-white/10 bg-black/20 text-white focus:border-cyan-200/50"
                    />
                  </div>
                  <label
                    className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-xs transition ${isPublished ? "border-emerald-200/20 bg-emerald-200/[0.06] text-emerald-100/80" : "border-white/10 bg-black/15 text-white/50"}`}
                  >
                    <span>
                      <span className="block font-medium">
                        {isPublished
                          ? "Tampilkan ke publik"
                          : "Simpan sebagai draft"}
                      </span>
                      <span className="mt-1 block text-[10px] opacity-60">
                        {isPublished
                          ? "Perubahan terlihat di website setelah disimpan"
                          : "Belum terlihat publik sampai siap"}
                      </span>
                    </span>
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-emerald-300"
                      checked={isPublished}
                      onChange={event => {
                        setIsPublished(event.target.checked);
                        setIsDirty(true);
                      }}
                    />
                  </label>
                </div>
                <div className="rounded-xl border border-cyan-200/10 bg-cyan-200/[0.035] px-4 py-3 text-xs leading-5 text-white/45">
                  <span className="font-medium text-cyan-100/75">
                    Media & preview:
                  </span>{" "}
                  upload atau ganti gambar/audio/video/PDF langsung dari field
                  media. URL akan menampilkan preview platform dan tombol buka
                  sebelum disimpan. Tekan{" "}
                  <kbd className="rounded border border-white/10 bg-black/30 px-1.5 py-0.5 font-mono text-[10px]">
                    ⌘S
                  </kbd>{" "}
                  untuk menyimpan.
                </div>
                <StudioButton
                  type="submit"
                  variant="primary"
                  className="h-12 w-full"
                  disabled={save.isPending}
                >
                  {save.isPending
                    ? "Menyimpan…"
                    : isPublished
                      ? "Simpan & tampilkan"
                      : "Simpan sebagai draft"}
                </StudioButton>
              </form>
            </section>

            <aside className="space-y-5 2xl:sticky 2xl:top-24">
              <StudioDocumentPreview
                documentType={documentType}
                payload={payload}
                slug={slug}
              />
            </aside>
          </div>
        ) : null}

        {tab === "library" ? (
          <section id="studio-document-library" className="st-panel st-rise">
            <header className="st-panel-head">
              <div className="min-w-0">
                <Eyebrow icon={LayoutList}>02 // Library</Eyebrow>
                <h2 className="st-title">Managed documents</h2>
                <p className="st-sub">
                  {documents.data?.length ?? 0} dokumen tersimpan ·{" "}
                  {filteredDocuments.length} ditampilkan
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search
                    size={13}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
                  />
                  <Input
                    value={libraryQuery}
                    onChange={event => setLibraryQuery(event.target.value)}
                    placeholder="Cari judul atau slug…"
                    className="h-9 w-56 rounded-xl border-white/10 bg-black/25 pl-8 text-xs text-white placeholder:text-white/25 focus:border-cyan-200/50"
                  />
                </div>
                <select
                  value={libraryType}
                  onChange={event => setLibraryType(event.target.value)}
                  className="h-9 rounded-xl border border-white/10 bg-black/25 px-2.5 text-xs text-white outline-none focus:border-cyan-200/50"
                >
                  <option value="all" className="bg-[#12141a]">
                    Semua tipe
                  </option>
                  {documentTypes.map(type => (
                    <option
                      key={type.value}
                      value={type.value}
                      className="bg-[#12141a]"
                    >
                      {type.label}
                    </option>
                  ))}
                </select>
                <select
                  value={libraryStatus}
                  onChange={event =>
                    setLibraryStatus(event.target.value as LibraryStatus)
                  }
                  className="h-9 rounded-xl border border-white/10 bg-black/25 px-2.5 text-xs text-white outline-none focus:border-cyan-200/50"
                >
                  <option value="all" className="bg-[#12141a]">
                    Semua status
                  </option>
                  <option value="published" className="bg-[#12141a]">
                    Published
                  </option>
                  <option value="draft" className="bg-[#12141a]">
                    Draft
                  </option>
                </select>
              </div>
            </header>
            <div className="st-panel-body">
              {documents.isLoading ? (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-32 animate-pulse rounded-2xl bg-white/[0.04]"
                    />
                  ))}
                </div>
              ) : documents.isError ? (
                <div className="rounded-xl border border-red-200/15 bg-red-200/[0.05] p-5 text-sm text-red-100/75">
                  Dokumen tidak dapat dimuat.
                </div>
              ) : filteredDocuments.length ? (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredDocuments.map(document => (
                    <article
                      className={`group relative overflow-hidden rounded-2xl border p-4 transition hover:-translate-y-0.5 ${editingId === document.id ? "border-cyan-200/45 bg-cyan-200/[0.08]" : "border-white/[0.08] bg-black/[0.14] hover:border-white/20 hover:bg-white/[0.04]"}`}
                      key={document.id}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <button
                          type="button"
                          className="min-w-0 flex-1 text-left"
                          onClick={() => {
                            loadDocument(document);
                            focusCompose();
                          }}
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/35">
                              {document.documentType}
                            </span>
                            <span className="text-white/20">/</span>
                            <span className="truncate font-mono text-[9px] text-white/45">
                              {document.slug}
                            </span>
                          </div>
                          <p className="mt-3 truncate text-sm font-medium text-white/85">
                            {textValue(document.payload, "title") ||
                              textValue(document.payload, "siteTitle") ||
                              textValue(document.payload, "heroTitle") ||
                              document.slug}
                          </p>
                          <p className="mt-1 text-[10px] text-white/35">
                            Updated{" "}
                            {new Date(document.updatedAt).toLocaleString()}
                          </p>
                          <p className="mt-2 text-[10px] leading-4 text-cyan-100/45">
                            Dipakai di:{" "}
                            {libraryDestination(document.documentType)}
                          </p>
                        </button>
                        <div className="flex flex-col items-end gap-2">
                          <Pill tone={document.isPublished ? "live" : "draft"}>
                            {document.isPublished ? "Live" : "Draft"}
                          </Pill>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 shrink-0 rounded-lg px-2 text-red-200/55 hover:bg-red-200/10 hover:text-red-100"
                            onClick={() => confirmDelete(document)}
                            disabled={remove.isPending}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : documents.data?.length ? (
                <EmptyState
                  icon={Search}
                  title="Tidak ada dokumen yang cocok."
                  description="Ubah kata kunci, tipe, atau status filter untuk melihat dokumen lain."
                />
              ) : (
                <EmptyState
                  icon={Database}
                  title="Belum ada dokumen tersimpan."
                  description="Situs publik memakai fallback terverifikasi sampai dokumen pertama dipublikasikan di sini."
                  action={
                    <StudioButton
                      type="button"
                      variant="primary"
                      onClick={() => focusCompose()}
                    >
                      <Plus size={14} /> Buat dokumen pertama
                    </StudioButton>
                  }
                />
              )}
            </div>
          </section>
        ) : null}

        {tab === "archive" ? (
          <div className="space-y-5 st-rise">
            <StudioVisualArchive
              documents={visualDocuments.map(document => ({
                ...document,
                documentType: "visual" as const,
              }))}
              fallbacks={videos.map((visual, index) => ({
                id: `fallback-${index}`,
                title: visual.title,
                label: visual.label,
                href: visual.href,
                image: visual.image,
              }))}
              onAdd={() => {
                resetEditor("visual");
                focusCompose();
              }}
              onEdit={visualDocument => {
                loadDocument(visualDocument);
                focusCompose();
              }}
              onImportFallback={visual => {
                setDocumentType("visual");
                setSlug(slugify(visual.title));
                setPayload({
                  title: visual.title,
                  label: visual.label,
                  youtubeId: visual.href.split("/").pop() || "",
                  url: visual.href,
                  imageUrl: visual.image,
                });
                setSortOrder(0);
                setIsPublished(true);
                setEditingId(null);
                setShowAdvanced(false);
                setIsDirty(true);
                focusCompose();
              }}
            />

            <StudioPortraitArchive
              documents={portraitDocuments.map(document => ({
                ...document,
                documentType: "portrait" as const,
              }))}
              fallbacks={publicPortraitStudies(null)}
              onAdd={() => {
                resetEditor("portrait");
                focusCompose();
              }}
              onEdit={portraitDocument => {
                loadDocument(portraitDocument);
                focusCompose();
              }}
              onImportFallback={study => {
                setDocumentType("portrait");
                setSlug(slugify(study.title));
                setPayload({
                  title: study.title,
                  titleEn: study.titleEn || "",
                  label: study.label || "STUDI POTRET",
                  imageUrl: study.imageUrl,
                  copyId: study.copyId || "",
                  copyEn: study.copyEn || "",
                  altId: study.altId || "",
                  altEn: study.altEn || "",
                });
                setSortOrder(study.order || 0);
                setIsPublished(true);
                setEditingId(null);
                setShowAdvanced(true);
                setIsDirty(true);
                focusCompose();
              }}
            />

            <StudioLeaderboardManager />
          </div>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
