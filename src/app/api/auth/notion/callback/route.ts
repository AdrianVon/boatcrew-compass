import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

  if (error) {
    return NextResponse.redirect(`${appUrl}/auth/error?error=${error}`);
  }

  if (!code) {
    return NextResponse.redirect(`${appUrl}/auth/error?error=no_code`);
  }

  // Validate state
  const storedState = request.cookies.get("notion_oauth_state")?.value;
  if (state !== storedState) {
    return NextResponse.redirect(`${appUrl}/auth/error?error=invalid_state`);
  }

  try {
    const credentials = Buffer.from(
      `${process.env.NOTION_OAUTH_CLIENT_ID}:${process.env.NOTION_OAUTH_CLIENT_SECRET}`
    ).toString("base64");

    const tokenResponse = await fetch("https://api.notion.com/v1/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${credentials}`,
      },
      body: JSON.stringify({
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.NOTION_REDIRECT_URI,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error("Token exchange failed:", errorData);
      return NextResponse.redirect(
        `${appUrl}/auth/error?error=token_exchange_failed`
      );
    }

    const tokenData = await tokenResponse.json();

    const response = NextResponse.redirect(`${appUrl}/dashboard`);

    // Store auth data in secure cookies
    const cookieOpts = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    };

    response.cookies.set("notion_token", tokenData.access_token, cookieOpts);
    response.cookies.set(
      "notion_workspace_id",
      tokenData.workspace_id,
      cookieOpts
    );
    response.cookies.set(
      "notion_workspace_name",
      tokenData.workspace_name ?? "",
      cookieOpts
    );

    // Store user info if available
    if (tokenData.owner?.user) {
      response.cookies.set(
        "notion_user_name",
        tokenData.owner.user.name ?? "",
        cookieOpts
      );
    }

    // Clear the state cookie
    response.cookies.delete("notion_oauth_state");

    return response;
  } catch (err) {
    console.error("OAuth callback error:", err);
    return NextResponse.redirect(`${appUrl}/auth/error?error=server_error`);
  }
}
