'use client'

import { useState } from 'react'
import { formatRupiah, cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer
} from 'recharts'
import {
  TrendingUp, TrendingDown, DollarSign, FileText, FileSpreadsheet,
  ArrowUpRight, ArrowDownRight
} from 'lucide-react'

const monthlyData = [
  { name: 'Jan', pemasukan: 8500000, pengeluaran: 6200000 },
  { name: 'Feb', pemasukan: 9000000, pengeluaran: 5800000 },
  { name: 'Mar', pemasukan: 8800000, pengeluaran: 7100000 },
  { name: 'Apr', pemasukan: 9500000, pengeluaran: 6500000 },
  { name: 'Mei', pemasukan: 10000000, pengeluaran: 6800000 },
  { name: 'Jun', pemasukan: 9200000, pengeluaran: 7200000 },
  { name: 'Jul', pemasukan: 11000000, pengeluaran: 7500000 },
  { name: 'Agu', pemasukan: 10500000, pengeluaran: 6900000 },
  { name: 'Sep', pemasukan: 9800000, pengeluaran: 7300000 },
  { name: 'Okt', pemasukan: 10200000, pengeluaran: 7000000 },
  { name: 'Nov', pemasukan: 10800000, pengeluaran: 7400000 },
  { name: 'Des', pemasukan: 12000000, pengeluaran: 9000000 },
]

const weeklyData = [
  { name: 'Sen', pemasukan: 2500000, pengeluaran: 1200000 },
  { name: 'Sel', pemasukan: 1800000, pengeluaran: 900000 },
  { name: 'Rab', pemasukan: 2200000, pengeluaran: 1500000 },
  { name: 'Kam', pemasukan: 1500000, pengeluaran: 800000 },
  { name: 'Jum', pemasukan: 3000000, pengeluaran: 2000000 },
  { name: 'Sab', pemasukan: 500000, pengeluaran: 1800000 },
  { name: 'Min', pemasukan: 0, pengeluaran: 1200000 },
]

const dailyData = [
  { name: '00:00', pemasukan: 0, pengeluaran: 0 },
  { name: '06:00', pemasukan: 0, pengeluaran: 50000 },
  { name: '09:00', pemasukan: 500000, pengeluaran: 150000 },
  { name: '12:00', pemasukan: 0, pengeluaran: 250000 },
  { name: '15:00', pemasukan: 1000000, pengeluaran: 100000 },
  { name: '18:00', pemasukan: 0, pengeluaran: 300000 },
  { name: '21:00', pemasukan: 0, pengeluaran: 150000 },
]

const yearlyData = [
  { name: '2020', pemasukan: 96000000, pengeluaran: 72000000 },
  { name: '2021', pemasukan: 108000000, pengeluaran: 84000000 },
  { name: '2022', pemasukan: 120000000, pengeluaran: 90000000 },
  { name: '2023', pemasukan: 132000000, pengeluaran: 96000000 },
  { name: '2024', pemasukan: 140000000, pengeluaran: 100000000 },
]

const categoryExpenses = [
  { name: 'Makanan', value: 3200000 },
  { name: 'Transport', value: 1500000 },
  { name: 'Hiburan', value: 800000 },
  { name: 'Belanja', value: 1200000 },
  { name: 'Tagihan', value: 2000000 },
  { name: 'Kesehatan', value: 500000 },
  { name: 'Pendidikan', value: 1000000 },
]

const comparisonData = [
  { kategori: 'Makanan', bulanIni: 3200000, bulanLalu: 2800000 },
  { kategori: 'Transport', bulanIni: 1500000, bulanLalu: 1600000 },
  { kategori: 'Hiburan', bulanIni: 800000, bulanLalu: 1200000 },
  { kategori: 'Belanja', bulanIni: 1200000, bulanLalu: 900000 },
  { kategori: 'Tagihan', bulanIni: 2000000, bulanLalu: 2000000 },
  { kategori: 'Kesehatan', bulanIni: 500000, bulanLalu: 300000 },
  { kategori: 'Pendidikan', bulanIni: 1000000, bulanLalu: 1000000 },
]

type Period = 'harian' | 'mingguan' | 'bulanan' | 'tahunan'

