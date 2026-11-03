'use client'

import { cn } from '@/lib/utils'

interface TabsProps {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
  className?: string
}

interface TabsListProps {
  children: React.ReactNode
  className?: string
}

interface TabsTriggerProps {
  value: string
  children: React.ReactNode
  className?: string
}

interface TabsContentProps {
  value: string
  children: React.ReactNode
  className?: string
}

const TabsContext = ({ value, onValueChange, children, className }: TabsProps) => {
  return (
    <div className={className}>
      {typeof children === 'function' ? children : children}
    </div>
  )
}

const Tabs = ({ value, onValueChange, children, className }: TabsProps) => {
  return (
    <TabsContext value={value} onValueChange={onValueChange} className={className}>
      {children}
    </TabsContext>
  )
}

const TabsList = ({ children, className }: TabsListProps) => {
  return (
    <div
      className={cn(
        'inline-flex h-10 items-center justify-center rounded-lg bg-gray-800 p-1 text-gray-400',
        className
      )}
    >
      {children}
    </div>
  )
}

const TabsTrigger = ({ value, children, className }: TabsTriggerProps) => {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        className
      )}
    >
      {children}
    </button>
  )
}

const TabsContent = ({ value, children, className }: TabsContentProps) => {
  return (
    <div className={cn('mt-2', className)}>
      {children}
    </div>
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
