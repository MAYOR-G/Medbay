import { NextResponse } from "next/server";

/**
 * Web Push subscription endpoint placeholder (implemented in Phase 8).
 */
export async function POST(): Promise<NextResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "NOT_IMPLEMENTED",
        message: "Web Push subscription is not implemented in Phase 0.",
      },
    },
    { status: 501 },
  );
}

export async function DELETE(): Promise<NextResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "NOT_IMPLEMENTED",
        message: "Web Push unsubscription is not implemented in Phase 0.",
      },
    },
    { status: 501 },
  );
}
