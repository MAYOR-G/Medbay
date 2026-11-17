import Link from "next/link";
import { AlertCircle, CalendarCheck, MailCheck, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui";
import { GoogleSignInButton } from "@/components/layout/GoogleSignInButton";

interface LoginPageProps {
  searchParams: Promise<{ error?: string; next?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const hasOAuthError = Boolean(params.error);
  const nextPath =
    params.next && params.next.startsWith("/") && !params.next.startsWith("//")
      ? params.next
      : "/vault";

  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-4 py-12">
      <Card className="w-full max-w-[420px] p-6">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-accent-primary text-text-inverted">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="font-heading text-xl font-semibold text-text-primary">MedBay</span>
        </div>

        <h1 className="mt-6 font-heading text-xl font-semibold tracking-[-0.01em] text-text-primary">
          Sign in to MedBay
        </h1>
        <p className="mt-2 text-[15px] text-text-secondary">
          Connect your Google account to unlock your encrypted family vault, calendar appointment
          booking, and daily medical email alerts.
        </p>

        {hasOAuthError && (
          <div
            role="alert"
            className="mt-4 flex items-start gap-2 rounded-md border border-status-danger-border bg-status-danger-bg px-3 py-2.5 text-[13px] text-status-danger-text"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Google sign-in could not be completed. Please try again and grant access.</span>
          </div>
        )}

        <ul className="mt-5 space-y-2.5 rounded-md border border-border-hairline bg-surface-hover p-3.5 text-[13px] text-text-secondary">
          <li className="flex items-start gap-2.5">
            <ShieldCheck
              className="mt-0.5 h-4 w-4 shrink-0 text-accent-primary"
              aria-hidden="true"
            />
            <span>Private family medical vault encrypted at rest</span>
          </li>
          <li className="flex items-start gap-2.5">
            <CalendarCheck
              className="mt-0.5 h-4 w-4 shrink-0 text-accent-primary"
              aria-hidden="true"
            />
            <span>Google Calendar access to schedule doctor follow-ups from AI chat</span>
          </li>
          <li className="flex items-start gap-2.5">
            <MailCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent-primary" aria-hidden="true" />
            <span>Read-only Gmail scan every 24h for lab notices and clinic updates</span>
          </li>
        </ul>

        <div className="mt-6 flex flex-col gap-3">
          <GoogleSignInButton nextPath={nextPath} fullWidth />
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
      </Card>
    </main>
  );
}
