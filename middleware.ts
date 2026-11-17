import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Edge Middleware placeholder (Phase 0).
 * Supabase session refresh and route access guards will be implemented in Phase 2.
 */
export function middleware(_request: NextRequest): NextResponse {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icons/|manifest\\.json|sw\\.js).*)"],
};
