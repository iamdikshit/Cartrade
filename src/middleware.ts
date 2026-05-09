import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // Prevent caching of admin pages
  if (pathname.startsWith("/admin")) {
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate",
    );
    response.headers.set("Pragma", "no-cache");
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
