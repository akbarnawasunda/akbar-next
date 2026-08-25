// server/vercelSsrHandler.ts
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

// server/routers.ts
import { z as z2 } from "zod";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var AXIOS_TIMEOUT_MS = 3e4;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";
var decodeOAuthState = (state) => {
  let decoded;
  try {
    decoded = atob(state);
  } catch {
    return { redirectUri: "" };
  }
  try {
    const parsed = JSON.parse(decoded);
    if (parsed && typeof parsed.redirectUri === "string") return parsed;
  } catch {
  }
  return { redirectUri: decoded };
};

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req)
  };
}

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
import { TRPCError } from "@trpc/server";

// server/_core/env.ts
var ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? process.env.SESSION_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  resendFromEmail: process.env.RESEND_FROM_EMAIL ?? "Akbar Nawasunda <news@updates.akbarnawasunda.my.id>",
  resendSegmentId: process.env.RESEND_SEGMENT_ID ?? ""
};

// server/_core/notification.ts
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/routers.ts
import { TRPCError as TRPCError4 } from "@trpc/server";

// server/db.ts
import { and, asc, eq, like, notLike } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";

// drizzle/schema.ts
import { boolean, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";
var users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull()
});
var storedAssets = mysqlTable("storedAssets", {
  id: int("id").autoincrement().primaryKey(),
  ownerId: int("ownerId").notNull(),
  fileKey: varchar("fileKey", { length: 512 }).notNull().unique(),
  url: varchar("url", { length: 1024 }).notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  mimeType: varchar("mimeType", { length: 128 }).notNull(),
  size: int("size").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var fanSignals = mysqlTable("fanSignals", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  source: varchar("source", { length: 64 }).notNull().default("home"),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var artistContent = mysqlTable("artistContent", {
  id: int("id").autoincrement().primaryKey(),
  kind: mysqlEnum("kind", ["hero", "release", "video", "live"]).notNull(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  subtitle: text("subtitle").notNull(),
  label: varchar("label", { length: 128 }).notNull().default(""),
  href: varchar("href", { length: 1024 }).notNull().default(""),
  imageUrl: varchar("imageUrl", { length: 1024 }).notNull().default(""),
  sortOrder: int("sortOrder").notNull().default(0),
  isPublished: boolean("isPublished").notNull().default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var artistInquiries = mysqlTable("artistInquiries", {
  id: int("id").autoincrement().primaryKey(),
  inquiryType: mysqlEnum("inquiryType", ["booking", "remix", "collaboration", "licensing"]).notNull(),
  name: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  organization: varchar("organization", { length: 160 }),
  projectTitle: varchar("projectTitle", { length: 255 }).notNull(),
  location: varchar("location", { length: 160 }),
  timeline: varchar("timeline", { length: 160 }),
  budgetContext: varchar("budgetContext", { length: 255 }),
  message: text("message").notNull(),
  source: mysqlEnum("source", ["epk", "release", "universe", "licensing"]).notNull(),
  status: mysqlEnum("status", ["new", "reviewed", "closed"]).notNull().default("new"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});

// server/customContent.ts
var customDocumentTypes = [
  "hero",
  "profile",
  "pressKit",
  "siteSettings",
  "legal",
  "release",
  "visual",
  "live",
  "event"
];
var prefixes = {
  hero: "custom-hero",
  profile: "custom-profile",
  pressKit: "custom-press-kit",
  siteSettings: "custom-site-settings",
  legal: "custom-legal",
  release: "custom-release",
  visual: "custom-visual",
  live: "custom-live-signal",
  event: "custom-event"
};
var singletonTypes = /* @__PURE__ */ new Set([
  "hero",
  "profile",
  "pressKit",
  "siteSettings",
  "legal",
  "live"
]);
function stringValue(value, fallback) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}
function documentTitle(type, payload) {
  const defaults = {
    hero: "Homepage hero",
    profile: "Artist profile",
    pressKit: "Press and booking",
    siteSettings: "Site settings",
    legal: "Privacy policy",
    release: "Untitled release",
    visual: "Untitled visual",
    live: "Live signal",
    event: "Untitled event"
  };
  return stringValue(payload.title, stringValue(payload.siteTitle, defaults[type]));
}
function documentLabel(type, payload) {
  if (typeof payload.label === "string") return payload.label;
  if (type === "release") return stringValue(payload.format, "Release");
  if (type === "visual") return "Official visual";
  if (type === "event") return stringValue(payload.status, "announced");
  return type;
}
function documentHref(payload) {
  return stringValue(payload.href, stringValue(payload.url, stringValue(payload.ticketUrl, "")));
}
function documentImage(payload) {
  return stringValue(
    payload.imageUrl,
    stringValue(payload.artworkUrl, stringValue(payload.heroImage, stringValue(payload.posterUrl, stringValue(payload.portraitImage, ""))))
  );
}
function parseEnvelope(raw) {
  try {
    const parsed = JSON.parse(raw);
    if (parsed.schemaVersion === 1 && parsed.data && typeof parsed.data === "object" && !Array.isArray(parsed.data)) {
      return parsed.data;
    }
  } catch {
  }
  return {};
}
function storageSlug(documentType, logicalSlug2) {
  const normalized = logicalSlug2.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
  const prefix = prefixes[documentType];
  return singletonTypes.has(documentType) ? prefix : `${prefix}-${normalized || "untitled"}`;
}
function logicalSlug(documentType, storedSlug) {
  const prefix = prefixes[documentType];
  if (singletonTypes.has(documentType)) return documentType;
  return storedSlug.slice(`${prefix}-`.length) || "untitled";
}
function documentTypeFromStorageSlug(storedSlug) {
  if (!storedSlug.startsWith("custom-")) return null;
  const match = Object.entries(prefixes).sort(([, a], [, b]) => b.length - a.length).find(([, prefix]) => storedSlug === prefix || storedSlug.startsWith(`${prefix}-`));
  return match?.[0] ?? null;
}
function toCustomArtistDocument(row) {
  const documentType = documentTypeFromStorageSlug(row.slug);
  if (!documentType) return null;
  return {
    id: row.id,
    documentType,
    slug: logicalSlug(documentType, row.slug),
    payload: parseEnvelope(row.subtitle),
    sortOrder: row.sortOrder,
    isPublished: row.isPublished,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  };
}
function toCustomArtistDocuments(rows) {
  return rows.map(toCustomArtistDocument).filter((document) => Boolean(document));
}
function toArtistContentInput(input) {
  const storedSlug = storageSlug(input.documentType, input.slug);
  const envelope = { schemaVersion: 1, data: input.payload };
  const kind = input.documentType === "release" ? "release" : input.documentType === "visual" ? "video" : input.documentType === "live" || input.documentType === "event" ? "live" : "hero";
  return {
    kind,
    slug: storedSlug,
    title: documentTitle(input.documentType, input.payload),
    subtitle: JSON.stringify(envelope),
    label: documentLabel(input.documentType, input.payload),
    href: documentHref(input.payload),
    imageUrl: documentImage(input.payload),
    sortOrder: input.sortOrder,
    isPublished: input.isPublished
  };
}

// server/db.ts
var _db = null;
function normalizeDatabaseUrl(raw) {
  try {
    const url = new URL(raw);
    url.searchParams.delete("ssl-mode");
    return url.toString();
  } catch {
    return raw;
  }
}
async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const sslCa = process.env.DATABASE_SSL_CA?.replace(/\\n/g, "\n");
      _db = drizzle({
        connection: {
          uri: normalizeDatabaseUrl(process.env.DATABASE_URL),
          ssl: sslCa ? { ca: sslCa, rejectUnauthorized: true } : { rejectUnauthorized: false }
        }
      });
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}
async function readWithRetry(operation, fallback) {
  let db = await getDb();
  if (!db) return fallback;
  try {
    return await operation(db);
  } catch (error) {
    console.error("[Database] Read failed; reconnecting once:", error);
    _db = null;
    db = await getDb();
    if (!db) return fallback;
    try {
      return await operation(db);
    } catch (retryError) {
      console.error("[Database] Read retry failed; using safe fallback:", retryError);
      return fallback;
    }
  }
}
async function upsertUser(user) {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values = {
      openId: user.openId
    };
    const updateSet = {};
    const textFields = ["name", "email", "loginMethod"];
    const assignNullable = (field) => {
      const value = user[field];
      if (value === void 0) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== void 0) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== void 0) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (!values.lastSignedIn) {
      values.lastSignedIn = /* @__PURE__ */ new Date();
    }
    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = /* @__PURE__ */ new Date();
    }
    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}
async function getUserByOpenId(openId) {
  return readWithRetry(
    async (db) => {
      const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
      return result.length > 0 ? result[0] : void 0;
    },
    void 0
  );
}
function isDuplicateDatabaseError(error) {
  const dbError = error;
  return dbError.code === "ER_DUP_ENTRY" || dbError.errno === 1062 || dbError.message?.toLowerCase().includes("duplicate") === true;
}
async function ensureDashboardUser(user) {
  if (!user.openId) throw new Error("Dashboard user openId is required");
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot ensure dashboard user: database not available");
    return;
  }
  const lastSignedIn = user.lastSignedIn ?? /* @__PURE__ */ new Date();
  const values = { ...user, lastSignedIn };
  const updateValues = {
    openId: user.openId,
    name: user.name ?? null,
    email: user.email ?? null,
    loginMethod: user.loginMethod ?? null,
    role: user.role ?? "user",
    lastSignedIn
  };
  const internalNameValues = { ...updateValues, name: user.openId };
  try {
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateValues });
  } catch (error) {
    if (!isDuplicateDatabaseError(error) || !user.name || user.name === user.openId) throw error;
    await db.insert(users).values({ ...values, name: user.openId }).onDuplicateKeyUpdate({ set: internalNameValues });
  }
}
async function createStoredAsset(asset) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db.insert(storedAssets).values(asset);
  return { id: Number(result[0].insertId), ...asset };
}
async function listStoredAssets(ownerId) {
  return readWithRetry(
    (db) => db.select().from(storedAssets).where(eq(storedAssets.ownerId, ownerId)),
    []
  );
}
async function createFanSignal(signal) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.insert(fanSignals).values(signal).onDuplicateKeyUpdate({
    set: { source: signal.source ?? "home" }
  });
  return { email: signal.email, source: signal.source ?? "home" };
}
async function listFanSignals() {
  return readWithRetry(
    (db) => db.select().from(fanSignals).orderBy(asc(fanSignals.createdAt)),
    []
  );
}
async function listPublishedArtistContent() {
  return readWithRetry(
    (db) => db.select().from(artistContent).where(and(eq(artistContent.isPublished, true), notLike(artistContent.slug, "custom-%"))).orderBy(asc(artistContent.sortOrder)),
    []
  );
}
async function listAllArtistContent() {
  return readWithRetry(
    (db) => db.select().from(artistContent).where(notLike(artistContent.slug, "custom-%")).orderBy(asc(artistContent.kind), asc(artistContent.sortOrder)),
    []
  );
}
async function upsertArtistContent(item) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.insert(artistContent).values(item).onDuplicateKeyUpdate({
    set: {
      kind: item.kind,
      title: item.title,
      subtitle: item.subtitle,
      label: item.label,
      href: item.href,
      imageUrl: item.imageUrl,
      sortOrder: item.sortOrder,
      isPublished: item.isPublished
    }
  });
  return { slug: item.slug };
}
async function listCustomArtistContent(publishedOnly = false) {
  const rows = await readWithRetry(
    (db) => db.select().from(artistContent).where(publishedOnly ? and(eq(artistContent.isPublished, true), like(artistContent.slug, "custom-%")) : like(artistContent.slug, "custom-%")).orderBy(asc(artistContent.sortOrder)),
    []
  );
  return toCustomArtistDocuments(rows);
}
async function upsertCustomArtistDocument(input) {
  const item = toArtistContentInput(input);
  const saved = await upsertArtistContent(item);
  return { ...saved, documentType: input.documentType, slug: input.slug };
}
async function deleteCustomArtistDocument(id) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const customRow = await db.select({ id: artistContent.id }).from(artistContent).where(and(eq(artistContent.id, id), like(artistContent.slug, "custom-%"))).limit(1);
  if (!customRow.length) throw new Error("Custom document not found");
  await db.delete(artistContent).where(and(eq(artistContent.id, id), like(artistContent.slug, "custom-%")));
  return { id };
}
async function createArtistInquiry(inquiry) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db.insert(artistInquiries).values(inquiry);
  return {
    id: Number(result[0].insertId),
    ...inquiry,
    status: inquiry.status ?? "new"
  };
}
async function listArtistInquiries() {
  return readWithRetry(
    (db) => db.select().from(artistInquiries).orderBy(asc(artistInquiries.status), asc(artistInquiries.createdAt)),
    []
  );
}
async function updateArtistInquiryStatus(id, status) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(artistInquiries).set({ status }).where(eq(artistInquiries.id, id));
  return { id, status };
}

