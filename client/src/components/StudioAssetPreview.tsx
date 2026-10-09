import {
  ArrowUpRight,
  FileAudio,
  FileText,
  FileVideo,
  Image as ImageIcon,
  Link2,
  TriangleAlert,
} from "lucide-react";

type PreviewKind = "image" | "audio" | "video" | "pdf" | "link";

type Props = {
  value?: string;
  label?: string;
  mimeType?: string;
  compact?: boolean;
};

function normalize(v?: string) {
  return v?.trim() || "";
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
  if (kind === "image") return <ImageIcon size={13} />;
  if (kind === "audio") return <FileAudio size={13} />;
  if (kind === "video") return <FileVideo size={13} />;
  if (kind === "pdf") return <FileText size={13} />;
  return <Link2 size={13} />;
}

export function StudioAssetPreview({ value, label = "Preview", mimeType, compact = false }: Props) {
  const url = normalize(value);
  if (!url) return null;
  const kind = kindFor(url, mimeType);

  return (
    <div className={compact ? "mt-2 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950" : "mt-3 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950"}>
      <div className="flex items-center justify-between gap-3 border-b border-zinc-800 px-3 py-2">
        <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-zinc-500"><Icon kind={kind} />{label}</span>
        <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[10px] text-zinc-400 hover:text-white">Buka <ArrowUpRight size={11} /></a>
      </div>
      {kind === "image" ? <div className={compact ? "flex min-h-32 items-center justify-center p-2" : "flex min-h-40 items-center justify-center p-3"}><img src={url} alt={label} className="max-h-72 w-full object-contain" loading="lazy" /></div> : null}
      {kind === "audio" ? <div className="p-3"><audio className="w-full" controls preload="metadata" src={url} /></div> : null}
      {kind === "video" ? <video className="aspect-video w-full bg-black object-cover" controls preload="metadata" src={url} /> : null}
      {kind === "pdf" ? <div className="flex items-center gap-2 px-3 py-3 text-[12px] text-zinc-400"><FileText size={16} /> PDF siap dibuka</div> : null}
      {kind === "link" ? <div className="flex items-center gap-2 px-3 py-3 text-[11px] text-zinc-500"><Link2 size={14} /><span className="truncate">{url}</span></div> : null}
    </div>
  );
}

export function StudioLinkListPreview({ value, label = "Links" }: { value?: string; label?: string }) {
  const lines = (value || "").split("\n").map(l => l.trim()).filter(Boolean);
  if (!lines.length) return null;
  return (
    <div className="mt-2 space-y-2">
      <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">{label}</p>
      {lines.map((line, i) => {
        const [name, ...parts] = line.split("|").map(x => x.trim());
        const href = parts.join(" | ");
        if (!href) return <div key={`${line}-${i}`} className="rounded-lg border border-amber-900/30 bg-amber-950/20 px-3 py-2 text-[11px] text-amber-200/70"><TriangleAlert size={12} className="mr-1 inline" /> Format: Nama | URL</div>;
        return <StudioLinkPreview key={`${href}-${i}`} value={href} label={name || `Link ${i + 1}`} />;
      })}
    </div>
  );
}

export function StudioLinkPreview({ value, label = "Link" }: { value?: string; label?: string }) {
  const url = normalize(value);
  if (!url) return null;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return <div className="mt-2 rounded-lg border border-amber-900/30 bg-amber-950/20 px-3 py-2 text-[11px] text-amber-200/70">URL harus lengkap dengan https://</div>;
  }
  if (!/^https?:$/.test(parsed.protocol)) return <div className="mt-2 rounded-lg border border-amber-900/30 bg-amber-950/20 px-3 py-2 text-[11px] text-amber-200/70">Hanya http/https yang diizinkan</div>;
  const host = parsed.hostname.replace(/^www\./, "");
  return (
    <div className="mt-2 flex items-center justify-between gap-3 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2">
      <span className="flex min-w-0 items-center gap-2 text-[11px] text-zinc-400"><Link2 size={12} /><strong className="text-zinc-200">{label}</strong><span className="truncate text-zinc-500">{host}</span></span>
      <a href={url} target="_blank" rel="noreferrer" className="shrink-0 text-[11px] text-zinc-300 hover:text-white">Buka <ArrowUpRight size={11} className="inline" /></a>
    </div>
  );
}
