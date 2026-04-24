import { NextResponse } from "next/server";
import { getGCalAccessToken, gcalApiFetch, isGCalConnectedServer } from "@/lib/cal";

// GET /api/calendar — fetch events from Google Calendar
export async function GET() {
  // Check if calendar is connected via Notion settings
  const connected = await isGCalConnectedServer();
  if (!connected) {
    return NextResponse.json({ connected: false, events: [] });
  }

  const token = await getGCalAccessToken();
  if (!token) {
    return NextResponse.json(
      { error: "Calendar token expired. Please reconnect.", connected: false },
      { status: 401 }
    );
  }

  try {
    // Get events from the past 30 days and next 30 days
    const now = new Date();
    const past = new Date(now);
    past.setDate(now.getDate() - 30);
    const future = new Date(now);
    future.setDate(now.getDate() + 30);

    const timeMin = encodeURIComponent(past.toISOString());
    const timeMax = encodeURIComponent(future.toISOString());

    const eventsData = await gcalApiFetch(
      `/calendars/primary/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime&maxResults=100`,
      token
    );

    const events = (eventsData.items ?? []).map(
      (event: {
        id?: string;
        summary?: string;
        description?: string;
        start?: { dateTime?: string; date?: string };
        end?: { dateTime?: string; date?: string };
        status?: string;
        attendees?: Array<{ displayName?: string; email?: string }>;
        location?: string;
      }) => ({
        id: event.id,
        title: event.summary ?? "Untitled",
        description: event.description ?? "",
        start: event.start?.dateTime ?? event.start?.date ?? "",
        end: event.end?.dateTime ?? event.end?.date ?? "",
        status: event.status,
        attendees: (event.attendees ?? []).map((a) => ({
          name: a.displayName ?? "",
          email: a.email ?? "",
        })),
        location: event.location ?? "",
      })
    );

    // Set the access token cookie for the rest of this session
    const response = NextResponse.json({
      events,
      connected: true,
    });

    response.cookies.set("gcal_access_token", token, {
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
