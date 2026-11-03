'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const dummyData = [
  { month: 'Jun', income: 8000000, expense: 2500000 },
  { month: 'Jul', income: 8500000, expense: 2800000 },
  { month: 'Agt', income: 7800000, expense: 2300000 },
  { month: 'Sep', income: 9200000, expense: 3100000 },
  { month: 'Okt', income: 8700000, expense: 2900000 },
  { month: 'Nov', income: 9500000, expense: 3500000 },
]

export function IncomeExpenseChart() {
  return (
    <Card className='border-gray-700 bg-gray-800 dark:border-gray-700 dark:bg-gray-900'>
      <CardHeader>
        <CardTitle className='text-gray-100'>Pemasukan vs Pengeluaran</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width='100%' height={300}>
          <AreaChart data={dummyData}>
            <defs>
              <linearGradient id='colorIncome' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='5%' stopColor='#10b981' stopOpacity={0.8} />
                <stop offset='95%' stopColor='#10b981' stopOpacity={0} />
              </linearGradient>
              <linearGradient id='colorExpense' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='5%' stopColor='#ef4444' stopOpacity={0.8} />
                <stop offset='95%' stopColor='#ef4444' stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray='3 3' stroke='#374151' />
            <XAxis dataKey='month' stroke='#9ca3af' />
            <YAxis stroke='#9ca3af' />
            <Tooltip
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '0.5rem' }}
              labelStyle={{ color: '#f3f4f6' }}
              formatter={(value: any) => value.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}
            />
            <Area type='monotone' dataKey='income' stroke='#10b981' fillOpacity={1} fill='url(#colorIncome)' name='Pemasukan' />
            <Area type='monotone' dataKey='expense' stroke='#ef4444' fillOpacity={1} fill='url(#colorExpense)' name='Pengeluaran' />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
