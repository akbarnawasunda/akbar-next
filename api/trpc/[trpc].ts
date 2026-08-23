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
 * Vercel mounts this catch-all function at /api/trpc/:trpc. The tRPC Express
 * adapter derives the procedure name from req.path, so remove the Vercel
 * function prefix before handing the request to Express.
 */
export default function handler(
  req: express.Request,
  res: express.Response
) {
  const prefix = "/api/trpc";
  const originalUrl = req.url || "/";
  req.url = originalUrl.startsWith(prefix)
    ? originalUrl.slice(prefix.length) || "/"
    : originalUrl;
  return app(req, res);
}
