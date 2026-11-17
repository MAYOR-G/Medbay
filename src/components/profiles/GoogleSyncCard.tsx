"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import * as Switch from "@radix-ui/react-switch";
import { CalendarCheck, LogOut, Mail, RefreshCw, Trash2 } from "lucide-react";
import { Badge, Button, Card, Input, ModalOrSheet } from "@/components/ui";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  deleteUserAccountAction,
  signOutAction,
  updateAccountPreferencesAction,
} from "@/server/actions";
import { useVaultStore } from "@/stores/use-vault-store";
import type { UserAccountDto } from "@/types/domain.types";

export interface GoogleSyncCardProps {
  user: UserAccountDto;
}

const GOOGLE_SCOPES = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/gmail.readonly",
].join(" ");

export function GoogleSyncCard({ user }: GoogleSyncCardProps) {
  const router = useRouter();
  const addToast = useVaultStore((state) => state.addToast);
  const [gmailEnabled, setGmailEnabled] = useState(user.gmailScanEnabled);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleToggleGmailScan(checked: boolean) {
    const previous = gmailEnabled;
    setGmailEnabled(checked);

    startTransition(async () => {
      const result = await updateAccountPreferencesAction({ gmailScanEnabled: checked });
      if (result.success) {
        addToast(
          checked
            ? "24-hour Gmail medical scanner enabled."
            : "24-hour Gmail medical scanner paused.",
          "success",
        );
        router.refresh();
      } else {
        setGmailEnabled(previous);
        addToast(result.error.message, "danger");
      }
    });
  }

  async function handleReconnectGoogle() {
    setIsReconnecting(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const callbackUrl = new URL("/auth/callback", window.location.origin);
      callbackUrl.searchParams.set("next", "/profiles");

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: callbackUrl.toString(),
          scopes: GOOGLE_SCOPES,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });
      if (error) {
        addToast("Could not reconnect Google permissions.", "danger");
        setIsReconnecting(false);
      }
    } catch {
      addToast("Google OAuth client is unavailable.", "danger");
      setIsReconnecting(false);
    }
  }

  function handleSignOut() {
    startTransition(async () => {
      const result = await signOutAction();
      if (result.success) {
        router.push(result.data.redirectTo);
        router.refresh();
      } else {
        addToast(result.error.message, "danger");
      }
    });
  }

  function handleDeleteAccount() {
    if (deleteConfirmText !== "DELETE") {
      addToast('Please type "DELETE" to confirm account erasure.', "warning");
      return;
    }

    startTransition(async () => {
      const result = await deleteUserAccountAction({ confirmationText: "DELETE" });
      if (result.success) {
        addToast("Your MedBay vault has been permanently deleted.", "success");
        router.push("/login");
        router.refresh();
      } else {
        addToast(result.error.message, "danger");
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Section 2: Connected Google Services */}
      <Card className="space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-heading text-xl font-semibold text-text-primary">
              Connected Google Services
            </h2>
            <p className="mt-1 text-[14px] text-text-secondary">
              Signed in as <span className="font-semibold text-text-primary">{user.email}</span>
            </p>
          </div>
          <Button
            variant="outline"
            size="compact"
            isLoading={isReconnecting}
            loadingLabel="Redirecting..."
            onClick={handleReconnectGoogle}
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            <span>Reconnect Google Permissions</span>
          </Button>
        </div>

        <div className="divide-y divide-border-hairline rounded-md border border-border-hairline bg-surface-hover">
          <div className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="flex items-start gap-3">
              <CalendarCheck
                className="mt-0.5 h-5 w-5 shrink-0 text-accent-primary"
                aria-hidden="true"
              />
              <div>
                <p className="text-[15px] font-semibold text-text-primary">Google Calendar</p>
                <p className="text-[13px] text-text-secondary">
                  Allows MedBay AI Chat to schedule doctor appointments directly on your primary
                  calendar.
                </p>
              </div>
            </div>
            <Badge variant={user.googleScopesValid ? "ready" : "attention"}>
              {user.googleScopesValid ? "Active" : "Reconnect Needed"}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-5 w-5 shrink-0 text-accent-primary" aria-hidden="true" />
              <div>
                <p className="text-[15px] font-semibold text-text-primary">
                  24-Hour Gmail Medical Scanner
                </p>
                <p className="text-[13px] text-text-secondary">
                  Read-only scan for lab notices and clinic updates. Alerts arrive in-app and via
                  Web Push (zero outbound emails).
                </p>
                <p className="mt-1 font-mono text-xs text-text-muted tabular-nums">
                  Last scan:{" "}
                  {user.lastGmailScanAt
                    ? new Date(user.lastGmailScanAt).toLocaleString()
                    : "Pending first 24h cycle"}
                </p>
              </div>
            </div>

            <div className="flex min-h-[44px] items-center">
              <Switch.Root
                aria-label="Toggle 24-hour Gmail medical scanner"
                checked={gmailEnabled}
                onCheckedChange={handleToggleGmailScan}
                disabled={isPending}
                className="relative h-6 w-11 shrink-0 cursor-pointer rounded-full border border-border-strong bg-surface-subtle transition-colors data-[state=checked]:border-accent-primary data-[state=checked]:bg-accent-primary"
              >
                <Switch.Thumb className="block h-5 w-5 translate-x-0.5 rounded-full bg-surface shadow-elevation-1 transition-transform data-[state=checked]:translate-x-[21px]" />
              </Switch.Root>
            </div>
          </div>
        </div>
      </Card>

      {/* Section 3: Session & Account Erasure */}
      <Card className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-lg font-semibold text-text-primary">Account Session</h2>
          <p className="mt-1 text-[14px] text-text-secondary">
            Manage your active browser session or permanently erase your encrypted vault.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" disabled={isPending} onClick={handleSignOut}>
            <LogOut className="h-4 w-4" aria-hidden="true" />
            <span>Sign Out</span>
          </Button>
          <Button
            variant="destructive"
            disabled={isPending}
            onClick={() => {
              setDeleteConfirmText("");
              setDeleteDialogOpen(true);
            }}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            <span>Delete Account</span>
          </Button>
        </div>
      </Card>

      <ModalOrSheet
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Permanently Delete Account?"
        description="This immediately erases your encrypted storage files, all family sub-profiles, AI summaries, chat history, and share links."
      >
        <div className="space-y-4">
          <Input
            label='Type "DELETE" to confirm'
            required
            placeholder="DELETE"
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
          />
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              disabled={isPending}
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteConfirmText !== "DELETE"}
              isLoading={isPending}
              loadingLabel="Deleting Account..."
              onClick={handleDeleteAccount}
            >
              Permanently Delete Vault
            </Button>
          </div>
        </div>
      </ModalOrSheet>
    </div>
  );
}
