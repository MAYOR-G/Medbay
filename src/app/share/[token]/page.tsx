export default async function PublicSharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  return (
    <div className="flex min-h-screen flex-col bg-viewer-dark text-text-inverted">
      <header className="flex h-14 items-center justify-between border-b border-white/10 bg-text-primary px-4 sm:px-6">
        <span className="truncate font-heading text-base font-semibold">Shared Medical Record</span>
        <span className="font-mono text-xs text-white/70">Token: {token.slice(0, 8)}...</span>
      </header>
      <main className="flex flex-1 items-center justify-center p-6">
        <p className="text-[15px] text-white/75">
          Isolated raw document viewer will be implemented in Phase 5.
        </p>
      </main>
    </div>
  );
}
