'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatRupiah, cn } from '@/lib/utils'
import { ArrowUp, ArrowDown, LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: number
  icon: LucideIcon
  change: number
  trend: 'up' | 'down'
}

export function StatCard({ title, value, icon: Icon, change, trend }: StatCardProps) {
  const isTrendUp = trend === 'up'
  const trendColor = isTrendUp ? 'text-emerald-500' : 'text-red-500'
  const bgColor = isTrendUp ? 'bg-emerald-500/10' : 'bg-red-500/10'

  return (
    <Card className='border-gray-700 bg-gray-800 dark:border-gray-700 dark:bg-gray-900'>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <CardTitle className='text-sm font-medium text-gray-400'>{title}</CardTitle>
        <div className={cn('rounded-lg p-2', bgColor)}>
          <Icon className='h-4 w-4 text-gray-300' />
        </div>
      </CardHeader>
      <CardContent>
        <div className='text-2xl font-bold text-gray-100'>{formatRupiah(value)}</div>
        <p className={cn('text-xs font-medium', trendColor)}>
          <span className='inline-flex items-center gap-1'>
            {isTrendUp ? <ArrowUp className='h-3 w-3' /> : <ArrowDown className='h-3 w-3' />}
            {Math.abs(change)}% dari bulan lalu
          </span>
        </p>
      </CardContent>
    </Card>
  )
}
