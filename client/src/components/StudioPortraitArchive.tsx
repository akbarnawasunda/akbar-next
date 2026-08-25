import { Image as ImageIcon, Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CmsPortraitStudy } from "@/content/publicContent";

type PortraitDocument = {
  documentType: "portrait";
  id: number;
  slug: string;
  payload: Record<string, unknown>;
  sortOrder: number;
  isPublished: boolean;
};

type StudioPortraitArchiveProps = {
  documents: PortraitDocument[];
  fallbacks: CmsPortraitStudy[];
  onAdd: () => void;
  onEdit: (document: PortraitDocument) => void;
  onImportFallback: (study: CmsPortraitStudy) => void;
};

function text(payload: Record<string, unknown>, key: string) {
  return typeof payload[key] === "string" ? String(payload[key]).trim() : "";
}

export default function StudioPortraitArchive({
  documents,
  fallbacks,
  onAdd,
  onEdit,
  onImportFallback,
}: StudioPortraitArchiveProps) {
  const ordered = [...documents].sort((a, b) => a.sortOrder - b.sortOrder);
  const managedTitles = new Set(ordered.map(document => text(document.payload, "title").toLowerCase()));
  const visibleFallbacks = fallbacks.filter(study => !managedTitles.has(study.title.toLowerCase()));
  return (
    <section id="studio-portrait-archive" className="overflow-hidden rounded-2xl border border-violet-200/15 bg-violet-200/[0.035] shadow-2xl shadow-black/20">
      <div className="flex flex-col gap-4 border-b border-white/[0.08] bg-white/[0.025] px-5 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-7">
        <div>
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-violet-200/75"><ImageIcon size={13} />04 // Portrait studies</div>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-white">Studi foto & portrait</h2>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-white/40">Foto yang tampil di bagian Visual Studies. Fallback lama tetap terlihat sampai lu impor sebagai dokumen CMS.</p>
        </div>
        <Button type="button" onClick={onAdd} className="h-10 shrink-0 rounded-xl bg-violet-200 text-xs font-semibold text-[#111018] hover:bg-violet-100"><Plus size={14} />Tambah portrait</Button>
      </div>
      <div className="p-5 sm:p-7">
        {ordered.length || visibleFallbacks.length ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {ordered.map(document => {
            const title = text(document.payload, "title") || document.slug;
            const label = text(document.payload, "label") || "STUDI POTRET";
            const image = text(document.payload, "imageUrl");
            return <article key={`managed-${document.id}`} className="overflow-hidden rounded-xl border border-violet-200/15 bg-black/[0.16] transition hover:border-violet-200/35 hover:bg-white/[0.04]">
              <button type="button" onClick={() => onEdit(document)} className="group block w-full text-left focus:outline-none focus:ring-2 focus:ring-violet-200/50">
                <div className="relative flex aspect-[4/5] items-center justify-center bg-[#0b0c10] p-2">{image ? <img src={image} alt={title} className="h-full w-full object-contain transition duration-200 group-hover:scale-[1.02]" loading="lazy" /> : <div className="grid h-full place-items-center text-white/25"><ImageIcon size={26} /></div>}<span className={`absolute left-3 top-3 rounded-full px-2 py-1 font-mono text-[8px] uppercase tracking-[0.12em] ${document.isPublished ? "bg-emerald-200/90 text-[#071014]" : "bg-amber-200/90 text-[#171108]"}`}>{document.isPublished ? "Published" : "Draft"}</span></div>
                <div className="p-4"><p className="font-mono text-[9px] uppercase tracking-[0.16em] text-violet-100/60">{label}</p><h3 className="mt-2 truncate text-sm font-semibold text-white/90">{title}</h3><p className="mt-2 truncate text-[10px] text-white/35">{image || "Belum ada foto"}</p><p className="mt-2 text-[10px] text-violet-100/45">Tampil di: Visuals → Studi Foto</p></div>
              </button>
              <div className="flex items-center justify-between border-t border-white/[0.08] px-4 py-3"><span className="font-mono text-[9px] text-white/30">CMS · urutan {document.sortOrder}</span><Button type="button" variant="ghost" size="sm" onClick={() => onEdit(document)} className="h-8 rounded-lg px-2 text-xs text-violet-100/75 hover:bg-violet-200/10 hover:text-violet-100"><Pencil size={13} />Edit portrait</Button></div>
            </article>;
          })}
          {visibleFallbacks.map(study => <article key={`fallback-${study._id}`} className="overflow-hidden rounded-xl border border-white/[0.09] bg-black/[0.12] transition hover:border-violet-200/35 hover:bg-white/[0.04]">
            <div className="relative flex aspect-[4/5] items-center justify-center bg-[#0b0c10] p-2"><img src={study.imageUrl} alt={study.altId || study.title} className="h-full w-full object-contain" loading="lazy" /><span className="absolute left-3 top-3 rounded-full bg-white/80 px-2 py-1 font-mono text-[8px] uppercase tracking-[0.12em] text-[#071014]">Fallback publik</span></div>
            <div className="p-4"><p className="font-mono text-[9px] uppercase tracking-[0.16em] text-violet-100/60">{study.label || "STUDI POTRET"}</p><h3 className="mt-2 truncate text-sm font-semibold text-white/90">{study.title}</h3><p className="mt-2 truncate text-[10px] text-white/35">{study.imageUrl}</p><p className="mt-2 text-[10px] text-violet-100/50">Saat ini dari source fallback, belum menjadi dokumen CMS.</p></div>
            <div className="border-t border-white/[0.08] px-4 py-3"><Button type="button" variant="ghost" size="sm" onClick={() => onImportFallback(study)} className="h-8 rounded-lg px-2 text-xs text-violet-100/80 hover:bg-violet-200/10 hover:text-violet-100"><Pencil size={13} />Impor & edit foto</Button></div>
          </article>)}
        </div> : <div className="rounded-xl border border-dashed border-violet-200/20 bg-violet-200/[0.025] p-8 text-center"><ImageIcon className="mx-auto h-8 w-8 text-violet-200/45" /><p className="mt-3 text-sm text-white/60">Belum ada portrait study di CMS.</p><p className="mx-auto mt-1 max-w-md text-xs leading-5 text-white/35">Impor salah satu foto fallback atau tambah portrait baru untuk mengelola bagian ini.</p><Button type="button" onClick={onAdd} className="mt-5 h-10 rounded-xl bg-violet-200 text-xs font-semibold text-[#111018] hover:bg-violet-100"><Plus size={14} />Tambah portrait pertama</Button></div>}
      </div>
    </section>
  );
}
