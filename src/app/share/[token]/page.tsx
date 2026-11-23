import type { Metadata } from "next";
import { Clock } from "lucide-react";
import { Card } from "@/components/ui";
import { PublicShareViewer } from "@/components/vault";
import { shareTokenParamSchema } from "@/lib/schemas";
import { PRIVATE_NOINDEX_ROBOTS } from "@/lib/seo";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { resolvePublicShareDocument } from "@/server/services";
import type { ResolvedShareLinkDto } from "@/types/domain.types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shared Medical Document",
  robots: PRIVATE_NOINDEX_ROBOTS,
};

function ExpiredShareFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <Card className="w-full max-w-[420px] p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-border-hairline bg-surface-subtle text-text-secondary">
          <Clock className="h-5 w-5" aria-hidden="true" />
        </div>
        <h1 className="mt-4 font-heading text-xl font-semibold text-text-primary">
          Link Expired or Revoked
        </h1>
        <p className="mt-2 text-[15px] text-text-secondary">
          This medical document link is no longer active. Please ask the document owner to generate
          a new share link.
        </p>
      </Card>
    </main>
  );
}

export default async function PublicSharePage({ params }: { params: Promise<{ token: string }> }) {
  const rawParams = await params;
  const parsed = shareTokenParamSchema.safeParse(rawParams);
  if (!parsed.success) {
    return <ExpiredShareFallback />;
  }

  let resolved: ResolvedShareLinkDto | null = null;
  try {
    const adminClient = createSupabaseAdminClient();
    resolved = await resolvePublicShareDocument(adminClient, parsed.data.token);
  } catch {
    resolved = null;
  }

  if (!resolved) {
    return <ExpiredShareFallback />;
  }

  return (
    <PublicShareViewer
      token={parsed.data.token}
      title={resolved.title}
      mimeType={resolved.mimeType}
      expiresAt={resolved.expiresAt}
    />
  );
}
