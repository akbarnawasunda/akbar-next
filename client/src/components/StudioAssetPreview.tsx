import { ArrowUpRight, FileAudio, FileText, FileVideo, Image as ImageIcon, Link2, TriangleAlert } from "lucide-react";

type PreviewKind = "image" | "audio" | "video" | "pdf" | "link";

type StudioAssetPreviewProps = {
  value?: string;
  label?: string;
  mimeType?: string;
  compact?: boolean;
};

function normalizeValue(value?: string) {
  return value?.trim() || "";
}

function kindFor(value: string, mimeType?: string): PreviewKind {
  const mime = mimeType?.toLowerCase() || "";
  const lower = value.toLowerCase().split("?")[0];
  if (mime.startsWith("image/") || /\.(avif|gif|jpe?g|png|svg|webp)$/.test(lower)) return "image";
  if (mime.startsWith("audio/") || /\.(aac|flac|m4a|mp3|ogg|wav)$/.test(lower)) return "audio";
  if (mime.startsWith("video/") || /\.(m4v|mov|mp4|webm)$/.test(lower)) return "video";
  if (mime === "application/pdf" || /\.pdf$/.test(lower)) return "pdf";
  return "link";
}

function Icon({ kind }: { kind: PreviewKind }) {
  if (kind === "image") return <ImageIcon size={15} />;
  if (kind === "audio") return <FileAudio size={15} />;
  if (kind === "video") return <FileVideo size={15} />;
  if (kind === "pdf") return <FileText size={15} />;
  return <Link2 size={15} />;
}

export function StudioAssetPreview({ value, label = "Preview", mimeType, compact = false }: StudioAssetPreviewProps) {
  const url = normalizeValue(value);
  if (!url) return null;
  const kind = kindFor(url, mimeType);
  const className = compact
    ? "mt-2 overflow-hidden rounded-lg border border-white/10 bg-black/20"
    : "mt-3 overflow-hidden rounded-xl border border-cyan-200/10 bg-cyan-200/[0.035]";

  return (
    <div className={className}>
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.08] px-3 py-2">
        <span className="flex min-w-0 items-center gap-2 font-mono text-[9px] uppercase tracking-[0.13em] text-cyan-100/60"><Icon kind={kind} />{label}</span>
        <a href={url} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center gap-1 text-[10px] text-white/45 transition hover:text-cyan-100">Open <ArrowUpRight size={12} /></a>
      </div>
      {kind === "image" ? <div className={compact ? "aspect-[2.3/1] bg-black/20" : "aspect-[2.2/1] bg-black/20"}><img src={url} alt="Preview asset" className="h-full w-full object-cover" loading="lazy" /></div> : null}
      {kind === "audio" ? <div className="p-3"><audio className="w-full" controls preload="metadata" src={url}>Audio preview unavailable.</audio></div> : null}
      {kind === "video" ? <video className="aspect-video w-full bg-black object-cover" controls preload="metadata" src={url}>Video preview unavailable.</video> : null}
      {kind === "pdf" ? <div className="flex items-center gap-3 px-3 py-4 text-xs text-white/55"><FileText size={20} className="text-amber-200/70" /><span className="min-w-0 truncate">PDF / dokumen siap dibuka di tab baru.</span></div> : null}
      {kind === "link" ? <div className="flex items-center gap-3 px-3 py-4 text-xs text-white/55"><Link2 size={18} className="text-violet-200/70" /><span className="min-w-0 truncate">{url}</span></div> : null}
    </div>
  );
}

export function StudioLinkListPreview({ value, label = "Links preview" }: { value?: string; label?: string }) {
  const lines = (value || "").split("\n").map(line => line.trim()).filter(Boolean);
  if (!lines.length) return null;
  return (
    <div className="mt-2 space-y-2">
      <p className="font-mono text-[9px] uppercase tracking-[0.13em] text-white/35">{label}</p>
      {lines.map((line, index) => {
        const [name, ...parts] = line.split("|").map(item => item.trim());
        const href = parts.join(" | ");
        if (!href) return <div key={`${line}-${index}`} className="rounded-lg border border-amber-200/15 bg-amber-200/[0.05] px-3 py-2 text-[10px] text-amber-100/75"><TriangleAlert size={13} className="mr-2 inline" />Format: Nama | URL</div>;
        return <StudioLinkPreview key={`${href}-${index}`} value={href} label={name || `Link ${index + 1}`} />;
      })}
    </div>
  );
}

export function StudioLinkPreview({ value, label = "Link preview" }: { value?: string; label?: string }) {
  const url = normalizeValue(value);
  if (!url) return null;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return <div className="mt-2 flex items-center gap-2 rounded-lg border border-amber-200/15 bg-amber-200/[0.05] px-3 py-2 text-[10px] text-amber-100/75"><TriangleAlert size={13} />Masukkan URL lengkap dengan http:// atau https://.</div>;
  }
  if (!/^https?:$/.test(parsed.protocol)) return <div className="mt-2 flex items-center gap-2 rounded-lg border border-amber-200/15 bg-amber-200/[0.05] px-3 py-2 text-[10px] text-amber-100/75"><TriangleAlert size={13} />Link hanya boleh memakai http:// atau https://.</div>;
  const host = parsed.hostname.replace(/^www\./, "");
  const platform = host.includes("youtube") || host.includes("youtu.be") ? "YouTube" : host.includes("soundcloud") ? "SoundCloud" : host.includes("spotify") ? "Spotify" : host.includes("instagram") ? "Instagram" : host.includes("facebook") ? "Facebook" : host.includes("x.com") || host.includes("twitter") ? "X / Twitter" : host.includes("music.apple") ? "Apple Music" : host.includes("deezer") ? "Deezer" : host.includes("google") && host.includes("maps") ? "Google Maps" : "External link";
  return <div className="mt-2 flex items-center justify-between gap-3 rounded-lg border border-emerald-200/15 bg-emerald-200/[0.045] px-3 py-2"><span className="flex min-w-0 items-center gap-2 text-[10px] text-emerald-100/75"><Link2 size={13} /><strong>{platform}</strong><span className="truncate text-white/35">{host}</span></span><a href={url} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center gap-1 text-[10px] text-emerald-100/75 hover:text-emerald-100">Preview <ArrowUpRight size={12} /></a></div>;
}
