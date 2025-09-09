import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted/50", className)}
      {...props}
    />
  )
}

// Enhanced NFT Card Skeleton with shimmer effect
function NFTCardSkeleton() {
  return (
    <div className="bg-card/30 border border-border/50 backdrop-blur-sm rounded-lg overflow-hidden group">
      <div className="relative aspect-square overflow-hidden">
        <Skeleton className="w-full h-full" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </div>
      <div className="p-4 space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-12" />
          </div>
        </div>
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    </div>
  )
}

// Enhanced Stats Card Skeleton
function StatsCardSkeleton() {
  return (
    <div className="bg-card/30 border border-border/50 backdrop-blur-sm rounded-lg p-6 group">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-24" />
        </div>
        <Skeleton className="h-6 w-12 rounded-full" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
    </div>
  )
}

// Enhanced Activity Item Skeleton
function ActivitySkeleton() {
  return (
    <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg group">
      <div className="flex items-center gap-3">
        <Skeleton className="w-2 h-2 rounded-full" />
        <div className="space-y-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
  )
}

// New skeleton components for better UX
function MarketplaceSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header skeleton */}
      <div className="text-center space-y-4">
        <Skeleton className="h-12 w-96 mx-auto" />
        <Skeleton className="h-6 w-80 mx-auto" />
      </div>
      
      {/* Stats skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <StatsCardSkeleton key={index} />
        ))}
      </div>
      
      {/* Filters skeleton */}
      <div className="bg-card/50 border border-border/50 backdrop-blur-sm rounded-lg p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <Skeleton className="h-10 flex-1" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-8 w-20" />
            ))}
          </div>
        </div>
      </div>
      
      {/* NFT Grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <NFTCardSkeleton key={index} />
        ))}
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-5 w-64" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-28" />
        </div>
      </div>
      
      {/* Tabs skeleton */}
      <div className="flex gap-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-10 w-24" />
        ))}
      </div>
      
      {/* Content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  )
}

function FormSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-5 w-96" />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="bg-card/50 border border-border/50 backdrop-blur-sm rounded-lg p-6">
              <Skeleton className="h-6 w-48 mb-4" />
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, fieldIndex) => (
                  <div key={fieldIndex} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="space-y-6">
          <div className="bg-card/50 border border-border/50 backdrop-blur-sm rounded-lg p-6">
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="aspect-square w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  )
}

// Loading spinner component
function LoadingSpinner({ size = "default", className }: { size?: "sm" | "default" | "lg", className?: string }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    default: "w-6 h-6", 
    lg: "w-8 h-8"
  }
  
  return (
    <div className={cn("animate-spin rounded-full border-2 border-current border-t-transparent", sizeClasses[size], className)} />
  )
}

// Progress bar component
function ProgressBar({ value, max = 100, className }: { value: number, max?: number, className?: string }) {
  const percentage = Math.min((value / max) * 100, 100)
  
  return (
    <div className={cn("w-full bg-muted/50 rounded-full h-2 overflow-hidden", className)}>
      <div 
        className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500 ease-out"
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}

export { 
  Skeleton, 
  NFTCardSkeleton, 
  StatsCardSkeleton, 
  ActivitySkeleton,
  MarketplaceSkeleton,
  DashboardSkeleton,
  FormSkeleton,
  LoadingSpinner,
  ProgressBar
}