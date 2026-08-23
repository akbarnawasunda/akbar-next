import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "../../server/routers";
import { type TrpcContext } from "../../server/_core/context";
import { sdk } from "../../server/_core/sdk";

const createFetchContext = async ({
  req: request,
  resHeaders,
}: {
  req: Request;
  resHeaders: Headers;
}): Promise<TrpcContext> => {
  const requestLike = {
    headers: Object.fromEntries(request.headers.entries()),
  } as TrpcContext["req"];
  const responseLike = {
    clearCookie: (name: string) => {
      resHeaders.append(
        "Set-Cookie",
        `${name}=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=None`
      );
    },
  } as TrpcContext["res"];

  let user: TrpcContext["user"] = null;
  try {
    user = await sdk.authenticateRequest(requestLike);
  } catch {
    // Public procedures do not require an authenticated session.
  }

  return { req: requestLike, res: responseLike, user };
};

export default {
  fetch(request: Request) {
    return fetchRequestHandler({
      endpoint: "/api/trpc",
      req: request,
      router: appRouter,
      createContext: createFetchContext,
    });
  },
};
