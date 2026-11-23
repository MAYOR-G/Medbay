import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/vault",
  "/chat",
  "/timeline",
  "/profiles",
  "/notifications",
];

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/**
 * Enforces HTTPS and canonical domain host (e.g., apex -> www.medbayhealth.xyz)
 * in production without interfering with localhost or Vercel preview deployments.
 */
function buildCanonicalRedirect(request: NextRequest): NextResponse | null {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!configuredUrl) return null;

  let canonical: URL;
  try {
    canonical = new URL(configuredUrl);
  } catch {
    return null;
  }

  const hostHeader = (request.headers.get("host") ?? request.nextUrl.host).toLowerCase();
  const hostname = hostHeader.split(":")[0] ?? "";
  if (
    !hostname ||
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.endsWith(".vercel.app")
  ) {
    return null;
  }

  const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const isInsecureHttp = forwardedProto === "http" && canonical.protocol === "https:";

  const canonicalHost = canonical.hostname.toLowerCase();
  const apexHost = canonicalHost.startsWith("www.") ? canonicalHost.slice(4) : canonicalHost;
  const altWwwHost = canonicalHost.startsWith("www.") ? apexHost : `www.${canonicalHost}`;
  const needsHostCanonicalization = hostname === altWwwHost;

  if (!isInsecureHttp && !needsHostCanonicalization) {
    return null;
  }

  const target = request.nextUrl.clone();
  target.protocol = canonical.protocol;
  target.hostname = canonical.hostname;
  target.port = "";
  return NextResponse.redirect(target, 308);
}

/**
 * Edge Middleware: Enforces HTTPS/domain canonicalization, refreshes Supabase JWT cookies,
 * and protects authenticated application routes.
 */
export async function middleware(request: NextRequest): Promise<NextResponse> {
  const canonicalRedirect = buildCanonicalRedirect(request);
  if (canonicalRedirect) {
    return canonicalRedirect;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (!user && isProtectedRoute(pathname)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (user && (pathname === "/" || pathname === "/login")) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    dashboardUrl.search = "";
    return NextResponse.redirect(dashboardUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|icon\\.svg|icons/|brand/|manifest\\.json|site\\.webmanifest|sw\\.js|sitemap\\.xml|robots\\.txt|llms\\.txt|llms-full\\.txt|opengraph-image|twitter-image|google[a-z0-9]+\\.html).*)",
  ],
};
