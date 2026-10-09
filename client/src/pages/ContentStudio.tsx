/**
 * CONTENT STUDIO v2 — dirancang ulang biar gampang dibaca.
 * - 4 tab saja: Ringkasan / Tulis / Koleksi / Arsip
 * - Tulis: form dikelompokkan, bukan 1 dump panjang
 * - Koleksi: tabel, bukan kartu berisik
 * - Bahasa: Indonesia santai, konsisten
 */
import {
  ArrowUpRight,
  CalendarDays,
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
  Search,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
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
  HelpCallout,
} from "@/studio/StudioKit";

/* ---------- Document types ---------- */
const documentTypes = [
  { value: "hero", label: "Hero homepage", group: "Halaman" },
  { value: "profile", label: "Profil artis", group: "Halaman" },
  { value: "journey", label: "Artist Journey", group: "Halaman" },
  { value: "pressKit", label: "Press & Booking (EPK)", group: "Halaman" },
  { value: "siteSettings", label: "Pengaturan & Tautan", group: "Halaman" },
  { value: "legal", label: "Legal / Privacy", group: "Halaman" },
  { value: "release", label: "Rilisan musik", group: "Musik" },
  { value: "visual", label: "Visual archive", group: "Visual" },
  { value: "portrait", label: "Portrait study", group: "Visual" },
  { value: "photoStory", label: "Photo Story", group: "Visual" },
  { value: "live", label: "Live signal", group: "Live" },
  { value: "event", label: "Jadwal show", group: "Live" },
  { value: "game", label: "Game JEDAG RUN", group: "Live" },
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
  updatedAt: string;
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
  group?: string;
};

const primaryWorkflowTypes: DocumentType[] = [
  "release",
  "event",
  "visual",
  "portrait",
  "photoStory",
  "profile",
  "pressKit",
  "siteSettings",
  "journey",
  "game",
];

const workflows = [
  {
    type: "release" as const,
    title: "Rilisan baru",
    desc: "Judul, cover, link Spotify & lainnya",
    icon: Disc3,
    group: "Musik",
  },
  {
    type: "event" as const,
    title: "Jadwal show",
    desc: "Tanggal, venue, tiket, poster",
    icon: CalendarDays,
    group: "Live",
  },
  {
    type: "visual" as const,
    title: "Visual / Video",
    desc: "Thumbnail YouTube & link resmi",
    icon: ImageIcon,
    group: "Visual",
  },
  {
    type: "portrait" as const,
    title: "Portrait",
    desc: "Foto, caption, alt text",
    icon: ImageIcon,
    group: "Visual",
  },
  {
    type: "photoStory" as const,
    title: "Photo Story",
    desc: "Cerita visual homepage",
    icon: ImageIcon,
    group: "Visual",
  },
  {
    type: "profile" as const,
    title: "Profil & lokasi",
    desc: "Bio, genre, Maps",
    icon: MapPin,
    group: "Halaman",
  },
  {
    type: "pressKit" as const,
    title: "Press & Booking",
    desc: "EPK, foto editorial, kontak",
    icon: FilePenLine,
    group: "Halaman",
  },
  {
    type: "siteSettings" as const,
    title: "Tautan resmi",
    desc: "Spotify, YouTube, dll",
    icon: Link2,
    group: "Halaman",
  },
  {
    type: "journey" as const,
    title: "Artist Journey",
    desc: "Bio panjang & milestone",
    icon: FilePenLine,
    group: "Halaman",
  },
  {
    type: "game" as const,
    title: "Game JEDAG RUN",
    desc: "Copy, BGM, SFX",
    icon: Gamepad2,
    group: "Live",
  },
];

