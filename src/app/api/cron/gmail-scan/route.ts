import { NextResponse } from "next/server";

/**
 * 24-hour Gmail medical scanner cron endpoint placeholder (implemented in Phase 8).
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "NOT_IMPLEMENTED",
        message: "Gmail scanner cron is not implemented in Phase 0.",
      },
    },
    { status: 501 },
  );
}
