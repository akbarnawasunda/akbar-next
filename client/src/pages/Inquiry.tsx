import { useMemo, useState, type FormEvent } from "react";
import { useSearch } from "wouter";
import { toast } from "sonner";
import { NightFooter, NightHeader } from "@/components/NightFrequencyChrome";
import { Reveal } from "@/components/Reveal";
import { verifiedArtistProfile } from "@/content/artistPlatform";
import { trpc } from "@/lib/trpc";
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

/* ============================================================
   INQUIRY — /inquire dan /en/inquire
   ------------------------------------------------------------
   Satu formulir, dua bahasa. `InquiryView({ locale })` menyuplai seluruh
   salinan (jenis inquiry, label field, pesan status) sehingga versi EN
   tidak lagi memakai struktur lama yang tertinggal.
   ============================================================ */

const copy = {
  id: {
    contacts: [
      { label: "Status", value: "Akan ditinjau" },
      { label: "Basis", value: "Bandung Barat — Indonesia" },
    ],
    directContactLabel: "Kontak langsung",
    beforeMeta: "Sebelum mengirim",
    contextTitle: "Konteks singkat membuat brief cepat ditinjau.",
    checklist: [
      "Tujuan proyek dan bentuk kerja samanya.",
      "Referensi atau contoh yang paling dekat.",
      "Timeline dan target penggunaan.",
      "Deliverable yang diharapkan.",
    ],
    typesMeta: "Jenis inquiry",
    roles: "Booking · Remix · Kolaborasi · Licensing · Press",
    formMeta: "Detail inquiry",
    typeGroupLabel: "Jenis inquiry",
    aboutLegend: "Tentang kamu",
    planLegend: "Rencana",
    briefLegend: "Brief",
    optional: "opsional",
    required: "wajib",
    fields: {
      name: { label: "Nama", placeholder: "Nama kamu" },
      email: { label: "Email", placeholder: "nama@email.com" },
      organization: {
        label: "Organisasi / nama artis",
        placeholder: "Label, brand, atau kolektif",
      },
      projectTitle: {
        label: "Judul proyek / acara",
        placeholder: "Nama project atau event",
      },
      location: {
        label: "Lokasi / pasar",
        placeholder: "Kota, negara, atau online",
      },
      timeline: { label: "Timeline", placeholder: "Contoh: Mei 2026" },
      budgetContext: {
        label: "Konteks budget",
        placeholder: "Boleh jelaskan konteks atau tulis 'discuss'",
      },
      message: {
        label: "Kebutuhan, referensi, dan deliverable",
        placeholder:
          "Jelaskan kebutuhan, referensi, link, deliverable, serta hal penting lain.",
      },
    },
    submit: "KIRIM INQUIRY",
    pending: "MENGIRIM…",
    note: "Konfirmasi diberikan setelah inquiry ditinjau.",
    successStrong: "Pesan diterima.",
    successCopy:
      "Terima kasih — pesanmu sudah masuk ke inbox Akbar Nawasunda.",
    successAgain: "Kirim pesan lain",
    errorStrong: "Pesan belum terkirim.",
    errorCopy: "Coba lagi, atau kirim langsung ke",
    toastSuccess: "Inquiry diterima. Jalur owner akan meninjaunya.",
    toastDb: "Database sedang bermasalah. Coba lagi dalam beberapa saat.",
    toastEmail: "Format email tidak valid.",
    toastInvalid: "Periksa kembali isian inquiry Anda.",
    toastFallback: "Inquiry belum terkirim. Silakan coba lagi.",
    labels: {
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
        intro:
          "Jelaskan peran, karya, dan bentuk kerja sama yang kamu ajukan.",
      },
      licensing: {
        kicker: "Licensing / usage",
        title: "Music licensing.",
        intro:
          "Ajukan penggunaan musik untuk konten, brand, event, atau proyek lain.",
      },
    },
  },
  en: {
    contacts: [
      { label: "Status", value: "Under review" },
      { label: "Based in", value: "Bandung Barat — Indonesia" },
    ],
    directContactLabel: "Direct contact",
    beforeMeta: "Before sending",
    contextTitle: "A short context keeps the brief easy to review.",
    checklist: [
      "The project goal and the shape of the collaboration.",
      "The closest reference or example.",
      "Timeline and intended usage.",
      "The deliverables you expect.",
    ],
    typesMeta: "Inquiry type",
    roles: "Booking · Remix · Collaboration · Licensing · Press",
    formMeta: "Inquiry detail",
    typeGroupLabel: "Inquiry type",
    aboutLegend: "About you",
    planLegend: "Plan",
    briefLegend: "Brief",
    optional: "optional",
    required: "required",
    fields: {
      name: { label: "Name", placeholder: "Your name" },
      email: { label: "Email", placeholder: "name@email.com" },
      organization: {
        label: "Organization / artist name",
        placeholder: "Label, brand, or collective",
      },
      projectTitle: {
        label: "Project / event title",
        placeholder: "Project or event name",
      },
      location: {
        label: "Location / market",
        placeholder: "City, country, or online",
      },
      timeline: { label: "Timeline", placeholder: "For example: May 2026" },
      budgetContext: {
        label: "Budget context",
        placeholder: "Describe the context or write 'discuss'",
      },
      message: {
        label: "Requirements, references, and deliverables",
        placeholder:
          "Describe the requirements, references, links, deliverables, and anything else that matters.",
      },
    },
    submit: "SEND INQUIRY",
    pending: "SENDING…",
    note: "Confirmation follows once the inquiry has been reviewed.",
    successStrong: "Message received.",
    successCopy:
      "Thank you — your message has arrived in the Akbar Nawasunda inbox.",
    successAgain: "Send another message",
    errorStrong: "Message not sent.",
    errorCopy: "Try again, or send it directly to",
    toastSuccess: "Inquiry received. The owner route will review it.",
    toastDb: "The database is having trouble. Please try again shortly.",
    toastEmail: "That email format is not valid.",
    toastInvalid: "Please check the inquiry fields again.",
    toastFallback: "The inquiry was not sent. Please try again.",
    labels: {
      booking: {
        kicker: "Booking / performance",
        title: "Booking inquiry.",
        intro:
          "Send your performance, event, or set requirements. Dates and availability are confirmed after the inquiry is reviewed.",
      },
      remix: {
        kicker: "Remix / custom arrangement",
        title: "Remix inquiry.",
        intro:
          "Send the brief, references, and usage context so the creative direction can be reviewed.",
      },
      collaboration: {
        kicker: "Collaboration",
        title: "Collaboration.",
        intro:
          "Describe the role, the work, and the shape of the collaboration you are proposing.",
      },
      licensing: {
        kicker: "Licensing / usage",
        title: "Music licensing.",
        intro:
          "Request music use for content, a brand, an event, or another project.",
      },
    },
  },
} as const;

