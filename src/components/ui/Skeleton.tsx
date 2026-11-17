import { cn } from "./cn";

export interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "animate-pulse rounded-lg border border-border-hairline bg-surface-subtle",
        className,
      )}
    />
  );
}

export function VaultCardSkeleton() {
  return <Skeleton className="h-[112px] w-full" />;
}

export function TimelineRowSkeleton() {
  return <Skeleton className="h-[64px] w-full rounded-md" />;
}
