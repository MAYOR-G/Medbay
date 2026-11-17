export default async function DocumentDetailPage({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  const { documentId } = await params;

  return (
    <section className="space-y-4">
      <h1 className="font-heading text-2xl font-semibold tracking-[-0.015em]">Document Detail</h1>
      <div className="rounded-lg border border-border-hairline bg-surface p-6 shadow-elevation-1">
        <p className="font-mono text-xs text-text-muted">documentId: {documentId}</p>
        <p className="mt-2 text-[15px] text-text-secondary">
          Split-screen raw document viewer and plain-English AI summary will be implemented in Phase
          4.
        </p>
      </div>
    </section>
  );
}
