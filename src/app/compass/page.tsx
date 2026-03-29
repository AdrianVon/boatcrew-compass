"use client";

import { useState, useEffect } from "react";
import { DIRECTION_META, type CompassData, type Direction } from "@/lib/notion-schemas";

const DIRECTIONS: Direction[] = ["North", "West", "East", "South"];

export default function CompassPage() {
  const [compass, setCompass] = useState<CompassData>({
    north: ["", "", ""],
    south: ["", "", ""],
    east: ["", "", ""],
    west: ["", "", ""],
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/compass");
        if (res.ok) {
          const data = await res.json();
          if (data.compass) setCompass(data.compass);
        }
      } catch (err) {
        console.error("Failed to load compass:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleChange = (
    direction: Direction,
    index: number,
    value: string
  ) => {
    const key = direction.toLowerCase() as keyof CompassData;
    setCompass((prev) => {
      const updated = { ...prev };
      updated[key] = [...prev[key]] as [string, string, string];
      updated[key][index] = value;
      return updated;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/compass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ compass }),
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
        <p className="text-gray-400">Loading your compass...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-12 max-w-4xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <a href="/dashboard" className="text-sm text-gray-400 hover:text-gray-600">
            &larr; Dashboard
          </a>
          <h1 className="text-3xl font-black mt-1">2026 Priorities Compass</h1>
          <p className="text-gray-500 mt-1">
            A one-page map for how you&apos;ll move through the year
          </p>
        </div>
      </div>

      {/* Compass grid — N top, W left, E right, S bottom */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {DIRECTIONS.map((dir) => {
          const meta = DIRECTION_META[dir];
          const key = dir.toLowerCase() as keyof CompassData;
          return (
            <div
              key={dir}
              className={`${meta.color} rounded-2xl p-6 ${
                dir === "North" || dir === "South"
                  ? "md:col-span-2 md:max-w-lg md:mx-auto md:w-full"
                  : ""
              }`}
            >
              <h2 className="text-lg font-black uppercase tracking-wide mb-1">
                {meta.label}
              </h2>
              <p className="font-semibold text-sm mb-1">{meta.title}</p>
              <p className="text-xs text-gray-500 mb-4">{meta.description}</p>
              <div className="space-y-3">
                {[0, 1, 2].map((i) => (
                  <input
                    key={i}
                    type="text"
                    placeholder={`${i + 1}.`}
                    value={compass[key][i]}
                    onChange={(e) => handleChange(dir, i, e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Save button */}
      <div className="mt-8 flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Saving..." : "Save to Notion"}
        </button>
        {message && (
          <p
            className={`text-sm font-medium ${
              message.includes("Failed") ? "text-red-500" : "text-green-600"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </main>
  );
}
