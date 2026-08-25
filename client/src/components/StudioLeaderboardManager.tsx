import { ClipboardList, Plus, RefreshCw, ShieldAlert, Trash2, Trophy } from "lucide-react";
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
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
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
      toast.success("Entry leaderboard ditambahkan.");
      await utils.leaderboard.adminList.invalidate();
      await utils.leaderboard.top.invalidate();
    },
    onError: error => toast.error(error.message || "Entry belum bisa ditambahkan."),
  });

  const deleteEntry = trpc.leaderboard.adminDelete.useMutation({
    onSuccess: async () => {
      toast.success("Entry leaderboard dihapus.");
      await utils.leaderboard.adminList.invalidate();
      await utils.leaderboard.top.invalidate();
    },
    onError: error => toast.error(error.message || "Entry belum bisa dihapus."),
  });

  const clearBoard = trpc.leaderboard.adminClear.useMutation({
    onSuccess: async result => {
      toast.success(result.deleted ? `${result.deleted} entry dihapus dari leaderboard.` : "Leaderboard sudah kosong.");
      await utils.leaderboard.adminList.invalidate();
      await utils.leaderboard.top.invalidate();
    },
    onError: error => toast.error(error.message || "Leaderboard belum bisa dikosongkan."),
  });

  function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const numericScore = Number(score);
    if (!Number.isInteger(numericScore) || numericScore < 0 || numericScore > MAX_SCORE) {
      toast.error(`Skor harus berupa angka bulat 0–${MAX_SCORE.toLocaleString("id-ID")}.`);
      return;
    }
    addEntry.mutate({ username, score: numericScore });
  }

  function handleDelete(id: number, name: string) {
    if (!window.confirm(`Hapus entry “${name}” dari leaderboard?`)) return;
    deleteEntry.mutate({ id });
  }

  function handleClear() {
    if (!window.confirm("Kosongkan seluruh leaderboard JEDAG RUN? Semua entry akan dihapus dan tidak bisa dibatalkan.")) return;
    clearBoard.mutate();
  }

  const rows = entries.data ?? [];
  const highestScore = rows.reduce((highest, row) => Math.max(highest, Number(row.score)), 0);

  return (
    <section id="studio-jedag-leaderboard" className="overflow-hidden rounded-2xl border border-amber-200/15 bg-amber-200/[0.035] shadow-2xl shadow-black/10" aria-label="JEDAG RUN leaderboard manager">
      <div className="flex flex-col gap-4 border-b border-amber-200/10 px-5 py-5 sm:px-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-amber-100/75"><Trophy size={13} /> 04 // Playable signal</div>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-white">JEDAG RUN leaderboard</h2>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-white/45">Kelola nama dan skor yang tampil di papan peringkat publik. Entry pemain dan entry manual berada di daftar yang sama.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => entries.refetch()} disabled={entries.isFetching} className="border-white/10 bg-white/[0.04] text-white/65 hover:bg-white/[0.08] hover:text-white">
            <RefreshCw size={13} className={entries.isFetching ? "animate-spin" : ""} /> Refresh
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={handleClear} disabled={!rows.length || clearBoard.isPending} className="border-rose-200/20 bg-rose-200/[0.04] text-rose-100/75 hover:bg-rose-200/[0.1] hover:text-rose-100">
            <Trash2 size={13} /> {clearBoard.isPending ? "Menghapus…" : "Kosongkan semua"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 border-b border-amber-200/10 px-5 py-5 sm:grid-cols-3 sm:px-6">
        <div><strong className="block text-xl font-semibold tracking-tight text-white">{entries.isLoading ? "—" : rows.length}</strong><span className="mt-1 block font-mono text-[8px] uppercase tracking-[0.14em] text-white/35">Total entry</span></div>
        <div><strong className="block text-xl font-semibold tracking-tight text-white">{entries.isLoading ? "—" : highestScore.toLocaleString("id-ID")}</strong><span className="mt-1 block font-mono text-[8px] uppercase tracking-[0.14em] text-white/35">Skor tertinggi</span></div>
        <div><strong className="block text-xl font-semibold tracking-tight text-white">Top 10</strong><span className="mt-1 block font-mono text-[8px] uppercase tracking-[0.14em] text-white/35">Yang tampil publik</span></div>
      </div>

      <form onSubmit={handleAdd} className="grid gap-3 border-b border-amber-200/10 px-5 py-5 sm:grid-cols-[minmax(0,1fr)_150px_auto] sm:items-end sm:px-6">
        <label className="space-y-2"><span className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/40">Nama publik</span><Input value={username} onChange={event => setUsername(event.target.value)} placeholder="Nama pemain" maxLength={20} required className="border-white/10 bg-black/20 text-white placeholder:text-white/25" /></label>
        <label className="space-y-2"><span className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/40">Skor</span><Input value={score} onChange={event => setScore(event.target.value)} type="number" min={0} max={MAX_SCORE} step={1} required className="border-white/10 bg-black/20 text-white placeholder:text-white/25" /></label>
        <Button type="submit" disabled={addEntry.isPending} className="bg-amber-100 text-[#15120a] hover:bg-amber-50"><Plus size={15} /> {addEntry.isPending ? "Menambah…" : "Tambah entry"}</Button>
      </form>

      <div className="border-b border-amber-200/10 px-5 py-3 sm:px-6"><p className="flex items-start gap-2 text-[10px] leading-5 text-white/35"><ShieldAlert size={13} className="mt-0.5 shrink-0 text-amber-100/60" />Panel ini hanya bisa dipakai owner/admin. Nama mengikuti aturan username publik game; skor boleh dimulai dari 0 dan maksimal {MAX_SCORE.toLocaleString("id-ID")}.</p></div>

      <div className="px-5 py-5 sm:px-6">
        <div className="mb-3 flex items-center justify-between gap-3"><span className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.14em] text-white/35"><ClipboardList size={12} /> Semua entry</span><span className="text-[10px] text-white/30">Urut skor tertinggi</span></div>
        {entries.isLoading ? <div className="rounded-xl border border-dashed border-white/10 px-3 py-8 text-center text-xs text-white/35">Memuat leaderboard…</div> : entries.isError ? <div className="rounded-xl border border-dashed border-rose-200/20 px-3 py-8 text-center text-xs text-rose-100/65">Data leaderboard belum bisa dimuat. Tekan Refresh untuk mencoba lagi.</div> : rows.length ? <div className="space-y-2">{rows.map((row, index) => <div key={row.id} className="grid gap-3 rounded-xl border border-white/[0.08] bg-black/[0.12] px-3 py-3 sm:grid-cols-[42px_minmax(0,1fr)_120px_170px_auto] sm:items-center"><span className="font-mono text-xs text-amber-100/60">{String(index + 1).padStart(2, "0")}</span><div className="min-w-0"><p className="truncate text-sm font-medium text-white">{row.username}</p><p className="mt-1 text-[10px] text-white/30">ID entry #{row.id}</p></div><strong className="text-sm text-amber-100">{Number(row.score).toLocaleString("id-ID")}</strong><span className="text-[10px] text-white/35">{formatDate(row.createdAt)}</span><Button type="button" variant="ghost" size="sm" onClick={() => handleDelete(row.id, row.username)} disabled={deleteEntry.isPending} className="justify-self-start text-rose-100/60 hover:bg-rose-200/[0.08] hover:text-rose-100 sm:justify-self-end"><Trash2 size={14} /> Hapus</Button></div>)}</div> : <div className="rounded-xl border border-dashed border-white/10 px-3 py-8 text-center text-xs text-white/35">Belum ada entry. Papan publik akan kembali kosong sampai ada skor pemain atau entry manual.</div>}
      </div>
    </section>
  );
}
