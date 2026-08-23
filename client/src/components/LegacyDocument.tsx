import { useEffect, useState } from "react";

const homeScripts = ["translations.js", "audio.js", "jedag-run.js", "share-card.js?v=2", "app.js?v=16", "wav-export.js", "content-render.js?v=14", "fx.js?v=2", "particles.js?v=6", "previews.js?v=2", "embed-skin.js?v=3", "footer.js?v=2", "newsletter.js?v=1", "smart-collab.js?v=1", "seo-jsonld.js"];

type Props = { source: string; scripts?: "home" | "none" };
type RuntimeEntry = {
  refs: number;
  active: boolean;
  tags: HTMLScriptElement[];
  styleLinks: HTMLLinkElement[];
  fontLink: HTMLLinkElement;
  disposeTimer?: number;
};

const runtimeEntries = new Map<string, RuntimeEntry>();

export default function LegacyDocument({ source, scripts = "home" }: Props) {
  const [markup, setMarkup] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch(source)
      .then((response) => { if (!response.ok) throw new Error("Unable to load legacy page"); return response.text(); })
      .then((html) => {
        if (!active) return;
        const parsed = new DOMParser().parseFromString(html, "text/html");
        setMarkup(parsed.body.innerHTML.replace(/src="assets\//g, 'src="/assets/').replace(/href="assets\//g, 'href="/assets/').replace(/href="\/favicon\.png/g, 'href="/assets/akbar-favicon.jpg'));
      })
      .catch((reason: unknown) => active && setError(reason instanceof Error ? reason.message : "Unable to load page"));
    return () => { active = false; };
  }, [source]);

  useEffect(() => {
    if (!markup) return;
    const runtimeKey = source;
    const existingEntry = runtimeEntries.get(runtimeKey);
    if (existingEntry) {
      existingEntry.refs += 1;
      if (existingEntry.disposeTimer) window.clearTimeout(existingEntry.disposeTimer);
      return () => releaseRuntime(runtimeKey, existingEntry);
    }
    const styleLinks = ["/legacy/style.css"].map((href) => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      document.head.appendChild(link);
      return link;
    });
    const fontLink = document.createElement("link");
    fontLink.rel = "stylesheet";
    fontLink.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;700;800&family=Bebas+Neue&family=Space+Grotesk:wght@500;700&family=Chakra+Petch:wght@400;500;600;700&family=Lora:ital,wght@0,400;0,500;1,400&family=Anton&family=JetBrains+Mono:wght@400;600&display=swap";
    document.head.appendChild(fontLink);
    const sources = scripts === "home" ? homeScripts.map((name) => `/assets/js/${name}`) : [];
    const entry: RuntimeEntry = { refs: 1, active: true, tags: [], styleLinks, fontLink };
    runtimeEntries.set(runtimeKey, entry);
    const load = async () => {
      if (scripts === "home") {
        await new Promise<void>((resolve) => {
          const tag = document.createElement("script"); tag.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"; tag.crossOrigin = "anonymous"; tag.onload = () => resolve(); tag.onerror = () => resolve(); document.head.appendChild(tag); entry.tags.push(tag);
        });
      }
      for (const src of sources) {
        if (!entry.active) return;
        await new Promise<void>((resolve) => { const tag = document.createElement("script"); tag.src = src; tag.onload = () => resolve(); tag.onerror = () => resolve(); document.body.appendChild(tag); entry.tags.push(tag); });
      }
      if (entry.active && import.meta.env.PROD && "serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    };
    void load();
    return () => releaseRuntime(runtimeKey, entry);
  }, [markup, source]);

  if (error) return <main className="container py-16"><p role="alert">{error}</p><a href="/">Return to the archive</a></main>;
  return <div className="legacy-root" dangerouslySetInnerHTML={{ __html: markup }} />;
}

function releaseRuntime(key: string, entry: RuntimeEntry) {
  entry.refs -= 1;
  if (entry.refs > 0) return;
  entry.disposeTimer = window.setTimeout(() => {
    if (entry.refs > 0) return;
    entry.active = false;
    entry.tags.forEach((tag) => tag.remove());
    entry.styleLinks.forEach((link) => link.remove());
    entry.fontLink.remove();
    runtimeEntries.delete(key);
  }, 100);
}
