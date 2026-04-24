"use client";

import { useState, useEffect } from "react";

interface CalEvent {
  id?: string;
  title: string;
  description?: string;
  start: string;
  end: string;
  status?: string;
  attendees?: Array<{ name?: string; email?: string }>;
  location?: string;
}

interface CalendarData {
  events: CalEvent[];
  connected: boolean;
  error?: string;
}

export default function CalendarPage() {
  const [data, setData] = useState<CalendarData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/calendar");
        const json = await res.json();
        setData(json);
      } catch {
        setData({ events: [], connected: false, error: "Failed to load" });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center px-5">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-500 font-medium">Loading calendar...</p>
        </div>
      </main>
    );
  }

  if (!data?.connected) {
    return (
      <main className="min-h-screen flex items-center justify-center px-5">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mx-auto">
            <svg
              className="w-7 h-7 text-blue-400"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-black">Connect your calendar</h1>
            <p className="text-gray-500 mt-2 leading-relaxed">
              Link your Google Calendar so your AI coach can analyze how
              your time aligns with your priorities.
            </p>
          </div>
          <a
            href="/api/auth/cal"
            className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 active:bg-gray-950 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Connect Google Calendar
          </a>
          <a
            href="/dashboard"
            className="inline-block text-sm text-gray-400 hover:text-gray-600"
          >
            Back to dashboard
          </a>
        </div>
      </main>
    );
  }

  const events = data.events ?? [];
  const now = new Date();

  const upcoming = events
    .filter((e) => new Date(e.start) >= now)
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  const past = events
    .filter((e) => new Date(e.start) < now)
    .sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime());

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    // All-day events won't have a time component
    if (!dateStr.includes("T")) return "All day";
    return d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getDuration = (start: string, end: string) => {
    if (!start.includes("T") || !end.includes("T")) return "";
    const ms = new Date(end).getTime() - new Date(start).getTime();
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const mins = Math.round((ms % (1000 * 60 * 60)) / (1000 * 60));
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  // Calculate time spent this week
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);

  const thisWeekEvents = events.filter((e) => {
    const start = new Date(e.start);
    return start >= startOfWeek && start < endOfWeek;
  });

  const totalHoursThisWeek = thisWeekEvents.reduce((sum, e) => {
    if (!e.start.includes("T") || !e.end.includes("T")) return sum;
    const ms = new Date(e.end).getTime() - new Date(e.start).getTime();
    return sum + ms / (1000 * 60 * 60);
  }, 0);

  return (
    <main className="min-h-screen px-5 sm:px-6 py-8 sm:py-12 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <a
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 mb-4"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Dashboard
        </a>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black">Your Calendar</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Connected via Google Calendar
            </p>
          </div>
          <button
            onClick={async () => {
              await fetch("/api/calendar/disconnect", { method: "POST" });
              window.location.href = "/dashboard";
            }}
            className="text-xs text-gray-400 hover:text-gray-600 underline"
          >
            Disconnect
          </button>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="bg-blue-50 rounded-xl p-4">
          <p className="text-2xl font-black text-blue-600">
            {upcoming.length}
          </p>
          <p className="text-xs text-blue-400 font-medium">Upcoming</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-2xl font-black text-gray-600">
            {past.length}
          </p>
          <p className="text-xs text-gray-400 font-medium">Past 30 days</p>
        </div>
        <div className="bg-pink-50 rounded-xl p-4">
          <p className="text-2xl font-black text-pink-600">
            {Math.round(totalHoursThisWeek)}h
          </p>
          <p className="text-xs text-pink-400 font-medium">This week</p>
        </div>
      </div>

      {/* Alignment insight placeholder */}
      <div className="bg-gradient-to-br from-pink-50 to-blue-50 rounded-2xl p-5 mb-8 border border-pink-100">
        <div className="flex items-start gap-3">
          <span className="text-xl">&#x1F9E0;</span>
          <div>
            <h3 className="text-sm font-bold text-gray-900">
              AI Alignment Insights
            </h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Once you&apos;ve completed your Priorities Compass, your AI coach
              will analyze your calendar and show you how your time aligns with
              your stated priorities. Complete your workbook exercises to unlock
              this feature.
            </p>
          </div>
        </div>
      </div>

      {/* Upcoming events */}
      {upcoming.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-black mb-3">Upcoming</h2>
          <div className="space-y-2">
            {upcoming.slice(0, 15).map((event, i) => (
              <div
                key={event.id ?? i}
                className="p-3 sm:p-4 bg-white rounded-xl border border-gray-100"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                      {event.title}
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatDate(event.start)}
                      {" \u00B7 "}
                      {formatTime(event.start)}
                      {event.end && event.start.includes("T") &&
                        ` \u2013 ${formatTime(event.end)}`}
                      {event.start.includes("T") && event.end.includes("T") &&
                        ` (${getDuration(event.start, event.end)})`}
                    </p>
                    {event.attendees && event.attendees.length > 0 && (
                      <p className="text-xs text-gray-300 mt-0.5 truncate">
                        with{" "}
                        {event.attendees
                          .slice(0, 3)
                          .map((a) => a.name || a.email)
                          .join(", ")}
                        {event.attendees.length > 3 &&
                          ` +${event.attendees.length - 3}`}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Past events */}
      {past.length > 0 && (
        <div>
          <h2 className="text-lg font-black mb-3">Recent</h2>
          <div className="space-y-2">
            {past.slice(0, 15).map((event, i) => (
              <div
                key={event.id ?? i}
                className="p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-100"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-gray-500 truncate">
                      {event.title}
                    </h3>
                    <p className="text-xs text-gray-300 mt-0.5">
                      {formatDate(event.start)}
                      {" \u00B7 "}
                      {formatTime(event.start)}
                      {event.start.includes("T") && event.end.includes("T") &&
                        ` (${getDuration(event.start, event.end)})`}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {events.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-sm">
            No events found in the last 30 days or upcoming 30 days.
          </p>
        </div>
      )}
    </main>
  );
}
