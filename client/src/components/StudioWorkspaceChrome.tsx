import { ArrowUpRight, CheckCircle2, CircleDashed, ListChecks, PanelRight } from "lucide-react";

type WorkspaceNavProps = {
  documentCount: number;
  portraitCount: number;
  visualCount: number;
};

const navItems = [
  { id: "studio-quick-actions", label: "Quick actions", short: "Start" },
  { id: "studio-visual-archive", label: "Visual archive", short: "Videos" },
  { id: "studio-portrait-archive", label: "Portrait studies", short: "Portraits" },
  { id: "studio-compose", label: "Compose", short: "Edit" },
  { id: "studio-document-library", label: "Document library", short: "Library" },
];

export function StudioWorkspaceNav({ documentCount, portraitCount, visualCount }: WorkspaceNavProps) {
  return (
    <nav aria-label="Studio workspace" className="sticky top-2 z-30 overflow-x-auto rounded-2xl border border-white/[0.09] bg-[#0b1117]/90 p-2 shadow-xl shadow-black/20 backdrop-blur-xl">
      <div className="flex min-w-max items-center gap-1.5">
        <div className="mr-1 flex items-center gap-2 px-3 py-2 text-white/45">
          <PanelRight size={14} className="text-cyan-200/70" />
          <span className="font-mono text-[9px] uppercase tracking-[0.16em]">Workspace</span>
        </div>
        {navItems.map(item => {
          const count = item.id === "studio-document-library" ? documentCount : item.id === "studio-portrait-archive" ? portraitCount : item.id === "studio-visual-archive" ? visualCount : null;
          return (
            <a key={item.id} href={`#${item.id}`} className="group inline-flex items-center gap-2 rounded-xl border border-transparent px-3 py-2 text-xs text-white/50 transition hover:border-cyan-200/20 hover:bg-cyan-200/[0.07] hover:text-cyan-100">
              <span>{item.short}</span>
              {count !== null ? <span className="rounded-full bg-white/[0.07] px-1.5 py-0.5 font-mono text-[9px] text-white/35 group-hover:text-cyan-100/70">{count}</span> : null}
            </a>
          );
        })}
        <a href="/" target="_blank" rel="noreferrer" className="ml-auto inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-white/45 transition hover:border-cyan-200/25 hover:text-cyan-100">Live site <ArrowUpRight size={12} /></a>
      </div>
    </nav>
  );
}

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
  if (documentType === "pressKit") return "/epk";
  if (documentType === "siteSettings") return "Homepage + metadata";
  if (documentType === "legal") return "/privacy";
  if (documentType === "release") return "/music + release detail";
  if (documentType === "visual") return "/visuals";
  if (documentType === "portrait") return "/visuals/portraits";
  if (documentType === "event" || documentType === "live") return "/live";
  if (documentType === "game") return "/game/jedag-run + homepage teaser";
  return "Public site";
}

export function StudioPublishChecklist({ documentType, payload, isPublished }: PublishChecklistProps) {
  const titleReady = Boolean(text(payload, "title") || text(payload, "heroTitle") || text(payload, "siteTitle"));
  const mediaReady = documentType === "siteSettings" || documentType === "live" || documentType === "event"
    ? true
    : documentType === "game"
      ? true
      : Boolean(text(payload, "imageUrl") || text(payload, "artworkUrl") || text(payload, "portraitImage") || text(payload, "heroImage") || text(payload, "socialPreviewUrl"));
  const routeReady = Boolean(destinationFor(documentType));
  const checks = [
    { label: "Judul / identitas terisi", ready: titleReady },
    { label: documentType === "game" ? "Audio opsional / fallback siap" : "Media utama tersedia", ready: mediaReady },
    { label: "Halaman tujuan jelas", ready: routeReady },
  ];
  const passed = checks.filter(check => check.ready).length;
  return (
    <details className="rounded-xl border border-white/[0.08] bg-black/[0.14]">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-xs text-white/65 [&::-webkit-details-marker]:hidden">
        <span className="inline-flex items-center gap-2"><ListChecks size={14} className="text-cyan-200/70" /> Publish checklist</span>
        <span className={`rounded-full px-2 py-1 font-mono text-[9px] uppercase tracking-[0.1em] ${passed === checks.length ? "bg-emerald-200/10 text-emerald-100/75" : "bg-amber-200/10 text-amber-100/75"}`}>{passed}/{checks.length} siap</span>
      </summary>
      <div className="space-y-2 border-t border-white/[0.07] px-4 py-3">
        {checks.map(check => <div key={check.label} className="flex items-center gap-2 text-[11px] text-white/50">{check.ready ? <CheckCircle2 size={13} className="text-emerald-200/75" /> : <CircleDashed size={13} className="text-amber-200/75" />}<span>{check.label}</span></div>)}
        <div className="mt-3 border-t border-white/[0.07] pt-3 text-[10px] leading-5 text-white/40"><span className="text-cyan-100/65">Tujuan:</span> {destinationFor(documentType)}. {isPublished ? "Perubahan akan terlihat setelah disimpan dan dipublikasikan." : "Dokumen ini akan tetap menjadi draft sampai lu mengaktifkan tampil ke publik."}</div>
      </div>
    </details>
  );
}
