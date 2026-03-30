"use client";

import { useState, useEffect, useCallback } from "react";
import {
  DIRECTION_META,
  getCurrentQuarter,
  type CompassData,
  type Direction,
} from "@/lib/notion-schemas";

interface SetupState {
  isSetUp: boolean;
  loading: boolean;
  error: string | null;
}

interface ReflectionSummary {
  quarterNumber: string;
  year: number;
  completed: boolean;
}

export default function DashboardPage() {
  const [setup, setSetup] = useState<SetupState>({
    isSetUp: false,
    loading: true,
    error: null,
  });
  const [compass, setCompass] = useState<CompassData | null>(null);
  const [reflections, setReflections] = useState<ReflectionSummary[]>([]);
  const [workspaceName, setWorkspaceName] = useState("");
  const [userName, setUserName] = useState("");
  const currentQ = getCurrentQuarter();
  const currentYear = new Date().getFullYear();

  // Read names from cookies (client-side)
  useEffect(() => {
    const cookies = document.cookie.split("; ");
    for (const c of cookies) {
      const [key, ...rest] = c.split("=");
      const val = decodeURIComponent(rest.join("="));
      if (key === "workspace_name") setWorkspaceName(val);
      if (key === "user_name") setUserName(val);
    }
  }, []);

  const runSetup = useCallback(async () => {
    try {
      const res = await fetch("/api/notion/setup", { method: "POST" });
      if (res.ok) {
        setSetup({ isSetUp: true, loading: false, error: null });
        return true;
      } else {
        const data = await res.json();
        setSetup({ isSetUp: false, loading: false, error: data.error });
        return false;
      }
    } catch {
      setSetup({
        isSetUp: false,
        loading: false,
        error: "Failed to set up. Please try again.",
      });
      return false;
    }
  }, []);

  useEffect(() => {
    async function init() {
      const setupOk = await runSetup();
      if (!setupOk) return;

      try {
        const compassRes = await fetch("/api/compass");
        if (compassRes.ok) {
          const data = await compassRes.json();
          if (data.compass) setCompass(data.compass);
        }
      } catch (err) {
        console.error("Failed to load compass:", err);
      }

      try {
        const refRes = await fetch("/api/reflection");
        if (refRes.ok) {
          const data = await refRes.json();
          setReflections(
            data.reflections?.map(
              (r: {
                quarterNumber: string;
                year: number;
                completed: boolean;
              }) => ({
                quarterNumber: r.quarterNumber,
                year: r.year,
                completed: r.completed,
              })
            ) ?? []
          );
        }
      } catch (err) {
        console.error("Failed to load reflections:", err);
      }
    }
    init();
  }, [runSetup]);

  const hasCurrentReflection = reflections.some(
    (r) => r.quarterNumber === currentQ && r.year === currentYear
  );

  const compassIsEmpty =
    !compass ||
    Object.values(compass).every((items) =>
      items.every((item: string) => !item.trim())
    );

  const isFirstTime = compassIsEmpty && reflections.length === 0;

  if (setup.loading) {
    return (
      <main className="min-h-screen flex items-center justify-center px-5">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-500 font-medium">
            Setting up your workspace...
          </p>
          <p className="text-xs text-gray-400">
            Creating your Priorities Compass and Quarterly Reflections databases
            in Notion
          </p>
        </div>
      </main>
    );
  }

  if (setup.error) {
    return (
      <main className="min-h-screen flex items-center justify-center px-5 sm:px-6">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto">
            <svg
              className="w-7 h-7 text-red-400"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-black">Setup needed</h1>
          <p className="text-gray-600 leading-relaxed">{setup.error}</p>
          <div className="space-y-3 pt-2">
            <button
              onClick={() => {
                setSetup({ isSetUp: false, loading: true, error: null });
                runSetup();
              }}
              className="w-full px-6 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 active:bg-gray-950"
            >
              Try again
            </button>
            <p className="text-xs text-gray-400">
              When Notion asks you to &ldquo;Select pages,&rdquo; you must check
              the box next to at least one page (or create a new blank page
              called &ldquo;Boatcrew Compass&rdquo;). The app creates your
              databases inside that page.
            </p>
            <a
              href="/api/auth/notion"
              className="inline-block text-sm text-gray-400 hover:text-gray-600 underline"
            >
              Reconnect with Notion
            </a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-5 sm:px-6 py-8 sm:py-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start sm:items-center justify-between mb-8 sm:mb-10 gap-4">
        <div className="min-w-0">
          <p className="text-xs sm:text-sm font-medium tracking-widest text-gray-400 uppercase">
            2026: Designed
          </p>
          <h1 className="text-2xl sm:text-3xl font-black truncate">
            {userName
              ? `Welcome${isFirstTime ? "" : " back"}, ${userName.split(" ")[0]}`
              : "Your Compass"}
          </h1>
          {workspaceName && (
            <p className="text-xs sm:text-sm text-gray-400 mt-0.5 truncate">
              Connected to {workspaceName}
            </p>
          )}
        </div>
        <form action="/api/auth/logout" method="POST" className="shrink-0">
          <button
            type="submit"
            className="text-sm text-gray-400 hover:text-gray-600 py-1"
          >
            Log out
          </button>
        </form>
      </div>

      {/* First-time welcome */}
      {isFirstTime && (
        <div className="bg-gradient-to-br from-pink-50 to-blue-50 rounded-2xl p-5 sm:p-8 mb-8 sm:mb-10 border border-pink-100">
          <div className="max-w-lg">
            <h2 className="text-lg sm:text-xl font-black mb-2">
              You&apos;re all set up!
            </h2>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-5 sm:mb-6">
              Two databases have been created in your Notion workspace:
              <strong> Priorities Compass</strong> and
              <strong> Quarterly Reflections</strong>. Start by setting your
              compass&mdash;it takes about 5 minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="/compass"
                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 active:bg-gray-950 transition-colors"
              >
                <span>Set Your Compass</span>
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
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </a>
              <p className="text-sm text-gray-400 self-center text-center sm:text-left">
                Takes about 5 minutes
              </p>
            </div>
          </div>

          {/* Mini guide */}
          <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-pink-100/50">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 sm:mb-4">
              Your journey
            </p>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-sm">
              <span className="flex items-center gap-1.5 sm:gap-2 text-green-600 font-semibold">
                <svg
                  className="w-5 h-5 shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Connect Notion
              </span>
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4 text-gray-300 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
              <span className="flex items-center gap-1.5 sm:gap-2 text-pink-500 font-semibold">
                <span className="w-5 h-5 rounded-full bg-pink-100 text-pink-500 text-xs flex items-center justify-center font-bold shrink-0">
                  2
                </span>
                Set Compass
              </span>
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4 text-gray-300 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
              <span className="flex items-center gap-1.5 sm:gap-2 text-gray-400">
                <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-400 text-xs flex items-center justify-center font-bold shrink-0">
                  3
                </span>
                Reflect
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Action cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-8 sm:mb-10">
        <a
          href="/compass"
          className="block p-5 sm:p-6 rounded-2xl border-2 border-gray-200 hover:border-gray-900 active:border-gray-900 transition-colors group"
        >
          <div className="flex items-start justify-between">
            <h2 className="text-base sm:text-lg font-black group-hover:text-gray-900">
              {compassIsEmpty ? "Set Your Compass" : "Edit Your Compass"}
            </h2>
            <span className="text-xl sm:text-2xl">&#x1F9ED;</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {compassIsEmpty
              ? "Define your North, South, East, and West priorities for the year"
              : "Update your priorities as things evolve"}
          </p>
          <span className="inline-block mt-3 text-sm font-semibold text-gray-400 group-hover:text-gray-900">
            {compassIsEmpty ? "Get started \u2192" : "Edit \u2192"}
          </span>
        </a>

        <a
          href="/reflection"
          className="block p-5 sm:p-6 rounded-2xl border-2 border-gray-200 hover:border-gray-900 active:border-gray-900 transition-colors group"
        >
          <div className="flex items-start justify-between">
            <h2 className="text-base sm:text-lg font-black group-hover:text-gray-900">
              {hasCurrentReflection
                ? `${currentQ} Reflection`
                : `Start ${currentQ} Reflection`}
            </h2>
            <span className="text-xl sm:text-2xl">&#x1F4DD;</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {hasCurrentReflection
              ? "Review or update your quarterly reflection"
              : "Take time to reflect on this quarter"}
          </p>
          <span className="inline-block mt-3 text-sm font-semibold text-gray-400 group-hover:text-gray-900">
            {hasCurrentReflection ? "Review \u2192" : "Begin \u2192"}
          </span>
        </a>
      </div>

      {/* Compass summary */}
      {!compassIsEmpty && compass && (
        <div>
          <h2 className="text-lg sm:text-xl font-black mb-3 sm:mb-4">
            Your Priorities at a Glance
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {(["North", "West", "East", "South"] as Direction[]).map((dir) => {
              const meta = DIRECTION_META[dir];
              const key = dir.toLowerCase() as keyof CompassData;
              const items = compass[key].filter((item: string) => item.trim());
              if (items.length === 0) return null;

              return (
                <div key={dir} className={`${meta.color} rounded-xl p-3 sm:p-4`}>
                  <h3 className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-1.5 sm:mb-2">
                    {meta.label} &mdash; {meta.title}
                  </h3>
                  <ul className="space-y-0.5 sm:space-y-1">
                    {items.map((item: string, i: number) => (
                      <li key={i} className="text-sm text-gray-700">
                        {i + 1}. {item}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Reflection status */}
      {reflections.length > 0 && (
        <div className="mt-6 sm:mt-8">
          <h2 className="text-lg sm:text-xl font-black mb-3 sm:mb-4">
            Reflections
          </h2>
          <div className="flex gap-2 sm:gap-3">
            {(["Q1", "Q2", "Q3", "Q4"] as const).map((q) => {
              const done = reflections.some(
                (r) => r.quarterNumber === q && r.year === currentYear
              );
              return (
                <div
                  key={q}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold ${
                    done
                      ? "bg-green-100 text-green-700"
                      : q === currentQ
                        ? "bg-yellow-50 text-yellow-600 border border-yellow-200"
                        : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {q} {done ? "\u2713" : q === currentQ ? "Now" : ""}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Notion tip for first-time users */}
      {isFirstTime && (
        <div className="mt-8 sm:mt-12 p-4 sm:p-5 bg-gray-50 rounded-xl border border-gray-100">
          <p className="text-sm text-gray-500 leading-relaxed">
            <strong className="text-gray-700">Tip:</strong> Open Notion and
            you&apos;ll see two new databases on the page you shared&mdash;
            &ldquo;Priorities Compass&rdquo; and &ldquo;Quarterly
            Reflections.&rdquo; Everything you enter here syncs there
            automatically.
          </p>
        </div>
      )}
    </main>
  );
}
