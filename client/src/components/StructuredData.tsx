import { useEffect } from "react";
import { useLocation } from "@/lib/navigation";
import { usePublicArtistContent } from "@/content/publicContent";
import { buildSiteStructuredData } from "@/content/structuredData";

/**
 * Structured data di client.
 *
 * Memakai builder yang sama dengan SSR, jadi hidrasi tidak pernah menurunkan
 * kualitas JSON-LD yang sudah dikirim server (WebSite + WebPage + MusicGroup
 * + entitas rute). Script hanya diperbarui saat isinya memang berubah.
 */
export function StructuredData() {
  const [location] = useLocation();
  const cms = usePublicArtistContent();

  useEffect(() => {
    const isEnglish = location === "/en" || location.startsWith("/en/");
    const path = (location.split("?")[0] || "/").replace(/\/+$/, "") || "/";
    const payload = buildSiteStructuredData({
      path,
      isEnglish,
      content: cms.data,
      title: document.title,
      description:
        document.head
          .querySelector<HTMLMetaElement>('meta[name="description"]')
          ?.content || undefined,
    });

    const scriptId = "akbar-structured-data";
    const existing = document.getElementById(scriptId);
    const script =
      existing instanceof HTMLScriptElement
        ? existing
        : document.head.appendChild(document.createElement("script"));
    script.id = scriptId;
    script.type = "application/ld+json";
    const serialized = JSON.stringify(payload);
    if (script.textContent !== serialized) script.textContent = serialized;
  }, [cms.data, location]);

  return null;
}
