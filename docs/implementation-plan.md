# Boatcrew Compass — Full Workbook Implementation Plan

## What Exists Today

**Built:**
- Priorities Compass (p13) — N/S/E/W, 3 items each → `compass` DB + API + page
- Quarterly Reflection (p17–20) — 6 prompts × 4 quarters → `reflection` DB + API + page
- OAuth flow, setup, dashboard, middleware, mobile optimization

**Architecture pattern:**
- Each exercise = Notion database + API route (GET/POST) + page component
- DB IDs stored in httpOnly cookies
- Setup route auto-creates DBs on first login

---

## What Needs to Be Built (12 exercises)

### The Exercises (in workbook order)

| # | Exercise | Page | Type | Fields |
|---|----------|------|------|--------|
| 1 | Regret Review | p4 | One-time | 3 text prompts |
| 2 | Pre-Mortem | p5 | One-time | 1 text + 2 lists of 3 |
| 3 | Identity Snapshot | p6 | One-time | 3 words + 3 text areas |
| 4 | Strengths Mapping | p7 | One-time | 2 lists of 3 + 3 Venn areas |
| 5 | To Don't List | p8 | One-time | 2 lists of 3 |
| 6 | Endurance Test | p9 | One-time | 1 text + 1 list of 3 |
| 7 | Contribution Blueprint | p10 | One-time | 4 text quadrants |
| 8 | Anti-Plan | p11 | One-time | 2 lists of 3 + 1 text |
| 9 | Motivation Switches | p12 | One-time | 3 fill-in-the-blank |
| 10 | Three Wins | p14 | One-time | 1 list of 3 + 1 text |
| 11 | Challenge Network | p15 | One-time | 3 people + format/cadence |
| 12 | Theme | p16 | One-time | 1 word |

All 12 are "fill once, revisit periodically" — same pattern.

---

## Architecture Decision: How to Store 12 New Exercises

### Option A: One Notion DB per exercise (current pattern)
- **Pro:** Clean schema per exercise, familiar pattern
- **Con:** 14 total databases, 14 cookie IDs, setup creates 14 DBs (slow, rate-limit risk)

### Option B: Single "Workbook" DB with generic fields ← RECOMMENDED
- **Pro:** 1 new DB, 1 cookie, 1 API route with exercise filter, fast setup
- **Con:** Generic field names in Notion (but users mostly interact via the app, not raw Notion)

### Option C: Notion page blocks (no database)
- **Pro:** Natural Notion feel
- **Con:** Harder to query, different API pattern, fragile

### Recommended: Option B — Single "Workbook" Database

Schema:
```
Exercise    (title)     — "Regret Review", "Pre-Mortem", etc.
Section     (select)    — groups related fields within an exercise
Field       (rich_text) — the prompt label
Value       (rich_text) — the user's answer
Order       (number)    — sort order within exercise
Updated     (date)      — last modified
```

One row per field. Example for Regret Review:
| Exercise | Section | Field | Value | Order |
|----------|---------|-------|-------|-------|
| Regret Review | main | My biggest regret of 2025 is | [user text] | 1 |
| Regret Review | main | The lesson I learned from that regret is | [user text] | 2 |
| Regret Review | main | The first step I'll take in the first 10 days | [user text] | 3 |

This keeps 3 total databases (compass, reflection, workbook) and one setup call.

---

## Implementation Phases

### Phase 1: Data Layer (foundation)
1. Add `WORKBOOK_PROPERTIES` schema to `notion-schemas.ts`
2. Add exercise config: prompts, sections, field counts per exercise
3. Update `/api/notion/setup` to create the Workbook DB
4. Create `/api/workbook/route.ts` — generic GET/POST filtered by exercise name
5. Add `workbook_db_id` cookie to auth callback + setup

### Phase 2: Shared Exercise Component
Build a reusable `<ExerciseForm>` component that:
- Takes exercise config (title, subtitle, prompts, field types)
- Renders the right input types (text, textarea, numbered list, fill-in-blank)
- Handles load/save via the workbook API
- Shows completion state
- Sticky save button (mobile pattern already exists)

