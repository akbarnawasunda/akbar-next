import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import OwnerLoginCard from "@/components/OwnerLoginCard";
import { trpc } from "@/lib/trpc";

const statuses = ["new", "reviewed", "closed"] as const;

export default function InquiryStudio() {
  const { user, loading } = useAuth();
  const utils = trpc.useUtils();
  const inquiries = trpc.inquiry.list.useQuery(undefined, { enabled: user?.role === "admin" });
  const update = trpc.inquiry.updateStatus.useMutation({
    onSuccess: async () => { toast.success("Status inquiry diperbarui."); await utils.inquiry.list.invalidate(); },
    onError: () => toast.error("Status inquiry belum bisa diperbarui."),
  });
  if (loading) return <div className="min-h-screen grid place-items-center text-sm">Checking studio access…</div>;
  if (!user) return <OwnerLoginCard title="Inquiry inbox" description="Sign in with the private owner credentials to review incoming artist inquiries." />;
  if (user.role !== "admin") return <main className="min-h-screen grid place-items-center p-6"><section className="max-w-md text-center"><h1 className="text-3xl font-semibold">Owner access required</h1><p className="mt-3 text-muted-foreground">Inquiry records are visible only to the site owner.</p><a className="mt-7 inline-flex underline" href="/">Return to public site</a></section></main>;
  const fresh = inquiries.data?.filter(item => item.status === "new").length ?? 0;
  return <DashboardLayout><main className="mx-auto max-w-5xl space-y-7"><header className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-mono tracking-[.15em] text-muted-foreground">AN // STUDIO / INQUIRIES</p><h1 className="mt-2 text-3xl font-semibold">Conversion inbox</h1><p className="mt-2 text-sm text-muted-foreground">{fresh} inquiry baru dari jalur booking, remix, collaboration, dan licensing.</p></div><a className="text-sm underline" href="/studio">Back to Studio</a></header>{inquiries.isLoading ? <p className="text-sm text-muted-foreground">Loading inquiries…</p> : inquiries.isError ? <p className="text-sm text-destructive">Inquiry tidak dapat dimuat.</p> : inquiries.data?.length ? <section className="space-y-4">{inquiries.data.map(inquiry => <article className="rounded-xl border bg-card p-5" key={inquiry.id}><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="font-mono text-xs uppercase tracking-[.12em] text-muted-foreground">{inquiry.inquiryType} · {inquiry.source}</p><h2 className="mt-2 text-xl font-semibold">{inquiry.projectTitle}</h2><p className="mt-1 text-sm text-muted-foreground">{inquiry.name} · {inquiry.email}{inquiry.organization ? ` · ${inquiry.organization}` : ""}</p></div><select className="rounded-md border bg-background px-3 py-2 text-sm" value={inquiry.status} onChange={event => update.mutate({ id: inquiry.id, status: event.target.value as typeof statuses[number] })} disabled={update.isPending}>{statuses.map(status => <option key={status} value={status}>{status}</option>)}</select></div><p className="mt-4 whitespace-pre-wrap text-sm leading-6">{inquiry.message}</p>{inquiry.location || inquiry.timeline || inquiry.budgetContext ? <p className="mt-4 border-t pt-3 text-xs text-muted-foreground">{[inquiry.location, inquiry.timeline, inquiry.budgetContext].filter(Boolean).join(" · ")}</p> : null}</article>)}</section> : <section className="rounded-xl border border-dashed p-8 text-sm text-muted-foreground">Belum ada inquiry. Form publik di `/inquire` akan mengirimkan request ke inbox ini.</section>}</main></DashboardLayout>;
}