// server/resend.ts
var RESEND_API_URL = "https://api.resend.com";
var RESEND_USER_AGENT = "akbarnawasunda-fan-signal/1.0";
var ResendApiError = class extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
    this.name = "ResendApiError";
  }
};
async function requestResend(path2, init = {}) {
  if (!ENV.resendApiKey) {
    throw new ResendApiError(503, "Resend is not configured");
  }
  const response = await fetch(`${RESEND_API_URL}${path2}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${ENV.resendApiKey}`,
      "Content-Type": "application/json",
      "User-Agent": RESEND_USER_AGENT,
      ...init.headers
    },
    signal: init.signal ?? AbortSignal.timeout(1e4)
  });
  const raw = await response.text();
  let data = null;
  try {
    const parsed = raw ? JSON.parse(raw) : null;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      data = parsed;
    }
  } catch {
    data = null;
  }
  return { response, data };
}
function throwResendError(result, fallback) {
  const providerMessage = typeof result.data?.message === "string" ? result.data.message : fallback;
  throw new ResendApiError(result.response.status, providerMessage);
}
function contactPayload(email, source) {
  const payload = {
    email,
    unsubscribed: false,
    properties: {
      source,
      channel: "fan-signal"
    }
  };
  if (ENV.resendSegmentId) {
    payload.segments = [{ id: ENV.resendSegmentId }];
  }
  return payload;
}
async function syncFanSignalContact(email, source) {
  if (!ENV.resendApiKey) {
    console.warn("[Resend] API key is not configured; keeping Fan Signal in the local database only");
    return { configured: false, synced: false };
  }
  const payload = contactPayload(email, source);
  const created = await requestResend("/contacts", {
    method: "POST",
    body: JSON.stringify(payload)
  });
  if (created.response.ok) {
    return {
      configured: true,
      synced: true,
      contactId: typeof created.data?.id === "string" ? created.data.id : void 0
    };
  }
  if ([400, 409, 422].includes(created.response.status)) {
    const updated = await requestResend(`/contacts/${encodeURIComponent(email)}`, {
      method: "PATCH",
      body: JSON.stringify({
        unsubscribed: false,
        properties: {
          source,
          channel: "fan-signal"
        }
      })
    });
    if (updated.response.ok) {
      return {
        configured: true,
        synced: true,
        contactId: typeof updated.data?.id === "string" ? updated.data.id : void 0
      };
    }
  }
  throwResendError(created, "Fan Signal contact sync failed");
}
function getResendReadiness() {
  return {
    configured: Boolean(ENV.resendApiKey),
    fromEmail: ENV.resendFromEmail,
    segmentConfigured: Boolean(ENV.resendSegmentId)
  };
}
async function createResendBroadcast(input) {
  if (!ENV.resendSegmentId) {
    throw new ResendApiError(503, "Resend segment is not configured");
  }
  const result = await requestResend("/broadcasts", {
    method: "POST",
    body: JSON.stringify({
      name: input.name,
      segment_id: ENV.resendSegmentId,
      from: ENV.resendFromEmail,
      subject: input.subject,
      html: input.html,
      text: input.text,
      send: false
    })
  });
  if (!result.response.ok) {
    throwResendError(result, "Broadcast draft creation failed");
  }
  return {
    id: typeof result.data?.id === "string" ? result.data.id : void 0
  };
}
async function sendResendBroadcast(broadcastId) {
  const result = await requestResend(`/broadcasts/${encodeURIComponent(broadcastId)}/send`, {
    method: "POST",
    body: JSON.stringify({})
  });
  if (!result.response.ok) {
    throwResendError(result, "Broadcast send failed");
  }
  return {
    id: typeof result.data?.id === "string" ? result.data.id : broadcastId
  };
}

