import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { and, asc, count, countDistinct, desc, eq, gte, like, notLike, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  artistContent,
  artistInquiries,
  galleryAnalytics,
  gameLeaderboard,
  fanSignals,
  InsertArtistContent,
  InsertArtistInquiry,
  InsertFanSignal,
  InsertStoredAsset,
  InsertUser,
  storedAssets,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";
import { toArtistContentInput, toCustomArtistDocuments, type CustomDocumentType, type DocumentPayload } from "./customContent";
import { LEADERBOARD_LIMIT, normalizeLeaderboardScore, normalizeLeaderboardUsername } from "../shared/gameLeaderboard";
let _db: ReturnType<typeof drizzle> | null = null;

/**
 * mysql2 does not accept Aiven's `ssl-mode` query option. Remove it before
 * handing the URI to mysql2; TLS is configured explicitly in the connection
 * options below. If the URI is malformed, preserve it so the normal database
 * failure path remains visible instead of hiding a configuration problem.
 */
export function normalizeDatabaseUrl(raw: string): string {
  try {
    const url = new URL(raw);
    url.searchParams.delete("ssl-mode");
    return url.toString();
  } catch {
    return raw;
  }
}

// Lazily create the drizzle instance so local tooling can run without a DB.
// Aiven requires TLS; DATABASE_SSL_CA can be supplied for strict certificate
// validation. The legacy fallback keeps existing deployments working while
// still encrypting traffic when a CA bundle is not available.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const sslCa = process.env.DATABASE_SSL_CA?.replace(/\\n/g, "\n");
      _db = drizzle({
        connection: {
          uri: normalizeDatabaseUrl(process.env.DATABASE_URL),
          ssl: sslCa
            ? { ca: sslCa, rejectUnauthorized: true }
            : { rejectUnauthorized: false },
        },
      });
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

type Database = Exclude<Awaited<ReturnType<typeof getDb>>, null>;

async function readWithRetry<T>(operation: (db: Database) => Promise<T>, fallback: T): Promise<T> {
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

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  return readWithRetry(
    async db => {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.openId, openId))
        .limit(1);
      return result.length > 0 ? result[0] : undefined;
    },
    undefined,
  );
}

/**
 * Bootstrap the password-protected dashboard without relying on a new unique
 * row. Older deployments can carry a unique index on `users.name`; retrying
 * with the stable internal identity keeps the owner session idempotent while
 * never reusing another user's row just because their display name matches.
 * This helper is dashboard-specific so normal Manus OAuth upsert semantics
 * remain unchanged.
 */
function isDuplicateDatabaseError(error: unknown): boolean {
  const dbError = error as { code?: string; errno?: number; message?: string };
  return dbError.code === "ER_DUP_ENTRY" || dbError.errno === 1062 || dbError.message?.toLowerCase().includes("duplicate") === true;
}

export async function ensureDashboardUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("Dashboard user openId is required");

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot ensure dashboard user: database not available");
    return;
  }

  const lastSignedIn = user.lastSignedIn ?? new Date();
  const values: InsertUser = { ...user, lastSignedIn };
  const updateValues = {
    openId: user.openId,
    name: user.name ?? null,
    email: user.email ?? null,
    loginMethod: user.loginMethod ?? null,
    role: user.role ?? "user" as const,
    lastSignedIn,
  };
  const internalNameValues = { ...updateValues, name: user.openId };
  try {
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateValues });
  } catch (error) {
    if (!isDuplicateDatabaseError(error) || !user.name || user.name === user.openId) throw error;
    await db.insert(users).values({ ...values, name: user.openId }).onDuplicateKeyUpdate({ set: internalNameValues });
  }
}

export async function createStoredAsset(asset: InsertStoredAsset) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db.insert(storedAssets).values(asset);
  return { id: Number(result[0].insertId), ...asset };
}

export async function listStoredAssets(ownerId: number) {
  return readWithRetry(
    db => db
      .select()
      .from(storedAssets)
      .where(eq(storedAssets.ownerId, ownerId)),
    [],
  );
}

