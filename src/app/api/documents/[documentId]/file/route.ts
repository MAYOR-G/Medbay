import { NextResponse } from "next/server";

/**
 * Authenticated document file stream placeholder (implemented in Phase 4).
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "NOT_IMPLEMENTED",
        message: "Document file streaming is not implemented in Phase 0.",
      },
    },
    { status: 501 },
  );
}
