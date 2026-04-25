"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { ExerciseConfig, ExerciseField } from "@/lib/exercises";

interface ExerciseFormProps {
  exercise: ExerciseConfig;
  prevSlug: string | null;
  nextSlug: string | null;
}

type FormData = Record<string, string>;

// ─── Voice Input Hook ────────────────────────────────────────────────

function useVoiceInput(
  currentValue: string,
  onChange: (val: string) => void
) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    const SpeechRecognition =
      typeof window !== "undefined"
        ? window.SpeechRecognition || window.webkitSpeechRecognition
        : null;
    setSupported(!!SpeechRecognition);
  }, []);

  const toggle = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    let finalTranscript = "";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        } else {
          interim = transcript;
        }
      }
      // Append to existing value
      const base = currentValue ? currentValue.trimEnd() + " " : "";
      onChange((base + finalTranscript + interim).trimStart());
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [isListening, currentValue, onChange]);

  return { isListening, toggle, supported };
}

// ─── Mic Button Component ────────────────────────────────────────────

function MicButton({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const { isListening, toggle, supported } = useVoiceInput(value, onChange);

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
        isListening
          ? "bg-red-500 text-white animate-pulse"
          : "bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
      }`}
      title={isListening ? "Stop recording" : "Speak to type"}
    >
      <svg
        className="w-4 h-4"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        {isListening ? (
          <rect x="6" y="6" width="12" height="12" rx="2" />
        ) : (
          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
        )}
      </svg>
    </button>
  );
}

// ─── Field renderers ─────────────────────────────────────────────────

function TextareaField({
  field,
  value,
  onChange,
}: {
  field: ExerciseField;
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <div>
      {field.label && (
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-sm font-semibold text-gray-700">
            {field.label}
          </label>
          <MicButton value={value} onChange={onChange} />
        </div>
      )}
      {!field.label && (
        <div className="flex justify-end mb-1">
          <MicButton value={value} onChange={onChange} />
        </div>
      )}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        rows={4}
        className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none placeholder:text-gray-300"
      />
    </div>
  );
}

function ShortTextField({
  field,
  value,
  onChange,
}: {
  field: ExerciseField;
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <div>
      {field.label && (
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          {field.label}
        </label>
      )}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className="flex-1 px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder:text-gray-300"
        />
        <MicButton value={value} onChange={onChange} />
      </div>
    </div>
  );
}

function SingleWordField({
  field,
  value,
  onChange,
}: {
  field: ExerciseField;
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <div className="text-center">
      {field.label && (
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          {field.label}
        </label>
      )}
      <div className="flex items-center justify-center gap-3">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className="w-full max-w-xs px-4 py-4 text-3xl sm:text-4xl font-black text-center border-b-2 border-gray-300 focus:border-gray-900 focus:outline-none bg-transparent placeholder:text-gray-200 placeholder:font-normal placeholder:text-2xl"
        />
        <MicButton value={value} onChange={onChange} />
      </div>
      <p className="text-xs text-gray-400 mt-4">
        Write it big. Post it where you&apos;ll see it throughout the year.
      </p>
    </div>
  );
}

function NumberedItemField({
  field,
  value,
  onChange,
  index,
}: {
  field: ExerciseField;
  value: string;
  onChange: (val: string) => void;
  index: number;
}) {
  return (
    <div className="flex items-start gap-2.5">
      {field.prefix ? (
        <span className="text-sm font-semibold text-gray-500 mt-2.5 shrink-0">
          {index + 1}. {field.prefix}
        </span>
      ) : (
        <span className="text-sm font-semibold text-gray-400 mt-2.5 w-6 shrink-0">
          {index + 1}.
        </span>
      )}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        className="flex-1 px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder:text-gray-300"
      />
      <MicButton value={value} onChange={onChange} />
    </div>
  );
}

function FillBlankField({
  field,
  value,
  onChange,
}: {
  field: ExerciseField;
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5">
      {field.label && (
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-black uppercase tracking-wide text-gray-900">
            {field.label}
          </h4>
          <MicButton value={value} onChange={onChange} />
        </div>
      )}
      {!field.label && (
        <div className="flex justify-end mb-2">
          <MicButton value={value} onChange={onChange} />
        </div>
      )}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1.5 sm:gap-2">
        {field.prefix && (
          <span className="text-sm text-gray-600 shrink-0">
            &ldquo;{field.prefix}
          </span>
        )}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className="flex-1 w-full px-0 py-1 text-sm border-b border-gray-300 focus:border-gray-900 focus:outline-none bg-transparent placeholder:text-gray-300"
        />
        <span className="text-sm text-gray-600 shrink-0">.&rdquo;</span>
      </div>
    </div>
  );
}

// ─── Group fields and render ─────────────────────────────────────────

function renderField(
  field: ExerciseField,
  value: string,
  onChange: (val: string) => void,
  indexInGroup: number
) {
  switch (field.type) {
    case "textarea":
      return <TextareaField field={field} value={value} onChange={onChange} />;
    case "short_text":
      return <ShortTextField field={field} value={value} onChange={onChange} />;
    case "single_word":
      return <SingleWordField field={field} value={value} onChange={onChange} />;
    case "numbered_item":
      return (
        <NumberedItemField
          field={field}
          value={value}
          onChange={onChange}
          index={indexInGroup}
        />
      );
    case "fill_blank":
      return <FillBlankField field={field} value={value} onChange={onChange} />;
  }
}

// ─── Main Component ──────────────────────────────────────────────────

export default function ExerciseForm({
  exercise,
  prevSlug,
  nextSlug,
}: ExerciseFormProps) {
  const [data, setData] = useState<FormData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const res = await fetch(`/api/exercise/${exercise.slug}`);
      if (res.ok) {
        const json = await res.json();
        setData(json.data ?? {});
      }
    } catch {
      setError("Failed to load exercise data");
    } finally {
      setLoading(false);
    }
  }, [exercise.slug]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setError(null);

    try {
      const res = await fetch(`/api/exercise/${exercise.slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        const json = await res.json();
        setError(json.error ?? "Failed to save");
      }
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const updateField = (key: string, value: string) => {
    setData((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  // Group fields for rendering
  const groups: {
    key: string;
    label?: string;
    description?: string;
    fields: { field: ExerciseField; indexInGroup: number }[];
  }[] = [];

  const groupCounters: Record<string, number> = {};

  for (const field of exercise.fields) {
    const groupKey = field.group ?? field.key;

    if (!groupCounters[groupKey]) {
      groupCounters[groupKey] = 0;
    }

    const existingGroup = groups.find((g) => g.key === groupKey);
    if (existingGroup) {
      existingGroup.fields.push({
        field,
        indexInGroup: groupCounters[groupKey],
      });
    } else {
      groups.push({
        key: groupKey,
        label: field.groupLabel,
        description: field.groupDescription,
        fields: [{ field, indexInGroup: 0 }],
      });
    }

    groupCounters[groupKey]++;
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center px-5">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-500 font-medium">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-5 sm:px-6 py-8 sm:py-12 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8 sm:mb-10">
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
        <div className="flex items-start gap-3">
          <span className="text-2xl sm:text-3xl mt-0.5">{exercise.emoji}</span>
          <div>
            <p className="text-xs font-medium tracking-widest text-gray-400 uppercase">
              Page {exercise.page} &middot; 2026: Designed
            </p>
            <h1 className="text-2xl sm:text-3xl font-black">{exercise.title}</h1>
            <p className="text-sm sm:text-base text-gray-500 mt-1 leading-relaxed">
              {exercise.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Fields */}
      <div className="space-y-8">
        {groups.map((group) => (
          <div key={group.key}>
            {group.label && (
              <div className="mb-3">
                <h3 className="text-base sm:text-lg font-black text-gray-900">
                  {group.label}
                </h3>
                {group.description && (
                  <p className="text-sm text-gray-500 mt-0.5">
                    {group.description}
                  </p>
                )}
              </div>
            )}
            <div className="space-y-3">
              {group.fields.map(({ field, indexInGroup }) => (
                <div key={field.key}>
                  {renderField(
                    field,
                    data[field.key] ?? "",
                    (val) => updateField(field.key, val),
                    indexInGroup
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
          {error}
        </div>
      )}

      {/* Bottom spacer for sticky button on mobile */}
      <div className="h-24 sm:h-0" />

      {/* Save button — sticky on mobile */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-50/95 backdrop-blur border-t border-gray-200 sm:static sm:p-0 sm:bg-transparent sm:backdrop-blur-none sm:border-0 sm:mt-8 z-10">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex-1 sm:flex-none px-8 py-3 rounded-xl font-semibold text-sm transition-all ${
              saved
                ? "bg-green-600 text-white"
                : "bg-gray-900 text-white hover:bg-gray-800 active:bg-gray-950"
            } disabled:opacity-50`}
          >
            {saving ? "Saving..." : saved ? "Saved \u2713" : "Save"}
          </button>

          {saved && nextSlug && (
            <a
              href={
                nextSlug === "compass"
                  ? "/compass"
                  : nextSlug === "reflection"
                    ? "/reflection"
                    : `/exercise/${nextSlug}`
              }
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-900"
            >
              Next exercise
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
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </a>
          )}
        </div>
      </div>

      {/* Navigation between exercises */}
      <div className="mt-6 sm:mt-10 flex items-center justify-between text-sm pb-8">
        {prevSlug ? (
          <a
            href={
              prevSlug === "compass"
                ? "/compass"
                : prevSlug === "reflection"
                  ? "/reflection"
                  : `/exercise/${prevSlug}`
            }
            className="text-gray-400 hover:text-gray-600 flex items-center gap-1"
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
            Previous
          </a>
        ) : (
          <div />
        )}
        {nextSlug ? (
          <a
            href={
              nextSlug === "compass"
                ? "/compass"
                : nextSlug === "reflection"
                  ? "/reflection"
                  : `/exercise/${nextSlug}`
            }
            className="text-gray-400 hover:text-gray-600 flex items-center gap-1"
          >
            Next
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
                d="M9 5l7 7-7 7"
              />
            </svg>
          </a>
        ) : (
          <div />
        )}
      </div>
    </main>
  );
}