// server/storage.ts
function getForgeConfig() {
  const forgeUrl = ENV.forgeApiUrl;
  const forgeKey = ENV.forgeApiKey;
  if (!forgeUrl || !forgeKey) {
    throw new Error(
      "Storage config missing: set BUILT_IN_FORGE_API_URL and BUILT_IN_FORGE_API_KEY"
    );
  }
  return { forgeUrl: forgeUrl.replace(/\/+$/, ""), forgeKey };
}
function normalizeKey(relKey) {
  return relKey.replace(/^\/+/, "");
}
function appendHashSuffix(relKey) {
  const hash = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  const lastDot = relKey.lastIndexOf(".");
  if (lastDot === -1) return `${relKey}_${hash}`;
  return `${relKey.slice(0, lastDot)}_${hash}${relKey.slice(lastDot)}`;
}
async function storagePut(relKey, data, contentType = "application/octet-stream") {
  const { forgeUrl, forgeKey } = getForgeConfig();
  const key = appendHashSuffix(normalizeKey(relKey));
  const presignUrl = new URL("v1/storage/presign/put", forgeUrl + "/");
  presignUrl.searchParams.set("path", key);
  const presignResp = await fetch(presignUrl, {
    headers: { Authorization: `Bearer ${forgeKey}` }
  });
  if (!presignResp.ok) {
    const msg = await presignResp.text().catch(() => presignResp.statusText);
    throw new Error(`Storage presign failed (${presignResp.status}): ${msg}`);
  }
  const { url: s3Url } = await presignResp.json();
  if (!s3Url) throw new Error("Forge returned empty presign URL");
  const blob = typeof data === "string" ? new Blob([data], { type: contentType }) : new Blob([data], { type: contentType });
  const uploadResp = await fetch(s3Url, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: blob
  });
  if (!uploadResp.ok) {
    throw new Error(`Storage upload to S3 failed (${uploadResp.status})`);
  }
  return { key, url: `/manus-storage/${key}` };
}

