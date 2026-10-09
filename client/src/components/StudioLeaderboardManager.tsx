import { ClipboardList, Plus, RefreshCw, Trash2, Trophy } from "lucide-react";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const MAX_SCORE = 999_999;

function formatDate(value: Date | string | null | undefined) {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export default function StudioLeaderboardManager() {
  const entries = trpc.leaderboard.adminList.useQuery(undefined, { staleTime: 15_000 });
  const utils = trpc.useUtils();
  const [username, setUsername] = useState("");
  const [score, setScore] = useState("0");

  const addEntry = trpc.leaderboard.adminAdd.useMutation({
    onSuccess: async () => {
      setUsername("");
      setScore("0");
      toast.success("Entry ditambahkan.");
      await utils.leaderboard.adminList.invalidate();
      await utils.leaderboard.top.invalidate();
    },
    onError: error => toast.error(error.message || "Gagal tambah entry."),
  });

  const deleteEntry = trpc.leaderboard.adminDelete.useMutation({
    onSuccess: async () => {
      toast.success("Entry dihapus.");
      await utils.leaderboard.adminList.invalidate();
      await utils.leaderboard.top.invalidate();
    },
    onError: error => toast.error(error.message || "Gagal hapus."),
  });

  const clearBoard = trpc.leaderboard.adminClear.useMutation({
    onSuccess: async result => {
      toast.success(result.deleted ? `${result.deleted} entry dihapus.` : "Leaderboard kosong.");
      await utils.leaderboard.adminList.invalidate();
      await utils.leaderboard.top.invalidate();
    },
    onError: error => toast.error(error.message || "Gagal kosongkan."),
  });

  function handleAdd(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const numericScore = Number(score);
    if (!Number.isInteger(numericScore) || numericScore < 0 || numericScore > MAX_SCORE) {
      toast.error(`Skor harus 0–${MAX_SCORE.toLocaleString("id-ID")}.`);
      return;
    }
    addEntry.mutate({ username, score: numericScore });
  }

  function handleDelete(id: number, name: string) {
    if (!window.confirm(`Hapus "${name}"?`)) return;
    deleteEntry.mutate({ id });
  }

  function handleClear() {
    if (!window.confirm("Kosongkan semua leaderboard? Tidak bisa dibatalkan.")) return;
    clearBoard.mutate();
  }

  const rows = entries.data ?? [];
  const highestScore = rows.reduce((h, r) => Math.max(h, Number(r.score)), 0);

  return (
    <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/30">
      <div className="flex flex-col gap-3 border-b border-zinc-800 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-zinc-500"><Trophy size={12} /> Game</div>
          <h2 className="mt-1 text-[15px] font-semibold text-white">JEDAG RUN leaderboard</h2>
          <p className="mt-1 text-[11px] text-zinc-500">Kelola skor yang tampil di papan peringkat publik.</p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => entries.refetch()} disabled={entries.isFetching} className="h-8 border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white"><RefreshCw size={12} className={entries.isFetching ? "animate-spin" : ""} /> Refresh</Button>
          <Button type="button" variant="outline" size="sm" onClick={handleClear} disabled={!rows.length || clearBoard.isPending} className="h-8 border-red-900/30 bg-red-950/20 text-red-300 hover:bg-red-950/40"><Trash2 size={12} /> Kosongkan</Button>
        </div>
      </div>

      <div className="grid gap-3 border-b border-zinc-800 px-5 py-4 sm:grid-cols-3">
        <div><strong className="block text-[18px] font-semibold text-white">{entries.isLoading ? "—" : rows.length}</strong><span className="mt-1 block font-mono text-[10px] uppercase tracking-wider text-zinc-500">Total entry</span></div>
        <div><strong className="block text-[18px] font-semibold text-white">{entries.isLoading ? "—" : highestScore.toLocaleString("id-ID")}</strong><span className="mt-1 block font-mono text-[10px] uppercase tracking-wider text-zinc-500">Skor tertinggi</span></div>
        <div><strong className="block text-[18px] font-semibold text-white">Top 10</strong><span className="mt-1 block font-mono text-[10px] uppercase tracking-wider text-zinc-500">Tampil publik</span></div>
      </div>

      <form onSubmit={handleAdd} className="grid gap-3 border-b border-zinc-800 px-5 py-4 sm:grid-cols-[1fr_120px_auto] sm:items-end">
        <label className="space-y-1.5"><span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">Nama publik</span><Input value={username} onChange={e => setUsername(e.target.value)} placeholder="Nama pemain" maxLength={20} required className="h-9 border-zinc-800 bg-zinc-950 text-white placeholder:text-zinc-600" /></label>
        <label className="space-y-1.5"><span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">Skor</span><Input value={score} onChange={e => setScore(e.target.value)} type="number" min={0} max={MAX_SCORE} step={1} required className="h-9 border-zinc-800 bg-zinc-950 text-white" /></label>
        <Button type="submit" disabled={addEntry.isPending} className="h-9 bg-white text-black hover:bg-zinc-200"><Plus size={14} /> {addEntry.isPending ? "Menambah…" : "Tambah"}</Button>
      </form>

      <div className="px-5 py-4">
        <div className="mb-3 flex items-center justify-between"><span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-zinc-500"><ClipboardList size={12} /> Semua entry</span><span className="text-[10px] text-zinc-600">Urut skor tertinggi</span></div>
        {entries.isLoading ? (
          <div className="rounded-xl border border-dashed border-zinc-800 px-3 py-8 text-center text-[12px] text-zinc-500">Memuat leaderboard…</div>
        ) : entries.isError ? (
          <div className="rounded-xl border border-dashed border-red-900/30 px-3 py-8 text-center text-[12px] text-red-300">Gagal muat. Coba refresh.</div>
        ) : rows.length ? (
          <div className="space-y-1.5">
            {rows.map((row, index) => (
              <div key={row.id} className="grid gap-3 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2.5 sm:grid-cols-[32px_1fr_100px_150px_auto] sm:items-center">
                <span className="font-mono text-[11px] text-zinc-500">{String(index + 1).padStart(2, "0")}</span>
                <div className="min-w-0"><p className="truncate text-[13px] font-medium text-white">{row.username}</p><p className="text-[10px] text-zinc-600">#{row.id}</p></div>
                <strong className="text-[13px] text-white">{Number(row.score).toLocaleString("id-ID")}</strong>
                <span className="text-[10px] text-zinc-500">{formatDate(row.createdAt)}</span>
                <Button type="button" variant="ghost" size="sm" onClick={() => handleDelete(row.id, row.username)} disabled={deleteEntry.isPending} className="h-7 justify-self-start text-zinc-500 hover:text-red-300 hover:bg-red-950/20 sm:justify-self-end"><Trash2 size={12} /> Hapus</Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-zinc-800 px-3 py-8 text-center text-[12px] text-zinc-500">Belum ada entry.</div>
        )}
      </div>
    </section>
  );
}
