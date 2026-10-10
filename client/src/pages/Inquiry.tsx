import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { NightFooter, NightHeader } from "@/components/NightFrequencyChrome";
import { EmailText } from "@/components/EmailText";
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
/* Sumber yang bisa diisi halaman lain. Nilai di luar daftar ini (mis.
   `source=live` dari /live atau `source=photo` di masa depan) jatuh ke
   "epk" — kolom `source` di DB adalah enum empat nilai
   (`drizzle/schema.ts`), jadi granularitas asal halaman perlu migrasi
   enum sebelum bisa disimpan apa adanya. */
const validSources: InquirySource[] = [
  "epk",
  "release",
  "universe",
  "licensing",
];
/* Alias jenis dari halaman lain. Phase 3 mengunci form pada EMPAT jenis,
   jadi `?type=visual` (CTA /visuals) tidak menambah jenis kelima —
   kolaborasi visual adalah kolaborasi, dan itulah label yang muncul. */
const typeAliases: Record<string, InquiryType> = {
  visual: "collaboration",
  video: "collaboration",
};

/** Field yang divalidasi klien (cermin aturan zod server — lihat
 *  `server/routers.ts` inquiry.submit). */
type FieldKey = "name" | "email" | "projectTitle" | "message";
const fieldIds: Record<FieldKey, string> = {
  name: "inq-name",
  email: "inq-email",
  projectTitle: "inq-project",
  message: "inq-message",
};