export function InquiryView({ locale = "id" }: { locale?: "id" | "en" }) {
  const t = copy[locale];
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
  const [submissionState, setSubmissionState] = useState<
    "idle" | "success" | "error"
  >("idle");
  const submit = trpc.inquiry.submit.useMutation({
    onSuccess: () => {
      setSubmissionState("success");
      toast.success(t.toastSuccess);
    },
    onError: error => {
      setSubmissionState("error");
      console.error("Inquiry error:", error);
      const message = error.message.toLowerCase();
      if (message.includes("database") || message.includes("connect")) {
        toast.error(t.toastDb);
      } else if (message.includes("email")) {
        toast.error(t.toastEmail);
      } else if (message.includes("invalid") || message.includes("expected")) {
        toast.error(t.toastInvalid);
      } else {
        toast.error(t.toastFallback);
      }
    },
  });
  const current = t.labels[type];
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
          {t.contacts.map(contact => (
            <div key={contact.label}>
              <dt>{contact.label}</dt>
              <dd>{contact.value}</dd>
            </div>
          ))}
          <div>
            <dt>{t.directContactLabel}</dt>
            <dd>
              <a href={`mailto:${verifiedArtistProfile.bookingEmail}`}>
                {verifiedArtistProfile.bookingEmail}
              </a>
            </dd>
          </div>
        </dl>
      </section>

      <Reveal>
        <section className="an-section an-inq-shell" aria-label={t.formMeta}>
          <aside className="an-inq-context an-rise">
            <p className="an-meta">{t.beforeMeta}</p>
            <h2 className="an-inq-context-title">{t.contextTitle}</h2>
            <ul className="an-checklist">
              {t.checklist.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="an-meta">{t.typesMeta}</p>
            <p className="an-inq-roles">{t.roles}</p>
            <a
              className="an-inq-email"
              href={`mailto:${verifiedArtistProfile.bookingEmail}`}
            >
              {verifiedArtistProfile.bookingEmail}
            </a>
          </aside>

          <form className="an-inq-form an-rise" onSubmit={onSubmit}>
            <div className="an-inq-form-head">
              <p className="an-meta">{t.formMeta}</p>
              <h2 className="an-inq-form-title">{current.title}</h2>
            </div>

            <div
              className="an-inq-type-row"
              role="group"
              aria-label={t.typeGroupLabel}
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
              <legend className="an-meta">{t.aboutLegend}</legend>
              <div className="an-inq-grid">
                <label>
                  <span>{t.fields.name.label}</span>
                  <input
                    required
                    value={form.name}
                    onChange={event => update("name", event.target.value)}
                    placeholder={t.fields.name.placeholder}
                  />
                </label>
                <label>
                  <span>{t.fields.email.label}</span>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={event => update("email", event.target.value)}
                    placeholder={t.fields.email.placeholder}
                  />
                </label>
                <label>
                  <span>
                    {t.fields.organization.label}{" "}
                    <small className="an-inq-optional">{t.optional}</small>
                  </span>
                  <input
                    value={form.organization}
                    onChange={event =>
                      update("organization", event.target.value)
                    }
                    placeholder={t.fields.organization.placeholder}
                  />
                </label>
                <label>
                  <span>{t.fields.projectTitle.label}</span>
                  <input
                    required
                    value={form.projectTitle}
                    onChange={event =>
                      update("projectTitle", event.target.value)
                    }
                    placeholder={t.fields.projectTitle.placeholder}
                  />
                </label>
              </div>
            </fieldset>

            <fieldset className="an-inq-fieldset">
              <legend className="an-meta">{t.planLegend}</legend>
              <div className="an-inq-grid">
                <label>
                  <span>
                    {t.fields.location.label}{" "}
                    <small className="an-inq-optional">{t.optional}</small>
                  </span>
                  <input
                    value={form.location}
                    onChange={event => update("location", event.target.value)}
                    placeholder={t.fields.location.placeholder}
                  />
                </label>
                <label>
                  <span>
                    {t.fields.timeline.label}{" "}
                    <small className="an-inq-optional">{t.optional}</small>
                  </span>
                  <input
                    value={form.timeline}
                    onChange={event => update("timeline", event.target.value)}
                    placeholder={t.fields.timeline.placeholder}
                  />
                </label>
                <label className="an-inq-full">
                  <span>
                    {t.fields.budgetContext.label}{" "}
                    <small className="an-inq-optional">{t.optional}</small>
                  </span>
                  <input
                    value={form.budgetContext}
                    onChange={event =>
                      update("budgetContext", event.target.value)
                    }
                    placeholder={t.fields.budgetContext.placeholder}
                  />
                </label>
              </div>
            </fieldset>

            <fieldset className="an-inq-fieldset">
              <legend className="an-meta">{t.briefLegend}</legend>
              <label className="an-inq-full">
                <span>
                  {t.fields.message.label}{" "}
                  <small className="an-inq-optional">{t.required}</small>
                </span>
                <textarea
                  required
                  minLength={12}
                  value={form.message}
                  onChange={event => update("message", event.target.value)}
                  placeholder={t.fields.message.placeholder}
                />
              </label>
            </fieldset>

            <div className="an-inq-submit-row">
              <button
                className="an-btn an-btn--solid an-inq-submit"
                disabled={submit.isPending}
              >
                {submit.isPending ? t.pending : t.submit}
              </button>
              <p className="an-inq-note">{t.note}</p>
            </div>

            {submissionState === "success" ? (
              <div
                className="an-inq-feedback is-success"
                role="status"
                aria-live="polite"
              >
                <strong>{t.successStrong}</strong>
                <span>{t.successCopy}</span>
                <button type="button" onClick={resetSubmission}>
                  {t.successAgain}
                </button>
              </div>
            ) : null}
            {submissionState === "error" ? (
              <div className="an-inq-feedback is-error" role="alert">
                <strong>{t.errorStrong}</strong>
                <span>
                  {t.errorCopy} {verifiedArtistProfile.bookingEmail}.
                </span>
              </div>
            ) : null}
          </form>
        </section>
      </Reveal>
    </main>
  );
}

export default function Inquiry() {
  return (
    <div className="nf-page an-inquiry-page">
      <NightHeader active="/inquire" />
      <InquiryView locale="id" />
      <NightFooter />
    </div>
  );
}
