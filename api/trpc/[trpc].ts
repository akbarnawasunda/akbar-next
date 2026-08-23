import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../../server/routers";
import { createContext } from "../../server/_core/context";

const app = express();

app.use(express.json({ limit: "1mb" }));
app.use(
  "/",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

/**
 * Vercel routes /api/trpc/:trpc here. The Express tRPC adapter uses the last
 * path segment as the procedure name, so fanSignal.subscribe and the other
 * batch paths are preserved without rewriting the request URL.
 */
export default app;
