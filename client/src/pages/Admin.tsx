/**
 * CONTROL ROOM (/admin) — beranda workspace owner.
 * Ringkasan sinyal, jalur kerja, dan status delivery dalam satu layar.
 */
import {
  ArrowUpRight,
  CheckCircle2,
  Code2,
  Database,
  ExternalLink,
  FilePenLine,
  FolderOpen,
  Gauge,
  Globe2,
  Inbox,
  LayoutDashboard,
  Radio,
  ShieldCheck,
  Sparkles,
  Users,
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
  type StatTone,
} from "@/studio/StudioKit";

type Tool = {
  icon: typeof Database;
  eyebrow: string;
  title: string;
  copy: string;
  detail: string;
  href: string;
  action: string;
  external?: boolean;
  tone: StatTone;
};

const tools: Tool[] = [
  {
    icon: Database,
    eyebrow: "PRIMARY EDITOR",
    title: "Custom Website Editor",
    copy: "Edit hero, profile, EPK, releases, visuals, live signal, event, SEO, dan legal dari dashboard website.",
    detail: "OWNER-ONLY · DATABASE-BACKED",
    href: "/studio",
    action: "OPEN WEBSITE EDITOR",
    external: false,
    tone: "mint",
  },
  {
    icon: Inbox,
    eyebrow: "INBOX",
    title: "Inquiry Inbox",
    copy: "Review booking, remix, collaboration, dan licensing request dari satu alur kerja.",
    detail: "BOOKING · REMIX · COLLAB · LICENSING",
    href: "/studio/inquiries",
    action: "REVIEW INQUIRIES",
    tone: "coral",
  },
  {
    icon: FolderOpen,
    eyebrow: "MEDIA",
    title: "Asset Library",
    copy: "Upload dan kelola gambar, audio, video, atau PDF untuk kebutuhan site.",
    detail: "MAX 10 MB PER FILE",
    href: "/assets",
    action: "MANAGE ASSETS",
    tone: "violet",
  },
  {
    icon: Code2,
    eyebrow: "SYSTEM",
    title: "Code & Deploy",
    copy: "Layout, font, warna, motion, route, dan fitur baru dikerjakan melalui source code.",
    detail: "GITHUB → MAIN → VERCEL",
    href: "https://github.com/akbarnawasunda/akbar-next",
    action: "OPEN REPOSITORY",
    external: true,
    tone: "cyan",
  },
  {
    icon: Globe2,
    eyebrow: "PUBLIC",
    title: "Live Preview",
    copy: "Buka website publik untuk mengecek hasil konten dan deployment terbaru.",
    detail: "AKBARNAWASUNDA.MY.ID",
    href: "/",
    action: "VIEW PUBLIC SITE",
    tone: "cyan",
  },
  {
    icon: LayoutDashboard,
    eyebrow: "DELIVERY",
    title: "Vercel Dashboard",
    copy: "Pantau build, deployment, domain, environment, dan rollback production.",
    detail: "DEPLOYMENT MONITORING",
    href: "https://vercel.com/dashboard",
    action: "OPEN VERCEL",
    external: true,
    tone: "amber",
  },
];

const workflow = [
  {
    step: "01",
    title: "Edit di Content Studio",
    copy: "Hero, profile, EPK, release, visual, live signal, event, SEO, dan legal.",
  },
  {
    step: "02",
    title: "Save & publish",
    copy: "Pilih Simpan & tampilkan; situs publik membaca data terbaru tanpa redeploy.",
  },
  {
    step: "03",
    title: "Verify di preview",
    copy: "Buka situs publik, cek tampilan mobile, baru bagikan linknya.",
  },
];

function sparkFrom(seed: number, length = 12) {
  return Array.from({ length }, (_, index) => {
    const value = Math.sin(seed + index * 1.7) * 0.5 + 0.5;
    return 22 + value * 78;
  });
}

function ControlRoomStats() {
  const content = trpc.content.listAll.useQuery();
  const inquiries = trpc.inquiry.list.useQuery();
  const leads = trpc.fanSignal.list.useQuery();
  const published = content.data?.filter(item => item.isPublished).length ?? 0;
  const drafts = (content.data?.length ?? 0) - published;
  const newInquiries =
    inquiries.data?.filter(item => item.status === "new").length ?? 0;

  return (
    <StatGrid>
      <Stat
        icon={Database}
        kicker="Published entries"
        value={content.isLoading ? "—" : published}
        label={`${drafts} dokumen masih draft`}
        tone="cyan"
        spark={sparkFrom(published + 1)}
      />
      <Stat
        icon={Inbox}
        kicker="New inquiries"
        value={inquiries.isLoading ? "—" : newInquiries}
        label="Booking, remix, collab, licensing"
        tone="coral"
        href="/studio/inquiries"
        spark={sparkFrom(newInquiries + 3)}
      />
      <Stat
        icon={Users}
        kicker="Fan signal leads"
        value={leads.isLoading ? "—" : (leads.data?.length ?? 0)}
        label="Subscriber yang masih opt-in"
        tone="violet"
        spark={sparkFrom((leads.data?.length ?? 0) + 5)}
      />
      <Stat
        icon={CheckCircle2}
        kicker="Control room"
        value="LIVE"
        label="Semua jalur owner aktif"
        tone="mint"
        spark={sparkFrom(9)}
      />
    </StatGrid>
  );
}