// server/dashboardAuth.ts
import { createHash, timingSafeEqual } from "node:crypto";
import { TRPCError as TRPCError3 } from "@trpc/server";

// shared/_core/errors.ts
var HttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
};
var ForbiddenError = (msg) => new HttpError(403, msg);

// server/_core/sdk.ts
import axios from "axios";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
var isNonEmptyString2 = (value) => typeof value === "string" && value.length > 0;
var EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
var GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
var GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;
var OAuthService = class {
  constructor(client) {
    this.client = client;
    console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
    if (!ENV.oAuthServerUrl) {
      console.error(
        "[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable."
      );
    }
  }
  decodeState(state) {
    return decodeOAuthState(state).redirectUri;
  }
  async getTokenByCode(code, state) {
    const payload = {
      clientId: ENV.appId,
      grantType: "authorization_code",
      code,
      redirectUri: this.decodeState(state)
    };
    const { data } = await this.client.post(
      EXCHANGE_TOKEN_PATH,
      payload
    );
    return data;
  }
  async getUserInfoByToken(token) {
    const { data } = await this.client.post(
      GET_USER_INFO_PATH,
      {
        accessToken: token.accessToken
      }
    );
    return data;
  }
};
var createOAuthHttpClient = () => axios.create({
  baseURL: ENV.oAuthServerUrl,
  timeout: AXIOS_TIMEOUT_MS
});
var SDKServer = class {
  client;
  oauthService;
  constructor(client = createOAuthHttpClient()) {
    this.client = client;
    this.oauthService = new OAuthService(this.client);
  }
  deriveLoginMethod(platforms, fallback) {
    if (fallback && fallback.length > 0) return fallback;
    if (!Array.isArray(platforms) || platforms.length === 0) return null;
    const set = new Set(
      platforms.filter((p) => typeof p === "string")
    );
    if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
    if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
    if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
    if (set.has("REGISTERED_PLATFORM_MICROSOFT") || set.has("REGISTERED_PLATFORM_AZURE"))
      return "microsoft";
    if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
    const first = Array.from(set)[0];
    return first ? first.toLowerCase() : null;
  }
  /**
   * Exchange OAuth authorization code for access token
   * @example
   * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
   */
  async exchangeCodeForToken(code, state) {
    return this.oauthService.getTokenByCode(code, state);
  }
  /**
   * Get user information using access token
   * @example
   * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
   */
  async getUserInfo(accessToken) {
    const data = await this.oauthService.getUserInfoByToken({
      accessToken
    });
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  parseCookies(cookieHeader) {
    if (!cookieHeader) {
      return /* @__PURE__ */ new Map();
    }
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }
  getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }
  /**
   * Create a session token for a Manus user openId
   * @example
   * const sessionToken = await sdk.createSessionToken(userInfo.openId);
   */
  async createSessionToken(openId, options = {}) {
    return this.signSession(
      {
        openId,
        appId: ENV.appId,
        name: options.name || ""
      },
      options
    );
  }
  async signSession(payload, options = {}) {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
    const secretKey = this.getSessionSecret();
    return new SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name
    }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
  }
  async verifySession(cookieValue) {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }
    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"]
      });
      const { openId, appId, name } = payload;
      if (!isNonEmptyString2(openId) || !isNonEmptyString2(appId) || !isNonEmptyString2(name)) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }
      return {
        openId,
        appId,
        name
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }
  async getUserInfoWithJwt(jwtToken) {
    const payload = {
      jwtToken,
      projectId: ENV.appId
    };
    const { data } = await this.client.post(
      GET_USER_INFO_WITH_JWT_PATH,
      payload
    );
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  async authenticateRequest(req) {
    const cookies = this.parseCookies(req.headers.cookie);
    let sessionToken = cookies.get(COOKIE_NAME);
    if (!sessionToken) {
      const authHeader = req.headers.authorization;
      if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
        sessionToken = authHeader.slice(7);
      }
    }
    const session = await this.verifySession(sessionToken);
    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }
    if (session.openId.startsWith(CRON_OPEN_ID_PREFIX)) {
      const userInfo = await this.getUserInfoWithJwt(sessionToken ?? "");
      const taskUid = userInfo.taskUid ?? null;
      if (!taskUid) {
        throw ForbiddenError("Cron session missing task_uid");
      }
      return buildCronUser(userInfo);
    }
    const sessionUserId = session.openId;
    const signedInAt = /* @__PURE__ */ new Date();
    let user;
    try {
      user = await getUserByOpenId(sessionUserId);
    } catch (error) {
      if (sessionUserId !== "dashboard-owner") throw error;
      console.warn("[Auth] Dashboard owner row lookup failed; using signed session identity", String(error));
      return buildDashboardUser(session);
    }
    if (!user && sessionUserId === "dashboard-owner") {
      return buildDashboardUser(session);
    }
    if (!user) {
      try {
        const userInfo = await this.getUserInfoWithJwt(sessionToken ?? "");
        await upsertUser({
          openId: userInfo.openId,
          name: userInfo.name || null,
          email: userInfo.email ?? null,
          loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
          lastSignedIn: signedInAt
        });
        user = await getUserByOpenId(userInfo.openId);
      } catch (error) {
        console.error("[Auth] Failed to sync user from OAuth:", error);
        throw ForbiddenError("Failed to sync user info");
      }
    }
    if (!user) {
      throw ForbiddenError("User not found");
    }
    await upsertUser({
      openId: user.openId,
      lastSignedIn: signedInAt
    });
    return user;
  }
};
var CRON_OPEN_ID_PREFIX = "cron_";
function buildDashboardUser(session) {
  const now = /* @__PURE__ */ new Date();
  return {
    id: -1,
    openId: session.openId,
    name: session.name,
    email: null,
    loginMethod: "dashboard",
    role: "admin",
    createdAt: now,
    updatedAt: now,
    lastSignedIn: now
  };
}
function buildCronUser(userInfo) {
  const now = /* @__PURE__ */ new Date();
  return {
    id: -1,
    openId: userInfo.openId,
    name: userInfo.name || "Manus Scheduled Task",
    email: null,
    loginMethod: null,
    role: "user",
    createdAt: now,
    updatedAt: now,
    lastSignedIn: now,
    taskUid: userInfo.taskUid ?? void 0,
    isCron: true
  };
}
var sdk = new SDKServer();

