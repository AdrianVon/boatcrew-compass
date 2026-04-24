import { NextResponse } from "next/server";
import { removeCalConnection } from "@/lib/cal";

export async function POST() {
  // Remove tokens from user's Notion Settings database
  await removeCalConnection();

  // Clear session cookies
  const response = NextResponse.json({ success: true });
  response.cookies.delete("cal_access_token");
  response.cookies.delete("cal_connected");

  return response;
}