/* ---------- Fields ---------- */
const fieldsByType: Record<DocumentType, FieldSpec[]> = {
  hero: [
    { key: "heroKicker", label: "Kicker kecil", placeholder: "AKBAR NAWASUNDA", group: "Identitas" },
    { key: "heroTitle", label: "Judul hero", placeholder: "AKBAR NAWASUNDA.", group: "Identitas" },
    { key: "heroBody", label: "Deskripsi singkat", multiline: true, group: "Identitas" },
    { key: "heroImage", label: "Foto hero", type: "url", media: true, group: "Media" },
    { key: "primaryActionLabel", label: "Label tombol", placeholder: "DENGAR SEKARANG", group: "Aksi" },
    { key: "primaryActionUrl", label: "Link tombol", type: "url", group: "Aksi" },
  ],
  profile: [
    { key: "shortBio", label: "Bio singkat", multiline: true, group: "Bio" },
    { key: "longBio", label: "Bio panjang", multiline: true, group: "Bio" },
    { key: "location", label: "Lokasi", placeholder: "Bandung Barat, Indonesia", group: "Lokasi" },
    { key: "locationUrl", label: "Link Google Maps", type: "url", hint: "Ambil dari Google Maps > Bagikan", group: "Lokasi" },
    { key: "genresText", label: "Genre (pisah koma)", placeholder: "Breakbeat, Indo Bass", group: "Bio" },
    { key: "portraitImage", label: "Foto portrait", type: "url", media: true, group: "Media" },
    { key: "artistStatement", label: "Artist statement", multiline: true, group: "Bio" },
  ],
  journey: [
    { key: "title", label: "Judul (ID)", placeholder: "PERJALANAN MUSIK.", group: "Konten" },
    { key: "titleEn", label: "Judul (EN)", placeholder: "MUSIC JOURNEY.", group: "Konten" },
    { key: "intro", label: "Intro (ID)", multiline: true, group: "Konten" },
    { key: "introEn", label: "Intro (EN)", multiline: true, group: "Konten" },
    { key: "imageUrl", label: "Foto journey", type: "url", media: true, group: "Media" },
    {
      key: "milestonesText",
      label: "Milestone",
      multiline: true,
      hint: "Format: Tahun | Judul ID | Copy ID | Judul EN | Copy EN (satu baris satu milestone)",
      group: "Milestone",
    },
  ],
  pressKit: [
    { key: "intro", label: "Intro EPK", multiline: true, group: "Konten" },
    { key: "editorialImage", label: "Foto Editorial / Press", type: "url", media: true, group: "Media" },
    { key: "snapshotBio", label: "Bio snapshot", multiline: true, group: "Snapshot" },
    { key: "snapshotLocation", label: "Lokasi snapshot", group: "Snapshot" },
    { key: "snapshotGenresText", label: "Genre snapshot", group: "Snapshot" },
    { key: "snapshotAlias", label: "Alias", group: "Snapshot" },
    { key: "capabilitiesIntro", label: "Capabilities intro", multiline: true, group: "Konten" },
    { key: "licensingNote", label: "Licensing note", multiline: true, group: "Konten" },
    { key: "bookingEmail", label: "Email booking", type: "email", group: "Kontak" },
    { key: "pressEmail", label: "Email press", type: "email", group: "Kontak" },
    { key: "oneSheetUrl", label: "One sheet", type: "url", media: true, group: "Aset" },
    { key: "photoPackUrl", label: "Photo pack", type: "url", media: true, group: "Aset" },
    { key: "logoPackUrl", label: "Logo pack", type: "url", media: true, group: "Aset" },
    { key: "technicalRiderUrl", label: "Technical rider", type: "url", media: true, group: "Aset" },
  ],
  siteSettings: [
    { key: "siteTitle", label: "Judul situs", group: "SEO" },
    { key: "metaDescription", label: "Deskripsi SEO", multiline: true, group: "SEO" },
    { key: "ogTitle", label: "Judul saat dibagikan", group: "SEO" },
    { key: "ogDescription", label: "Deskripsi saat dibagikan", multiline: true, group: "SEO" },
    { key: "socialPreviewUrl", label: "Gambar preview", type: "url", media: true, group: "SEO" },
    { key: "canonicalUrl", label: "Canonical URL", type: "url", group: "SEO" },
    { key: "contactEmail", label: "Email kontak", type: "email", group: "Kontak" },
    { key: "bookingEmail", label: "Email booking", type: "email", group: "Kontak" },
    { key: "pressEmail", label: "Email press", type: "email", group: "Kontak" },
    {
      key: "platformLinksText",
      label: "Tautan platform",
      hint: "Satu baris satu link: Nama | URL",
      multiline: true,
      group: "Tautan",
      placeholder: "Spotify | https://...\nYouTube | https://...",
    },
  ],
  legal: [
    { key: "title", label: "Judul dokumen", group: "Konten" },
    { key: "version", label: "Versi", group: "Konten" },
    { key: "effectiveDate", label: "Tanggal berlaku", type: "date", group: "Konten" },
    { key: "intro", label: "Intro", multiline: true, group: "Konten" },
    { key: "sectionsText", label: "Sections", multiline: true, group: "Konten" },
  ],
  release: [
    { key: "title", label: "Judul rilisan", group: "Info" },
    { key: "year", label: "Tahun", group: "Info" },
    { key: "format", label: "Format", placeholder: "Single / Remix", group: "Info" },
    { key: "platform", label: "Platform utama", group: "Info" },
    { key: "url", label: "Link utama", type: "url", hint: "Dipakai tombol Dengar Sekarang", group: "Link" },
    { key: "embedUrl", label: "Embed URL (opsional)", type: "url", group: "Link" },
    { key: "artworkUrl", label: "Cover", type: "url", media: true, group: "Media" },
    { key: "story", label: "Cerita rilisan", multiline: true, group: "Konten" },
    { key: "credits", label: "Kredit", multiline: true, group: "Konten" },
    { key: "spotifyUrl", label: "Spotify", type: "url", group: "Link" },
    { key: "appleMusicUrl", label: "Apple Music", type: "url", group: "Link" },
    { key: "platformLinksText", label: "Platform lain", multiline: true, group: "Link" },
  ],
  visual: [
    { key: "title", label: "Judul visual", group: "Info" },
    { key: "label", label: "Label", placeholder: "VIDEO TERBARU", group: "Info" },
    { key: "youtubeId", label: "YouTube ID", placeholder: "rv4DK8nVWd0", group: "Media" },
    { key: "url", label: "URL resmi", type: "url", group: "Link" },
    { key: "imageUrl", label: "Thumbnail", type: "url", media: true, group: "Media" },
  ],
  photoStory: [
    { key: "title", label: "Judul (ID)", group: "Info" },
    { key: "titleEn", label: "Judul (EN)", group: "Info" },
    { key: "label", label: "Label", placeholder: "PHOTO STORY", group: "Info" },
    { key: "imageUrl", label: "Foto", type: "url", media: true, group: "Media" },
    { key: "copyId", label: "Caption (ID)", multiline: true, group: "Caption" },
    { key: "copyEn", label: "Caption (EN)", multiline: true, group: "Caption" },
    { key: "altId", label: "Alt text (ID)", group: "Aksesibilitas" },
    { key: "altEn", label: "Alt text (EN)", group: "Aksesibilitas" },
    { key: "url", label: "Link opsional", type: "url", group: "Link" },
  ],
  portrait: [
    { key: "title", label: "Judul (ID)", group: "Info" },
    { key: "titleEn", label: "Judul (EN)", group: "Info" },
    { key: "label", label: "Label", placeholder: "STUDI POTRET", group: "Info" },
    { key: "imageUrl", label: "Foto", type: "url", media: true, group: "Media" },
    { key: "copyId", label: "Caption (ID)", multiline: true, group: "Caption" },
    { key: "copyEn", label: "Caption (EN)", multiline: true, group: "Caption" },
    { key: "altId", label: "Alt text (ID)", group: "Aksesibilitas" },
    { key: "altEn", label: "Alt text (EN)", group: "Aksesibilitas" },
  ],
  live: [
    { key: "status", label: "Status", type: "select", options: ["standby", "announced", "active"], group: "Status" },
    { key: "message", label: "Pesan publik", multiline: true, group: "Konten" },
    { key: "actionUrl", label: "Action URL", type: "url", group: "Link" },
  ],
  event: [
    { key: "title", label: "Nama show", group: "Info" },
    { key: "date", label: "Tanggal", type: "date", group: "Info" },
    { key: "time", label: "Jam", placeholder: "21:00 WIB", group: "Info" },
    { key: "city", label: "Kota", group: "Lokasi" },
    { key: "venue", label: "Venue", group: "Lokasi" },
    { key: "country", label: "Negara", group: "Lokasi" },
    { key: "mapsUrl", label: "Google Maps", type: "url", group: "Lokasi" },
    { key: "posterUrl", label: "Poster", type: "url", media: true, group: "Media" },
    { key: "ticketUrl", label: "Link tiket", type: "url", group: "Tiket" },
    { key: "rsvpUrl", label: "Link RSVP", type: "url", group: "Tiket" },
    { key: "status", label: "Status", type: "select", options: ["announced", "sold out", "cancelled", "past"], group: "Status" },
  ],
  game: [
    { key: "title", label: "Judul game", placeholder: "JEDAG RUN — NIGHT FREQUENCY", group: "Info" },
    { key: "kicker", label: "Kicker", placeholder: "GAME MINI", group: "Info" },
    { key: "intro", label: "Intro", multiline: true, group: "Info" },
    { key: "bgmUrl", label: "BGM", type: "url", media: true, group: "Audio" },
    { key: "jumpSfxUrl", label: "SFX lompat", type: "url", media: true, group: "Audio" },
    { key: "collectSfxUrl", label: "SFX collect", type: "url", media: true, group: "Audio" },
    { key: "hitSfxUrl", label: "SFX kena obstacle", type: "url", media: true, group: "Audio" },
    { key: "dropSfxUrl", label: "SFX drop", type: "url", media: true, group: "Audio" },
    { key: "gameOverSfxUrl", label: "SFX game over", type: "url", media: true, group: "Audio" },
    { key: "shareLabel", label: "Label share", placeholder: "SHARE SCORE", group: "Info" },
  ],
};

