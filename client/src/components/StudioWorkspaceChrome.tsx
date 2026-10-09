import { CheckCircle2, CircleDashed, ListChecks } from "lucide-react";

function text(payload: Record<string, unknown>, key: string) {
  return typeof payload[key] === "string" ? String(payload[key]).trim() : "";
}

function destinationFor(documentType: string) {
  if (documentType === "hero") return "/";
  if (documentType === "profile") return "/about + /universe";
  if (documentType === "journey") return "Homepage Journey + /about";
  if (documentType === "pressKit") return "/epk";
  if (documentType === "siteSettings") return "Homepage + metadata";
  if (documentType === "legal") return "/privacy";
  if (documentType === "release") return "/music + detail rilisan";
  if (documentType === "visual") return "/visuals";
  if (documentType === "portrait") return "/visuals#portraits";
  if (documentType === "photoStory") return "Homepage + /visuals";
  if (documentType === "event" || documentType === "live") return "/live";
  if (documentType === "game") return "/game/jedag-run";
  return "Public site";
}

export function StudioPublishChecklist({
  documentType,
  payload,
  isPublished,
}: {
  documentType: string;
  payload: Record<string, unknown>;
  isPublished: boolean;
}) {
  const titleReady = Boolean(text(payload, "title") || text(payload, "heroTitle") || text(payload, "siteTitle"));
  const mediaReady =
    ["siteSettings", "live", "event", "game", "journey"].includes(documentType) ||
    Boolean(text(payload, "imageUrl") || text(payload, "artworkUrl") || text(payload, "portraitImage") || text(payload, "heroImage"));
  const checks = [
    { label: "Judul / identitas terisi", ready: titleReady },
    { label: "Media utama ada (atau opsional)", ready: mediaReady },
    { label: "Tujuan halaman jelas", ready: true },
  ];
  const passed = checks.filter(c => c.ready).length;

  return (
    <details className="rounded-xl border border-zinc-800 bg-zinc-900/50">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-[13px] text-zinc-300 [&::-webkit-details-marker]:hidden">
        <span className="inline-flex items-center gap-2"><ListChecks size={14} className="text-zinc-500" /> Checklist sebelum publish</span>
        <span className={`rounded-full px-2 py-0.5 font-mono text-[10px] ${passed === checks.length ? "bg-emerald-950/50 text-emerald-300" : "bg-amber-950/50 text-amber-300"}`}>{passed}/{checks.length}</span>
      </summary>
      <div className="space-y-2 border-t border-zinc-800 px-4 py-3">
        {checks.map(check => (
          <div key={check.label} className="flex items-center gap-2 text-[12px] text-zinc-400">
            {check.ready ? <CheckCircle2 size={13} className="text-emerald-400" /> : <CircleDashed size={13} className="text-amber-300" />}
            <span>{check.label}</span>
          </div>
        ))}
        <div className="mt-3 border-t border-zinc-800 pt-3 text-[11px] leading-5 text-zinc-500">
          Tujuan: <span className="text-zinc-300">{destinationFor(documentType)}</span>. {isPublished ? "Akan langsung terlihat setelah disimpan." : "Masih draft — belum terlihat publik."}
        </div>
      </div>
    </details>
  );
}