export default function ReportsPage() {
  const [activePeriod, setActivePeriod] = useState<Period>('bulanan')

  const periods: { key: Period; label: string }[] = [
    { key: 'harian', label: 'Harian' },
    { key: 'mingguan', label: 'Mingguan' },
    { key: 'bulanan', label: 'Bulanan' },
    { key: 'tahunan', label: 'Tahunan' },
  ]

  const getChartData = () => {
    switch (activePeriod) {
      case 'harian': return dailyData
      case 'mingguan': return weeklyData
      case 'bulanan': return monthlyData
      case 'tahunan': return yearlyData
    }
  }

  const totalIncome = 10800000
  const totalExpense = 7400000
  const net = totalIncome - totalExpense

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Laporan & Analitik</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => console.log('Export PDF')}>
            <FileText className="mr-2 h-4 w-4" />
            Ekspor PDF
          </Button>
          <Button variant="outline" onClick={() => console.log('Export Excel')}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Ekspor Excel
          </Button>
        </div>
      </div>

      {/* Period Tabs */}
      <div className="inline-flex items-center rounded-lg bg-gray-800 p-1 mb-6">
        {periods.map((period) => (
          <button
            key={period.key}
            onClick={() => setActivePeriod(period.key)}
            className={cn(
              'rounded-md px-4 py-2 text-sm font-medium transition-colors',
              activePeriod === period.key
                ? 'bg-emerald-600 text-white'
                : 'text-gray-400 hover:text-white'
            )}
          >
            {period.label}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Pemasukan</p>
                <p className="text-2xl font-bold text-emerald-400">{formatRupiah(totalIncome)}</p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-500/20">
                <TrendingUp className="h-6 w-6 text-emerald-400" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm text-emerald-400">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              +12% dari bulan lalu
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Pengeluaran</p>
                <p className="text-2xl font-bold text-red-400">{formatRupiah(totalExpense)}</p>
              </div>
              <div className="p-3 rounded-lg bg-red-500/20">
                <TrendingDown className="h-6 w-6 text-red-400" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm text-red-400">
              <ArrowDownRight className="h-4 w-4 mr-1" />
              +5% dari bulan lalu
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Sisa Bersih</p>
                <p className="text-2xl font-bold text-blue-400">{formatRupiah(net)}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-500/20">
                <DollarSign className="h-6 w-6 text-blue-400" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm text-blue-400">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              +18% dari bulan lalu
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pemasukan vs Pengeluaran</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={getChartData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" tickFormatter={(v) => `${(v / 1000000).toFixed(0)}jt`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#9CA3AF' }}
                  formatter={(value: any) => [formatRupiah(Number(value) || 0)]}
                />
                <Legend />
                <Line type="monotone" dataKey="pemasukan" stroke="#10B981" strokeWidth={2} dot={{ fill: '#10B981' }} />
                <Line type="monotone" dataKey="pengeluaran" stroke="#EF4444" strokeWidth={2} dot={{ fill: '#EF4444' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pengeluaran per Kategori</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryExpenses}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" tickFormatter={(v) => `${(v / 1000000).toFixed(1)}jt`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                  formatter={(value: any) => [formatRupiah(Number(value) || 0)]}
                />
                <Bar dataKey="value" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Perbandingan: Bulan Ini vs Bulan Lalu</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-400">Kategori</th>
                  <th className="text-right py-3 px-4 text-gray-400">Bulan Ini</th>
                  <th className="text-right py-3 px-4 text-gray-400">Bulan Lalu</th>
                  <th className="text-right py-3 px-4 text-gray-400">Selisih</th>
                  <th className="text-right py-3 px-4 text-gray-400">Perubahan</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((item, index) => {
                  const diff = item.bulanIni - item.bulanLalu
                  const pctChange = item.bulanLalu > 0 ? ((diff / item.bulanLalu) * 100).toFixed(1) : '0'
                  const isUp = diff > 0

                  return (
                    <tr key={index} className="border-b border-gray-800">
                      <td className="py-3 px-4 font-medium">{item.kategori}</td>
                      <td className="text-right py-3 px-4">{formatRupiah(item.bulanIni)}</td>
                      <td className="text-right py-3 px-4">{formatRupiah(item.bulanLalu)}</td>
                      <td className={cn('text-right py-3 px-4', isUp ? 'text-red-400' : diff < 0 ? 'text-emerald-400' : 'text-gray-400')}>
                        {diff !== 0 ? (isUp ? '+' : '') + formatRupiah(diff) : '-'}
                      </td>
                      <td className={cn('text-right py-3 px-4', isUp ? 'text-red-400' : diff < 0 ? 'text-emerald-400' : 'text-gray-400')}>
                        {diff !== 0 ? `${isUp ? '+' : ''}${pctChange}%` : '-'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr className="border-t border-gray-600 font-semibold">
                  <td className="py-3 px-4">Total</td>
                  <td className="text-right py-3 px-4">
                    {formatRupiah(comparisonData.reduce((sum, i) => sum + i.bulanIni, 0))}
                  </td>
                  <td className="text-right py-3 px-4">
                    {formatRupiah(comparisonData.reduce((sum, i) => sum + i.bulanLalu, 0))}
                  </td>
                  <td className="text-right py-3 px-4 text-red-400">
                    +{formatRupiah(comparisonData.reduce((sum, i) => sum + i.bulanIni, 0) - comparisonData.reduce((sum, i) => sum + i.bulanLalu, 0))}
                  </td>
                  <td className="text-right py-3 px-4 text-red-400">
                    +{(((comparisonData.reduce((sum, i) => sum + i.bulanIni, 0) - comparisonData.reduce((sum, i) => sum + i.bulanLalu, 0)) / comparisonData.reduce((sum, i) => sum + i.bulanLalu, 0)) * 100).toFixed(1)}%
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
