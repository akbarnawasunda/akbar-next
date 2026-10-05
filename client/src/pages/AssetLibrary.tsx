/**
 * ASSET LIBRARY (/assets) — media terkelola untuk Content Studio.
 * Drag & drop upload, pencarian, filter tipe, dan salin URL sekali klik.
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
  HardDrive,
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
    reader.onerror = () =>
      reject(reader.error ?? new Error("Unable to read file"));
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
  const assets = trpc.assets.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const documents = trpc.content.documentsAll.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const utils = trpc.useUtils();
  const upload = trpc.assets.upload.useMutation({
    onSuccess: async () => {
      setMessage("Asset tersimpan di managed File Storage.");
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
      setMessage("Ukuran file maksimal 10 MB.");
      return;
    }
    setMessage("Mengunggah…");
    try {
      const base64 = await readAsBase64(file);
      await upload.mutateAsync({
        fileName: file.name,
        mimeType: file.type || "application/octet-stream",
        size: file.size,
        base64,
      });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload gagal");
    }
  }

  async function handleCopy(id: number, url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setMessage("URL asset disalin ke clipboard.");
      window.setTimeout(
        () => setCopiedId(current => (current === id ? null : current)),
        1800
      );
    } catch {
      setMessage(`Salin tidak tersedia. URL: ${url}`);
    }
  }

  if (loading)
    return (
      <div className="studio-os grid min-h-dvh place-items-center text-sm text-white/50">
        <span className="relative z-[1] font-mono text-[11px] uppercase tracking-[0.3em]">
          Memeriksa akses studio…
        </span>
      </div>
    );
  if (!isAuthenticated)
    return (
      <main className="studio-os grid min-h-dvh place-items-center p-6">
        <p className="relative z-[1] text-sm text-white/50">
          Masuk dulu untuk mengelola asset tersimpan.
        </p>
      </main>
    );

  const totalBytes =
    assets.data?.reduce((sum, asset) => sum + asset.size, 0) ?? 0;
  const totalMegabytes = (totalBytes / (1024 * 1024)).toFixed(2);

  return (
    <DashboardLayout title="Asset Library" kicker="AN // Media">
      <div className="space-y-6">
        <StudioHero
          kicker="AN // Media operations"
          title={
            <>
              Keep the <em>signal</em> sharp.
            </>
          }
          lead="Unggah, periksa, dan pasang bahasa visual situs. File disimpan di managed storage; dokumen hanya menyimpan URL referensinya."
          actions={
            <>
              <StudioButton
                variant="primary"
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={upload.isPending}
              >
                <UploadCloud size={14} />
                {upload.isPending ? "Mengunggah…" : "Upload asset"}
              </StudioButton>
              <StudioLink href="/studio">
                Buka Content Studio <ArrowUpRight size={13} />
              </StudioLink>
            </>
          }
          aside={
            <Pill tone="accent">
              <HardDrive size={11} /> Managed storage
            </Pill>
          }
        />

        <input
          ref={inputRef}
          className="hidden"
          type="file"
          accept="image/*,audio/*,video/*,.pdf"
          onChange={event => {
            void handleFile(event.target.files?.[0]);
            event.target.value = "";
          }}
        />

        <StatGrid>
          <Stat
            icon={FolderOpen}
            kicker="Library"
            value={assets.isLoading ? "—" : (assets.data?.length ?? 0)}
            label="Asset terkelola"
            tone="cyan"
          />
          <Stat
            icon={Archive}
            kicker="Footprint"
            value={assets.isLoading ? "—" : `${totalMegabytes} MB`}
            label="Volume terpakai saat ini"
            tone="violet"
          />
          <Stat
            icon={UploadCloud}
            kicker="Limit"
            value="10 MB"
            label="Maksimum per file"
            tone="amber"
          />
        </StatGrid>

        <div
          onDragOver={event => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={event => {
            event.preventDefault();
            setDragging(false);
            void handleFile(event.dataTransfer.files?.[0]);
          }}
          className={`rounded-2xl border border-dashed p-7 text-center transition ${dragging ? "border-cyan-200/60 bg-cyan-200/[0.09]" : "border-white/12 bg-white/[0.02]"}`}
        >
          <UploadCloud
            size={24}
            className={`mx-auto transition ${dragging ? "text-cyan-200" : "text-white/30"}`}
          />
          <p className="mt-3 text-sm text-white/65">
            Seret file ke sini, atau{" "}
            <button
              type="button"
              className="text-cyan-200 underline-offset-4 hover:underline"
              onClick={() => inputRef.current?.click()}
            >
              pilih dari perangkat
            </button>
          </p>
          <p className="mt-1 text-[11px] text-white/35">
            Gambar, audio, video, atau PDF · maksimal 10 MB per file
          </p>
        </div>

        {message ? (
          <div className="flex items-center gap-3 rounded-xl border border-cyan-200/15 bg-cyan-200/[0.05] px-4 py-3 text-xs text-cyan-100/80">
            <Check className="h-4 w-4 shrink-0" />
            {message}
          </div>
        ) : null}

        <section className="st-panel">
          <header className="st-panel-head">
            <div className="min-w-0">
              <Eyebrow icon={FolderOpen}>01 // Library</Eyebrow>
              <h2 className="st-title">Stored media</h2>
              <p className="st-sub">
                {visible.length} dari {assets.data?.length ?? 0} file siap
                dipasang dari Content Studio · owner:{" "}
                {user?.name || user?.email || "private session"}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search
                  size={13}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
                />
                <Input
                  value={query}
                  onChange={event => setQuery(event.target.value)}
                  placeholder="Cari nama file…"
                  className="h-9 w-52 rounded-xl border-white/10 bg-black/25 pl-8 text-xs text-white placeholder:text-white/25 focus:border-cyan-200/50"
                />
              </div>
              <div className="flex gap-1 rounded-xl border border-white/10 bg-black/25 p-1">
                {filters.map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFilter(item.id)}
                    className={`rounded-lg px-2.5 py-1.5 text-[11px] transition ${filter === item.id ? "bg-cyan-200/15 text-cyan-100" : "text-white/45 hover:text-white"}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </header>
          <div className="st-panel-body">
            {assets.isLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-56 animate-pulse rounded-2xl bg-white/[0.04]"
                  />
                ))}
              </div>
            ) : assets.isError ? (
              <div className="rounded-xl border border-red-200/15 bg-red-200/[0.05] p-6 text-sm text-red-100/75">
                Asset terkelola tidak dapat dimuat.
              </div>
            ) : visible.length ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {visible.map(asset => {
                  const usage = documents.data
                    ? documents.data.filter(document =>
                        JSON.stringify(document.payload).includes(asset.url)
                      ).length
                    : null;
                  return (
                    <article
                      key={asset.id}
                      className="group overflow-hidden rounded-2xl border border-white/[0.08] bg-black/[0.16] transition hover:-translate-y-0.5 hover:border-cyan-200/30"
                    >
                      <div className="flex aspect-video items-center justify-center bg-[#0a0c11] p-2">
                        {asset.mimeType.startsWith("image/") ? (
                          <img
                            src={asset.url}
                            alt={asset.fileName}
                            loading="lazy"
                            className="max-h-full w-full object-contain transition duration-500 group-hover:scale-[1.03]"
                          />
                        ) : (
                          <div className="grid h-full place-items-center text-white/35">
                            <AssetTypeIcon mimeType={asset.mimeType} />
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-white/85">
                              {asset.fileName}
                            </p>
                            <p className="mt-1 text-[10px] text-white/35">
                              {Math.ceil(asset.size / 1024)} KB ·{" "}
                              {asset.mimeType}
                            </p>
                          </div>
                          <span className="rounded-lg border border-white/10 p-1.5 text-white/30">
                            <AssetTypeIcon mimeType={asset.mimeType} />
                          </span>
                        </div>
                        <p className="mt-3 truncate rounded-lg bg-white/[0.035] px-2.5 py-2 font-mono text-[10px] text-white/35">
                          {asset.url}
                        </p>
                        {!asset.mimeType.startsWith("image/") ? (
                          <StudioAssetPreview
                            value={asset.url}
                            label="File preview"
                            mimeType={asset.mimeType}
                            compact
                          />
                        ) : null}
                        {usage !== null ? (
                          <p className="mt-3 text-[10px] text-violet-100/55">
                            Dipakai di {usage} dokumen Studio
                          </p>
                        ) : null}
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <a
                            className="inline-flex items-center gap-1.5 text-xs text-cyan-100/75 underline-offset-4 hover:text-cyan-100 hover:underline"
                            href={asset.url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Buka file <ArrowUpRight size={12} />
                          </a>
                          <StudioButton
                            type="button"
                            className="ml-auto h-8 px-3 text-[11px]"
                            onClick={() => void handleCopy(asset.id, asset.url)}
                          >
                            {copiedId === asset.id ? (
                              <Check size={13} />
                            ) : (
                              <Copy size={13} />
                            )}
                            {copiedId === asset.id ? "Tersalin" : "Copy URL"}
                          </StudioButton>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : assets.data?.length ? (
              <EmptyState
                icon={Search}
                title="Tidak ada file yang cocok."
                description="Ubah kata kunci atau filter tipe media."
              />
            ) : (
              <EmptyState
                icon={UploadCloud}
                title="Belum ada asset terkelola."
                description="Unggah visual, audio, video, atau PDF supaya bisa dipilih langsung dari editor."
                action={
                  <StudioButton
                    type="button"
                    variant="primary"
                    onClick={() => inputRef.current?.click()}
                  >
                    Upload asset pertama
                  </StudioButton>
                }
              />
            )}
          </div>
        </section>

        <p className="text-xs leading-5 text-white/30">
          File yang diunggah adalah entri metadata khusus owner. Menghapus
          referensi dari sebuah dokumen membuatnya tidak terpakai; lapisan
          storage sengaja tidak menyediakan penghapusan objek permanen.
        </p>
      </div>
    </DashboardLayout>
  );
}
