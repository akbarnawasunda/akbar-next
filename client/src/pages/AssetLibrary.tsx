/**
 * ASSET LIBRARY v2 — lebih bersih, fokus ke cari & pakai.
 */
import { useMemo, useRef, useState } from "react";
import {
  Archive,
  ArrowUpRight,
  Check,
  Copy,
  FileAudio,
  FileText,
  FileVideo,
  FolderOpen,
  Image as ImageIcon,
  Search,
  UploadCloud,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { StudioAssetPreview } from "@/components/StudioAssetPreview";
import {
  EmptyState,
  Eyebrow,
  Pill,
  Stat,
  StatGrid,
  StudioButton,
  StudioHero,
  StudioLink,
} from "@/studio/StudioKit";

const MAX_BYTES = 10 * 1024 * 1024;
type MediaFilter = "all" | "image" | "audio" | "video" | "doc";
const filters: { id: MediaFilter; label: string }[] = [
  { id: "all", label: "Semua" },
  { id: "image", label: "Gambar" },
  { id: "audio", label: "Audio" },
  { id: "video", label: "Video" },
  { id: "doc", label: "Dokumen" },
];

function readAsBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.onerror = () => reject(reader.error ?? new Error("Unable to read file"));
    reader.readAsDataURL(file);
  });
}

function AssetTypeIcon({ mimeType }: { mimeType: string }) {
  if (mimeType.startsWith("image/")) return <ImageIcon className="h-5 w-5" />;
  if (mimeType.startsWith("audio/")) return <FileAudio className="h-5 w-5" />;
  if (mimeType.startsWith("video/")) return <FileVideo className="h-5 w-5" />;
  return <FileText className="h-5 w-5" />;
}

function matchesFilter(mimeType: string, filter: MediaFilter) {
  if (filter === "all") return true;
  if (filter === "doc") return !/^(image|audio|video)\//.test(mimeType);
  return mimeType.startsWith(`${filter}/`);
}

