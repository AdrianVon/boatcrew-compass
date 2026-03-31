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

// ─── Exercise Database Schemas ───────────────────────────────────────
// Each exercise from the workbook gets its own Notion database
// with semantically named properties for agent-friendly access.

export const REGRET_REVIEW_PROPERTIES = {
  Entry: { title: {} },
  "Biggest Regret": { rich_text: {} },
  "Lesson Learned": { rich_text: {} },
  "First Step": { rich_text: {} },
  Updated: { date: {} },
};

export const PRE_MORTEM_PROPERTIES = {
  Entry: { title: {} },
  "Most Important Project": { rich_text: {} },
  "What Went Wrong 1": { rich_text: {} },
  "What Went Wrong 2": { rich_text: {} },
  "What Went Wrong 3": { rich_text: {} },
  "Prevention 1": { rich_text: {} },
  "Prevention 2": { rich_text: {} },
  "Prevention 3": { rich_text: {} },
  Updated: { date: {} },
};

export const IDENTITY_SNAPSHOT_PROPERTIES = {
  Entry: { title: {} },
  "Word 1": { rich_text: {} },
  "Word 2": { rich_text: {} },
  "Word 3": { rich_text: {} },
  "Emotions at Best": { rich_text: {} },
  "Emotions Not at Best": { rich_text: {} },
  "Conditions for Best": { rich_text: {} },
  Updated: { date: {} },
};

export const STRENGTHS_MAPPING_PROPERTIES = {
  Entry: { title: {} },
  "Strength I See 1": { rich_text: {} },
  "Strength I See 2": { rich_text: {} },
  "Strength I See 3": { rich_text: {} },
  "Strength Others See 1": { rich_text: {} },
  "Strength Others See 2": { rich_text: {} },
  "Strength Others See 3": { rich_text: {} },
  "What Im Good At": { rich_text: {} },
  "What I Enjoy": { rich_text: {} },
  "What the World Needs": { rich_text: {} },
  Updated: { date: {} },
};

export const TO_DONT_LIST_PROPERTIES = {
  Entry: { title: {} },
  "Time Waster 1": { rich_text: {} },
  "Time Waster 2": { rich_text: {} },
  "Time Waster 3": { rich_text: {} },
  "Dont 1": { rich_text: {} },
  "Dont 2": { rich_text: {} },
  "Dont 3": { rich_text: {} },
  Updated: { date: {} },
};

export const ENDURANCE_TEST_PROPERTIES = {
  Entry: { title: {} },
  "Discomfort Willing to Endure": { rich_text: {} },
  "Rewarded Skill 1": { rich_text: {} },
  "Rewarded Skill 2": { rich_text: {} },
  "Rewarded Skill 3": { rich_text: {} },
  Updated: { date: {} },
};

export const CONTRIBUTION_BLUEPRINT_PROPERTIES = {
  Entry: { title: {} },
  Why: { rich_text: {} },
  Who: { rich_text: {} },
  What: { rich_text: {} },
  Impact: { rich_text: {} },
  Updated: { date: {} },
};

export const ANTI_PLAN_PROPERTIES = {
  Entry: { title: {} },
  "Cant Control 1": { rich_text: {} },
  "Cant Control 2": { rich_text: {} },
  "Cant Control 3": { rich_text: {} },
  "Can Control 1": { rich_text: {} },
  "Can Control 2": { rich_text: {} },
  "Can Control 3": { rich_text: {} },
  "Anchor Principles": { rich_text: {} },
  Updated: { date: {} },
};

export const MOTIVATION_SWITCHES_PROPERTIES = {
  Entry: { title: {} },
  Autonomy: { rich_text: {} },
  Mastery: { rich_text: {} },
  "Purpose Work": { rich_text: {} },
  "Purpose Because": { rich_text: {} },
  Updated: { date: {} },
};

export const THREE_WINS_PROPERTIES = {
  Entry: { title: {} },
  "Win 1": { rich_text: {} },
  "Win 2": { rich_text: {} },
  "Win 3": { rich_text: {} },
  "Why They Matter": { rich_text: {} },
  Updated: { date: {} },
};

export const CHALLENGE_NETWORK_PROPERTIES = {
  Entry: { title: {} },
  "Challenger Name": { rich_text: {} },
  "Challenger Why": { rich_text: {} },
  "Cheerleader Name": { rich_text: {} },
  "Cheerleader Why": { rich_text: {} },
  "Coach Name": { rich_text: {} },
  "Coach Why": { rich_text: {} },
  Format: { rich_text: {} },
  Cadence: { rich_text: {} },
  "Invite By Date": { rich_text: {} },
  Updated: { date: {} },
};

export const THEME_PROPERTIES = {
  Entry: { title: {} },
  "My Theme": { rich_text: {} },
  Updated: { date: {} },
};
