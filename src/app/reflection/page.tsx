"use client";

import { useState, useEffect } from "react";
import {
  getCurrentQuarter,
  getQuarterLabel,
  type ReflectionData,
} from "@/lib/notion-schemas";

const PROMPTS = [
  { key: "whatWorked", label: "What worked:" },
  {
    key: "whatToSubtract",
    label: "What didn\u2019t work / what to subtract:",
  },
  { key: "whatSurprisedMe", label: "What surprised me:" },
  {
    key: "themeAlignment",
    label: "How well I lived my Theme:",
  },
  { key: "adjustments", label: "What I\u2019ll adjust next quarter:" },
  {
    key: "next7DaysAction",
    label: "One action for the next 7 days:",
  },
] as const;

export default function ReflectionPage() {
  const currentYear = new Date().getFullYear();
  const currentQ = getCurrentQuarter();

  const [quarter, setQuarter] = useState<"Q1" | "Q2" | "Q3" | "Q4">(currentQ);
  const [year] = useState(currentYear);
  const [reflection, setReflection] = useState<ReflectionData>({
    quarter: currentQ,
    year: currentYear,
    whatWorked: "",
    whatToSubtract: "",
    whatSurprisedMe: "",
    themeAlignment: "",
    adjustments: "",
    next7DaysAction: "",
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [existingReflections, setExistingReflections] = useState<
    Array<{ quarterNumber: string; year: number }>
  >([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/reflection");
        if (res.ok) {
          const data = await res.json();
          setExistingReflections(
            data.reflections?.map(
              (r: { quarterNumber: string; year: number }) => ({
                quarterNumber: r.quarterNumber,
                year: r.year,
              })
            ) ?? []
          );

          // Find current quarter's reflection if it exists
          const current = data.reflections?.find(
            (r: { quarterNumber: string; year: number }) =>
              r.quarterNumber === currentQ && r.year === currentYear
          );
          if (current) {
            setReflection({
              quarter: currentQ,
              year: currentYear,
              whatWorked: current.whatWorked ?? "",
              whatToSubtract: current.whatToSubtract ?? "",
              whatSurprisedMe: current.whatSurprisedMe ?? "",
              themeAlignment: current.themeAlignment ?? "",
              adjustments: current.adjustments ?? "",
              next7DaysAction: current.next7DaysAction ?? "",
            });
          }
        }
      } catch (err) {
        console.error("Failed to load reflections:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [currentQ, currentYear]);

  const handleQuarterChange = async (q: "Q1" | "Q2" | "Q3" | "Q4") => {
    setQuarter(q);
    setReflection((prev) => ({
      ...prev,
      quarter: q,
      whatWorked: "",
      whatToSubtract: "",
      whatSurprisedMe: "",
      themeAlignment: "",
      adjustments: "",
      next7DaysAction: "",
    }));

    // Load data for selected quarter
    try {
      const res = await fetch("/api/reflection");
      if (res.ok) {
        const data = await res.json();
        const match = data.reflections?.find(
          (r: { quarterNumber: string; year: number }) =>
            r.quarterNumber === q && r.year === year
        );
        if (match) {
          setReflection({
            quarter: q,
            year,
            whatWorked: match.whatWorked ?? "",
            whatToSubtract: match.whatToSubtract ?? "",
            whatSurprisedMe: match.whatSurprisedMe ?? "",
            themeAlignment: match.themeAlignment ?? "",
            adjustments: match.adjustments ?? "",
            next7DaysAction: match.next7DaysAction ?? "",
          });
        }
      }
    } catch (err) {
      console.error("Failed to load quarter data:", err);
    }
  };

  const handleChange = (key: string, value: string) => {
    setReflection((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/reflection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reflection }),
      });
      if (res.ok) {
        setMessage("Saved to Notion");
        setTimeout(() => setMessage(""), 3000);
      } else {
        const data = await res.json();
        setMessage(data.error || "Failed to save");
      }
    } catch {
      setMessage("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Loading reflections...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 sm:px-6 py-8 sm:py-12 max-w-2xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <a
          href="/dashboard"
          className="text-sm text-gray-400 hover:text-gray-600"
        >
          &larr; Dashboard
        </a>
        <h1 className="text-2xl sm:text-3xl font-black mt-1">
          Quarterly Reflection
        </h1>
        <p className="text-sm sm:text-base text-gray-500 mt-1">
          Revisit your Theme, Compass, and Three Wins before you begin.
        </p>
      </div>

      {/* Quarter selector — scrollable on mobile */}
      <div className="flex gap-2 mb-6 sm:mb-8 overflow-x-auto pb-1 -mx-1 px-1">
        {(["Q1", "Q2", "Q3", "Q4"] as const).map((q) => {
          const hasData = existingReflections.some(
            (r) => r.quarterNumber === q && r.year === year
          );
          return (
            <button
              key={q}
              onClick={() => handleQuarterChange(q)}
              className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors relative shrink-0 min-w-[4.5rem] ${
                quarter === q
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 active:bg-gray-300"
              }`}
            >
              {getQuarterLabel(q)}
              {hasData && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Reflection prompts */}
      <div className="space-y-5 sm:space-y-6">
        {PROMPTS.map(({ key, label }) => (
          <div key={key}>
            <label className="block text-sm font-bold text-gray-700 mb-1.5 sm:mb-2">
              {label}
            </label>
            <textarea
              value={reflection[key as keyof ReflectionData] as string}
              onChange={(e) => handleChange(key, e.target.value)}
              rows={3}
              className="w-full px-3 sm:px-4 py-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm resize-y"
              placeholder="Take your time..."
            />
          </div>
        ))}
      </div>

      {/* Sticky save button on mobile */}
      <div className="mt-6 sm:mt-8 sm:flex sm:items-center sm:gap-4">
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-50/95 backdrop-blur border-t border-gray-200 sm:static sm:p-0 sm:bg-transparent sm:backdrop-blur-none sm:border-0 z-10">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto px-8 py-3.5 sm:py-3 bg-gray-900 text-white font-semibold rounded-xl sm:rounded-lg hover:bg-gray-800 active:bg-gray-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base sm:text-sm"
          >
            {saving ? "Saving..." : "Save to Notion"}
          </button>
        </div>
        {message && (
          <p
            className={`text-sm font-medium mt-3 sm:mt-0 text-center sm:text-left ${
              message.includes("Failed") ? "text-red-500" : "text-green-600"
            }`}
          >
            {message}
          </p>
        )}
      </div>

      {/* Spacer so content isn't hidden behind sticky button on mobile */}
      <div className="h-20 sm:h-0" />
    </main>
  );
}
