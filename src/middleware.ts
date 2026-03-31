import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/dashboard", "/compass", "/reflection", "/exercise"];

export function middleware(request: NextRequest) {
  const token = request.cookies.get("notion_token")?.value;
  const { pathname } = request.nextUrl;

  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