/* ---------- Helpers ---------- */
function fallbackPayload(type: DocumentType): EditorPayload {
  const platformLinksText = allPlatformLinks.map(l => `${l.label} | ${l.href}`).join("\n");
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
      intro: "Perjalanan musik Akbar Nawasunda dimulai pada 2020 sebagai bedroom producer...",
      introEn: "Akbar Nawasunda's journey began in 2020 as bedroom producer...",
      milestonesText: "2020 | DJ Akbar Remix | Awal perjalanan... | DJ Akbar Remix | The beginning...",
    };
  if (type === "pressKit")
    return {
      intro: "Informasi untuk promoter, media, playlist editor, dan kolaborator.",
      editorialImage: officialBrand.editorialPortrait,
      snapshotBio: verifiedArtistProfile.longBio,
      snapshotLocation: verifiedArtistProfile.location,
      snapshotGenresText: verifiedArtistProfile.genres.join(", "),
      snapshotAlias: verifiedArtistProfile.aliases.join(" / "),
      capabilitiesIntro: "Format kerja yang tersedia untuk performance, produksi, kolaborasi.",
      licensingNote: verifiedArtistProfile.licensing,
      bookingEmail: verifiedArtistProfile.bookingEmail,
      pressEmail: verifiedArtistProfile.bookingEmail,
    };
  if (type === "siteSettings")
    return {
      siteTitle: "Akbar Nawasunda | Official Website",
      metaDescription: "Website resmi Akbar Nawasunda — produser, remixer, dan musisi independen.",
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
      intro: "Penjelasan singkat tentang data yang diproses.",
      sectionsText: "short-version | Short version | No tracking...",
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
  return { status: "standby", message: "Belum ada jadwal pertunjukan yang diumumkan." };
}

function textValue(payload: EditorPayload, key: string) {
  return typeof payload[key] === "string" ? String(payload[key]) : "";
}