function ToolCard({ tool }: { tool: Tool }) {
  const Icon = tool.icon;
  return (
    <a
      className="group relative overflow-hidden rounded-[18px] border border-white/[0.09] bg-white/[0.03] p-5 transition hover:-translate-y-0.5 hover:border-cyan-200/30 hover:bg-white/[0.05]"
      href={tool.href}
      target={tool.external ? "_blank" : undefined}
      rel={tool.external ? "noreferrer" : undefined}
    >
      <div className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-cyan-300/10 blur-3xl transition group-hover:bg-cyan-300/20" />
      <div className="relative flex items-start justify-between">
        <span className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.05] text-cyan-200 transition group-hover:border-cyan-200/35 group-hover:bg-cyan-200/10">
          <Icon size={17} />
        </span>
        <span className="text-white/25 transition group-hover:text-cyan-200">
          {tool.external ? (
            <ExternalLink size={15} />
          ) : (
            <ArrowUpRight size={15} />
          )}
        </span>
      </div>
      <p className="relative mt-6 font-mono text-[9px] uppercase tracking-[0.22em] text-cyan-100/50">
        {tool.eyebrow}
      </p>
      <h3 className="relative mt-1.5 text-[15px] font-semibold tracking-tight text-white">
        {tool.title}
      </h3>
      <p className="relative mt-2 text-xs leading-6 text-white/45">
        {tool.copy}
      </p>
      <div className="relative mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.07] pt-4">
        <small className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/30">
          {tool.detail}
        </small>
        <strong className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-cyan-100/80">
          {tool.action}
        </strong>
      </div>
    </a>
  );
}

function AccessDenied() {
  return (
    <main className="studio-os grid min-h-dvh place-items-center p-6">
      <section className="st-panel relative z-[1] max-w-md p-8 text-center">
        <ShieldCheck size={38} className="mx-auto text-cyan-200" />
        <p className="st-eyebrow mt-5 justify-center">AN // OWNER ACCESS</p>
        <h1 className="mt-3 text-2xl font-semibold text-white">
          Owner access required.
        </h1>
        <p className="st-sub mx-auto">
          Admin records are available only to the authenticated site owner.
        </p>
        <a className="st-btn mx-auto mt-6" href="/">
          RETURN TO PUBLIC SITE <ArrowUpRight size={14} />
        </a>
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
        kicker="AN // Control Room"
        title={
          <>
            Make the site <em>move.</em>
          </>
        }
        lead="Satu pintu untuk mengelola konten, menerima inquiry, menyiapkan asset, dan memeriksa delivery website Akbar Nawasunda."
        actions={
          <>
            <StudioLink href="/studio" variant="primary">
              <FilePenLine size={14} /> Buka Content Studio
            </StudioLink>
            <StudioLink href="/" target="_blank" rel="noreferrer">
              <Globe2 size={14} /> Situs publik <ArrowUpRight size={13} />
            </StudioLink>
          </>
        }
        aside={
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <Pill tone="live">
              <span className="studio-dot" /> Deployment healthy
            </Pill>
            <Pill tone="accent">
              <Gauge size={11} /> Edge · Vercel
            </Pill>
          </div>
        }
      />

      <ControlRoomStats />

      <Panel
        eyebrow="Workspace routes"
        icon={Sparkles}
        title="Everything in reach."
        description="Konten editorial masuk ke Content Studio; sistem dan desain tetap lewat source code."
        actions={<Pill>{tools.length} jalur</Pill>}
      >
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {tools.map(tool => (
            <ToolCard key={tool.title} tool={tool} />
          ))}
        </div>
      </Panel>

      <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <Panel
          eyebrow="The clean workflow"
          icon={CheckCircle2}
          title="Edit. Publish. Verify."
          description="Tiga langkah yang sama setiap kali, biar tidak ada perubahan yang bocor sebelum siap."
        >
          <ol className="grid gap-3">
            {workflow.map(item => (
              <li
                key={item.step}
                className="flex gap-4 rounded-2xl border border-white/[0.08] bg-black/[0.16] p-4 transition hover:border-cyan-200/25"
              >
                <b className="font-mono text-base text-cyan-200/70">
                  {item.step}
                </b>
                <span>
                  <strong className="block text-sm font-semibold text-white">
                    {item.title}
                  </strong>
                  <span className="mt-1 block text-xs leading-6 text-white/45">
                    {item.copy}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </Panel>

        <Panel eyebrow="System notes" icon={Radio} title="Status jalur">
          <div className="space-y-3">
            <div className="rounded-2xl border border-amber-200/20 bg-amber-200/[0.06] p-4">
              <Eyebrow className="!text-amber-200/80">
                <ShieldCheck size={12} /> Broadcast
              </Eyebrow>
              <p className="mt-2 text-xs font-semibold leading-5 text-amber-100/90">
                NEWSLETTER / BROADCAST IS CURRENTLY PAUSED.
              </p>
              <p className="mt-2 text-[11px] leading-5 text-white/40">
                Jangan gunakan jalur broadcast sampai backend delivery
                dinyatakan stabil.
              </p>
            </div>
            <div className="rounded-2xl border border-white/[0.08] bg-black/[0.16] p-4">
              <Eyebrow>
                <Database size={12} /> Content source
              </Eyebrow>
              <p className="mt-2 text-xs leading-6 text-white/50">
                Semua isi publik dibaca dari editor internal ini. Tidak ada CMS
                pihak ketiga, tidak ada langganan tambahan.
              </p>
            </div>
            <div className="rounded-2xl border border-white/[0.08] bg-black/[0.16] p-4">
              <Eyebrow>
                <Code2 size={12} /> Delivery
              </Eyebrow>
              <p className="mt-2 text-xs leading-6 text-white/50">
                Perubahan kode mengikuti alur GitHub → main → Vercel; konten
                tayang tanpa redeploy.
              </p>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}

export default function Admin() {
  return (
    <DashboardLayout title="Control Room" kicker="AN // Operate">
      <AdminContent />
    </DashboardLayout>
  );
}
