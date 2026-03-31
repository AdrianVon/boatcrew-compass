// ─── Exercise Registry ───────────────────────────────────────────────
// Central config for all 14 exercises from the "2026: Designed" workbook.
// Each exercise defines its Notion DB title, schema, UI fields, and metadata.
// The dynamic route /exercise/[slug] and the generic API read this config.

import {
  REGRET_REVIEW_PROPERTIES,
  PRE_MORTEM_PROPERTIES,
  IDENTITY_SNAPSHOT_PROPERTIES,
  STRENGTHS_MAPPING_PROPERTIES,
  TO_DONT_LIST_PROPERTIES,
  ENDURANCE_TEST_PROPERTIES,
  CONTRIBUTION_BLUEPRINT_PROPERTIES,
  ANTI_PLAN_PROPERTIES,
  MOTIVATION_SWITCHES_PROPERTIES,
  THREE_WINS_PROPERTIES,
  CHALLENGE_NETWORK_PROPERTIES,
  THEME_PROPERTIES,
} from "./notion-schemas";

// ─── Field Types ─────────────────────────────────────────────────────

export type FieldType =
  | "textarea"        // Multi-line text
  | "short_text"      // Single-line text
  | "single_word"     // One word input
  | "fill_blank"      // "I choose to direct my life by ___"
  | "numbered_item";  // One item in a numbered list

export interface ExerciseField {
  key: string;            // Maps to Notion property name
  label: string;          // Prompt shown to user
  type: FieldType;
  placeholder?: string;
  prefix?: string;        // e.g., "Don't" for To Don't List
  group?: string;         // Visual grouping within the exercise
  groupLabel?: string;    // Heading for the group
  groupDescription?: string;
}

export interface ExerciseConfig {
  slug: string;
  title: string;
  subtitle: string;
  description: string;       // For Notion DB description
  notionDbTitle: string;     // Exact title used in Notion
  page: number;              // Workbook page number
  phase: ExercisePhase;
  emoji: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  notionProperties: Record<string, any>;
  fields: ExerciseField[];
}

export type ExercisePhase =
  | "look-back"
  | "look-inward"
  | "set-direction"
  | "commit"
  | "reflect";

export const PHASE_META: Record<ExercisePhase, { label: string; description: string }> = {
  "look-back": {
    label: "Look Back",
    description: "Reflect on where you've been",
  },
  "look-inward": {
    label: "Look Inward",
    description: "Understand who you are at your best",
  },
  "set-direction": {
    label: "Set Direction",
    description: "Decide where to focus your energy",
  },
  commit: {
    label: "Commit",
    description: "Lock in your priorities and support system",
  },
  reflect: {
    label: "Reflect",
    description: "Check in quarterly and recalibrate",
  },
};

// ─── Exercise Definitions ────────────────────────────────────────────

