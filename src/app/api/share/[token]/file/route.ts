import { NextResponse } from "next/server";

/**
 * Public token-gated raw file stream placeholder (implemented in Phase 5).
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "NOT_IMPLEMENTED",
        message: "Public share file streaming is not implemented in Phase 0.",
      },
    },
    { status: 501 },
  );
}
