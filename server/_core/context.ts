import type { User } from "../../drizzle/schema";
import type { AppRequest, CookieResponse } from "./httpTypes";
import { sdk } from "./sdk";

export type TrpcContext = {
  req: AppRequest;
  res: CookieResponse;
  user: User | null;
};

export async function createContext(opts: {
  req: AppRequest;
  res: CookieResponse;
}): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch {
    // Authentication is optional for public procedures.
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
