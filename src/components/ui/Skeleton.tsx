import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-xl bg-linear-to-r from-slate-100 via-slate-200 to-slate-100 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 bg-size-[200%_100%]',
        className
      )}
      style={{
        animation: 'shimmer 1.5s infinite',
      }}
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-slate-800/60 rounded-2xl p-5 border border-sky-100 dark:border-slate-700/60 space-y-3">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  )
}

export function SkeletonTransactionItem() {
  return (
    <div className="flex items-center gap-3 py-3 px-4">
      <Skeleton className="w-10 h-10 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
      </div>
      <Skeleton className="h-4 w-16" />
    </div>
  )
}
