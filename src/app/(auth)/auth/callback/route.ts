import { NextResponse } from "next/server";

/**
 * OAuth PKCE callback placeholder (implemented in Phase 2).
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "NOT_IMPLEMENTED",
        message: "OAuth callback is not implemented in Phase 0.",
      },
    },
    { status: 501 },
  );
}
