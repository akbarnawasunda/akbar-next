/**
 * INQUIRY INBOX v2 — lebih jelas, tanpa badge warna-warni berlebihan.
 */
import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  Building2,
  CalendarClock,
  Inbox,
  Mail,
  MapPin,
  Search,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/_core/hooks/useAuth";
import OwnerLoginCard from "@/components/OwnerLoginCard";
import { trpc } from "@/lib/trpc";
import {
  EmptyState,
  Eyebrow,
  Pill,
  Stat,
  StatGrid,
  StudioHero,
  StudioLink,
} from "@/studio/StudioKit";

const statuses = ["new", "reviewed", "closed"] as const;
type Status = (typeof statuses)[number];

const statusLabel: Record<Status, string> = {
  new: "Baru",
  reviewed: "Diproses",
  closed: "Selesai",
};

const statusTone: Record<Status, "live" | "draft" | "neutral"> = {
  new: "live",
  reviewed: "draft",
  closed: "neutral",
};

export default function InquiryStudio() {
  const { user, loading } = useAuth();
  const utils = trpc.useUtils();
  const [filter, setFilter] = useState<Status | "all">("all");
  const [query, setQuery] = useState("");
  const inquiries = trpc.inquiry.list.useQuery(undefined, { enabled: user?.role === "admin" });
  const update = trpc.inquiry.updateStatus.useMutation({
    onSuccess: async () => {
      toast.success("Status diperbarui.");
      await utils.inquiry.list.invalidate();
    },
    onError: () => toast.error("Gagal update status."),
  });

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return (inquiries.data ?? []).filter(item => {
      if (filter !== "all" && item.status !== filter) return false;
      if (!needle) return true;
      return [item.name, item.email, item.projectTitle, item.organization, item.inquiryType, item.message].join(" ").toLowerCase().includes(needle);
    });
  }, [filter, inquiries.data, query]);

  if (loading)
    return (
      <div className="studio-os grid min-h-dvh place-items-center text-sm text-white/50">
        <span className="relative z-[1] font-mono text-[11px] uppercase tracking-wider">Memeriksa akses…</span>
      </div>
    );
  if (!user) return <OwnerLoginCard title="Inbox" description="Masuk dengan kredensial owner untuk lihat inquiry." />;
  if (user.role !== "admin")
    return (
      <main className="studio-os grid min-h-dvh place-items-center p-6">
        <section className="st-panel relative z-[1] max-w-md p-8 text-center">
          <ShieldCheck size={30} className="mx-auto text-zinc-500" />
          <h1 className="mt-4 text-xl font-semibold text-white">Owner only</h1>
          <p className="st-sub mx-auto mt-2">Inbox hanya untuk pemilik situs.</p>
          <a className="st-btn mx-auto mt-6" href="/">Kembali <ArrowUpRight size={14} /></a>
        </section>
      </main>
    );

  const all = inquiries.data ?? [];
  const counts = {
    new: all.filter(i => i.status === "new").length,
    reviewed: all.filter(i => i.status === "reviewed").length,
    closed: all.filter(i => i.status === "closed").length,
  };

  return (
    <DashboardLayout title="Inbox" kicker="Studio">
      <div className="space-y-6">
        <StudioHero
          kicker="Studio / Inbox"
          title={<>Pesan masuk <em>yang perlu dibalas.</em></>}
          lead={`${counts.new} pesan baru dari form booking, remix, collab, dan licensing.`}
          actions={<StudioLink href="/studio">Kembali ke editor <ArrowUpRight size={13} /></StudioLink>}
          aside={<Pill tone={counts.new ? "live" : "neutral"}>{counts.new} menunggu</Pill>}
        />

        <StatGrid>
          <Stat icon={Inbox} kicker="Baru" value={inquiries.isLoading ? "—" : counts.new} label="Belum dibaca" tone={counts.new ? "live" : "neutral"} />
          <Stat icon={Mail} kicker="Diproses" value={inquiries.isLoading ? "—" : counts.reviewed} label="Sedang ditindaklanjuti" tone="neutral" />
          <Stat icon={ShieldCheck} kicker="Selesai" value={inquiries.isLoading ? "—" : counts.closed} label="Sudah ditutup" tone="neutral" />
          <Stat icon={CalendarClock} kicker="Total" value={inquiries.isLoading ? "—" : all.length} label="Semua pesan" tone="neutral" />
        </StatGrid>

        <section className="st-panel">
          <header className="st-panel-head">
            <div className="min-w-0">
              <Eyebrow icon={Inbox}>Daftar pesan</Eyebrow>
              <h2 className="st-title">Inquiry</h2>
              <p className="st-sub">{visible.length} dari {all.length} pesan</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Cari nama, email…" className="h-9 w-52 rounded-lg border-zinc-800 bg-zinc-900 pl-8 text-[13px] text-white placeholder:text-zinc-600 focus:border-zinc-700" />
              </div>
              <div className="flex gap-1 rounded-lg border border-zinc-800 bg-zinc-900 p-1">
                {(["all", ...statuses] as const).map(item => (
                  <button key={item} type="button" onClick={() => setFilter(item)} className={`rounded-md px-2.5 py-1 text-[11px] capitalize transition ${filter === item ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"}`}>
                    {item === "all" ? "Semua" : statusLabel[item]}
                  </button>
                ))}
              </div>
            </div>
          </header>

          <div className="st-panel-body space-y-3">
            {inquiries.isLoading ? (
              Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-36 animate-pulse rounded-xl bg-zinc-900" />)
            ) : visible.length ? (
              visible.map(inquiry => (
                <article key={inquiry.id} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 transition hover:bg-zinc-900">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Pill tone={statusTone[inquiry.status as Status]}>{statusLabel[inquiry.status as Status] ?? inquiry.status}</Pill>
                        <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">{inquiry.inquiryType} · {inquiry.source}</span>
                      </div>
                      <h3 className="mt-3 text-[15px] font-semibold text-white">{inquiry.projectTitle}</h3>
                      <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-zinc-400">
                        <span>{inquiry.name}</span>
                        <a className="inline-flex items-center gap-1 text-zinc-300 hover:text-white" href={`mailto:${inquiry.email}`}><Mail size={11} /> {inquiry.email}</a>
                        {inquiry.organization ? <span className="inline-flex items-center gap-1"><Building2 size={11} /> {inquiry.organization}</span> : null}
                      </p>
                    </div>
                    <select className="h-8 rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 text-[12px] text-white outline-none focus:border-zinc-700" value={inquiry.status} onChange={e => update.mutate({ id: inquiry.id, status: e.target.value as Status })} disabled={update.isPending}>
                      {statuses.map(s => <option key={s} value={s} className="bg-zinc-900">{statusLabel[s]}</option>)}
                    </select>
                  </div>
                  <p className="mt-4 whitespace-pre-wrap rounded-lg bg-zinc-950 p-4 text-[13px] leading-6 text-zinc-300">{inquiry.message}</p>
                  {inquiry.location || inquiry.timeline || inquiry.budgetContext ? (
                    <div className="mt-4 flex flex-wrap gap-2 border-t border-zinc-800 pt-4">
                      {inquiry.location ? <Pill><MapPin size={10} /> {inquiry.location}</Pill> : null}
                      {inquiry.timeline ? <Pill><CalendarClock size={10} /> {inquiry.timeline}</Pill> : null}
                      {inquiry.budgetContext ? <Pill><Wallet size={10} /> {inquiry.budgetContext}</Pill> : null}
                    </div>
                  ) : null}
                  <a className="st-btn mt-4 h-8 text-[12px]" href={`mailto:${inquiry.email}?subject=Re: ${encodeURIComponent(inquiry.projectTitle)}`}><Mail size={13} /> Balas via email</a>
                </article>
              ))
            ) : all.length ? (
              <EmptyState icon={Search} title="Tidak ada yang cocok." description="Ganti kata kunci atau filter." />
            ) : (
              <EmptyState icon={Inbox} title="Belum ada pesan." description="Form di /inquire akan masuk ke sini." />
            )}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
