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
            <h2 className="font-heading text-[18px] font-semibold text-[#0F172A]">
              Connected Google Services
            </h2>
            <p className="mt-1 text-[15px] text-[#475569]">
              Signed in as <span className="font-semibold text-[#0F172A]">{user.email}</span>
            </p>
          </div>
          <Button
            variant="outline"
            isLoading={isReconnecting}
            loadingLabel="Redirecting..."
            onClick={handleReconnectGoogle}
          >
            <RefreshCw className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
            <span>Reconnect Google Permissions</span>
          </Button>
        </div>

        <div className="divide-y divide-[#E2E8F0] rounded-xl border border-[#E2E8F0] bg-[#F8FAFC]">
          <div className="flex flex-wrap items-center justify-between gap-4 p-5">
            <div className="flex items-start gap-3.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#A7F3D0] bg-[#ECFDF5] text-[#059669]">
                <CalendarCheck className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-[15px] font-semibold text-[#0F172A]">Google Calendar</p>
                <p className="mt-0.5 text-[14px] text-[#475569]">
                  Allows MedBay AI Chat to schedule doctor appointments directly on your primary
                  calendar.
                </p>
              </div>
            </div>
            <Badge variant={user.googleScopesValid ? "ready" : "attention"}>
              {user.googleScopesValid ? "Active" : "Reconnect Needed"}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 p-5">
            <div className="flex items-start gap-3.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]">
                <Mail className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-[15px] font-semibold text-[#0F172A]">
                  24-Hour Gmail Medical Scanner
                </p>
                <p className="mt-0.5 text-[14px] text-[#475569]">
                  Read-only scan for lab notices and clinic updates. Alerts arrive in-app and via
                  Web Push (zero outbound emails).
                </p>
                <p className="mt-1.5 font-mono text-xs text-[#64748B] tabular-nums">
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
                className="relative h-6 w-11 shrink-0 cursor-pointer rounded-full border border-[#CBD5E1] bg-[#E2E8F0] transition-colors data-[state=checked]:border-[#059669] data-[state=checked]:bg-[#059669]"
              >
                <Switch.Thumb className="block h-5 w-5 translate-x-0.5 rounded-full bg-white shadow-xs transition-transform data-[state=checked]:translate-x-[21px]" />
              </Switch.Root>
            </div>
          </div>
        </div>
      </Card>

      {/* Section 3: Session & Account Erasure */}
      <Card className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-[18px] font-semibold text-[#0F172A]">Account Session</h2>
          <p className="mt-1 text-[15px] text-[#475569]">
            Manage your active browser session or permanently erase your encrypted vault.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" disabled={isPending} onClick={handleSignOut}>
            <LogOut className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
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
            <Trash2 className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
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
              <span>Cancel</span>
            </Button>
            <Button
              variant="destructive"
              disabled={deleteConfirmText !== "DELETE"}
              isLoading={isPending}
              loadingLabel="Deleting Account..."
              onClick={handleDeleteAccount}
            >
              <span>Permanently Delete Vault</span>
            </Button>
          </div>
        </div>
      </ModalOrSheet>
    </div>
  );
}
