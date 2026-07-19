import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Zet pathname-header zodat root layout admin-chrome kan weglaten. */
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  response.headers.set("x-pathname", request.nextUrl.pathname);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
