import {
  ArrowUpRight,
  ChevronDown,
  Eye,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Link2,
} from "lucide-react";
import { useState } from "react";
import { StudioAssetPreview, StudioLinkPreview } from "./StudioAssetPreview";

type DocumentType =
  | "hero"
  | "profile"
  | "pressKit"
  | "siteSettings"
  | "legal"
  | "release"
  | "visual"
  | "live"
  | "event";
type Payload = Record<string, unknown>;

type StudioDocumentPreviewProps = {
  documentType: DocumentType;
  payload: Payload;
  slug: string;
};

const publicRoutes: Record<DocumentType, { route: string; surface: string }> = {
  hero: { route: "/", surface: "Homepage" },
  profile: { route: "/about", surface: "About / Universe / EPK" },
  pressKit: { route: "/epk", surface: "EPK" },
  siteSettings: { route: "/", surface: "Homepage + metadata" },
  legal: { route: "/privacy", surface: "Privacy / Legal" },
  release: { route: "/music", surface: "Music + release cards" },
  visual: { route: "/visuals", surface: "Visuals + homepage" },
  live: { route: "/live", surface: "Live + homepage" },
  event: { route: "/live", surface: "Live + homepage" },
};

function value(payload: Payload, key: string) {
  return typeof payload[key] === "string" ? payload[key].trim() : "";
}

const mediaLabels: Record<string, string> = {
  heroImage: "Foto hero",
  portraitImage: "Portrait artis",
  artworkUrl: "Cover rilisan",
  imageUrl: "Thumbnail visual",
  posterUrl: "Poster pertunjukan",
  socialPreviewUrl: "Social preview / OG image",
  oneSheetUrl: "One sheet",
  photoPackUrl: "Photo pack",
  logoPackUrl: "Logo pack",
  technicalRiderUrl: "Technical rider",
};

function mediaValues(payload: Payload) {
  return Object.entries(mediaLabels)
    .map(([key, label]) => ({ key, label, url: value(payload, key) }))
    .filter(media => media.url);
}

function linkValues(payload: Payload) {
  const keys = [
    "primaryActionUrl",
    "url",
    "embedUrl",
    "spotifyUrl",
    "appleMusicUrl",
    "locationUrl",
    "mapsUrl",
    "ticketUrl",
    "rsvpUrl",
    "actionUrl",
    "canonicalUrl",
  ];
  const links = keys
    .map(key => ({ label: key, href: value(payload, key) }))
    .filter(link => link.href);
  const platformText = value(payload, "platformLinksText");
  if (platformText) {
    platformText.split("\n").forEach(line => {
      const [label, ...hrefParts] = line.split("|").map(item => item.trim());
      const href = hrefParts.join(" | ");
      if (label && href) links.push({ label, href });
    });
  }
  return links
    .filter(
      (link, index, all) =>
        all.findIndex(item => item.href === link.href) === index
    )
    .slice(0, 8);
}

function textValue(payload: Payload) {
  return (
    [
      "heroBody",
      "shortBio",
      "intro",
      "story",
      "message",
      "artistStatement",
      "metaDescription",
      "ogDescription",
      "description",
      "body",
    ]
      .map(key => value(payload, key))
      .find(Boolean) || "Belum ada copy yang diisi untuk dokumen ini."
  );
}

export default function StudioDocumentPreview({
  documentType,
  payload,
  slug,
}: StudioDocumentPreviewProps) {
  const [expanded, setExpanded] = useState(false);
  const route = publicRoutes[documentType];
  const title =
    value(payload, "heroTitle") ||
    value(payload, "siteTitle") ||
    value(payload, "title") ||
    value(payload, "shortBio") ||
    `${documentType} preview`;
  const media = mediaValues(payload);
  const links = linkValues(payload);
  return (
    <section
      className="mt-5 overflow-hidden rounded-2xl border border-violet-200/15 bg-violet-200/[0.035]"
      aria-label="Live document preview"
    >
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/[0.08] px-5 py-4 sm:px-6">
        <div>
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-violet-200/75">
            <Eye size={13} />
            03 // Live preview
          </div>
          <h3 className="mt-2 text-lg font-semibold text-white">
            Yang akan terlihat di publik
          </h3>
          <p className="mt-1 text-xs text-white/40">
            {route.surface} · {route.route} · {slug || "default"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setExpanded(current => !current)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-black/15 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-white/60 transition hover:border-violet-200/30 hover:bg-violet-200/[0.08] hover:text-violet-100"
          >
            {expanded ? "Tutup preview" : "Lihat preview"}
            <ChevronDown
              size={12}
              className={`transition-transform ${expanded ? "rotate-180" : ""}`}
            />
          </button>
          <a
            href={route.route}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-violet-200/20 bg-violet-200/[0.06] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-violet-100/80 transition hover:bg-violet-200/[0.12]"
          >
            Buka halaman <ExternalLink size={12} />
          </a>
        </div>
      </div>
      {!expanded ? (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-5 py-4 text-xs text-white/45 sm:px-6">
          <span className="inline-flex items-center gap-2">
            <FileText size={13} className="text-violet-200/65" />
            {title}
          </span>
          <span>{media.length} media terpasang</span>
          <span>{links.length} link terdeteksi</span>
          <span className="text-amber-100/55">
            Draft preview · belum live sampai disimpan
          </span>
        </div>
      ) : (
        <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/15 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-white/45">
              <FileText size={12} />
              {documentType}
            </span>
            <h4 className="mt-4 text-2xl font-semibold tracking-tight text-white">
              {title}
            </h4>
            <p className="mt-3 text-xs leading-5 text-white/50">
              {textValue(payload)}
            </p>
            {value(payload, "location") ? (
              <p className="mt-4 flex items-center gap-2 text-xs text-white/65">
                <span className="text-cyan-100/60">Location</span>
                {value(payload, "location")}
              </p>
            ) : null}
          </div>
          <div className="min-w-0">
            {media.length ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {media.map(item => (
                  <StudioAssetPreview
                    key={item.key}
                    value={item.url}
                    label={item.label}
                  />
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-xl border border-dashed border-white/10 px-4 py-5 text-xs text-white/35">
                <ImageIcon size={17} />
                Belum ada media terpasang.
              </div>
            )}
            {links.length ? (
              <div className="mt-4 space-y-2">
                <p className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.15em] text-white/40">
                  <Link2 size={12} />
                  Link preview
                </p>
                {links.map(link => (
                  <StudioLinkPreview
                    key={`${link.label}-${link.href}`}
                    value={link.href}
                    label={link.label}
                  />
                ))}
              </div>
            ) : (
              <p className="mt-4 text-xs text-white/35">
                Belum ada link pada dokumen ini.
              </p>
            )}
          </div>
        </div>
      )}
      <div className="flex items-center gap-2 border-t border-white/[0.08] px-5 py-3 text-[10px] leading-4 text-white/35 sm:px-6">
        <ArrowUpRight size={12} className="shrink-0 text-violet-200/60" />
        Preview ini mengikuti draft saat ini; perubahan baru tampil ke publik
        setelah disimpan sebagai Published.
      </div>
    </section>
  );
}
