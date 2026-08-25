import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleDashed,
  Disc3,
  ExternalLink,
  FileText,
  Gamepad2,
  Image,
  Link2,
  Mail,
  MapPin,
  Music2,
  Pencil,
  Radio,
  UserRound,
  Video,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type StudioDocumentSummary = {
  documentType: string;
  isPublished: boolean;
};

type StudioSiteMapProps = {
  documents: StudioDocumentSummary[];
  onEditType: (type: string) => void;
  onOpenLibrary: () => void;
};

type SiteSection = {
  label: string;
  detail: string;
  icon: LucideIcon;
  editType?: string;
  fixed?: boolean;
};

type SitePage = {
  route: string;
  marker: string;
  title: string;
  summary: string;
  accent: string;
  sections: SiteSection[];
};

const sitePages: SitePage[] = [
  {
    route: "/",
    marker: "ORIGIN SIGNAL",
    title: "Homepage",
    summary:
      "Halaman pertama: foto, identitas, rilisan, platform, visual, live, dan Fan Signal.",
    accent: "cyan",
    sections: [
      {
        label: "Foto & hero utama",
        detail: "Kicker, judul, copy, foto hero, dan CTA utama.",
        icon: Image,
        editType: "hero",
      },
      {
        label: "Platform resmi",
        detail:
          "Spotify, YouTube, SoundCloud, Instagram, dan kanal resmi lainnya.",
        icon: Link2,
        editType: "siteSettings",
      },
      {
        label: "Rilisan terbaru",
        detail: "Cover, metadata, cerita, dan tombol menuju rilisan aktif.",
        icon: Disc3,
        editType: "release",
      },
      {
        label: "Diskografi",
        detail: "Daftar semua rilisan dan artwork yang tampil di homepage.",
        icon: Music2,
        editType: "release",
      },
      {
        label: "Visual resmi",
        detail: "Kartu video dan thumbnail visual resmi.",
        icon: Video,
        editType: "visual",
      },
      {
        label: "JEDAG RUN teaser",
        detail: "Teaser homepage menuju game penuh dan konfigurasi audio game.",
        icon: Gamepad2,
        editType: "game",
      },
      {
        label: "Jadwal pertunjukan",
        detail: "Status live serta maksimal tiga event terkonfirmasi.",
        icon: CalendarDays,
        editType: "event",
      },
      {
        label: "Fan Signal",
        detail:
          "Form update email; newsletter tetap dikelola sebagai sistem terpisah.",
        icon: Mail,
        fixed: true,
      },
    ],
  },
  {
    route: "/music",
    marker: "FREQUENCY ARCHIVE",
    title: "Music",
    summary:
      "Arsip musik dengan platform resmi, rilisan pilihan, player opsional, dan katalog lengkap.",
    accent: "violet",
    sections: [
      {
        label: "Hero Music Archive",
        detail: "Judul halaman dan rilisan yang menjadi featured release.",
        icon: Disc3,
        editType: "release",
      },
      {
        label: "Pilih platform",
        detail: "Matrix tautan streaming dan sosial resmi.",
        icon: Link2,
        editType: "siteSettings",
      },
      {
        label: "Release note",
        detail: "Cerita, kredit, artwork, dan link rilisan utama.",
        icon: FileText,
        editType: "release",
      },
      {
        label: "Dengar langsung",
        detail: "Embed SoundCloud opsional dan artwork player.",
        icon: Music2,
        editType: "release",
      },
      {
        label: "Semua rilisan",
        detail: "Katalog release card yang bersumber dari dokumen release.",
        icon: Disc3,
        editType: "release",
      },
      {
        label: "Fan Signal",
        detail: "Form update email dari sistem newsletter.",
        icon: Mail,
        fixed: true,
      },
    ],
  },
  {
    route: "/visuals",
    marker: "MOVING IMAGE BOARD",
    title: "Visuals",
    summary:
      "Papan visual untuk embed video, thumbnail, label, dan archive visual.",
    accent: "cyan",
    sections: [
      {
        label: "Visual channel hero",
        detail: "Intro halaman dan route menuju kanal resmi.",
        icon: Video,
        editType: "visual",
      },
      {
        label: "Selected video embeds",
        detail: "Video ID, URL resmi, dan thumbnail yang dipilih.",
        icon: Video,
        editType: "visual",
      },
      {
        label: "Visual archive",
        detail: "Grid seluruh visual yang sudah dimasukkan ke editor.",
        icon: Image,
        editType: "visual",
      },
      {
        label: "Portrait Studies",
        detail: "Foto studi, caption, alt text, dan urutan portrait yang tampil di gallery.",
        icon: Image,
        editType: "portrait",
      },
      {
        label: "Fan Signal",
        detail: "Form update email dari sistem newsletter.",
        icon: Mail,
        fixed: true,
      },
    ],
  },
  {
    route: "/live",
    marker: "DISPATCH / STANDBY",
    title: "Live",
    summary:
      "Halaman status pertunjukan: standby saat kosong, event board saat jadwal resmi tersedia.",
    accent: "amber",
    sections: [
      {
        label: "Live status",
        detail:
          "Status standby, announced, active, pesan publik, dan action URL.",
        icon: Radio,
        editType: "live",
      },
      {
        label: "Jadwal pertunjukan",
        detail:
          "Tanggal, jam lokal, kota, venue, poster, tiket, RSVP, dan status.",
        icon: CalendarDays,
        editType: "event",
      },
      {
        label: "Fan Signal",
        detail: "Form update email dari sistem newsletter.",
        icon: Mail,
        fixed: true,
      },
    ],
  },
  {
    route: "/universe",
    marker: "MEMORY BANK",
    title: "Archive / Universe",
    summary:
      "Konteks perjalanan, artwork release, dan jalur resmi untuk musik, remix, booking, dan licensing.",
    accent: "violet",
    sections: [
      {
        label: "Origin & perjalanan",
        detail:
          "Bio panjang, alias, lokasi, genre, dan link Google Maps terverifikasi.",
        icon: UserRound,
        editType: "profile",
      },
      {
        label: "Artwork rilisan",
        detail: "Pilihan artwork yang ditarik dari katalog release.",
        icon: Disc3,
        editType: "release",
      },
      {
        label: "Jalur kontak resmi",
        detail: "Link inquiry musik, remix, booking, dan licensing.",
        icon: ArrowUpRight,
        editType: "pressKit",
      },
      {
        label: "Fan Signal",
        detail: "Form update email dari sistem newsletter.",
        icon: Mail,
        fixed: true,
      },
    ],
  },
  {
    route: "/game/jedag-run",
    marker: "PLAYABLE SIGNAL",
    title: "JEDAG RUN",
    summary:
      "Game browser Night Frequency dengan BGM, SFX, score, combo, dan Drop Meter.",
    accent: "cyan",
    sections: [
      {
        label: "Game runtime",
        detail: "Gameplay, score, lives, combo, obstacle, note, dan Drop Meter.",
        icon: Gamepad2,
        editType: "game",
      },
      {
        label: "Game audio",
        detail: "BGM dan SFX opsional yang bisa diganti dari Studio melalui managed media.",
        icon: Music2,
        editType: "game",
      },
      {
        label: "Homepage teaser",
        detail: "Panel pengantar ringan yang mengarahkan pengunjung ke route game.",
        icon: ArrowUpRight,
        editType: "game",
      },
    ],
  },
  {
    route: "/about",
    marker: "ARTIST DOSSIER",
    title: "About",
    summary:
      "Profil publik artis dengan portrait, bio, lokasi, genre, statement, dan jalur musik/kontak.",
    accent: "bone",
    sections: [
      {
        label: "Portrait & profile hero",
        detail: "Foto profil, short bio, lokasi asal, dan link Google Maps.",
        icon: Image,
        editType: "profile",
      },
      {
        label: "Lokasi / Google Maps",
        detail:
          "Atur titik lokasi yang bisa dibuka pengunjung dari halaman About.",
        icon: MapPin,
        editType: "profile",
      },
      {
        label: "Perjalanan musik",
        detail: "Long bio, artist statement, alias, dan genre.",
        icon: UserRound,
        editType: "profile",
      },
      {
        label: "Music & contact CTA",
        detail: "Arah ke Music dan Press & Booking.",
        icon: Link2,
        editType: "pressKit",
      },
    ],
  },
  {
    route: "/epk",
    marker: "PRESS / BOOKING",
    title: "EPK",
    summary:
      "Online press kit untuk promoter, media, playlist editor, dan kolaborator.",
    accent: "bone",
    sections: [
      {
        label: "EPK intro & contacts",
        detail: "Intro, email booking, email press, dan portrait editorial.",
        icon: FileText,
        editType: "pressKit",
      },
      {
        label: "Artist snapshot",
        detail:
          "Bio panjang, lokasi, link Google Maps, alias, work, dan kontak.",
        icon: UserRound,
        editType: "profile",
      },
      {
        label: "Capabilities & licensing",
        detail:
          "Layanan remix, arrangement, collaboration, dan licensing note.",
        icon: Radio,
        editType: "profile",
      },
      {
        label: "Official assets",
        detail: "One sheet, photo pack, logo package, dan technical rider.",
        icon: Image,
        editType: "pressKit",
      },
      {
        label: "Selected releases",
        detail: "Tiga rilisan pilihan untuk press dan booking.",
        icon: Disc3,
        editType: "release",
      },
      {
        label: "Project contact",
        detail: "Booking, remix/collaboration, dan press contact.",
        icon: Mail,
        editType: "pressKit",
      },
      {
        label: "Official platforms",
        detail: "Kanal resmi yang tampil di bagian akhir EPK.",
        icon: Link2,
        editType: "siteSettings",
      },
    ],
  },
  {
    route: "/inquire",
    marker: "INQUIRY ROUTE",
    title: "Contact / Inquiry",
    summary:
      "Form masuk untuk booking, remix, collaboration, dan licensing yang ditinjau owner.",
    accent: "cyan",
    sections: [
      {
        label: "Inquiry type",
        detail: "Pilihan booking, remix, collaboration, dan licensing.",
        icon: Radio,
        fixed: true,
      },
      {
        label: "Project details",
        detail:
          "Nama, email, organisasi, project, lokasi, timeline, dan konteks budget.",
        icon: FileText,
        fixed: true,
      },
      {
        label: "Brief / message",
        detail:
          "Konteks kebutuhan, referensi, deliverable, dan hal penting lain.",
        icon: Mail,
        fixed: true,
      },
      {
        label: "Owner inbox",
        detail:
          "Inquiry yang masuk dilihat di route Inquiry Inbox dalam Control Room.",
        icon: UserRound,
        fixed: true,
      },
    ],
  },
  {
    route: "/licensing",
    marker: "USAGE ROUTE",
    title: "Licensing",
    summary:
      "Jalur awal untuk kebutuhan penggunaan musik di konten, event, brand, dan proyek komersial.",
    accent: "amber",
    sections: [
      {
        label: "Usage context",
        detail: "Konten & social, event & performance, commercial & brand.",
        icon: Radio,
        fixed: true,
      },
      {
        label: "Terms discussion",
        detail:
          "Hak, wilayah, durasi, biaya, eksklusivitas, dan deliverable dibicarakan berdasarkan proyek.",
        icon: FileText,
        fixed: true,
      },
      {
        label: "Submit licensing request",
        detail:
          "Form inquiry dengan tipe licensing sebagai jalur resmi pengajuan.",
        icon: Mail,
        fixed: true,
      },
    ],
  },
  {
    route: "/privacy",
    marker: "LEGAL RECORD",
    title: "Privacy / Legal",
    summary:
      "Dokumen legal yang dipublikasikan hanya setelah ditandai siap untuk publik.",
    accent: "amber",
    sections: [
      {
        label: "Privacy document",
        detail: "Judul, versi, tanggal berlaku, intro, dan bagian kebijakan.",
        icon: FileText,
        editType: "legal",
      },
    ],
  },
];

