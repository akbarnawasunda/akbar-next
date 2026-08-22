import {
  ArrowUpRight,
  FilePenLine,
  FolderOpen,
  Inbox,
  LayoutDashboard,
  ShieldCheck,
  Users,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

function AdminContent() {
  const { user } = useAuth();
  const content = trpc.content.listAll.useQuery(undefined, {
    enabled: user?.role === "admin",
  });
  const inquiries = trpc.inquiry.list.useQuery(undefined, {
    enabled: user?.role === "admin",
  });
  const leads = trpc.fanSignal.list.useQuery(undefined, {
    enabled: user?.role === "admin",
  });

  if (user?.role !== "admin") {
    return (
      <main className="grid min-h-[70vh] place-items-center p-6">
        <section className="max-w-md text-center">
          <ShieldCheck className="mx-auto mb-5 h-10 w-10 text-primary" />
          <h1 className="text-3xl font-semibold tracking-tight">
            Owner access required
          </h1>
          <p className="mt-3 text-muted-foreground">
            Admin records are available only to the authenticated site owner.
          </p>
          <a
            className="mt-7 inline-flex items-center gap-2 text-sm underline"
            href="/"
          >
            Return to public site <ArrowUpRight size={15} />
          </a>
        </section>
      </main>
    );
  }

  const published = content.data?.filter(item => item.isPublished).length ?? 0;
  const newInquiries =
    inquiries.data?.filter(item => item.status === "new").length ?? 0;

  return (
    <main className="mx-auto max-w-6xl space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-xs font-mono tracking-[.16em] text-muted-foreground">
            AN // ADMIN
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Owner control room
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Kelola konten publik, inbox inquiry, Fan Signal, dan asset melalui
            session auth serta API internal.
          </p>
        </div>
        <a
          className="inline-flex items-center gap-2 text-sm underline"
          href="/"
          target="_blank"
          rel="noreferrer"
        >
          Open public site <ArrowUpRight size={15} />
        </a>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-xl border bg-card p-5">
          <LayoutDashboard className="h-5 w-5 text-primary" />
          <p className="mt-5 text-3xl font-semibold">
            {content.isLoading ? "—" : published}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Published entries
          </p>
        </article>
        <article className="rounded-xl border bg-card p-5">
          <Inbox className="h-5 w-5 text-primary" />
          <p className="mt-5 text-3xl font-semibold">
            {inquiries.isLoading ? "—" : newInquiries}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">New inquiries</p>
        </article>
        <article className="rounded-xl border bg-card p-5">
          <Users className="h-5 w-5 text-primary" />
          <p className="mt-5 text-3xl font-semibold">
            {leads.isLoading ? "—" : (leads.data?.length ?? 0)}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Fan Signal leads</p>
        </article>
        <a
          className="rounded-xl border bg-card p-5 transition-colors hover:bg-accent"
          href="/assets"
        >
          <FolderOpen className="h-5 w-5 text-primary" />
          <p className="mt-5 text-base font-semibold">
            Asset Library <ArrowUpRight className="inline h-4 w-4" />
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload and reference managed media.
          </p>
        </a>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        <a
          className="group rounded-xl border bg-card p-6 transition-colors hover:bg-accent"
          href="/studio"
        >
          <FilePenLine className="h-5 w-5 text-primary" />
          <h2 className="mt-5 text-xl font-semibold">Content Studio</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Publish and update owner-managed entries rendered by the public
            platform.
          </p>
          <span className="mt-5 inline-flex items-center gap-2 text-sm underline">
            Manage content <ArrowUpRight size={15} />
          </span>
        </a>
        <a
          className="group rounded-xl border bg-card p-6 transition-colors hover:bg-accent"
          href="/studio/inquiries"
        >
          <Inbox className="h-5 w-5 text-primary" />
          <h2 className="mt-5 text-xl font-semibold">Inquiry Inbox</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Review booking, remix, collaboration, and licensing requests, then
            update their status.
          </p>
          <span className="mt-5 inline-flex items-center gap-2 text-sm underline">
            Review inquiries <ArrowUpRight size={15} />
          </span>
        </a>
      </section>
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
