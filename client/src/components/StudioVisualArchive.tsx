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

type VisualFallback = { id: string; title: string; label: string; href: string; image: string };

type Props = {
  documents: VisualDocument[];
  fallbacks: VisualFallback[];
  onAdd: () => void;
  onEdit: (document: VisualDocument) => void;
  onImportFallback: (visual: VisualFallback) => void;
};

function text(payload: Record<string, unknown>, key: string) {
  return typeof payload[key] === "string" ? String(payload[key]).trim() : "";
}
function thumbnailFor(doc: VisualDocument) {
  const imageUrl = text(doc.payload, "imageUrl");
  if (imageUrl) return imageUrl;
  const youtubeId = text(doc.payload, "youtubeId");
  return youtubeId ? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg` : "";
}

export default function StudioVisualArchive({ documents, fallbacks, onAdd, onEdit, onImportFallback }: Props) {
  const ordered = [...documents].sort((a, b) => a.sortOrder - b.sortOrder);
  const managedTitles = new Set(ordered.map(d => text(d.payload, "title").toLowerCase()));
  const visibleFallbacks = fallbacks.filter(v => !managedTitles.has(v.title.toLowerCase()));

  return (
    <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/30">
      <div className="flex flex-col gap-3 border-b border-zinc-800 bg-zinc-900/50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-zinc-500"><ImageIcon size={12} /> Visual archive</div>
          <h2 className="mt-1 text-[15px] font-semibold text-white">Video & visual</h2>
          <p className="mt-0.5 text-[11px] text-zinc-500">Kelola kartu yang tampil di /visuals. Fallback bisa diimpor jadi dokumen CMS.</p>
        </div>
        <Button type="button" onClick={onAdd} className="h-8 rounded-lg bg-white text-[12px] font-medium text-black hover:bg-zinc-200"><Plus size={14} /> Tambah visual</Button>
      </div>
      <div className="p-5">
        {ordered.length || visibleFallbacks.length ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {ordered.map(doc => {
              const title = text(doc.payload, "title") || doc.slug;
              const label = text(doc.payload, "label") || "VISUAL";
              const image = thumbnailFor(doc);
              return (
                <article key={`managed-${doc.id}`} className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 transition hover:border-zinc-700">
                  <button type="button" onClick={() => onEdit(doc)} className="block w-full text-left">
                    <div className="relative flex aspect-video items-center justify-center bg-zinc-950 p-2">
                      {image ? <img src={image} alt={title} className="h-full w-full object-contain" loading="lazy" /> : <Video size={20} className="text-zinc-600" />}
                      <span className={`absolute left-2.5 top-2.5 rounded-full px-2 py-0.5 font-mono text-[9px] uppercase ${doc.isPublished ? "bg-emerald-950/80 text-emerald-300" : "bg-amber-950/80 text-amber-300"}`}>{doc.isPublished ? "Live" : "Draft"}</span>
                    </div>
                    <div className="p-3">
                      <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">{label}</p>
                      <h3 className="mt-1 truncate text-[13px] font-medium text-white">{title}</h3>
                      <p className="mt-1 truncate text-[11px] text-zinc-500">{text(doc.payload, "youtubeId") ? `YT · ${text(doc.payload, "youtubeId")}` : text(doc.payload, "url") || "Belum ada URL"}</p>
                    </div>
                  </button>
                  <div className="flex items-center justify-between border-t border-zinc-800 px-3 py-2">
                    <span className="font-mono text-[10px] text-zinc-600">Urutan {doc.sortOrder}</span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => onEdit(doc)} className="h-7 rounded-md px-2 text-[11px] text-zinc-400 hover:text-white hover:bg-zinc-800"><Pencil size={12} /> Edit</Button>
                  </div>
                </article>
              );
            })}
            {visibleFallbacks.map(v => (
              <article key={`fallback-${v.id}`} className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50">
                <div className="relative flex aspect-video items-center justify-center bg-zinc-950 p-2">
                  <img src={v.image} alt={v.title} className="h-full w-full object-contain" loading="lazy" />
                  <span className="absolute left-2.5 top-2.5 rounded-full bg-zinc-800 px-2 py-0.5 font-mono text-[9px] text-zinc-400">Fallback</span>
                </div>
                <div className="p-3">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">{v.label}</p>
                  <h3 className="mt-1 truncate text-[13px] font-medium text-white">{v.title}</h3>
                  <p className="mt-1 truncate text-[11px] text-zinc-500">{v.href}</p>
                </div>
                <div className="border-t border-zinc-800 px-3 py-2">
                  <Button type="button" variant="ghost" size="sm" onClick={() => onImportFallback(v)} className="h-7 rounded-md px-2 text-[11px] text-zinc-400 hover:text-white hover:bg-zinc-800"><Pencil size={12} /> Impor</Button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-zinc-800 p-8 text-center">
            <ImageIcon className="mx-auto h-6 w-6 text-zinc-600" />
            <p className="mt-3 text-[13px] text-zinc-300">Belum ada visual di CMS.</p>
            <p className="mt-1 text-[11px] text-zinc-500">Tambah pertama untuk kelola /visuals.</p>
            <Button type="button" onClick={onAdd} className="mt-4 h-8 rounded-lg bg-white text-[12px] text-black hover:bg-zinc-200"><Plus size={14} /> Tambah</Button>
          </div>
        )}
      </div>
    </section>
  );
}
