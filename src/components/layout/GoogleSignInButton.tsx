"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { GoogleIcon, cn } from "@/components/ui";
import { useVaultStore } from "@/stores/use-vault-store";

export interface GoogleSignInButtonProps {
  label?: string;
  nextPath?: string;
  fullWidth?: boolean;
  className?: string;
}

const GOOGLE_OAUTH_SCOPES = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/gmail.readonly",
].join(" ");

export function GoogleSignInButton({
  label = "Continue with Google",
  nextPath = "/dashboard",
  fullWidth = false,
  className,
}: GoogleSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const addToast = useVaultStore((state) => state.addToast);

  async function handleSignIn() {
    setIsLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const callbackUrl = new URL("/auth/callback", window.location.origin);
      if (nextPath.startsWith("/") && !nextPath.startsWith("//")) {
        callbackUrl.searchParams.set("next", nextPath);
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: callbackUrl.toString(),
          scopes: GOOGLE_OAUTH_SCOPES,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        addToast("Could not start Google sign-in. Please try again.", "danger");
        setIsLoading(false);
      }
    } catch {
      addToast("Authentication is not configured in this environment yet.", "warning");
      setIsLoading(false);
    }
  }

  return (
    <button
      type="button"
      disabled={isLoading}
      onClick={handleSignIn}
      className={cn(
        "inline-flex h-12 flex-row items-center justify-center gap-2.5 whitespace-nowrap rounded-xl border border-[#CBD5E1] bg-white px-5 font-body text-[15px] font-semibold text-[#0F172A] shadow-xs transition-[background-color,border-color,transform] duration-150 hover:border-[#94A3B8] hover:bg-[#F8FAFC] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60",
        fullWidth ? "w-full" : "w-full sm:w-auto",
        className,
      )}
    >
      {isLoading ? (
        <Loader2 className="h-[18px] w-[18px] shrink-0 animate-spin text-[#059669]" aria-hidden="true" />
      ) : (
        <GoogleIcon className="h-[18px] w-[18px] shrink-0" />
      )}
      <span>{isLoading ? "Connecting to Google..." : label}</span>
    </button>
  );
}
