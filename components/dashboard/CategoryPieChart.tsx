'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from 'recharts'

const dummyData = [
  { name: 'Makan & Minum', value: 1200000, color: '#ef4444' },
  { name: 'Utilitas', value: 800000, color: '#f97316' },
  { name: 'Transportasi', value: 600000, color: '#eab308' },
  { name: 'Hiburan', value: 400000, color: '#22c55e' },
  { name: 'Kesehatan', value: 350000, color: '#06b6d4' },
  { name: 'Belanja', value: 800000, color: '#8b5cf6' },
  { name: 'Lainnya', value: 350000, color: '#ec4899' },
]

export function CategoryPieChart() {
  return (
    <Card className='border-gray-700 bg-gray-800 dark:border-gray-700 dark:bg-gray-900'>
      <CardHeader>
        <CardTitle className='text-gray-100'>Pengeluaran Berdasarkan Kategori</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width='100%' height={300}>
          <PieChart>
            <Pie
              data={dummyData}
              cx='50%'
              cy='50%'
              labelLine={false}
              label={({ name, percent }) => (percent ? `${name} ${(percent * 100).toFixed(0)}%` : name)}
              outerRadius={100}
              fill='#8884d8'
              dataKey='value'
            >
              {dummyData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: any) => value.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '0.5rem', color: '#f3f4f6' }}
            />
            <Legend wrapperStyle={{ color: '#d1d5db' }} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