// server/dashboardAuth.ts
var DASHBOARD_OPEN_ID = "dashboard-owner";
var MAX_ATTEMPTS = 5;
var ATTEMPT_WINDOW_MS = 15 * 60 * 1e3;
var BLOCK_MS = 15 * 60 * 1e3;
var attempts = /* @__PURE__ */ new Map();
function clientKey(req) {
  const forwarded = req.headers["x-forwarded-for"];
  const firstForwarded = Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(",")[0];
  return (firstForwarded || req.ip || "unknown").trim();
}
function configuredPassword() {
  return process.env.DASHBOARD_PASSWORD?.trim() ?? "";
}
function isConfigured() {
  const password = configuredPassword();
  return password.length >= 16;
}
function digest(value) {
  return createHash("sha256").update(value).digest();
}
function isMatch(actual, expected) {
  return timingSafeEqual(digest(actual), digest(expected));
}
function checkAttemptLimit(key) {
  const now = Date.now();
  const state = attempts.get(key);
  if (!state) return;
  if (state.blockedUntil > now) {
    throw new TRPCError3({ code: "TOO_MANY_REQUESTS", message: "Too many login attempts. Try again later." });
  }
  if (now - state.windowStartedAt >= ATTEMPT_WINDOW_MS) attempts.delete(key);
}
function recordFailure(key) {
  const now = Date.now();
  const current = attempts.get(key);
  const state = current && now - current.windowStartedAt < ATTEMPT_WINDOW_MS ? current : { count: 0, windowStartedAt: now, blockedUntil: 0 };
  state.count += 1;
  if (state.count >= MAX_ATTEMPTS) state.blockedUntil = now + BLOCK_MS;
  attempts.set(key, state);
}
function clearFailures(key) {
  attempts.delete(key);
}
async function loginWithDashboardPassword(req, res, username, password) {
  if (!isConfigured()) {
    throw new TRPCError3({
      code: "PRECONDITION_FAILED",
      message: "Owner login is not configured yet. Add DASHBOARD_PASSWORD in Vercel Production environment variables."
    });
  }
  const key = clientKey(req);
  checkAttemptLimit(key);
  const expectedUsername = process.env.DASHBOARD_USERNAME?.trim() || "owner";
  const expectedPassword = configuredPassword();
  if (username.trim() !== expectedUsername || !isMatch(password, expectedPassword)) {
    recordFailure(key);
    throw new TRPCError3({ code: "UNAUTHORIZED", message: "Invalid owner credentials." });
  }
  clearFailures(key);
  if (!await getDb()) {
    throw new TRPCError3({ code: "PRECONDITION_FAILED", message: "Database is not available for owner session." });
  }
  const ownerName = process.env.DASHBOARD_OWNER_NAME?.trim() || "Akbar Nawasunda";
  const ownerEmail = process.env.DASHBOARD_OWNER_EMAIL?.trim() || null;
  await ensureDashboardUser({
    openId: DASHBOARD_OPEN_ID,
    name: ownerName,
    email: ownerEmail,
    loginMethod: "dashboard",
    role: "admin",
    lastSignedIn: /* @__PURE__ */ new Date()
  });
  const token = await sdk.signSession(
    { openId: DASHBOARD_OPEN_ID, appId: "dashboard", name: ownerName },
    { expiresInMs: ONE_YEAR_MS }
  );
  res.cookie(COOKIE_NAME, token, { ...getSessionCookieOptions(req), maxAge: ONE_YEAR_MS });
  return { success: true, user: { name: ownerName, email: ownerEmail, role: "admin" } };
}

