"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck } from "lucide-react";
import { Button, Card } from "@/components/ui";
import { markNotificationsReadAction } from "@/server/actions";
import { useVaultStore } from "@/stores/use-vault-store";
import type { NotificationItemDto } from "@/types/domain.types";
import { NotificationCard } from "./NotificationCard";
import { PushOptInCard } from "./PushOptInCard";

export interface NotificationListProps {
  items: NotificationItemDto[];
  unreadCount: number;
}

export function NotificationList({ items, unreadCount }: NotificationListProps) {
  const router = useRouter();
  const addToast = useVaultStore((state) => state.addToast);
  const [isPending, startTransition] = useTransition();

  function handleMarkAllRead() {
    startTransition(async () => {
      const result = await markNotificationsReadAction({ markAll: true });
      if (result.success) {
        addToast("All notifications marked as read.", "success");
        router.refresh();
      } else {
        addToast(result.error.message, "danger");
      }
    });
  }

  return (
    <div className="mx-auto max-w-[760px] space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-[-0.015em] text-text-primary">
            Notifications
          </h1>
          <p className="mt-0.5 text-[14px] text-text-secondary tabular-nums">
            {unreadCount} unread {unreadCount === 1 ? "alert" : "alerts"}
          </p>
        </div>

        {unreadCount > 0 && (
          <Button variant="ghost" size="compact" isLoading={isPending} onClick={handleMarkAllRead}>
            <CheckCheck className="h-4 w-4" aria-hidden="true" />
            <span>Mark All Read</span>
          </Button>
        )}
      </div>

      <PushOptInCard />

      {items.length === 0 ? (
        <Card className="flex flex-col items-center px-6 py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-accent-primary-border bg-accent-primary-tint text-accent-primary">
            <Bell className="h-7 w-7" aria-hidden="true" />
          </div>
          <h2 className="mt-4 font-heading text-xl font-semibold text-text-primary">
            No new medical emails detected
          </h2>
          <p className="mt-2 max-w-[360px] text-[15px] text-text-secondary">
            MedBay automatically scans your connected Gmail every 24 hours for lab notices,
            prescriptions, and clinic updates.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <NotificationCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