/* ============================================================
   INQUIRY — /inquire dan /en/inquire
   ------------------------------------------------------------
   Satu formulir, dua bahasa, satu target nyata (tRPC → inbox owner di
   /studio/inquiries). Validasi klien memantulkan aturan server supaya
   error muncul per field + ringkasan yang bisa difokuskan, bukan toast
   generik. Fallback mailto selalu tersedia di samping form.
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
    errors: {
      name: "Nama minimal 2 karakter.",
      email: "Format email tidak valid.",
      projectTitle: "Judul proyek minimal 2 karakter.",
      message: "Brief minimal 12 karakter.",
      summaryTitle: "Periksa kembali isian berikut sebelum mengirim.",
      serverSummary:
        "Inquiry belum terkirim — periksa kembali isian, atau kirim langsung ke email di samping.",
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
    errors: {
      name: "Name must be at least 2 characters.",
      email: "That email format is not valid.",
      projectTitle: "Project title must be at least 2 characters.",
      message: "Brief must be at least 12 characters.",
      summaryTitle: "Please fix the following before sending.",
      serverSummary:
        "The inquiry was not sent — check the fields, or email directly using the address beside the form.",
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
  const params = useSearchParams();
  const requestedType = params.get("type") ?? "";
  const initialType = validTypes.includes(requestedType as InquiryType)
    ? (requestedType as InquiryType)
    : (typeAliases[requestedType] ?? "booking");
  const initialSource = validSources.includes(
    params.get("source") as InquirySource
  )
    ? (params.get("source") as InquirySource)
    : "epk";
  const [type, setType] = useState<InquiryType>(initialType);
  const [source, setSource] = useState<InquirySource>(initialSource);

  useEffect(() => {
    setType(initialType);
    setSource(initialSource);
  }, [initialType, initialSource]);

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
  const [fieldErrors, setFieldErrors] = useState<Partial<
    Record<FieldKey, string>
  >>({});
  const [serverError, setServerError] = useState(false);
  const [submissionState, setSubmissionState] = useState<
    "idle" | "success" | "error"
  >("idle");
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  const focusElement = (element: HTMLElement | null) => {
    // rAF supaya fokus mengikuti render ringkasan/konfirmasi yang baru.
    requestAnimationFrame(() => element?.focus());
  };

  const submit = trpc.inquiry.submit.useMutation({
    onSuccess: () => {
      setSubmissionState("success");
      focusElement(successRef.current);
      toast.success(t.toastSuccess);
    },
    onError: error => {
      /* Petakan error server (zod) ke field-nya. Data form TIDAK di-log
         ke konsol browser — hanya struktur path issue yang dibaca. */
      const data = (
        error as {
          data?: {
            issues?: Array<{ path?: Array<string | number> }>;
            fieldErrors?: Record<string, string[]>;
          };
        }
      )?.data;
      const issueKeys = new Set<string>();
      data?.issues?.forEach(issue => {
        const key = issue.path?.[0];
        if (typeof key === "string") issueKeys.add(key);
      });
      Object.keys(data?.fieldErrors ?? {}).forEach(key => issueKeys.add(key));
      const mapped: Partial<Record<FieldKey, string>> = {};
      (Object.keys(fieldIds) as FieldKey[]).forEach(key => {
        if (issueKeys.has(key)) mapped[key] = t.errors[key];
      });
      setFieldErrors(mapped);
      setServerError(Object.keys(mapped).length === 0);
      setSubmissionState("error");
      toast.error(Object.keys(mapped).length ? t.toastInvalid : t.toastFallback);
    },
  });
  const current = t.labels[type];
  const hasErrors = serverError || Object.keys(fieldErrors).length > 0;
  const errorSummaryTitle =
    serverError && !Object.keys(fieldErrors).length
      ? t.errors.serverSummary
      : t.errors.summaryTitle;

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors: Partial<Record<FieldKey, string>> = {};
    if (form.name.trim().length < 2) errors.name = t.errors.name;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      errors.email = t.errors.email;
    if (form.projectTitle.trim().length < 2)
      errors.projectTitle = t.errors.projectTitle;
    if (form.message.trim().length < 12) errors.message = t.errors.message;
    setFieldErrors(errors);
    setServerError(false);
    if (Object.keys(errors).length) {
      setSubmissionState("idle");
      focusElement(errorSummaryRef.current);
      return;
    }
    setSubmissionState("idle");
    submit.mutate({ inquiryType: type, source, ...form });
  };
  const resetSubmission = () => {
    setSubmissionState("idle");
    setFieldErrors({});
    setServerError(false);
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
  const update = (key: keyof typeof form, value: string) => {
    setForm(previous => ({ ...previous, [key]: value }));
    if (key in fieldIds) {
      const fieldKey = key as FieldKey;
      setFieldErrors(previous => {
        if (!(fieldKey in previous)) return previous;
        const next = { ...previous };
        delete next[fieldKey];
        return next;
      });
    }
  };

  const errorProps = (key: FieldKey) => ({
    id: fieldIds[key],
    "aria-invalid": fieldErrors[key] ? true : undefined,
    "aria-describedby": fieldErrors[key]
      ? `${fieldIds[key]}-error`
      : undefined,
    className: fieldErrors[key] ? "is-error" : undefined,
  });
  const fieldError = (key: FieldKey) =>
    fieldErrors[key] ? (
      <p className="an-inq-field-error" id={`${fieldIds[key]}-error`}>
        {fieldErrors[key]}
      </p>
    ) : null;

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
                <EmailText value={verifiedArtistProfile.bookingEmail} />
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
              <EmailText value={verifiedArtistProfile.bookingEmail} />
            </a>
          </aside>

          <form className="an-inq-form an-rise" onSubmit={onSubmit} noValidate>
            <div className="an-inq-form-head">
              <p className="an-meta">{t.formMeta}</p>
            </div>

            {/* Ringkasan error: difokuskan saat submit gagal validasi,
                diumumkan ke AT (role=alert), dan hilang saat diperbaiki. */}
            {hasErrors ? (
              <div
                ref={errorSummaryRef}
                tabIndex={-1}
                role="alert"
                className="an-inq-error-summary"
              >
                <strong>{errorSummaryTitle}</strong>
                {Object.keys(fieldErrors).length > 0 ? (
                  <ul>
                    {(Object.keys(fieldIds) as FieldKey[]).map(key =>
                      fieldErrors[key] ? (
                        <li key={key}>{fieldErrors[key]}</li>
                      ) : null
                    )}
                  </ul>
                ) : null}
              </div>
            ) : null}

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
              <legend>
                <h2 className="an-inq-legend-title">{t.aboutLegend}</h2>
              </legend>
              <div className="an-inq-grid">
                <div className="an-inq-cell">
                  <label htmlFor={fieldIds.name}>
                    <span>{t.fields.name.label}</span>
                    <input
                      required
                      autoComplete="name"
                      value={form.name}
                      onChange={event => update("name", event.target.value)}
                      placeholder={t.fields.name.placeholder}
                      {...errorProps("name")}
                    />
                  </label>
                  {fieldError("name")}
                </div>
                <div className="an-inq-cell">
                  <label htmlFor={fieldIds.email}>
                    <span>{t.fields.email.label}</span>
                    <input
                      required
                      type="email"
                      autoComplete="email"
                      value={form.email}
                      onChange={event => update("email", event.target.value)}
                      placeholder={t.fields.email.placeholder}
                      {...errorProps("email")}
                    />
                  </label>
                  {fieldError("email")}
                </div>
                <div className="an-inq-cell">
                  <label htmlFor="inq-organization">
                    <span>
                      {t.fields.organization.label}{" "}
                      <small className="an-inq-optional">{t.optional}</small>
                    </span>
                    <input
                      id="inq-organization"
                      autoComplete="organization"
                      value={form.organization}
                      onChange={event =>
                        update("organization", event.target.value)
                      }
                      placeholder={t.fields.organization.placeholder}
                    />
                  </label>
                </div>
                <div className="an-inq-cell">
                  <label htmlFor={fieldIds.projectTitle}>
                    <span>{t.fields.projectTitle.label}</span>
                    <input
                      required
                      autoComplete="organization-title"
                      value={form.projectTitle}
                      onChange={event =>
                        update("projectTitle", event.target.value)
                      }
                      placeholder={t.fields.projectTitle.placeholder}
                      {...errorProps("projectTitle")}
                    />
                  </label>
                  {fieldError("projectTitle")}
                </div>
              </div>
            </fieldset>

            <fieldset className="an-inq-fieldset">
              <legend>
                <h2 className="an-inq-legend-title">{t.planLegend}</h2>
              </legend>
              <div className="an-inq-grid">
                <div className="an-inq-cell">
                  <label htmlFor="inq-location">
                    <span>
                      {t.fields.location.label}{" "}
                      <small className="an-inq-optional">{t.optional}</small>
                    </span>
                    <input
                      id="inq-location"
                      value={form.location}
                      onChange={event => update("location", event.target.value)}
                      placeholder={t.fields.location.placeholder}
                    />
                  </label>
                </div>
                <div className="an-inq-cell">
                  <label htmlFor="inq-timeline">
                    <span>
                      {t.fields.timeline.label}{" "}
                      <small className="an-inq-optional">{t.optional}</small>
                    </span>
                    <input
                      id="inq-timeline"
                      value={form.timeline}
                      onChange={event => update("timeline", event.target.value)}
                      placeholder={t.fields.timeline.placeholder}
                    />
                  </label>
                </div>
                <div className="an-inq-cell an-inq-full">
                  <label htmlFor="inq-budget">
                    <span>
                      {t.fields.budgetContext.label}{" "}
                      <small className="an-inq-optional">{t.optional}</small>
                    </span>
                    <input
                      id="inq-budget"
                      value={form.budgetContext}
                      onChange={event =>
                        update("budgetContext", event.target.value)
                      }
                      placeholder={t.fields.budgetContext.placeholder}
                    />
                  </label>
                </div>
              </div>
            </fieldset>

            <fieldset className="an-inq-fieldset">
              <legend>
                <h2 className="an-inq-legend-title">{t.briefLegend}</h2>
              </legend>
              <div className="an-inq-cell an-inq-full">
                <label htmlFor={fieldIds.message}>
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
                    {...errorProps("message")}
                  />
                </label>
                {fieldError("message")}
              </div>
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
                ref={successRef}
                tabIndex={-1}
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
