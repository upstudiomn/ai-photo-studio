import { NextRequest, NextResponse } from "next/server";
import { addAdminOrderNote } from "@/server/admin";
import { getAdminAuth } from "@/server/admin-auth";

export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminAuth();

    if (!admin.ok) {
      return NextResponse.json(
        { success: false, error: admin.reason === "unauthenticated" ? "Authentication required" : "Admin access required" },
        { status: admin.reason === "unauthenticated" ? 401 : 403 },
      );
    }

    const body = await request.json();
    const { orderId, note, sessionId } = body;

    // Validate required fields
    if (!orderId || !note) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const result = await addAdminOrderNote(orderId, note, sessionId);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, noteId: result.noteId });
  } catch (error) {
    console.error("Admin add note error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
