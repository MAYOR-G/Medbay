import { NextResponse } from "next/server";

/**
 * Streaming RAG & Calendar chat endpoint placeholder (implemented in Phase 6).
 */
export async function POST(): Promise<NextResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "NOT_IMPLEMENTED",
        message: "Streaming chat is not implemented in Phase 0.",
      },
    },
    { status: 501 },
  );
}