export async function createFanSignal(signal: InsertFanSignal) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db
    .insert(fanSignals)
    .values(signal)
    .onDuplicateKeyUpdate({
      set: { source: signal.source ?? "home" },
    });
  return { email: signal.email, source: signal.source ?? "home" };
}

export async function listFanSignals() {
  return readWithRetry(
    db => db.select().from(fanSignals).orderBy(asc(fanSignals.createdAt)),
    [],
  );
}

export async function listPublishedArtistContent() {
  return readWithRetry(
    db => db
      .select()
      .from(artistContent)
      .where(and(eq(artistContent.isPublished, true), notLike(artistContent.slug, "custom-%")))
      .orderBy(asc(artistContent.sortOrder)),
    [],
  );
}

export async function listAllArtistContent() {
  return readWithRetry(
    db => db
      .select()
      .from(artistContent)
      .where(notLike(artistContent.slug, "custom-%"))
      .orderBy(asc(artistContent.kind), asc(artistContent.sortOrder)),
    [],
  );
}

export async function upsertArtistContent(item: InsertArtistContent) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db
    .insert(artistContent)
    .values(item)
    .onDuplicateKeyUpdate({
      set: {
        kind: item.kind,
        title: item.title,
        subtitle: item.subtitle,
        label: item.label,
        href: item.href,
        imageUrl: item.imageUrl,
        sortOrder: item.sortOrder,
        isPublished: item.isPublished,
      },
    });
  return { slug: item.slug };
}

export async function listCustomArtistContent(publishedOnly = false) {
  const rows = await readWithRetry(
    db => db
      .select()
      .from(artistContent)
      .where(publishedOnly ? and(eq(artistContent.isPublished, true), like(artistContent.slug, "custom-%")) : like(artistContent.slug, "custom-%"))
      .orderBy(asc(artistContent.sortOrder)),
    [],
  );
  return toCustomArtistDocuments(rows);
}

export async function upsertCustomArtistDocument(input: {
  documentType: CustomDocumentType;
  slug: string;
  payload: DocumentPayload;
  sortOrder: number;
  isPublished: boolean;
}) {
  const item = toArtistContentInput(input);
  const saved = await upsertArtistContent(item);
  return { ...saved, documentType: input.documentType, slug: input.slug };
}

export async function deleteCustomArtistDocument(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const customRow = await db
    .select({ id: artistContent.id })
    .from(artistContent)
    .where(and(eq(artistContent.id, id), like(artistContent.slug, "custom-%")))
    .limit(1);
  if (!customRow.length) throw new Error("Custom document not found");
  await db
    .delete(artistContent)
    .where(and(eq(artistContent.id, id), like(artistContent.slug, "custom-%")));
  return { id };
}

export async function createArtistInquiry(inquiry: InsertArtistInquiry) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db.insert(artistInquiries).values(inquiry);
  return {
    id: Number(result[0].insertId),
    ...inquiry,
    status: inquiry.status ?? "new",
  };
}

export async function listArtistInquiries() {
  return readWithRetry(
    db => db
      .select()
      .from(artistInquiries)
      .orderBy(asc(artistInquiries.status), asc(artistInquiries.createdAt)),
    [],
  );
}

export async function updateArtistInquiryStatus(
  id: number,
  status: "new" | "reviewed" | "closed"
) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db
    .update(artistInquiries)
    .set({ status })
    .where(eq(artistInquiries.id, id));
  return { id, status };
}

const GALLERY_ANALYTICS_SALT = process.env.SESSION_SECRET || process.env.JWT_SECRET || "akbar-gallery-analytics-v1";
let galleryAnalyticsTableReady: Promise<void> | null = null;

