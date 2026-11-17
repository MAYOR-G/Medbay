"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, ExternalLink, FileDown, Mail, Paperclip, Trash2 } from "lucide-react";
import { Badge, Button, Card } from "@/components/ui";
import {
  dismissNotificationAction,
  importGmailAttachmentAction,
  markNotificationsReadAction,
} from "@/server/actions";
import { useVaultStore } from "@/stores/use-vault-store";
import type { NotificationItemDto } from "@/types/domain.types";

export interface NotificationCardProps {
  item: NotificationItemDto;
}

export function NotificationCard({ item }: NotificationCardProps) {
  const router = useRouter();
  const addToast = useVaultStore((state) => state.addToast);
  const [isPending, startTransition] = useTransition();

  function handleMarkRead() {
    startTransition(async () => {
      const result = await markNotificationsReadAction({ notificationId: item.id });
      if (result.success) {
        router.refresh();
      } else {
        addToast(result.error.message, "danger");
      }
    });
  }

  function handleImport() {
    startTransition(async () => {
      const result = await importGmailAttachmentAction({ notificationId: item.id });
      if (result.success) {
        addToast(
          `Imported ${result.data.importedDocuments.length} attachment(s) into your vault.`,
          "success",
        );
        router.refresh();
      } else {
        addToast(result.error.message, "danger");
      }
    });
  }

  function handleDismiss() {
    startTransition(async () => {
      const result = await dismissNotificationAction({ notificationId: item.id });
      if (result.success) {
        addToast("Notification dismissed.", "success");
        router.refresh();
      } else {
        addToast(result.error.message, "danger");
      }
    });
  }

  return (
    <Card className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2.5">
          {!item.isRead && (
            <span
              aria-label="Unread notification"
              className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-accent-primary"
            />
          )}
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="info">
                <Mail className="h-3 w-3" aria-hidden="true" />
                <span>Gmail Medical Scan</span>
              </Badge>
              {item.hasAttachments && (
                <Badge variant="neutral">
                  <Paperclip className="h-3 w-3" aria-hidden="true" />
                  <span>Attachment</span>
                </Badge>
              )}
            </div>
            <h3 className="text-[16px] font-semibold text-text-primary">
              {item.emailSubject ?? item.title}
            </h3>
            {item.emailSender && (
              <p className="truncate font-mono text-xs text-text-muted">{item.emailSender}</p>
            )}
          </div>
        </div>

        <span className="shrink-0 font-mono text-xs text-text-muted tabular-nums">
          {item.createdAt.slice(0, 10)}
        </span>
      </div>

      <p className="text-[14px] text-text-secondary">{item.body}</p>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border-hairline pt-3">
        <div className="flex flex-wrap items-center gap-2">
          {item.importedDocumentId ? (
            <Link
              href={`/vault/${item.importedDocumentId}`}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-md border border-status-success-border bg-status-success-bg px-3 text-[13px] font-semibold text-status-success-text hover:underline"
            >
              <span>View Imported Record</span>
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          ) : (
            item.hasAttachments && (
              <Button
                variant="secondary"
                size="compact"
                isLoading={isPending}
                loadingLabel="Importing..."
                onClick={handleImport}
              >
                <FileDown className="h-4 w-4" aria-hidden="true" />
                <span>Import to Vault</span>
              </Button>
            )
          )}

          {!item.isRead && (
            <Button variant="ghost" size="compact" disabled={isPending} onClick={handleMarkRead}>
              <Check className="h-4 w-4" aria-hidden="true" />
              <span>Mark Read</span>
            </Button>
          )}
        </div>

        <Button
          variant="ghost"
          size="compact"
          disabled={isPending}
          aria-label="Dismiss notification"
          onClick={handleDismiss}
          className="text-text-muted hover:bg-status-danger-bg hover:text-status-danger-text"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          <span>Dismiss</span>
        </Button>
      </div>
    </Card>
  );
}
