import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-4 py-12">
      <div className="w-full max-w-[420px] rounded-lg border border-border-hairline bg-surface p-6 shadow-elevation-1">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-accent-primary text-text-inverted">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="font-heading text-xl font-semibold text-text-primary">MedBay</span>
        </div>

        <h1 className="mt-6 font-heading text-xl font-semibold text-text-primary">
          Sign in to MedBay
        </h1>
        <p className="mt-2 text-[15px] text-text-secondary">
          Authentication with Google OAuth (Vault, Calendar, and read-only Gmail medical scan) will
          be wired in Phase 2.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <Link
            href="/vault"
            className="inline-flex min-h-[44px] w-full items-center justify-center rounded-md bg-accent-primary px-4 text-[15px] font-semibold text-text-inverted transition-colors hover:bg-accent-primary-hover"
          >
            Continue to Vault Shell
          </Link>
          <Link
            href="/"
            className="inline-flex min-h-[44px] w-full items-center justify-center rounded-md border border-border-strong bg-surface px-4 text-[15px] font-semibold text-text-primary transition-colors hover:bg-surface-hover"
          >
            Back to Home
          </Link>
        </div>

        <p className="mt-6 text-[13px] text-text-muted">
          MedBay AI provides plain-English explanations for informational purposes only and is not a
          substitute for professional medical advice.
        </p>
      </div>
    </main>
  );
}
