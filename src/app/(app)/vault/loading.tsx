import { Skeleton } from "@/components/ui";

export default function VaultLoading() {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Skeleton className="h-9 w-64 rounded-[8px]" />
        <Skeleton className="h-4 w-80 rounded-[6px]" />
      </div>
      <Skeleton className="h-[78px] w-full rounded-[12px]" />
      <Skeleton className="h-[44px] w-full rounded-[10px]" />
      <div className="overflow-hidden rounded-[12px] border border-border-hairline bg-surface">
        <div className="divide-y divide-border-hairline">
          <div className="p-4">
            <Skeleton className="h-11 w-full rounded-[8px]" />
          </div>
          <div className="p-4">
            <Skeleton className="h-11 w-full rounded-[8px]" />
          </div>
          <div className="p-4">
            <Skeleton className="h-11 w-full rounded-[8px]" />
          </div>
          <div className="p-4">
            <Skeleton className="h-11 w-full rounded-[8px]" />
          </div>
        </div>
      </div>
    </div>
  );
}
