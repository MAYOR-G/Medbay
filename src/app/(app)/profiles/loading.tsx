import { Skeleton } from "@/components/ui";

export default function ProfilesLoading() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Skeleton className="h-8 w-64 rounded-md" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-[140px] w-full rounded-lg" />
          <Skeleton className="h-[140px] w-full rounded-lg" />
        </div>
      </div>
      <Skeleton className="h-[220px] w-full rounded-lg" />
    </div>
  );
}
