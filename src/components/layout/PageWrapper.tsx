import { cn } from '@/lib/utils'

interface PageWrapperProps {
  children: React.ReactNode
  className?: string
  withBottomNav?: boolean
}

export function PageWrapper({ children, className, withBottomNav = true }: PageWrapperProps) {
  return (
    <main
      className={cn(
        'min-h-dvh max-w-lg mx-auto w-full',
        withBottomNav && 'pb-24',
        className
      )}
    >
      {children}
    </main>
  )
}
