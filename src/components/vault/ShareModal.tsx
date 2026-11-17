"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, Link2, Share2, ShieldCheck, Trash2 } from "lucide-react";
import { Badge, Button, ModalOrSheet, cn } from "@/components/ui";
import { createShareLinkAction, revokeShareLinkAction } from "@/server/actions";
import { useVaultStore } from "@/stores/use-vault-store";
import type { ShareDurationPreset, ShareLinkDto } from "@/types/domain.types";

const DURATION_OPTIONS: ReadonlyArray<{
  value: ShareDurationPreset;
  label: string;
  helper: string;
}> = [
  { value: "24h", label: "24 Hours", helper: "Single visit" },
  { value: "7d", label: "7 Days", helper: "Follow-up" },
  { value: "30d", label: "30 Days", helper: "Referral" },
];

export interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentId: string;
  documentTitle: string;
  activeLinks: ShareLinkDto[];
}

function formatExpiryLabel(expiresAtIso: string): { text: string; isExpiringSoon: boolean } {
  const diffMs = new Date(expiresAtIso).getTime() - Date.now();
  if (diffMs <= 0) return { text: "Expired", isExpiringSoon: true };

  const totalMinutes = Math.floor(diffMs / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const days = Math.floor(hours / 24);

  if (days >= 1) {
    return { text: `Expires in ${days}d ${hours % 24}h`, isExpiringSoon: false };
  }
  return {
    text: `Expires in ${hours}h ${minutes}m`,
    isExpiringSoon: hours < 2,
  };
}

export function ShareModal({
  open,
  onOpenChange,
  documentId,
  documentTitle,
  activeLinks,
}: ShareModalProps) {
  const router = useRouter();
  const addToast = useVaultStore((state) => state.addToast);
  const [preset, setPreset] = useState<ShareDurationPreset>("7d");
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleGenerate() {
    startTransition(async () => {
      const result = await createShareLinkAction({
        documentId,
        durationPreset: preset,
      });

      if (result.success) {
        setGeneratedUrl(result.data.shareUrl);
        setCopiedUrl(false);
        addToast("One-click expiring share link generated.", "success");
        router.refresh();
      } else {
        addToast(result.error.message, "danger");
      }
    });
  }

  async function handleCopy(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(true);
      addToast("Share link copied to clipboard.", "success");
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch {
      addToast("Could not copy link automatically.", "warning");
    }
  }

  async function handleNativeShare(url: string) {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: `MedBay Record: ${documentTitle}`,
          text: "View this shared medical document via MedBay:",
          url,
        });
      } catch {
        // User dismissed native share sheet
      }
    } else {
      await handleCopy(url);
    }
  }

  function handleRevoke(shareLinkId: string) {
    startTransition(async () => {
      const result = await revokeShareLinkAction({ shareLinkId });
      if (result.success) {
        if (generatedUrl && generatedUrl.includes(shareLinkId)) {
          setGeneratedUrl(null);
        }
        addToast("Share link revoked immediately.", "success");
        router.refresh();
      } else {
        addToast(result.error.message, "danger");
      }
    });
  }

  return (
    <ModalOrSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Share Original Document"
      description={documentTitle}
    >
      <div className="space-y-5">
        <div className="flex items-center gap-2 rounded-md border border-accent-primary-border bg-accent-primary-tint px-3 py-2 text-[13px] font-medium text-accent-primary">
          <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>Only the raw file is shared. AI summaries and family profiles stay private.</span>
        </div>

        {/* Expiration Preset Selector */}
        <div className="space-y-2">
          <p className="text-[14px] font-semibold text-text-primary">Link Expiration</p>
          <div
            role="radiogroup"
            aria-label="Share link expiration"
            className="grid grid-cols-3 gap-2"
          >
            {DURATION_OPTIONS.map((option) => {
              const selected = preset === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setPreset(option.value)}
                  className={cn(
                    "flex min-h-[56px] flex-col items-center justify-center rounded-md border px-2 py-2 text-center transition-colors",
                    selected
                      ? "border-accent-primary bg-accent-primary-tint text-accent-primary"
                      : "border-border-hairline bg-surface text-text-secondary hover:border-border-strong",
                  )}
                >
                  <span className="text-[14px] font-semibold">{option.label}</span>
                  <span className="text-[12px] text-text-muted">{option.helper}</span>
                </button>
              );
            })}
          </div>
        </div>

        <Button
          variant="primary"
          isLoading={isPending}
          loadingLabel="Generating Link..."
          onClick={handleGenerate}
          className="w-full"
        >
          <Link2 className="h-4 w-4" aria-hidden="true" />
          <span>Generate One-Click Link</span>
        </Button>

        {/* Newly Generated Link Box */}
        {generatedUrl && (
          <div className="space-y-2.5 rounded-md border border-border-hairline bg-surface-hover p-3.5">
            <p className="text-[13px] font-semibold text-text-primary">Ready to Share</p>
            <input
              type="text"
              readOnly
              aria-label="Generated share URL"
              value={generatedUrl}
              onFocus={(e) => e.currentTarget.select()}
              className="h-[40px] w-full rounded-sm border border-border-strong bg-surface px-2.5 font-mono text-xs text-text-primary"
            />
            <div className="flex gap-2">
              <Button
                variant="primary"
                size="compact"
                onClick={() => handleCopy(generatedUrl)}
                className="flex-1"
              >
                {copiedUrl ? (
                  <Check className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Copy className="h-4 w-4" aria-hidden="true" />
                )}
                <span>{copiedUrl ? "Copied" : "Copy Link"}</span>
              </Button>
              <Button
                variant="outline"
                size="compact"
                onClick={() => handleNativeShare(generatedUrl)}
              >
                <Share2 className="h-4 w-4" aria-hidden="true" />
                <span>Share...</span>
              </Button>
            </div>
          </div>
        )}

        {/* Active Links List */}
        {activeLinks.length > 0 && (
          <div className="space-y-2 border-t border-border-hairline pt-4">
            <h3 className="text-[14px] font-semibold text-text-primary">
              Active Share Links ({activeLinks.length})
            </h3>
            <ul className="space-y-2">
              {activeLinks.map((link) => {
                const { text, isExpiringSoon } = formatExpiryLabel(link.expiresAt);
                const fullUrl =
                  typeof window !== "undefined"
                    ? `${window.location.origin}/share/${link.token}`
                    : `/share/${link.token}`;

                return (
                  <li
                    key={link.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border-hairline bg-surface px-3 py-2.5"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={isExpiringSoon ? "attention" : "neutral"}>
                          {link.durationPreset}
                        </Badge>
                        <span className="font-mono text-xs text-text-secondary tabular-nums">
                          {text}
                        </span>
                      </div>
                      <p className="font-mono text-xs text-text-muted tabular-nums">
                        {link.viewCount} {link.viewCount === 1 ? "view" : "views"}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="compact"
                        aria-label="Copy active share link"
                        onClick={() => handleCopy(fullUrl)}
                        className="px-2.5"
                      >
                        <Copy className="h-4 w-4" aria-hidden="true" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="compact"
                        disabled={isPending}
                        aria-label="Revoke share link"
                        onClick={() => handleRevoke(link.id)}
                        className="px-2.5 text-status-danger-text hover:bg-status-danger-bg hover:text-status-danger-text"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                        <span>Revoke</span>
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </ModalOrSheet>
  );
}
