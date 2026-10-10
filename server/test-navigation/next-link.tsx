import {
  forwardRef,
  type AnchorHTMLAttributes,
  type ReactNode,
} from "react";

type LinkHref = string | { pathname?: string; query?: Record<string, unknown> };

type TestLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: LinkHref;
  prefetch?: boolean | null;
  replace?: boolean;
  scroll?: boolean;
  shallow?: boolean;
  locale?: string | false;
  onNavigate?: (event: { preventDefault: () => void }) => void;
  children?: ReactNode;
};

function hrefValue(href: LinkHref) {
  if (typeof href === "string") return href;
  const url = new URL(href.pathname || "/", "http://test.local");
  Object.entries(href.query || {}).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach(item => url.searchParams.append(key, String(item)));
    } else if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  });
  return `${url.pathname}${url.search}${url.hash}`;
}

export default forwardRef<HTMLAnchorElement, TestLinkProps>(
  function TestNextLink(
    {
      href,
      prefetch: _prefetch,
      replace: _replace,
      scroll: _scroll,
      shallow: _shallow,
      locale: _locale,
      onNavigate: _onNavigate,
      ...anchorProps
    },
    ref,
  ) {
    return <a {...anchorProps} ref={ref} href={hrefValue(href)} />;
  },
);
