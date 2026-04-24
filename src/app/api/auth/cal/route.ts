import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.CAL_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { error: "Cal.com integration not configured" },
      { status: 500 }
    );
  }

  const redirectUri = encodeURIComponent(process.env.CAL_REDIRECT_URI!);
  const state = crypto.randomUUID();

  // Cal.com OAuth authorization URL
  const authUrl = `https://app.cal.com/auth/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&state=${state}&scope=READ_PROFILE,READ_BOOKING,APPS_READ`;

  const response = NextResponse.redirect(authUrl);
  response.cookies.set("cal_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
  });

  return response;
}
