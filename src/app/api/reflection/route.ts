import { NextRequest, NextResponse } from "next/server";
import { getNotionClient } from "@/lib/notion";
import type { ReflectionData } from "@/lib/notion-schemas";

export async function GET(request: NextRequest) {
  const notion = await getNotionClient();
  if (!notion) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const dbId = request.cookies.get("reflection_db_id")?.value;
  if (!dbId) {
    return NextResponse.json({ error: "Not set up yet" }, { status: 400 });
  }

  try {
    const results = await notion.databases.query({
      database_id: dbId,
      sorts: [
        { property: "Year", direction: "descending" },
        { property: "Quarter Number", direction: "descending" },
      ],
    });

    const reflections = results.results
      .filter((page) => "properties" in page)
      .map((page) => {
        if (!("properties" in page)) return null;
        const p = page.properties;

        const getText = (prop: unknown): string => {
          const p2 = prop as { type?: string; rich_text?: Array<{ plain_text: string }> };
          if (p2?.type === "rich_text" && p2.rich_text?.[0]) {
            return p2.rich_text[0].plain_text;
          }
          return "";
        };

        const getTitle = (prop: unknown): string => {
          const p2 = prop as { type?: string; title?: Array<{ plain_text: string }> };
          if (p2?.type === "title" && p2.title?.[0]) {
            return p2.title[0].plain_text;
          }
          return "";
        };

        return {
          id: page.id,
          quarter: getTitle(p["Quarter"]),
          quarterNumber:
            (p["Quarter Number"] as { type: string; select?: { name: string } })
              ?.select?.name ?? "",
          year: (p["Year"] as { type: string; number?: number })?.number ?? 0,
          whatWorked: getText(p["What Worked"]),
          whatToSubtract: getText(p["What to Subtract"]),
          whatSurprisedMe: getText(p["What Surprised Me"]),
          themeAlignment: getText(p["Theme Alignment"]),
          adjustments: getText(p["Adjustments"]),
          next7DaysAction: getText(p["Next 7 Days Action"]),
          completed:
            (p["Completed"] as { type: string; checkbox?: boolean })
              ?.checkbox ?? false,
        };
      })
      .filter(Boolean);

    return NextResponse.json({ reflections });
  } catch (err) {
    console.error("Reflection fetch error:", err);
    return NextResponse.json(
      { error: "Failed to fetch reflections" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const notion = await getNotionClient();
  if (!notion) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const dbId = request.cookies.get("reflection_db_id")?.value;
  if (!dbId) {
    return NextResponse.json({ error: "Not set up yet" }, { status: 400 });
  }

  try {
    const { reflection }: { reflection: ReflectionData } =
      await request.json();

    // Check if a reflection for this quarter/year already exists
    const existing = await notion.databases.query({
      database_id: dbId,
      filter: {
        and: [
          {
            property: "Quarter Number",
            select: { equals: reflection.quarter },
          },
          { property: "Year", number: { equals: reflection.year } },
        ],
      },
    });

    const richText = (content: string) => ({
      rich_text: content ? [{ text: { content } }] : [],
    });

    const properties = {
      Quarter: {
        title: [
          { text: { content: `${reflection.quarter} ${reflection.year}` } },
        ],
      },
      "What Worked": richText(reflection.whatWorked),
      "What to Subtract": richText(reflection.whatToSubtract),
      "What Surprised Me": richText(reflection.whatSurprisedMe),
      "Theme Alignment": richText(reflection.themeAlignment),
      Adjustments: richText(reflection.adjustments),
      "Next 7 Days Action": richText(reflection.next7DaysAction),
      Year: { number: reflection.year },
      "Quarter Number": { select: { name: reflection.quarter } },
      Completed: { checkbox: true },
      "Completed Date": {
        date: { start: new Date().toISOString().split("T")[0] },
      },
    };

    if (existing.results.length > 0) {
      // Update existing reflection
      await notion.pages.update({
        page_id: existing.results[0].id,
        properties,
      });
    } else {
      // Create new reflection
      await notion.pages.create({
        parent: { type: "database_id", database_id: dbId },
        properties,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Reflection save error:", err);
    return NextResponse.json(
      { error: "Failed to save reflection" },
      { status: 500 }
    );
  }
}
