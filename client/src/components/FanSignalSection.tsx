import { ArrowRight, Mail } from "lucide-react";
import { type FormEvent, type ReactNode, useState } from "react";
import { FAN_SIGNAL_SOURCES, type FanSignalSource } from "@shared/types";
import { trpc } from "@/lib/trpc";
import "./FanSignalSection.css";

type SignalStatus =
  | { type: "success"; message: string }
  | { type: "error"; message: string }
  | null;

type FanSignalSectionProps = {
  source: FanSignalSource;
  eyebrow: string;
  title: ReactNode;
  description: string;
  indexLabel?: string;
  className?: string;
  /**
   * Id anchor section. Default `signal` supaya tautan "SIGNAL" di navigasi
   * tetap mendarat di sini. Halaman yang sudah punya section `#signal`
   * sendiri (beranda) wajib mengirim id lain agar tidak ada id ganda.
   */
  anchorId?: string;
};

export default function FanSignalSection({
  source,
  eyebrow,
  title,
  description,
  indexLabel,
  className = "",
  anchorId = "signal",
}: FanSignalSectionProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<SignalStatus>(null);
  const subscribe = trpc.fanSignal.subscribe.useMutation({
    onSuccess: result => {
      setEmail("");
      setStatus({
        type: "success",
        message:
          result.delivery === "synced"
            ? "Alamatmu sudah terdaftar. Kabar berikutnya akan dikirim ke email ini."
            : "Alamatmu sudah tersimpan. Pengiriman akan aktif saat kanal email siap.",
      });
    },
    onError: error => {
      console.error("FanSignal error:", error);
      const message = error.message.toLowerCase();
      const friendlyMessage =
        message.includes("database") || message.includes("connect")
          ? "Daftar update sedang bermasalah di server. Coba lagi beberapa saat."
          : message.includes("invalid") || message.includes("email")
            ? "Format email belum benar. Cek lagi alamatnya."
            : "Belum berhasil mendaftarkan alamat ini. Coba lagi beberapa saat.";
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

  const headingId = `fan-signal-heading-${source}`;
  const noteId = `fan-email-note-${source}`;
  const sectionClassName = ["fan-signal-section", className]
    .filter(Boolean)
    .join(" ");

  return (
    <section
      className={sectionClassName}
      id={anchorId}
      data-fan-signal-source={source}
      aria-labelledby={headingId}
    >
      {indexLabel ? (
        <div className="fan-signal-index" aria-hidden="true">
          <span>01</span>
          <i />
          <span>{indexLabel}</span>
        </div>
      ) : null}

      <div className="fan-signal-copy">
        <p className="fan-signal-eyebrow">{eyebrow}</p>
        <h2 id={headingId}>{title}</h2>
        <p>{description}</p>
      </div>

      <form
        className="fan-signal-form"
        onSubmit={submit}
      >
        <label htmlFor={`fan-email-${source}`}>EMAIL</label>
        <div className="fan-signal-input-row">
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
            aria-describedby={noteId}
            aria-invalid={status?.type === "error"}
          />
          <button type="submit" disabled={subscribe.isPending}>
            {subscribe.isPending ? "MENGIRIM" : "DAFTAR"}
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        </div>
        <small
          id={noteId}
          className={`fan-signal-note ${status ? `is-${status.type}` : ""}`}
          aria-live="polite"
        >
          {status?.message ||
            "Kabar musik, video, dan jadwal. Berhenti kapan saja."}
        </small>
      </form>
    </section>
  );
}

export { FAN_SIGNAL_SOURCES };
