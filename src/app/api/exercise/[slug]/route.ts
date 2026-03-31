import { NextRequest, NextResponse } from "next/server";
import { getNotionClient } from "@/lib/notion";
import { getExercise } from "@/lib/exercises";

function getDbCookieKey(slug: string): string {
  return `db_${slug.replace(/-/g, "_")}`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const exercise = getExercise(slug);
  if (!exercise) {
    return NextResponse.json({ error: "Unknown exercise" }, { status: 404 });
  }

  const notion = await getNotionClient();
  if (!notion) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const dbId = request.cookies.get(getDbCookieKey(slug))?.value;
  if (!dbId) {
    return NextResponse.json({ error: "Not set up yet" }, { status: 400 });
  }

  try {
    const results = await notion.databases.query({
      database_id: dbId,
      page_size: 1,
    });

    if (results.results.length === 0) {
      // No entry yet — return empty data
      const emptyData: Record<string, string> = {};
      for (const field of exercise.fields) {
        emptyData[field.key] = "";
      }
      return NextResponse.json({ data: emptyData, exists: false });
    }

    const page = results.results[0];
    if (!("properties" in page)) {
      return NextResponse.json({ data: {}, exists: false });
    }

    // Extract all rich_text properties
    const data: Record<string, string> = {};
    for (const field of exercise.fields) {
      const prop = page.properties[field.key];
      if (prop && "rich_text" in prop) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rt = (prop as any).rich_text;
        data[field.key] = rt?.[0]?.plain_text ?? "";
      } else {
        data[field.key] = "";
      }
    }

    return NextResponse.json({ data, exists: true, pageId: page.id });
  } catch (err) {
    console.error(`Exercise ${slug} fetch error:`, err);
    return NextResponse.json(
      { error: "Failed to fetch exercise data" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const exercise = getExercise(slug);
  if (!exercise) {
    return NextResponse.json({ error: "Unknown exercise" }, { status: 404 });
  }

  const notion = await getNotionClient();
  if (!notion) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const dbId = request.cookies.get(getDbCookieKey(slug))?.value;
  if (!dbId) {
    return NextResponse.json({ error: "Not set up yet" }, { status: 400 });
  }

  try {
    const { data }: { data: Record<string, string> } = await request.json();
    const today = new Date().toISOString().split("T")[0];

    // Build Notion properties
    const richText = (content: string) => ({
      rich_text: content ? [{ text: { content } }] : [],
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const properties: Record<string, any> = {
      Entry: {
        title: [{ text: { content: exercise.title } }],
      },
      Updated: { date: { start: today } },
    };

    for (const field of exercise.fields) {
      properties[field.key] = richText(data[field.key] ?? "");
    }

    // Check if an entry already exists
    const existing = await notion.databases.query({
      database_id: dbId,
      page_size: 1,
    });

    if (existing.results.length > 0) {
      // Update existing entry
      await notion.pages.update({
        page_id: existing.results[0].id,
        properties,
      });
    } else {
      // Create new entry
      await notion.pages.create({
        parent: { type: "database_id", database_id: dbId },
        properties,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(`Exercise ${slug} save error:`, err);
    return NextResponse.json(
      { error: "Failed to save exercise data" },
      { status: 500 }
    );
  }
}
