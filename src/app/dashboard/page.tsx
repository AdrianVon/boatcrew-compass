"use client";

import { useState, useEffect, useCallback } from "react";
import {
  DIRECTION_META,
  getCurrentQuarter,
  type CompassData,
  type Direction,
} from "@/lib/notion-schemas";
import {
  EXERCISES,
  EXERCISE_ORDER,
  PHASE_META,
  type ExercisePhase,
} from "@/lib/exercises";

interface SetupState {
  isSetUp: boolean;
  loading: boolean;
  error: string | null;
}

export default function DashboardPage() {
  const [setup, setSetup] = useState<SetupState>({
    isSetUp: false,
    loading: true,
    error: null,
  });
  const [compass, setCompass] = useState<CompassData | null>(null);
  const [reflectionCount, setReflectionCount] = useState(0);
  const [exerciseStatus, setExerciseStatus] = useState<Record<string, boolean>>({});
  const [workspaceName, setWorkspaceName] = useState("");
  const [userName, setUserName] = useState("");
  const [calConnected, setCalConnected] = useState(false);
  const [calLoading, setCalLoading] = useState(true);
  const currentQ = getCurrentQuarter();
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const cookies = document.cookie.split("; ");
    for (const c of cookies) {
      const [key, ...rest] = c.split("=");
      const val = decodeURIComponent(rest.join("="));
      if (key === "workspace_name") setWorkspaceName(val);
      if (key === "user_name") setUserName(val);
      if (key === "cal_connected" && val === "true") setCalConnected(true);
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

      // Load all data in parallel
      const [compassRes, refRes, statusRes, calRes] = await Promise.allSettled([
        fetch("/api/compass"),
        fetch("/api/reflection"),
        fetch("/api/exercise/status"),
        fetch("/api/calendar"),
      ]);

      if (compassRes.status === "fulfilled" && compassRes.value.ok) {
        const data = await compassRes.value.json();
        if (data.compass) setCompass(data.compass);
      }

      if (refRes.status === "fulfilled" && refRes.value.ok) {
        const data = await refRes.value.json();
        setReflectionCount(data.reflections?.length ?? 0);
      }

      if (statusRes.status === "fulfilled" && statusRes.value.ok) {
        const data = await statusRes.value.json();
        setExerciseStatus(data.status ?? {});
      }

      if (calRes.status === "fulfilled" && calRes.value.ok) {
        const data = await calRes.value.json();
        setCalConnected(data.connected ?? false);
      }
      setCalLoading(false);
    }
    init();
  }, [runSetup]);

  const compassIsEmpty =
    !compass ||
    Object.values(compass).every((items) =>
      items.every((item: string) => !item.trim())
    );

  // Count completions
  const totalExercises = EXERCISE_ORDER.length + 2; // +compass +reflection
  const completedCount =
    Object.values(exerciseStatus).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / totalExercises) * 100);

  // Group exercises by phase
  const phases: { phase: ExercisePhase; exercises: typeof EXERCISE_ORDER }[] = [];
  const phaseMap: Record<string, string[]> = {};

  for (const slug of EXERCISE_ORDER) {
    const ex = EXERCISES[slug];
    if (!ex) continue;
    if (!phaseMap[ex.phase]) phaseMap[ex.phase] = [];
    phaseMap[ex.phase].push(slug);
  }

  const phaseOrder: ExercisePhase[] = [
    "look-back",
    "look-inward",
    "set-direction",
    "commit",
    "reflect",
  ];

  for (const p of phaseOrder) {
    if (phaseMap[p]) {
      phases.push({ phase: p, exercises: phaseMap[p] });
    }
  }

  // Find the first incomplete exercise for the CTA
  const firstIncomplete = EXERCISE_ORDER.find(
    (slug) => !exerciseStatus[slug]
  );

  if (setup.loading) {
    return (
      <main className="min-h-screen flex items-center justify-center px-5">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-500 font-medium">
            Setting up your workspace...
          </p>
          <p className="text-xs text-gray-400">
            Creating your workbook databases in Notion
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
              Click &ldquo;Reconnect&rdquo; below and hit &ldquo;Allow
              access&rdquo; on the Notion screen. Your workspace will be
              set up automatically.
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
      <div className="flex items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
        <div className="min-w-0">
          <p className="text-xs sm:text-sm font-medium tracking-widest text-gray-400 uppercase">
            2026: Designed
          </p>
          <h1 className="text-2xl sm:text-3xl font-black truncate">
            {userName
              ? `Welcome${completedCount > 0 ? " back" : ""}, ${userName.split(" ")[0]}`
              : "Your Workbook"}
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

      {/* Progress bar */}
      <div className="mb-8 sm:mb-10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">
            {completedCount} of {totalExercises} exercises
          </span>
          <span className="text-sm text-gray-400">{progressPercent}%</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gray-900 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        {completedCount === 0 && (
          <p className="text-xs text-gray-400 mt-2">
            Start with the first exercise — it takes about 5 minutes
          </p>
        )}
        {completedCount === totalExercises && (
          <p className="text-xs text-green-600 font-semibold mt-2">
            You&apos;ve completed the entire workbook!
          </p>
        )}
      </div>

      {/* Start CTA for new users */}
      {completedCount === 0 && firstIncomplete && (
        <div className="bg-gradient-to-br from-pink-50 to-blue-50 rounded-2xl p-5 sm:p-8 mb-8 sm:mb-10 border border-pink-100">
          <h2 className="text-lg sm:text-xl font-black mb-2">
            Ready to design your 2026?
          </h2>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-5">
            14 exercises from Daniel Pink&apos;s workbook, saved to your Notion
            workspace. Work through them at your own pace — each one builds on
            the last.
          </p>
          <a
            href={`/exercise/${firstIncomplete}`}
            className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 active:bg-gray-950 transition-colors"
          >
            <span>Begin the Workbook</span>
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
        </div>
      )}

      {/* Continue CTA for returning users */}
      {completedCount > 0 && completedCount < totalExercises && firstIncomplete && (
        <div className="bg-gray-50 rounded-2xl p-5 sm:p-6 mb-8 sm:mb-10 border border-gray-100">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-black">Continue where you left off</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Next up: {EXERCISES[firstIncomplete]?.title}
              </p>
            </div>
            <a
              href={`/exercise/${firstIncomplete}`}
              className="shrink-0 px-5 py-2.5 bg-gray-900 text-white font-semibold rounded-xl text-sm hover:bg-gray-800 active:bg-gray-950"
            >
              Continue
            </a>
          </div>
        </div>
      )}

      {/* Exercise sections by phase */}
      <div className="space-y-8 sm:space-y-10">
        {phases.map(({ phase, exercises }) => (
          <div key={phase}>
            <div className="mb-3 sm:mb-4">
              <h2 className="text-lg sm:text-xl font-black">
                {PHASE_META[phase].label}
              </h2>
              <p className="text-sm text-gray-400">
                {PHASE_META[phase].description}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {exercises.map((slug) => {
                const ex = EXERCISES[slug];
                if (!ex) return null;
                const done = exerciseStatus[slug];
                return (
                  <a
                    key={slug}
                    href={`/exercise/${slug}`}
                    className="block p-4 sm:p-5 rounded-xl border-2 border-gray-200 hover:border-gray-900 active:border-gray-900 transition-colors group"
                  >
                    <div className="flex items-start justify-between">
                      <h3 className="text-sm sm:text-base font-bold group-hover:text-gray-900">
                        {ex.emoji} {ex.title}
                      </h3>
                      {done && (
                        <svg
                          className="w-5 h-5 text-green-500 shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                      {ex.subtitle}
                    </p>
                  </a>
                );
              })}

              {/* Insert Compass card in "commit" phase */}
              {phase === "commit" && (
                <>
                  {/* Show compass card at the start of commit, conceptually after set-direction */}
                </>
              )}
            </div>
          </div>
        ))}

        {/* Compass — special card */}
        <div>
          <div className="mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl font-black">
              Your Compass
            </h2>
            <p className="text-sm text-gray-400">
              The one-page map for how you&apos;ll move through the year
            </p>
          </div>
          <a
            href="/compass"
            className="block p-4 sm:p-5 rounded-xl border-2 border-gray-200 hover:border-gray-900 active:border-gray-900 transition-colors group"
          >
            <div className="flex items-start justify-between">
              <h3 className="text-sm sm:text-base font-bold group-hover:text-gray-900">
                &#x1F9ED; Priorities Compass
              </h3>
              {exerciseStatus["compass"] && (
                <svg
                  className="w-5 h-5 text-green-500 shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {compassIsEmpty
                ? "Define your North, South, East, and West priorities"
                : "Update your priorities as things evolve"}
            </p>
          </a>

          {/* Compass summary */}
          {!compassIsEmpty && compass && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              {(["North", "West", "East", "South"] as Direction[]).map((dir) => {
                const meta = DIRECTION_META[dir];
                const key = dir.toLowerCase() as keyof CompassData;
                const items = compass[key].filter((item: string) => item.trim());
                if (items.length === 0) return null;

                return (
                  <div key={dir} className={`${meta.color} rounded-xl p-3 sm:p-4`}>
                    <h4 className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-1.5">
                      {meta.label} &mdash; {meta.title}
                    </h4>
                    <ul className="space-y-0.5">
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
          )}
        </div>

        {/* Quarterly Reflection — special card */}
        <div>
          <div className="mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl font-black">
              Quarterly Reflections
            </h2>
            <p className="text-sm text-gray-400">
              Check in four times a year and recalibrate
            </p>
          </div>
          <a
            href="/reflection"
            className="block p-4 sm:p-5 rounded-xl border-2 border-gray-200 hover:border-gray-900 active:border-gray-900 transition-colors group"
          >
            <div className="flex items-start justify-between">
              <h3 className="text-sm sm:text-base font-bold group-hover:text-gray-900">
                &#x1F4DD; {currentQ} Reflection ({currentYear})
              </h3>
              {exerciseStatus["reflection"] && (
                <svg
                  className="w-5 h-5 text-green-500 shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {exerciseStatus["reflection"]
                ? "Review or update your quarterly reflection"
                : "Take time to reflect on this quarter"}
            </p>
          </a>

          {/* Quarter status pills */}
          <div className="flex gap-2 mt-3">
            {(["Q1", "Q2", "Q3", "Q4"] as const).map((q) => (
              <div
                key={q}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  q === currentQ
                    ? "bg-yellow-50 text-yellow-600 border border-yellow-200"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {q} {q === currentQ ? "Now" : ""}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Calendar connection */}
      <div className="mt-8 sm:mt-10">
        <div className="mb-3 sm:mb-4">
          <h2 className="text-lg sm:text-xl font-black">
            Your Calendar
          </h2>
          <p className="text-sm text-gray-400">
            Connect your calendar so your AI coach can see if you&apos;re walking the talk
          </p>
        </div>

        {calConnected ? (
          <a
            href="/calendar"
            className="block p-4 sm:p-5 rounded-xl border-2 border-green-200 bg-green-50 hover:border-green-400 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-green-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="text-sm font-bold text-green-800">Calendar connected</h3>
                  <p className="text-xs text-green-600">View your calendar and alignment insights</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-green-300 group-hover:text-green-500 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </a>
        ) : (
          <a
            href="/api/auth/cal"
            className="block p-4 sm:p-5 rounded-xl border-2 border-dashed border-gray-300 hover:border-gray-900 transition-colors group text-center sm:text-left"
          >
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold group-hover:text-gray-900">
                  Connect your calendar
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Link Google Calendar, Outlook, or Apple Calendar via Cal.com to unlock AI alignment insights
                </p>
              </div>
              <svg className="w-5 h-5 text-gray-300 group-hover:text-gray-900 shrink-0 hidden sm:block" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </a>
        )}
      </div>

      {/* Notion tip */}
      {completedCount <= 2 && (
        <div className="mt-10 sm:mt-12 p-4 sm:p-5 bg-gray-50 rounded-xl border border-gray-100">
          <p className="text-sm text-gray-500 leading-relaxed">
            <strong className="text-gray-700">Tip:</strong> Open Notion and
            you&apos;ll see your workbook databases on the page you shared.
            Everything you enter here syncs there automatically.
          </p>
        </div>
      )}
    </main>
  );
}
