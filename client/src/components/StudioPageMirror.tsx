/**
 * PAGE MIRROR v2 — lebih ringkas, tanpa cyan overload.
 */
import { ArrowUpRight, ExternalLink, FileText, Image as ImageIcon, Link2, Pencil, Radio } from "lucide-react";
import { useMemo, useState } from "react";
import { allPlatformLinks, currentRelease, officialBrand, portraitStudies, releases, verifiedArtistProfile, videos } from "@/content/artistPlatform";
import { StudioAssetPreview, StudioLinkPreview } from "./StudioAssetPreview";

type EditorDocument = {
  id: number;
  documentType: string;
  slug: string;
  payload: Record<string, unknown>;
  sortOrder: number;
  isPublished: boolean;
};

type MirrorItem = { label: string; value: string; kind?: "text" | "link" | "media" };
type MirrorSection = { title: string; detail: string; icon: typeof FileText; editType?: string; items: MirrorItem[]; sourceLabel: string };
type MirrorPage = { route: string; title: string; marker: string; summary: string; sections: MirrorSection[] };

function stringValue(payload: Record<string, unknown>, key: string) {
  return typeof payload[key] === "string" ? String(payload[key]).trim() : "";
}
function parsePlatformLinks(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.filter(i => Boolean(i && typeof i === "object" && !Array.isArray(i))).map(item => {
    const r = item as Record<string, unknown>;
    return { label: typeof r.label === "string" ? r.label.trim() : "", href: typeof r.href === "string" ? r.href.trim() : "" };
  }).filter(i => i.label && i.href);
}
function firstDocument(docs: EditorDocument[], type: string) {
  return docs.filter(d => d.documentType === type).sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id)[0];
}
function documentsOf(docs: EditorDocument[], type: string) {
  return docs.filter(d => d.documentType === type).sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
}
function textItem(label: string, value: string): MirrorItem { return { label, value, kind: "text" }; }
function linkItem(label: string, value: string): MirrorItem { return { label, value, kind: "link" }; }
function mediaItem(label: string, value: string): MirrorItem { return { label, value, kind: "media" }; }

function MirrorSectionCard({ section, onEditType }: { section: MirrorSection; onEditType: (type: string) => void }) {
  const Icon = section.icon;
  return (
    <article className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/40">
      <div className="flex items-start justify-between gap-3 border-b border-zinc-800 px-4 py-3">
        <div className="flex items-start gap-2.5">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-zinc-800 text-zinc-400"><Icon size={13} /></span>
          <div>
            <h4 className="text-[13px] font-medium text-white">{section.title}</h4>
            <p className="mt-0.5 text-[11px] leading-4 text-zinc-500">{section.detail}</p>
          </div>
        </div>
        {section.editType ? <button type="button" onClick={() => onEditType(section.editType!)} className="inline-flex items-center gap-1 rounded-lg border border-zinc-800 px-2 py-1 text-[10px] text-zinc-400 hover:text-white hover:bg-zinc-800"><Pencil size={10} />Edit</button> : null}
      </div>
      <div className="space-y-2 p-4">
        <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">{section.sourceLabel}</p>
        {section.items.length ? (
          <div className="space-y-2">
            {section.items.map(item => (
              <div key={`${item.label}-${item.value}`} className="rounded-lg border border-zinc-800/80 bg-zinc-950 p-3">
                <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">{item.label}</p>
                {item.kind === "media" ? <StudioAssetPreview value={item.value} label={item.label} /> : item.kind === "link" && item.value.startsWith("http") ? <StudioLinkPreview value={item.value} label={item.label} /> : <p className="mt-1 break-words text-[12px] leading-5 text-zinc-300">{item.value}</p>}
              </div>
            ))}
          </div>
        ) : <p className="rounded-lg border border-dashed border-zinc-800 px-3 py-3 text-[12px] text-zinc-500">Belum ada data.</p>}
      </div>
    </article>
  );
}

