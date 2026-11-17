import { NextResponse } from "next/server";

/**
 * Document upload endpoint placeholder (implemented in Phase 4).
 */
export async function POST(): Promise<NextResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "NOT_IMPLEMENTED",
        message: "Document upload is not implemented in Phase 0.",
      },
    },
    { status: 501 },
  );
}
