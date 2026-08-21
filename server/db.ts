import { asc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { artistContent, fanSignals, InsertArtistContent, InsertFanSignal, InsertStoredAsset, InsertUser, storedAssets, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
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
      values.role = 'admin';
      updateSet.role = 'admin';
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

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

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
  return db.select().from(storedAssets).where(eq(storedAssets.ownerId, ownerId));
}

export async function createFanSignal(signal: InsertFanSignal) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.insert(fanSignals).values(signal).onDuplicateKeyUpdate({
    set: { source: signal.source ?? "home" },
  });
  return { email: signal.email, source: signal.source ?? "home" };
}

export async function listPublishedArtistContent() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(artistContent).where(eq(artistContent.isPublished, true)).orderBy(asc(artistContent.sortOrder));
}

export async function listAllArtistContent() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(artistContent).orderBy(asc(artistContent.kind), asc(artistContent.sortOrder));
}

export async function upsertArtistContent(item: InsertArtistContent) {
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
      isPublished: item.isPublished,
    },
  });
  return { slug: item.slug };
}
