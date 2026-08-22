import fs from "node:fs";
import path from "node:path";
import { artistContent, type InsertArtistContent } from "../drizzle/schema";
import { getDb } from "../server/db";

type LegacyContent = {
  hero?: { aka?: string; badge?: string };
  texts?: { hero_tag?: string };
  dropBoard?: { text?: string; link?: string };
  featured?: Record<string, unknown>;
};

type LegacyRelease = {
  cat?: string;
  title?: string;
  date?: string;
  type?: string;
  art?: string;
  link?: string;
  soundcloud?: string;
};

function readJson<T>(fileName: string): T | null {
  const filePath = path.resolve(process.cwd(), "public", "data", fileName);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

function slugify(value: string, fallback: string) {
  const slug = value
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 118);
  return slug || fallback;
}

function contentEntry(
  values: Partial<InsertArtistContent> &
    Pick<InsertArtistContent, "kind" | "slug" | "title">
): InsertArtistContent {
  return {
    kind: values.kind,
    slug: values.slug,
    title: values.title,
    subtitle: values.subtitle ?? "",
    label: values.label ?? "",
    href: values.href ?? "",
    imageUrl: values.imageUrl ?? "",
    sortOrder: values.sortOrder ?? 0,
    isPublished: values.isPublished ?? true,
  };
}

async function upsert(
  db: Awaited<ReturnType<typeof getDb>>,
  entry: InsertArtistContent
) {
  if (!db) throw new Error("Database is not available");
  await db
    .insert(artistContent)
    .values(entry)
    .onDuplicateKeyUpdate({
      set: {
        kind: entry.kind,
        title: entry.title,
        subtitle: entry.subtitle,
        label: entry.label,
        href: entry.href,
        imageUrl: entry.imageUrl,
        sortOrder: entry.sortOrder,
        isPublished: entry.isPublished,
      },
    });
}

async function migrate() {
  const db = await getDb();
  if (!db) {
    throw new Error(
      "DATABASE_URL is not configured or the database is unavailable"
    );
  }

  const entries: InsertArtistContent[] = [];
  const content = readJson<LegacyContent>("content.json");

  if (content?.hero) {
    entries.push(
      contentEntry({
        kind: "hero",
        slug: "hero-main",
        title: content.hero.aka || "Akbar Nawasunda",
        subtitle: content.hero.badge || "",
        label: content.texts?.hero_tag || "",
        sortOrder: 0,
      })
    );
  }

  if (content?.dropBoard) {
    entries.push(
      contentEntry({
        kind: "live",
        slug: "latest-update",
        title: content.dropBoard.text || "Latest update",
        href: content.dropBoard.link || "",
        label: "LATEST UPDATE",
        sortOrder: 0,
      })
    );
  }

  const featured = content?.featured ?? {};
  for (const [platform, links] of Object.entries(featured)) {
    if (!Array.isArray(links)) continue;
    links.forEach((href, index) => {
      if (typeof href !== "string" || !href.trim()) return;
      entries.push(
        contentEntry({
          kind: "video",
          slug: slugify(
            `featured-${platform}-${index + 1}`,
            `featured-${index + 1}`
          ),
          title: `${platform} feature ${index + 1}`,
          label: platform.toUpperCase(),
          href,
          sortOrder: index,
        })
      );
    });
  }

  const releases =
    readJson<{ releases?: LegacyRelease[] }>("releases.json")?.releases ?? [];
  releases.forEach((release, index) => {
    if (!release.title) return;
    entries.push(
      contentEntry({
        kind: "release",
        slug: slugify(
          `release-${release.title}-${index + 1}`,
          `release-${index + 1}`
        ),
        title: release.title,
        subtitle: release.date || "",
        label: release.type || release.cat || "SINGLE",
        href: release.link || release.soundcloud || "",
        imageUrl: release.art || "",
        sortOrder: index,
      })
    );
  });

  if (!entries.length) {
    console.log("No legacy content records found; nothing to migrate.");
    return;
  }

  console.log(`Migrating ${entries.length} content records...`);
  for (const entry of entries) {
    await upsert(db, entry);
  }
  console.log("Content migration finished successfully.");
}

migrate().catch(error => {
  console.error("Content migration failed:", error);
  process.exitCode = 1;
});
