/**
 * CONTROL ROOM v2 — ringkas, tenang, langsung paham.
 */
import {
  ArrowUpRight,
  Code2,
  Database,
  ExternalLink,
  FilePenLine,
  FolderOpen,
  Globe2,
  Inbox,
  ShieldCheck,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import {
  Eyebrow,
  Panel,
  Pill,
  Stat,
  StatGrid,
  StudioHero,
  StudioLink,
} from "@/studio/StudioKit";

type Tool = {
  icon: typeof Database;
  title: string;
  desc: string;
  meta: string;
  href: string;
  action: string;
  external?: boolean;
};

const tools: Tool[] = [
  {
    icon: FilePenLine,
    title: "Editor Konten",
    desc: "Tulis rilisan, atur visual, edit halaman. Semua dari satu tempat.",
    meta: "Utama · dipakai tiap hari",
    href: "/studio",
    action: "Buka editor",
  },
  {
    icon: FolderOpen,
    title: "Media Library",
    desc: "Upload foto, audio, video, PDF. Max 10MB per file.",
    meta: "Media · terkelola",
    href: "/assets",
    action: "Kelola media",
  },
  {
    icon: Inbox,
    title: "Inbox",
    desc: "Booking, remix, collab, licensing — balas langsung dari sini.",
    meta: "Sinyal masuk",
    href: "/studio/inquiries",
    action: "Lihat inbox",
  },
  {
    icon: Code2,
    title: "Source Code",
    desc: "Layout, warna, font, animasi — semua di GitHub.",
    meta: "GitHub → main → Vercel",
    href: "https://github.com/akbarnawasunda/akbar-next",
    action: "Buka repo",
    external: true,
  },
  {
    icon: Globe2,
    title: "Website Publik",
    desc: "Cek hasil akhir seperti yang dilihat pengunjung.",
    meta: "akbarnawasunda.my.id",
    href: "/",
    action: "Lihat website",
  },
  {
    icon: Database,
    title: "Vercel",
    desc: "Pantau build, deployment, domain, dan rollback.",
    meta: "Monitoring",
    href: "https://vercel.com/dashboard",
    action: "Buka Vercel",
    external: true,
  },
];

function ControlRoomStats() {
  const content = trpc.content.listAll.useQuery();
  const inquiries = trpc.inquiry.list.useQuery();
  const leads = trpc.fanSignal.list.useQuery();
  const published = content.data?.filter(i => i.isPublished).length ?? 0;
  const drafts = (content.data?.length ?? 0) - published;
  const newInquiries = inquiries.data?.filter(i => i.status === "new").length ?? 0;

  return (
    <StatGrid>
      <Stat icon={Database} kicker="Konten tayang" value={content.isLoading ? "—" : published} label={`${drafts} draft menunggu`} tone="neutral" />
      <Stat icon={Inbox} kicker="Inbox baru" value={inquiries.isLoading ? "—" : newInquiries} label="Belum dibalas" tone={newInquiries ? "warn" : "neutral"} href="/studio/inquiries" />
      <Stat icon={Database} kicker="Fan signal" value={leads.isLoading ? "—" : (leads.data?.length ?? 0)} label="Subscriber opt-in" tone="live" />
      <Stat icon={ShieldCheck} kicker="Status" value="Aktif" label="Semua jalur owner jalan" tone="live" />
    </StatGrid>
  );
}

function ToolCard({ tool }: { tool: Tool }) {
  const Icon = tool.icon;
  return (
    <a
      className="group rounded-[14px] border border-zinc-800 bg-zinc-900/50 p-5 transition hover:bg-zinc-900 hover:border-zinc-700"
      href={tool.href}
      target={tool.external ? "_blank" : undefined}
      rel={tool.external ? "noreferrer" : undefined}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-zinc-800 text-zinc-400 group-hover:bg-zinc-700 group-hover:text-white transition">
          <Icon size={16} />
        </span>
        <span className="text-zinc-600 group-hover:text-zinc-300 transition">
          {tool.external ? <ExternalLink size={14} /> : <ArrowUpRight size={14} />}
        </span>
      </div>
      <p className="mt-4 font-mono text-[10px] uppercase tracking-wider text-zinc-500">{tool.meta}</p>
      <h3 className="mt-1.5 text-[14px] font-semibold text-white">{tool.title}</h3>
      <p className="mt-1.5 text-[12px] leading-5 text-zinc-400">{tool.desc}</p>
      <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center justify-between">
        <span className="text-[11px] font-medium text-zinc-300">{tool.action}</span>
        <ArrowUpRight size={12} className="text-zinc-600 group-hover:text-white transition" />
      </div>
    </a>
  );
}

function AccessDenied() {
  return (
    <main className="studio-os grid min-h-dvh place-items-center p-6">
      <section className="st-panel relative z-[1] max-w-md p-8 text-center">
        <ShieldCheck size={32} className="mx-auto text-zinc-500" />
        <p className="st-eyebrow mt-5 justify-center">Owner only</p>
        <h1 className="mt-3 text-xl font-semibold text-white">Akses khusus owner.</h1>
        <p className="st-sub mx-auto mt-2">Halaman ini hanya untuk pemilik situs yang sudah login.</p>
        <a className="st-btn mx-auto mt-6" href="/">Kembali ke website <ArrowUpRight size={14} /></a>
      </section>
    </main>
  );
}

function AdminContent() {
  const { user } = useAuth();
  if (user?.role !== "admin") return <AccessDenied />;

  return (
    <div className="space-y-6">
      <StudioHero
        kicker="Studio / Ringkasan"
        title={<>Semua kendali <em>di satu tempat.</em></>}
        lead="Mau update konten, cek inbox, atau upload media — mulai dari sini. Simple, tanpa ribet."
        actions={
          <>
            <StudioLink href="/studio" variant="primary"><FilePenLine size={14} /> Buka editor</StudioLink>
            <StudioLink href="/" target="_blank" rel="noreferrer"><Globe2 size={14} /> Lihat website <ArrowUpRight size={12} /></StudioLink>
          </>
        }
        aside={<div className="flex flex-col gap-2"><Pill tone="live"><span className="studio-dot" /> Live</Pill><Pill tone="neutral">Edge · Vercel</Pill></div>}
      />

      <ControlRoomStats />

      <Panel eyebrow="Jalan pintas" title="Mau ngapain hari ini?" description="Pilih salah satu. Semua perubahan konten langsung tayang tanpa deploy ulang." actions={<Pill>{tools.length} jalur</Pill>}>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {tools.map(tool => <ToolCard key={tool.title} tool={tool} />)}
        </div>
      </Panel>

      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <Panel eyebrow="Cara kerja" title="3 langkah, selesai." description="Alur yang sama tiap kali biar gak ada yang kelewat.">
          <ol className="grid gap-3">
            {[
              { n: "01", t: "Tulis di editor", d: "Buka /studio, pilih tipe konten (rilisan, visual, jadwal, dll), isi form." },
              { n: "02", t: "Simpan & tayangkan", d: "Pilih 'Simpan & tayangkan' — langsung muncul di website publik." },
              { n: "03", t: "Cek hasilnya", d: "Buka website, cek di HP juga. Kalau oke, baru share linknya." },
            ].map(s => (
              <li key={s.n} className="flex gap-4 rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
                <b className="font-mono text-sm text-zinc-500">{s.n}</b>
                <span>
                  <strong className="block text-[13px] font-semibold text-white">{s.t}</strong>
                  <span className="mt-1 block text-[12px] leading-5 text-zinc-400">{s.d}</span>
                </span>
              </li>
            ))}
          </ol>
        </Panel>

        <Panel eyebrow="Catatan" title="Yang perlu diingat">
          <div className="space-y-3">
            <div className="rounded-xl border border-amber-900/30 bg-amber-950/20 p-4">
              <Eyebrow className="!text-amber-300">Broadcast paused</Eyebrow>
              <p className="mt-2 text-[12px] font-medium leading-5 text-amber-100">Jangan pakai fitur broadcast dulu.</p>
              <p className="mt-1 text-[11px] leading-5 text-zinc-400">Backend email masih dalam perbaikan. Fokus ke konten & inbox dulu.</p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
              <Eyebrow>Konten</Eyebrow>
              <p className="mt-2 text-[12px] leading-5 text-zinc-400">Semua isi website dibaca dari editor internal. Gak ada CMS eksternal, gak ada biaya tambahan.</p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
              <Eyebrow>Deploy</Eyebrow>
              <p className="mt-2 text-[12px] leading-5 text-zinc-400">Perubahan kode: GitHub → main → Vercel. Konten: langsung tayang tanpa deploy.</p>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}

export default function Admin() {
  return (
    <DashboardLayout title="Ringkasan" kicker="Studio">
      <AdminContent />
    </DashboardLayout>
  );
}
