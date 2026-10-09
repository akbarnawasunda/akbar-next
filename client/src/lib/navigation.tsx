"use client";

import NextLink, { type LinkProps } from "next/link";
import {
  useParams as useNextParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useCallback } from "react";

export type NavigationOptions = { replace?: boolean };
export type Navigate = (to: string, options?: NavigationOptions) => void;

/** Compatibility surface for pages originally written against Wouter. */
export function useLocation(): [string, Navigate] {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const navigate = useCallback<Navigate>(
    (to, options) => {
      if (options?.replace) router.replace(to);
      else router.push(to);
    },
    [router],
  );
  return [pathname, navigate];
}

export function useParams<T extends Record<string, string | string[] | undefined> = Record<string, string | string[] | undefined>>() {
  return useNextParams() as T;
}

/** Wouter returns the query string including its leading question mark. */
export function useSearch(): string {
  const params = useSearchParams();
  const search = params.toString();
  return search ? `?${search}` : "";
}

export const Link = NextLink;
export type { LinkProps };
