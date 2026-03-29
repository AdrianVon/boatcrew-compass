// Database property schemas for the Boatcrew Compass app
// These map directly to Daniel Pink's "2026: Designed" workbook

export const COMPASS_PROPERTIES = {
  Priority: { title: {} },
  Direction: {
    select: {
      options: [
        { name: "North", color: "default" as const },
        { name: "South", color: "brown" as const },
        { name: "East", color: "pink" as const },
        { name: "West", color: "blue" as const },
      ],
    },
  },
  Order: { number: { format: "number" as const } },
  Updated: { date: {} },
};

export const REFLECTION_PROPERTIES = {
  Quarter: { title: {} },
  "What Worked": { rich_text: {} },
  "What to Subtract": { rich_text: {} },
  "What Surprised Me": { rich_text: {} },
  "Theme Alignment": { rich_text: {} },
  Adjustments: { rich_text: {} },
  "Next 7 Days Action": { rich_text: {} },
  Year: { number: { format: "number" as const } },
  "Quarter Number": {
    select: {
      options: [
        { name: "Q1", color: "blue" as const },
        { name: "Q2", color: "green" as const },
        { name: "Q3", color: "yellow" as const },
        { name: "Q4", color: "red" as const },
      ],
    },
  },
  Completed: { checkbox: {} },
  "Completed Date": { date: {} },
};

// Direction labels from the workbook
export const DIRECTION_META = {
  North: {
    label: "North",
    title: "Long-term projects I will prioritize",
    description:
      "These are your multi-month commitments. The things your future self cares about.",
    color: "bg-gray-100",
  },
  West: {
    label: "West",
    title: "Daily habits I will deepen",
    description:
      "Specific regular behaviors whose benefits compound.",
    color: "bg-blue-50",
  },
  East: {
    label: "East",
    title: "Relationships I will invest in",
    description:
      "The people who help you flourish personally and professionally.",
    color: "bg-pink-50",
  },
  South: {
    label: "South",
    title: "Daily habits I will subtract",
    description:
      "Things I seem to do every day that do not push me forward.",
    color: "bg-stone-50",
  },
} as const;

export type Direction = keyof typeof DIRECTION_META;

export interface CompassData {
  north: [string, string, string];
  south: [string, string, string];
  east: [string, string, string];
  west: [string, string, string];
}

export interface ReflectionData {
  quarter: "Q1" | "Q2" | "Q3" | "Q4";
  year: number;
  whatWorked: string;
  whatToSubtract: string;
  whatSurprisedMe: string;
  themeAlignment: string;
  adjustments: string;
  next7DaysAction: string;
}

export function getCurrentQuarter(): "Q1" | "Q2" | "Q3" | "Q4" {
  const month = new Date().getMonth(); // 0-indexed
  if (month < 3) return "Q1";
  if (month < 6) return "Q2";
  if (month < 9) return "Q3";
  return "Q4";
}

export function getQuarterLabel(q: string): string {
  const labels: Record<string, string> = {
    Q1: "Q1 (Jan\u2013Mar)",
    Q2: "Q2 (Apr\u2013Jun)",
    Q3: "Q3 (Jul\u2013Sep)",
    Q4: "Q4 (Oct\u2013Dec)",
  };
  return labels[q] ?? q;
}
