import { ArrowUpRight, CheckCircle2, Mail, Radio, ShieldCheck, Send, TriangleAlert } from "lucide-react";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";

const starterHtml = `<div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;background:#071114;color:#f2eadc;padding:40px 28px">
  <p style="font-size:12px;letter-spacing:.18em;color:#7fe6d0">AN // FAN SIGNAL</p>
  <h1 style="font-size:38px;line-height:1.05;margin:22px 0 16px">Night frequency update.</h1>
  <p style="font-size:16px;line-height:1.6;color:#c3c9c4">Tulis kabar rilisan, visual, atau live di sini.</p>
  <p style="font-size:13px;line-height:1.6;color:#8d9994">{{{RESEND_UNSUBSCRIBE_URL}}}</p>
</div>`;

type BroadcastForm = {
  name: string;
  subject: string;
  html: string;
  text: string;
};

function AccessGate({ authenticated }: { authenticated: boolean }) {
  return (
    <main className="grid min-h-[70vh] place-items-center p-6">
      <section className="max-w-md text-center">
        <ShieldCheck className="mx-auto mb-5 h-9 w-9 text-primary" />
        <h1 className="text-3xl font-semibold">Owner access required</h1>
        <p className="mt-3 text-muted-foreground">
          {authenticated
            ? "Broadcast Studio hanya bisa dipakai oleh owner situs."
            : "Sign in untuk mengelola Fan Signal dengan aman."}
        </p>
        {authenticated ? (
          <a className="mt-7 inline-flex items-center gap-2 underline" href="/">
            Return to public site <ArrowUpRight size={15} />
          </a>
        ) : (
          <Button className="mt-7" onClick={() => startLogin()}>
            Sign in to continue
          </Button>
        )}
      </section>
    </main>
  );
}

