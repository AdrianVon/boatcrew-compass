import { NextRequest, NextResponse } from "next/server";
import { getNotionClient } from "@/lib/notion";
import { EXERCISE_ORDER } from "@/lib/exercises";

export async function GET(request: NextRequest) {
  const notion = await getNotionClient();
  if (!notion) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const status: Record<string, boolean> = {};

  for (const slug of EXERCISE_ORDER) {
    const cookieKey = `db_${slug.replace(/-/g, "_")}`;
    const dbId = request.cookies.get(cookieKey)?.value;
    if (!dbId) {
      status[slug] = false;
      continue;
    }

    try {
      const results = await notion.databases.query({
        database_id: dbId,
        page_size: 1,
      });
      status[slug] = results.results.length > 0;
    } catch {
      status[slug] = false;
    }
  }

  // Also check compass and reflection
  const compassDbId = request.cookies.get("compass_db_id")?.value;
  if (compassDbId) {
    try {
      const results = await notion.databases.query({ database_id: compassDbId, page_size: 1 });
      status["compass"] = results.results.length > 0;
    } catch {
      status["compass"] = false;
    }
  } else {
    status["compass"] = false;
  }

  const reflectionDbId = request.cookies.get("reflection_db_id")?.value;
  if (reflectionDbId) {
    try {
      const results = await notion.databases.query({ database_id: reflectionDbId, page_size: 1 });
      status["reflection"] = results.results.length > 0;
    } catch {
      status["reflection"] = false;
    }
  } else {
    status["reflection"] = false;
  }

  return NextResponse.json({ status });
}
