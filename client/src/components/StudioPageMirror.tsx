import {
  ArrowUpRight,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Link2,
  Pencil,
  Radio,
  Sparkles,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  allPlatformLinks,
  currentRelease,
  officialBrand,
  portraitStudies,
  releases,
  verifiedArtistProfile,
  videos,
} from "@/content/artistPlatform";
import { StudioAssetPreview, StudioLinkPreview } from "./StudioAssetPreview";

type EditorDocument = {
  id: number;
  documentType: string;
  slug: string;
  payload: Record<string, unknown>;
  sortOrder: number;
  isPublished: boolean;
};

type StudioPageMirrorProps = {
  documents: EditorDocument[];
  onEditType: (type: string) => void;
};

type MirrorItem = {
  label: string;
  value: string;
  kind?: "text" | "link" | "media";
};

type MirrorSection = {
  title: string;
  detail: string;
  icon: typeof FileText;
  editType?: string;
  items: MirrorItem[];
  sourceLabel: string;
};

type MirrorPage = {
  route: string;
  title: string;
  marker: string;
  summary: string;
  sections: MirrorSection[];
};

function stringValue(payload: Record<string, unknown>, key: string) {
  return typeof payload[key] === "string" ? String(payload[key]).trim() : "";
}

function parsePlatformLinks(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .filter(item => Boolean(item && typeof item === "object" && !Array.isArray(item)))
    .map(item => {
      const record = item as Record<string, unknown>;
      return {
        label: typeof record.label === "string" ? record.label.trim() : "",
        href: typeof record.href === "string" ? record.href.trim() : "",
      };
    })
    .filter(item => item.label && item.href);
}

function parsePlatformText(value: string) {
  return value
    .split("\n")
    .map(line => {
      const [label, ...hrefParts] = line.split("|").map(item => item.trim());
      return { label, href: hrefParts.join(" | ") };
    })
    .filter(item => item.label && item.href);
}

function firstDocument(documents: EditorDocument[], type: string) {
  return documents
    .filter(document => document.documentType === type)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id)[0];
}

function documentsOf(documents: EditorDocument[], type: string) {
  return documents
    .filter(document => document.documentType === type)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
}

function textItem(label: string, value: string): MirrorItem {
  return { label, value, kind: "text" };
}

function linkItem(label: string, value: string): MirrorItem {
  return { label, value, kind: "link" };
}

function mediaItem(label: string, value: string): MirrorItem {
  return { label, value, kind: "media" };
}

function releaseItems(documents: EditorDocument[]): MirrorItem[] {
  const managed = documentsOf(documents, "release");
  if (managed.length) {
    return managed.map(document => {
      const payload = document.payload;
      const title = stringValue(payload, "title") || document.slug;
      const href = stringValue(payload, "url") || stringValue(payload, "href");
      return linkItem(title, href || "Dokumen release belum memiliki URL");
    });
  }
  return releases.map(release => linkItem(release.title, release.href));
}

function visualItems(documents: EditorDocument[]): MirrorItem[] {
  const managed = documentsOf(documents, "visual");
  if (managed.length) {
    return managed.map(document => {
      const payload = document.payload;
      return linkItem(
        stringValue(payload, "title") || document.slug,
        stringValue(payload, "url") || stringValue(payload, "href") || "Visual belum memiliki URL",
      );
    });
  }
  return videos.map(video => linkItem(video.title, video.href));
}

function eventItems(documents: EditorDocument[]): MirrorItem[] {
  const managed = documentsOf(documents, "event");
  if (managed.length) {
    return managed.map(document => {
      const payload = document.payload;
      const title = stringValue(payload, "title") || document.slug;
      const venue = [stringValue(payload, "venue"), stringValue(payload, "city")]
        .filter(Boolean)
        .join(", ");
      const date = stringValue(payload, "date");
      return textItem(title, [date, venue].filter(Boolean).join(" · ") || "Event belum lengkap");
    });
  }
  return [textItem("Status", "Belum ada jadwal pertunjukan yang diumumkan.")];
}

