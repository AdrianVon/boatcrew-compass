import { NextRequest, NextResponse } from "next/server";
import { getNotionClient } from "@/lib/notion";
import {
  COMPASS_PROPERTIES,
  REFLECTION_PROPERTIES,
} from "@/lib/notion-schemas";
import { EXERCISES, EXERCISE_ORDER } from "@/lib/exercises";

// All databases the app manages, in creation order
interface DbSpec {
  cookieKey: string;
  notionTitle: string;
  description: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  properties: Record<string, any>;
}

function getAllDbSpecs(): DbSpec[] {
  const specs: DbSpec[] = [
    {
      cookieKey: "compass_db_id",
      notionTitle: "Priorities Compass",
      description:
        "A one-page map for how you'll move through the year. North/South/East/West priorities.",
      properties: COMPASS_PROPERTIES,
    },
    {
      cookieKey: "reflection_db_id",
      notionTitle: "Quarterly Reflections",
      description:
        "Revisit your Theme, Compass, and Three Wins each quarter. Recalibrate with clarity and intention.",
      properties: REFLECTION_PROPERTIES,
    },
  ];

  // Add all workbook exercises
  for (const slug of EXERCISE_ORDER) {
    const ex = EXERCISES[slug];
    if (!ex) continue;
    specs.push({
      cookieKey: `db_${slug.replace(/-/g, "_")}`,
      notionTitle: ex.notionDbTitle,
      description: ex.description,
      properties: ex.notionProperties,
    });
  }

  return specs;
}

export async function POST(request: NextRequest) {
  const notion = await getNotionClient();
  if (!notion) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const allSpecs = getAllDbSpecs();

    // Check which databases we already have via cookies
    const existingIds: Record<string, string> = {};
    const missingSpecs: DbSpec[] = [];

    for (const spec of allSpecs) {
      const existing = request.cookies.get(spec.cookieKey)?.value;
      if (existing) {
        // Verify it still exists in Notion
        try {
          await notion.databases.retrieve({ database_id: existing });
          existingIds[spec.cookieKey] = existing;
        } catch {
          // Database was deleted, need to recreate
          missingSpecs.push(spec);
        }
      } else {
        missingSpecs.push(spec);
      }
    }

    // If nothing is missing, return early
    if (missingSpecs.length === 0) {
      return NextResponse.json({
        alreadySetUp: true,
        dbIds: existingIds,
      });
    }

    // Find the parent page — either from cookie or by searching
    let parentPageId = request.cookies.get("compass_page_id")?.value;

    if (!parentPageId) {
      const searchResults = await notion.search({
        filter: { property: "object", value: "page" },
        page_size: 10,
      });

      if (searchResults.results.length === 0) {
        return NextResponse.json(
          {
            error:
              "No pages found. Please share at least one page with the Boatcrew Compass integration in Notion.",
          },
          { status: 400 }
        );
      }

      parentPageId = searchResults.results[0].id;
    }

    // Also try to discover existing databases by title before creating
    const dbSearch = await notion.search({
      filter: { property: "object", value: "database" },
      page_size: 100,
    });

    const existingDbsByTitle: Record<string, string> = {};
    for (const db of dbSearch.results) {
      if ("title" in db && Array.isArray(db.title) && db.title.length > 0) {
        const title = db.title[0]?.plain_text ?? "";
        if (title) existingDbsByTitle[title] = db.id;
      }
    }

    // Create only the missing databases
    const newIds: Record<string, string> = { ...existingIds };

    for (const spec of missingSpecs) {
      // Check if it already exists by title
      const foundId = existingDbsByTitle[spec.notionTitle];
      if (foundId) {
        newIds[spec.cookieKey] = foundId;
        continue;
      }

      // Create new database
      const db = await notion.databases.create({
        parent: { type: "page_id", page_id: parentPageId },
        title: [{ type: "text", text: { content: spec.notionTitle } }],
        description: [
          { type: "text", text: { content: spec.description } },
        ],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        properties: spec.properties as any,
      });

      newIds[spec.cookieKey] = db.id;
    }

    // Set all cookies
    const response = NextResponse.json({
      dbIds: newIds,
      parentPageId,
    });

    const cookieOpts = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    };

    for (const [key, id] of Object.entries(newIds)) {
      response.cookies.set(key, id, cookieOpts);
    }

    response.cookies.set("compass_page_id", parentPageId, cookieOpts);

    return response;
  } catch (err) {
    console.error("Setup error:", err);
    return NextResponse.json(
      { error: "Failed to set up databases. Please try again." },
      { status: 500 }
    );
  }
}
