import { CheckCircle2, CircleDashed, ListChecks } from "lucide-react";

type PublishChecklistProps = {
  documentType: string;
  payload: Record<string, unknown>;
  isPublished: boolean;
};

function text(payload: Record<string, unknown>, key: string) {
  return typeof payload[key] === "string" ? String(payload[key]).trim() : "";
}

function destinationFor(documentType: string) {
  if (documentType === "hero") return "/";
  if (documentType === "profile") return "/about + /universe";
  if (documentType === "journey") return "Homepage Artist Journey + /about";
  if (documentType === "pressKit") return "/epk";
  if (documentType === "siteSettings") return "Homepage + metadata";
  if (documentType === "legal") return "/privacy";
  if (documentType === "release") return "/music + release detail";
  if (documentType === "visual") return "/visuals";
  if (documentType === "portrait") return "/visuals#portraits";
  if (documentType === "photoStory") return "Homepage Photo Story + /visuals";
  if (documentType === "event" || documentType === "live") return "/live";
  if (documentType === "game") return "/game/jedag-run + homepage teaser";
  return "Public site";
}

export function StudioPublishChecklist({
  documentType,
  payload,
  isPublished,
}: PublishChecklistProps) {
  const titleReady = Boolean(
    text(payload, "title") ||
    text(payload, "heroTitle") ||
    text(payload, "siteTitle")
  );
  const mediaReady =
    documentType === "siteSettings" ||
    documentType === "live" ||
    documentType === "event" ||
    documentType === "game" ||
    documentType === "journey"
      ? true
      : Boolean(
          text(payload, "imageUrl") ||
          text(payload, "artworkUrl") ||
          text(payload, "portraitImage") ||
          text(payload, "heroImage") ||
          text(payload, "socialPreviewUrl")
        );
  const routeReady = Boolean(destinationFor(documentType));
  const checks = [
    { label: "Judul / identitas terisi", ready: titleReady },
    {
      label:
        documentType === "game"
          ? "Audio opsional / fallback siap"
          : documentType === "journey"
            ? "Visual journey opsional"
            : "Media utama tersedia",
      ready: mediaReady,
    },
    { label: "Halaman tujuan jelas", ready: routeReady },
  ];
  const passed = checks.filter(check => check.ready).length;
  return (
    <details className="rounded-xl border border-white/[0.08] bg-black/[0.14]">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-xs text-white/65 [&::-webkit-details-marker]:hidden">
        <span className="inline-flex items-center gap-2">
          <ListChecks size={14} className="text-cyan-200/70" /> Publish
          checklist
        </span>
        <span
          className={`rounded-full px-2 py-1 font-mono text-[9px] uppercase tracking-[0.1em] ${passed === checks.length ? "bg-emerald-200/10 text-emerald-100/75" : "bg-amber-200/10 text-amber-100/75"}`}
        >
          {passed}/{checks.length} siap
        </span>
      </summary>
      <div className="space-y-2 border-t border-white/[0.07] px-4 py-3">
        {checks.map(check => (
          <div
            key={check.label}
            className="flex items-center gap-2 text-[11px] text-white/50"
          >
            {check.ready ? (
              <CheckCircle2 size={13} className="text-emerald-200/75" />
            ) : (
              <CircleDashed size={13} className="text-amber-200/75" />
            )}
            <span>{check.label}</span>
          </div>
        ))}
        <div className="mt-3 border-t border-white/[0.07] pt-3 text-[10px] leading-5 text-white/40">
          <span className="text-cyan-100/65">Tujuan:</span>{" "}
          {destinationFor(documentType)}.{" "}
          {isPublished
            ? "Perubahan akan terlihat setelah disimpan dan dipublikasikan."
            : "Dokumen ini akan tetap menjadi draft sampai lu mengaktifkan tampil ke publik."}
        </div>
      </div>
    </details>
  );
}
