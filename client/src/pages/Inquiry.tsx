import { FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";
import { NightFooter, NightHeader } from "@/components/NightFrequencyChrome";
import { verifiedArtistProfile } from "@/content/artistPlatform";
import { trpc } from "@/lib/trpc";
import { useSearch } from "wouter";
import { Reveal } from "@/components/Reveal";
import "./EcosystemPages.css";
import "./Inquiry.css";
import "./InquiryStage.css";

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
    kicker: "Booking / performance",
    title: "Booking inquiry.",
    intro:
      "Kirim kebutuhan performance, acara, atau set. Tanggal dan ketersediaan dikonfirmasi setelah inquiry ditinjau.",
  },
  remix: {
    kicker: "Remix / custom arrangement",
    title: "Remix inquiry.",
    intro:
      "Kirim brief, referensi, dan konteks penggunaan agar arah kreatif dapat ditinjau.",
  },
  collaboration: {
    kicker: "Collaboration",
    title: "Kolaborasi.",
    intro: "Jelaskan peran, karya, dan bentuk kerja sama yang kamu ajukan.",
  },
  licensing: {
    kicker: "Licensing / usage",
    title: "Music licensing.",
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
      <NightHeader active="/inquire" />
      <main id="main-content" tabIndex={-1}>
        {/* Tipografi yang memimpin: judul, penjelasan, lalu fakta yang
            memang sudah berlaku — bukan janji waktu tinjauan. */}
        <section className="an-inq-hero" aria-labelledby="inquiry-title">
          <div className="an-inq-hero-copy">
            <p className="an-kicker">
              <span className="an-kicker-dot" aria-hidden="true" />
              {current.kicker}
            </p>
            <h1 id="inquiry-title">{current.title}</h1>
            <p className="an-inq-lede">{current.intro}</p>
          </div>
          <dl className="an-facts an-inq-facts">
            <div>
              <dt>Status</dt>
              <dd>Akan ditinjau</dd>
            </div>
            <div>
              <dt>Basis</dt>
              <dd>Bandung Barat — Indonesia</dd>
            </div>
            <div>
              <dt>Kontak langsung</dt>
              <dd>
                <a href={`mailto:${verifiedArtistProfile.bookingEmail}`}>
                  {verifiedArtistProfile.bookingEmail}
                </a>
              </dd>
            </div>
          </dl>
        </section>

        <Reveal>
          <section className="an-section an-inq-shell" aria-label="Formulir inquiry">
            <aside className="an-inq-context an-rise">
              <p className="an-meta">Sebelum mengirim</p>
              <h2 className="an-inq-context-title">
                Konteks singkat membuat brief cepat ditinjau.
              </h2>
              <ul className="an-inq-checklist">
                <li>Tujuan proyek dan bentuk kerja samanya.</li>
                <li>Referensi atau contoh yang paling dekat.</li>
                <li>Timeline dan target penggunaan.</li>
                <li>Deliverable yang diharapkan.</li>
              </ul>
              <p className="an-meta">Jenis inquiry</p>
              <p className="an-inq-roles">
                Booking · Remix · Kolaborasi · Licensing · Press
              </p>
              <a
                className="an-inq-email"
                href={`mailto:${verifiedArtistProfile.bookingEmail}`}
              >
                {verifiedArtistProfile.bookingEmail}
              </a>
            </aside>

            <form className="an-inq-form an-rise" onSubmit={onSubmit}>
              <div className="an-inq-form-head">
                <p className="an-meta">Detail inquiry</p>
                <h2 className="an-inq-form-title">{current.title}</h2>
              </div>

              <div
                className="an-inq-type-row"
                role="group"
                aria-label="Jenis inquiry"
              >
                {validTypes.map(option => (
                  <button
                    key={option}
                    type="button"
                    className={type === option ? "is-active" : ""}
                    aria-pressed={type === option}
                    onClick={() => setType(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>

              <fieldset className="an-inq-fieldset">
                <legend className="an-meta">Tentang kamu</legend>
                <div className="an-inq-grid">
                  <label>
                    <span>Nama</span>
                    <input
                      required
                      value={form.name}
                      onChange={event => update("name", event.target.value)}
                      placeholder="Nama kamu"
                    />
                  </label>
                  <label>
                    <span>Email</span>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={event => update("email", event.target.value)}
                      placeholder="nama@email.com"
                    />
                  </label>
                  <label>
                    <span>
                      Organisasi / nama artis{" "}
                      <small className="an-inq-optional">opsional</small>
                    </span>
                    <input
                      value={form.organization}
                      onChange={event =>
                        update("organization", event.target.value)
                      }
                      placeholder="Label, brand, atau kolektif"
                    />
                  </label>
                  <label>
                    <span>Judul proyek / acara</span>
                    <input
                      required
                      value={form.projectTitle}
                      onChange={event =>
                        update("projectTitle", event.target.value)
                      }
                      placeholder="Nama project atau event"
                    />
                  </label>
                </div>
              </fieldset>

              <fieldset className="an-inq-fieldset">
                <legend className="an-meta">Rencana</legend>
                <div className="an-inq-grid">
                  <label>
                    <span>
                      Lokasi / pasar{" "}
                      <small className="an-inq-optional">opsional</small>
                    </span>
                    <input
                      value={form.location}
                      onChange={event => update("location", event.target.value)}
                      placeholder="Kota, negara, atau online"
                    />
                  </label>
                  <label>
                    <span>
                      Timeline{" "}
                      <small className="an-inq-optional">opsional</small>
                    </span>
                    <input
                      value={form.timeline}
                      onChange={event => update("timeline", event.target.value)}
                      placeholder="Contoh: Mei 2026"
                    />
                  </label>
                  <label className="an-inq-full">
                    <span>
                      Konteks budget{" "}
                      <small className="an-inq-optional">opsional</small>
                    </span>
                    <input
                      value={form.budgetContext}
                      onChange={event =>
                        update("budgetContext", event.target.value)
                      }
                      placeholder="Boleh jelaskan konteks atau tulis 'discuss'"
                    />
                  </label>
                </div>
              </fieldset>

              <fieldset className="an-inq-fieldset">
                <legend className="an-meta">Brief</legend>
                <label className="an-inq-full">
                  <span>
                    Kebutuhan, referensi, dan deliverable{" "}
                    <small className="an-inq-optional">wajib</small>
                  </span>
                  <textarea
                    required
                    minLength={12}
                    value={form.message}
                    onChange={event => update("message", event.target.value)}
                    placeholder="Jelaskan kebutuhan, referensi, link, deliverable, serta hal penting lain."
                  />
                </label>
              </fieldset>

              <div className="an-inq-submit-row">
                <button
                  className="an-btn an-btn--solid an-inq-submit"
                  disabled={submit.isPending}
                >
                  {submit.isPending ? "MENGIRIM…" : "KIRIM INQUIRY"}
                </button>
                <p className="an-inq-note">
                  Konfirmasi diberikan setelah inquiry ditinjau.
                </p>
              </div>

              {submissionState === "success" ? (
                <div
                  className="an-inq-feedback is-success"
                  role="status"
                  aria-live="polite"
                >
                  <strong>Pesan diterima.</strong>
                  <span>
                    Terima kasih — pesanmu sudah masuk ke inbox Akbar Nawasunda.
                  </span>
                  <button type="button" onClick={resetSubmission}>
                    Kirim pesan lain
                  </button>
                </div>
              ) : null}
              {submissionState === "error" ? (
                <div className="an-inq-feedback is-error" role="alert">
                  <strong>Pesan belum terkirim.</strong>
                  <span>
                    Coba lagi, atau kirim langsung ke{" "}
                    {verifiedArtistProfile.bookingEmail}.
                  </span>
                </div>
              ) : null}
            </form>
          </section>
        </Reveal>
      </main>
      <NightFooter />
    </div>
  );
}