async function ensureGalleryAnalyticsTable(db: Database) {
  if (!galleryAnalyticsTableReady) {
    galleryAnalyticsTableReady = db.execute(sql`CREATE TABLE IF NOT EXISTS galleryAnalytics (
      id int AUTO_INCREMENT NOT NULL,
      gallery varchar(64) NOT NULL,
      visitorHash varchar(64) NOT NULL,
      visitDay varchar(10) NOT NULL,
      createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT galleryAnalytics_id PRIMARY KEY (id),
      UNIQUE KEY galleryAnalytics_visitor_day_unique (gallery, visitorHash, visitDay),
      KEY galleryAnalytics_gallery_day_idx (gallery, visitDay)
    )`).then(() => undefined).catch(error => {
      galleryAnalyticsTableReady = null;
      throw error;
    });
  }
  return galleryAnalyticsTableReady;
}

function analyticsDay(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function analyticsVisitorHash(visitorKey: string) {
  return createHash("sha256").update(`${GALLERY_ANALYTICS_SALT}:${visitorKey}`).digest("hex");
}

export async function recordGalleryVisit(input: { gallery: string; visitorKey: string }) {
  const db = await getDb();
  if (!db) return { recorded: false as const };
  await ensureGalleryAnalyticsTable(db);
  const visitDay = analyticsDay();
  const visitorHash = analyticsVisitorHash(input.visitorKey);
  await db.insert(galleryAnalytics).values({ gallery: input.gallery, visitorHash, visitDay }).onDuplicateKeyUpdate({
    set: { visitDay },
  });
  return { recorded: true as const };
}

const LEADERBOARD_TOKEN_SECRET = process.env.SESSION_SECRET || process.env.JWT_SECRET || "akbar-jedag-leaderboard-v1";
const LEADERBOARD_TOKEN_TTL_MS = 2 * 60 * 60 * 1000;
const LEADERBOARD_SUBMIT_COOLDOWN_MS = 15_000;
let gameLeaderboardTableReady: Promise<void> | null = null;
const consumedLeaderboardTokens = new Map<string, number>();
const recentLeaderboardSubmissions = new Map<string, number>();

async function ensureGameLeaderboardTable(db: Database) {
  if (!gameLeaderboardTableReady) {
    gameLeaderboardTableReady = db.execute(sql`CREATE TABLE IF NOT EXISTS gameLeaderboard (
      id int AUTO_INCREMENT NOT NULL,
      username varchar(80) NOT NULL,
      score int NOT NULL DEFAULT 0,
      createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT gameLeaderboard_id PRIMARY KEY (id),
      KEY gameLeaderboard_score_idx (score, createdAt)
    )`).then(() => undefined).catch(error => {
      gameLeaderboardTableReady = null;
      throw error;
    });
  }
  return gameLeaderboardTableReady;
}

function leaderboardTokenSignature(payload: string) {
  return createHmac("sha256", LEADERBOARD_TOKEN_SECRET).update(payload).digest("base64url");
}

export function issueLeaderboardRunToken(username: string) {
  const payload = Buffer.from(JSON.stringify({ username, issuedAt: Date.now(), nonce: randomBytes(12).toString("hex") })).toString("base64url");
  return `${payload}.${leaderboardTokenSignature(payload)}`;
}

export function consumeLeaderboardRunToken(token: string, username: string) {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  const expected = leaderboardTokenSignature(payload);
  const providedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (providedBuffer.length !== expectedBuffer.length || !timingSafeEqual(providedBuffer, expectedBuffer)) return false;
  try {
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { username?: string; issuedAt?: number; nonce?: string };
    if (decoded.username !== username || !decoded.nonce || !decoded.issuedAt || Date.now() - decoded.issuedAt > LEADERBOARD_TOKEN_TTL_MS || Date.now() - decoded.issuedAt < 0) return false;
    const now = Date.now();
    for (const [key, expiresAt] of consumedLeaderboardTokens) if (expiresAt <= now) consumedLeaderboardTokens.delete(key);
    if (consumedLeaderboardTokens.has(token)) return false;
    consumedLeaderboardTokens.set(token, decoded.issuedAt + LEADERBOARD_TOKEN_TTL_MS);
    return true;
  } catch {
    return false;
  }
}

export function leaderboardSubmissionAllowed(username: string) {
  const key = username.toLowerCase();
  const now = Date.now();
  for (const [candidate, timestamp] of recentLeaderboardSubmissions) if (now - timestamp > LEADERBOARD_SUBMIT_COOLDOWN_MS) recentLeaderboardSubmissions.delete(candidate);
  const previous = recentLeaderboardSubmissions.get(key);
  if (previous && now - previous < LEADERBOARD_SUBMIT_COOLDOWN_MS) return false;
  recentLeaderboardSubmissions.set(key, now);
  return true;
}

export async function listGameLeaderboard() {
  return readWithRetry(async db => {
    await ensureGameLeaderboardTable(db);
    return db.select({ id: gameLeaderboard.id, username: gameLeaderboard.username, score: gameLeaderboard.score, createdAt: gameLeaderboard.createdAt })
      .from(gameLeaderboard)
      .orderBy(desc(gameLeaderboard.score), asc(gameLeaderboard.createdAt), asc(gameLeaderboard.id))
      .limit(LEADERBOARD_LIMIT);
  }, []);
}

export async function submitGameScore(input: { username: string; score: number }) {
  const db = await getDb();
  if (!db) return { submitted: false as const, reason: "unavailable" as const };
  const normalizedUsername = normalizeLeaderboardUsername(input.username);
  const normalizedScore = normalizeLeaderboardScore(input.score);
  if (!normalizedUsername.value || normalizedScore === null) return { submitted: false as const, reason: "invalid" as const };
  await ensureGameLeaderboardTable(db);
  await db.insert(gameLeaderboard).values({ username: normalizedUsername.value, score: normalizedScore });
  return { submitted: true as const, score: normalizedScore };
}

export async function getGalleryAnalytics(gallery: string) {
  return readWithRetry(async db => {
    await ensureGalleryAnalyticsTable(db);
    const today = analyticsDay();
    const since = analyticsDay(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000));
    const [allTime] = await db.select({ visitors: countDistinct(galleryAnalytics.visitorHash), visits: count() }).from(galleryAnalytics).where(eq(galleryAnalytics.gallery, gallery));
    const [last7Days] = await db.select({ visitors: countDistinct(galleryAnalytics.visitorHash), visits: count() }).from(galleryAnalytics).where(and(eq(galleryAnalytics.gallery, gallery), gte(galleryAnalytics.visitDay, since)));
    const [todayStats] = await db.select({ visitors: countDistinct(galleryAnalytics.visitorHash), visits: count() }).from(galleryAnalytics).where(and(eq(galleryAnalytics.gallery, gallery), eq(galleryAnalytics.visitDay, today)));
    const daily = await db.select({ day: galleryAnalytics.visitDay, visitors: countDistinct(galleryAnalytics.visitorHash), visits: count() }).from(galleryAnalytics).where(and(eq(galleryAnalytics.gallery, gallery), gte(galleryAnalytics.visitDay, since))).groupBy(galleryAnalytics.visitDay).orderBy(asc(galleryAnalytics.visitDay));
    return {
      gallery,
      today,
      allTime: { visitors: Number(allTime?.visitors ?? 0), visits: Number(allTime?.visits ?? 0) },
      last7Days: { visitors: Number(last7Days?.visitors ?? 0), visits: Number(last7Days?.visits ?? 0) },
      todayStats: { visitors: Number(todayStats?.visitors ?? 0), visits: Number(todayStats?.visits ?? 0) },
      daily: daily.map(item => ({ day: item.day, visitors: Number(item.visitors), visits: Number(item.visits) })),
    };
  }, {
    gallery,
    today: analyticsDay(),
    allTime: { visitors: 0, visits: 0 },
    last7Days: { visitors: 0, visits: 0 },
    todayStats: { visitors: 0, visits: 0 },
    daily: [],
  });
}
