import { useMemo } from "react";
import { useTestNextNavigation } from "./next-navigation-context";

export function usePathname() {
  return useTestNextNavigation().pathname;
}

export function useSearchParams() {
  return useTestNextNavigation().searchParams;
}

export function useParams<
  T extends Record<string, string | string[] | undefined> = Record<
    string,
    string | string[] | undefined
  >,
>() {
  return useTestNextNavigation().params as T;
}

export function useRouter() {
  return useTestNextNavigation().router;
}

export function redirect(destination: string): never {
  throw new Error(`Next redirect requested in test render: ${destination}`);
}

export function notFound(): never {
  throw new Error("Next notFound requested in test render");
}

export function useSelectedLayoutSegment() {
  const pathname = useTestNextNavigation().pathname;
  return useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    return segments[segments.length - 1] ?? null;
  }, [pathname]);
}
