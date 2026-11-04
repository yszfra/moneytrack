'use client'

import { cn } from '@/lib/utils'

export function LoadingSpinner({ className = '' }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className="relative w-8 h-8">
        <div className="absolute inset-0 rounded-full border-4 border-slate-700 dark:border-slate-300"></div>
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin"></div>
      </div>
    </div>
  )
}

export function LoadingPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        <LoadingSpinner />
        <p className="text-gray-500 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  )
}

export function LoadingOverlay() {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-900 rounded-lg p-6 space-y-4">
        <LoadingSpinner />
        <p className="text-gray-600 dark:text-gray-300">Processing...</p>
      </div>
    </div>
  )
}
