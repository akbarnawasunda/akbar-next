import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { createStoredAsset, listStoredAssets } from "./db";
import { storagePut } from "./storage";

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
});

export type AppRouter = typeof appRouter;
