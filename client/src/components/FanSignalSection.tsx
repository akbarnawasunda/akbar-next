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
  eyebrow?: string;
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
  /**
   * Bahasa form (label, placeholder, status). EN ditambahkan supaya
   * `/en` punya form newsletter yang sama persis fungsinya dengan `/`,
   * bukan cuma tautan "CONTACT" tanpa pendaftaran nyata.
   */
  lang?: "id" | "en";
};

const formCopy = {
  id: {
    emailLabel: "EMAIL",
    placeholder: "nama@kamu.com",
    submit: "DAFTAR",
    sending: "MENGIRIM",
    defaultNote: "Berhenti kapan saja.",
    success: {
      synced: "Alamatmu sudah terdaftar. Kabar berikutnya akan dikirim ke email ini.",
      saved: "Alamatmu sudah tersimpan. Pengiriman akan aktif saat kanal email siap.",
    },
    error: {
      server: "Daftar update sedang bermasalah di server. Coba lagi beberapa saat.",
      invalid: "Format email belum benar. Cek lagi alamatnya.",
      generic: "Belum berhasil mendaftarkan alamat ini. Coba lagi beberapa saat.",
    },
  },
  en: {
    emailLabel: "EMAIL",
    placeholder: "you@example.com",
    submit: "SUBSCRIBE",
    sending: "SENDING",
    defaultNote: "Unsubscribe anytime.",
    success: {
      synced: "You're on the list. The next update goes straight to this address.",
      saved: "Address saved. Delivery turns on as soon as the email channel is ready.",
    },
    error: {
      server: "The update list is having server trouble. Try again shortly.",
      invalid: "That email address doesn't look right. Check it and try again.",
      generic: "Could not register this address yet. Try again shortly.",
    },
  },
} as const;

export default function FanSignalSection({
  source,
  eyebrow,
  title,
  description,
  indexLabel,
  className = "",
  anchorId = "signal",
  lang = "id",
}: FanSignalSectionProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<SignalStatus>(null);
  const t = formCopy[lang];
  const subscribe = trpc.fanSignal.subscribe.useMutation({
    onSuccess: result => {
      setEmail("");
      setStatus({
        type: "success",
        message:
          result.delivery === "synced" ? t.success.synced : t.success.saved,
      });
    },
    onError: error => {
      console.error("FanSignal error:", error);
      const message = error.message.toLowerCase();
      const friendlyMessage =
        message.includes("database") || message.includes("connect")
          ? t.error.server
          : message.includes("invalid") || message.includes("email")
            ? t.error.invalid
            : t.error.generic;
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
        {eyebrow ? <p className="fan-signal-eyebrow">{eyebrow}</p> : null}
        <h2 id={headingId}>{title}</h2>
        <p>{description}</p>
      </div>

      <form className="fan-signal-form" onSubmit={submit}>
        <label htmlFor={`fan-email-${source}`}>{t.emailLabel}</label>
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
            placeholder={t.placeholder}
            autoComplete="email"
            aria-describedby={noteId}
            aria-invalid={status?.type === "error"}
          />
          <button type="submit" disabled={subscribe.isPending}>
            {subscribe.isPending ? t.sending : t.submit}
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        </div>
        <small
          id={noteId}
          className={`fan-signal-note ${status ? `is-${status.type}` : ""}`}
          aria-live="polite"
        >
          {status?.message || t.defaultNote}
        </small>
      </form>
    </section>
  );
}

export { FAN_SIGNAL_SOURCES };
