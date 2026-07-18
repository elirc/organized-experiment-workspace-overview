import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const userCookie = request.cookies.get("crm_demo_user")?.value;
  const pathname = request.nextUrl.pathname;

  const response = pathname === "/login" || pathname.startsWith("/_next")
    ? NextResponse.next()
    : !userCookie
      ? NextResponse.redirect(new URL("/login", request.url))
      : NextResponse.next();

  response.headers.set("x-pathname", pathname);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