function preparedPayload(type: DocumentType, payload: EditorPayload) {
  const next = { ...payload };
  if (type === "journey") {
    next.milestones = textValue(next, "milestonesText")
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(Boolean)
      .map(line => {
        const parts = line.split("|").map(v => v.trim());
        const [year, title, body, titleEn, ...bodyEnParts] = parts;
        return { year, title, body, ...(titleEn && bodyEnParts.length ? { titleEn, bodyEn: bodyEnParts.join(" | ") } : {}) };
      })
      .filter(item => item.year && item.title && item.body);
    delete next.milestonesText;
  }
  if (type === "profile") {
    next.genres = textValue(next, "genresText").split(",").map(v => v.trim()).filter(Boolean);
    delete next.genresText;
  }
  if (type === "pressKit") {
    next.snapshotGenres = textValue(next, "snapshotGenresText").split(",").map(v => v.trim()).filter(Boolean);
    delete next.snapshotGenresText;
  }
  if (type === "legal") {
    next.sections = textValue(next, "sectionsText")
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(Boolean)
      .map(line => {
        const [key, heading, ...bodyParts] = line.split("|").map(v => v.trim());
        return { key, heading, body: bodyParts.join(" | ") };
      });
    delete next.sectionsText;
  }
  if (type === "release" || type === "siteSettings") {
    const platformLinks = textValue(next, "platformLinksText")
      .split("\n")
      .map(line => {
        const [label, ...hrefParts] = line.split("|").map(v => v.trim());
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
  const next = document.documentType === "pressKit" ? { ...fallbackPayload("pressKit"), ...document.payload } : { ...document.payload };
  if (document.documentType === "profile" && Array.isArray(next.genres)) next.genresText = next.genres.join(", ");
  if (document.documentType === "journey" && Array.isArray(next.milestones))
    next.milestonesText = next.milestones
      .map((item: any) => [String(item.year || ""), String(item.title || ""), String(item.body || ""), String(item.titleEn || ""), String(item.bodyEn || "")].join(" | "))
      .join("\n");
  if (document.documentType === "pressKit" && Array.isArray(next.snapshotGenres)) next.snapshotGenresText = next.snapshotGenres.join(", ");
  if (document.documentType === "legal" && Array.isArray(next.sections))
    next.sectionsText = next.sections.map((s: any) => `${String(s.key || "")} | ${String(s.heading || "")} | ${String(s.body || "")}`).join("\n");
  if ((document.documentType === "release" || document.documentType === "siteSettings") && Array.isArray(next.platformLinks))
    next.platformLinksText = next.platformLinks.map((item: any) => `${item.label} | ${item.href}`).join("\n");
  return next;
}

/* ---------- Small components ---------- */
function StudioOperations() {
  const content = trpc.content.documentsAll.useQuery();
  const leads = trpc.fanSignal.list.useQuery();
  const published = content.data?.filter(i => i.isPublished).length ?? 0;
  const drafts = (content.data?.length ?? 0) - published;

  return (
    <StatGrid>
      <Stat icon={Database} kicker="Tayang" value={content.isLoading ? "—" : published} label={`${drafts} draft menunggu`} tone="neutral" />
      <Stat icon={ImageIcon} kicker="Media" value={content.isLoading ? "—" : (content.data ?? []).filter(d => ["visual", "portrait", "photoStory"].includes(d.documentType)).length} label="Visual & portrait" tone="neutral" />
      <Stat icon={FilePenLine} kicker="Total dokumen" value={content.isLoading ? "—" : (content.data?.length ?? 0)} label="Semua tipe dokumen" tone="neutral" />
      <Stat icon={Database} kicker="Fan signal" value={leads.isLoading ? "—" : (leads.data?.length ?? 0)} label="Subscriber opt-in" tone="live" />
    </StatGrid>
  );
}

type StudioTab = "overview" | "compose" | "library" | "archive";
type LibraryStatus = "all" | "published" | "draft";

function StudioField({
  field,
  payload,
  updateField,
}: {
  field: FieldSpec;
  payload: EditorPayload;
  updateField: (key: string, value: string | boolean) => void;
}) {
  const value = textValue(payload, field.key);
  return (
    <div className="st-field">
      <div className="flex items-center justify-between gap-2">
        <label className="st-field-label">{field.label}</label>
        {field.media ? <span className="rounded-full bg-zinc-800 px-2 py-0.5 font-mono text-[9px] uppercase text-zinc-400">Media</span> : null}
      </div>
      {field.type === "select" ? (
        <select
          value={value}
          onChange={e => updateField(field.key, e.target.value)}
          className="h-10 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-sm text-white outline-none focus:border-zinc-600"
        >
          {field.options?.map(opt => (
            <option value={opt} key={opt} className="bg-zinc-900">
              {opt}
            </option>
          ))}
        </select>
      ) : field.media ? (
        <AssetPicker value={value} onChange={v => updateField(field.key, v)} />
      ) : field.multiline ? (
        <Textarea
          value={value}
          onChange={e => updateField(field.key, e.target.value)}
          placeholder={field.placeholder}
          rows={4}
          className="min-h-24 rounded-lg border-zinc-800 bg-zinc-900 text-white placeholder:text-zinc-600 focus:border-zinc-600"
        />
      ) : (
        <Input
          type={field.type || "text"}
          value={value}
          onChange={e => updateField(field.key, e.target.value)}
          placeholder={field.placeholder}
          className="h-10 rounded-lg border-zinc-800 bg-zinc-900 text-white placeholder:text-zinc-600 focus:border-zinc-600"
        />
      )}
      {field.hint ? <p className="st-field-hint">{field.hint}</p> : null}
      {field.type === "url" && !field.media ? <StudioLinkPreview value={value} label={`${field.label} preview`} /> : null}
      {field.key === "platformLinksText" ? <StudioLinkListPreview value={value} label="Platform links preview" /> : null}
    </div>
  );
}

/* ---------- Main ---------- */
export default function ContentStudio() {
  const { user, loading } = useAuth();
  const utils = trpc.useUtils();
  const [documentType, setDocumentType] = useState<DocumentType>("release");
  const [slug, setSlug] = useState("default");
  const [payload, setPayload] = useState<EditorPayload>(() => fallbackPayload("release"));
  const [sortOrder, setSortOrder] = useState(0);
  const [isPublished, setIsPublished] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [tab, setTab] = useState<StudioTab>("overview");
  const [libraryQuery, setLibraryQuery] = useState("");
  const [libraryType, setLibraryType] = useState<string>("all");
  const [libraryStatus, setLibraryStatus] = useState<LibraryStatus>("all");

  const documents = trpc.content.documentsAll.useQuery(undefined, { enabled: user?.role === "admin" });

  const save = trpc.content.saveDocument.useMutation({
    onSuccess: async () => {
      setIsDirty(false);
      toast.success(isPublished ? "Dokumen dipublikasikan." : "Draft disimpan.");
      await utils.content.documentsAll.invalidate();
      await utils.content.documents.invalidate();
    },
    onError: error => toast.error(error.message || "Gagal menyimpan."),
  });

  const remove = trpc.content.deleteDocument.useMutation({
    onSuccess: async () => {
      toast.success("Dokumen dihapus.");
      resetEditor();
      await utils.content.documentsAll.invalidate();
      await utils.content.documents.invalidate();
    },
    onError: error => toast.error(error.message || "Gagal menghapus."),
  });

  const focusCompose = useCallback(() => {
    setTab("compose");
    window.requestAnimationFrame(() => document.getElementById("studio-compose")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }, []);

  const visualDocuments = useMemo(() => (documents.data ?? []).filter(d => d.documentType === "visual"), [documents.data]);
  const portraitDocuments = useMemo(() => (documents.data ?? []).filter(d => d.documentType === "portrait"), [documents.data]);

  const filteredDocuments = useMemo(() => {
    const q = libraryQuery.trim().toLowerCase();
    return (documents.data ?? []).filter(doc => {
      if (libraryType !== "all" && doc.documentType !== libraryType) return false;
      if (libraryStatus === "published" && !doc.isPublished) return false;
      if (libraryStatus === "draft" && doc.isPublished) return false;
      if (!q) return true;
      const haystack = [doc.slug, doc.documentType, textValue(doc.payload, "title"), textValue(doc.payload, "siteTitle"), textValue(doc.payload, "heroTitle")].join(" ").toLowerCase();
      return haystack.includes(q);
    });
  }, [documents.data, libraryQuery, libraryStatus, libraryType]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== "s") return;
      e.preventDefault();
      const form = document.getElementById("studio-editor-form") as HTMLFormElement | null;
      if (!form) return;
      setTab("compose");
      form.requestSubmit();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const requested = new URLSearchParams(window.location.search).get("compose");
    if (!requested) return;
    const known = documentTypes.some(t => t.value === requested);
    if (known) {
      setDocumentType(requested as DocumentType);
      setPayload(fallbackPayload(requested as DocumentType));
      setShowAdvanced(!primaryWorkflowTypes.includes(requested as DocumentType));
      setTab("compose");
    }
    window.history.replaceState({}, "", window.location.pathname);
  }, []);

  const fields = useMemo(() => fieldsByType[documentType], [documentType]);
  const selectedType = documentTypes.find(t => t.value === documentType);
  const currentWorkflow = workflows.find(w => w.type === documentType);
  const isPrimaryDocument = primaryWorkflowTypes.includes(documentType);

  useEffect(() => {
    if (!isDirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [isDirty]);

  const visibleFields = useMemo(() => {
    if (showAdvanced || !isPrimaryDocument) return fields;
    if (documentType === "release") return fields.filter(f => ["title", "year", "format", "platform", "url", "artworkUrl", "platformLinksText"].includes(f.key));
    if (documentType === "siteSettings") return fields.filter(f => f.key === "platformLinksText");
    return fields;
  }, [documentType, fields, isPrimaryDocument, showAdvanced]);

  const groupedFields = useMemo(() => {
    const groups: Record<string, FieldSpec[]> = {};
    visibleFields.forEach(f => {
      const g = f.group || "Lainnya";
      if (!groups[g]) groups[g] = [];
      groups[g].push(f);
    });
    return groups;
  }, [visibleFields]);

  function resetEditor(nextType: DocumentType = documentType) {
    if (isDirty && !window.confirm("Ada perubahan belum disimpan. Tetap pindah?")) return;
    setDocumentType(nextType);
    setSlug("default");
    setPayload(fallbackPayload(nextType));
    setSortOrder(0);
    setIsPublished(true);
    setEditingId(null);
    setShowAdvanced(!primaryWorkflowTypes.includes(nextType));
    setIsDirty(false);
  }

  function loadDocument(doc: EditorDocument) {
    if (isDirty && !window.confirm("Ada perubahan belum disimpan. Tetap buka dokumen lain?")) return;
    setDocumentType(doc.documentType as DocumentType);
    setSlug(doc.slug);
    setPayload(displayPayload(doc as any));
    setSortOrder(doc.sortOrder);
    setIsPublished(doc.isPublished);
    setEditingId(doc.id);
    setShowAdvanced(!primaryWorkflowTypes.includes(doc.documentType as DocumentType));
    setIsDirty(false);
  }

  function openEditorForType(type: DocumentType) {
    const existing = documents.data?.find(d => d.documentType === type);
    if (existing) loadDocument(existing as any);
    else resetEditor(type);
    focusCompose();
  }

  function updateField(key: string, value: string | boolean) {
    setPayload(cur => ({ ...cur, [key]: value }));
    setIsDirty(true);
  }

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const nextPayload = preparedPayload(documentType, payload);
    const generatedSlug =
      ["release", "event"].includes(documentType) && (!slug.trim() || slug.trim() === "default")
        ? slugify(textValue(nextPayload, "title"))
        : "";
    save.mutate({
      documentType,
      slug: slug.trim() && slug.trim() !== "default" ? slug.trim() : generatedSlug || "default",
      payload: nextPayload,
      sortOrder,
      isPublished,
    });
  }

  function confirmDelete(doc: EditorDocument) {
    if (window.confirm(`Hapus ${doc.documentType} / ${doc.slug}?`)) remove.mutate({ id: doc.id });
  }

  if (loading)
    return (
      <div className="studio-os grid min-h-dvh place-items-center text-sm text-white/50">
        <span className="relative z-[1] font-mono text-[11px] uppercase tracking-[0.2em]">Memeriksa akses…</span>
      </div>
    );
  if (!user) return <OwnerLoginCard title="Studio access" description="Masuk dengan kredensial owner untuk mengelola website." />;
  if (user.role !== "admin")
    return (
      <main className="studio-os grid min-h-dvh place-items-center p-6 text-white">
        <section className="st-panel relative z-[1] max-w-md p-8 text-center">
          <ShieldCheck className="mx-auto mb-5 h-9 w-9 text-zinc-400" />
          <h1 className="text-2xl font-semibold">Owner access required</h1>
          <p className="mt-3 text-zinc-400">Editor ini hanya untuk pemilik situs.</p>
          <a className="mt-7 inline-flex items-center gap-2 text-sm text-white underline" href="/">
            Kembali ke publik <ArrowUpRight size={15} />
          </a>
        </section>
      </main>
    );

  const groupedWorkflows = workflows.reduce(
    (acc, w) => {
      if (!acc[w.group]) acc[w.group] = [];
      acc[w.group].push(w);
      return acc;
    },
    {} as Record<string, typeof workflows>
  );

  return (
    <DashboardLayout title="Editor" kicker="Studio">
      <div className="space-y-6">
        <StudioHero
          kicker="Studio / Editor"
          title={<>Kelola konten <em>dengan tenang.</em></>}
          lead="Semua halaman publik diatur dari sini. Pilih apa yang mau diubah, isi form, simpan, langsung tayang — tanpa pusing."
          actions={
            <>
              <StudioButton variant="primary" onClick={() => focusCompose()} type="button">
                <Plus size={14} /> Tulis baru
              </StudioButton>
              <StudioLink href="/assets">
                <FolderOpen size={14} /> Buka media
              </StudioLink>
              <StudioLink href="/" target="_blank" rel="noreferrer">
                Lihat website <ArrowUpRight size={13} />
              </StudioLink>
            </>
          }
          aside={
            <div className="flex flex-col items-start gap-2 sm:items-end">
              <Pill tone="live"><span className="studio-dot" /> Workspace aktif</Pill>
              <Pill tone={isDirty ? "draft" : "neutral"}>{isDirty ? "Belum disimpan" : "Tersimpan"}</Pill>
            </div>
          }
        />

        <StudioOperations />

        <StudioTabs
          items={[
            { id: "overview", label: "Ringkasan", icon: LayoutList },
            { id: "compose", label: "Tulis", icon: FilePenLine },
            { id: "library", label: "Koleksi", icon: Database, count: documents.data?.length ?? 0 },
            { id: "archive", label: "Arsip visual", icon: ImageIcon, count: visualDocuments.length + portraitDocuments.length },
          ]}
          value={tab}
          onChange={next => setTab(next as StudioTab)}
        />

        {tab === "overview" ? (
          <div className="space-y-6 st-rise">
            {/* Quick actions grouped */}
            <div className="space-y-6">
              {Object.entries(groupedWorkflows).map(([group, items]) => (
                <Panel key={group} eyebrow={group} title={group === "Musik" ? "Musik & rilisan" : group === "Visual" ? "Visual & foto" : group === "Live" ? "Live & game" : "Halaman utama"} description={group === "Musik" ? "Tambah lagu baru, atur cover, dan tautan streaming." : group === "Visual" ? "Kelola video, portrait, dan photo story." : group === "Live" ? "Jadwal manggung dan game." : "Profil, EPK, tautan resmi, dan journey."}>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map(wf => {
                      const Icon = wf.icon;
                      const active = documentType === wf.type && !editingId;
                      return (
                        <button key={wf.type} type="button" onClick={() => { resetEditor(wf.type); focusCompose(); }} className="st-quick-card" data-active={active}>
                          <div className="flex items-start justify-between gap-3">
                            <span className="st-quick-icon"><Icon size={16} /></span>
                            <Plus size={14} className="text-zinc-600" />
                          </div>
                          <h3 className="mt-4 text-[13px] font-semibold text-white">{wf.title}</h3>
                          <p className="mt-1 text-[12px] leading-5 text-zinc-400">{wf.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </Panel>
              ))}
            </div>

            <StudioPageMirror documents={documents.data ?? []} onEditType={type => openEditorForType(type as DocumentType)} />
            <StudioGalleryAnalytics />
          </div>
        ) : null}

        {tab === "compose" ? (
          <div className="grid items-start gap-5 st-rise xl:grid-cols-[1.15fr_0.85fr]">
            <section id="studio-compose" className="st-panel">
              <header className="st-panel-head">
                <div className="min-w-0">
                  <Eyebrow icon={FilePenLine}>Menulis</Eyebrow>
                  <h2 className="st-title">{editingId ? `Edit: ${selectedType?.label}` : currentWorkflow ? currentWorkflow.title : "Dokumen baru"}</h2>
                  <p className="st-sub">{currentWorkflow?.desc || selectedType?.label} — isi form di bawah, lalu simpan.</p>
                </div>
                <div className="flex items-center gap-2">
                  {editingId ? <StudioButton type="button" onClick={() => resetEditor()}>Baru</StudioButton> : null}
                  <Pill tone={isPublished ? "live" : "draft"}>{isPublished ? "Akan tayang" : "Draft"}</Pill>
                </div>
              </header>

              <div className="px-4 pt-4 sm:px-6">
                <div className="st-savebar" data-dirty={isDirty}>
                  <div className="min-w-0">
                    <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-400">Status simpan</p>
                    <p className="mt-1 truncate text-[12px] text-zinc-300">{editingId ? `Mengedit ${selectedType?.label}` : `Baru · ${selectedType?.label}`} {isDirty ? "· ada perubahan" : ""}</p>
                  </div>
                  <StudioButton type="submit" form="studio-editor-form" variant="primary" disabled={save.isPending}>
                    {save.isPending ? "Menyimpan…" : isPublished ? "Simpan & tayangkan" : "Simpan draft"}
                  </StudioButton>
                </div>
              </div>

              <form id="studio-editor-form" onSubmit={submit} className="space-y-6 p-4 sm:p-6">
                <StudioPublishChecklist documentType={documentType} payload={payload} isPublished={isPublished} />

                {isPrimaryDocument && !showAdvanced ? (
                  <div className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">Mode simpel aktif</p>
                      <p className="mt-1 text-[13px] text-zinc-300">Hanya field penting yang ditampilkan. Butuh semua field?</p>
                    </div>
                    <StudioButton type="button" onClick={() => setShowAdvanced(true)}>Tampilkan semua field</StudioButton>
                  </div>
                ) : null}

                {!isPrimaryDocument || showAdvanced ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="st-field">
                      <label className="st-field-label">Tipe dokumen</label>
                      <select value={documentType} onChange={e => resetEditor(e.target.value as DocumentType)} className="h-10 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-sm text-white outline-none focus:border-zinc-600">
                        {documentTypes.map(t => (
                          <option value={t.value} key={t.value} className="bg-zinc-900">{t.group} — {t.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="st-field">
                      <label className="st-field-label">Slug (opsional)</label>
                      <Input value={slug} onChange={e => { setSlug(e.target.value); setIsDirty(true); }} placeholder="Otomatis dari judul" className="h-10 rounded-lg border-zinc-800 bg-zinc-900 text-white placeholder:text-zinc-600 focus:border-zinc-600" />
                    </div>
                  </div>
                ) : null}

                <div className="space-y-5">
                  {Object.entries(groupedFields).map(([group, fields]) => (
                    <div key={group} className="st-section">
                      <div className="st-section-title">{group}</div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        {fields.map(field => (
                          <StudioField key={field.key} field={field} payload={payload} updateField={updateField} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Toggles */}
                {documentType === "release" ? (
                  <label className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-[13px] text-zinc-300">
                    <input type="checkbox" className="h-4 w-4 accent-white" checked={Boolean(payload.isCurrent)} onChange={e => updateField("isCurrent", e.target.checked)} /> Jadikan rilisan terbaru di homepage
                  </label>
                ) : null}
                {documentType === "event" ? (
                  <label className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-[13px] text-zinc-300">
                    <input type="checkbox" className="h-4 w-4 accent-white" checked={Boolean(payload.isFeatured)} onChange={e => updateField("isFeatured", e.target.checked)} /> Jadikan jadwal utama
                  </label>
                ) : null}
                {documentType === "game" ? (
                  <label className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-[13px] text-zinc-300">
                    <input type="checkbox" className="h-4 w-4 accent-white" checked={payload.isEnabled !== false} onChange={e => updateField("isEnabled", e.target.checked)} /> Aktifkan game & teaser homepage
                  </label>
                ) : null}

                <div className="grid gap-4 border-t border-zinc-800 pt-5 sm:grid-cols-[0.7fr_1.3fr]">
                  <div className="st-field">
                    <label className="st-field-label">Urutan tampil</label>
                    <Input type="number" min="0" value={sortOrder} onChange={e => { setSortOrder(Number(e.target.value)); setIsDirty(true); }} className="h-10 rounded-lg border-zinc-800 bg-zinc-900 text-white focus:border-zinc-600" />
                  </div>
                  <label className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-[13px] transition ${isPublished ? "border-emerald-900/50 bg-emerald-950/20 text-emerald-100" : "border-zinc-800 bg-zinc-900/50 text-zinc-400"}`}>
                    <span>
                      <span className="block font-medium">{isPublished ? "Tampilkan ke publik" : "Simpan sebagai draft"}</span>
                      <span className="mt-1 block text-[11px] opacity-70">{isPublished ? "Langsung terlihat di website setelah simpan" : "Belum terlihat publik"}</span>
                    </span>
                    <input type="checkbox" className="h-4 w-4 accent-white" checked={isPublished} onChange={e => { setIsPublished(e.target.checked); setIsDirty(true); }} />
                  </label>
                </div>

                <HelpCallout>Tekan <kbd className="rounded border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 font-mono text-[11px]">⌘S</kbd> untuk simpan cepat. Media bisa upload langsung dari field yang ada label Media.</HelpCallout>

                <StudioButton type="submit" variant="primary" className="h-11 w-full" disabled={save.isPending}>
                  {save.isPending ? "Menyimpan…" : isPublished ? "Simpan & tayangkan" : "Simpan sebagai draft"}
                </StudioButton>
              </form>
            </section>

            <aside className="space-y-5 xl:sticky xl:top-[84px]">
              <StudioDocumentPreview documentType={documentType} payload={payload} slug={slug} />
            </aside>
          </div>
        ) : null}

        {tab === "library" ? (
          <section id="studio-document-library" className="st-panel st-rise">
            <header className="st-panel-head">
              <div className="min-w-0">
                <Eyebrow icon={LayoutList}>Koleksi</Eyebrow>
                <h2 className="st-title">Semua dokumen</h2>
                <p className="st-sub">{filteredDocuments.length} dari {documents.data?.length ?? 0} dokumen</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <Input value={libraryQuery} onChange={e => setLibraryQuery(e.target.value)} placeholder="Cari judul…" className="h-9 w-56 rounded-lg border-zinc-800 bg-zinc-900 pl-8 text-[13px] text-white placeholder:text-zinc-600 focus:border-zinc-700" />
                </div>
                <select value={libraryType} onChange={e => setLibraryType(e.target.value)} className="h-9 rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 text-[12px] text-white outline-none focus:border-zinc-700">
                  <option value="all" className="bg-zinc-900">Semua tipe</option>
                  {documentTypes.map(t => <option key={t.value} value={t.value} className="bg-zinc-900">{t.label}</option>)}
                </select>
                <select value={libraryStatus} onChange={e => setLibraryStatus(e.target.value as LibraryStatus)} className="h-9 rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 text-[12px] text-white outline-none focus:border-zinc-700">
                  <option value="all" className="bg-zinc-900">Semua status</option>
                  <option value="published" className="bg-zinc-900">Published</option>
                  <option value="draft" className="bg-zinc-900">Draft</option>
                </select>
              </div>
            </header>
            <div className="overflow-x-auto">
              {documents.isLoading ? (
                <div className="p-6 space-y-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-12 animate-pulse rounded-lg bg-zinc-900" />)}</div>
              ) : filteredDocuments.length ? (
                <table className="st-table">
                  <thead>
                    <tr>
                      <th>Tipe</th>
                      <th>Judul / Slug</th>
                      <th>Status</th>
                      <th>Update</th>
                      <th className="text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDocuments.map(doc => (
                      <tr key={doc.id} className={editingId === doc.id ? "bg-zinc-900" : ""}>
                        <td><span className="font-mono text-[11px] text-zinc-400">{doc.documentType}</span></td>
                        <td>
                          <button type="button" onClick={() => { loadDocument(doc as any); focusCompose(); }} className="text-left">
                            <span className="block text-[13px] font-medium text-white">{textValue(doc.payload, "title") || textValue(doc.payload, "siteTitle") || textValue(doc.payload, "heroTitle") || doc.slug}</span>
                            <span className="block font-mono text-[11px] text-zinc-500">{doc.slug}</span>
                          </button>
                        </td>
                        <td><Pill tone={doc.isPublished ? "live" : "draft"}>{doc.isPublished ? "Live" : "Draft"}</Pill></td>
                        <td><span className="text-[11px] text-zinc-500">{new Date(doc.updatedAt).toLocaleDateString("id-ID")}</span></td>
                        <td className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-zinc-400 hover:text-white hover:bg-zinc-800" onClick={() => { loadDocument(doc as any); focusCompose(); }}><FilePenLine size={13} /></Button>
                            <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-zinc-500 hover:text-red-300 hover:bg-red-950/30" onClick={() => confirmDelete(doc as any)} disabled={remove.isPending}><Trash2 size={13} /></Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-6"><EmptyState icon={Search} title="Tidak ada yang cocok." description="Ubah kata kunci atau filter." /></div>
              )}
            </div>
          </section>
        ) : null}

        {tab === "archive" ? (
          <div className="space-y-5 st-rise">
            <StudioVisualArchive
              documents={visualDocuments.map(d => ({ ...d, documentType: "visual" as const }))}
              fallbacks={videos.map((v, i) => ({ id: `fallback-${i}`, title: v.title, label: v.label, href: v.href, image: v.image }))}
              onAdd={() => { resetEditor("visual"); focusCompose(); }}
              onEdit={doc => { loadDocument(doc as any); focusCompose(); }}
              onImportFallback={visual => {
                setDocumentType("visual");
                setSlug(slugify(visual.title));
                setPayload({ title: visual.title, label: visual.label, youtubeId: visual.href.split("/").pop() || "", url: visual.href, imageUrl: visual.image });
                setSortOrder(0);
                setIsPublished(true);
                setEditingId(null);
                setShowAdvanced(false);
                setIsDirty(true);
                focusCompose();
              }}
            />
            <StudioPortraitArchive
              documents={portraitDocuments.map(d => ({ ...d, documentType: "portrait" as const }))}
              fallbacks={publicPortraitStudies(null)}
              onAdd={() => { resetEditor("portrait"); focusCompose(); }}
              onEdit={doc => { loadDocument(doc as any); focusCompose(); }}
              onImportFallback={study => {
                setDocumentType("portrait");
                setSlug(slugify(study.title));
                setPayload({ title: study.title, titleEn: study.titleEn || "", label: study.label || "STUDI POTRET", imageUrl: study.imageUrl, copyId: study.copyId || "", copyEn: study.copyEn || "", altId: study.altId || "", altEn: study.altEn || "" });
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
