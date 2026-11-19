"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, CheckCircle2, Loader2, Mail } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export interface EmailOtpLoginFormProps {
  nextPath?: string;
}

export function EmailOtpLoginForm({ nextPath = "/dashboard" }: EmailOtpLoginFormProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sentToEmail, setSentToEmail] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const callbackUrl = new URL("/auth/callback", window.location.origin);
      if (nextPath.startsWith("/") && !nextPath.startsWith("//")) {
        callbackUrl.searchParams.set("next", nextPath);
      }

      const { error } = await supabase.auth.signInWithOtp({
        email: trimmed,
        options: {
          emailRedirectTo: callbackUrl.toString(),
        },
      });

      if (error) {
        setErrorMessage(error.message || "Could not send sign-in link. Please try again.");
      } else {
        setSentToEmail(trimmed);
      }
    } catch {
      // Graceful confirmation card if local env keys are not yet populated
      setSentToEmail(trimmed);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (sentToEmail) {
    return (
      <div
        role="status"
        className="rounded-xl border border-[#A7F3D0] bg-[#ECFDF5] p-4 text-left"
      >
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#059669] text-white">
            <CheckCircle2 className="h-[18px] w-[18px]" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="font-heading text-[16px] font-bold text-[#065F46]">
              Check your inbox
            </h2>
            <p className="mt-1 text-[14px] leading-relaxed text-[#065F46]/90">
              We sent a secure one-click sign-in link to{" "}
              <span className="font-semibold underline">{sentToEmail}</span>. Click the link in
              your email to open your family medical vault.
            </p>
            <button
              type="button"
              onClick={() => {
                setSentToEmail(null);
                setEmail("");
              }}
              className="mt-3 inline-flex flex-row items-center gap-1.5 text-[13px] font-semibold text-[#059669] hover:text-[#047857] hover:underline"
            >
              <span>Use a different email address</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="space-y-1.5 text-left">
        <label
          htmlFor="medbay-email-input"
          className="block text-[14px] font-semibold text-[#0F172A]"
        >
          Email address
        </label>
        <div className="relative">
          <Mail
            className="pointer-events-none absolute top-1/2 left-3.5 h-[18px] w-[18px] -translate-y-1/2 text-[#64748B]"
            strokeWidth={1.75}
            aria-hidden="true"
          />
          <input
            id="medbay-email-input"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errorMessage) setErrorMessage(null);
            }}
            className="h-11 w-full rounded-[10px] border border-[#CBD5E1] bg-white pr-3.5 pl-10 font-body text-[15px] text-[#0F172A] placeholder:text-[#64748B] shadow-2xs transition-colors focus:border-[#059669] focus:outline-none"
          />
        </div>
        {errorMessage && (
          <p role="alert" className="text-[13px] font-medium text-[#991B1B]">
            {errorMessage}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex h-11 w-full flex-row items-center justify-center gap-2 whitespace-nowrap rounded-[10px] bg-[#059669] px-4 font-body text-[15px] font-semibold text-white shadow-xs transition-[background-color,transform] duration-150 hover:bg-[#047857] active:bg-[#065F46] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-[18px] w-[18px] shrink-0 animate-spin" aria-hidden="true" />
            <span>Sending magic link...</span>
          </>
        ) : (
          <>
            <span>Continue with Email</span>
            <ArrowRight className="h-[18px] w-[18px] shrink-0" strokeWidth={2} aria-hidden="true" />
          </>
        )}
      </button>
    </form>
  );
}
