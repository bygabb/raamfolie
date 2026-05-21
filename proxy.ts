import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIE_NAAM, verifySession } from "@/lib/admin-auth";

// Next.js 16: Middleware heet nu Proxy. Beschermt /admin/*.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const opLogin = pathname === "/admin/login";

  const ingelogd = await verifySession(
    request.cookies.get(COOKIE_NAAM)?.value,
  );

  if (!ingelogd && !opLogin) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  if (ingelogd && opLogin) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