function documentCount(documents: StudioDocumentSummary[], type?: string) {
  return type
    ? documents.filter(document => document.documentType === type).length
    : 0;
}

function sourceLabel(documents: StudioDocumentSummary[], section: SiteSection) {
  if (section.fixed) return "SYSTEM / FIXED";
  const count = documentCount(documents, section.editType);
  if (count === 0) return "VERIFIED FALLBACK";
  return `${count} MANAGED ${count === 1 ? "DOCUMENT" : "DOCUMENTS"}`;
}

export default function StudioSiteMap({
  documents,
  onEditType,
  onOpenLibrary,
}: StudioSiteMapProps) {
  return (
    <details
      className="group rounded-2xl border border-cyan-200/10 bg-cyan-200/[0.025] p-5 shadow-2xl shadow-black/10 sm:p-6"
      aria-labelledby="studio-site-map-title"
    >
      <summary className="flex cursor-pointer list-none flex-col gap-4 outline-none [&::-webkit-details-marker]:hidden sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-200/70">
            <Radio size={13} /> 00 // Public site map
          </div>
          <h2
            id="studio-site-map-title"
            className="mt-2 text-2xl font-semibold tracking-tight text-white"
          >
            Isi website ada di sini.
          </h2>
          <p className="mt-2 text-xs leading-5 text-white/45">
            Ringkasan section publik dan sumber datanya. Buka panel ini hanya
            saat ingin memetakan halaman atau memilih editor yang tepat.
          </p>
        </div>
        <span className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-xs font-medium text-white/65 transition group-open:border-cyan-200/30 group-open:bg-cyan-200/[0.08] group-open:text-cyan-100">
          Buka peta{" "}
          <ChevronDown
            size={15}
            className="transition-transform group-open:rotate-180"
          />
        </span>
      </summary>
      <div className="mt-5 space-y-5">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onOpenLibrary}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-[10px] font-medium uppercase tracking-[0.1em] text-white/65 transition hover:border-cyan-200/30 hover:bg-cyan-200/[0.08] hover:text-cyan-100"
          >
            <ExternalLink size={13} /> Lihat semua dokumen
          </button>
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          {sitePages.map(page => (
            <article
              key={page.route}
              className="overflow-hidden rounded-2xl border border-white/[0.08] bg-black/[0.14]"
            >
              <header className="flex items-start justify-between gap-4 border-b border-white/[0.08] px-4 py-4 sm:px-5">
                <div className="min-w-0">
                  <p
                    className={`font-mono text-[9px] uppercase tracking-[0.2em] ${page.accent === "violet" ? "text-violet-200/70" : page.accent === "amber" ? "text-amber-200/70" : page.accent === "bone" ? "text-[#f3ead8]/60" : "text-cyan-200/70"}`}
                  >
                    {page.marker}
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-white">
                    {page.title}
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-white/40">
                    {page.summary}
                  </p>
                </div>
                <a
                  href={page.route}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-white/10 px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-white/45 transition hover:border-cyan-200/30 hover:text-cyan-100"
                  aria-label={`Buka halaman ${page.title}`}
                >
                  <span className="hidden sm:inline">Buka</span>{" "}
                  <ArrowUpRight size={13} />
                </a>
              </header>
              <div className="divide-y divide-white/[0.06]">
                {page.sections.map(section => {
                  const Icon = section.icon;
                  const managed =
                    !section.fixed &&
                    documentCount(documents, section.editType) > 0;
                  return (
                    <div
                      key={section.label}
                      className="flex items-start gap-3 px-4 py-3.5 sm:px-5"
                    >
                      <span
                        className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg border ${managed ? "border-emerald-200/15 bg-emerald-200/[0.06] text-emerald-100/75" : section.fixed ? "border-white/10 bg-white/[0.035] text-white/30" : "border-cyan-200/12 bg-cyan-200/[0.04] text-cyan-100/65"}`}
                      >
                        <Icon size={14} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <h4 className="text-sm font-medium text-white/85">
                            {section.label}
                          </h4>
                          <span className="inline-flex items-center gap-1 font-mono text-[8px] uppercase tracking-[0.11em] text-white/30">
                            {managed ? (
                              <CheckCircle2
                                size={10}
                                className="text-emerald-200/70"
                              />
                            ) : section.fixed ? (
                              <CircleDashed size={10} />
                            ) : (
                              <CircleDashed
                                size={10}
                                className="text-cyan-200/55"
                              />
                            )}
                            {sourceLabel(documents, section)}
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] leading-5 text-white/38">
                          {section.detail}
                        </p>
                      </div>
                      {section.editType ? (
                        <button
                          type="button"
                          onClick={() => onEditType(section.editType!)}
                          className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-white/10 px-2 py-1.5 text-[9px] font-medium uppercase tracking-[0.1em] text-white/45 transition hover:border-cyan-200/30 hover:bg-cyan-200/[0.06] hover:text-cyan-100"
                        >
                          <Pencil size={11} />{" "}
                          <span className="hidden sm:inline">Editor</span>
                        </button>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </article>
          ))}
        </div>
      </div>
    </details>
  );
}
