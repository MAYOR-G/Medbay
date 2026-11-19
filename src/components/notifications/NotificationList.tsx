"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCheck } from "lucide-react";
import { Button, Card, EmptyStateIllustration } from "@/components/ui";
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
    <div className="w-full space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-[28px] leading-[1.2] font-bold tracking-[-0.02em] text-[#0F172A]">
            Notifications
          </h1>
          <p className="mt-1.5 text-[15px] text-[#475569] tabular-nums">
            {unreadCount} unread {unreadCount === 1 ? "alert" : "alerts"} from automated 24-hour
            Gmail medical scans
          </p>
        </div>

        {unreadCount > 0 && (
          <Button variant="outline" isLoading={isPending} onClick={handleMarkAllRead}>
            <CheckCheck className="h-[18px] w-[18px] shrink-0 text-[#059669]" aria-hidden="true" />
            <span>Mark All Read</span>
          </Button>
        )}
      </div>

      <PushOptInCard />

      {items.length === 0 ? (
        <Card className="flex flex-col items-center px-6 py-14 text-center">
          <EmptyStateIllustration variant="notifications" />
          <h2 className="mt-4 font-heading text-lg font-semibold text-[#0F172A]">
            No new medical emails detected
          </h2>
          <p className="mt-2 max-w-md text-[15px] text-[#475569]">
            MedBay automatically scans your connected Gmail every 24 hours for lab notices,
            prescriptions, and clinic updates.
          </p>
        </Card>
      ) : (
        <div className="space-y-3.5">
          {items.map((item) => (
            <NotificationCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
