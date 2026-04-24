import { NextRequest, NextResponse } from "next/server";
import { saveCalTokens } from "@/lib/cal";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const savedState = request.cookies.get("cal_oauth_state")?.value;

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
    const tokenRes = await fetch("https://api.cal.com/v2/oauth/exchange", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type: "authorization_code",
        code,
        client_id: process.env.CAL_CLIENT_ID!,
        client_secret: process.env.CAL_CLIENT_SECRET!,
        redirect_uri: process.env.CAL_REDIRECT_URI!,
      }),
    });

    if (!tokenRes.ok) {
      console.error("Cal.com token exchange failed:", await tokenRes.text());
      return NextResponse.redirect(
        new URL("/auth/error?error=token_exchange_failed", request.url)
      );
    }

    const tokenData = await tokenRes.json();
    const accessToken =
      tokenData.access_token ?? tokenData.data?.access_token;
    const refreshToken =
      tokenData.refresh_token ?? tokenData.data?.refresh_token;

    if (!accessToken || !refreshToken) {
      console.error("Cal.com missing tokens in response:", tokenData);
      return NextResponse.redirect(
        new URL("/auth/error?error=token_exchange_failed", request.url)
      );
    }

    // Save refresh token to user's Notion Settings database
    // This keeps everything private — token lives in their workspace
    await saveCalTokens(accessToken, refreshToken);

    // Redirect to dashboard with short-lived access token cookie
    const response = NextResponse.redirect(
      new URL("/dashboard", request.url)
    );

    // Access token in cookie for this session only (55 min, token lasts 60)
    response.cookies.set("cal_access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 55,
      path: "/",
    });

    // Client-readable flag for UI state
    response.cookies.set("cal_connected", "true", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    // Clean up state cookie
    response.cookies.delete("cal_oauth_state");

    return response;
  } catch (err) {
    console.error("Cal.com callback error:", err);
    return NextResponse.redirect(
      new URL("/auth/error?error=server_error", request.url)
    );
  }
}
