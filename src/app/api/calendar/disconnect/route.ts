import { NextResponse } from "next/server";
import { removeGCalConnection } from "@/lib/cal";

export async function POST() {
  // Remove tokens from user's Notion Settings database
  await removeGCalConnection();

  // Clear session cookies
  const response = NextResponse.json({ success: true });
  response.cookies.delete("gcal_access_token");
  response.cookies.delete("gcal_connected");

  return response;
}
