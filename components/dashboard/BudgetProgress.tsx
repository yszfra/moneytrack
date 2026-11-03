'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatRupiah, cn } from '@/lib/utils'

interface BudgetItem {
  id: string
  category: string
  spent: number
  budget: number
}

const dummyBudgets: BudgetItem[] = [
  { id: '1', category: 'Makan & Minum', spent: 800000, budget: 1200000 },
  { id: '2', category: 'Transportasi', spent: 550000, budget: 600000 },
  { id: '3', category: 'Utilitas', spent: 850000, budget: 800000 },
  { id: '4', category: 'Hiburan', spent: 350000, budget: 400000 },
  { id: '5', category: 'Belanja', spent: 750000, budget: 800000 },
]

function getPercentage(spent: number, budget: number): number {
  return Math.round((spent / budget) * 100)
}

function getStatusColor(percentage: number): string {
  if (percentage < 70) return 'bg-emerald-500'
  if (percentage < 90) return 'bg-yellow-500'
  return 'bg-red-500'
}

function getStatusBgColor(percentage: number): string {
  if (percentage < 70) return 'bg-emerald-500/10'
  if (percentage < 90) return 'bg-yellow-500/10'
  return 'bg-red-500/10'
}

function getStatusTextColor(percentage: number): string {
  if (percentage < 70) return 'text-emerald-500'
  if (percentage < 90) return 'text-yellow-500'
  return 'text-red-500'
}

export function BudgetProgress() {
  return (
    <Card className='border-gray-700 bg-gray-800 dark:border-gray-700 dark:bg-gray-900'>
      <CardHeader>
        <CardTitle className='text-gray-100'>Progress Anggaran</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-6'>
          {dummyBudgets.map((budget) => {
            const percentage = getPercentage(budget.spent, budget.budget)
            return (
              <div key={budget.id} className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm font-medium text-gray-300'>{budget.category}</span>
                  <span className={cn('text-sm font-semibold', getStatusTextColor(percentage))}>{percentage}%</span>
                </div>
                <div className='w-full overflow-hidden rounded-full bg-gray-700'>
                  <div
                    className={cn('h-2 transition-all duration-300', getStatusColor(percentage))}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
                <div className='flex items-center justify-between text-xs text-gray-400'>
                  <span>{formatRupiah(budget.spent)}</span>
                  <span>Anggaran: {formatRupiah(budget.budget)}</span>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
