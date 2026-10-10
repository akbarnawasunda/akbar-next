import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import superjson from "superjson";
import { render } from "./test-renderer";

describe("Next App Router query hydration contract", () => {
  it("round-trips the server-prefetched React Query state through SuperJSON", async () => {
    const rendered = await render("/", {
      documents: async () => [] as never,
    });

    const serialized = superjson.serialize(rendered.dehydratedState);
    expect(superjson.deserialize(serialized)).toEqual(rendered.dehydratedState);
    expect(rendered.html).toContain('class="route-motion"');
    expect(rendered.html).toContain("an-hero-plate");
  });

  it("uses the same boundary shape as the production server-to-client handoff", () => {
    const boundary = readFileSync(
      resolve(process.cwd(), "app/_components/RouteStateBoundary.tsx"),
      "utf8",
    );
    const page = readFileSync(
      resolve(process.cwd(), "app/_lib/site-page.tsx"),
      "utf8",
    );

    expect(boundary).toContain("superjson.deserialize(state)");
    expect(boundary).toContain("<HydrationBoundary state={dehydratedState}>");
    expect(page).toContain("superjson.serialize(dehydrate(queryClient))");
    expect(page).not.toContain("__RQ_STATE__");
  });
});
