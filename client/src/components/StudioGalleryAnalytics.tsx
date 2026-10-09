import { BarChart3, Eye } from "lucide-react";
import { trpc } from "@/lib/trpc";

type DailyStat = { day: string; visitors: number; visits: number };

function formatDay(value: string) {
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return value.slice(5);
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", timeZone: "UTC" }).format(date);
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div>
      <strong className="block text-[20px] font-semibold tracking-tight text-white">{value}</strong>
      <span className="mt-1 block font-mono text-[10px] uppercase tracking-wider text-zinc-500">{label}</span>
    </div>
  );
}

export default function StudioGalleryAnalytics() {
  const analytics = trpc.analytics.portraitGallery.useQuery(undefined, { staleTime: 60_000 });
  const data = analytics.data;
  const daily = (data?.daily ?? []) as DailyStat[];
  const maxVisitors = Math.max(1, ...daily.map(item => item.visitors));

  return (
    <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/30">
      <div className="flex items-start justify-between gap-4 border-b border-zinc-800 px-5 py-4">
        <div>
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-zinc-500"><BarChart3 size={12} /> Gallery signal</div>
          <h2 className="mt-1.5 text-[15px] font-semibold text-white">Portrait gallery</h2>
          <p className="mt-1 text-[12px] text-zinc-500">Berapa banyak browser anonim yang buka gallery foto.</p>
        </div>
        <a href="/visuals#portraits" target="_blank" rel="noreferrer" className="rounded-lg border border-zinc-800 p-2 text-zinc-500 hover:text-white hover:bg-zinc-800"><Eye size={14} /></a>
      </div>
      <div className="grid grid-cols-3 gap-3 px-5 py-4">
        <Stat label="Hari ini" value={analytics.isLoading ? "—" : data?.todayStats.visitors ?? 0} />
        <Stat label="7 hari" value={analytics.isLoading ? "—" : data?.last7Days.visitors ?? 0} />
        <Stat label="Total" value={analytics.isLoading ? "—" : data?.allTime.visitors ?? 0} />
      </div>
      <div className="border-t border-zinc-800 px-5 py-4">
        <p className="mb-3 font-mono text-[10px] uppercase tracking-wider text-zinc-500">Unique visitors / 7 hari</p>
        {daily.length ? (
          <div className="flex h-16 items-end gap-2">
            {daily.map(item => (
              <div className="flex flex-1 flex-col items-center gap-1" key={item.day} title={`${formatDay(item.day)} · ${item.visitors}`}>
                <div className="w-full rounded-t bg-zinc-700" style={{ height: `${Math.max(6, (item.visitors / maxVisitors) * 48)}px` }} />
                <span className="text-[9px] text-zinc-600">{formatDay(item.day)}</span>
              </div>
            ))}
          </div>
        ) : <p className="rounded-lg border border-dashed border-zinc-800 px-3 py-4 text-center text-[11px] text-zinc-500">Belum ada akses tercatat.</p>}
      </div>
    </section>
  );
}
