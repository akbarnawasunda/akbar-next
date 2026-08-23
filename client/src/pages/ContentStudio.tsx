import { ArrowUpRight, Check, Database, FilePenLine, FolderOpen, ShieldCheck, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";

const documentTypes = [
  { value: "hero", label: "Homepage hero" },
  { value: "profile", label: "Artist profile" },
  { value: "pressKit", label: "Press & booking" },
  { value: "siteSettings", label: "Site settings / SEO" },
  { value: "legal", label: "Privacy / legal" },
  { value: "release", label: "Release" },
  { value: "visual", label: "Visual / video" },
  { value: "live", label: "Live signal" },
  { value: "event", label: "Live event" },
] as const;

type DocumentType = (typeof documentTypes)[number]["value"];
type EditorPayload = Record<string, unknown>;
type EditorDocument = { id: number; documentType: DocumentType; slug: string; payload: EditorPayload; sortOrder: number; isPublished: boolean };

type FieldSpec = { key: string; label: string; placeholder?: string; multiline?: boolean; type?: "text" | "url" | "email" | "date" | "select"; options?: string[] };

const fieldsByType: Record<DocumentType, FieldSpec[]> = {
  hero: [
    { key: "heroKicker", label: "Kicker", placeholder: "AKBAR NAWASUNDA / PRODUCER" },
    { key: "heroTitle", label: "Hero title", placeholder: "Akbar Nawasunda" },
    { key: "heroBody", label: "Hero copy", multiline: true, placeholder: "One concise public sentence." },
    { key: "heroImage", label: "Hero image URL", type: "url", placeholder: "/manus-storage/... or /assets/..." },
    { key: "primaryActionLabel", label: "Primary action label", placeholder: "LISTEN NOW" },
    { key: "primaryActionUrl", label: "Primary action URL", type: "url", placeholder: "https://..." },
  ],
  profile: [
    { key: "shortBio", label: "Short bio", multiline: true },
    { key: "longBio", label: "Long bio", multiline: true },
    { key: "location", label: "Location", placeholder: "Bandung Barat, Indonesia" },
    { key: "genresText", label: "Genres", placeholder: "Breakbeat, Indo Bass, Jedag Jedug" },
    { key: "portraitImage", label: "Portrait image URL", type: "url" },
    { key: "artistStatement", label: "Artist statement", multiline: true },
  ],
  pressKit: [
    { key: "intro", label: "EPK intro", multiline: true },
    { key: "bookingEmail", label: "Booking email", type: "email" },
    { key: "pressEmail", label: "Press email", type: "email" },
    { key: "oneSheetUrl", label: "One sheet URL", type: "url" },
    { key: "photoPackUrl", label: "Photo pack URL", type: "url" },
    { key: "logoPackUrl", label: "Logo pack URL", type: "url" },
    { key: "technicalRiderUrl", label: "Technical rider URL", type: "url" },
  ],
  siteSettings: [
    { key: "siteTitle", label: "Site title" },
    { key: "metaDescription", label: "Meta description", multiline: true },
    { key: "ogTitle", label: "Social title" },
    { key: "ogDescription", label: "Social description", multiline: true },
    { key: "socialPreviewUrl", label: "Social preview URL", type: "url" },
    { key: "canonicalUrl", label: "Canonical URL", type: "url" },
    { key: "contactEmail", label: "Contact email", type: "email" },
    { key: "bookingEmail", label: "Booking email", type: "email" },
    { key: "pressEmail", label: "Press email", type: "email" },
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
    { key: "artworkUrl", label: "Artwork URL", type: "url" },
    { key: "story", label: "Release story", multiline: true },
    { key: "credits", label: "Credits", multiline: true },
    { key: "spotifyUrl", label: "Spotify URL", type: "url" },
    { key: "appleMusicUrl", label: "Apple Music URL", type: "url" },
  ],
  visual: [
    { key: "title", label: "Visual title" },
    { key: "label", label: "Label", placeholder: "LATEST VISUAL" },
    { key: "youtubeId", label: "YouTube ID", placeholder: "e.g. rv4DK8nVWd0" },
    { key: "url", label: "Official visual URL", type: "url" },
    { key: "imageUrl", label: "Thumbnail URL", type: "url" },
  ],
  live: [
    { key: "status", label: "Status", type: "select", options: ["standby", "announced", "active"] },
    { key: "message", label: "Public message", multiline: true },
    { key: "actionUrl", label: "Action URL", type: "url" },
  ],
  event: [
    { key: "title", label: "Event title" },
    { key: "date", label: "Date", type: "date" },
    { key: "city", label: "City" },
    { key: "venue", label: "Venue" },
    { key: "country", label: "Country" },
    { key: "posterUrl", label: "Poster URL", type: "url" },
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

function preparedPayload(type: DocumentType, payload: EditorPayload) {
  const next = { ...payload };
  if (type === "profile") {
    next.genres = textValue(next, "genresText").split(",").map(value => value.trim()).filter(Boolean);
    delete next.genresText;
  }
  if (type === "legal") {
    next.sections = textValue(next, "sectionsText").split("\n").map(line => line.trim()).filter(Boolean).map(line => {
      const [key, heading, ...bodyParts] = line.split("|").map(value => value.trim());
      return { key, heading, body: bodyParts.join(" | ") };
    });
    delete next.sectionsText;
  }
  return next;
}

function displayPayload(document: EditorDocument): EditorPayload {
  const next = { ...document.payload };
  if (document.documentType === "profile" && Array.isArray(next.genres)) next.genresText = next.genres.join(", ");
  if (document.documentType === "legal" && Array.isArray(next.sections)) next.sectionsText = next.sections.map(section => `${String(section.key || "")} | ${String(section.heading || "")} | ${String(section.body || "")}`).join("\n");
  return next;
}

function StudioOperations() {
  const content = trpc.content.documentsAll.useQuery();
  const leads = trpc.fanSignal.list.useQuery();
  const published = content.data?.filter(item => item.isPublished).length ?? 0;
  return <section className="grid gap-4 md:grid-cols-3"><article className="rounded-xl border bg-card p-5"><Database className="h-5 w-5 text-primary" /><p className="mt-5 text-3xl font-semibold">{content.isLoading ? "—" : published}</p><p className="mt-1 text-sm text-muted-foreground">Published custom documents</p></article><article className="rounded-xl border bg-card p-5"><Check className="h-5 w-5 text-primary" /><p className="mt-5 text-3xl font-semibold">{content.isLoading ? "—" : content.data?.length ?? 0}</p><p className="mt-1 text-sm text-muted-foreground">Managed documents</p></article><a href="/assets" className="rounded-xl border bg-card p-5 transition-colors hover:bg-accent"><FolderOpen className="h-5 w-5 text-primary" /><p className="mt-5 text-base font-semibold">Asset Library <ArrowUpRight className="inline h-4 w-4" /></p><p className="mt-1 text-sm text-muted-foreground">Upload and replace visual media.</p></a>{leads.isError ? <p className="md:col-span-3 text-sm text-destructive">Fan leads could not be loaded.</p> : null}</section>;
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

  function resetEditor(nextType: DocumentType = documentType) {
    setDocumentType(nextType); setSlug("default"); setPayload(emptyPayload(nextType)); setSortOrder(0); setIsPublished(true); setEditingId(null);
  }
  function loadDocument(document: EditorDocument) {
    setDocumentType(document.documentType); setSlug(document.slug); setPayload(displayPayload(document)); setSortOrder(document.sortOrder); setIsPublished(document.isPublished); setEditingId(document.id);
  }
  function updateField(key: string, value: string | boolean) { setPayload(current => ({ ...current, [key]: value })); }
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    save.mutate({ documentType, slug: slug || "default", payload: preparedPayload(documentType, payload), sortOrder, isPublished });
  }
  function confirmDelete(document: EditorDocument) {
    if (window.confirm(`Remove ${document.documentType} / ${document.slug}?`)) remove.mutate({ id: document.id });
  }

  if (loading) return <div className="min-h-screen grid place-items-center text-sm">Checking studio access…</div>;
  if (!user) return <main className="min-h-screen grid place-items-center p-6"><section className="max-w-md text-center"><ShieldCheck className="mx-auto mb-5 h-9 w-9" /><h1 className="text-3xl font-semibold">Studio access</h1><p className="mt-3 text-muted-foreground">Sign in with the owner account to manage the website.</p><Button className="mt-7" onClick={() => startLogin()}>Sign in to continue</Button></section></main>;
  if (user.role !== "admin") return <main className="min-h-screen grid place-items-center p-6"><section className="max-w-md text-center"><ShieldCheck className="mx-auto mb-5 h-9 w-9" /><h1 className="text-3xl font-semibold">Owner access required</h1><p className="mt-3 text-muted-foreground">This editor is reserved for the authenticated site owner.</p><a className="mt-7 inline-flex items-center gap-2 underline" href="/">Return to public site <ArrowUpRight size={15} /></a></section></main>;

  return <DashboardLayout><div className="mx-auto max-w-7xl space-y-8"><header className="flex flex-wrap items-end justify-between gap-5"><div><p className="text-xs font-mono tracking-[.16em] text-muted-foreground">AN // CUSTOM WEBSITE EDITOR</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Operate the public site</h1><p className="mt-2 max-w-3xl text-sm text-muted-foreground">Edit content, attach managed media, save drafts, publish reviewed changes, and verify the public route from one owner-only workspace. This editor uses the website database and does not require Sanity.</p></div><div className="flex gap-3"><a className="inline-flex items-center gap-2 text-sm underline" href="/assets">Asset Library <FolderOpen size={15} /></a><a className="inline-flex items-center gap-2 text-sm underline" href="/" target="_blank" rel="noreferrer">Open public site <ArrowUpRight size={15} /></a></div></header><StudioOperations /><div className="grid gap-7 xl:grid-cols-[1fr_1.15fr]"><form onSubmit={submit} className="rounded-xl border bg-card p-5 shadow-sm"><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2"><FilePenLine size={18} /><h2 className="font-semibold">{editingId ? "Edit document" : "New document"}</h2></div>{editingId ? <Button type="button" variant="outline" onClick={() => resetEditor()}>New document</Button> : null}</div><label className="grid gap-2 text-sm">Document type<select value={documentType} onChange={event => resetEditor(event.target.value as DocumentType)} className="h-10 rounded-md border bg-background px-3">{documentTypes.map(type => <option value={type.value} key={type.value}>{type.label}</option>)}</select></label><label className="mt-4 grid gap-2 text-sm">Document slug<Input value={slug} onChange={event => setSlug(event.target.value)} placeholder="default or release-slug" /></label><div className="mt-5 grid gap-4 sm:grid-cols-2">{fields.map(field => <label className={`grid gap-2 text-sm ${field.multiline ? "sm:col-span-2" : ""}`} key={field.key}>{field.label}{field.type === "select" ? <select value={textValue(payload, field.key)} onChange={event => updateField(field.key, event.target.value)} className="h-10 rounded-md border bg-background px-3">{field.options?.map(option => <option value={option} key={option}>{option}</option>)}</select> : field.multiline ? <Textarea value={textValue(payload, field.key)} onChange={event => updateField(field.key, event.target.value)} placeholder={field.placeholder} rows={4} /> : <Input type={field.type || "text"} value={textValue(payload, field.key)} onChange={event => updateField(field.key, event.target.value)} placeholder={field.placeholder} />}</label>)}</div>{documentType === "release" ? <label className="mt-4 flex items-center gap-2 text-sm"><input type="checkbox" checked={Boolean(payload.isCurrent)} onChange={event => updateField("isCurrent", event.target.checked)} /> Mark as current release</label> : null}{documentType === "legal" ? <label className="mt-4 flex items-center gap-2 text-sm"><input type="checkbox" checked={Boolean(payload.readyForPublic)} onChange={event => updateField("readyForPublic", event.target.checked)} /> Mark legal document ready for public</label> : null}<div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="grid gap-2 text-sm">Sort order<Input type="number" min="0" value={sortOrder} onChange={event => setSortOrder(Number(event.target.value))} /></label><label className="flex items-end gap-2 pb-2 text-sm"><input type="checkbox" checked={isPublished} onChange={event => setIsPublished(event.target.checked)} /> Publish immediately</label></div><p className="mt-4 rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">For image, audio, video, or PDF changes, upload the file in <a className="underline" href="/assets">Asset Library</a>, then paste its managed URL into this document.</p><Button className="mt-6 w-full" disabled={save.isPending}>{save.isPending ? "Saving…" : isPublished ? "Save & publish" : "Save draft"}</Button></form><section className="rounded-xl border bg-card p-5"><div className="mb-5 flex items-center justify-between gap-3"><div className="flex items-center gap-2"><Database size={18} /><h2 className="font-semibold">Managed documents</h2></div><span className="text-xs text-muted-foreground">{documents.data?.length ?? 0} total</span></div>{documents.isLoading ? <p className="text-sm text-muted-foreground">Loading documents…</p> : documents.isError ? <p className="text-sm text-destructive">Could not load documents.</p> : documents.data?.length ? <div className="space-y-3">{documents.data.map(document => <div className={`rounded-lg border p-4 ${editingId === document.id ? "border-primary bg-primary/5" : ""}`} key={document.id}><button type="button" className="w-full text-left" onClick={() => loadDocument(document)}><div className="flex justify-between gap-3"><span className="font-mono text-xs uppercase text-muted-foreground">{document.documentType} · {document.slug}</span><span className={document.isPublished ? "text-xs text-green-600" : "text-xs text-muted-foreground"}>{document.isPublished ? "Published" : "Draft"}</span></div><p className="mt-2 font-medium">{textValue(document.payload, "title") || textValue(document.payload, "siteTitle") || textValue(document.payload, "heroTitle") || document.slug}</p><p className="mt-1 line-clamp-2 text-xs text-muted-foreground">Updated {new Date(document.updatedAt).toLocaleString()}</p></button><div className="mt-3 flex justify-end"><Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => confirmDelete(document)} disabled={remove.isPending}><Trash2 size={14} /> Remove</Button></div></div>)}</div> : <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">No custom documents yet. The public site keeps its verified local fallback until you publish a document here.</div>}</section></div></div></DashboardLayout>;
}