// server/routers.ts
var MAX_ASSET_BYTES = 10 * 1024 * 1024;
var appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true };
    }),
    dashboardLogin: publicProcedure.input(z2.object({
      username: z2.string().trim().min(1).max(64),
      password: z2.string().min(1).max(512)
    })).mutation(({ ctx, input }) => loginWithDashboardPassword(ctx.req, ctx.res, input.username, input.password))
  }),
  assets: router({
    list: protectedProcedure.query(({ ctx }) => listStoredAssets(ctx.user.id)),
    upload: protectedProcedure.input(z2.object({
      fileName: z2.string().min(1).max(255),
      mimeType: z2.string().min(1).max(128),
      size: z2.number().int().positive().max(MAX_ASSET_BYTES),
      base64: z2.string().min(1)
    })).mutation(async ({ ctx, input }) => {
      const bytes = Buffer.from(input.base64, "base64");
      if (bytes.byteLength !== input.size) {
        throw new Error("Uploaded file size does not match metadata");
      }
      if (bytes.byteLength > MAX_ASSET_BYTES) {
        throw new Error("Uploaded file exceeds the 10 MB limit");
      }
      const stored = await storagePut(`users/${ctx.user.id}/assets/${input.fileName}`, bytes, input.mimeType);
      return createStoredAsset({
        ownerId: ctx.user.id,
        fileKey: stored.key,
        url: stored.url,
        fileName: input.fileName,
        mimeType: input.mimeType,
        size: input.size
      });
    })
  }),
  fanSignal: router({
    subscribe: publicProcedure.input(z2.object({
      email: z2.string().trim().toLowerCase().email().max(320),
      source: z2.enum(["home", "footer"]).default("home")
    })).mutation(async ({ input }) => {
      const stored = await createFanSignal(input);
      try {
        const sync = await syncFanSignalContact(input.email, input.source);
        return {
          ...stored,
          delivery: sync.synced ? "synced" : "pending"
        };
      } catch (error) {
        console.error("[FanSignal] Resend sync failed:", error);
        return { ...stored, delivery: "pending" };
      }
    }),
    list: adminProcedure.query(() => listFanSignals()),
    readiness: adminProcedure.query(() => getResendReadiness()),
    createBroadcastDraft: adminProcedure.input(z2.object({
      name: z2.string().trim().min(2).max(120),
      subject: z2.string().trim().min(2).max(255),
      html: z2.string().trim().min(20).max(1e5),
      text: z2.string().trim().max(5e4).optional()
    })).mutation(async ({ input }) => {
      try {
        return await createResendBroadcast(input);
      } catch (error) {
        if (error instanceof ResendApiError) {
          throw new TRPCError4({
            code: error.status === 429 ? "TOO_MANY_REQUESTS" : "BAD_GATEWAY",
            message: error.message
          });
        }
        throw error;
      }
    }),
    sendBroadcast: adminProcedure.input(z2.object({ broadcastId: z2.string().trim().min(1).max(128), confirm: z2.literal(true) })).mutation(async ({ input }) => {
      try {
        return await sendResendBroadcast(input.broadcastId);
      } catch (error) {
        if (error instanceof ResendApiError) {
          throw new TRPCError4({
            code: error.status === 429 ? "TOO_MANY_REQUESTS" : "BAD_GATEWAY",
            message: error.message
          });
        }
        throw error;
      }
    })
  }),
  inquiry: router({
    submit: publicProcedure.input(z2.object({
      inquiryType: z2.enum(["booking", "remix", "collaboration", "licensing"]),
      name: z2.string().trim().min(2).max(160),
      email: z2.string().trim().toLowerCase().email().max(320),
      organization: z2.string().trim().max(160).optional(),
      projectTitle: z2.string().trim().min(2).max(255),
      location: z2.string().trim().max(160).optional(),
      timeline: z2.string().trim().max(160).optional(),
      budgetContext: z2.string().trim().max(255).optional(),
      message: z2.string().trim().min(12).max(4e3),
      source: z2.enum(["epk", "release", "universe", "licensing"])
    })).mutation(({ input }) => createArtistInquiry({
      ...input,
      organization: input.organization || null,
      location: input.location || null,
      timeline: input.timeline || null,
      budgetContext: input.budgetContext || null
    })),
    list: adminProcedure.query(() => listArtistInquiries()),
    updateStatus: adminProcedure.input(z2.object({ id: z2.number().int().positive(), status: z2.enum(["new", "reviewed", "closed"]) })).mutation(({ input }) => updateArtistInquiryStatus(input.id, input.status))
  }),
  content: router({
    list: publicProcedure.query(() => listPublishedArtistContent()),
    listAll: adminProcedure.query(() => listAllArtistContent()),
    documents: publicProcedure.query(() => listCustomArtistContent(true)),
    documentsAll: adminProcedure.query(() => listCustomArtistContent(false)),
    saveDocument: adminProcedure.input(z2.object({
      documentType: z2.enum(customDocumentTypes),
      slug: z2.string().trim().max(128).default("default"),
      payload: z2.record(z2.string(), z2.unknown()).refine((value) => JSON.stringify(value).length <= 1e5, "Document payload is too large"),
      sortOrder: z2.number().int().min(0).max(1e4).default(0),
      isPublished: z2.boolean().default(true)
    })).mutation(({ input }) => upsertCustomArtistDocument(input)),
    deleteDocument: adminProcedure.input(z2.object({ id: z2.number().int().positive() })).mutation(({ input }) => deleteCustomArtistDocument(input.id)),
    upsert: adminProcedure.input(z2.object({
      kind: z2.enum(["hero", "release", "video", "live"]),
      slug: z2.string().trim().toLowerCase().regex(/^[a-z0-9-]+$/).max(128),
      title: z2.string().trim().min(1).max(255),
      subtitle: z2.string().trim().max(2e3).default(""),
      label: z2.string().trim().max(128).default(""),
      href: z2.string().trim().max(1024).default(""),
      imageUrl: z2.string().trim().max(1024).default(""),
      sortOrder: z2.number().int().min(0).max(1e4).default(0),
      isPublished: z2.boolean().default(true)
    })).mutation(({ input }) => upsertArtistContent(input))
  })
});

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// server/_core/ssrHtml.ts
import superjson2 from "superjson";
var SITE_NAME = process.env.SITE_NAME || "Akbar Nawasunda | Official Website";
var CANONICAL_ORIGIN = (process.env.CANONICAL_ORIGIN || "https://akbarnawasunda.my.id").replace(/\/$/, "");
var OG_LOCALE = process.env.OG_LOCALE || "id_ID";
var escapeHtml = (value) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
var clampText = (value, max) => {
  const text2 = value.replace(/\s+/g, " ").trim();
  if (text2.length <= max) return text2;
  const cut = text2.lastIndexOf(" ", max);
  return `${text2.slice(0, cut > max * 0.6 ? cut : max)}\u2026`;
};
var metaText = (value, max) => clampText(value.replace(/[#*_`~]+/g, ""), max);
function buildHeadTags(head) {
  const title = escapeHtml(clampText(head.title, 70) || SITE_NAME);
  const description = escapeHtml(metaText(head.description, 200));
  const canonicalUrl = head.canonicalPath ? `${CANONICAL_ORIGIN}${head.canonicalPath}` : "";
  const image = head.ogImage?.startsWith("//") ? `https:${head.ogImage}` : head.ogImage?.startsWith("/") ? `${CANONICAL_ORIGIN}${head.ogImage}` : head.ogImage;
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
    `<meta name="twitter:description" content="${description}" />`
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
        ["x-default", `${CANONICAL_ORIGIN}${idPath}`]
      ];
      languageLinks.forEach(([language, href]) => {
        tags.push(`<link data-language-link="true" rel="alternate" hreflang="${language}" href="${escapeHtml(href)}" />`);
      });
    }
  }
  if (head.noindex || head.notFound) tags.push(`<meta name="robots" content="noindex, follow" />`);
  return tags.join("\n");
}
function structuredDataScript(value) {
  const serialized = JSON.stringify(value).replace(/</g, "\\u003c");
  return `<script id="akbar-structured-data" type="application/ld+json">${serialized}</script>`;
}
function composeHtml(template, appHtml, head, dehydratedState) {
  const serializedState = JSON.stringify(superjson2.serialize(dehydratedState)).replace(/</g, "\\u003c");
  const stateScript = `<script>window.__RQ_STATE__ = ${serializedState}</script>`;
  const structuredData = head.structuredData ? structuredDataScript(head.structuredData) : "";
  const language = head.locale?.startsWith("en") ? "en" : "id";
  return template.replace('<html lang="id">', `<html lang="${language}">`).replace("</body>", () => `${stateScript}</body>`).replace("<!--app-head-->", () => `${buildHeadTags(head)}${structuredData}`).replace("<!--app-html-->", () => appHtml);
}

