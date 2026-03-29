import { NextRequest, NextResponse } from "next/server";
import { getNotionClient } from "@/lib/notion";
import type { CompassData } from "@/lib/notion-schemas";

export async function GET(request: NextRequest) {
  const notion = await getNotionClient();
  if (!notion) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const dbId = request.cookies.get("compass_db_id")?.value;
  if (!dbId) {
    return NextResponse.json({ error: "Not set up yet" }, { status: 400 });
  }

  try {
    const results = await notion.databases.query({
      database_id: dbId,
      sorts: [
        { property: "Direction", direction: "ascending" },
        { property: "Order", direction: "ascending" },
      ],
    });

    // Transform Notion pages into CompassData
    const compass: CompassData = {
      north: ["", "", ""],
      south: ["", "", ""],
      east: ["", "", ""],
      west: ["", "", ""],
    };

    for (const page of results.results) {
      if (!("properties" in page)) continue;
      const props = page.properties;

      const dirProp = props["Direction"];
      const orderProp = props["Order"];
      const titleProp = props["Priority"];

      if (
        dirProp?.type !== "select" ||
        orderProp?.type !== "number" ||
        titleProp?.type !== "title"
      )
        continue;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const p = props as Record<string, any>;
      const direction = p["Direction"]?.select?.name?.toLowerCase() as keyof CompassData;
      const order = ((p["Order"]?.number as number) ?? 1) - 1;
      const text = (p["Priority"]?.title?.[0]?.plain_text as string) ?? "";

      if (direction in compass && order >= 0 && order < 3) {
        compass[direction][order] = text;
      }
    }

    return NextResponse.json({ compass });
  } catch (err) {
    console.error("Compass fetch error:", err);
    return NextResponse.json(
      { error: "Failed to fetch compass data" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const notion = await getNotionClient();
  if (!notion) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const dbId = request.cookies.get("compass_db_id")?.value;
  if (!dbId) {
    return NextResponse.json({ error: "Not set up yet" }, { status: 400 });
  }

  try {
    const { compass }: { compass: CompassData } = await request.json();

    // Archive existing entries
    const existing = await notion.databases.query({ database_id: dbId });
    await Promise.all(
      existing.results.map((page) =>
        notion.pages.update({ page_id: page.id, archived: true })
      )
    );

    // Create new entries
    const directions = ["North", "South", "East", "West"] as const;
    const keys = ["north", "south", "east", "west"] as const;
    const today = new Date().toISOString().split("T")[0];

    for (let d = 0; d < 4; d++) {
      for (let i = 0; i < 3; i++) {
        const text = compass[keys[d]][i];
        if (text?.trim()) {
          await notion.pages.create({
            parent: { type: "database_id", database_id: dbId },
            properties: {
              Priority: { title: [{ text: { content: text } }] },
              Direction: { select: { name: directions[d] } },
              Order: { number: i + 1 },
              Updated: { date: { start: today } },
            },
          });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Compass save error:", err);
    return NextResponse.json(
      { error: "Failed to save compass data" },
      { status: 500 }
    );
  }
}
