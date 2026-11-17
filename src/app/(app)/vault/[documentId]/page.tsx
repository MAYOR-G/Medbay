import { notFound, redirect } from "next/navigation";
import { DocumentDetailClient } from "@/components/vault";
import { NotFoundError } from "@/lib/errors";
import { documentIdParamSchema } from "@/lib/schemas";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getDocumentDetailById, listProfilesByUser } from "@/server/repositories";
import { listDocumentActiveShareLinks } from "@/server/services";

export default async function DocumentDetailPage({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  const rawParams = await params;
  const parsed = documentIdParamSchema.safeParse(rawParams);
  if (!parsed.success) {
    notFound();
  }

  let document;
  let profiles;
  let activeShareLinks;
  try {
    [document, profiles, activeShareLinks] = await Promise.all([
      getDocumentDetailById(supabase, user.id, parsed.data.documentId),
      listProfilesByUser(supabase, user.id),
      listDocumentActiveShareLinks(supabase, user.id, parsed.data.documentId),
    ]);
  } catch (err) {
    if (err instanceof NotFoundError) {
      notFound();
    }
    throw err;
  }

  return (
    <DocumentDetailClient
      document={document}
      profiles={profiles}
      activeShareLinks={activeShareLinks}
    />
  );
}
