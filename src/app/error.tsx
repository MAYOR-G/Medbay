"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-[420px] rounded-lg border border-border-hairline bg-surface p-6 text-center shadow-elevation-1">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-status-danger-border bg-status-danger-bg text-status-danger-text">
          <AlertTriangle className="h-5 w-5" aria-hidden="true" />
        </div>
        <h1 className="mt-4 font-heading text-xl font-semibold text-text-primary">
          Something went wrong
        </h1>
        <p className="mt-2 text-[15px] text-text-secondary">
          An unexpected error occurred while loading this view. Your medical records remain safe.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-[44px] items-center justify-center rounded-md bg-accent-primary px-5 text-[15px] font-semibold text-text-inverted hover:bg-accent-primary-hover"
          >
            Try Again
          </button>
          <Link
            href="/vault"
            className="inline-flex min-h-[44px] items-center justify-center rounded-md border border-border-strong bg-surface px-5 text-[15px] font-semibold text-text-primary hover:bg-surface-hover"
          >
            Return to Vault
          </Link>
        </div>
      </div>
    </div>
  );
}
