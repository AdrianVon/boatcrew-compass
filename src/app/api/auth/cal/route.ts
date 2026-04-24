import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { error: "Google Calendar integration not configured" },
      { status: 500 }
    );
  }

  const redirectUri = encodeURIComponent(process.env.GOOGLE_REDIRECT_URI!);
  const state = crypto.randomUUID();

  // Google OAuth authorization URL for Calendar read access
  const scopes = encodeURIComponent(
    "https://www.googleapis.com/auth/calendar.readonly"
  );

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scopes}&access_type=offline&prompt=consent&state=${state}`;

  const response = NextResponse.redirect(authUrl);
  response.cookies.set("gcal_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
  });

  return response;
}
