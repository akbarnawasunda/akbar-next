import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { TRPCError } from "@trpc/server";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { createArtistInquiry, createFanSignal, createStoredAsset, deleteCustomArtistDocument, listAllArtistContent, listArtistInquiries, listCustomArtistContent, listFanSignals, listPublishedArtistContent, listStoredAssets, updateArtistInquiryStatus, upsertArtistContent, upsertCustomArtistDocument } from "./db";
import { createResendBroadcast, getResendReadiness, sendResendBroadcast, syncFanSignalContact, ResendApiError } from "./resend";
import { storagePut } from "./storage";
import { customDocumentTypes } from "./customContent";

const MAX_ASSET_BYTES = 10 * 1024 * 1024;

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  assets: router({
    list: protectedProcedure.query(({ ctx }) => listStoredAssets(ctx.user.id)),
    upload: protectedProcedure
      .input(z.object({
        fileName: z.string().min(1).max(255),
        mimeType: z.string().min(1).max(128),
        size: z.number().int().positive().max(MAX_ASSET_BYTES),
        base64: z.string().min(1),
      }))
      .mutation(async ({ ctx, input }) => {
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
          size: input.size,
        });
      }),
  }),
  fanSignal: router({
    subscribe: publicProcedure
      .input(z.object({
        email: z.string().trim().toLowerCase().email().max(320),
        source: z.enum(["home", "footer"]).default("home"),
      }))
      .mutation(async ({ input }) => {
        const stored = await createFanSignal(input);
        try {
          const sync = await syncFanSignalContact(input.email, input.source);
          return {
            ...stored,
            delivery: sync.synced ? ("synced" as const) : ("pending" as const),
          };
        } catch (error) {
          console.error("[FanSignal] Resend sync failed:", error);
          return { ...stored, delivery: "pending" as const };
        }
      }),
    list: adminProcedure.query(() => listFanSignals()),
    readiness: adminProcedure.query(() => getResendReadiness()),
    createBroadcastDraft: adminProcedure
      .input(z.object({
        name: z.string().trim().min(2).max(120),
        subject: z.string().trim().min(2).max(255),
        html: z.string().trim().min(20).max(100_000),
        text: z.string().trim().max(50_000).optional(),
      }))
      .mutation(async ({ input }) => {
        try {
          return await createResendBroadcast(input);
        } catch (error) {
          if (error instanceof ResendApiError) {
            throw new TRPCError({
              code: error.status === 429 ? "TOO_MANY_REQUESTS" : "BAD_GATEWAY",
              message: error.message,
            });
          }
          throw error;
        }
      }),
    sendBroadcast: adminProcedure
      .input(z.object({ broadcastId: z.string().trim().min(1).max(128), confirm: z.literal(true) }))
      .mutation(async ({ input }) => {
        try {
          return await sendResendBroadcast(input.broadcastId);
        } catch (error) {
          if (error instanceof ResendApiError) {
            throw new TRPCError({
              code: error.status === 429 ? "TOO_MANY_REQUESTS" : "BAD_GATEWAY",
              message: error.message,
            });
          }
          throw error;
        }
      }),
  }),
  inquiry: router({
    submit: publicProcedure
      .input(z.object({
        inquiryType: z.enum(["booking", "remix", "collaboration", "licensing"]),
        name: z.string().trim().min(2).max(160),
        email: z.string().trim().toLowerCase().email().max(320),
        organization: z.string().trim().max(160).optional(),
        projectTitle: z.string().trim().min(2).max(255),
        location: z.string().trim().max(160).optional(),
        timeline: z.string().trim().max(160).optional(),
        budgetContext: z.string().trim().max(255).optional(),
        message: z.string().trim().min(12).max(4_000),
        source: z.enum(["epk", "release", "universe", "licensing"]),
      }))
      .mutation(({ input }) => createArtistInquiry({
        ...input,
        organization: input.organization || null,
        location: input.location || null,
        timeline: input.timeline || null,
        budgetContext: input.budgetContext || null,
      })),
    list: adminProcedure.query(() => listArtistInquiries()),
    updateStatus: adminProcedure
      .input(z.object({ id: z.number().int().positive(), status: z.enum(["new", "reviewed", "closed"]) }))
      .mutation(({ input }) => updateArtistInquiryStatus(input.id, input.status)),
  }),
  content: router({
    list: publicProcedure.query(() => listPublishedArtistContent()),
    listAll: adminProcedure.query(() => listAllArtistContent()),
    documents: publicProcedure.query(() => listCustomArtistContent(true)),
    documentsAll: adminProcedure.query(() => listCustomArtistContent(false)),
    saveDocument: adminProcedure
      .input(z.object({
        documentType: z.enum(customDocumentTypes),
        slug: z.string().trim().max(128).default("default"),
        payload: z.record(z.string(), z.unknown()).refine(value => JSON.stringify(value).length <= 100_000, "Document payload is too large"),
        sortOrder: z.number().int().min(0).max(10_000).default(0),
        isPublished: z.boolean().default(true),
      }))
      .mutation(({ input }) => upsertCustomArtistDocument(input)),
    deleteDocument: adminProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(({ input }) => deleteCustomArtistDocument(input.id)),
    upsert: adminProcedure
      .input(z.object({
        kind: z.enum(["hero", "release", "video", "live"]),
        slug: z.string().trim().toLowerCase().regex(/^[a-z0-9-]+$/).max(128),
        title: z.string().trim().min(1).max(255),
        subtitle: z.string().trim().max(2_000).default(""),
        label: z.string().trim().max(128).default(""),
        href: z.string().trim().max(1_024).default(""),
        imageUrl: z.string().trim().max(1_024).default(""),
        sortOrder: z.number().int().min(0).max(10_000).default(0),
        isPublished: z.boolean().default(true),
      }))
      .mutation(({ input }) => upsertArtistContent(input)),
  }),
});

export type AppRouter = typeof appRouter;
