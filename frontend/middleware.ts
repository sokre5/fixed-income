import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "fi-session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function isAuthenticated(request: NextRequest): boolean {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const secret = process.env.APP_PASSWORD;
  if (!secret) return true; // no password set = no auth required (local dev)
  return token === hashToken(secret);
}

function hashToken(password: string): string {
  // Simple but sufficient hash for a single-user session cookie
  let hash = 0;
  const str = `fi-journal:${password}:salt-2026`;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return `ses_${Math.abs(hash).toString(36)}`;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow login page and login API
  if (pathname === "/login" || pathname === "/api/auth") {
    return NextResponse.next();
  }

  // Allow Next.js internals and static assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.endsWith(".ico") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".svg")
  ) {
    return NextResponse.next();
  }

  // Check auth
  if (!isAuthenticated(request)) {
    // API routes get 401
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    // Pages redirect to login
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
