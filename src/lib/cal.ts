import { cookies } from "next/headers";
import { Client } from "@notionhq/client";

// ─── Notion Settings helpers ─────────────────────────────────────────
// Cal.com tokens are stored in the user's own Notion Settings database
// so everything stays private and decentralized.

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

// ─── Cal.com token management ────────────────────────────────────────

// Get a valid Cal.com access token, refreshing from Notion-stored refresh token if needed
export async function getCalAccessToken(): Promise<string | null> {
  // First check cookie for current session's access token
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("cal_access_token")?.value;
  if (accessToken) return accessToken;

  // No session token — try to refresh using token stored in Notion
  const refreshToken = await getSetting("cal_refresh_token");
  if (!refreshToken) return null;

  try {
    const res = await fetch("https://api.cal.com/v2/oauth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: process.env.CAL_CLIENT_ID!,
        client_secret: process.env.CAL_CLIENT_SECRET!,
      }),
    });

    if (!res.ok) {
      console.error("Cal.com token refresh failed");
      return null;
    }

    const data = await res.json();
    const newAccessToken = data.access_token ?? data.data?.access_token;
    const newRefreshToken = data.refresh_token ?? data.data?.refresh_token;

    // Update refresh token in Notion if it changed
    if (newRefreshToken && newRefreshToken !== refreshToken) {
      await setSetting("cal_refresh_token", newRefreshToken);
    }

    return newAccessToken ?? null;
  } catch {
    return null;
  }
}

// Save Cal.com tokens after OAuth callback
export async function saveCalTokens(
  accessToken: string,
  refreshToken: string
): Promise<boolean> {
  // Save refresh token to Notion (persists across sessions)
  const saved = await setSetting("cal_refresh_token", refreshToken);
  if (saved) {
    await setSetting("cal_connected", "true");
  }
  return saved;
}

// Remove Cal.com connection
export async function removeCalConnection(): Promise<boolean> {
  await deleteSetting("cal_refresh_token");
  await deleteSetting("cal_connected");
  return true;
}

// Check if Cal.com is connected (reads from Notion)
export async function isCalConnectedServer(): Promise<boolean> {
  const val = await getSetting("cal_connected");
  return val === "true";
}

// ─── Cal.com API helper ──────────────────────────────────────────────

export async function calApiFetch(
  endpoint: string,
  token: string,
  options: RequestInit = {}
) {
  const res = await fetch(`https://api.cal.com/v2${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "cal-api-version": "2024-08-13",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Cal.com API error ${res.status}: ${text}`);
  }

  return res.json();
}
