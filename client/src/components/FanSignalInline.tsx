import { ArrowUpRight, Mail } from "lucide-react";
import { FormEvent, useState } from "react";
import { trpc } from "@/lib/trpc";

type SignalStatus =
  | { type: "success"; message: string }
  | { type: "error"; message: string }
  | null;

export default function FanSignalInline({
  source = "footer",
  compact = false,
}: {
  source?: "home" | "footer";
  compact?: boolean;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<SignalStatus>(null);
  const subscribe = trpc.fanSignal.subscribe.useMutation({
    onSuccess: result => {
      setEmail("");
      setStatus({
        type: "success",
        message: result.delivery === "synced"
          ? "Sinyal diterima. Update berikutnya akan dikirim ke email ini."
          : "Sinyal tersimpan. Email akan ikut tersinkron saat kanal pengiriman siap.",
      });
    },
    onError: error => {
      console.error("FanSignal error:", error);
      const message = error.message.toLowerCase();
      const friendlyMessage = message.includes("database") || message.includes("connect")
        ? "Daftar update sedang bermasalah di server. Coba lagi beberapa saat."
        : message.includes("invalid") || message.includes("email")
          ? "Format email belum benar. Cek lagi alamatnya."
          : "Sinyal belum terkirim. Coba lagi beberapa saat.";
      setStatus({ type: "error", message: friendlyMessage });
    },
  });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || subscribe.isPending) return;
    setStatus(null);
    subscribe.mutate({ email: normalizedEmail, source });
  };

  return (
    <form
      className={compact ? "nf-signal-form compact" : "nf-signal-form"}
      onSubmit={submit}
      noValidate={false}
    >
      <label htmlFor={`fan-email-${source}`}>EMAIL ADDRESS</label>
      <div>
        <Mail size={17} aria-hidden="true" />
        <input
          id={`fan-email-${source}`}
          type="email"
          required
          value={email}
          onChange={event => {
            setEmail(event.target.value);
            if (status) setStatus(null);
          }}
          placeholder="nama@kamu.com"
          autoComplete="email"
          aria-describedby={`fan-email-note-${source}`}
          aria-invalid={status?.type === "error"}
        />
        <button type="submit" disabled={subscribe.isPending}>
          {subscribe.isPending ? "SENDING" : "JOIN"}
          <ArrowUpRight size={16} aria-hidden="true" />
        </button>
      </div>
      <small id={`fan-email-note-${source}`} className={`nf-signal-note ${status ? `is-${status.type}` : ""}`} aria-live="polite">
        {status?.message || "Rilisan, visual, dan kabar live. Berhenti kapan saja."}
      </small>
    </form>
  );
}
