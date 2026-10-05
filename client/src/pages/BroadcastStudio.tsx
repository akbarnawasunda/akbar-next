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
    <main className="studio-os grid min-h-dvh place-items-center p-6">
      <section className="st-panel relative z-[1] max-w-md p-8 text-center">
        <ShieldCheck className="mx-auto h-9 w-9 text-cyan-200" />
        <h1 className="mt-5 text-2xl font-semibold text-white">
          Owner access required
        </h1>
        <p className="st-sub mx-auto">
          {authenticated
            ? "Broadcast Studio hanya bisa dipakai oleh owner situs."
            : "Masuk untuk mengelola Fan Signal dengan aman."}
        </p>
        {authenticated ? (
          <a className="st-btn mx-auto mt-6" href="/">
            Kembali ke situs publik <ArrowUpRight size={14} />
          </a>
        ) : (
          <button
            type="button"
            className="st-btn mx-auto mt-6"
            data-variant="primary"
            onClick={() => startLogin()}
          >
            Masuk untuk melanjutkan
          </button>
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
    onError: error =>
      toast.error(error.message || "Draft broadcast belum bisa dibuat."),
  });
  const sendBroadcast = trpc.fanSignal.sendBroadcast.useMutation({
    onSuccess: () => {
      setSendConfirmed(false);
      toast.success("Broadcast dikirim ke segment Fan Signal.");
    },
    onError: error =>
      toast.error(error.message || "Broadcast belum bisa dikirim."),
  });

  if (loading)
    return (
      <div className="studio-os grid min-h-dvh place-items-center text-sm text-white/50">
        <span className="relative z-[1] font-mono text-[11px] uppercase tracking-[0.3em]">
          Memeriksa akses studio…
        </span>
      </div>
    );
  if (!user) return <AccessGate authenticated={false} />;
  if (user.role !== "admin") return <AccessGate authenticated />;

  const submitDraft = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createDraft.mutate(form);
  };

  return (
    <DashboardLayout title="Broadcast" kicker="AN // Signals">
      <div className="space-y-6">
        <StudioHero
          kicker="AN // Fan Signal"
          title={
            <>
              Broadcast <em>studio.</em>
            </>
          }
          lead="Buat draft email untuk subscriber Fan Signal. Tidak ada email yang terkirim saat membuat draft; pengiriman selalu membutuhkan langkah konfirmasi kedua."
          actions={
            <StudioLink href="/admin">
              Kembali ke Control Room <ArrowUpRight size={13} />
            </StudioLink>
          }
          aside={
            <Pill tone={readiness.data?.configured ? "live" : "draft"}>
              {readiness.data?.configured
                ? "Resend siap"
                : "Menunggu konfigurasi"}
            </Pill>
          }
        />

        <StatGrid>
          <Stat
            icon={readiness.data?.configured ? CheckCircle2 : TriangleAlert}
            kicker="Resend"
            value={
              readiness.isLoading
                ? "\u2014"
                : readiness.data?.configured
                  ? "READY"
                  : "SETUP"
            }
            label={
              readiness.data?.configured
                ? "API aktif di production"
                : "Menunggu API key"
            }
            tone={readiness.data?.configured ? "mint" : "amber"}
          />
          <Stat
            icon={Radio}
            kicker="Segment"
            value={readiness.data?.segmentConfigured ? "LINKED" : "EMPTY"}
            label={
              readiness.data?.segmentConfigured
                ? "Terhubung ke Fan Signal"
                : "Segment ID belum dipasang"
            }
            tone={readiness.data?.segmentConfigured ? "cyan" : "amber"}
          />
          <Stat
            icon={Mail}
            kicker="Sender"
            value={readiness.data?.fromEmail ? "SET" : "—"}
            label={readiness.data?.fromEmail || "Sender belum dikonfigurasi"}
            tone="violet"
          />
        </StatGrid>

        <div className="grid items-start gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <Panel
            eyebrow="01 // Compose"
            icon={Mail}
            title="Susun draft"
            description="Isi disimpan sebagai draft di Resend, belum terkirim ke siapa pun."
          >
            <form onSubmit={submitDraft} className="space-y-4">
              <label className="grid gap-2 text-xs text-white/60">
                Nama internal
                <Input
                  required
                  value={form.name}
                  onChange={event =>
                    setForm({ ...form, name: event.target.value })
                  }
                  className="h-11 rounded-xl border-white/10 bg-black/25 text-white focus:border-cyan-200/50"
                />
              </label>
              <label className="grid gap-2 text-xs text-white/60">
                Subject
                <Input
                  required
                  value={form.subject}
                  onChange={event =>
                    setForm({ ...form, subject: event.target.value })
                  }
                  className="h-11 rounded-xl border-white/10 bg-black/25 text-white focus:border-cyan-200/50"
                />
              </label>
              <label className="grid gap-2 text-xs text-white/60">
                HTML body
                <Textarea
                  required
                  className="min-h-72 rounded-xl border-white/10 bg-black/25 font-mono text-[11px] text-white focus:border-cyan-200/50"
                  value={form.html}
                  onChange={event =>
                    setForm({ ...form, html: event.target.value })
                  }
                />
              </label>
              <label className="grid gap-2 text-xs text-white/60">
                Plain-text fallback
                <Textarea
                  className="min-h-32 rounded-xl border-white/10 bg-black/25 text-xs text-white focus:border-cyan-200/50"
                  value={form.text}
                  onChange={event =>
                    setForm({ ...form, text: event.target.value })
                  }
                />
              </label>
              <StudioButton
                type="submit"
                variant="primary"
                className="h-11 w-full"
                disabled={
                  createDraft.isPending ||
                  !readiness.data?.configured ||
                  !readiness.data?.segmentConfigured
                }
              >
                {createDraft.isPending
                  ? "MEMBUAT DRAFT…"
                  : "BUAT DRAFT DI RESEND"}
                <ArrowUpRight size={15} />
              </StudioButton>
              {!readiness.data?.configured ||
              !readiness.data?.segmentConfigured ? (
                <p className="rounded-xl border border-amber-200/20 bg-amber-200/[0.06] px-3 py-2.5 text-[11px] leading-5 text-amber-100/80">
                  Lengkapi API key dan segment ID Production sebelum membuat
                  broadcast.
                </p>
              ) : null}
            </form>
          </Panel>

          <Panel
            eyebrow="02 // Send control"
            icon={Send}
            title="Kontrol pengiriman"
            description="Dua langkah: buat draft, lalu konfirmasi kirim secara sadar."
          >
            {broadcastId ? (
              <div className="space-y-4">
                <p className="text-xs text-white/50">
                  Draft siap dikirim. ID broadcast:
                </p>
                <code className="block break-all rounded-xl border border-white/10 bg-black/30 p-3 font-mono text-[11px] text-cyan-100/80">
                  {broadcastId}
                </code>
                <label className="flex gap-3 rounded-xl border border-amber-300/25 bg-amber-300/[0.06] p-3 text-xs leading-5 text-amber-100/85">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 accent-amber-300"
                    checked={sendConfirmed}
                    onChange={event => setSendConfirmed(event.target.checked)}
                  />
                  <span>
                    Saya paham tombol berikut akan mengirim email ke subscriber
                    yang masih opt-in.
                  </span>
                </label>
                <StudioButton
                  type="button"
                  className="h-11 w-full"
                  disabled={!sendConfirmed || sendBroadcast.isPending}
                  onClick={() =>
                    sendBroadcast.mutate({ broadcastId, confirm: true })
                  }
                >
                  {sendBroadcast.isPending ? "MENGIRIM…" : "KIRIM BROADCAST"}
                  <Send size={15} />
                </StudioButton>
                <button
                  type="button"
                  className="w-full text-[11px] text-white/35 underline underline-offset-4 hover:text-white/60"
                  onClick={() => {
                    setBroadcastId("");
                    setSendConfirmed(false);
                  }}
                >
                  Bersihkan pilihan draft
                </button>
              </div>
            ) : (
              <EmptyState
                icon={Send}
                title="Belum ada draft terpilih."
                description="Buat draft terlebih dahulu. Fan Signal menyimpan subscriber di Resend sebagai contact, dan unsubscribe bawaan Resend tetap dihormati saat broadcast dikirim."
              />
            )}
          </Panel>
        </div>
      </div>
    </DashboardLayout>
  );
}
