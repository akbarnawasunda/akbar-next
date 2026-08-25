import { HydrationBoundary, QueryClient, QueryClientProvider, type DehydratedState } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { hydrateRoot } from "react-dom/client";
import { Router } from "wouter";
import superjson from "superjson";
import { trpc } from "@/lib/trpc";
import { COOKIE_NAME } from "@shared/const";
import App, { preloadPublicRoute } from "./App";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
    },
  },
});

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    console.error("[API Query Error]", event.query.state.error);
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    console.error("[API Mutation Error]", event.mutation.state.error);
  }
});

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      headers() {
        try {
          const raw = sessionStorage.getItem("manus-cookie");
          if (raw) {
            const prefix = `${COOKIE_NAME}=`;
            const pair = raw.split(";").find(value => value.trim().startsWith(prefix));
            const token = pair?.trim().slice(prefix.length);
            if (token) return { Authorization: `Bearer ${token}` };
          }
        } catch {
          // sessionStorage may be unavailable in private or embedded browsers.
        }
        return {};
      },
      fetch(input, init) {
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
        });
      },
    }),
  ],
});

const analyticsEndpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT;
const analyticsWebsiteId = import.meta.env.VITE_ANALYTICS_WEBSITE_ID;
if (analyticsEndpoint && analyticsWebsiteId) {
  const analyticsScript = document.createElement("script");
  analyticsScript.defer = true;
  analyticsScript.src = `${analyticsEndpoint}/umami`;
  analyticsScript.dataset.websiteId = analyticsWebsiteId;
  document.head.appendChild(analyticsScript);
}

if (import.meta.env.DEV && "serviceWorker" in navigator) {
  navigator.serviceWorker
    .getRegistrations()
    .then(registrations => registrations.forEach(registration => void registration.unregister()))
    .catch(() => undefined);
}

const rawState = (window as Window & { __RQ_STATE__?: string }).__RQ_STATE__;
const parsedState = rawState ? JSON.parse(rawState) : undefined;
const dehydratedState = parsedState
  ? (superjson.deserialize(parsedState) as DehydratedState)
  : undefined;

const initialRoute = `${window.location.pathname}${window.location.search}`;
const mount = () => {
  hydrateRoot(
    document.getElementById("root")!,
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <HydrationBoundary state={dehydratedState}>
          <Router>
            <App />
          </Router>
        </HydrationBoundary>
      </QueryClientProvider>
    </trpc.Provider>,
  );
};

void preloadPublicRoute(initialRoute).catch(error => {
  console.error("[Hydration] public route preload failed", error);
}).finally(mount);
