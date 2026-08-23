import {
  ArrowUpRight,
  CheckCircle2,
  Code2,
  Database,
  ExternalLink,
  FolderOpen,
  Globe2,
  Inbox,
  LayoutDashboard,
  ShieldCheck,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import "./Admin.css";

const tools = [
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
    tone: "bone",
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
    tone: "graphite",
  },
];

function ControlRoomStats() {
  const content = trpc.content.listAll.useQuery();
  const inquiries = trpc.inquiry.list.useQuery();
  const leads = trpc.fanSignal.list.useQuery();
  const published = content.data?.filter(item => item.isPublished).length ?? 0;
  const newInquiries = inquiries.data?.filter(item => item.status === "new").length ?? 0;

  return (
    <section className="an-control-room-stats" aria-label="Workspace status">
      <article>
        <span className="an-stat-icon"><LayoutDashboard size={17} /></span>
        <strong>{content.isLoading ? "—" : published}</strong>
        <small>PUBLISHED ENTRIES</small>
      </article>
      <article>
        <span className="an-stat-icon"><Inbox size={17} /></span>
        <strong>{inquiries.isLoading ? "—" : newInquiries}</strong>
        <small>NEW INQUIRIES</small>
      </article>
      <article>
        <span className="an-stat-icon"><ShieldCheck size={17} /></span>
        <strong>{leads.isLoading ? "—" : (leads.data?.length ?? 0)}</strong>
        <small>FAN SIGNAL LEADS</small>
      </article>
      <article>
        <span className="an-stat-icon"><CheckCircle2 size={17} /></span>
        <strong>LIVE</strong>
        <small>CONTROL ROOM STATUS</small>
      </article>
    </section>
  );
}

function ToolCard({ tool }: { tool: (typeof tools)[number] }) {
  const Icon = tool.icon;
  return (
    <a
      className={`an-control-tool an-control-tool-${tool.tone}`}
      href={tool.href}
      target={tool.external ? "_blank" : undefined}
      rel={tool.external ? "noreferrer" : undefined}
    >
      <div className="an-control-tool-top">
        <span className="an-control-tool-icon"><Icon size={18} /></span>
        {tool.external ? <ExternalLink size={15} /> : <ArrowUpRight size={15} />}
      </div>
      <span className="an-control-tool-eyebrow">{tool.eyebrow}</span>
      <h2>{tool.title}</h2>
      <p>{tool.copy}</p>
      <div className="an-control-tool-bottom">
        <small>{tool.detail}</small>
        <strong>{tool.action}</strong>
      </div>
    </a>
  );
}

function AdminContent() {
  const { user } = useAuth();

  if (user?.role !== "admin") {
    return (
      <main className="an-control-access">
        <section>
          <ShieldCheck size={42} />
          <p>AN // OWNER ACCESS</p>
          <h1>Owner access required.</h1>
          <span>Admin records are available only to the authenticated site owner.</span>
          <a href="/">RETURN TO PUBLIC SITE <ArrowUpRight size={15} /></a>
        </section>
      </main>
    );
  }

  return (
    <main className="an-control-room">
      <header className="an-control-room-hero">
        <div>
          <p className="an-control-room-kicker"><span /> AN // CONTROL ROOM</p>
          <h1>MAKE THE SITE<br /><em>MOVE.</em></h1>
          <p className="an-control-room-intro">
            Satu pintu untuk mengelola konten, menerima inquiry, menyiapkan asset,
            dan memeriksa delivery website Akbar Nawasunda.
          </p>
        </div>
        <a className="an-control-public-link" href="/" target="_blank" rel="noreferrer">
          <Globe2 size={15} /> OPEN PUBLIC SITE <ArrowUpRight size={15} />
        </a>
      </header>

      <ControlRoomStats />

      <section className="an-control-section-heading">
        <div>
          <p className="an-control-room-kicker"><span /> WORKSPACE ROUTES</p>
          <h2>EVERYTHING<br /><em>IN REACH.</em></h2>
        </div>
        <p>Gunakan jalur yang sesuai dengan jenis perubahan. Konten editorial masuk ke Custom Website Editor; sistem dan desain tetap melalui code.</p>
      </section>

      <section className="an-control-tool-grid" aria-label="Workspace tools">
        {tools.map(tool => <ToolCard key={tool.title} tool={tool} />)}
      </section>

      <section className="an-control-workflow">
        <div>
          <p className="an-control-room-kicker"><span /> THE CLEAN WORKFLOW</p>
          <h2>EDIT.<br />PUBLISH.<br /><em>VERIFY.</em></h2>
        </div>
        <ol>
          <li><b>01</b><span><strong>EDIT IN WEBSITE EDITOR</strong>Untuk hero, profile, EPK, release, visual, live signal, event, SEO, dan legal.</span></li>
          <li><b>02</b><span><strong>SAVE & PUBLISH</strong>Pilih Save & publish; public site membaca data terbaru tanpa redeploy.</span></li>
          <li><b>03</b><span><strong>VERIFY IN PREVIEW</strong>Buka public site dan cek mobile sebelum membagikan link.</span></li>
        </ol>
      </section>

      <footer className="an-control-room-note">
        <span><ShieldCheck size={15} /> NEWSLETTER / BROADCAST IS CURRENTLY PAUSED.</span>
        <small>Jangan gunakan jalur broadcast sampai backend delivery dinyatakan stabil.</small>
      </footer>
    </main>
  );
}

export default function Admin() {
  return (
    <DashboardLayout>
      <AdminContent />
    </DashboardLayout>
  );
}
