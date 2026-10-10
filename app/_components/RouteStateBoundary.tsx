"use client";

import {
  HydrationBoundary,
  type DehydratedState,
} from "@tanstack/react-query";
import { Suspense, useMemo, type ReactNode } from "react";
import superjson from "superjson";
import { PageLoading } from "@/components/RouteTransition";

export function RouteStateBoundary({
  state,
  children,
}: {
    state: ReturnType<typeof superjson.serialize>;
  children: ReactNode;
}) {
  const dehydratedState = useMemo(
    () => superjson.deserialize(state) as DehydratedState,
    [state],
  );
  return (
    <HydrationBoundary state={dehydratedState}>
      <Suspense fallback={<PageLoading />}>{children}</Suspense>
    </HydrationBoundary>
  );
}
