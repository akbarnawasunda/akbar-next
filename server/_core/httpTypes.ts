export type HeaderValue = string | string[] | undefined;

/** Minimal request shape shared by Next.js handlers and server-side services. */
export type AppRequest = {
  headers: Record<string, HeaderValue>;
  protocol?: string;
  ip?: string;
  query?: Record<string, unknown>;
  method?: string;
  url?: string;
  originalUrl?: string;
};

export type SessionCookieOptions = {
  domain?: string;
  httpOnly?: boolean;
  path?: string;
  sameSite?: "lax" | "strict" | "none";
  secure?: boolean;
  maxAge?: number;
  expires?: Date;
};

export type CookieResponse = {
  cookie(
    name: string,
    value: string,
    options?: SessionCookieOptions,
  ): unknown;
  clearCookie(name: string, options?: SessionCookieOptions): unknown;
};
