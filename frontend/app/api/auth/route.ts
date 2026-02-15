import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "fi-session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function hashToken(password: string): string {
  let hash = 0;
  const str = `fi-journal:${password}:salt-2026`;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return `ses_${Math.abs(hash).toString(36)}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;
    const secret = process.env.APP_PASSWORD;

    if (!secret) {
      return NextResponse.json({ message: "No password configured" }, { status: 500 });
    }

    if (password !== secret) {
      return NextResponse.json({ message: "Invalid password" }, { status: 401 });
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE, hashToken(secret), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("POST /api/auth error:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
