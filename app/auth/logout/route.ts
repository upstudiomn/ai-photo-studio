import { NextResponse } from "next/server";
import { logoutUser } from "@/server/auth";

export async function GET(request: Request) {
  await logoutUser();
  return NextResponse.redirect(new URL("/?auth=logout", request.url));
}

export async function POST(request: Request) {
  await logoutUser();
  return NextResponse.redirect(new URL("/?auth=logout", request.url));
}
