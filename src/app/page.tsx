import Link from "next/link";
import { ShieldCheck, FileText, Share2, ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-canvas text-text-primary">
      <header className="border-b border-border-hairline bg-surface/95">
        <div className="mx-auto flex h-16 max-w-[1040px] items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5 font-heading text-xl font-semibold">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent-primary text-text-inverted">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            </span>
            <span>MedBay</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="inline-flex min-h-[44px] items-center rounded-md px-4 text-[15px] font-semibold text-text-secondary transition-colors hover:bg-surface-subtle hover:text-text-primary"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[1040px] flex-1 flex-col justify-center px-4 py-12 sm:px-6">
        <section className="mx-auto max-w-[680px] text-center">
          <span className="inline-flex items-center rounded-sm border border-accent-primary-border bg-accent-primary-tint px-2.5 py-1 font-mono text-xs font-medium tracking-wide text-accent-primary uppercase">
            Private Health Atelier
          </span>
          <h1 className="mt-4 font-heading text-[2rem] leading-[1.2] font-semibold tracking-[-0.02em] text-text-primary">
            Your family&apos;s medical records, understood and ready anywhere.
          </h1>
          <p className="mt-4 text-[17px] leading-[1.6] text-text-secondary">
            Store encrypted records for every family member, translate clinical jargon into clear
            plain-English summaries, and share originals with doctors in one click.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/login"
              className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-md bg-accent-primary px-6 text-[15px] font-semibold text-text-inverted transition-colors hover:bg-accent-primary-hover active:bg-accent-primary-active sm:w-auto"
            >
              <span>Continue with Google</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/vault"
              className="inline-flex min-h-[48px] w-full items-center justify-center rounded-md border border-border-strong bg-surface px-6 text-[15px] font-semibold text-text-primary transition-colors hover:bg-surface-hover sm:w-auto"
            >
              Preview App Shell
            </Link>
          </div>
        </section>

        <section className="mt-12 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-border-hairline bg-surface p-5 shadow-elevation-1">
            <ShieldCheck className="h-5 w-5 text-accent-primary" aria-hidden="true" />
            <h2 className="mt-3 font-heading text-[17px] font-semibold">
              Family Vault &amp; Sub-Profiles
            </h2>
            <p className="mt-1.5 text-[15px] text-text-secondary">
              Organize records for yourself, your spouse, and your children under one private vault.
            </p>
          </div>
          <div className="rounded-lg border border-border-hairline bg-surface p-5 shadow-elevation-1">
            <FileText className="h-5 w-5 text-accent-primary" aria-hidden="true" />
            <h2 className="mt-3 font-heading text-[17px] font-semibold">Plain-English Summaries</h2>
            <p className="mt-1.5 text-[15px] text-text-secondary">
              Clear explanations with highlighted clinical flags, doctor questions, and verified
              citations.
            </p>
          </div>
          <div className="rounded-lg border border-border-hairline bg-surface p-5 shadow-elevation-1">
            <Share2 className="h-5 w-5 text-accent-primary" aria-hidden="true" />
            <h2 className="mt-3 font-heading text-[17px] font-semibold">
              One-Click Expiring Links
            </h2>
            <p className="mt-1.5 text-[15px] text-text-secondary">
              Share raw records for 24 hours, 7 days, or 30 days with zero PINs or account walls.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-border-hairline bg-surface px-4 py-6 text-center text-[13px] text-text-muted">
        MedBay AI provides plain-English explanations for informational purposes only and is not a
        substitute for professional medical advice.
      </footer>
    </div>
  );
}
