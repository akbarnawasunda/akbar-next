import superjson from "superjson";
import type { HeadMeta } from "../../client/src/ssr/prefetch";

const SITE_NAME = process.env.SITE_NAME || "Akbar Nawasunda | Official Website";
const CANONICAL_ORIGIN = (process.env.CANONICAL_ORIGIN || "https://akbarnawasunda.my.id").replace(/\/$/, "");
const OG_LOCALE = process.env.OG_LOCALE || "id_ID";

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const clampText = (value: string, max: number) => {
  const text = value.replace(/\s+/g, " ").trim();
  if (text.length <= max) return text;
  const cut = text.lastIndexOf(" ", max);
  return `${text.slice(0, cut > max * 0.6 ? cut : max)}…`;
};

const metaText = (value: string, max: number) => clampText(value.replace(/[#*_`~]+/g, ""), max);

export function buildHeadTags(head: HeadMeta): string {
  const title = escapeHtml(clampText(head.title, 70) || SITE_NAME);
  const description = escapeHtml(metaText(head.description, 200));
  const canonicalUrl = head.canonicalPath ? `${CANONICAL_ORIGIN}${head.canonicalPath}` : "";
  const image = head.ogImage?.startsWith("//")
    ? `https:${head.ogImage}`
    : head.ogImage?.startsWith("/")
      ? `${CANONICAL_ORIGIN}${head.ogImage}`
      : head.ogImage;
  const tags = [
    `<title>${title}</title>`,
    `<meta name="description" content="${description}" />`,
    `<meta property="og:type" content="${head.ogType || "website"}" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:locale" content="${escapeHtml(head.locale || OG_LOCALE)}" />`,
    `<meta property="og:site_name" content="${escapeHtml(SITE_NAME)}" />`,
    `<meta name="twitter:card" content="${image ? "summary_large_image" : "summary"}" />`,
    `<meta name="twitter:title" content="${title}" />`,
    `<meta name="twitter:description" content="${description}" />`,
  ];
  if (image) {
    tags.push(`<meta property="og:image" content="${escapeHtml(image)}" />`);
    tags.push(`<meta name="twitter:image" content="${escapeHtml(image)}" />`);
    if (head.ogImageWidth) tags.push(`<meta property="og:image:width" content="${head.ogImageWidth}" />`);
    if (head.ogImageHeight) tags.push(`<meta property="og:image:height" content="${head.ogImageHeight}" />`);
    if (head.ogImageAlt) tags.push(`<meta property="og:image:alt" content="${escapeHtml(head.ogImageAlt)}" />`);
  }
  if (canonicalUrl) {
    tags.push(`<meta property="og:url" content="${escapeHtml(canonicalUrl)}" />`);
    tags.push(`<link rel="canonical" href="${escapeHtml(canonicalUrl)}" />`);
    if (!head.noindex && !head.notFound) {
      const canonicalPath = head.canonicalPath || "/";
      const isEnglish = canonicalPath === "/en" || canonicalPath.startsWith("/en/");
      const idPath = isEnglish ? canonicalPath.replace(/^\/en(?=\/|$)/, "") || "/" : canonicalPath;
      const enPath = isEnglish ? canonicalPath : canonicalPath === "/" ? "/en" : `/en${canonicalPath}`;
      const languageLinks = [
        ["id", `${CANONICAL_ORIGIN}${idPath}`],
        ["en", `${CANONICAL_ORIGIN}${enPath}`],
        ["x-default", `${CANONICAL_ORIGIN}${idPath}`],
      ];
      languageLinks.forEach(([language, href]) => {
        tags.push(`<link data-language-link="true" rel="alternate" hreflang="${language}" href="${escapeHtml(href)}" />`);
      });
    }
  }
  if (head.noindex || head.notFound) tags.push(`<meta name="robots" content="noindex, follow" />`);
  return tags.join("\n");
}

export function structuredDataScript(value: unknown): string {
  const serialized = JSON.stringify(value).replace(/</g, "\\u003c");
  return `<script id="akbar-structured-data" type="application/ld+json">${serialized}</script>`;
}

export function composeHtml(template: string, appHtml: string, head: HeadMeta, dehydratedState: unknown) {
  // Keep the client contract stable: entry-client reads __RQ_STATE__ as a JSON string
  // and parses it before passing the SuperJSON payload to HydrationBoundary. The
  // extra JSON.stringify wraps the serialized payload as a JS string; assigning the
  // object directly makes JSON.parse(object) throw and aborts hydration/preload.
  const serializedState = JSON.stringify(superjson.serialize(dehydratedState)).replace(/</g, "\\u003c");
  const stateScript = `<script>window.__RQ_STATE__ = ${JSON.stringify(serializedState)}</script>`;
  const structuredData = head.structuredData ? structuredDataScript(head.structuredData) : "";
  const language = head.locale?.startsWith("en") ? "en" : "id";
  return template
    .replace('<html lang="id">', `<html lang="${language}">`)
    .replace("</body>", () => `${stateScript}</body>`)
    .replace("<!--app-head-->", () => `${buildHeadTags(head)}${structuredData}`)
    .replace("<!--app-html-->", () => appHtml);
}
