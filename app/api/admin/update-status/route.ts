import { NextRequest, NextResponse } from "next/server";
import {
  updateAdminOrderStatus,
  updateAdminPaymentStatus,
  updateAdminPrintJobStatus,
} from "@/server/admin";
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
    const { type, status, orderId, paymentId, printJobId } = body;

    // Validate required fields
    if (!type || !status) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    // Validate type
    if (!["order", "payment", "print"].includes(type)) {
      return NextResponse.json({ success: false, error: "Invalid type" }, { status: 400 });
    }

    let result;

    switch (type) {
      case "order":
        if (!orderId) {
          return NextResponse.json({ success: false, error: "Missing orderId" }, { status: 400 });
        }
        result = await updateAdminOrderStatus(orderId, status);
        break;

      case "payment":
        if (!orderId || !paymentId) {
          return NextResponse.json({ success: false, error: "Missing orderId or paymentId" }, { status: 400 });
        }
        result = await updateAdminPaymentStatus(orderId, paymentId, status);
        break;

      case "print":
        if (!printJobId) {
          return NextResponse.json({ success: false, error: "Missing printJobId" }, { status: 400 });
        }
        result = await updateAdminPrintJobStatus(printJobId, status);
        break;

      default:
        return NextResponse.json({ success: false, error: "Invalid type" }, { status: 400 });
    }

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin status update error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
