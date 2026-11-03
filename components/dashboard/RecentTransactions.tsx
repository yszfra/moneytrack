'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatRupiah, cn } from '@/lib/utils'
import { ShoppingCart, Coffee, Zap, Utensils, Briefcase } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

interface Transaction {
  id: string
  category: string
  description: string
  amount: number
  date: Date
  type: 'income' | 'expense'
  icon: React.ReactNode
}

const dummyTransactions: Transaction[] = [
  {
    id: '1',
    category: 'Belanja',
    description: 'Belanja kebutuhan rumah',
    amount: 150000,
    date: new Date(2026, 10, 1),
    type: 'expense',
    icon: <ShoppingCart className='h-4 w-4' />,
  },
  {
    id: '2',
    category: 'Kopi',
    description: 'Kopi pagi di kafe',
    amount: 45000,
    date: new Date(2026, 10, 2),
    type: 'expense',
    icon: <Coffee className='h-4 w-4' />,
  },
  {
    id: '3',
    category: 'Listrik',
    description: 'Tagihan listrik bulanan',
    amount: 350000,
    date: new Date(2026, 10, 3),
    type: 'expense',
    icon: <Zap className='h-4 w-4' />,
  },
  {
    id: '4',
    category: 'Makan',
    description: 'Makan siang di restoran',
    amount: 85000,
    date: new Date(2026, 9, 28),
    type: 'expense',
    icon: <Utensils className='h-4 w-4' />,
  },
  {
    id: '5',
    category: 'Gaji',
    description: 'Gaji bulanan',
    amount: 8000000,
    date: new Date(2026, 9, 30),
    type: 'income',
    icon: <Briefcase className='h-4 w-4' />,
  },
]

export function RecentTransactions() {
  return (
    <Card className='border-gray-700 bg-gray-800 dark:border-gray-700 dark:bg-gray-900'>
      <CardHeader>
        <CardTitle className='text-gray-100'>Transaksi Terbaru</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {dummyTransactions.map((transaction) => (
            <div key={transaction.id} className='flex items-center justify-between border-b border-gray-700 pb-3 last:border-b-0'>
              <div className='flex items-center gap-3'>
                <div className='rounded-lg bg-gray-700 p-2'>{transaction.icon}</div>
                <div>
                  <p className='text-sm font-medium text-gray-200'>{transaction.description}</p>
                  <p className='text-xs text-gray-400'>{format(transaction.date, 'dd MMM yyyy', { locale: id })}</p>
                </div>
              </div>
              <div className={cn('text-right text-sm font-semibold', transaction.type === 'income' ? 'text-emerald-500' : 'text-red-500')}>
                {transaction.type === 'income' ? '+' : '-'}
                {formatRupiah(transaction.amount)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
