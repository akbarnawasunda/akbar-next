import { FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";
import { NightFooter, NightHeader } from "@/components/NightFrequencyChrome";
import { verifiedArtistProfile } from "@/content/artistPlatform";
import { trpc } from "@/lib/trpc";
import { useSearch } from "wouter";
import "./EcosystemPages.css";
import "./Inquiry.css";

type InquiryType = "booking" | "remix" | "collaboration" | "licensing";
type InquirySource = "epk" | "release" | "universe" | "licensing";
const validTypes: InquiryType[] = [
  "booking",
  "remix",
  "collaboration",
  "licensing",
];
const validSources: InquirySource[] = [
  "epk",
  "release",
  "universe",
  "licensing",
];
const labels: Record<
  InquiryType,
  { kicker: string; title: string; intro: string }
> = {
  booking: {
    kicker: "BOOKING / PERFORMANCE",
    title: "BOOKING\nINQUIRY.",
    intro:
      "Kirim kebutuhan performance, acara, atau set. Tanggal dan ketersediaan dikonfirmasi setelah inquiry ditinjau.",
  },
  remix: {
    kicker: "REMIX / CUSTOM ARRANGEMENT",
    title: "REMIX\nINQUIRY.",
    intro:
      "Kirim brief, referensi, dan konteks penggunaan agar arah kreatif dapat ditinjau.",
  },
  collaboration: {
    kicker: "COLLABORATION",
    title: "KOLABORASI.",
    intro: "Jelaskan peran, karya, dan bentuk kerja sama yang kamu ajukan.",
  },
  licensing: {
    kicker: "LICENSING / USAGE",
    title: "MUSIC\nLICENSING.",
    intro:
      "Ajukan penggunaan musik untuk konten, brand, event, atau proyek lain.",
  },
};

export default function Inquiry() {
  const search = useSearch();
  const params = useMemo(() => new URLSearchParams(search), [search]);
  const initialType = validTypes.includes(params.get("type") as InquiryType)
    ? (params.get("type") as InquiryType)
    : "booking";
  const initialSource = validSources.includes(
    params.get("source") as InquirySource
  )
    ? (params.get("source") as InquirySource)
    : "epk";
  const [type, setType] = useState<InquiryType>(initialType);
  const [source] = useState<InquirySource>(initialSource);
  const [form, setForm] = useState({
    name: "",
    email: "",
    organization: "",
    projectTitle: "",
    location: "",
    timeline: "",
    budgetContext: "",
    message: "",
  });
  const [submissionState, setSubmissionState] = useState<"idle" | "success" | "error">("idle");
  const submit = trpc.inquiry.submit.useMutation({
    onSuccess: () => {
      setSubmissionState("success");
      toast.success("Inquiry diterima. Jalur owner akan meninjaunya.");
    },
    onError: error => {
      setSubmissionState("error");
      console.error("Inquiry error:", error);
      const message = error.message.toLowerCase();
      if (message.includes("database") || message.includes("connect")) {
        toast.error(
          "Database sedang bermasalah. Coba lagi dalam beberapa saat."
        );
      } else if (message.includes("email")) {
        toast.error("Format email tidak valid.");
      } else if (message.includes("invalid") || message.includes("expected")) {
        toast.error("Periksa kembali isian inquiry Anda.");
      } else {
        toast.error("Inquiry belum terkirim. Silakan coba lagi.");
      }
    },
  });
  const current = labels[type];
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmissionState("idle");
    submit.mutate({ inquiryType: type, source, ...form });
  };
  const resetSubmission = () => {
    setSubmissionState("idle");
    setForm({
      name: "",
      email: "",
      organization: "",
      projectTitle: "",
      location: "",
      timeline: "",
      budgetContext: "",
      message: "",
    });
  };
  const update = (key: keyof typeof form, value: string) =>
    setForm(previous => ({ ...previous, [key]: value }));
  return (
    <div className="nf-page an-inquiry-page">
      <NightHeader />
      <main>
        <section className="an-inquiry-hero">
          <p className="nf-page-eyebrow">{current.kicker}</p>
          <h1>{current.title}</h1>
          <p>{current.intro}</p>
          <div className="an-inquiry-signal">
            <span>STATUS</span>
            <strong>AKAN DITINJAU</strong>
          </div>
        </section>
        <section className="an-inquiry-shell">
          <div className="an-inquiry-contact-column">
            <p className="an-inquiry-column-label">CONTACT / WORK TOGETHER</p>
            <h2>LET&apos;S MAKE<br />A SIGNAL.</h2>
            <p className="an-inquiry-contact-copy">
              Booking, remix, collaboration, press, and music licensing requests are reviewed directly.
            </p>
            <div className="an-inquiry-roles" aria-label="Jenis inquiry">
              <span>BOOKING</span>
              <span>COLLABORATION</span>
              <span>PRESS</span>
              <span>GENERAL</span>
            </div>
            <a className="an-inquiry-email" href={`mailto:${verifiedArtistProfile.bookingEmail}`}>
              {verifiedArtistProfile.bookingEmail}
            </a>
            <p className="an-inquiry-contact-note">Bandung Barat — Indonesia</p>
          </div>
          <form className="an-inquiry-form" onSubmit={onSubmit}>
            <div className="an-inquiry-form-heading">
              <p className="an-inquiry-column-label">SEND A MESSAGE</p>
              <h2>{current.title.replace("\n", " ")}</h2>
            </div>
            <div className="an-inquiry-type-row">
              {validTypes.map(option => (
                <button
                  key={option}
                  type="button"
                  className={type === option ? "is-active" : ""}
                  onClick={() => setType(option)}
                >
                  {option}
                </button>
              ))}
            </div>
            <div className="an-inquiry-grid">
              <label>
                YOUR NAME
                <input
                  required
                  value={form.name}
                  onChange={event => update("name", event.target.value)}
                  placeholder="Nama kamu"
                />
              </label>
              <label>
                EMAIL ADDRESS
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={event => update("email", event.target.value)}
                  placeholder="nama@email.com"
                />
              </label>
              <label>
                ORGANIZATION / ARTIST NAME
                <input
                  value={form.organization}
                  onChange={event => update("organization", event.target.value)}
                  placeholder="Opsional"
                />
              </label>
              <label>
                PROJECT / EVENT TITLE
                <input
                  required
                  value={form.projectTitle}
                  onChange={event => update("projectTitle", event.target.value)}
                  placeholder="Nama project atau event"
                />
              </label>
              <label>
                LOCATION / MARKET
                <input
                  value={form.location}
                  onChange={event => update("location", event.target.value)}
                  placeholder="Kota, negara, atau online"
                />
              </label>
              <label>
                TIMELINE
                <input
                  value={form.timeline}
                  onChange={event => update("timeline", event.target.value)}
                  placeholder="Contoh: Mei 2026"
                />
              </label>
            </div>
            <label className="an-inquiry-full">
              BUDGET CONTEXT{" "}
              <input
                value={form.budgetContext}
                onChange={event => update("budgetContext", event.target.value)}
                placeholder="Opsional — boleh jelaskan konteks atau tulis 'discuss'"
              />
            </label>
            <label className="an-inquiry-full">
              BRIEF / MESSAGE
              <textarea
                required
                minLength={12}
                value={form.message}
                onChange={event => update("message", event.target.value)}
                placeholder="Jelaskan kebutuhan, referensi, link, deliverable, serta hal penting lain."
              />
            </label>
            <button className="an-inquiry-submit" disabled={submit.isPending}>
              {submit.isPending ? "MENGIRIM…" : "KIRIM INQUIRY"}
            </button>
            {submissionState === "success" ? (
              <div className="an-inquiry-feedback is-success" role="status" aria-live="polite">
                <strong>MESSAGE RECEIVED.</strong>
                <span>Terima kasih — pesanmu sudah masuk ke inbox Akbar Nawasunda.</span>
                <button type="button" onClick={resetSubmission}>KIRIM PESAN LAIN</button>
              </div>
            ) : null}
            {submissionState === "error" ? (
              <div className="an-inquiry-feedback is-error" role="alert">
                <strong>MESSAGE COULDN&apos;T BE SENT.</strong>
                <span>Coba lagi, atau kirim langsung ke {verifiedArtistProfile.bookingEmail}.</span>
              </div>
            ) : null}
            <p className="an-inquiry-note">
              Konfirmasi diberikan setelah inquiry ditinjau.
            </p>
          </form>
        </section>
      </main>
      <NightFooter />
    </div>
  );
}
