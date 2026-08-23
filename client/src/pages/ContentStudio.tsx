import { ArrowUpRight, Check, Database, FilePenLine, FolderOpen, LayoutList, Radio, Save, ShieldCheck, Sparkles, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import AssetPicker from "@/components/AssetPicker";
import OwnerLoginCard from "@/components/OwnerLoginCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

const documentTypes = [
  { value: "hero", label: "Homepage hero", eyebrow: "01", description: "First impression and primary action" },
  { value: "profile", label: "Artist profile", eyebrow: "02", description: "Bio, genres, statement, portrait" },
  { value: "pressKit", label: "Press & booking", eyebrow: "03", description: "EPK copy, contacts, download links" },
  { value: "siteSettings", label: "Site settings / SEO", eyebrow: "04", description: "Metadata and search presentation" },
  { value: "legal", label: "Privacy / legal", eyebrow: "05", description: "Reviewed public policy documents" },
  { value: "release", label: "Release", eyebrow: "06", description: "Music, artwork, platforms, credits" },
  { value: "visual", label: "Visual / video", eyebrow: "07", description: "Video metadata and thumbnail" },
  { value: "live", label: "Live signal", eyebrow: "08", description: "Standby, announced, or active" },
  { value: "event", label: "Live event", eyebrow: "09", description: "Date, venue, ticket, poster" },
] as const;

type DocumentType = (typeof documentTypes)[number]["value"];
type EditorPayload = Record<string, unknown>;
type EditorDocument = { id: number; documentType: DocumentType; slug: string; payload: EditorPayload; sortOrder: number; isPublished: boolean };
type FieldSpec = { key: string; label: string; placeholder?: string; multiline?: boolean; media?: boolean; type?: "text" | "url" | "email" | "date" | "select"; options?: string[] };

const fieldsByType: Record<DocumentType, FieldSpec[]> = {
  hero: [
    { key: "heroKicker", label: "Kicker", placeholder: "AKBAR NAWASUNDA / PRODUCER" },
    { key: "heroTitle", label: "Hero title", placeholder: "Akbar Nawasunda" },
    { key: "heroBody", label: "Hero copy", multiline: true, placeholder: "One concise public sentence." },
    { key: "heroImage", label: "Hero image URL", type: "url", media: true, placeholder: "/manus-storage/... or /assets/..." },
    { key: "primaryActionLabel", label: "Primary action label", placeholder: "LISTEN NOW" },
    { key: "primaryActionUrl", label: "Primary action URL", type: "url", placeholder: "https://..." },
  ],
  profile: [
    { key: "shortBio", label: "Short bio", multiline: true },
    { key: "longBio", label: "Long bio", multiline: true },
    { key: "location", label: "Location", placeholder: "Bandung Barat, Indonesia" },
    { key: "genresText", label: "Genres", placeholder: "Breakbeat, Indo Bass, Jedag Jedug" },
    { key: "portraitImage", label: "Portrait image URL", type: "url", media: true },
    { key: "artistStatement", label: "Artist statement", multiline: true },
  ],
  pressKit: [
    { key: "intro", label: "EPK intro", multiline: true },
    { key: "bookingEmail", label: "Booking email", type: "email" },
    { key: "pressEmail", label: "Press email", type: "email" },
    { key: "oneSheetUrl", label: "One sheet URL", type: "url", media: true },
    { key: "photoPackUrl", label: "Photo pack URL", type: "url", media: true },
    { key: "logoPackUrl", label: "Logo pack URL", type: "url", media: true },
    { key: "technicalRiderUrl", label: "Technical rider URL", type: "url", media: true },
  ],
  siteSettings: [
    { key: "siteTitle", label: "Site title" },
    { key: "metaDescription", label: "Meta description", multiline: true },
    { key: "ogTitle", label: "Social title" },
    { key: "ogDescription", label: "Social description", multiline: true },
    { key: "socialPreviewUrl", label: "Social preview URL", type: "url", media: true },
    { key: "canonicalUrl", label: "Canonical URL", type: "url" },
    { key: "contactEmail", label: "Contact email", type: "email" },
    { key: "bookingEmail", label: "Booking email", type: "email" },
    { key: "pressEmail", label: "Press email", type: "email" },
    { key: "platformLinksText", label: "Official platform links", multiline: true, placeholder: "Spotify | https://...\nYouTube | https://...\nSoundCloud | https://..." },
  ],
  legal: [
    { key: "title", label: "Document title" },
    { key: "version", label: "Version" },
    { key: "effectiveDate", label: "Effective date", type: "date" },
    { key: "intro", label: "Introduction", multiline: true },
    { key: "sectionsText", label: "Sections", multiline: true, placeholder: "key | Heading | Body\ncollection | Information we collect | ..." },
  ],
  release: [
    { key: "title", label: "Release title" },
    { key: "year", label: "Year" },
    { key: "format", label: "Format", placeholder: "Single / Remix / Bootleg" },
    { key: "platform", label: "Primary platform" },
    { key: "url", label: "Official release URL", type: "url" },
    { key: "embedUrl", label: "Embed URL", type: "url" },
    { key: "artworkUrl", label: "Artwork URL", type: "url", media: true },
    { key: "story", label: "Release story", multiline: true },
    { key: "credits", label: "Credits", multiline: true },
    { key: "spotifyUrl", label: "Spotify URL", type: "url" },
    { key: "appleMusicUrl", label: "Apple Music URL", type: "url" },
    { key: "platformLinksText", label: "Release platform links", multiline: true, placeholder: "SoundCloud | https://...\nSpotify | https://...\nApple Music | https://..." },
  ],
  visual: [
    { key: "title", label: "Visual title" },
    { key: "label", label: "Label", placeholder: "LATEST VISUAL" },
    { key: "youtubeId", label: "YouTube ID", placeholder: "e.g. rv4DK8nVWd0" },
    { key: "url", label: "Official visual URL", type: "url" },
    { key: "imageUrl", label: "Thumbnail URL", type: "url", media: true },
  ],
  live: [
    { key: "status", label: "Status", type: "select", options: ["standby", "announced", "active"] },
    { key: "message", label: "Public message", multiline: true },
    { key: "actionUrl", label: "Action URL", type: "url" },
  ],
  event: [
    { key: "title", label: "Event title" },
    { key: "date", label: "Date", type: "date" },
    { key: "time", label: "Local time", placeholder: "21:00 WIB" },
    { key: "city", label: "City" },
    { key: "venue", label: "Venue" },
    { key: "country", label: "Country" },
    { key: "posterUrl", label: "Poster URL", type: "url", media: true },
    { key: "ticketUrl", label: "Ticket URL", type: "url" },
    { key: "rsvpUrl", label: "RSVP URL", type: "url" },
    { key: "status", label: "Status", type: "select", options: ["announced", "sold out", "cancelled", "past"] },
  ],
};

function emptyPayload(type: DocumentType): EditorPayload {
  return type === "live" ? { status: "standby" } : type === "event" ? { status: "announced" } : type === "legal" ? { version: "1.0", sectionsText: "" } : {};
}

function textValue(payload: EditorPayload, key: string) {
  return typeof payload[key] === "string" ? String(payload[key]) : "";
}

function slugify(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function formatPlatformLinks(value: unknown) {
  if (!Array.isArray(value)) return "";
  return value
    .filter(item => Boolean(item && typeof item === "object" && !Array.isArray(item)))
    .map(item => {
      const record = item as Record<string, unknown>;
      return `${typeof record.label === "string" ? record.label : ""} | ${typeof record.href === "string" ? record.href : ""}`;
    })
    .filter(line => line !== " | ")
    .join("\n");
}

function preparedPayload(type: DocumentType, payload: EditorPayload) {
  const next = { ...payload };
  if (type === "profile") {
    next.genres = textValue(next, "genresText").split(",").map(value => value.trim()).filter(Boolean);
    delete next.genresText;
  }
  if (type === "legal") {
    next.sections = textValue(next, "sectionsText").split("\\n").map(line => line.trim()).filter(Boolean).map(line => {
      const [key, heading, ...bodyParts] = line.split("|").map(value => value.trim());
      return { key, heading, body: bodyParts.join(" | ") };
    });
    delete next.sectionsText;
  }
  if (type === "release" || type === "siteSettings") {
    const platformLinks = textValue(next, "platformLinksText").split("\n").map(line => {
      const [label, ...hrefParts] = line.split("|").map(value => value.trim());
      return { label, href: hrefParts.join(" | ") };
    }).filter(link => link.label && link.href);
    if (platformLinks.length) next.platformLinks = platformLinks;
    else delete next.platformLinks;
    delete next.platformLinksText;
  }
  return next;
}

function displayPayload(document: EditorDocument): EditorPayload {
  const next = { ...document.payload };
  if (document.documentType === "profile" && Array.isArray(next.genres)) next.genresText = next.genres.join(", ");
  if (document.documentType === "legal" && Array.isArray(next.sections)) next.sectionsText = next.sections.map(section => `${String(section.key || "")} | ${String(section.heading || "")} | ${String(section.body || "")}`).join("\n");
  if ((document.documentType === "release" || document.documentType === "siteSettings") && Array.isArray(next.platformLinks)) next.platformLinksText = formatPlatformLinks(next.platformLinks);
  return next;
}

function StudioOperations() {
  const content = trpc.content.documentsAll.useQuery();
  const leads = trpc.fanSignal.list.useQuery();
  const published = content.data?.filter(item => item.isPublished).length ?? 0;
  const drafts = (content.data?.length ?? 0) - published;
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <article className="group relative overflow-hidden rounded-2xl border border-white/[0.09] bg-white/[0.035] p-5 transition hover:border-cyan-200/25">
        <div className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-cyan-300/10 blur-3xl transition group-hover:bg-cyan-300/20" />
        <div className="relative flex items-start justify-between"><Database className="h-4 w-4 text-cyan-200" /><span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/35">Live</span></div>
        <p className="relative mt-7 text-3xl font-semibold tracking-tight text-white">{content.isLoading ? "—" : published}</p><p className="mt-1 text-xs text-white/45">Published documents</p>
      </article>
      <article className="group relative overflow-hidden rounded-2xl border border-white/[0.09] bg-white/[0.035] p-5 transition hover:border-violet-200/25">
        <div className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-violet-300/10 blur-3xl transition group-hover:bg-violet-300/20" />
        <div className="relative flex items-start justify-between"><Save className="h-4 w-4 text-violet-200" /><span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/35">Queue</span></div>
        <p className="relative mt-7 text-3xl font-semibold tracking-tight text-white">{content.isLoading ? "—" : drafts}</p><p className="mt-1 text-xs text-white/45">Draft documents</p>
      </article>
      <article className="group relative overflow-hidden rounded-2xl border border-white/[0.09] bg-white/[0.035] p-5 transition hover:border-amber-200/25">
        <div className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-amber-300/10 blur-3xl transition group-hover:bg-amber-300/20" />
        <div className="relative flex items-start justify-between"><Radio className="h-4 w-4 text-amber-200" /><span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/35">Signal</span></div>
        <p className="relative mt-7 text-3xl font-semibold tracking-tight text-white">{leads.isLoading ? "—" : leads.data?.length ?? 0}</p><p className="mt-1 text-xs text-white/45">Fan signals</p>
      </article>
      <a href="/assets" className="group relative overflow-hidden rounded-2xl border border-cyan-200/15 bg-cyan-200/[0.055] p-5 transition hover:border-cyan-200/35 hover:bg-cyan-200/[0.09]">
        <div className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-cyan-300/10 blur-3xl transition group-hover:bg-cyan-300/20" />
        <div className="relative flex items-start justify-between"><FolderOpen className="h-4 w-4 text-cyan-200" /><ArrowUpRight className="h-4 w-4 text-cyan-200/60" /></div>
        <p className="relative mt-7 text-sm font-semibold text-white">Asset Library</p><p className="mt-1 text-xs text-white/45">Upload, inspect, and attach managed media.</p>
      </a>
      {leads.isError ? <p className="text-sm text-red-200 sm:col-span-2 xl:col-span-4">Fan leads could not be loaded.</p> : null}
    </section>
  );
}

function StudioField({ field, payload, updateField }: { field: FieldSpec; payload: EditorPayload; updateField: (key: string, value: string | boolean) => void }) {
  return (
    <div className={field.multiline ? "space-y-2 sm:col-span-2" : "space-y-2"}>
      <div className="flex items-center justify-between gap-3"><label className="font-mono text-[10px] font-medium uppercase tracking-[0.15em] text-white/50">{field.label}</label>{field.media ? <span className="rounded-full border border-cyan-200/15 bg-cyan-200/[0.06] px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-cyan-100/70">Managed media</span> : null}</div>
      {field.type === "select" ? <select value={textValue(payload, field.key)} onChange={event => updateField(field.key, event.target.value)} className="h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none transition focus:border-cyan-200/50 focus:ring-2 focus:ring-cyan-200/10">{field.options?.map(option => <option value={option} key={option} className="bg-[#12141a]">{option}</option>)}</select> : field.media ? <AssetPicker value={textValue(payload, field.key)} onChange={value => updateField(field.key, value)} /> : field.multiline ? <Textarea value={textValue(payload, field.key)} onChange={event => updateField(field.key, event.target.value)} placeholder={field.placeholder} rows={4} className="min-h-28 rounded-xl border-white/10 bg-black/20 text-white placeholder:text-white/25 focus:border-cyan-200/50 focus:ring-cyan-200/10" /> : <Input type={field.type || "text"} value={textValue(payload, field.key)} onChange={event => updateField(field.key, event.target.value)} placeholder={field.placeholder} className="h-11 rounded-xl border-white/10 bg-black/20 text-white placeholder:text-white/25 focus:border-cyan-200/50 focus:ring-cyan-200/10" />}
    </div>
  );
}

export default function ContentStudio() {
  const { user, loading } = useAuth();
  const utils = trpc.useUtils();
  const [documentType, setDocumentType] = useState<DocumentType>("hero");
  const [slug, setSlug] = useState("default");
  const [payload, setPayload] = useState<EditorPayload>(() => emptyPayload("hero"));
  const [sortOrder, setSortOrder] = useState(0);
  const [isPublished, setIsPublished] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const documents = trpc.content.documentsAll.useQuery(undefined, { enabled: user?.role === "admin" });
  const save = trpc.content.saveDocument.useMutation({
    onSuccess: async () => { toast.success(isPublished ? "Document published." : "Draft saved."); await utils.content.documentsAll.invalidate(); await utils.content.documents.invalidate(); },
    onError: error => toast.error(error.message || "Document could not be saved."),
  });
  const remove = trpc.content.deleteDocument.useMutation({
    onSuccess: async () => { toast.success("Document removed."); resetEditor(); await utils.content.documentsAll.invalidate(); await utils.content.documents.invalidate(); },
    onError: error => toast.error(error.message || "Document could not be removed."),
  });
  const fields = useMemo(() => fieldsByType[documentType], [documentType]);
  const selectedType = documentTypes.find(type => type.value === documentType);

  function resetEditor(nextType: DocumentType = documentType) {
    setDocumentType(nextType); setSlug("default"); setPayload(emptyPayload(nextType)); setSortOrder(0); setIsPublished(true); setEditingId(null);
  }
  function loadDocument(document: EditorDocument) {
    setDocumentType(document.documentType); setSlug(document.slug); setPayload(displayPayload(document)); setSortOrder(document.sortOrder); setIsPublished(document.isPublished); setEditingId(document.id);
  }
  function updateField(key: string, value: string | boolean) { setPayload(current => ({ ...current, [key]: value })); }
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextPayload = preparedPayload(documentType, payload);
    const generatedSlug = ["release", "event"].includes(documentType) && (!slug.trim() || slug.trim() === "default") ? slugify(textValue(nextPayload, "title")) : "";
    save.mutate({ documentType, slug: slug.trim() && slug.trim() !== "default" ? slug.trim() : generatedSlug || "default", payload: nextPayload, sortOrder, isPublished });
  }
  function confirmDelete(document: EditorDocument) {
    if (window.confirm(`Remove ${document.documentType} / ${document.slug}?`)) remove.mutate({ id: document.id });
  }

  if (loading) return <div className="grid min-h-screen place-items-center bg-[#08090c] text-sm text-white/50">Checking studio access…</div>;
  if (!user) return <OwnerLoginCard title="Studio access" description="Sign in with the private owner credentials to manage the website." />;
  if (user.role !== "admin") return <main className="grid min-h-screen place-items-center bg-[#08090c] p-6 text-white"><section className="max-w-md text-center"><ShieldCheck className="mx-auto mb-5 h-9 w-9 text-cyan-200" /><h1 className="text-3xl font-semibold">Owner access required</h1><p className="mt-3 text-white/55">This editor is reserved for the authenticated site owner.</p><a className="mt-7 inline-flex items-center gap-2 text-sm text-cyan-100 underline" href="/">Return to public site <ArrowUpRight size={15} /></a></section></main>;

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-[1600px] space-y-8">
        <header className="flex flex-col gap-6 border-b border-white/[0.08] pb-7 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl"><div className="mb-4 flex flex-wrap items-center gap-3"><span className="font-mono text-[10px] uppercase tracking-[0.25em] text-cyan-200/75">AN // Content operations</span><span className="flex items-center gap-2 rounded-full border border-emerald-200/15 bg-emerald-200/[0.06] px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.15em] text-emerald-100/75"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />Protected workspace</span></div><h1 className="text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">Control the <span className="text-cyan-200">signal.</span></h1><p className="mt-4 max-w-2xl text-sm leading-6 text-white/50">Shape the public site from one focused workspace. Compose reviewed content, attach managed media, and decide exactly when a change becomes public.</p></div>
          <div className="flex flex-wrap gap-2"><a className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-xs font-medium text-white/65 transition hover:border-cyan-200/30 hover:bg-cyan-200/[0.08] hover:text-cyan-100" href="/" target="_blank" rel="noreferrer">Open public site <ArrowUpRight size={14} /></a><a className="inline-flex h-10 items-center gap-2 rounded-xl border border-cyan-200/20 bg-cyan-200/[0.08] px-3 text-xs font-medium text-cyan-100 transition hover:bg-cyan-200/[0.14]" href="/assets">Media library <FolderOpen size={14} /></a></div>
        </header>

        <StudioOperations />

        <div className="grid items-start gap-5 2xl:grid-cols-[minmax(0,1.08fr)_minmax(390px,0.92fr)]">
          <section className="overflow-hidden rounded-2xl border border-white/[0.09] bg-white/[0.03] shadow-2xl shadow-black/20">
            <div className="border-b border-white/[0.08] bg-white/[0.025] px-5 py-5 sm:px-7"><div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-200/70"><FilePenLine size={13} />01 // Compose</div><h2 className="mt-2 text-xl font-semibold tracking-tight text-white">{editingId ? "Refine document" : "Start a new document"}</h2><p className="mt-1 text-xs text-white/40">{selectedType?.description}</p>{documentType === "release" || documentType === "event" ? <p className="mt-2 text-[10px] uppercase tracking-[0.12em] text-cyan-100/45">Slug auto-generated from title when left as default</p> : null}</div>{editingId ? <Button type="button" variant="outline" onClick={() => resetEditor()} className="h-9 rounded-lg border-white/10 bg-white/[0.03] text-xs text-white/65 hover:bg-white/[0.08] hover:text-white">New document</Button> : <span className="flex items-center gap-2 rounded-full border border-white/10 bg-black/15 px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-[0.15em] text-white/35"><Sparkles size={11} className="text-cyan-200/70" /> Draft first</span>}</div></div>
            <form onSubmit={submit} className="space-y-6 p-5 sm:p-7">
              <div className="grid gap-4 sm:grid-cols-[1.1fr_0.9fr]"><div className="space-y-2"><label className="font-mono text-[10px] font-medium uppercase tracking-[0.15em] text-white/50">Document type</label><select value={documentType} onChange={event => resetEditor(event.target.value as DocumentType)} className="h-12 w-full rounded-xl border border-cyan-200/20 bg-cyan-200/[0.06] px-3 text-sm font-medium text-white outline-none transition focus:border-cyan-200/60 focus:ring-2 focus:ring-cyan-200/10">{documentTypes.map(type => <option value={type.value} key={type.value} className="bg-[#12141a]">{type.eyebrow} / {type.label}</option>)}</select></div><div className="space-y-2"><label className="font-mono text-[10px] font-medium uppercase tracking-[0.15em] text-white/50">Document slug</label><Input value={slug} onChange={event => setSlug(event.target.value)} placeholder="default or release-slug" className="h-12 rounded-xl border-white/10 bg-black/20 text-white placeholder:text-white/25 focus:border-cyan-200/50 focus:ring-cyan-200/10" /></div></div>
              <div className="h-px bg-white/[0.07]" />
              <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">{fields.map(field => <StudioField field={field} payload={payload} updateField={updateField} key={field.key} />)}</div>
              {documentType === "release" ? <label className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-black/15 px-4 py-3 text-xs text-white/65"><input type="checkbox" className="h-4 w-4 accent-cyan-300" checked={Boolean(payload.isCurrent)} onChange={event => updateField("isCurrent", event.target.checked)} /> Mark as current release</label> : null}
              {documentType === "legal" ? <label className="flex items-center gap-3 rounded-xl border border-amber-200/10 bg-amber-200/[0.04] px-4 py-3 text-xs text-amber-100/70"><input type="checkbox" className="h-4 w-4 accent-amber-300" checked={Boolean(payload.readyForPublic)} onChange={event => updateField("readyForPublic", event.target.checked)} /> Mark legal document ready for public</label> : null}
              {documentType === "event" ? <label className="flex items-center gap-3 rounded-xl border border-cyan-200/10 bg-cyan-200/[0.04] px-4 py-3 text-xs text-cyan-100/70"><input type="checkbox" className="h-4 w-4 accent-cyan-300" checked={Boolean(payload.isFeatured)} onChange={event => updateField("isFeatured", event.target.checked)} /> Mark as the featured / next show</label> : null}
              <div className="grid gap-4 border-t border-white/[0.08] pt-5 sm:grid-cols-[0.8fr_1.2fr]"><div className="space-y-2"><label className="font-mono text-[10px] font-medium uppercase tracking-[0.15em] text-white/50">Sort order</label><Input type="number" min="0" value={sortOrder} onChange={event => setSortOrder(Number(event.target.value))} className="h-11 rounded-xl border-white/10 bg-black/20 text-white focus:border-cyan-200/50 focus:ring-cyan-200/10" /></div><label className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-xs transition ${isPublished ? "border-emerald-200/20 bg-emerald-200/[0.06] text-emerald-100/80" : "border-white/10 bg-black/15 text-white/50"}`}><span><span className="block font-medium">{isPublished ? "Publish immediately" : "Save as draft"}</span><span className="mt-1 block text-[10px] opacity-60">{isPublished ? "Visible on the public route after save" : "Keep hidden until reviewed"}</span></span><input type="checkbox" className="h-4 w-4 accent-emerald-300" checked={isPublished} onChange={event => setIsPublished(event.target.checked)} /></label></div>
              <div className="rounded-xl border border-cyan-200/10 bg-cyan-200/[0.035] px-4 py-3 text-xs leading-5 text-white/45"><span className="font-medium text-cyan-100/75">Media workflow:</span> upload images, audio, video, or PDFs in Asset Library, then choose them from the media picker or paste the managed URL.</div>
              <Button className="h-12 w-full rounded-xl bg-cyan-300 text-sm font-semibold text-[#071014] shadow-lg shadow-cyan-300/10 transition hover:bg-cyan-200 active:scale-[0.99]" disabled={save.isPending}>{save.isPending ? "Saving…" : isPublished ? "Save & publish" : "Save draft"}</Button>
            </form>
          </section>

          <section className="overflow-hidden rounded-2xl border border-white/[0.09] bg-white/[0.03] shadow-2xl shadow-black/20">
            <div className="border-b border-white/[0.08] bg-white/[0.025] px-5 py-5 sm:px-6"><div className="flex items-start justify-between gap-4"><div><div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-violet-200/70"><LayoutList size={13} />02 // Library</div><h2 className="mt-2 text-xl font-semibold tracking-tight text-white">Managed documents</h2><p className="mt-1 text-xs text-white/40">{documents.data?.length ?? 0} documents in the editor database</p></div><span className="rounded-lg border border-white/10 bg-black/15 px-2.5 py-1.5 font-mono text-[10px] text-white/40">{documents.isLoading ? "—" : `${documents.data?.length ?? 0} total`}</span></div></div>
            <div className="space-y-3 p-4 sm:p-5">{documents.isLoading ? <div className="rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-white/40">Loading document library…</div> : documents.isError ? <div className="rounded-xl border border-red-200/15 bg-red-200/[0.05] p-5 text-sm text-red-100/75">Could not load managed documents.</div> : documents.data?.length ? documents.data.map(document => <article className={`rounded-xl border p-4 transition ${editingId === document.id ? "border-cyan-200/40 bg-cyan-200/[0.07]" : "border-white/[0.08] bg-black/[0.12] hover:border-white/20 hover:bg-white/[0.04]"}`} key={document.id}><div className="flex items-start justify-between gap-3"><button type="button" className="min-w-0 flex-1 text-left" onClick={() => loadDocument(document)}><div className="flex flex-wrap items-center gap-2"><span className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/35">{document.documentType}</span><span className="text-white/20">/</span><span className="truncate font-mono text-[9px] text-white/45">{document.slug}</span><span className={`rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] ${document.isPublished ? "bg-emerald-200/10 text-emerald-100/80" : "bg-white/[0.08] text-white/45"}`}>{document.isPublished ? "Published" : "Draft"}</span></div><p className="mt-3 truncate text-sm font-medium text-white/85">{textValue(document.payload, "title") || textValue(document.payload, "siteTitle") || textValue(document.payload, "heroTitle") || document.slug}</p><p className="mt-1 text-[10px] text-white/35">Updated {new Date(document.updatedAt).toLocaleString()}</p></button><Button type="button" variant="ghost" size="sm" className="h-8 shrink-0 rounded-lg px-2 text-red-200/55 hover:bg-red-200/10 hover:text-red-100" onClick={() => confirmDelete(document)} disabled={remove.isPending}><Trash2 size={14} /></Button></div></article>) : <div className="rounded-xl border border-dashed border-white/10 p-8 text-center"><Database className="mx-auto h-7 w-7 text-white/20" /><p className="mt-3 text-sm text-white/45">No custom documents yet.</p><p className="mt-1 text-xs leading-5 text-white/30">The public site keeps its verified local fallback until you publish a document here.</p></div>}</div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}
