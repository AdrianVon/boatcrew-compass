import { NextRequest, NextResponse } from "next/server";
import { getNotionClient } from "@/lib/notion";
import {
  COMPASS_PROPERTIES,
  REFLECTION_PROPERTIES,
} from "@/lib/notion-schemas";

export async function POST(request: NextRequest) {
  const notion = await getNotionClient();
  if (!notion) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    // Check if databases already exist (user revisiting setup)
    const existingCompassId = request.cookies.get("compass_db_id")?.value;
    if (existingCompassId) {
      // Verify the database still exists
      try {
        await notion.databases.retrieve({ database_id: existingCompassId });
        return NextResponse.json({
          compassDbId: existingCompassId,
          reflectionDbId: request.cookies.get("reflection_db_id")?.value,
          alreadySetUp: true,
        });
      } catch {
        // Database was deleted, proceed to create new ones
      }
    }

    // Find a page the user shared with us during OAuth
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

    // Use the first available page as parent
    const parentPage = searchResults.results[0];
    const parentPageId = parentPage.id;

    // Create Priorities Compass database
    const compassDb = await notion.databases.create({
      parent: { type: "page_id", page_id: parentPageId },
      title: [{ type: "text", text: { content: "Priorities Compass" } }],
      description: [
        {
          type: "text",
          text: {
            content:
              "A one-page map for how you'll move through the year. North/South/East/West priorities.",
          },
        },
      ],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      properties: COMPASS_PROPERTIES as any,
    });

    // Create Quarterly Reflections database
    const reflectionDb = await notion.databases.create({
      parent: { type: "page_id", page_id: parentPageId },
      title: [{ type: "text", text: { content: "Quarterly Reflections" } }],
      description: [
        {
          type: "text",
          text: {
            content:
              "Revisit your Theme, Compass, and Three Wins each quarter. Recalibrate with clarity and intention.",
          },
        },
      ],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      properties: REFLECTION_PROPERTIES as any,
    });

    // Store database IDs in cookies for future use
    const response = NextResponse.json({
      compassDbId: compassDb.id,
      reflectionDbId: reflectionDb.id,
      parentPageId,
    });

    const cookieOpts = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    };

    response.cookies.set("compass_db_id", compassDb.id, cookieOpts);
    response.cookies.set("reflection_db_id", reflectionDb.id, cookieOpts);
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
