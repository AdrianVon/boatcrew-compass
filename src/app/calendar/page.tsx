"use client";

import { useState, useEffect } from "react";

interface Booking {
  id?: string;
  uid?: string;
  title?: string;
  description?: string;
  start?: string;
  startTime?: string;
  end?: string;
  endTime?: string;
  status?: string;
  attendees?: Array<{ name?: string; email?: string }>;
}

interface CalendarData {
  bookings: Booking[];
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
        setData({ bookings: [], connected: false, error: "Failed to load" });
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
              Link your Google Calendar, Outlook, or Apple Calendar through
              Cal.com so your AI coach can analyze how your time aligns with
              your priorities.
            </p>
          </div>
          <a
            href="/api/auth/cal"
            className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 active:bg-gray-950 transition-colors"
          >
            <svg
              className="w-5 h-5"
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
            Connect with Cal.com
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

  const bookings = data.bookings ?? [];
  const now = new Date();

  // Split into upcoming and past
  const upcoming = bookings
    .filter((b) => {
      const start = new Date(b.start ?? b.startTime ?? "");
      return start >= now && b.status !== "CANCELLED";
    })
    .sort((a, b) => {
      const aStart = new Date(a.start ?? a.startTime ?? "").getTime();
      const bStart = new Date(b.start ?? b.startTime ?? "").getTime();
      return aStart - bStart;
    });

  const past = bookings
    .filter((b) => {
      const start = new Date(b.start ?? b.startTime ?? "");
      return start < now && b.status !== "CANCELLED";
    })
    .sort((a, b) => {
      const aStart = new Date(a.start ?? a.startTime ?? "").getTime();
      const bStart = new Date(b.start ?? b.startTime ?? "").getTime();
      return bStart - aStart; // Most recent first
    });

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getDuration = (start: string, end: string) => {
    const ms = new Date(end).getTime() - new Date(start).getTime();
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const mins = Math.round((ms % (1000 * 60 * 60)) / (1000 * 60));
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

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
              Connected via Cal.com
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
      <div className="grid grid-cols-2 gap-3 mb-8">
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
          <p className="text-xs text-gray-400 font-medium">Completed</p>
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
            {upcoming.slice(0, 10).map((booking, i) => {
              const startStr = booking.start ?? booking.startTime ?? "";
              const endStr = booking.end ?? booking.endTime ?? "";
              return (
                <div
                  key={booking.uid ?? booking.id ?? i}
                  className="p-3 sm:p-4 bg-white rounded-xl border border-gray-100"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {booking.title ?? "Untitled event"}
                      </h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {startStr && formatDate(startStr)}
                        {startStr && ` \u00B7 ${formatTime(startStr)}`}
                        {startStr && endStr &&
                          ` \u2013 ${formatTime(endStr)}`}
                        {startStr && endStr &&
                          ` (${getDuration(startStr, endStr)})`}
                      </p>
                      {booking.attendees && booking.attendees.length > 0 && (
                        <p className="text-xs text-gray-300 mt-0.5 truncate">
                          with{" "}
                          {booking.attendees
                            .map((a) => a.name ?? a.email)
                            .join(", ")}
                        </p>
                      )}
                    </div>
                    <div className="shrink-0">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-500 text-xs font-medium rounded-full">
                        Upcoming
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Past events */}
      {past.length > 0 && (
        <div>
          <h2 className="text-lg font-black mb-3">Recent</h2>
          <div className="space-y-2">
            {past.slice(0, 10).map((booking, i) => {
              const startStr = booking.start ?? booking.startTime ?? "";
              const endStr = booking.end ?? booking.endTime ?? "";
              return (
                <div
                  key={booking.uid ?? booking.id ?? i}
                  className="p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-100"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-gray-500 truncate">
                        {booking.title ?? "Untitled event"}
                      </h3>
                      <p className="text-xs text-gray-300 mt-0.5">
                        {startStr && formatDate(startStr)}
                        {startStr && ` \u00B7 ${formatTime(startStr)}`}
                        {startStr && endStr &&
                          ` \u2013 ${formatTime(endStr)}`}
                        {startStr && endStr &&
                          ` (${getDuration(startStr, endStr)})`}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-400 text-xs font-medium rounded-full shrink-0">
                      Done
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {bookings.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-sm">
            No bookings found. Events will appear here once you start using
            Cal.com or connect your Google Calendar through Cal.com&apos;s
            settings.
          </p>
        </div>
      )}
    </main>
  );
}
