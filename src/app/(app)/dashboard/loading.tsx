import { Skeleton } from "@/components/ui";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-9 w-56 rounded-[8px]" />
          <Skeleton className="h-4 w-72 rounded-[6px]" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-36 rounded-[8px]" />
          <Skeleton className="h-10 w-40 rounded-[8px]" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <Skeleton className="h-[112px] rounded-[12px]" />
        <Skeleton className="h-[112px] rounded-[12px]" />
        <Skeleton className="h-[112px] rounded-[12px]" />
        <Skeleton className="h-[112px] rounded-[12px]" />
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <Skeleton className="h-[136px] rounded-[12px]" />
          <Skeleton className="h-[360px] rounded-[12px]" />
        </div>
        <div className="space-y-6 lg:col-span-4">
          <Skeleton className="h-[280px] rounded-[12px]" />
          <Skeleton className="h-[200px] rounded-[12px]" />
        </div>
      </div>
    </div>
  );
}
