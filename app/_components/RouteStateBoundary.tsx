"use client";

import {
  HydrationBoundary,
  hydrate,
  useQueryClient,
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
  const queryClient = useQueryClient();
  const dehydratedState = useMemo(
    () => superjson.deserialize(state) as DehydratedState,
    [state],
  );
  // [BUGFIX #418] Hydrate SAAT RENDER, jangan mengandalkan HydrationBoundary
  // saja. `StructuredData` (dirender sebagai saudara sebelum boundary ini)
  // sudah memanggil `content.documents.useQuery` lebih dulu sehingga query
  // itu sudah ada di cache dalam keadaan pending saat HydrationBoundary
  // dijalankan. Untuk query yang sudah ada, HydrationBoundary menunda hydrate
  // ke `useEffect` — yang tidak pernah jalan saat SSR — sehingga HTML server
  // merender status loading (`aria-busy="true"`, `<p>` pemuatan) sementara
  // klien merender status terisi → hydration mismatch yang meng-regenerasi
  // seluruh pohon (React #418 di rute mana pun yang memakai query ini).
  // `hydrate()` dari query-core hanya menimpa state yang lebih lama
  // (`state.dataUpdatedAt > query.state.dataUpdatedAt`), jadi data klien yang
  // lebih baru tetap tidak tersentuh. HydrationBoundary tetap dipakai untuk
  // kasus sisa (mis. dehydrated promise) dan tidak meng-hydrate dua kali
  // karena timestamp-nya sudah sama.
  useMemo(() => {
    hydrate(queryClient, dehydratedState);
  }, [queryClient, dehydratedState]);
  return (
    <HydrationBoundary state={dehydratedState}>
      <Suspense fallback={<PageLoading />}>{children}</Suspense>
    </HydrationBoundary>
  );
}
