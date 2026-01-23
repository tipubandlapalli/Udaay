interface SkeletonProps {
  className?: string;
  shimmer?: boolean;
}

export const Skeleton = ({ className = "", shimmer = true }: SkeletonProps) => {
  return (
    <div 
      className={`${shimmer ? 'skeleton-shimmer' : 'skeleton'} ${className}`}
      aria-label="Loading..."
    />
  );
};

export const IssueCardSkeleton = () => {
  return (
    <div className="card-civic flex gap-4 animate-pulse">
      <Skeleton className="w-24 h-24 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2.5 py-1">
        <Skeleton className="h-4 w-3/4 rounded-lg" />
        <Skeleton className="h-3 w-1/3 rounded-lg" />
        <div className="flex gap-2 mt-3">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-12 rounded-full" />
        </div>
        <Skeleton className="h-3 w-20 rounded-lg" />
      </div>
    </div>
  );
};

export const CategoryCardSkeleton = () => {
  return (
    <div className="card-civic flex items-center gap-3.5 min-w-[150px] animate-pulse">
      <Skeleton className="w-11 h-11 rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-5 w-12 rounded" />
        <Skeleton className="h-3 w-16 rounded" />
      </div>
    </div>
  );
};

export const QuickActionSkeleton = () => {
  return (
    <div className="card-civic flex flex-col items-center gap-2.5 py-5 animate-pulse">
      <Skeleton className="w-12 h-12 rounded-2xl" />
      <Skeleton className="h-3 w-16 rounded" />
    </div>
  );
};
