"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui";
import { useVaultStore } from "@/stores/use-vault-store";

export interface GoogleSignInButtonProps {
  label?: string;
  nextPath?: string;
  fullWidth?: boolean;
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
  nextPath = "/vault",
  fullWidth = false,
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
    <Button
      variant="primary"
      isLoading={isLoading}
      loadingLabel="Connecting to Google..."
      onClick={handleSignIn}
      className={fullWidth ? "min-h-[48px] w-full" : "min-h-[48px] w-full sm:w-auto sm:px-6"}
    >
      <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81Z"
        />
      </svg>
      <span>{label}</span>
    </Button>
  );
}
