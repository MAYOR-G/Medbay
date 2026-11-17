import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-[420px] rounded-lg border border-border-hairline bg-surface p-6 text-center shadow-elevation-1">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-border-hairline bg-surface-subtle text-accent-primary">
          <FileQuestion className="h-5 w-5" aria-hidden="true" />
        </div>
        <h1 className="mt-4 font-heading text-xl font-semibold text-text-primary">
          Page not found
        </h1>
        <p className="mt-2 text-[15px] text-text-secondary">
          The page you requested could not be located in MedBay.
        </p>
        <div className="mt-6">
          <Link
            href="/vault"
            className="inline-flex min-h-[44px] items-center justify-center rounded-md bg-accent-primary px-5 text-[15px] font-semibold text-text-inverted hover:bg-accent-primary-hover"
          >
            Return to Vault
          </Link>
        </div>
      </div>
    </div>
  );
}
