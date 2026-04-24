import { NextRequest, NextResponse } from "next/server";
import { saveGCalTokens } from "@/lib/cal";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const savedState = request.cookies.get("gcal_oauth_state")?.value;

  // Validate state
  if (!state || state !== savedState) {
    return NextResponse.redirect(
      new URL("/auth/error?error=invalid_state", request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL("/auth/error?error=no_code", request.url)
    );
  }

  try {
    // Exchange authorization code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
      }),
    });

    if (!tokenRes.ok) {
      console.error("Google token exchange failed:", await tokenRes.text());
      return NextResponse.redirect(
        new URL("/auth/error?error=token_exchange_failed", request.url)
      );
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;

    if (!accessToken) {
      console.error("Google no access token in response:", tokenData);
      return NextResponse.redirect(
        new URL("/auth/error?error=token_exchange_failed", request.url)
      );
    }

    // Save refresh token to user's Notion Settings database
    if (refreshToken) {
      await saveGCalTokens(refreshToken);
    }

    // Redirect to dashboard
    const response = NextResponse.redirect(
      new URL("/dashboard", request.url)
    );

    // Short-lived access token cookie for this session
    response.cookies.set("gcal_access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 55, // 55 minutes
      path: "/",
    });

    // Client-readable flag for UI
    response.cookies.set("gcal_connected", "true", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    // Clean up
    response.cookies.delete("gcal_oauth_state");

    return response;
  } catch (err) {
    console.error("Google Calendar callback error:", err);
    return NextResponse.redirect(
      new URL("/auth/error?error=server_error", request.url)
    );
  }
}
