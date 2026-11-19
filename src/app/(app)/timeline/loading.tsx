import { Skeleton, TimelineRowSkeleton } from "@/components/ui";

export default function TimelineLoading() {
  return (
    <div className="w-full space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-9 w-56 rounded-lg" />
        <Skeleton className="h-4 w-72 rounded-md" />
      </div>
      <div className="space-y-3">
        <TimelineRowSkeleton />
        <TimelineRowSkeleton />
        <TimelineRowSkeleton />
        <TimelineRowSkeleton />
      </div>
    </div>
  );
}
