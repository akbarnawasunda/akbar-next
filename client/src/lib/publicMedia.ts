/**
 * Returns a media reference that is already safe for the public client.
 * Upstream allowlisting and legacy URL normalization live server-side so
 * private storage hostnames are never shipped in the browser bundle.
 */
export function publicMediaUrl(value: string | undefined | null): string | undefined {
  const candidate = typeof value === "string" ? value.trim() : "";
  return candidate || undefined;
}

export function isWhiteLabelMediaPath(value: string | undefined | null): boolean {
  return typeof value === "string" && value.startsWith("/media/");
}
