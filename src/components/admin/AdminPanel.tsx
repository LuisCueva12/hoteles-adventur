import type { ReactNode } from 'react'
import { cn } from './cn'

export function AdminPanel({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <section className={cn('admin-panel', className)}>{children}</section>
}