function MirrorSectionCard({
  section,
  onEditType,
}: {
  section: MirrorSection;
  onEditType: (type: string) => void;
}) {
  const Icon = section.icon;
  return (
    <article className="overflow-hidden rounded-xl border border-white/[0.08] bg-black/[0.14]">
      <div className="flex items-start justify-between gap-3 border-b border-white/[0.07] px-4 py-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-cyan-200/15 bg-cyan-200/[0.05] text-cyan-100/70">
            <Icon size={14} />
          </span>
          <div className="min-w-0">
            <h4 className="text-sm font-medium text-white/90">{section.title}</h4>
            <p className="mt-1 text-[11px] leading-5 text-white/40">{section.detail}</p>
          </div>
        </div>
        {section.editType ? (
          <button
            type="button"
            onClick={() => onEditType(section.editType!)}
            className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-white/10 px-2 py-1.5 text-[9px] font-medium uppercase tracking-[0.1em] text-white/50 transition hover:border-cyan-200/30 hover:bg-cyan-200/[0.07] hover:text-cyan-100"
          >
            <Pencil size={10} />
            <span className="hidden sm:inline">Edit</span>
          </button>
        ) : null}
      </div>
      <div className="space-y-2 p-4">
        <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-emerald-100/55">
          {section.sourceLabel}
        </p>
        {section.items.length ? (
          <div className="space-y-2">
            {section.items.map(item => (
              <div key={`${item.label}-${item.value}`} className="rounded-lg border border-white/[0.07] bg-white/[0.025] p-3">
                <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/35">{item.label}</p>
                {item.kind === "media" ? (
                  <StudioAssetPreview value={item.value} label={item.label} />
                ) : item.kind === "link" && item.value.startsWith("http") ? (
                  <StudioLinkPreview value={item.value} label={item.label} />
                ) : (
                  <p className="mt-1 break-words text-xs leading-5 text-white/75">{item.value}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-white/10 px-3 py-4 text-xs text-white/35">
            Belum ada data pada bagian ini.
          </p>
        )}
      </div>
    </article>
  );
}

export default function StudioPageMirror({ documents, onEditType }: StudioPageMirrorProps) {
  const [selectedRoute, setSelectedRoute] = useState("/");
  const content = useMemo(() => {
    const hero = firstDocument(documents, "hero")?.payload ?? {};
    const profile = firstDocument(documents, "profile")?.payload ?? {};
    const pressKit = firstDocument(documents, "pressKit")?.payload ?? {};
    const settings = firstDocument(documents, "siteSettings")?.payload ?? {};
    const live = firstDocument(documents, "live")?.payload ?? {};
    const legal = firstDocument(documents, "legal")?.payload ?? {};
    const game = firstDocument(documents, "game")?.payload ?? {};
    const managedPlatforms = parsePlatformLinks(settings.platformLinks);
    const textPlatforms = parsePlatformText(stringValue(settings, "platformLinksText"));
    const platforms = managedPlatforms.length
      ? managedPlatforms
      : textPlatforms.length
        ? textPlatforms
        : allPlatformLinks;
    const portrait = stringValue(profile, "portraitImage") || officialBrand.portrait;
    const editorialImage = stringValue(pressKit, "editorialImage") || portrait || officialBrand.editorialPortrait;
    const featuredRelease = firstDocument(documents, "release")?.payload ?? {};
    const releaseArtwork = stringValue(featuredRelease, "artworkUrl") || currentRelease.image;
    const profileLocation = stringValue(profile, "location") || verifiedArtistProfile.location;
    const profileBio = stringValue(profile, "longBio") || verifiedArtistProfile.longBio;
    const pressBio = stringValue(pressKit, "snapshotBio") || profileBio;
    const pressLocation = stringValue(pressKit, "snapshotLocation") || profileLocation;
    const pressGenres = stringValue(pressKit, "snapshotGenresText") || verifiedArtistProfile.genres.join(", ");
    const pressAlias = stringValue(pressKit, "snapshotAlias") || verifiedArtistProfile.aliases.join(" / ");
    const pressEmail = stringValue(pressKit, "pressEmail") || verifiedArtistProfile.bookingEmail;
    const pages: MirrorPage[] = [
      {
        route: "/",
        title: "Homepage",
        marker: "ORIGIN SIGNAL",
        summary: "Cermin homepage: hero, CTA, platform, rilisan, visual, live, game, newsletter, dan footer.",
        sections: [
          {
            title: "Hero, foto & CTA",
            detail: "Isi yang terlihat pada first impression homepage.",
            icon: ImageIcon,
            editType: "hero",
            sourceLabel: firstDocument(documents, "hero") ? "CMS · Homepage hero" : "Fallback resmi · Homepage hero",
            items: [
              textItem("Judul", stringValue(hero, "heroTitle") || "AKBAR NAWASUNDA."),
              textItem("Copy", stringValue(hero, "heroBody") || verifiedArtistProfile.shortBio),
              linkItem("CTA utama", stringValue(hero, "primaryActionUrl") || currentRelease.href),
              mediaItem("Foto hero", stringValue(hero, "heroImage") || portrait),
            ],
          },
          {
            title: "Navigasi, CTA & footer routes",
            detail: "Link internal dan CTA yang terlihat pada header, hero, section, serta footer homepage.",
            icon: Link2,
            sourceLabel: "Fixed routes · Homepage navigation",
            items: [
              linkItem("Music", "/music"),
              linkItem("Visuals", "/visuals"),
              linkItem("Live", "/live"),
              linkItem("Archive", "/universe"),
              linkItem("About", "/about"),
              linkItem("EPK / Booking", "/epk"),
              linkItem("Contact / Inquiry", "/inquire"),
              linkItem("Licensing", "/licensing"),
              linkItem("Privacy", "/privacy"),
              linkItem("Hero → Kabar terbaru", "#signal"),
            ],
          },
          {
            title: "Semua link platform",
            detail: "Link yang muncul pada blok Links Musik dan koneksi footer homepage.",
            icon: Link2,
            editType: "siteSettings",
            sourceLabel: firstDocument(documents, "siteSettings") ? "CMS · Site settings" : "Fallback resmi · Platform links",
            items: platforms.map(link => linkItem(link.label, link.href)),
          },
          {
            title: "Rilisan terbaru",
            detail: "Featured release, cover, metadata, dan tombol Buka Rilisan.",
            icon: Radio,
            editType: "release",
            sourceLabel: firstDocument(documents, "release") ? "CMS · Release document" : "Fallback resmi · Current release",
            items: [
              linkItem(stringValue(featuredRelease, "title") || currentRelease.title, stringValue(featuredRelease, "url") || currentRelease.href),
              mediaItem("Cover rilisan", releaseArtwork),
            ],
          },
          {
            title: "Katalog dan video resmi",
            detail: "Semua kartu rilisan serta visual video yang tampil pada homepage.",
            icon: FileText,
            editType: "release",
            sourceLabel: documentsOf(documents, "release").length || documentsOf(documents, "visual").length ? "CMS · Release / Visual documents" : "Fallback resmi · Artist catalog",
            items: [...releaseItems(documents).slice(0, 8), ...visualItems(documents).slice(0, 3)],
          },
          {
            title: "Live, game & Fan Signal",
            detail: "Status jadwal, teaser JEDAG RUN, dan form newsletter.",
            icon: Sparkles,
            editType: documentsOf(documents, "event").length ? "event" : "game",
            sourceLabel: documentsOf(documents, "event").length || firstDocument(documents, "game") ? "CMS · Event / Game" : "Fallback resmi · Newsletter adalah sistem tetap",
            items: [
              ...eventItems(documents),
              textItem("Game", stringValue(game, "title") || "JEDAG RUN — NIGHT FREQUENCY"),
              textItem("Newsletter", "Fan Signal · form update email di bagian News"),
            ],
          },
        ],
      },
      {
        route: "/music",
        title: "Music",
        marker: "FREQUENCY ARCHIVE",
        summary: "Platform, rilisan pilihan, player opsional, dan katalog lengkap.",
        sections: [
          {
            title: "Platform resmi Music",
            detail: "Semua tautan streaming yang digunakan halaman Music.",
            icon: Link2,
            editType: "siteSettings",
            sourceLabel: firstDocument(documents, "siteSettings") ? "CMS · Site settings" : "Fallback resmi",
            items: platforms.map(link => linkItem(link.label, link.href)),
          },
          {
            title: "Featured release & catalog",
            detail: "Rilisan pilihan, cover, metadata, cerita, dan link resmi.",
            icon: Radio,
            editType: "release",
            sourceLabel: documentsOf(documents, "release").length ? "CMS · Release documents" : "Fallback resmi · Artist catalog",
            items: releaseItems(documents),
          },
        ],
      },
      {
        route: "/visuals",
        title: "Visuals",
        marker: "MOVING IMAGE BOARD",
        summary: "Kartu visual resmi, thumbnail, label, dan URL video.",
        sections: [
          {
            title: "Visual archive cards",
            detail: "Setiap kartu visual yang muncul pada halaman Visuals dan homepage.",
            icon: ImageIcon,
            editType: "visual",
            sourceLabel: documentsOf(documents, "visual").length ? "CMS · Visual documents" : "Fallback resmi · Video catalog",
            items: visualItems(documents),
          },
        ],
      },
      {
        route: "/visuals/portraits",
        title: "Visual Portraits",
        marker: "PORTRAIT STUDIES",
        summary: "Arsip studi potret, foto, label, caption, alt text, dan navigasi kembali ke Visuals.",
        sections: [
          {
            title: "Portrait study cards",
            detail: "Setiap foto dan copy yang tampil pada gallery studi potret.",
            icon: ImageIcon,
            editType: "portrait",
            sourceLabel: documentsOf(documents, "portrait").length ? "CMS · Portrait documents" : "Fallback resmi · Portrait studies",
            items: (documentsOf(documents, "portrait").length ? documentsOf(documents, "portrait").map(document => {
              const payload = document.payload;
              return [
                mediaItem(stringValue(payload, "title") || document.slug, stringValue(payload, "imageUrl")),
                textItem(`${stringValue(payload, "title") || document.slug} · caption`, stringValue(payload, "copyId") || stringValue(payload, "copyEn")),
                textItem(`${stringValue(payload, "title") || document.slug} · alt`, stringValue(payload, "altId") || stringValue(payload, "altEn")),
              ].filter(item => item.value);
            }).flat() : portraitStudies.map(study => [mediaItem(study.titleId, study.src), textItem(`${study.titleId} · caption`, study.copyId || ""), textItem(`${study.titleId} · alt`, study.altId || "")].filter(item => item.value)).flat()),
          },
          {
            title: "Portrait navigation",
            detail: "Link antar halaman yang terlihat pada gallery portrait.",
            icon: Link2,
            sourceLabel: "Fixed route · Visual archive navigation",
            items: [linkItem("Back to Visuals", "/visuals"), linkItem("Return Home", "/")],
          },
        ],
      },
      {
        route: "/live",
        title: "Live",
        marker: "LIVE SIGNAL",
        summary: "Status pertunjukan, event terkonfirmasi, poster, tiket, RSVP, dan lokasi.",
        sections: [
          {
            title: "Live status",
            detail: "Pesan status dan CTA yang tampil pada halaman Live.",
            icon: Radio,
            editType: "live",
            sourceLabel: firstDocument(documents, "live") ? "CMS · Live signal" : "Fallback resmi · Live standby",
            items: [
              textItem("Status", stringValue(live, "status") || "standby"),
              textItem("Message", stringValue(live, "message") || "Belum ada jadwal pertunjukan yang diumumkan."),
              linkItem("Action URL", stringValue(live, "actionUrl") || "#signal"),
            ],
          },
          {
            title: "Event cards & location links",
            detail: "Tanggal, venue, Google Maps, poster, tiket, dan RSVP.",
            icon: Link2,
            editType: "event",
            sourceLabel: documentsOf(documents, "event").length ? "CMS · Event documents" : "Fallback resmi · No confirmed event",
            items: [
              ...eventItems(documents),
              ...documentsOf(documents, "event").flatMap(document => {
                const payload = document.payload;
                return [
                  linkItem(`${stringValue(payload, "title") || document.slug} · Maps`, stringValue(payload, "mapsUrl")),
                  linkItem(`${stringValue(payload, "title") || document.slug} · Ticket`, stringValue(payload, "ticketUrl")),
                  linkItem(`${stringValue(payload, "title") || document.slug} · RSVP`, stringValue(payload, "rsvpUrl")),
                  mediaItem(`${stringValue(payload, "title") || document.slug} · Poster`, stringValue(payload, "posterUrl")),
                ].filter(item => item.value);
              }),
            ],
          },
        ],
      },
      {
        route: "/universe",
        title: "Archive / Universe",
        marker: "UNIVERSE ARCHIVE",
        summary: "Arah visual, artwork rilisan, dan jalur kontak resmi.",
        sections: [
          {
            title: "Archive artwork",
            detail: "Artwork utama yang menjadi visual pembuka Archive.",
            icon: ImageIcon,
            sourceLabel: "Fallback resmi · Archive artwork",
            items: [mediaItem("Archive portrait", officialBrand.archivePortrait)],
          },
          {
            title: "Archive releases & official routes",
            detail: "Empat rilisan dan link resmi yang tampil di Archive.",
            icon: Link2,
            editType: "release",
            sourceLabel: documentsOf(documents, "release").length ? "CMS · Release documents" : "Fallback resmi · Artist catalog",
            items: releaseItems(documents).slice(0, 4),
          },
        ],
      },
      {
        route: "/about",
        title: "About",
        marker: "ARTIST PROFILE",
        summary: "Portrait profile, bio, lokasi, Google Maps, genre, statement, dan CTA.",
        sections: [
          {
            title: "Profile portrait & location",
            detail: "Foto, asal, dan link lokasi yang tampil pada About.",
            icon: ImageIcon,
            editType: "profile",
            sourceLabel: firstDocument(documents, "profile") ? "CMS · Profile document" : "Fallback resmi · Artist profile",
            items: [mediaItem("Profile portrait", portrait), textItem("Location", profileLocation), linkItem("Google Maps", stringValue(profile, "locationUrl"))].filter(item => item.value),
          },
          {
            title: "Bio, statement & genres",
            detail: "Copy profil dan tag genre yang tampil pada About.",
            icon: FileText,
            editType: "profile",
            sourceLabel: firstDocument(documents, "profile") ? "CMS · Profile document" : "Fallback resmi · Artist profile",
            items: [textItem("Short bio", stringValue(profile, "shortBio") || verifiedArtistProfile.shortBio), textItem("Long bio", profileBio), textItem("Artist statement", stringValue(profile, "artistStatement")), textItem("Genres", stringValue(profile, "genresText") || verifiedArtistProfile.genres.join(", "))].filter(item => item.value),
          },
        ],
      },
      {
        route: "/epk",
        title: "EPK / Press & Booking",
        marker: "PRESS / BOOKING",
        summary: "Foto Editorial/Press, intro, snapshot, capabilities, contact, aset, rilisan, dan platform.",
        sections: [
          {
            title: "Editorial / Press card",
            detail: "Foto yang muncul di kartu Editorial / Press bagian atas EPK.",
            icon: ImageIcon,
            editType: "pressKit",
            sourceLabel: firstDocument(documents, "pressKit") ? "CMS · Press & Booking" : "Fallback resmi · Editorial portrait",
            items: [mediaItem("Foto editorial / Press card", editorialImage), textItem("Displayed location", pressLocation), textItem("Displayed alias", pressAlias)],
          },
          {
            title: "EPK intro & Artist Snapshot",
            detail: "Semua copy snapshot yang tampil pada halaman EPK.",
            icon: FileText,
            editType: "pressKit",
            sourceLabel: firstDocument(documents, "pressKit") ? "CMS · Press & Booking" : "Fallback resmi · EPK profile",
            items: [textItem("EPK intro", stringValue(pressKit, "intro") || "Informasi untuk promoter, media, playlist editor, dan kolaborator."), textItem("Snapshot bio", pressBio), textItem("Snapshot location", pressLocation), textItem("Snapshot genres", pressGenres), textItem("Snapshot alias", pressAlias), textItem("Capabilities intro", stringValue(pressKit, "capabilitiesIntro") || "Format kerja yang tersedia untuk performance, produksi, kolaborasi, dan penggunaan musik."), textItem("Licensing note", stringValue(pressKit, "licensingNote") || verifiedArtistProfile.licensing)].filter(item => item.value),
          },
          {
            title: "EPK contacts & official assets",
            detail: "Email kontak dan URL aset yang ditawarkan kepada promotor/media.",
            icon: Link2,
            editType: "pressKit",
            sourceLabel: firstDocument(documents, "pressKit") ? "CMS · Press & Booking" : "Fallback resmi · Press contact",
            items: [linkItem("Press email", `mailto:${pressEmail}`), linkItem("Booking email", `mailto:${stringValue(pressKit, "bookingEmail") || verifiedArtistProfile.bookingEmail}`), ...["oneSheetUrl", "photoPackUrl", "logoPackUrl", "technicalRiderUrl"].map(key => linkItem(key, stringValue(pressKit, key))).filter(item => item.value)],
          },
          {
            title: "Selected releases & platforms",
            detail: "Tiga rilisan pilihan dan lima kanal resmi pada bagian akhir EPK.",
            icon: Radio,
            editType: "release",
            sourceLabel: documentsOf(documents, "release").length || firstDocument(documents, "siteSettings") ? "CMS · Release / Site settings" : "Fallback resmi",
            items: [...releaseItems(documents).slice(0, 3), ...platforms.slice(0, 5).map(link => linkItem(link.label, link.href))],
          },
        ],
      },
      {
        route: "/inquire",
        title: "Contact / Inquiry",
        marker: "INQUIRY ROUTE",
        summary: "Form booking, remix, collaboration, dan licensing serta jalur review owner.",
        sections: [
          {
            title: "Inquiry types & source routes",
            detail: "Pilihan yang bisa dipilih pengunjung dan sumber CTA yang mengarah ke form.",
            icon: Link2,
            sourceLabel: "Fixed form · Inquiry workflow",
            items: [linkItem("Booking", "/inquire?type=booking&source=epk"), linkItem("Remix", "/inquire?type=remix&source=epk"), linkItem("Collaboration", "/inquire?type=collaboration&source=epk"), linkItem("Licensing", "/inquire?type=licensing&source=licensing"), linkItem("Licensing page", "/licensing")],
          },
          {
            title: "Form fields & submission",
            detail: "Field yang tampil pada form. Data dikirim melalui workflow inquiry yang sudah ada.",
            icon: FileText,
            sourceLabel: "Fixed form · Tidak dikelola sebagai copy CMS",
            items: ["Name", "Email", "Organization / Artist name", "Project / Event title", "Location / Market", "Timeline", "Budget context", "Message"].map(label => textItem(label, "Field form publik")),
          },
        ],
      },
      {
        route: "/licensing",
        title: "Music Licensing",
        marker: "MUSIC USAGE",
        summary: "Informasi penggunaan musik, konteks licensing, terms, dan CTA menuju inquiry.",
        sections: [
          {
            title: "Licensing posture & inquiry CTA",
            detail: "Copy resmi dan link yang tampil pada halaman Music Licensing.",
            icon: FileText,
            editType: "profile",
            sourceLabel: "Fallback resmi · Artist licensing profile",
            items: [textItem("Licensing note", verifiedArtistProfile.licensing), linkItem("Kirim permintaan", "/inquire?type=licensing&source=licensing")],
          },
          {
            title: "Usage routes",
            detail: "Tiga konteks penggunaan yang dijelaskan kepada pemohon.",
            icon: Link2,
            sourceLabel: "Fixed page copy · Licensing route",
            items: [textItem("Content & social", "Penggunaan pada konten publik, kanal brand, atau distribusi tertentu."), textItem("Event & performance", "Penggunaan rekaman, custom arrangement, atau format performance."), textItem("Commercial & brand", "Kampanye, sinkronisasi, wilayah, durasi, dan bentuk pemakaian.")],
          },
        ],
      },
      {
        route: "/privacy",
        title: "Privacy Policy",
        marker: "DATA NOTE",
        summary: "Legal intro, lima section kebijakan, effective date, layanan pihak ketiga, dan kontak data.",
        sections: [
          {
            title: "Reviewed legal document",
            detail: "Copy kebijakan yang bisa diubah melalui dokumen Legal di Studio.",
            icon: FileText,
            editType: "legal",
            sourceLabel: firstDocument(documents, "legal") ? "CMS · Legal document" : "Fallback resmi · Privacy policy",
            items: [textItem("Title", stringValue(legal, "title") || "Privacy Policy"), textItem("Version", stringValue(legal, "version") || "Current"), textItem("Effective date", stringValue(legal, "effectiveDate") || "25 Aug 2026"), textItem("Intro", stringValue(legal, "intro") || "Penjelasan tentang data yang diproses saat memakai situs resmi.")],
          },
          {
            title: "Privacy contact & fixed disclosures",
            detail: "Link kontak data dan disclosure yang tetap hadir pada halaman publik.",
            icon: Link2,
            sourceLabel: "Mixed · Legal document + fixed privacy disclosures",
            items: [linkItem("Ask about your data", `mailto:${stringValue(settings, "pressEmail") || verifiedArtistProfile.bookingEmail}`), textItem("Leaderboard", "Username publik dan score saja; tanpa email, IP, user-agent, atau login."), textItem("Gallery analytics", "Kunjungan agregat dengan penanda anonim browser.")],
          },
        ],
      },
      {
        route: "/game/jedag-run",
        title: "JEDAG RUN",
        marker: "PLAYABLE SIGNAL",
        summary: "Gate username, copy game, audio, leaderboard, dan CTA kembali ke website.",
        sections: [
          {
            title: "Game copy & availability",
            detail: "Kontrol yang benar-benar memengaruhi route game dan teaser homepage.",
            icon: Sparkles,
            editType: "game",
            sourceLabel: firstDocument(documents, "game") ? "CMS · Game document" : "Fallback resmi · JEDAG RUN",
            items: [textItem("Title", stringValue(game, "title") || "JEDAG RUN — NIGHT FREQUENCY"), textItem("Kicker", stringValue(game, "kicker") || "PLAYABLE SIGNAL"), textItem("Intro", stringValue(game, "intro") || "Run the signal, collect the notes, and chase the drop."), textItem("Status", game.isEnabled === false ? "Disabled" : "Enabled")],
          },
          {
            title: "Game audio & sharing",
            detail: "BGM, SFX, dan label share yang dikelola dari Studio.",
            icon: Radio,
            editType: "game",
            sourceLabel: firstDocument(documents, "game") ? "CMS · Game audio" : "Fallback Web Audio",
            items: ["bgmUrl", "jumpSfxUrl", "collectSfxUrl", "hitSfxUrl", "dropSfxUrl", "gameOverSfxUrl"].map(key => mediaItem(key, stringValue(game, key))).filter(item => item.value).concat([textItem("Share label", stringValue(game, "shareLabel") || "SHARE SCORE")]),
          },
        ],
      },
    ];
    return { pages };
  }, [documents]);

  const selectedPage = content.pages.find(page => page.route === selectedRoute) || content.pages[0];
  return (
    <section id="studio-page-mirror" className="scroll-mt-24 overflow-hidden rounded-2xl border border-cyan-200/10 bg-cyan-200/[0.025] shadow-2xl shadow-black/10">
      <header className="border-b border-cyan-200/10 px-5 py-5 sm:px-7">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-200/70">
              <FileText size={13} />
              Page mirror / public source map
            </div>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">Edit berdasarkan halaman, bukan tebak-tebakan field.</h2>
            <p className="mt-2 max-w-3xl text-xs leading-5 text-white/45">
              Pilih halaman publik untuk melihat foto, copy, link, rilisan, dan asset yang benar-benar dipakai. Tombol Edit mengarah ke workflow CMS yang mengontrol bagian tersebut.
            </p>
          </div>
          <a href={selectedPage.route} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-cyan-200/20 bg-cyan-200/[0.06] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-cyan-100/80 transition hover:bg-cyan-200/[0.12]">
            Buka halaman publik <ExternalLink size={13} />
          </a>
        </div>
        <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
          {content.pages.map(page => (
            <button
              type="button"
              key={page.route}
              onClick={() => setSelectedRoute(page.route)}
              className={`shrink-0 rounded-xl border px-3 py-2 text-left transition ${selectedPage.route === page.route ? "border-cyan-200/45 bg-cyan-200/[0.12] text-cyan-100" : "border-white/10 bg-black/[0.12] text-white/55 hover:border-cyan-200/25 hover:text-white/80"}`}
            >
              <span className="block font-mono text-[8px] uppercase tracking-[0.14em] text-white/35">{page.marker}</span>
              <span className="mt-1 block text-xs font-medium">{page.title}</span>
            </button>
          ))}
        </div>
      </header>
      <div className="border-b border-white/[0.07] bg-black/[0.12] px-5 py-4 sm:px-7">
        <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-cyan-100/55">{selectedPage.route}</p>
        <h3 className="mt-1 text-lg font-semibold text-white">{selectedPage.title}</h3>
        <p className="mt-1 text-xs leading-5 text-white/40">{selectedPage.summary}</p>
      </div>
      <div className="grid gap-4 p-5 sm:p-7 lg:grid-cols-2">
        {selectedPage.sections.map(section => (
          <MirrorSectionCard key={section.title} section={section} onEditType={onEditType} />
        ))}
      </div>
    </section>
  );
}