export default function BroadcastStudio() {
  const { user, loading } = useAuth();
  const [form, setForm] = useState<BroadcastForm>({
    name: "AN // Fan Signal Update",
    subject: "Akbar Nawasunda — night frequency update",
    html: starterHtml,
    text: "Akbar Nawasunda — night frequency update.\n\nTulis kabar rilisan, visual, atau live di sini.\n\nUnsubscribe: {{{RESEND_UNSUBSCRIBE_URL}}}",
  });
  const [broadcastId, setBroadcastId] = useState("");
  const [sendConfirmed, setSendConfirmed] = useState(false);
  const readiness = trpc.fanSignal.readiness.useQuery(undefined, {
    enabled: user?.role === "admin",
  });
  const createDraft = trpc.fanSignal.createBroadcastDraft.useMutation({
    onSuccess: result => {
      setBroadcastId(result.id ?? "");
      setSendConfirmed(false);
      toast.success("Draft broadcast berhasil dibuat di Resend.");
    },
    onError: error => toast.error(error.message || "Draft broadcast belum bisa dibuat."),
  });
  const sendBroadcast = trpc.fanSignal.sendBroadcast.useMutation({
    onSuccess: () => {
      setSendConfirmed(false);
      toast.success("Broadcast dikirim ke segment Fan Signal.");
    },
    onError: error => toast.error(error.message || "Broadcast belum bisa dikirim."),
  });

  if (loading) return <div className="min-h-screen grid place-items-center text-sm">Checking studio access…</div>;
  if (!user) return <AccessGate authenticated={false} />;
  if (user.role !== "admin") return <AccessGate authenticated />;

  const submitDraft = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createDraft.mutate(form);
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-xs font-mono tracking-[.16em] text-muted-foreground">AN // FAN SIGNAL</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Broadcast Studio</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Buat draft email untuk subscriber Fan Signal. Tidak ada email yang terkirim saat membuat draft; pengiriman selalu membutuhkan langkah konfirmasi kedua.
            </p>
          </div>
          <a className="inline-flex items-center gap-2 text-sm underline" href="/admin">
            Back to control room <ArrowUpRight size={15} />
          </a>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-xl border bg-card p-5">
            {readiness.data?.configured ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <TriangleAlert className="h-5 w-5 text-amber-500" />}
            <p className="mt-5 text-sm font-semibold">Resend connection</p>
            <p className="mt-1 text-sm text-muted-foreground">{readiness.isLoading ? "Checking…" : readiness.data?.configured ? "API ready in production" : "Waiting for API key"}</p>
          </article>
          <article className="rounded-xl border bg-card p-5">
            <Radio className="h-5 w-5 text-primary" />
            <p className="mt-5 text-sm font-semibold">Audience segment</p>
            <p className="mt-1 text-sm text-muted-foreground">{readiness.data?.segmentConfigured ? "Configured for Fan Signal" : "Segment ID belum dipasang"}</p>
          </article>
          <article className="rounded-xl border bg-card p-5">
            <Mail className="h-5 w-5 text-primary" />
            <p className="mt-5 text-sm font-semibold">Sender</p>
            <p className="mt-1 break-all text-sm text-muted-foreground">{readiness.data?.fromEmail || "Sender belum dikonfigurasi"}</p>
          </article>
        </section>

        <div className="grid gap-7 lg:grid-cols-[1.1fr_.9fr]">
          <form onSubmit={submitDraft} className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="mb-5 flex items-center gap-2"><Mail size={18} /><h2 className="font-semibold">Compose draft</h2></div>
            <label className="grid gap-2 text-sm">Internal name<Input required value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} /></label>
            <label className="mt-4 grid gap-2 text-sm">Subject<Input required value={form.subject} onChange={event => setForm({ ...form, subject: event.target.value })} /></label>
            <label className="mt-4 grid gap-2 text-sm">HTML body<Textarea required className="min-h-72 font-mono text-xs" value={form.html} onChange={event => setForm({ ...form, html: event.target.value })} /></label>
            <label className="mt-4 grid gap-2 text-sm">Plain-text fallback<Textarea className="min-h-32" value={form.text} onChange={event => setForm({ ...form, text: event.target.value })} /></label>
            <Button className="mt-6 w-full" disabled={createDraft.isPending || !readiness.data?.configured || !readiness.data?.segmentConfigured}>
              {createDraft.isPending ? "CREATING DRAFT…" : "CREATE RESEND DRAFT"}
              <ArrowUpRight size={16} />
            </Button>
            {(!readiness.data?.configured || !readiness.data?.segmentConfigured) && <p className="mt-3 text-xs text-amber-600">Lengkapi API key dan segment ID Production sebelum membuat broadcast.</p>}
          </form>

          <section className="rounded-xl border bg-card p-5">
            <div className="mb-5 flex items-center gap-2"><Send size={18} /><h2 className="font-semibold">Send control</h2></div>
            {broadcastId ? (
              <>
                <p className="text-sm text-muted-foreground">Draft siap dikirim. ID broadcast:</p>
                <code className="mt-3 block break-all rounded-lg bg-muted p-3 text-xs">{broadcastId}</code>
                <label className="mt-6 flex gap-3 rounded-lg border border-amber-500/40 bg-amber-500/5 p-3 text-sm">
                  <input type="checkbox" checked={sendConfirmed} onChange={event => setSendConfirmed(event.target.checked)} />
                  <span>Saya paham tombol berikut akan mengirim email ke subscriber yang masih opt-in.</span>
                </label>
                <Button className="mt-4 w-full" variant="outline" disabled={!sendConfirmed || sendBroadcast.isPending} onClick={() => sendBroadcast.mutate({ broadcastId, confirm: true })}>
                  {sendBroadcast.isPending ? "SENDING…" : "SEND BROADCAST"}
                  <Send size={16} />
                </Button>
                <button type="button" className="mt-3 w-full text-xs text-muted-foreground underline" onClick={() => { setBroadcastId(""); setSendConfirmed(false); }}>
                  Clear draft selection
                </button>
              </>
            ) : (
              <div className="rounded-lg border border-dashed p-6 text-sm leading-6 text-muted-foreground">
                Buat draft terlebih dahulu. Fan Signal menyimpan subscriber di Resend sebagai contact dan unsubscribe bawaan Resend tetap dihormati saat broadcast dikirim.
              </div>
            )}
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}
