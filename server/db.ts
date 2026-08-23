import { and, asc, eq, like, notLike } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  artistContent,
  artistInquiries,
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

let _db: ReturnType<typeof drizzle> | null = null;

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
          uri: process.env.DATABASE_URL,
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
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createStoredAsset(asset: InsertStoredAsset) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db.insert(storedAssets).values(asset);
  return { id: Number(result[0].insertId), ...asset };
}

export async function listStoredAssets(ownerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(storedAssets)
    .where(eq(storedAssets.ownerId, ownerId));
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
  const db = await getDb();
  if (!db) return [];
  return db.select().from(fanSignals).orderBy(asc(fanSignals.createdAt));
}

export async function listPublishedArtistContent() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(artistContent)
    .where(and(eq(artistContent.isPublished, true), notLike(artistContent.slug, "custom-%")))
    .orderBy(asc(artistContent.sortOrder));
}

export async function listAllArtistContent() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(artistContent)
    .where(notLike(artistContent.slug, "custom-%"))
    .orderBy(asc(artistContent.kind), asc(artistContent.sortOrder));
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
  const db = await getDb();
  if (!db) return [];
  const rows = await db
    .select()
    .from(artistContent)
    .where(publishedOnly ? and(eq(artistContent.isPublished, true), like(artistContent.slug, "custom-%")) : like(artistContent.slug, "custom-%"))
    .orderBy(asc(artistContent.sortOrder));
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
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(artistInquiries)
    .orderBy(asc(artistInquiries.status), asc(artistInquiries.createdAt));
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
