import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";

const artistSite = {
  type: "document", name: "artistSite", title: "Artist Site",
  fields: [
    { name: "heroTitle", title: "Hero title", type: "string" },
    { name: "heroKicker", title: "Hero kicker", type: "string" },
    { name: "heroBody", title: "Hero body", type: "text", rows: 3 },
    { name: "heroImage", title: "Hero image URL", type: "url" },
    { name: "primaryActionUrl", title: "Primary listening URL", type: "url" },
    { name: "primaryActionLabel", title: "Primary action label", type: "string", initialValue: "DENGAR SEKARANG" },
  ],
};

const artistProfile = {
  type: "document", name: "artistProfile", title: "Artist Biography",
  fields: [
    { name: "shortBio", title: "Short bio", type: "text", rows: 4 },
    { name: "longBio", title: "Long biography", type: "text", rows: 10 },
    { name: "location", title: "Base / location", type: "string", initialValue: "Bandung Barat, Indonesia" },
    { name: "genres", title: "Genres", type: "array", of: [{ type: "string" }] },
    { name: "portraitImage", title: "Portrait image URL", type: "url" },
    { name: "artistStatement", title: "Artist statement", type: "text", rows: 4 },
  ],
};

const pressKit = {
  type: "document", name: "pressKit", title: "Press & Booking",
  fields: [
    { name: "intro", title: "Press introduction", type: "text", rows: 4 },
    { name: "bookingEmail", title: "Booking email", type: "string" },
    { name: "pressEmail", title: "Press email", type: "string" },
    { name: "oneSheetUrl", title: "One-sheet PDF URL", type: "url" },
    { name: "photoPackUrl", title: "Press photo pack URL", type: "url" },
    { name: "logoPackUrl", title: "Logo pack URL", type: "url" },
    { name: "technicalRiderUrl", title: "Technical rider URL", type: "url" },
  ],
};

const release = {
  type: "document", name: "release", title: "Release",
  fields: [
    { name: "title", title: "Title", type: "string", validation: (Rule: any) => Rule.required() },
    { name: "year", title: "Year", type: "string" },
    { name: "format", title: "Format", type: "string", initialValue: "Single" },
    { name: "platform", title: "Platform", type: "string", options: { list: ["Spotify", "SoundCloud", "Apple Music", "YouTube", "Other"] } },
    { name: "url", title: "Official URL", type: "url", validation: (Rule: any) => Rule.required() },
    { name: "embedUrl", title: "Optional SoundCloud URL for player", type: "url" },
    { name: "artworkUrl", title: "Artwork image URL", type: "url" },
    { name: "story", title: "Release story / notes", type: "text", rows: 6 },
    { name: "credits", title: "Credits", type: "text", rows: 4 },
    { name: "spotifyUrl", title: "Spotify URL", type: "url" },
    { name: "appleMusicUrl", title: "Apple Music URL", type: "url" },
    { name: "isCurrent", title: "Current release", type: "boolean", initialValue: false },
    { name: "order", title: "Display order", type: "number", initialValue: 100 },
  ],
};

const visual = {
  type: "document", name: "visual", title: "Visual / Video",
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
  type: "document", name: "liveSignal", title: "Live Signal",
  fields: [
    { name: "status", title: "Status label", type: "string", initialValue: "NO DATE ANNOUNCED" },
    { name: "message", title: "Public message", type: "text", rows: 3 },
    { name: "actionUrl", title: "Ticket or announcement URL", type: "url" },
  ],
};

const event = {
  type: "document", name: "event", title: "Live Event / Tour Date",
  fields: [
    { name: "title", title: "Event title", type: "string", validation: (Rule: any) => Rule.required() },
    { name: "date", title: "Date and time", type: "datetime", validation: (Rule: any) => Rule.required() },
    { name: "city", title: "City", type: "string" }, { name: "venue", title: "Venue", type: "string" },
    { name: "country", title: "Country", type: "string", initialValue: "Indonesia" },
    { name: "posterUrl", title: "Poster image URL", type: "url" }, { name: "ticketUrl", title: "Official ticket URL", type: "url" },
    { name: "rsvpUrl", title: "RSVP URL", type: "url" },
    { name: "status", title: "Event status", type: "string", options: { list: ["announced", "sold out", "cancelled", "past"] }, initialValue: "announced" },
    { name: "isFeatured", title: "Feature as next show", type: "boolean", initialValue: false },
  ],
};

export default defineConfig({
  name: "akbar-nawasunda-studio", title: "Akbar Nawasunda CMS", projectId: "3t6l52on", dataset: "production",
  plugins: [structureTool(), visionTool()],
  schema: { types: [artistSite, artistProfile, pressKit, release, visual, liveSignal, event] },
});
