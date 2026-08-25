const WHITE_LABEL_MEDIA: Record<string, string> = {
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663907101550/qdnFVUsmqPWcPbsv.jpg": "/media/portrait/neon-portrait.jpg",
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663907101550/zMxYKACXxuHdtyVJ.jpg": "/media/portrait/kx07-portrait.jpg",
  "https://akbarfolio-424qdvsv.manus.space/manus-storage/akbar-nawasunda-rmx-mark_d59968bf.jpg": "/media/brand/rmx-mark.jpg",
  "https://akbarfolio-424qdvsv.manus.space/manus-storage/akbar-nawasunda-official-portrait_2c39f68f.jpg": "/media/portrait/official-portrait.jpg",
  "/manus-storage/akbar-nawasunda-rmx-mark_d59968bf.jpg": "/media/brand/rmx-mark.jpg",
  "/manus-storage/akbar-nawasunda-official-portrait_2c39f68f.jpg": "/media/portrait/official-portrait.jpg",
};

const MEDIA_KEYS = [
  "heroImage",
  "portraitImage",
  "oneSheetUrl",
  "photoPackUrl",
  "logoPackUrl",
  "technicalRiderUrl",
  "socialPreviewUrl",
  "imageUrl",
  "artworkUrl",
  "posterUrl",
] as const;

type PublicDocument = {
  payload: Record<string, unknown>;
  [key: string]: unknown;
};

export function whiteLabelMediaUrl(value: unknown): unknown {
  if (typeof value !== "string") return value;
  const candidate = value.trim();
  return WHITE_LABEL_MEDIA[candidate] || candidate;
}

/**
 * Redacts known upstream storage references from public CMS responses while
 * leaving the admin response untouched for Studio editing.
 */
function isPublicPlaceholderDocument(document: PublicDocument): boolean {
  const documentType = String(document.documentType || "").toLowerCase();
  if (documentType !== "event" && documentType !== "live") return false;
  const payload = document.payload;
  const title = String(payload.title || "").trim();
  const identity = `${title} ${String(payload.venue || "")} ${String(payload.city || "")}`.trim();
  return /^malas-malasan aja\b/i.test(title) || /ololololololo|bandoeng multiverse/i.test(identity);
}

export function sanitizePublicDocuments<T extends PublicDocument>(documents: T[]): T[] {
  return documents.filter(document => !isPublicPlaceholderDocument(document)).map(document => {
    const payload = { ...document.payload };
    for (const key of MEDIA_KEYS) {
      if (key in payload) payload[key] = whiteLabelMediaUrl(payload[key]);
    }
    return { ...document, payload };
  });
}

export function publicMediaSource(pathname: string): string | undefined {
  const key = pathname.replace(/^\/media\//, "/media/");
  return {
    "/media/portrait/neon-portrait.jpg": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663907101550/qdnFVUsmqPWcPbsv.jpg",
    "/media/portrait/kx07-portrait.jpg": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663907101550/zMxYKACXxuHdtyVJ.jpg",
    "/media/portrait/official-portrait.jpg": "https://akbarfolio-424qdvsv.manus.space/manus-storage/akbar-nawasunda-official-portrait_2c39f68f.jpg",
    "/media/brand/rmx-mark.jpg": "https://akbarfolio-424qdvsv.manus.space/manus-storage/akbar-nawasunda-rmx-mark_d59968bf.jpg",
  }[key];
}
