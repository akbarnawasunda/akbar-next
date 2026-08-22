import { ArrowUpRight, Mail } from "lucide-react";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function FanSignalInline({
  source = "footer",
  compact = false,
}: {
  source?: "home" | "footer";
  compact?: boolean;
}) {
  const [email, setEmail] = useState("");
  const subscribe = trpc.fanSignal.subscribe.useMutation({
    onSuccess: () => {
      setEmail("");
      toast.success("Sinyal diterima. Sampai di drop berikutnya.");
    },
    onError: error => {
      console.error("FanSignal error:", error);
      const message = error.message.toLowerCase();
      if (message.includes("unauthorized")) {
        toast.error("Sesi berakhir. Silakan refresh halaman.");
      } else if (message.includes("database") || message.includes("connect")) {
        toast.error(
          "Database sedang bermasalah. Coba lagi dalam beberapa saat."
        );
      } else if (message.includes("email")) {
        toast.error("Format email tidak valid.");
      } else {
        toast.error("Sinyal belum terkirim. Silakan coba lagi.");
      }
    },
  });
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    subscribe.mutate({ email, source });
  };
  return (
    <form
      className={compact ? "nf-signal-form compact" : "nf-signal-form"}
      onSubmit={submit}
    >
      <label htmlFor={`fan-email-${source}`}>FAN SIGNAL / EMAIL</label>
      <div>
        <Mail size={17} />
        <input
          id={`fan-email-${source}`}
          type="email"
          required
          value={email}
          onChange={event => setEmail(event.target.value)}
          placeholder="nama@kamu.com"
          autoComplete="email"
        />
        <button type="submit" disabled={subscribe.isPending}>
          {subscribe.isPending ? "SENDING" : "JOIN"}
          <ArrowUpRight size={16} />
        </button>
      </div>
      <small>Rilisan, visual, dan kabar live. Berhenti kapan saja.</small>
    </form>
  );
}
