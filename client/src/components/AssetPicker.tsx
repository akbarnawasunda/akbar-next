import { useMemo, useState } from "react";
import { Search, Image as ImageIcon, FileAudio, FileVideo, FileText, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";

type AssetPickerProps = {
  value: string;
  onChange: (value: string) => void;
  label?: string;
};

function AssetTypeIcon({ mimeType }: { mimeType: string }) {
  if (mimeType.startsWith("image/")) return <ImageIcon className="h-5 w-5" />;
  if (mimeType.startsWith("audio/")) return <FileAudio className="h-5 w-5" />;
  if (mimeType.startsWith("video/")) return <FileVideo className="h-5 w-5" />;
  return <FileText className="h-5 w-5" />;
}

export default function AssetPicker({ value, onChange, label = "Choose from Asset Library" }: AssetPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const assets = trpc.assets.list.useQuery(undefined, { enabled: open });
  const filteredAssets = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return assets.data ?? [];
    return (assets.data ?? []).filter(asset => `${asset.fileName} ${asset.mimeType} ${asset.url}`.toLowerCase().includes(query));
  }, [assets.data, search]);

  function selectAsset(url: string) {
    onChange(url);
    setOpen(false);
    setSearch("");
  }

  return (
    <>
      <div className="flex gap-2">
        <Input value={value} onChange={event => onChange(event.target.value)} type="url" placeholder="/manus-storage/... or /assets/..." aria-label={label} />
        <Button type="button" variant="outline" onClick={() => setOpen(true)} className="shrink-0">
          {label}
        </Button>
      </div>
      {value ? <p className="truncate text-xs text-muted-foreground">Current: {value}</p> : null}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Choose managed media</DialogTitle>
            <DialogDescription>Select an uploaded asset to attach to this document. The URL will be inserted into the editor field.</DialogDescription>
          </DialogHeader>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search file name, type, or URL" className="pl-9" autoFocus />
          </div>
          {assets.isLoading ? <p className="text-sm text-muted-foreground">Loading managed assets…</p> : assets.isError ? <p className="text-sm text-destructive">Could not load managed assets.</p> : filteredAssets.length ? <div className="grid gap-3 sm:grid-cols-2">{filteredAssets.map(asset => <Card key={asset.id} className="overflow-hidden"><button type="button" className="block w-full text-left transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring" onClick={() => selectAsset(asset.url)}><div className="aspect-video bg-muted">{asset.mimeType.startsWith("image/") ? <img src={asset.url} alt={asset.fileName} className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-muted-foreground"><AssetTypeIcon mimeType={asset.mimeType} /></div>}</div><CardContent className="p-3"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-medium">{asset.fileName}</p><p className="mt-1 text-xs text-muted-foreground">{Math.ceil(asset.size / 1024)} KB · {asset.mimeType}</p></div>{value === asset.url ? <Check className="h-4 w-4 shrink-0 text-primary" /> : null}</div><p className="mt-2 truncate text-xs text-muted-foreground">{asset.url}</p></CardContent></button></Card>)}</div> : <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">{assets.data?.length ? "No asset matches your search." : "No managed assets yet. Upload a file in Asset Library first."}</div>}
        </DialogContent>
      </Dialog>
    </>
  );
}
