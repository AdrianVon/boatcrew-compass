import { NextResponse } from "next/server";
import { getCalAccessToken, calApiFetch, isCalConnectedServer } from "@/lib/cal";

// GET /api/calendar — fetch bookings and busy times
export async function GET() {
  // First check if calendar is connected via Notion settings
  const connected = await isCalConnectedServer();
  if (!connected) {
    return NextResponse.json({ connected: false, bookings: [] });
  }

  const token = await getCalAccessToken();
  if (!token) {
    return NextResponse.json(
      { error: "Calendar token expired. Please reconnect.", connected: false },
      { status: 401 }
    );
  }

  try {
    // Fetch bookings from Cal.com
    const bookingsData = await calApiFetch("/bookings", token);

    // Fetch connected calendars
    let calendars = null;
    try {
      calendars = await calApiFetch("/calendars", token);
    } catch {
      // Calendar list may not be available depending on scopes
    }

    // Fetch busy times for the current week
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    let busyTimes = null;
    try {
      busyTimes = await calApiFetch(
        `/calendars/busy-times?dateFrom=${startOfWeek.toISOString()}&dateTo=${endOfWeek.toISOString()}&timeZone=${encodeURIComponent("America/New_York")}`,
        token
      );
    } catch {
      // Busy times may not be available
    }

    // Set the access token cookie for the rest of this session
    const response = NextResponse.json({
      bookings: bookingsData.data ?? bookingsData.bookings ?? [],
      calendars: calendars?.data ?? null,
      busyTimes: busyTimes?.data ?? null,
      connected: true,
    });

    response.cookies.set("cal_access_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 55,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("Calendar fetch error:", err);
    return NextResponse.json(
      { error: "Failed to fetch calendar data", connected: true },
      { status: 500 }
    );
  }
}
