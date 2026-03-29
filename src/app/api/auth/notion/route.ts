import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.NOTION_OAUTH_CLIENT_ID!;
  const redirectUri = encodeURIComponent(process.env.NOTION_REDIRECT_URI!);
  const state = crypto.randomUUID();

  const authUrl = `https://api.notion.com/v1/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&owner=user&state=${state}`;

  const response = NextResponse.redirect(authUrl);
  response.cookies.set("notion_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
  });

  return response;
}
