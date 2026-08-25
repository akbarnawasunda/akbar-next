import { boolean, index, int, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const storedAssets = mysqlTable("storedAssets", {
  id: int("id").autoincrement().primaryKey(),
  ownerId: int("ownerId").notNull(),
  fileKey: varchar("fileKey", { length: 512 }).notNull().unique(),
  url: varchar("url", { length: 1024 }).notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  mimeType: varchar("mimeType", { length: 128 }).notNull(),
  size: int("size").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/** Public email permissions for the AN // NIGHT FREQUENCY fan channel. */
export const fanSignals = mysqlTable("fanSignals", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  source: varchar("source", { length: 64 }).notNull().default("home"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/** Owner-managed entries rendered in the public artist platform. */
export const galleryAnalytics = mysqlTable("galleryAnalytics", {
  id: int("id").autoincrement().primaryKey(),
  gallery: varchar("gallery", { length: 64 }).notNull(),
  visitorHash: varchar("visitorHash", { length: 64 }).notNull(),
  visitDay: varchar("visitDay", { length: 10 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({
  visitorDayUnique: uniqueIndex("galleryAnalytics_visitor_day_unique").on(table.gallery, table.visitorHash, table.visitDay),
  galleryDayIndex: index("galleryAnalytics_gallery_day_idx").on(table.gallery, table.visitDay),
}));

/** Public display names and scores for the JEDAG RUN global board. */
export const gameLeaderboard = mysqlTable("gameLeaderboard", {
  id: int("id").autoincrement().primaryKey(),
  username: varchar("username", { length: 80 }).notNull(),
  score: int("score").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({
  scoreIndex: index("gameLeaderboard_score_idx").on(table.score, table.createdAt),
}));

export const artistContent = mysqlTable("artistContent", {
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/** Public work requests submitted from booking, release, licensing, or collaboration flows. */
export const artistInquiries = mysqlTable("artistInquiries", {
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type StoredAsset = typeof storedAssets.$inferSelect;
export type InsertStoredAsset = typeof storedAssets.$inferInsert;
export type FanSignal = typeof fanSignals.$inferSelect;
export type InsertFanSignal = typeof fanSignals.$inferInsert;
export type GalleryAnalytics = typeof galleryAnalytics.$inferSelect;
export type InsertGalleryAnalytics = typeof galleryAnalytics.$inferInsert;
export type GameLeaderboard = typeof gameLeaderboard.$inferSelect;
export type InsertGameLeaderboard = typeof gameLeaderboard.$inferInsert;
export type ArtistContent = typeof artistContent.$inferSelect;
export type InsertArtistContent = typeof artistContent.$inferInsert;
export type ArtistInquiry = typeof artistInquiries.$inferSelect;
export type InsertArtistInquiry = typeof artistInquiries.$inferInsert;
