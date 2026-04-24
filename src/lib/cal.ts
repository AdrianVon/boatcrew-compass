import { cookies } from "next/headers";
import { Client } from "@notionhq/client";

// ─── Notion Settings helpers ─────────────────────────────────────────
// Google Calendar tokens are stored in the user's own Notion Settings
// database so everything stays private and decentralized.

async function getSettingsDbId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("settings_db_id")?.value ?? null;
}

async function getNotionClientForSettings(): Promise<Client | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("notion_token")?.value;
  if (!token) return null;
  return new Client({ auth: token });
}

// Read a setting from the user's Notion Settings database
export async function getSetting(key: string): Promise<string | null> {
  const notion = await getNotionClientForSettings();
  const dbId = await getSettingsDbId();
  if (!notion || !dbId) return null;

  try {
    const results = await notion.databases.query({
      database_id: dbId,
      filter: {
        property: "Key",
        title: { equals: key },
      },
      page_size: 1,
    });

    if (results.results.length === 0) return null;

    const page = results.results[0];
    if (!("properties" in page)) return null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const valueProp = (page.properties as any)["Value"];
    if (valueProp?.type === "rich_text" && valueProp.rich_text?.[0]) {
      return valueProp.rich_text[0].plain_text;
    }
    return null;
  } catch {
    return null;
  }
}

// Write a setting to the user's Notion Settings database
export async function setSetting(key: string, value: string): Promise<boolean> {
  const notion = await getNotionClientForSettings();
  const dbId = await getSettingsDbId();
  if (!notion || !dbId) return false;

  const today = new Date().toISOString().split("T")[0];

  try {
    // Check if key already exists
    const existing = await notion.databases.query({
      database_id: dbId,
      filter: {
        property: "Key",
        title: { equals: key },
      },
      page_size: 1,
    });

    const properties = {
      Key: { title: [{ text: { content: key } }] },
      Value: { rich_text: value ? [{ text: { content: value } }] : [] },
      Updated: { date: { start: today } },
    };

    if (existing.results.length > 0) {
      await notion.pages.update({
        page_id: existing.results[0].id,
        properties,
      });
    } else {
      await notion.pages.create({
        parent: { type: "database_id", database_id: dbId },
        properties,
      });
    }

    return true;
  } catch (err) {
    console.error("Failed to save setting:", err);
    return false;
  }
}

// Delete a setting from the user's Notion Settings database
export async function deleteSetting(key: string): Promise<boolean> {
  const notion = await getNotionClientForSettings();
  const dbId = await getSettingsDbId();
  if (!notion || !dbId) return false;

  try {
    const existing = await notion.databases.query({
      database_id: dbId,
      filter: {
        property: "Key",
        title: { equals: key },
      },
      page_size: 1,
    });

    if (existing.results.length > 0) {
      await notion.pages.update({
        page_id: existing.results[0].id,
        archived: true,
      });
    }

    return true;
  } catch {
    return false;
  }
}

// ─── Google Calendar token management ────────────────────────────────

// Get a valid Google Calendar access token, refreshing if needed
export async function getGCalAccessToken(): Promise<string | null> {
  // Check session cookie first
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("gcal_access_token")?.value;
  if (accessToken) return accessToken;

  // Try to refresh using token stored in Notion
  const refreshToken = await getSetting("gcal_refresh_token");
  if (!refreshToken) return null;

  try {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      }),
    });

    if (!res.ok) {
      console.error("Google token refresh failed:", await res.text());
      return null;
    }

    const data = await res.json();
    return data.access_token ?? null;
  } catch {
    return null;
  }
}

// Save Google Calendar tokens after OAuth callback
export async function saveGCalTokens(
  refreshToken: string
): Promise<boolean> {
  const saved = await setSetting("gcal_refresh_token", refreshToken);
  if (saved) {
    await setSetting("gcal_connected", "true");
  }
  return saved;
}

// Remove Google Calendar connection
export async function removeGCalConnection(): Promise<boolean> {
  await deleteSetting("gcal_refresh_token");
  await deleteSetting("gcal_connected");
  return true;
}

// Check if Google Calendar is connected (reads from Notion)
export async function isGCalConnectedServer(): Promise<boolean> {
  const val = await getSetting("gcal_connected");
  return val === "true";
}

// ─── Google Calendar API helper ──────────────────────────────────────

export async function gcalApiFetch(
  endpoint: string,
  token: string,
  options: RequestInit = {}
) {
  const res = await fetch(
    `https://www.googleapis.com/calendar/v3${endpoint}`,
    {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google Calendar API error ${res.status}: ${text}`);
  }

  return res.json();
}