// server/vercelSsrHandler.ts
var renderPromise;
async function loadRender() {
  const bundlePath = path.resolve(process.cwd(), "dist/server-ssr/entry-server.js");
  renderPromise ||= import(pathToFileURL(bundlePath).href);
  return renderPromise;
}
async function withRetry(operation, attempts2 = 2) {
  let lastError;
  for (let attempt = 0; attempt < attempts2; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt < attempts2 - 1) await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }
  throw lastError;
}
function templatePath() {
  return path.resolve(process.cwd(), "dist/public/index.html");
}
function redirect(res, location) {
  res.statusCode = 301;
  res.setHeader("Location", location);
  res.end();
}
function canonicalRedirect(url) {
  const queryIndex = url.indexOf("?");
  const pathname = queryIndex === -1 ? url : url.slice(0, queryIndex);
  const query = queryIndex === -1 ? "" : url.slice(queryIndex);
  if (pathname === "/index.html") return `/${query}`;
  if (pathname === "/archive" || pathname.startsWith("/archive/")) {
    return `/universe${pathname.slice("/archive".length)}${query}`;
  }
  if (pathname !== "/" && /\/$/.test(pathname)) {
    return `${pathname.replace(/\/+$/, "") || "/"}${query}`;
  }
  return void 0;
}
async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.statusCode = 405;
    res.setHeader("Allow", "GET, HEAD");
    res.end("Method Not Allowed");
    return;
  }
  const url = req.url || "/";
  req.originalUrl ||= url;
  const redirectTarget = canonicalRedirect(url);
  if (redirectTarget) {
    redirect(res, redirectTarget);
    return;
  }
  try {
    const ctx = await createContext({ req, res });
    const caller = appRouter.createCaller(ctx);
    const prefetch = {
      documents: () => withRetry(() => caller.content.documents())
    };
    const { render } = await loadRender();
    const result = await render(url, prefetch);
    const template = fs.readFileSync(templatePath(), "utf8");
    const html = composeHtml(template, result.html, result.head, result.dehydratedState);
    res.statusCode = result.head.notFound ? 404 : 200;
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
    if (req.method === "HEAD") res.end();
    else res.end(html);
  } catch (error) {
    console.error("[Vercel SSR] render failed:", error);
    res.statusCode = 503;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end("The site is temporarily unavailable.");
  }
}
export {
  handler as default
};
