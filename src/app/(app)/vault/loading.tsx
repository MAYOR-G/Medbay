import { Skeleton, VaultCardSkeleton } from "@/components/ui";

export default function VaultLoading() {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Skeleton className="h-8 w-56 rounded-md" />
        <Skeleton className="h-4 w-32 rounded-sm" />
      </div>
      <Skeleton className="h-[44px] w-full rounded-md" />
      <div className="grid gap-3 md:grid-cols-2 md:gap-5">
        <VaultCardSkeleton />
        <VaultCardSkeleton />
        <VaultCardSkeleton />
        <VaultCardSkeleton />
      </div>
    </div>
  );
}
