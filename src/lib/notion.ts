import { Client } from "@notionhq/client";
import { cookies } from "next/headers";

export async function getNotionClient(): Promise<Client | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("notion_token")?.value;
  if (!token) return null;
  return new Client({ auth: token });
}

export async function getWorkspaceId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("notion_workspace_id")?.value ?? null;
}

export async function getDbIds(): Promise<{
  compassDbId: string | null;
  reflectionDbId: string | null;
}> {
  const cookieStore = await cookies();
  return {
    compassDbId: cookieStore.get("compass_db_id")?.value ?? null,
    reflectionDbId: cookieStore.get("reflection_db_id")?.value ?? null,
  };
}

// Retry wrapper for Notion API rate limits
export async function notionRetry<T>(
  fn: () => Promise<T>,
  retries = 3
): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error: unknown) {
      const err = error as { status?: number; headers?: Record<string, string> };
      if (err?.status === 429 && i < retries - 1) {
        const retryAfter = parseInt(err?.headers?.["retry-after"] ?? "1", 10);
        await new Promise((r) => setTimeout(r, retryAfter * 1000));
        continue;
      }
      throw error;
    }
  }
  throw new Error("Max retries exceeded");
}
