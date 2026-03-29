import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.redirect(
    new URL("/", process.env.NEXT_PUBLIC_APP_URL!)
  );
  response.cookies.delete("notion_token");
  response.cookies.delete("notion_workspace_id");
  response.cookies.delete("notion_workspace_name");
  response.cookies.delete("notion_user_name");
  response.cookies.delete("compass_db_id");
  response.cookies.delete("reflection_db_id");
  response.cookies.delete("compass_page_id");
  return response;
}