export const EXERCISES: Record<string, ExerciseConfig> = {
  "regret-review": {
    slug: "regret-review",
    title: "Regret Review",
    subtitle: "Look backward with honesty. Look forward with intention.",
    description: "Identify your biggest regret, extract the lesson, and take the first step to act on it.",
    notionDbTitle: "Regret Review",
    page: 4,
    phase: "look-back",
    emoji: "\u{1F50D}",
    notionProperties: REGRET_REVIEW_PROPERTIES,
    fields: [
      { key: "Biggest Regret", label: "My biggest regret of 2025 is:", type: "textarea", placeholder: "Be honest with yourself..." },
      { key: "Lesson Learned", label: "The lesson I learned from that regret is:", type: "textarea", placeholder: "What did this teach you?" },
      { key: "First Step", label: "The first step I\u2019ll take in the first 10 days of 2026 to act on that lesson:", type: "textarea", placeholder: "One concrete action..." },
    ],
  },

  "pre-mortem": {
    slug: "pre-mortem",
    title: "Pre-Mortem",
    subtitle: "Jump to the end of 2026. Imagine failure. Prevent it before it happens.",
    description: "Imagine your most important project failing, identify what went wrong, and plan prevention.",
    notionDbTitle: "Pre-Mortem",
    page: 5,
    phase: "set-direction",
    emoji: "\u{1F6A8}",
    notionProperties: PRE_MORTEM_PROPERTIES,
    fields: [
      { key: "Most Important Project", label: "My single most important project for 2026 is:", type: "textarea", placeholder: "The one thing that matters most..." },
      {
        key: "What Went Wrong 1", label: "", type: "numbered_item", placeholder: "What went wrong?",
        group: "what-went-wrong", groupLabel: "It\u2019s December 31, 2026 and this project is a complete disaster. What went wrong?",
      },
      { key: "What Went Wrong 2", label: "", type: "numbered_item", placeholder: "What went wrong?", group: "what-went-wrong" },
      { key: "What Went Wrong 3", label: "", type: "numbered_item", placeholder: "What went wrong?", group: "what-went-wrong" },
      {
        key: "Prevention 1", label: "", type: "numbered_item", placeholder: "How will you prevent this?",
        group: "prevention", groupLabel: "How will I prevent each pitfall in the real 2026?", groupDescription: "State the behaviors. Be specific.",
      },
      { key: "Prevention 2", label: "", type: "numbered_item", placeholder: "How will you prevent this?", group: "prevention" },
      { key: "Prevention 3", label: "", type: "numbered_item", placeholder: "How will you prevent this?", group: "prevention" },
    ],
  },

  "identity-snapshot": {
    slug: "identity-snapshot",
    title: "Identity Snapshot",
    subtitle: "A quick portrait of you at your best so you can design for it.",
    description: "Capture who you are at your best: your words, emotions, and ideal conditions.",
    notionDbTitle: "Identity Snapshot",
    page: 6,
    phase: "look-inward",
    emoji: "\u{1F5BC}\u{FE0F}",
    notionProperties: IDENTITY_SNAPSHOT_PROPERTIES,
    fields: [
      {
        key: "Word 1", label: "", type: "short_text", placeholder: "First word",
        group: "three-words", groupLabel: "Three words that describe me at my best:",
      },
      { key: "Word 2", label: "", type: "short_text", placeholder: "Second word", group: "three-words" },
      { key: "Word 3", label: "", type: "short_text", placeholder: "Third word", group: "three-words" },
      { key: "Emotions at Best", label: "Emotions I feel when I\u2019m at my best:", type: "textarea", placeholder: "List 3 to 5 emotions..." },
      { key: "Emotions Not at Best", label: "Emotions I feel when I\u2019m not at my best:", type: "textarea", placeholder: "List 3 to 5 emotions..." },
      { key: "Conditions for Best", label: "Conditions that help me be at my best:", type: "textarea", placeholder: "People, places, routines, environments..." },
    ],
  },

  "strengths-mapping": {
    slug: "strengths-mapping",
    title: "Strengths Mapping",
    subtitle: "Map where your strengths meet meaning. Be concrete.",
    description: "Identify your strengths and find where they intersect with what you enjoy and what the world needs.",
    notionDbTitle: "Strengths Mapping",
    page: 7,
    phase: "look-inward",
    emoji: "\u{1F4AA}",
    notionProperties: STRENGTHS_MAPPING_PROPERTIES,
    fields: [
      {
        key: "Strength I See 1", label: "", type: "numbered_item", placeholder: "A strength you see in yourself",
        group: "self-strengths", groupLabel: "Strengths I see in myself:",
      },
      { key: "Strength I See 2", label: "", type: "numbered_item", placeholder: "A strength you see in yourself", group: "self-strengths" },
      { key: "Strength I See 3", label: "", type: "numbered_item", placeholder: "A strength you see in yourself", group: "self-strengths" },
      {
        key: "Strength Others See 1", label: "", type: "numbered_item", placeholder: "A strength others see in you",
        group: "others-strengths", groupLabel: "Strengths others see in me:",
      },
      { key: "Strength Others See 2", label: "", type: "numbered_item", placeholder: "A strength others see in you", group: "others-strengths" },
      { key: "Strength Others See 3", label: "", type: "numbered_item", placeholder: "A strength others see in you", group: "others-strengths" },
      {
        key: "What Im Good At", label: "What I\u2019m good at:", type: "textarea", placeholder: "Skills, talents, expertise...",
        group: "zone", groupLabel: "My zone of contribution",
        groupDescription: "Return to this page whenever you feel adrift. It\u2019s a compass disguised as a list.",
      },
      { key: "What I Enjoy", label: "What I enjoy doing:", type: "textarea", placeholder: "Activities that energize you...", group: "zone" },
      { key: "What the World Needs", label: "What the world around me needs from me:", type: "textarea", placeholder: "How you serve others...", group: "zone" },
    ],
  },

  "to-dont-list": {
    slug: "to-dont-list",
    title: "My 2026 To Don\u2019t List",
    subtitle: "What you stop doing matters as much as what you start doing.",
    description: "Identify time wasters and turn them into explicit commitments to stop.",
    notionDbTitle: "To Dont List",
    page: 8,
    phase: "set-direction",
    emoji: "\u{1F6AB}",
    notionProperties: TO_DONT_LIST_PROPERTIES,
    fields: [
      {
        key: "Time Waster 1", label: "", type: "numbered_item", placeholder: "A consistent time waster",
        group: "time-wasters",
        groupLabel: "Step 1: Stop the time wasters",
        groupDescription: "What three things consistently waste my time, divert my attention, and prevent me from doing my best work? Test: if I stopped doing this for 90 days, would my life get better? If yes, it belongs here.",
      },
      { key: "Time Waster 2", label: "", type: "numbered_item", placeholder: "A consistent time waster", group: "time-wasters" },
      { key: "Time Waster 3", label: "", type: "numbered_item", placeholder: "A consistent time waster", group: "time-wasters" },
      {
        key: "Dont 1", label: "", type: "numbered_item", prefix: "Don\u2019t", placeholder: "Turn time waster into a don\u2019t",
        group: "donts",
        groupLabel: "Step 2: Turn them into \u201CTo Don\u2019ts\u201D",
        groupDescription: "Based on the list above, my \u201CTo Don\u2019t\u201D List for 2026 is:",
      },
      { key: "Dont 2", label: "", type: "numbered_item", prefix: "Don\u2019t", placeholder: "Turn time waster into a don\u2019t", group: "donts" },
      { key: "Dont 3", label: "", type: "numbered_item", prefix: "Don\u2019t", placeholder: "Turn time waster into a don\u2019t", group: "donts" },
    ],
  },

  "endurance-test": {
    slug: "endurance-test",
    title: "The Endurance Test",
    subtitle: "Progress comes from choosing the discomfort you\u2019re willing to repeat.",
    description: "Identify the discomfort you\u2019ll endure for growth and the skills that have already rewarded effort.",
    notionDbTitle: "Endurance Test",
    page: 9,
    phase: "look-inward",
    emoji: "\u{1F525}",
    notionProperties: ENDURANCE_TEST_PROPERTIES,
    fields: [
      { key: "Discomfort Willing to Endure", label: "What deep discomfort am I willing to endure regularly to get great at something?", type: "textarea", placeholder: "Be specific. Something you can do weekly or daily..." },
      {
        key: "Rewarded Skill 1", label: "", type: "numbered_item", placeholder: "A skill that rewarded your effort",
        group: "rewarded-skills", groupLabel: "What three skills in my life have already rewarded long-term effort?",
      },
      { key: "Rewarded Skill 2", label: "", type: "numbered_item", placeholder: "A skill that rewarded your effort", group: "rewarded-skills" },
      { key: "Rewarded Skill 3", label: "", type: "numbered_item", placeholder: "A skill that rewarded your effort", group: "rewarded-skills" },
    ],
  },

  "contribution-blueprint": {
    slug: "contribution-blueprint",
    title: "The Contribution Blueprint",
    subtitle: "The architecture of why you contribute, who you help, what you do, and the impact you aim for.",
    description: "Define your Why, Who, What, and Impact for the year in a clear blueprint.",
    notionDbTitle: "Contribution Blueprint",
    page: 10,
    phase: "set-direction",
    emoji: "\u{1F3D7}\u{FE0F}",
    notionProperties: CONTRIBUTION_BLUEPRINT_PROPERTIES,
    fields: [
      {
        key: "Why", label: "WHY", type: "textarea", placeholder: "What matters enough to deserve my energy this year?",
        group: "blueprint", groupLabel: "Your Contribution Blueprint",
      },
      { key: "Who", label: "WHO", type: "textarea", placeholder: "Whose life or work gets better when I\u2019m at my best?", group: "blueprint" },
      { key: "What", label: "WHAT", type: "textarea", placeholder: "What I will contribute consistently (small, repeatable acts):", group: "blueprint" },
      { key: "Impact", label: "IMPACT", type: "textarea", placeholder: "The single meaningful contribution I hope will define my 2026:", group: "blueprint" },
    ],
  },

  "anti-plan": {
    slug: "anti-plan",
    title: "My Anti-Plan",
    subtitle: "You can\u2019t control the year. But you can control how you move through it.",
    description: "Separate what you can shape from what you can\u2019t, and set anchor principles for when plans break.",
    notionDbTitle: "Anti-Plan",
    page: 11,
    phase: "set-direction",
    emoji: "\u{1F30A}",
    notionProperties: ANTI_PLAN_PROPERTIES,
    fields: [
      {
        key: "Cant Control 1", label: "", type: "numbered_item", placeholder: "Other people, external events, outcomes, timing, luck...",
        group: "cant-control", groupLabel: "What I can\u2019t control",
        groupDescription: "Think: other people, external events, outcomes, timing, luck.",
      },
      { key: "Cant Control 2", label: "", type: "numbered_item", placeholder: "Something outside your control", group: "cant-control" },
      { key: "Cant Control 3", label: "", type: "numbered_item", placeholder: "Something outside your control", group: "cant-control" },
      {
        key: "Can Control 1", label: "", type: "numbered_item", placeholder: "Actions, habits, attention, boundaries, systems...",
        group: "can-control", groupLabel: "What I can control",
        groupDescription: "Think: actions, habits, attention, boundaries, systems.",
      },
      { key: "Can Control 2", label: "", type: "numbered_item", placeholder: "Something within your control", group: "can-control" },
      { key: "Can Control 3", label: "", type: "numbered_item", placeholder: "Something within your control", group: "can-control" },
      {
        key: "Anchor Principles", label: "My Anchor Principles for 2026:", type: "textarea",
        placeholder: "Write 1\u20132 sentences describing how you\u2019ll respond when the year doesn\u2019t go as planned...",
        group: "principles", groupLabel: "My Anchor Principles for 2026",
        groupDescription: "Return to this page whenever life surprises you \u2014 which it will. The Anti-Plan keeps you steady when the plan breaks.",
      },
    ],
  },

  "motivation-switches": {
    slug: "motivation-switches",
    title: "The Motivation Switches",
    subtitle: "Flip the three switches that power sustained motivation.",
    description: "Define your autonomy, mastery, and purpose \u2014 the three drivers of intrinsic motivation.",
    notionDbTitle: "Motivation Switches",
    page: 12,
    phase: "set-direction",
    emoji: "\u{1F4A1}",
    notionProperties: MOTIVATION_SWITCHES_PROPERTIES,
    fields: [
      {
        key: "Autonomy", label: "AUTONOMY", type: "fill_blank",
        prefix: "I choose to direct my life by",
        placeholder: "how you direct your life...",
        group: "switches", groupLabel: "Your Three Switches",
      },
      {
        key: "Mastery", label: "MASTERY", type: "fill_blank",
        prefix: "I want to regularly get better at",
        placeholder: "what you want to master...",
        group: "switches",
      },
      {
        key: "Purpose Work", label: "PURPOSE", type: "fill_blank",
        prefix: "The work that matters most to me is",
        placeholder: "the work that matters...",
        group: "switches",
      },
      {
        key: "Purpose Because", label: "", type: "fill_blank",
        prefix: "because",
        placeholder: "why it matters...",
        group: "switches",
      },
    ],
  },

  "three-wins": {
    slug: "three-wins",
    title: "The Three Wins of 2026",
    subtitle: "Define success before the year begins.",
    description: "If these three things happen, 2026 is a success regardless of surprises or setbacks.",
    notionDbTitle: "Three Wins",
    page: 14,
    phase: "commit",
    emoji: "\u{1F3C6}",
    notionProperties: THREE_WINS_PROPERTIES,
    fields: [
      {
        key: "Win 1", label: "", type: "numbered_item", placeholder: "A specific, measurable win under your control",
        group: "wins", groupLabel: "My Three Wins:",
        groupDescription: "Choose wins that are specific, measurable, and under your control.",
      },
      { key: "Win 2", label: "", type: "numbered_item", placeholder: "A specific, measurable win under your control", group: "wins" },
      { key: "Win 3", label: "", type: "numbered_item", placeholder: "A specific, measurable win under your control", group: "wins" },
      {
        key: "Why They Matter", label: "Why these wins matter:", type: "textarea",
        placeholder: "Write 1\u20132 sentences explaining how each win improves your life or work. This anchors motivation.",
        group: "why", groupLabel: "Why These Wins Matter",
        groupDescription: "Write 1\u20132 sentences explaining how each win improves your life or work. This anchors motivation.",
      },
    ],
  },

  "challenge-network": {
    slug: "challenge-network",
    title: "My 2026 Challenge Network",
    subtitle: "A small circle that keeps me sharp.",
    description: "Identify your Challenger, Cheerleader, and Coach \u2014 and commit to how you\u2019ll work together.",
    notionDbTitle: "Challenge Network",
    page: 15,
    phase: "commit",
    emoji: "\u{1F91D}",
    notionProperties: CHALLENGE_NETWORK_PROPERTIES,
    fields: [
      {
        key: "Challenger Name", label: "Name:", type: "short_text", placeholder: "Who pushes you?",
        group: "challenger", groupLabel: "Challenger", groupDescription: "Pushes me. Tells me the truth.",
      },
      { key: "Challenger Why", label: "Why they\u2019re right for this role:", type: "textarea", placeholder: "What makes them a good challenger?", group: "challenger" },
      {
        key: "Cheerleader Name", label: "Name:", type: "short_text", placeholder: "Who lifts you up?",
        group: "cheerleader", groupLabel: "Cheerleader", groupDescription: "Lifts me up. Helps me keep going.",
      },
      { key: "Cheerleader Why", label: "Why they\u2019re right for this role:", type: "textarea", placeholder: "What makes them a good cheerleader?", group: "cheerleader" },
      {
        key: "Coach Name", label: "Name:", type: "short_text", placeholder: "Who sees what you can\u2019t?",
        group: "coach", groupLabel: "Coach", groupDescription: "A step ahead. Sees what I can\u2019t yet see.",
      },
      { key: "Coach Why", label: "Why they\u2019re right for this role:", type: "textarea", placeholder: "What makes them a good coach?", group: "coach" },
      {
        key: "Format", label: "Format:", type: "short_text", placeholder: "e.g., Feedback Fridays, Call/Zoom, Email, In-person",
        group: "how", groupLabel: "How We\u2019ll Work Together",
      },
      { key: "Cadence", label: "Cadence:", type: "short_text", placeholder: "e.g., Weekly, Biweekly, Monthly", group: "how" },
      { key: "Invite By Date", label: "I\u2019ll invite all three by:", type: "short_text", placeholder: "Pick a date...", group: "how" },
    ],
  },

  theme: {
    slug: "theme",
    title: "My 2026 Theme",
    subtitle: "Pick one word \u2014 and only one word \u2014 as your theme for 2026.",
    description: "Your single-word theme for the year. Write it big and post it where you\u2019ll see it.",
    notionDbTitle: "Theme",
    page: 16,
    phase: "commit",
    emoji: "\u{2B50}",
    notionProperties: THEME_PROPERTIES,
    fields: [
      { key: "My Theme", label: "My 2026 Theme:", type: "single_word", placeholder: "One word..." },
    ],
  },
};

