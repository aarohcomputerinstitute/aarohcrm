import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-gray-200/80", className)}
      {...props}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="card p-6 shadow-sm border border-gray-100 flex items-center gap-4">
      <Skeleton className="w-12 h-12 rounded-xl" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-6 w-16" />
      </div>
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <div className="flex items-center gap-4 px-4 py-4 border-b border-gray-100 last:border-0">
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-6 w-20 rounded-full" />
      <Skeleton className="h-4 w-12" />
    </div>
  );
}
