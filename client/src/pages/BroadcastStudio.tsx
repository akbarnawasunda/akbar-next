/**
 * BROADCAST STUDIO v2 — lebih jujur, lebih sederhana.
 */
import {
  ArrowUpRight,
  CheckCircle2,
  Mail,
  Radio,
  ShieldCheck,
  Send,
  TriangleAlert,
} from "lucide-react";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import {
  EmptyState,
  Panel,
  Pill,
  Stat,
  StatGrid,
  StudioButton,
  StudioHero,
  StudioLink,
} from "@/studio/StudioKit";

const starterHtml = `<div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;background:#0a0a0b;color:#fafafa;padding:40px 28px;border:1px solid #27272a">
  <p style="font-size:11px;letter-spacing:.15em;color:#a1a1aa">AN // FAN SIGNAL</p>
  <h1 style="font-size:32px;line-height:1.1;margin:20px 0 14px">Night frequency update.</h1>
  <p style="font-size:14px;line-height:1.6;color:#a1a1aa">Tulis kabar rilisan, visual, atau live di sini.</p>
  <p style="font-size:11px;color:#71717a">{{{RESEND_UNSUBSCRIBE_URL}}}</p>
</div>`;

type BroadcastForm = { name: string; subject: string; html: string; text: string };

function AccessGate({ authenticated }: { authenticated: boolean }) {
  return (
    <main className="studio-os grid min-h-dvh place-items-center p-6">
      <section className="st-panel relative z-[1] max-w-md p-8 text-center">
        <ShieldCheck className="mx-auto h-8 w-8 text-zinc-500" />
        <h1 className="mt-4 text-xl font-semibold text-white">Owner only</h1>
        <p className="st-sub mx-auto mt-2">{authenticated ? "Broadcast hanya untuk owner." : "Masuk untuk kelola Fan Signal."}</p>
        {authenticated ? (
          <a className="st-btn mx-auto mt-6" href="/">Kembali <ArrowUpRight size={14} /></a>
        ) : (
          <button type="button" className="st-btn mx-auto mt-6" data-variant="primary" onClick={() => startLogin()}>Masuk</button>
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
  const readiness = trpc.fanSignal.readiness.useQuery(undefined, { enabled: user?.role === "admin" });
  const createDraft = trpc.fanSignal.createBroadcastDraft.useMutation({
    onSuccess: result => {
      setBroadcastId(result.id ?? "");
      setSendConfirmed(false);
      toast.success("Draft dibuat di Resend.");
    },
    onError: error => toast.error(error.message || "Gagal buat draft."),
  });
  const sendBroadcast = trpc.fanSignal.sendBroadcast.useMutation({
    onSuccess: () => {
      setSendConfirmed(false);
      toast.success("Broadcast terkirim.");
    },
    onError: error => toast.error(error.message || "Gagal kirim."),
  });

  if (loading)
    return (
      <div className="studio-os grid min-h-dvh place-items-center text-sm text-white/50">
        <span className="relative z-[1] font-mono text-[11px] uppercase tracking-wider">Memeriksa akses…</span>
      </div>
    );
  if (!user) return <AccessGate authenticated={false} />;
  if (user.role !== "admin") return <AccessGate authenticated />;

  const submitDraft = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createDraft.mutate(form);
  };

  return (
    <DashboardLayout title="Siaran" kicker="Studio">
      <div className="space-y-6">
        <StudioHero
          kicker="Studio / Siaran"
          title={<>Kirim kabar <em>ke fans.</em></>}
          lead="Buat draft email untuk subscriber Fan Signal. Draft tidak langsung kekirim — butuh konfirmasi kedua."
          actions={<StudioLink href="/admin">Kembali ke ringkasan <ArrowUpRight size={13} /></StudioLink>}
          aside={<Pill tone={readiness.data?.configured ? "live" : "draft"}>{readiness.data?.configured ? "Resend siap" : "Butuh setup"}</Pill>}
        />

        <StatGrid>
          <Stat icon={readiness.data?.configured ? CheckCircle2 : TriangleAlert} kicker="Resend" value={readiness.isLoading ? "—" : readiness.data?.configured ? "Siap" : "Setup"} label={readiness.data?.configured ? "API aktif" : "Butuh API key"} tone={readiness.data?.configured ? "live" : "warn"} />
          <Stat icon={Radio} kicker="Segment" value={readiness.data?.segmentConfigured ? "Terhubung" : "Kosong"} label={readiness.data?.segmentConfigured ? "Fan Signal linked" : "Segment belum dipasang"} tone={readiness.data?.segmentConfigured ? "live" : "warn"} />
          <Stat icon={Mail} kicker="Sender" value={readiness.data?.fromEmail ? "Set" : "—"} label={readiness.data?.fromEmail || "Sender belum set"} tone="neutral" />
        </StatGrid>

        <div className="grid items-start gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <Panel eyebrow="01 // Tulis" icon={Mail} title="Susun draft" description="Draft disimpan di Resend, belum terkirim.">
            <form onSubmit={submitDraft} className="space-y-4">
              <label className="grid gap-2 text-[12px] text-zinc-400">Nama internal<Input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="h-10 rounded-lg border-zinc-800 bg-zinc-900 text-white focus:border-zinc-700" /></label>
              <label className="grid gap-2 text-[12px] text-zinc-400">Subject<Input required value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className="h-10 rounded-lg border-zinc-800 bg-zinc-900 text-white focus:border-zinc-700" /></label>
              <label className="grid gap-2 text-[12px] text-zinc-400">HTML body<Textarea required className="min-h-64 rounded-lg border-zinc-800 bg-zinc-900 font-mono text-[11px] text-white focus:border-zinc-700" value={form.html} onChange={e => setForm({ ...form, html: e.target.value })} /></label>
              <label className="grid gap-2 text-[12px] text-zinc-400">Plain text<Textarea className="min-h-28 rounded-lg border-zinc-800 bg-zinc-900 text-[12px] text-white focus:border-zinc-700" value={form.text} onChange={e => setForm({ ...form, text: e.target.value })} /></label>
              <StudioButton type="submit" variant="primary" className="h-10 w-full" disabled={createDraft.isPending || !readiness.data?.configured || !readiness.data?.segmentConfigured}>{createDraft.isPending ? "Membuat…" : "Buat draft di Resend"} <ArrowUpRight size={14} /></StudioButton>
              {!readiness.data?.configured || !readiness.data?.segmentConfigured ? <p className="rounded-lg border border-amber-900/30 bg-amber-950/20 px-3 py-2.5 text-[11px] leading-5 text-amber-200/80">Lengkapi API key dan segment ID dulu sebelum buat broadcast.</p> : null}
            </form>
          </Panel>

          <Panel eyebrow="02 // Kirim" icon={Send} title="Kontrol kirim" description="Dua langkah: buat draft, lalu konfirmasi kirim.">
            {broadcastId ? (
              <div className="space-y-4">
                <p className="text-[12px] text-zinc-400">Draft siap. ID:</p>
                <code className="block break-all rounded-lg border border-zinc-800 bg-zinc-950 p-3 font-mono text-[11px] text-zinc-300">{broadcastId}</code>
                <label className="flex gap-3 rounded-lg border border-amber-900/30 bg-amber-950/20 p-3 text-[12px] leading-5 text-amber-100/80">
                  <input type="checkbox" className="mt-0.5 h-4 w-4 accent-white" checked={sendConfirmed} onChange={e => setSendConfirmed(e.target.checked)} />
                  <span>Saya paham ini akan kirim email ke semua subscriber yang masih opt-in.</span>
                </label>
                <StudioButton type="button" className="h-10 w-full" variant="primary" disabled={!sendConfirmed || sendBroadcast.isPending} onClick={() => sendBroadcast.mutate({ broadcastId, confirm: true })}>{sendBroadcast.isPending ? "Mengirim…" : "Kirim broadcast"} <Send size={14} /></StudioButton>
                <button type="button" className="w-full text-[11px] text-zinc-500 underline underline-offset-4 hover:text-zinc-300" onClick={() => { setBroadcastId(""); setSendConfirmed(false); }}>Bersihkan draft</button>
              </div>
            ) : (
              <EmptyState icon={Send} title="Belum ada draft." description="Buat draft dulu di sebelah kiri. Unsubscribe bawaan Resend tetap dihormati saat broadcast dikirim." />
            )}
          </Panel>
        </div>
      </div>
    </DashboardLayout>
  );
}