// ─── Ordered exercise list (workbook order) ──────────────────────────

export const EXERCISE_ORDER: string[] = [
  "regret-review",         // p4  - Look Back
  "pre-mortem",            // p5  - Set Direction
  "identity-snapshot",     // p6  - Look Inward
  "strengths-mapping",     // p7  - Look Inward
  "to-dont-list",          // p8  - Set Direction
  "endurance-test",        // p9  - Look Inward
  "contribution-blueprint",// p10 - Set Direction
  "anti-plan",             // p11 - Set Direction
  "motivation-switches",   // p12 - Set Direction
  // "compass" is p13 but handled separately
  "three-wins",            // p14 - Commit
  "challenge-network",     // p15 - Commit
  "theme",                 // p16 - Commit
  // "reflection" is p17-20 but handled separately
];

// ─── Helpers ─────────────────────────────────────────────────────────

export function getExercise(slug: string): ExerciseConfig | null {
  return EXERCISES[slug] ?? null;
}

export function getNextExercise(currentSlug: string): string | null {
  const idx = EXERCISE_ORDER.indexOf(currentSlug);
  if (idx === -1 || idx >= EXERCISE_ORDER.length - 1) return null;
  return EXERCISE_ORDER[idx + 1];
}

export function getPrevExercise(currentSlug: string): string | null {
  const idx = EXERCISE_ORDER.indexOf(currentSlug);
  if (idx <= 0) return null;
  return EXERCISE_ORDER[idx - 1];
}