export default function AssetLibrary() {
  const { user, isAuthenticated, loading } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<MediaFilter>("all");
  const [dragging, setDragging] = useState(false);
  const assets = trpc.assets.list.useQuery(undefined, { enabled: isAuthenticated });
  const utils = trpc.useUtils();
  const upload = trpc.assets.upload.useMutation({
    onSuccess: async () => {
      setMessage("Asset tersimpan.");
      await utils.assets.list.invalidate();
    },
    onError: error => setMessage(error.message),
  });

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return (assets.data ?? []).filter(asset => {
      if (!matchesFilter(asset.mimeType, filter)) return false;
      if (!needle) return true;
      return `${asset.fileName} ${asset.url}`.toLowerCase().includes(needle);
    });
  }, [assets.data, filter, query]);

  async function handleFile(file?: File) {
    if (!file) return;
    if (file.size > MAX_BYTES) {
      setMessage("Max 10 MB per file.");
      return;
    }
    setMessage("Mengunggah…");
    try {
      const base64 = await readAsBase64(file);
      await upload.mutateAsync({ fileName: file.name, mimeType: file.type || "application/octet-stream", size: file.size, base64 });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload gagal");
    }
  }

  async function handleCopy(id: number, url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setMessage("URL disalin.");
      window.setTimeout(() => setCopiedId(c => (c === id ? null : c)), 1800);
    } catch {
      setMessage(`Salin manual: ${url}`);
    }
  }

  if (loading)
    return (
      <div className="studio-os grid min-h-dvh place-items-center text-sm text-white/50">
        <span className="relative z-[1] font-mono text-[11px] uppercase tracking-wider">Memeriksa akses…</span>
      </div>
    );
  if (!isAuthenticated)
    return (
      <main className="studio-os grid min-h-dvh place-items-center p-6">
        <p className="relative z-[1] text-sm text-zinc-400">Masuk dulu untuk kelola asset.</p>
      </main>
    );

  const totalBytes = assets.data?.reduce((sum, a) => sum + a.size, 0) ?? 0;
  const totalMB = (totalBytes / (1024 * 1024)).toFixed(2);

  return (
    <DashboardLayout title="Media" kicker="Studio">
      <div className="space-y-6">
        <StudioHero
          kicker="Studio / Media"
          title={<>Simpan media <em>yang rapi.</em></>}
          lead="Upload gambar, audio, video, PDF. Nanti bisa dipilih langsung dari editor konten."
          actions={
            <>
              <StudioButton variant="primary" type="button" onClick={() => inputRef.current?.click()} disabled={upload.isPending}>
                <UploadCloud size={14} /> {upload.isPending ? "Mengunggah…" : "Upload"}
              </StudioButton>
              <StudioLink href="/studio">Buka editor <ArrowUpRight size={13} /></StudioLink>
            </>
          }
          aside={<Pill tone="neutral"><FolderOpen size={11} /> {assets.data?.length ?? 0} file</Pill>}
        />

        <input ref={inputRef} className="hidden" type="file" accept="image/*,audio/*,video/*,.pdf" onChange={e => { void handleFile(e.target.files?.[0]); e.target.value = ""; }} />

        <StatGrid>
          <Stat icon={FolderOpen} kicker="Total file" value={assets.isLoading ? "—" : (assets.data?.length ?? 0)} label="Tersimpan" tone="neutral" />
          <Stat icon={Archive} kicker="Pemakaian" value={assets.isLoading ? "—" : `${totalMB} MB`} label="Total size" tone="neutral" />
          <Stat icon={UploadCloud} kicker="Batas" value="10 MB" label="Per file" tone="neutral" />
        </StatGrid>

        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); void handleFile(e.dataTransfer.files?.[0]); }}
          className={`rounded-2xl border border-dashed p-8 text-center transition ${dragging ? "border-zinc-500 bg-zinc-900" : "border-zinc-800 bg-zinc-900/30"}`}
        >
          <UploadCloud size={22} className={`mx-auto ${dragging ? "text-white" : "text-zinc-600"}`} />
          <p className="mt-3 text-[13px] text-zinc-300">Seret file ke sini, atau <button type="button" className="text-white underline underline-offset-4" onClick={() => inputRef.current?.click()}>pilih dari perangkat</button></p>
          <p className="mt-1 text-[11px] text-zinc-500">Gambar, audio, video, PDF · max 10 MB</p>
        </div>

        {message ? <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-[12px] text-zinc-300"><Check className="h-4 w-4 text-zinc-400" />{message}</div> : null}

        <section className="st-panel">
          <header className="st-panel-head">
            <div className="min-w-0">
              <Eyebrow icon={FolderOpen}>Library</Eyebrow>
              <h2 className="st-title">File tersimpan</h2>
              <p className="st-sub">{visible.length} dari {assets.data?.length ?? 0} file · owner: {user?.name || user?.email}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Cari nama…" className="h-9 w-48 rounded-lg border-zinc-800 bg-zinc-900 pl-8 text-[13px] text-white placeholder:text-zinc-600 focus:border-zinc-700" />
              </div>
              <div className="flex gap-1 rounded-lg border border-zinc-800 bg-zinc-900 p-1">
                {filters.map(f => (
                  <button key={f.id} type="button" onClick={() => setFilter(f.id)} className={`rounded-md px-2.5 py-1 text-[11px] transition ${filter === f.id ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"}`}>{f.label}</button>
                ))}
              </div>
            </div>
          </header>
          <div className="st-panel-body">
            {assets.isLoading ? (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-56 animate-pulse rounded-xl bg-zinc-900" />)}</div>
            ) : visible.length ? (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {visible.map(asset => (
                  <article key={asset.id} className="group overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 transition hover:border-zinc-700 hover:bg-zinc-900">
                    <div className="flex aspect-video items-center justify-center bg-zinc-950 p-2">
                      {asset.mimeType.startsWith("image/") ? <img src={asset.url} alt={asset.fileName} loading="lazy" className="max-h-full w-full object-contain" /> : <div className="text-zinc-600"><AssetTypeIcon mimeType={asset.mimeType} /></div>}
                    </div>
                    <div className="p-4">
                      <p className="truncate text-[13px] font-medium text-white">{asset.fileName}</p>
                      <p className="mt-1 text-[11px] text-zinc-500">{Math.ceil(asset.size / 1024)} KB · {asset.mimeType}</p>
                      <p className="mt-2 truncate rounded-lg bg-zinc-950 px-2.5 py-2 font-mono text-[10px] text-zinc-500">{asset.url}</p>
                      {!asset.mimeType.startsWith("image/") ? <StudioAssetPreview value={asset.url} label="Preview" mimeType={asset.mimeType} compact /> : null}
                      <div className="mt-3 flex items-center gap-2">
                        <a className="text-[11px] text-zinc-400 hover:text-white" href={asset.url} target="_blank" rel="noreferrer">Buka <ArrowUpRight size={11} className="inline" /></a>
                        <StudioButton type="button" className="ml-auto h-8 px-3 text-[11px]" onClick={() => void handleCopy(asset.id, asset.url)}>{copiedId === asset.id ? <Check size={12} /> : <Copy size={12} />}{copiedId === asset.id ? "Tersalin" : "Copy URL"}</StudioButton>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState icon={UploadCloud} title="Belum ada file." description="Upload gambar, audio, video, atau PDF biar bisa dipakai di editor." action={<StudioButton type="button" variant="primary" onClick={() => inputRef.current?.click()}>Upload pertama</StudioButton>} />
            )}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
