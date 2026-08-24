import { useMemo, useRef, useState } from "react";
import { Check, FileAudio, FileText, FileVideo, Image as ImageIcon, Loader2, Search, Trash2, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { StudioAssetPreview } from "./StudioAssetPreview";

type AssetPickerProps = {
  value: string;
  onChange: (value: string) => void;
  label?: string;
};

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

export default function AssetPicker({ value, onChange, label = "Choose from Asset Library" }: AssetPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const assets = trpc.assets.list.useQuery(undefined, { enabled: open || Boolean(value) });
  const utils = trpc.useUtils();
  const upload = trpc.assets.upload.useMutation({
    onSuccess: async asset => {
      onChange(asset.url);
      setMessage("Asset uploaded and attached.");
      await utils.assets.list.invalidate();
    },
    onError: error => setMessage(error.message || "Upload failed."),
  });
  const filteredAssets = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return assets.data ?? [];
    return (assets.data ?? []).filter(asset => `${asset.fileName} ${asset.mimeType} ${asset.url}`.toLowerCase().includes(query));
  }, [assets.data, search]);
  const selectedAsset = assets.data?.find(asset => asset.url === value);

  function selectAsset(url: string) {
    onChange(url);
    setOpen(false);
    setSearch("");
    setMessage("");
  }

  async function handleUpload(file?: File) {
    if (!file) return;
    if (file.size > MAX_BYTES) {
      setMessage("File harus berukuran maksimal 10 MB.");
      return;
    }
    setMessage("Uploading…");
    try {
      const base64 = await readAsBase64(file);
      await upload.mutateAsync({ fileName: file.name, mimeType: file.type || "application/octet-stream", size: file.size, base64 });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <Input value={value} onChange={event => onChange(event.target.value)} type="url" placeholder="/manus-storage/... atau https://..." aria-label={label} className="min-w-[220px] flex-1" />
        <Button type="button" variant="outline" onClick={() => setOpen(true)} className="shrink-0"><Search size={14} />{label}</Button>
        <Button type="button" variant="outline" onClick={() => inputRef.current?.click()} disabled={upload.isPending} className="shrink-0 border-cyan-200/20 bg-cyan-200/[0.05] text-cyan-100/80 hover:bg-cyan-200/[0.12]">{upload.isPending ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}Upload baru</Button>
        {value ? <Button type="button" variant="ghost" onClick={() => { onChange(""); setMessage(""); }} className="shrink-0 text-white/45 hover:bg-red-200/10 hover:text-red-100" aria-label="Clear media"><Trash2 size={14} />Clear</Button> : null}
      </div>
      <Input ref={inputRef} className="hidden" type="file" accept="image/*,audio/*,video/*,.pdf" onChange={event => { void handleUpload(event.target.files?.[0]); }} />
      {message ? <p className={`text-[10px] ${message.includes("failed") || message.includes("maksimal") ? "text-red-200/75" : "text-cyan-100/60"}`}>{message}</p> : null}
      {value ? <StudioAssetPreview value={value} label={selectedAsset ? `${selectedAsset.fileName} · current preview` : "Current preview"} mimeType={selectedAsset?.mimeType} compact /> : null}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Choose managed media</DialogTitle>
            <DialogDescription>Pilih asset yang sudah di-upload, atau tutup dialog lalu gunakan Upload baru. Preview di bawah akan mengikuti field yang sedang diedit.</DialogDescription>
          </DialogHeader>
          <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search file name, type, or URL" className="pl-9" autoFocus /></div>
          {assets.isLoading ? <p className="text-sm text-muted-foreground">Loading managed assets…</p> : assets.isError ? <p className="text-sm text-destructive">Could not load managed assets.</p> : filteredAssets.length ? <div className="grid gap-3 sm:grid-cols-2">{filteredAssets.map(asset => <Card key={asset.id} className="overflow-hidden"><button type="button" className="block w-full text-left transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring" onClick={() => selectAsset(asset.url)}><div className="aspect-video bg-muted">{asset.mimeType.startsWith("image/") ? <img src={asset.url} alt={asset.fileName} className="h-full w-full object-cover" loading="lazy" /> : <div className="grid h-full place-items-center text-muted-foreground"><AssetTypeIcon mimeType={asset.mimeType} /></div>}</div><CardContent className="p-3"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-medium">{asset.fileName}</p><p className="mt-1 text-xs text-muted-foreground">{Math.ceil(asset.size / 1024)} KB · {asset.mimeType}</p></div>{value === asset.url ? <Check className="h-4 w-4 shrink-0 text-primary" /> : null}</div><p className="mt-2 truncate text-xs text-muted-foreground">{asset.url}</p></CardContent></button></Card>)}</div> : <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">{assets.data?.length ? "No asset matches your search." : "No managed assets yet. Upload a file here or in Asset Library first."}</div>}
        </DialogContent>
      </Dialog>
    </div>
  );
}
