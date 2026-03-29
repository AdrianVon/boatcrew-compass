"use client";

import { useState, useEffect, useCallback } from "react";
import { DIRECTION_META, getCurrentQuarter, type CompassData, type Direction } from "@/lib/notion-schemas";

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
  const currentQ = getCurrentQuarter();
  const currentYear = new Date().getFullYear();

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

      // Load compass data
      try {
        const compassRes = await fetch("/api/compass");
        if (compassRes.ok) {
          const data = await compassRes.json();
          if (data.compass) setCompass(data.compass);
        }
      } catch (err) {
        console.error("Failed to load compass:", err);
      }

      // Load reflections
      try {
        const refRes = await fetch("/api/reflection");
        if (refRes.ok) {
          const data = await refRes.json();
          setReflections(
            data.reflections?.map(
              (r: { quarterNumber: string; year: number; completed: boolean }) => ({
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

  if (setup.loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-400">Setting up your workspace...</p>
        </div>
      </main>
    );
  }

  if (setup.error) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-2xl font-black">Setup needed</h1>
          <p className="text-gray-600">{setup.error}</p>
          <button
            onClick={() => {
              setSetup({ isSetUp: false, loading: true, error: null });
              runSetup();
            }}
            className="px-6 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800"
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <p className="text-sm font-medium tracking-widest text-gray-400 uppercase">
            2026: Designed
          </p>
          <h1 className="text-3xl font-black">Your Compass</h1>
        </div>
        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            className="text-sm text-gray-400 hover:text-gray-600"
          >
            Log out
          </button>
        </form>
      </div>

      {/* Action cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        <a
          href="/compass"
          className="block p-6 rounded-2xl border-2 border-gray-200 hover:border-gray-900 transition-colors group"
        >
          <h2 className="text-lg font-black group-hover:text-gray-900">
            {compassIsEmpty ? "Set Your Compass" : "Edit Your Compass"}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {compassIsEmpty
              ? "Define your North, South, East, and West priorities"
              : "Update your priorities as things evolve"}
          </p>
          <span className="inline-block mt-3 text-sm font-semibold text-gray-400 group-hover:text-gray-900">
            {compassIsEmpty ? "Get started \u2192" : "Edit \u2192"}
          </span>
        </a>

        <a
          href="/reflection"
          className="block p-6 rounded-2xl border-2 border-gray-200 hover:border-gray-900 transition-colors group"
        >
          <h2 className="text-lg font-black group-hover:text-gray-900">
            {hasCurrentReflection
              ? `${currentQ} Reflection`
              : `Start ${currentQ} Reflection`}
          </h2>
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
          <h2 className="text-xl font-black mb-4">Your Priorities at a Glance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(["North", "West", "East", "South"] as Direction[]).map((dir) => {
              const meta = DIRECTION_META[dir];
              const key = dir.toLowerCase() as keyof CompassData;
              const items = compass[key].filter((item: string) => item.trim());
              if (items.length === 0) return null;

              return (
                <div key={dir} className={`${meta.color} rounded-xl p-4`}>
                  <h3 className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">
                    {meta.label} &mdash; {meta.title}
                  </h3>
                  <ul className="space-y-1">
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
        <div className="mt-8">
          <h2 className="text-xl font-black mb-4">Reflections</h2>
          <div className="flex gap-3">
            {(["Q1", "Q2", "Q3", "Q4"] as const).map((q) => {
              const done = reflections.some(
                (r) => r.quarterNumber === q && r.year === currentYear
              );
              return (
                <div
                  key={q}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                    done
                      ? "bg-green-100 text-green-700"
                      : q === currentQ
                      ? "bg-yellow-50 text-yellow-600 border border-yellow-200"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {q} {done ? "\u2713" : q === currentQ ? "In progress" : ""}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </main>
  );
}
