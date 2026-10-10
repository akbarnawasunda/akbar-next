import { NextRequest, NextResponse } from "next/server";

/** Carry the route locale into the root layout so even raw SSR HTML is correct. */
export function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-akbar-pathname", request.nextUrl.pathname);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|assets/|api/|robots.txt|sitemap.xml).*)"],
};
