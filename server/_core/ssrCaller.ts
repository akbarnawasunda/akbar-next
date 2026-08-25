import type { Request, Response } from "express";
import { appRouter } from "../routers";
import { createContext } from "./context";
import type { SsrPrefetch } from "../../client/src/ssr/prefetch";

async function withRetry<T>(operation: () => Promise<T>, attempts = 2): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt < attempts - 1) await new Promise(resolve => setTimeout(resolve, 250));
    }
  }
  throw lastError;
}

export async function buildSsrPrefetch(req: Request, res: Response): Promise<SsrPrefetch> {
  const ctx = await createContext({ req, res });
  const caller = appRouter.createCaller(ctx);

  return {
    documents: () => withRetry(() => caller.content.documents()),
  };
}