export default function StudioPageMirror({ documents, onEditType }: { documents: EditorDocument[]; onEditType: (type: string) => void }) {
  const [selectedRoute, setSelectedRoute] = useState("/");
  const content = useMemo(() => {
    const hero = firstDocument(documents, "hero")?.payload ?? {};
    const profile = firstDocument(documents, "profile")?.payload ?? {};
    const pressKit = firstDocument(documents, "pressKit")?.payload ?? {};
    const settings = firstDocument(documents, "siteSettings")?.payload ?? {};
    const live = firstDocument(documents, "live")?.payload ?? {};
    const legal = firstDocument(documents, "legal")?.payload ?? {};
    const game = firstDocument(documents, "game")?.payload ?? {};
    const journey = firstDocument(documents, "journey")?.payload ?? {};
    const platforms = parsePlatformLinks(settings.platformLinks).length ? parsePlatformLinks(settings.platformLinks) : allPlatformLinks;
    const portrait = stringValue(profile, "portraitImage") || officialBrand.portrait;
    const editorialImage = stringValue(pressKit, "editorialImage") || portrait || officialBrand.editorialPortrait;
    const featuredRelease = firstDocument(documents, "release")?.payload ?? {};
    const releaseArtwork = stringValue(featuredRelease, "artworkUrl") || currentRelease.image;
    const profileLocation = stringValue(profile, "location") || verifiedArtistProfile.location;
    const profileBio = stringValue(profile, "longBio") || verifiedArtistProfile.longBio;
    const pressBio = stringValue(pressKit, "snapshotBio") || profileBio;

    const journeyMilestones = Array.isArray(journey.milestones) ? (journey.milestones as any[]).filter(Boolean).map((r: any) => textItem(String(r.year || "Milestone"), `${String(r.title || "")} — ${String(r.body || "")}`)) : [];

    const pages: MirrorPage[] = [
      {
        route: "/",
        title: "Homepage",
        marker: "Origin",
        summary: "Hero, platform, rilisan, visual, live, game.",
        sections: [
          { title: "Hero", detail: "First impression homepage", icon: ImageIcon, editType: "hero", sourceLabel: firstDocument(documents, "hero") ? "CMS · Hero" : "Fallback", items: [textItem("Judul", stringValue(hero, "heroTitle") || "AKBAR NAWASUNDA."), textItem("Copy", stringValue(hero, "heroBody") || verifiedArtistProfile.shortBio), linkItem("CTA", stringValue(hero, "primaryActionUrl") || currentRelease.href), mediaItem("Foto", stringValue(hero, "heroImage") || portrait)] },
          { title: "Platform", detail: "Link streaming homepage", icon: Link2, editType: "siteSettings", sourceLabel: "Platform links", items: platforms.map(l => linkItem(l.label, l.href)) },
          { title: "Rilisan", detail: "Featured release", icon: Radio, editType: "release", sourceLabel: "Release", items: [linkItem(stringValue(featuredRelease, "title") || currentRelease.title, stringValue(featuredRelease, "url") || currentRelease.href), mediaItem("Cover", releaseArtwork)] },
          { title: "Journey", detail: "Biografi & milestone", icon: FileText, editType: "journey", sourceLabel: "Journey", items: [textItem("Judul", stringValue(journey, "title") || "PERJALANAN MUSIK."), textItem("Intro", stringValue(journey, "intro") || profileBio), ...journeyMilestones].filter(i => i.value) },
        ],
      },
      {
        route: "/music",
        title: "Music",
        marker: "Archive",
        summary: "Platform & katalog rilisan.",
        sections: [
          { title: "Platform", detail: "Streaming links", icon: Link2, editType: "siteSettings", sourceLabel: "Site settings", items: platforms.map(l => linkItem(l.label, l.href)) },
          { title: "Katalog", detail: "Semua rilisan", icon: Radio, editType: "release", sourceLabel: "Releases", items: documentsOf(documents, "release").length ? documentsOf(documents, "release").map(d => linkItem(stringValue(d.payload, "title") || d.slug, stringValue(d.payload, "url") || "")) : releases.map(r => linkItem(r.title, r.href)) },
        ],
      },
      {
        route: "/visuals",
        title: "Visuals",
        marker: "Video",
        summary: "Video & foto.",
        sections: [
          { title: "Visual cards", detail: "Kartu visual", icon: ImageIcon, editType: "visual", sourceLabel: "Visual docs", items: documentsOf(documents, "visual").length ? documentsOf(documents, "visual").map(d => linkItem(stringValue(d.payload, "title") || d.slug, stringValue(d.payload, "url") || "")) : videos.map(v => linkItem(v.title, v.href)) },
        ],
      },
      {
        route: "/live",
        title: "Live",
        marker: "Show",
        summary: "Status & jadwal.",
        sections: [
          { title: "Status", detail: "Pesan live", icon: Radio, editType: "live", sourceLabel: "Live signal", items: [textItem("Status", stringValue(live, "status") || "standby"), textItem("Message", stringValue(live, "message") || "Belum ada jadwal")] },
        ],
      },
      {
        route: "/epk",
        title: "EPK",
        marker: "Press",
        summary: "Press & booking.",
        sections: [
          { title: "Editorial", detail: "Foto press card", icon: ImageIcon, editType: "pressKit", sourceLabel: "PressKit", items: [mediaItem("Foto editorial", editorialImage), textItem("Lokasi", stringValue(pressKit, "snapshotLocation") || profileLocation)] },
          { title: "Bio", detail: "Snapshot", icon: FileText, editType: "pressKit", sourceLabel: "PressKit", items: [textItem("Bio", pressBio)] },
        ],
      },
      {
        route: "/game/jedag-run",
        title: "Game",
        marker: "Mini",
        summary: "JEDAG RUN.",
        sections: [
          { title: "Copy & status", detail: "Judul & intro", icon: FileText, editType: "game", sourceLabel: "Game", items: [textItem("Title", stringValue(game, "title") || "JEDAG RUN"), textItem("Intro", stringValue(game, "intro") || "")] },
        ],
      },
    ];
    return { pages };
  }, [documents]);

  const selectedPage = content.pages.find(p => p.route === selectedRoute) || content.pages[0];

  return (
    <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/30">
      <header className="border-b border-zinc-800 px-5 py-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-zinc-500"><FileText size={12} /> Page mirror</div>
            <h2 className="mt-2 text-[18px] font-semibold text-white">Lihat isi per halaman, bukan tebak field.</h2>
            <p className="mt-1 max-w-2xl text-[12px] leading-5 text-zinc-400">Pilih halaman publik, lihat apa yang tampil, klik Edit untuk langsung ubah.</p>
          </div>
          <a href={selectedPage.route} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-[11px] text-zinc-300 hover:text-white">Buka <ExternalLink size={12} /></a>
        </div>
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {content.pages.map(page => (
            <button key={page.route} type="button" onClick={() => setSelectedRoute(page.route)} className={`shrink-0 rounded-lg border px-3 py-2 text-left transition ${selectedPage.route === page.route ? "border-zinc-600 bg-zinc-800 text-white" : "border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-zinc-200"}`}>
              <span className="block font-mono text-[9px] uppercase tracking-wider text-zinc-500">{page.marker}</span>
              <span className="mt-0.5 block text-[12px] font-medium">{page.title}</span>
            </button>
          ))}
        </div>
      </header>
      <div className="border-b border-zinc-800 bg-zinc-950/50 px-5 py-3">
        <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">{selectedPage.route}</p>
        <h3 className="mt-1 text-[14px] font-semibold text-white">{selectedPage.title}</h3>
        <p className="mt-0.5 text-[12px] text-zinc-500">{selectedPage.summary}</p>
      </div>
      <div className="grid gap-4 p-5 lg:grid-cols-2">
        {selectedPage.sections.map(s => <MirrorSectionCard key={s.title} section={s} onEditType={onEditType} />)}
      </div>
    </section>
  );
}
