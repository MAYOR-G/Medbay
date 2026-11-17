import { Skeleton } from "@/components/ui";

export default function NotificationsLoading() {
  return (
    <div className="mx-auto max-w-[760px] space-y-5">
      <div className="space-y-2">
        <Skeleton className="h-8 w-44 rounded-md" />
        <Skeleton className="h-4 w-28 rounded-sm" />
      </div>
      <Skeleton className="h-[88px] w-full rounded-lg" />
      <Skeleton className="h-[132px] w-full rounded-lg" />
      <Skeleton className="h-[132px] w-full rounded-lg" />
    </div>
  );
}