Field types needed:
- `textarea` — open-ended text (Regret Review, Anti-Plan principles)
- `numbered_list` — 3 items with "1. 2. 3." (Pre-Mortem, Strengths)
- `fill_blank` — sentence with blank to complete (Motivation Switches)
- `single_word` — one word input (Theme)
- `quadrant` — 2×2 grid of text areas (Contribution Blueprint)
- `people` — name + why fields (Challenge Network)
- `checkboxes` — format/cadence selection (Challenge Network)

### Phase 3: Exercise Pages (the 12 routes)
Each exercise gets:
- `/exercise/[slug]/page.tsx` — uses `<ExerciseForm>` with that exercise's config
- Slug examples: `regret-review`, `pre-mortem`, `identity-snapshot`, etc.

Using a dynamic route (`/exercise/[slug]`) means 1 page file, not 12.

Exercise configs define everything:
```ts
const EXERCISES = {
  "regret-review": {
    title: "Regret Review",
    subtitle: "Look backward with honesty. Look forward with intention.",
    page: 4,
    fields: [
      { key: "biggest_regret", label: "My biggest regret of 2025 is:", type: "textarea" },
      { key: "lesson_learned", label: "The lesson I learned from that regret is:", type: "textarea" },
      { key: "first_step", label: "The first step I'll take in the first 10 days of 2026 to act on that lesson:", type: "textarea" },
    ]
  },
  "pre-mortem": { ... },
  // etc.
}
```

### Phase 4: Dashboard Redesign
Current dashboard shows 2 cards. Needs to become a full workbook journey:

**Layout concept:**
- Progress bar at top (X of 14 exercises completed)
- Exercises in workbook order, grouped by phase:
  - "Look Back" — Regret Review
  - "Look Inward" — Identity Snapshot, Strengths Mapping, Endurance Test
  - "Set Direction" — Pre-Mortem, To Don't List, Anti-Plan, Contribution Blueprint, Motivation Switches
  - "Commit" — Priorities Compass, Three Wins, Theme, Challenge Network
  - "Reflect" — Quarterly Reflection (ongoing)
- Each card shows: title, completion status, quick preview of answers
- Current/next exercise highlighted

### Phase 5: Navigation + Flow
- "Next exercise" button at bottom of each exercise
- "Back to dashboard" in header
- Add all exercise routes to middleware protection
- Breadcrumb or step indicator

### Phase 6: Polish
- Completion celebrations (confetti or subtle animation when all 14 done)
- Print/export view of completed workbook
- Dark mode (future)
- Share compass with boatcrew members (future)

---

## Route Map (final)

```
/                          Landing + onboarding
/dashboard                 Workbook overview + progress
/compass                   Priorities Compass (existing)
/reflection                Quarterly Reflection (existing)
/exercise/regret-review
/exercise/pre-mortem
/exercise/identity-snapshot
/exercise/strengths-mapping
/exercise/to-dont-list
/exercise/endurance-test
/exercise/contribution-blueprint
/exercise/anti-plan
/exercise/motivation-switches
/exercise/three-wins
/exercise/challenge-network
/exercise/theme
```

---

## Estimated Effort

| Phase | Work | Size |
|-------|------|------|
| Phase 1 | Data layer + API | ~2 hours |
| Phase 2 | Shared ExerciseForm component | ~3 hours |
| Phase 3 | 12 exercise configs | ~2 hours |
| Phase 4 | Dashboard redesign | ~2 hours |
| Phase 5 | Navigation + flow | ~1 hour |
| Phase 6 | Polish | ~2 hours |
| **Total** | | **~12 hours** |

---

## Migration Note

Existing users (anyone who already connected) will need the Workbook DB created on their next visit. The setup route already handles this pattern — it checks for existing DBs and only creates missing ones. Just add a check for `workbook_db_id` cookie.
