import {
  ArrowUpRight,
  ExternalLink,
  Eye,
  FileText,
  Image as ImageIcon,
  Link2,
} from "lucide-react";
import { useState } from "react";
import { StudioAssetPreview, StudioLinkPreview } from "./StudioAssetPreview";

type DocumentType =
  | "hero"
  | "profile"
  | "journey"
  | "pressKit"
  | "siteSettings"
  | "legal"
  | "release"
  | "visual"
  | "portrait"
  | "photoStory"
  | "live"
  | "event"
  | "game";
type Payload = Record<string, unknown>;

const publicRoutes: Record<DocumentType, { route: string; surface: string }> = {
  hero: { route: "/", surface: "Homepage" },
  profile: { route: "/about", surface: "About / Universe / EPK" },
  journey: { route: "/", surface: "Homepage Journey + About" },
  pressKit: { route: "/epk", surface: "EPK" },
  siteSettings: { route: "/", surface: "Homepage + metadata" },
  legal: { route: "/privacy", surface: "Privacy" },
  release: { route: "/music", surface: "Music + rilisan" },
  visual: { route: "/visuals", surface: "Visuals + homepage" },
  portrait: { route: "/visuals#portraits", surface: "Visuals · portrait" },
  photoStory: { route: "/", surface: "Homepage Photo Story" },
  live: { route: "/live", surface: "Live" },
  event: { route: "/live", surface: "Live" },
  game: { route: "/game/jedag-run", surface: "Game + homepage" },
};

function value(payload: Payload, key: string) {
  return typeof payload[key] === "string" ? payload[key].trim() : "";
}

const mediaLabels: Record<string, string> = {
  heroImage: "Foto hero",
  portraitImage: "Portrait",
  artworkUrl: "Cover rilisan",
  imageUrl: "Thumbnail",
  posterUrl: "Poster",
  socialPreviewUrl: "Social preview",
  bgmUrl: "BGM",
  jumpSfxUrl: "SFX lompat",
};

function mediaValues(payload: Payload) {
  return Object.entries(mediaLabels)
    .map(([key, label]) => ({ key, label, url: value(payload, key) }))
    .filter(m => m.url);
}

function linkValues(payload: Payload) {
  const keys = ["primaryActionUrl", "url", "spotifyUrl", "appleMusicUrl", "locationUrl", "mapsUrl", "ticketUrl", "rsvpUrl"];
  const links = keys.map(k => ({ label: k, href: value(payload, k) })).filter(l => l.href);
  const platformText = value(payload, "platformLinksText");
  if (platformText) {
    platformText.split("\n").forEach(line => {
      const [label, ...hrefParts] = line.split("|").map(i => i.trim());
      const href = hrefParts.join(" | ");
      if (label && href) links.push({ label, href });
    });
  }
  return links.slice(0, 6);
}

export default function StudioDocumentPreview({
  documentType,
  payload,
  slug,
}: {
  documentType: DocumentType;
  payload: Payload;
  slug: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const route = publicRoutes[documentType];
  const title = value(payload, "heroTitle") || value(payload, "siteTitle") || value(payload, "title") || `${documentType} preview`;
  const media = mediaValues(payload);
  const links = linkValues(payload);

  return (
    <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-zinc-800 px-5 py-4">
        <div>
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-zinc-500"><Eye size={12} /> Preview</div>
          <h3 className="mt-1.5 text-[14px] font-semibold text-white">Yang akan terlihat di publik</h3>
          <p className="mt-1 text-[11px] text-zinc-500">{route.surface} · {route.route} · {slug || "default"}</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setExpanded(c => !c)} className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-[11px] text-zinc-400 hover:text-white hover:bg-zinc-800">{expanded ? "Tutup" : "Lihat"}</button>
          <a href={route.route} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-[11px] font-medium text-black hover:bg-zinc-200">Buka <ExternalLink size={11} /></a>
        </div>
      </div>

      {!expanded ? (
        <div className="flex flex-wrap items-center gap-4 px-5 py-3 text-[11px] text-zinc-500">
          <span className="inline-flex items-center gap-1.5"><FileText size={12} /> {title}</span>
          <span>{media.length} media</span>
          <span>{links.length} link</span>
          <span className="text-amber-200/60">Draft — belum live sampai disimpan</span>
        </div>
      ) : (
        <div className="grid gap-5 p-5">
          <div>
            <span className="inline-flex rounded-full border border-zinc-800 bg-zinc-950 px-2.5 py-1 font-mono text-[10px] text-zinc-500">{documentType}</span>
            <h4 className="mt-3 text-[18px] font-semibold text-white">{title}</h4>
          </div>
          {media.length ? <div className="grid gap-3 sm:grid-cols-2">{media.map(item => <StudioAssetPreview key={item.key} value={item.url} label={item.label} />)}</div> : <div className="flex items-center gap-2 rounded-lg border border-dashed border-zinc-800 px-4 py-4 text-[12px] text-zinc-500"><ImageIcon size={16} /> Belum ada media</div>}
          {links.length ? <div className="space-y-2"><p className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-zinc-500"><Link2 size={11} /> Link terdeteksi</p>{links.map(link => <StudioLinkPreview key={`${link.label}-${link.href}`} value={link.href} label={link.label} />)}</div> : null}
        </div>
      )}

      <div className="flex items-center gap-2 border-t border-zinc-800 px-5 py-2.5 text-[10px] text-zinc-500"><ArrowUpRight size={11} /> Preview mengikuti draft. Baru tayang setelah disimpan sebagai Published.</div>
    </section>
  );
}
