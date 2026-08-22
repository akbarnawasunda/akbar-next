import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";

const artistSite = {
  type: "document",
  name: "artistSite",
  title: "Artist Site",
  fields: [
    { name: "heroTitle", title: "Hero title", type: "string" },
    { name: "heroKicker", title: "Hero kicker", type: "string" },
    { name: "heroBody", title: "Hero body", type: "text", rows: 3 },
    { name: "heroImage", title: "Hero image URL", type: "url" },
    { name: "primaryActionUrl", title: "Primary listening URL", type: "url" },
    { name: "primaryActionLabel", title: "Primary action label", type: "string", initialValue: "DENGAR SEKARANG" },
  ],
};

const release = {
  type: "document",
  name: "release",
  title: "Release",
  fields: [
    { name: "title", title: "Title", type: "string", validation: (Rule: any) => Rule.required() },
    { name: "year", title: "Year", type: "string" },
    { name: "format", title: "Format", type: "string", initialValue: "Single" },
    { name: "platform", title: "Platform", type: "string", options: { list: ["Spotify", "SoundCloud", "Apple Music", "YouTube", "Other"] } },
    { name: "url", title: "Official URL", type: "url", validation: (Rule: any) => Rule.required() },
    { name: "embedUrl", title: "Optional SoundCloud URL for player", type: "url" },
    { name: "isCurrent", title: "Current release", type: "boolean", initialValue: false },
    { name: "order", title: "Display order", type: "number", initialValue: 100 },
  ],
};

const visual = {
  type: "document",
  name: "visual",
  title: "Visual / Video",
  fields: [
    { name: "title", title: "Title", type: "string", validation: (Rule: any) => Rule.required() },
    { name: "label", title: "Label", type: "string", initialValue: "OFFICIAL VISUAL" },
    { name: "youtubeId", title: "YouTube video ID", type: "string", description: "Example: rv4DK8nVWd0" },
    { name: "url", title: "Official URL", type: "url" },
    { name: "imageUrl", title: "Artwork image URL", type: "url" },
    { name: "order", title: "Display order", type: "number", initialValue: 100 },
  ],
};

const liveSignal = {
  type: "document",
  name: "liveSignal",
  title: "Live Signal",
  fields: [
    { name: "status", title: "Status label", type: "string", initialValue: "NO DATE ANNOUNCED" },
    { name: "message", title: "Public message", type: "text", rows: 3 },
    { name: "actionUrl", title: "Ticket or announcement URL", type: "url" },
  ],
};

export default defineConfig({
  name: "akbar-nawasunda-studio",
  title: "Akbar Nawasunda CMS",
  projectId: "3t6l52on",
  dataset: "production",
  plugins: [structureTool(), visionTool()],
  schema: { types: [artistSite, release, visual, liveSignal] },
});
