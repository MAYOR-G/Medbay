import { Skeleton } from "@/components/ui";

export default function NotificationsLoading() {
  return (
    <div className="w-full space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-9 w-48 rounded-lg" />
        <Skeleton className="h-4 w-64 rounded-md" />
      </div>
      <Skeleton className="h-[88px] w-full rounded-2xl" />
      <Skeleton className="h-[132px] w-full rounded-2xl" />
      <Skeleton className="h-[132px] w-full rounded-2xl" />
    </div>
  );
}
