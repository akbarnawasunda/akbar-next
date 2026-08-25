import { BarChart3, Eye, RefreshCw } from "lucide-react";
import { trpc } from "@/lib/trpc";

type DailyStat = {
  day: string;
  visitors: number;
  visits: number;
};

function formatDay(value: string) {
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return value.slice(5);
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", timeZone: "UTC" }).format(date);
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div>
      <strong className="block text-xl font-semibold tracking-tight text-white">{value}</strong>
      <span className="mt-1 block font-mono text-[8px] uppercase tracking-[0.14em] text-white/35">{label}</span>
    </div>
  );
}

export default function StudioGalleryAnalytics() {
  const analytics = trpc.analytics.portraitGallery.useQuery(undefined, { staleTime: 60_000 });
  const data = analytics.data;
  const daily = (data?.daily ?? []) as DailyStat[];
  const maxVisitors = Math.max(1, ...daily.map(item => item.visitors));
  return (
    <section className="overflow-hidden rounded-2xl border border-cyan-200/15 bg-cyan-200/[0.045] shadow-2xl shadow-black/10" aria-label="Portrait gallery analytics">
      <div className="flex items-start justify-between gap-4 border-b border-cyan-200/10 px-5 py-5 sm:px-6">
        <div>
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-200/75"><BarChart3 size={13} /> 03 // Gallery signal</div>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-white">Portrait gallery access</h2>
          <p className="mt-1 max-w-md text-xs leading-5 text-white/45">Berapa banyak browser anonim yang membuka halaman gallery foto.</p>
        </div>
        <a href="/visuals/portraits" target="_blank" rel="noreferrer" className="rounded-lg border border-cyan-200/15 p-2 text-cyan-100/70 transition hover:bg-cyan-200/10" aria-label="Open portrait gallery"><Eye size={15} /></a>
      </div>
      <div className="grid grid-cols-3 gap-3 px-5 py-5 sm:px-6">
        <Stat label="Hari ini" value={analytics.isLoading ? "—" : data?.todayStats.visitors ?? 0} />
        <Stat label="7 hari" value={analytics.isLoading ? "—" : data?.last7Days.visitors ?? 0} />
        <Stat label="Total" value={analytics.isLoading ? "—" : data?.allTime.visitors ?? 0} />
      </div>
      <div className="border-t border-cyan-200/10 px-5 py-4 sm:px-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/35">Unique visitors / last 7 days</span>
          <span className="inline-flex items-center gap-1 text-[10px] text-white/30"><RefreshCw size={11} /> auto refresh on open</span>
        </div>
        {daily.length ? (
          <div className="flex h-20 items-end gap-2">
            {daily.map(item => <div className="group flex min-w-0 flex-1 flex-col items-center gap-1" key={item.day} title={`${formatDay(item.day)} · ${item.visitors} visitor`}><div className="w-full rounded-t bg-cyan-200/55 transition group-hover:bg-cyan-100" style={{ height: `${Math.max(8, (item.visitors / maxVisitors) * 58)}px` }} /><span className="truncate text-[8px] text-white/35">{formatDay(item.day)}</span></div>)}
          </div>
        ) : <p className="rounded-lg border border-dashed border-white/10 px-3 py-4 text-center text-[11px] text-white/35">Belum ada akses yang tercatat.</p>}
      </div>
      <div className="border-t border-cyan-200/10 px-5 py-3 sm:px-6"><p className="text-[10px] leading-5 text-white/35">Angka ini adalah perkiraan visitor unik per browser. Sistem tidak menyimpan IP, email, atau user-agent.</p></div>
    </section>
  );
}
