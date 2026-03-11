import { cn } from '@/lib/utils'

interface BadgeProps {
  label: string
  variant?: 'sky' | 'green' | 'red' | 'yellow' | 'slate'
  size?: 'sm' | 'md'
  dot?: boolean
  className?: string
}

export function Badge({ label, variant = 'sky', size = 'sm', dot, className }: BadgeProps) {
  const variants = {
    sky:    'bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300',
    green:  'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300',
    red:    'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300',
    yellow: 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300',
    slate:  'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300',
  }

  const dotColors = {
    sky:    'bg-sky-500',
    green:  'bg-emerald-500',
    red:    'bg-red-500',
    yellow: 'bg-amber-500',
    slate:  'bg-slate-400',
  }

  const sizes = {
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full', dotColors[variant])} />}
      {label}
    </span>
  )
}

export function CashFlowBadge({ status }: { status: 'aman' | 'waspada' | 'perlu-hati-hati' }) {
  const config = {
    aman:            { label: '🟢 Kondisi Aman', variant: 'green' as const },
    waspada:         { label: '🟡 Waspada', variant: 'yellow' as const },
    'perlu-hati-hati': { label: '🔴 Perlu Hati-hati', variant: 'red' as const },
  }

  const { label, variant } = config[status]
  return <Badge label={label} variant={variant} size="md" />
}
