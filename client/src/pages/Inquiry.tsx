import { FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";
import { NightFooter, NightHeader } from "@/components/NightFrequencyChrome";
import { ScrambleText } from "@/components/ScrambleText";
import { trpc } from "@/lib/trpc";
import "./Inquiry.css";

type InquiryType = "booking" | "remix" | "collaboration" | "licensing";
type InquirySource = "epk" | "release" | "universe" | "licensing";
const validTypes: InquiryType[] = ["booking", "remix", "collaboration", "licensing"];
const validSources: InquirySource[] = ["epk", "release", "universe", "licensing"];
const labels: Record<InquiryType, { kicker: string; title: string; intro: string }> = {
  booking: { kicker: "BOOKING / PERFORMANCE", title: "BUILD THE\nNEXT ROOM.", intro: "Kirim kebutuhan performance, acara, atau set. Inquiry ini masuk ke jalur owner untuk ditinjau—belum berarti tanggal otomatis tersedia." },
  remix: { kicker: "REMIX / CUSTOM ARRANGEMENT", title: "SEND THE\nREFERENCE.", intro: "Kirim brief remix atau arrangement. Sertakan link referensi dan konteks penggunaan agar arah kreatif bisa ditinjau dengan jelas." },
  collaboration: { kicker: "COLLABORATION / CREATOR", title: "START A\nSIGNAL.", intro: "Terbuka untuk ide kolaborasi yang relevan. Jelaskan peran, karya, dan bentuk kerja sama yang kamu bayangkan." },
  licensing: { kicker: "LICENSING / USAGE", title: "USE THE\nSOUND RIGHT.", intro: "Ajukan penggunaan musik untuk konten, brand, event, atau proyek lain. Detail hak dan biaya dibicarakan setelah kebutuhan ditinjau." },
};

export default function Inquiry() {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const initialType = validTypes.includes(params.get("type") as InquiryType) ? params.get("type") as InquiryType : "booking";
  const initialSource = validSources.includes(params.get("source") as InquirySource) ? params.get("source") as InquirySource : "epk";
  const [type, setType] = useState<InquiryType>(initialType);
  const [source] = useState<InquirySource>(initialSource);
  const [form, setForm] = useState({ name: "", email: "", organization: "", projectTitle: "", location: "", timeline: "", budgetContext: "", message: "" });
  const submit = trpc.inquiry.submit.useMutation({
    onSuccess: () => { toast.success("Inquiry diterima. Jalur owner akan meninjaunya."); setForm({ name: "", email: "", organization: "", projectTitle: "", location: "", timeline: "", budgetContext: "", message: "" }); },
    onError: () => toast.error("Inquiry belum terkirim. Periksa kembali isian lalu coba lagi."),
  });
  const current = labels[type];
  const onSubmit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); submit.mutate({ inquiryType: type, source, ...form }); };
  const update = (key: keyof typeof form, value: string) => setForm(previous => ({ ...previous, [key]: value }));
  return <div className="nf-page an-inquiry-page"><NightHeader /><main><section className="an-inquiry-hero"><p className="nf-page-eyebrow">{current.kicker}</p><ScrambleText as="h1" interactive duration={2400} text={current.title} /><p>{current.intro}</p><div className="an-inquiry-signal"><span>INQUIRY ROUTE</span><strong>OWNER REVIEW</strong></div></section><section className="an-inquiry-shell"><form className="an-inquiry-form" onSubmit={onSubmit}><div className="an-inquiry-type-row">{validTypes.map(option => <button key={option} type="button" className={type === option ? "is-active" : ""} onClick={() => setType(option)}>{option}</button>)}</div><div className="an-inquiry-grid"><label>YOUR NAME<input required value={form.name} onChange={event => update("name", event.target.value)} placeholder="Nama kamu" /></label><label>EMAIL ADDRESS<input required type="email" value={form.email} onChange={event => update("email", event.target.value)} placeholder="nama@email.com" /></label><label>ORGANIZATION / ARTIST NAME<input value={form.organization} onChange={event => update("organization", event.target.value)} placeholder="Opsional" /></label><label>PROJECT / EVENT TITLE<input required value={form.projectTitle} onChange={event => update("projectTitle", event.target.value)} placeholder="Nama project atau event" /></label><label>LOCATION / MARKET<input value={form.location} onChange={event => update("location", event.target.value)} placeholder="Kota, negara, atau online" /></label><label>TIMELINE<input value={form.timeline} onChange={event => update("timeline", event.target.value)} placeholder="Contoh: Mei 2026" /></label></div><label className="an-inquiry-full">BUDGET CONTEXT <input value={form.budgetContext} onChange={event => update("budgetContext", event.target.value)} placeholder="Opsional — boleh jelaskan konteks atau tulis 'discuss'" /></label><label className="an-inquiry-full">BRIEF / MESSAGE<textarea required minLength={12} value={form.message} onChange={event => update("message", event.target.value)} placeholder="Jelaskan kebutuhan, referensi, link, deliverable, serta hal penting lain." /></label><button className="an-inquiry-submit" disabled={submit.isPending}>{submit.isPending ? "TRANSMITTING…" : "SEND INQUIRY"}</button><p className="an-inquiry-note">Tidak ada tarif atau ketersediaan yang dijanjikan lewat form ini. Konfirmasi diberikan setelah inquiry ditinjau.</p></form><aside className="an-inquiry-aside"><span>WHAT HELPS</span><p>Berikan brief yang singkat tetapi spesifik: tujuan, format penggunaan, deadline, dan link referensi. Ini membantu inquiry ditinjau lebih cepat.</p><a href="/licensing">READ LICENSING & USAGE →</a></aside></section></main><NightFooter /></div>;
}
