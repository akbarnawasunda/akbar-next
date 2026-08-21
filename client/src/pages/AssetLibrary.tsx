import { useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const MAX_BYTES = 10 * 1024 * 1024;

function readAsBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.onerror = () => reject(reader.error ?? new Error("Unable to read file"));
    reader.readAsDataURL(file);
  });
}

export default function AssetLibrary() {
  const { user, isAuthenticated, loading } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");
  const assets = trpc.assets.list.useQuery(undefined, { enabled: isAuthenticated });
  const utils = trpc.useUtils();
  const upload = trpc.assets.upload.useMutation({
    onSuccess: async () => {
      setMessage("Asset uploaded to managed File Storage.");
      await utils.assets.list.invalidate();
    },
    onError: (error) => setMessage(error.message),
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

  if (loading) return <main className="container py-16">Loading account…</main>;
  if (!isAuthenticated) return <main className="container py-16"><Card><CardHeader><CardTitle>Asset Library</CardTitle></CardHeader><CardContent>Please sign in to manage stored assets.</CardContent></Card></main>;

  return (
    <main className="container min-h-screen py-12">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div><p className="font-mono text-xs uppercase tracking-[0.24em] text-muted-foreground">Signal desk / storage</p><h1 className="mt-2 text-4xl font-bold tracking-tight">Asset Library</h1><p className="mt-2 max-w-xl text-muted-foreground">Store portfolio media in managed S3 storage while keeping only searchable metadata in the database.</p></div>
        <Button onClick={() => inputRef.current?.click()} disabled={upload.isPending}>{upload.isPending ? "Uploading…" : "Upload asset"}</Button>
        <Input ref={inputRef} className="hidden" type="file" accept="image/*,audio/*,video/*,.pdf" onChange={(event) => void handleFile(event.target.files?.[0])} />
      </div>
      {message && <p className="mb-6 rounded-md border border-border bg-card px-4 py-3 text-sm" role="status">{message}</p>}
      {assets.isLoading ? <p>Loading stored assets…</p> : assets.data?.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{assets.data.map((asset) => <Card key={asset.id} className="overflow-hidden"><div className="aspect-video bg-muted">{asset.mimeType.startsWith("image/") ? <img src={asset.url} alt={asset.fileName} className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center p-4 text-center text-sm text-muted-foreground">{asset.mimeType}</div>}</div><CardContent className="p-4"><p className="truncate font-medium">{asset.fileName}</p><p className="mt-1 text-xs text-muted-foreground">{Math.ceil(asset.size / 1024)} KB · {new Date(asset.createdAt).toLocaleString()}</p><a className="mt-3 inline-block text-sm underline" href={asset.url} target="_blank" rel="noreferrer">Open stored file</a></CardContent></Card>)}</div> : <Card><CardContent className="p-8 text-center text-muted-foreground">No stored assets yet. Upload the first portfolio file.</CardContent></Card>}
      <p className="mt-8 text-xs text-muted-foreground">Signed in as {user?.name || user?.email || "owner"}. Stored bytes are handled by File Storage; the database stores metadata and the storage key only.</p>
    </main>
  );
}
