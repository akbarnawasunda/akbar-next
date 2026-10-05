/**
 * INQUIRY INBOX (/studio/inquiries) — booking, remix, collab, licensing.
 * Satu papan dengan filter status, ringkasan sinyal, dan aksi cepat balas.
 */
import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  Building2,
  CalendarClock,
  CircleDot,
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

const statusTone: Record<Status, "live" | "draft" | "neutral"> = {
  new: "live",
  reviewed: "draft",
  closed: "neutral",
};

const statusLabel: Record<Status, string> = {
  new: "Baru",
  reviewed: "Ditinjau",
  closed: "Selesai",
};

export default function InquiryStudio() {
  const { user, loading } = useAuth();
  const utils = trpc.useUtils();
  const [filter, setFilter] = useState<Status | "all">("all");
  const [query, setQuery] = useState("");
  const inquiries = trpc.inquiry.list.useQuery(undefined, {
    enabled: user?.role === "admin",
  });
  const update = trpc.inquiry.updateStatus.useMutation({
    onSuccess: async () => {
      toast.success("Status inquiry diperbarui.");
      await utils.inquiry.list.invalidate();
    },
    onError: () => toast.error("Status inquiry belum bisa diperbarui."),
  });

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return (inquiries.data ?? []).filter(item => {
      if (filter !== "all" && item.status !== filter) return false;
      if (!needle) return true;
      return [
        item.name,
        item.email,
        item.projectTitle,
        item.organization,
        item.inquiryType,
        item.message,
      ]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [filter, inquiries.data, query]);

  if (loading)
    return (
      <div className="studio-os grid min-h-dvh place-items-center text-sm text-white/50">
        <span className="relative z-[1] font-mono text-[11px] uppercase tracking-[0.3em]">
          Memeriksa akses studio…
        </span>
      </div>
    );
  if (!user)
    return (
      <OwnerLoginCard
        title="Inquiry inbox"
        description="Masuk dengan kredensial owner privat untuk meninjau inquiry yang masuk."
      />
    );
  if (user.role !== "admin")
    return (
      <main className="studio-os grid min-h-dvh place-items-center p-6">
        <section className="st-panel relative z-[1] max-w-md p-8 text-center">
          <ShieldCheck size={34} className="mx-auto text-cyan-200" />
          <h1 className="mt-5 text-2xl font-semibold text-white">
            Owner access required
          </h1>
          <p className="st-sub mx-auto">
            Catatan inquiry hanya terlihat oleh pemilik situs.
          </p>
          <a className="st-btn mx-auto mt-6" href="/">
            Kembali ke situs publik <ArrowUpRight size={14} />
          </a>
        </section>
      </main>
    );

  const all = inquiries.data ?? [];
  const counts = {
    new: all.filter(item => item.status === "new").length,
    reviewed: all.filter(item => item.status === "reviewed").length,
    closed: all.filter(item => item.status === "closed").length,
  };

  return (
    <DashboardLayout title="Inquiry Inbox" kicker="AN // Signals">
      <div className="space-y-6">
        <StudioHero
          kicker="AN // Studio / Inquiries"
          title={
            <>
              Conversion <em>inbox.</em>
            </>
          }
          lead={`${counts.new} inquiry baru dari jalur booking, remix, collaboration, dan licensing.`}
          actions={
            <StudioLink href="/studio">
              Kembali ke Content Studio <ArrowUpRight size={13} />
            </StudioLink>
          }
          aside={
            <Pill tone={counts.new ? "live" : "neutral"}>
              <CircleDot size={11} /> {counts.new} menunggu respons
            </Pill>
          }
        />

        <StatGrid>
          <Stat
            icon={Inbox}
            kicker="Baru"
            value={inquiries.isLoading ? "—" : counts.new}
            label="Belum ditinjau"
            tone="coral"
          />
          <Stat
            icon={Mail}
            kicker="Ditinjau"
            value={inquiries.isLoading ? "—" : counts.reviewed}
            label="Sedang diproses"
            tone="amber"
          />
          <Stat
            icon={ShieldCheck}
            kicker="Selesai"
            value={inquiries.isLoading ? "—" : counts.closed}
            label="Ditutup"
            tone="mint"
          />
          <Stat
            icon={CalendarClock}
            kicker="Total"
            value={inquiries.isLoading ? "—" : all.length}
            label="Seluruh permintaan masuk"
            tone="cyan"
          />
        </StatGrid>

        <section className="st-panel">
          <header className="st-panel-head">
            <div className="min-w-0">
              <Eyebrow icon={Inbox}>01 // Pipeline</Eyebrow>
              <h2 className="st-title">Permintaan masuk</h2>
              <p className="st-sub">
                {visible.length} dari {all.length} inquiry ditampilkan
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
                  placeholder="Cari nama, email, project…"
                  className="h-9 w-56 rounded-xl border-white/10 bg-black/25 pl-8 text-xs text-white placeholder:text-white/25 focus:border-cyan-200/50"
                />
              </div>
              <div className="flex gap-1 rounded-xl border border-white/10 bg-black/25 p-1">
                {(["all", ...statuses] as const).map(item => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setFilter(item)}
                    className={`rounded-lg px-2.5 py-1.5 text-[11px] capitalize transition ${filter === item ? "bg-cyan-200/15 text-cyan-100" : "text-white/45 hover:text-white"}`}
                  >
                    {item === "all" ? "Semua" : statusLabel[item]}
                  </button>
                ))}
              </div>
            </div>
          </header>

          <div className="st-panel-body space-y-3">
            {inquiries.isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="h-36 animate-pulse rounded-2xl bg-white/[0.04]"
                />
              ))
            ) : inquiries.isError ? (
              <div className="rounded-xl border border-red-200/15 bg-red-200/[0.05] p-5 text-sm text-red-100/75">
                Inquiry tidak dapat dimuat.
              </div>
            ) : visible.length ? (
              visible.map(inquiry => (
                <article
                  key={inquiry.id}
                  className="rounded-2xl border border-white/[0.08] bg-black/[0.16] p-5 transition hover:border-cyan-200/25"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Pill tone={statusTone[inquiry.status as Status]}>
                          {statusLabel[inquiry.status as Status] ??
                            inquiry.status}
                        </Pill>
                        <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-white/35">
                          {inquiry.inquiryType} · {inquiry.source}
                        </span>
                      </div>
                      <h3 className="mt-3 text-lg font-semibold tracking-tight text-white">
                        {inquiry.projectTitle}
                      </h3>
                      <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/45">
                        <span>{inquiry.name}</span>
                        <a
                          className="inline-flex items-center gap-1 text-cyan-100/70 hover:text-cyan-100"
                          href={`mailto:${inquiry.email}`}
                        >
                          <Mail size={11} /> {inquiry.email}
                        </a>
                        {inquiry.organization ? (
                          <span className="inline-flex items-center gap-1">
                            <Building2 size={11} /> {inquiry.organization}
                          </span>
                        ) : null}
                      </p>
                    </div>
                    <select
                      className="h-9 rounded-xl border border-white/10 bg-black/30 px-3 text-xs text-white outline-none focus:border-cyan-200/50"
                      value={inquiry.status}
                      onChange={event =>
                        update.mutate({
                          id: inquiry.id,
                          status: event.target.value as Status,
                        })
                      }
                      disabled={update.isPending}
                    >
                      {statuses.map(status => (
                        <option
                          key={status}
                          value={status}
                          className="bg-[#12141a]"
                        >
                          {statusLabel[status]}
                        </option>
                      ))}
                    </select>
                  </div>

                  <p className="mt-4 whitespace-pre-wrap rounded-xl bg-white/[0.025] p-4 text-sm leading-6 text-white/70">
                    {inquiry.message}
                  </p>

                  {inquiry.location ||
                  inquiry.timeline ||
                  inquiry.budgetContext ? (
                    <div className="mt-4 flex flex-wrap gap-2 border-t border-white/[0.07] pt-4">
                      {inquiry.location ? (
                        <Pill>
                          <MapPin size={10} /> {inquiry.location}
                        </Pill>
                      ) : null}
                      {inquiry.timeline ? (
                        <Pill>
                          <CalendarClock size={10} /> {inquiry.timeline}
                        </Pill>
                      ) : null}
                      {inquiry.budgetContext ? (
                        <Pill>
                          <Wallet size={10} /> {inquiry.budgetContext}
                        </Pill>
                      ) : null}
                    </div>
                  ) : null}

                  <a
                    className="st-btn mt-4 h-9"
                    href={`mailto:${inquiry.email}?subject=Re: ${encodeURIComponent(inquiry.projectTitle)}`}
                  >
                    <Mail size={13} /> Balas lewat email
                  </a>
                </article>
              ))
            ) : all.length ? (
              <EmptyState
                icon={Search}
                title="Tidak ada inquiry yang cocok."
                description="Ubah kata kunci atau filter status."
              />
            ) : (
              <EmptyState
                icon={Inbox}
                title="Belum ada inquiry."
                description="Form publik di /inquire akan mengirimkan request langsung ke inbox ini."
              />
            )}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
