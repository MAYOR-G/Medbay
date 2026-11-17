import { Skeleton, TimelineRowSkeleton } from "@/components/ui";

export default function TimelineLoading() {
  return (
    <div className="mx-auto max-w-[760px] space-y-5">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48 rounded-md" />
        <Skeleton className="h-4 w-36 rounded-sm" />
      </div>
      <div className="space-y-2.5">
        <TimelineRowSkeleton />
        <TimelineRowSkeleton />
        <TimelineRowSkeleton />
        <TimelineRowSkeleton />
      </div>
    </div>
  );
}
