import { useRef, useState } from "react";
import { Archive, ArrowUpRight, Check, Copy, FileAudio, FileText, FileVideo, FolderOpen, Image as ImageIcon, UploadCloud } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { StudioAssetPreview } from "@/components/StudioAssetPreview";

const MAX_BYTES = 10 * 1024 * 1024;

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

export default function AssetLibrary() {
  const { user, isAuthenticated, loading } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const assets = trpc.assets.list.useQuery(undefined, { enabled: isAuthenticated });
  const documents = trpc.content.documentsAll.useQuery(undefined, { enabled: isAuthenticated });
  const utils = trpc.useUtils();
  const upload = trpc.assets.upload.useMutation({
    onSuccess: async () => {
      setMessage("Asset uploaded to managed File Storage.");
      await utils.assets.list.invalidate();
    },
    onError: error => setMessage(error.message),
  });

  async function handleFile(file?: File) {
    if (!file) return;
    if (file.size > MAX_BYTES) {
      setMessage("Files must be 10 MB or smaller.");
      return;
    }
    setMessage("Uploading…");
    try {
      const base64 = await readAsBase64(file);
      await upload.mutateAsync({ fileName: file.name, mimeType: file.type || "application/octet-stream", size: file.size, base64 });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed");
    }
  }

  async function handleCopy(id: number, url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setMessage("Asset URL copied to clipboard.");
      window.setTimeout(() => setCopiedId(current => current === id ? null : current), 1800);
    } catch {
      setMessage(`Copy unavailable. URL: ${url}`);
    }
  }

  if (loading) return <div className="grid min-h-screen place-items-center bg-[#08090c] text-sm text-white/50">Checking studio access…</div>;
  if (!isAuthenticated) return <main className="grid min-h-screen place-items-center bg-[#08090c] p-6"><p className="text-sm text-white/50">Please sign in to manage stored assets.</p></main>;

  const totalBytes = assets.data?.reduce((sum, asset) => sum + asset.size, 0) ?? 0;
  const totalMegabytes = (totalBytes / (1024 * 1024)).toFixed(2);

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-[1600px] space-y-8">
        <header className="flex flex-col gap-6 border-b border-white/[0.08] pb-7 lg:flex-row lg:items-end lg:justify-between"><div className="max-w-3xl"><div className="mb-4 flex flex-wrap items-center gap-3"><span className="font-mono text-[10px] uppercase tracking-[0.25em] text-cyan-200/75">AN // Media operations</span><span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.15em] text-white/45">Managed storage</span></div><h1 className="text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">Keep the <span className="text-cyan-200">signal</span> sharp.</h1><p className="mt-4 max-w-2xl text-sm leading-6 text-white/50">Upload, inspect, and attach the visual language of the site. Files live in managed storage; documents only keep their safe reference URL.</p></div><div className="flex flex-wrap gap-2"><Button onClick={() => inputRef.current?.click()} disabled={upload.isPending} className="h-10 rounded-xl bg-cyan-300 px-4 text-xs font-semibold text-[#071014] shadow-lg shadow-cyan-300/10 hover:bg-cyan-200">{upload.isPending ? "Uploading…" : "Upload asset"}<UploadCloud size={14} /></Button><Input ref={inputRef} className="hidden" type="file" accept="image/*,audio/*,video/*,.pdf" onChange={event => { void handleFile(event.target.files?.[0]); event.target.value = ""; }} /></div></header>

        <section className="grid gap-3 sm:grid-cols-3"><article className="rounded-2xl border border-cyan-200/15 bg-cyan-200/[0.055] p-5"><div className="flex items-start justify-between"><FolderOpen className="h-4 w-4 text-cyan-200" /><span className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/35">Library</span></div><p className="mt-7 text-3xl font-semibold tracking-tight text-white">{assets.isLoading ? "—" : assets.data?.length ?? 0}</p><p className="mt-1 text-xs text-white/45">Managed assets</p></article><article className="rounded-2xl border border-white/[0.09] bg-white/[0.035] p-5"><div className="flex items-start justify-between"><Archive className="h-4 w-4 text-violet-200" /><span className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/35">Footprint</span></div><p className="mt-7 text-3xl font-semibold tracking-tight text-white">{assets.isLoading ? "—" : `${totalMegabytes} MB`}</p><p className="mt-1 text-xs text-white/45">Current uploaded volume</p></article><article className="rounded-2xl border border-white/[0.09] bg-white/[0.035] p-5"><div className="flex items-start justify-between"><UploadCloud className="h-4 w-4 text-amber-200" /><span className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/35">Limit</span></div><p className="mt-7 text-3xl font-semibold tracking-tight text-white">10 MB</p><p className="mt-1 text-xs text-white/45">Maximum per file</p></article></section>

        {message ? <div className="flex items-center gap-3 rounded-xl border border-cyan-200/10 bg-cyan-200/[0.035] px-4 py-3 text-xs text-cyan-100/75"><Check className="h-4 w-4 shrink-0" />{message}</div> : null}
        <section className="overflow-hidden rounded-2xl border border-white/[0.09] bg-white/[0.03] shadow-2xl shadow-black/20"><div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/[0.08] bg-white/[0.025] px-5 py-5 sm:px-7"><div><div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-violet-200/70"><FolderOpen size={13} />01 // Library</div><h2 className="mt-2 text-xl font-semibold tracking-tight text-white">Stored media</h2><p className="mt-1 text-xs text-white/40">{assets.data?.length ?? 0} files available to attach from Content Studio</p></div><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/30">Owner: {user?.name || user?.email || "private session"}</p></div><div className="p-5 sm:p-7">{assets.isLoading ? <div className="rounded-xl border border-dashed border-white/10 p-10 text-center text-sm text-white/40">Loading managed assets…</div> : assets.isError ? <div className="rounded-xl border border-red-200/15 bg-red-200/[0.05] p-6 text-sm text-red-100/75">Could not load managed assets.</div> : assets.data?.length ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{assets.data.map(asset => <Card key={asset.id} className="overflow-hidden border-white/[0.08] bg-black/[0.14] transition hover:border-cyan-200/25 hover:bg-white/[0.04]"><div className="flex aspect-video items-center justify-center bg-[#0b0c10] p-2">{asset.mimeType.startsWith("image/") ? <img src={asset.url} alt={asset.fileName} className="max-h-full w-full object-contain" /> : <div className="grid h-full place-items-center text-white/35"><AssetTypeIcon mimeType={asset.mimeType} /></div>}</div><CardContent className="p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-medium text-white/85">{asset.fileName}</p><p className="mt-1 text-[10px] text-white/35">{Math.ceil(asset.size / 1024)} KB · {asset.mimeType}</p></div><span className="rounded-md border border-white/10 p-1.5 text-white/30"><AssetTypeIcon mimeType={asset.mimeType} /></span></div><p className="mt-3 truncate rounded-lg bg-white/[0.035] px-2.5 py-2 font-mono text-[10px] text-white/35">{asset.url}</p>{!asset.mimeType.startsWith("image/") ? <StudioAssetPreview value={asset.url} label="File preview" mimeType={asset.mimeType} compact /> : null}{documents.data ? <p className="mt-3 text-[10px] text-violet-100/55">Dipakai di {documents.data.filter(document => JSON.stringify(document.payload).includes(asset.url)).length} dokumen Studio</p> : null}<div className="mt-3 flex flex-wrap items-center gap-2"><a className="inline-flex items-center gap-1.5 text-xs text-cyan-100/75 underline-offset-4 hover:text-cyan-100 hover:underline" href={asset.url} target="_blank" rel="noreferrer">Open stored file <ArrowUpRight size={12} /></a><Button type="button" variant="outline" size="sm" onClick={() => void handleCopy(asset.id, asset.url)} className="ml-auto h-8 rounded-lg border-white/10 bg-white/[0.03] text-xs text-white/60 hover:border-cyan-200/25 hover:bg-cyan-200/[0.08] hover:text-cyan-100">{copiedId === asset.id ? <Check size={13} /> : <Copy size={13} />}{copiedId === asset.id ? "Copied" : "Copy URL"}</Button></div></CardContent></Card>)}</div> : <div className="rounded-xl border border-dashed border-white/10 p-10 text-center"><UploadCloud className="mx-auto h-8 w-8 text-cyan-200/45" /><p className="mt-4 text-sm text-white/60">No managed assets yet.</p><p className="mt-1 text-xs text-white/35">Upload a visual, audio file, video, or PDF to make it available in the editor picker.</p><Button type="button" onClick={() => inputRef.current?.click()} className="mt-5 h-10 rounded-xl bg-white/[0.08] text-xs text-white hover:bg-cyan-200/10 hover:text-cyan-100">Upload first asset</Button></div>}</div></section>
        <p className="text-xs leading-5 text-white/30">Uploaded files are owner-only metadata entries. Removing a reference from a document makes it unused; the storage layer intentionally does not expose destructive object deletion.</p>
      </div>
    </DashboardLayout>
  );
}
