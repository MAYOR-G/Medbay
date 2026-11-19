import Link from "next/link";
import { AlertCircle, ArrowLeft, CheckCircle2, Lock } from "lucide-react";
import { EmailOtpLoginForm, GoogleSignInButton } from "@/components/layout";
import { MedBayLogo } from "@/components/ui";

interface LoginPageProps {
  searchParams: Promise<{ error?: string; next?: string }>;
}

const VALUE_HIGHLIGHTS = [
  "Private encrypted storage for your whole family",
  "Plain-English breakdowns with verified medical citations",
  "Automatic 24-hour Gmail scan & Google Calendar booking",
] as const;

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const hasOAuthError = Boolean(params.error);
  const nextPath =
    params.next && params.next.startsWith("/") && !params.next.startsWith("//")
      ? params.next
      : "/dashboard";

  return (
    <div className="flex min-h-screen bg-white text-[#0F172A]">
      {/* Left Panel: 50% on desktop, Deep Botanical Emerald with subtle geometric grid */}
      <aside className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-[#064E3B] p-12 text-white lg:flex xl:p-16">
        {/* Subtle Geometric Grid Overlay */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.18) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.18) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative z-10 flex items-center justify-between">
          <Link href="/" aria-label="Back to MedBay Home">
            <MedBayLogo variant="light" size="md" />
          </Link>
          <span className="inline-flex flex-row items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 font-mono text-xs font-medium text-[#A7F3D0]">
            <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>AES-256 Vault</span>
          </span>
        </div>

        <div className="relative z-10 my-auto max-w-lg space-y-8 py-12">
          <blockquote className="font-heading text-3xl leading-[1.2] font-bold tracking-[-0.02em] text-white xl:text-[36px]">
            &ldquo;Every lab report, prescription, and pediatric record—organized for the moments
            that matter most.&rdquo;
          </blockquote>

          <ul className="space-y-4">
            {VALUE_HIGHLIGHTS.map((item) => (
              <li key={item} className="flex items-start gap-3 text-[16px] text-[#ECFDF5]">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#059669] text-white shadow-2xs">
                  <CheckCircle2 className="h-4 w-4" strokeWidth={2.25} aria-hidden="true" />
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 flex items-center justify-between border-t border-white/15 pt-6 text-xs text-[#A7F3D0]/90">
          <span>Row-Level Isolated Family Profiles</span>
          <span>WHO · NHS · CDC Grounded AI</span>
        </div>
      </aside>

      {/* Right Panel: 50% on desktop, 100% on mobile — Pure #FFFFFF centered form container */}
      <main className="flex w-full flex-col justify-between bg-white px-6 py-8 sm:px-10 lg:w-1/2 lg:p-12">
        <div className="flex items-center justify-between">
          <Link href="/" className="lg:hidden" aria-label="MedBay Home">
            <MedBayLogo size="sm" />
          </Link>
          <Link
            href="/"
            className="inline-flex h-10 flex-row items-center gap-1.5 whitespace-nowrap rounded-[10px] px-3 text-[14px] font-semibold text-[#475569] transition-colors hover:bg-[#F8FAFC] hover:text-[#0F172A]"
          >
            <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Back to Home</span>
          </Link>
        </div>

        <div className="mx-auto my-auto w-full max-w-[420px] py-8">
          <div className="space-y-2 text-left">
            <h1 className="font-heading text-2xl font-bold tracking-[-0.02em] text-[#0F172A] sm:text-[28px]">
              Welcome to MedBay
            </h1>
            <p className="text-[15px] text-[#475569]">
              Sign in or create your family medical vault
            </p>
          </div>

          {hasOAuthError && (
            <div
              role="alert"
              className="mt-5 flex items-start gap-2.5 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-[13px] font-medium text-[#991B1B]"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>
                Google sign-in could not be completed. Please try again or continue with your email
                below.
              </span>
            </div>
          )}

          {/* Primary OAuth Button */}
          <div className="mt-6">
            <GoogleSignInButton nextPath={nextPath} fullWidth />
          </div>

          {/* Clean Divider */}
          <div className="relative my-6 flex items-center justify-center">
            <div className="w-full border-t border-[#E2E8F0]" />
            <span className="relative bg-white px-3 text-xs font-semibold tracking-wider whitespace-nowrap text-[#64748B] uppercase">
              or sign up with your email
            </span>
          </div>

          {/* Email Sign-Up / Sign-In Form */}
          <EmailOtpLoginForm nextPath={nextPath} />

          <p className="mt-6 text-center text-[13px] leading-relaxed text-[#64748B]">
            By continuing, you agree to MedBay&apos;s Terms &amp; Privacy Policy. AI summaries are
            informational only and do not replace professional medical advice.
          </p>
        </div>

        <div className="text-center text-xs text-[#64748B] lg:text-left">
          Protected by end-to-end TLS and AES-256 storage encryption.
        </div>
      </main>
    </div>
  );
}
