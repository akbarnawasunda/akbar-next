import { Image as ImageIcon, Pencil, Plus, Video } from "lucide-react";
import { Button } from "@/components/ui/button";

type VisualDocument = {
  documentType: "visual";
  id: number;
  slug: string;
  payload: Record<string, unknown>;
  sortOrder: number;
  isPublished: boolean;
};

type VisualFallback = {
  id: string;
  title: string;
  label: string;
  href: string;
  image: string;
};

type StudioVisualArchiveProps = {
  documents: VisualDocument[];
  fallbacks: VisualFallback[];
  onAdd: () => void;
  onEdit: (document: VisualDocument) => void;
  onImportFallback: (visual: VisualFallback) => void;
};

function text(payload: Record<string, unknown>, key: string) {
  return typeof payload[key] === "string" ? String(payload[key]).trim() : "";
}

function thumbnailFor(document: VisualDocument) {
  const imageUrl = text(document.payload, "imageUrl");
  if (imageUrl) return imageUrl;
  const youtubeId = text(document.payload, "youtubeId");
  return youtubeId ? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg` : "";
}

export default function StudioVisualArchive({ documents, fallbacks, onAdd, onEdit, onImportFallback }: StudioVisualArchiveProps) {
  const ordered = [...documents].sort((a, b) => a.sortOrder - b.sortOrder);
  const managedTitles = new Set(ordered.map(document => text(document.payload, "title").toLowerCase()));
  const visibleFallbacks = fallbacks.filter(visual => !managedTitles.has(visual.title.toLowerCase()));
  return (
    <section id="studio-visual-archive" className="overflow-hidden rounded-2xl border border-amber-200/15 bg-amber-200/[0.035] shadow-2xl shadow-black/20">
      <div className="flex flex-col gap-4 border-b border-white/[0.08] bg-white/[0.025] px-5 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-7">
        <div>
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-amber-200/75"><ImageIcon size={13} />03 // Visual archive</div>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-white">Foto & video archive</h2>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-white/40">Kartu di bawah mengikuti isi Visuals publik. Fallback lama tetap terlihat supaya lu tahu konten yang sedang tampil; impor kartu itu untuk mulai mengelolanya dari CMS.</p>
        </div>
        <Button type="button" onClick={onAdd} className="h-10 shrink-0 rounded-xl bg-amber-200 text-xs font-semibold text-[#16120b] hover:bg-amber-100"><Plus size={14} />Tambah visual kosong</Button>
      </div>
      <div className="p-5 sm:p-7">
        {ordered.length || visibleFallbacks.length ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {ordered.map(document => {
            const title = text(document.payload, "title") || document.slug;
            const label = text(document.payload, "label") || "VISUAL ARCHIVE";
            const image = thumbnailFor(document);
            const youtubeId = text(document.payload, "youtubeId");
            return <article key={`managed-${document.id}`} className="overflow-hidden rounded-xl border border-cyan-200/15 bg-black/[0.16] transition hover:border-cyan-200/35 hover:bg-white/[0.04]">
              <button type="button" onClick={() => onEdit(document)} className="group block w-full text-left focus:outline-none focus:ring-2 focus:ring-cyan-200/50">
                <div className="relative flex aspect-video items-center justify-center bg-[#0b0c10] p-2">{image ? <img src={image} alt={title} className="h-full w-full object-contain transition duration-200 group-hover:scale-[1.02]" loading="lazy" /> : <div className="grid h-full place-items-center text-white/25"><Video size={26} /></div>}<span className="absolute left-3 top-3 rounded-full bg-emerald-200/90 px-2 py-1 font-mono text-[8px] uppercase tracking-[0.12em] text-[#071014]">{document.isPublished ? "Published" : "Draft"}</span></div>
                <div className="p-4"><p className="font-mono text-[9px] uppercase tracking-[0.16em] text-cyan-100/60">{label}</p><h3 className="mt-2 truncate text-sm font-semibold text-white/90">{title}</h3><p className="mt-2 truncate text-[10px] text-white/35">{youtubeId ? `YouTube · ${youtubeId}` : text(document.payload, "url") || "Belum ada URL visual"}</p><p className="mt-2 text-[10px] text-cyan-100/45">Tampil di: Visuals + Homepage</p></div>
              </button>
              <div className="flex items-center justify-between border-t border-white/[0.08] px-4 py-3"><span className="font-mono text-[9px] text-white/30">CMS · urutan {document.sortOrder}</span><Button type="button" variant="ghost" size="sm" onClick={() => onEdit(document)} className="h-8 rounded-lg px-2 text-xs text-cyan-100/70 hover:bg-cyan-200/10 hover:text-cyan-100"><Pencil size={13} />Edit visual</Button></div>
            </article>;
          })}
          {visibleFallbacks.map(visual => <article key={`fallback-${visual.id}`} className="overflow-hidden rounded-xl border border-white/[0.09] bg-black/[0.12] transition hover:border-amber-200/35 hover:bg-white/[0.04]">
            <div className="relative flex aspect-video items-center justify-center bg-[#0b0c10] p-2"><img src={visual.image} alt={visual.title} className="h-full w-full object-contain" loading="lazy" /><span className="absolute left-3 top-3 rounded-full bg-white/80 px-2 py-1 font-mono text-[8px] uppercase tracking-[0.12em] text-[#071014]">Fallback publik</span></div>
            <div className="p-4"><p className="font-mono text-[9px] uppercase tracking-[0.16em] text-amber-100/60">{visual.label}</p><h3 className="mt-2 truncate text-sm font-semibold text-white/90">{visual.title}</h3><p className="mt-2 truncate text-[10px] text-white/35">{visual.href}</p><p className="mt-2 text-[10px] text-amber-100/50">Saat ini dari source fallback, belum menjadi dokumen CMS.</p></div>
            <div className="border-t border-white/[0.08] px-4 py-3"><Button type="button" variant="ghost" size="sm" onClick={() => onImportFallback(visual)} className="h-8 rounded-lg px-2 text-xs text-amber-100/80 hover:bg-amber-200/10 hover:text-amber-100"><Pencil size={13} />Impor & edit</Button></div>
          </article>)}
        </div> : <div className="rounded-xl border border-dashed border-amber-200/20 bg-amber-200/[0.025] p-8 text-center"><ImageIcon className="mx-auto h-8 w-8 text-amber-200/45" /><p className="mt-3 text-sm text-white/60">Belum ada item Visual Archive di CMS.</p><p className="mx-auto mt-1 max-w-md text-xs leading-5 text-white/35">Tambah visual pertama untuk membuat kartu archive dengan thumbnail yang benar-benar terlihat di halaman Visuals.</p><Button type="button" onClick={onAdd} className="mt-5 h-10 rounded-xl bg-amber-200 text-xs font-semibold text-[#16120b] hover:bg-amber-100"><Plus size={14} />Tambah visual pertama</Button></div>}
      </div>
    </section>
  );
}
