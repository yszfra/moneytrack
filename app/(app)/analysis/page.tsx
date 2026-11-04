'use client'

import { useEffect, useState } from 'react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { cn, formatRupiah, formatDate } from '@/lib/utils'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { LoadingSpinner } from '@/components/ui/Loading'
import { getTransactions, getCategories, getFinancialSummary, getSavingsGoals, getBudgets } from '@/lib/store'
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  Target,
  BarChart3,
  LineChart as LineChartIcon,
  ChevronLeft,
  ChevronRight,
  Calendar,
  DollarSign,
  PieChart as PieChartIcon,
} from 'lucide-react'

type Period = 'daily' | 'weekly' | 'monthly' | 'yearly'

const PERIOD_LABELS: Record<Period, string> = {
  daily: 'Harian',
  weekly: 'Mingguan',
  monthly: 'Bulanan',
  yearly: 'Tahunan',
}

const CHART_COLORS = [
  '#2563EB',
  '#3B82F6',
  '#60A5FA',
  '#93C5FD',
  '#DBEAFE',
  '#F59E0B',
  '#EF4444',
  '#EC4899',
  '#8B5CF6',
  '#06B6D4',
]

function getDateKey(date: Date, period: Period): string {
  switch (period) {
    case 'daily':
      return date.toISOString().split('T')[0]
    case 'weekly': {
      const d = new Date(date)
      const day = d.getDay()
      d.setDate(d.getDate() - day)
      return d.toISOString().split('T')[0]
    }
    case 'monthly':
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    case 'yearly':
      return String(date.getFullYear())
  }
}

function getPeriodStart(date: Date, period: Period): Date {
  const d = new Date(date)
  switch (period) {
    case 'daily':
      d.setHours(0, 0, 0, 0)
      break
    case 'weekly': {
      const day = d.getDay()
      d.setDate(d.getDate() - day)
      d.setHours(0, 0, 0, 0)
      break
    }
    case 'monthly':
      d.setDate(1)
      d.setHours(0, 0, 0, 0)
      break
    case 'yearly':
      d.setMonth(0, 1)
      d.setHours(0, 0, 0, 0)
      break
  }
  return d
}

function getPeriodEnd(date: Date, period: Period): Date {
  const d = new Date(date)
  switch (period) {
    case 'daily':
      d.setHours(23, 59, 59, 999)
      break
    case 'weekly': {
      const day = d.getDay()
      d.setDate(d.getDate() + (6 - day))
      d.setHours(23, 59, 59, 999)
      break
    }
    case 'monthly':
      d.setMonth(d.getMonth() + 1, 0)
      d.setHours(23, 59, 59, 999)
      break
    case 'yearly':
      d.setMonth(11, 31)
      d.setHours(23, 59, 59, 999)
      break
  }
  return d
}

function generatePeriodLabels(startDate: Date, period: Period, count: number): string[] {
  const labels: string[] = []
  const current = new Date(startDate)
  
  for (let i = 0; i < count; i++) {
    switch (period) {
      case 'daily':
        labels.push(current.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' }))
        current.setDate(current.getDate() + 1)
        break
      case 'weekly':
        labels.push(`Minggu ${String(Math.floor(current.getDate() / 7) + 1).padStart(2, '0')} ${current.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}`)
        current.setDate(current.getDate() + 7)
        break
      case 'monthly':
        labels.push(current.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }))
        current.setMonth(current.getMonth() + 1)
        break
      case 'yearly':
        labels.push(String(current.getFullYear()))
        current.setFullYear(current.getFullYear() + 1)
        break
    }
  }
  return labels
}

export default function AnalysisPage() {
  const [period, setPeriod] = useState<Period>('monthly')
  const [loading, setLoading] = useState(true)
  const [transactions, setTransactions] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [summary, setSummary] = useState({
    total_income: 0,
    total_expense: 0,
    net_flow: 0,
    total_savings: 0,
  })
  const [chartData, setChartData] = useState<any[]>([])
  const [expenseByCategory, setExpenseByCategory] = useState<any[]>([])
  const [incomeByCategory, setIncomeByCategory] = useState<any[]>([])
  const [topExpenses, setTopExpenses] = useState<any[]>([])
  const [periodLabels, setPeriodLabels] = useState<string[]>([])

  useEffect(() => {
    loadData()
  }, [period])

  const loadData = async () => {
    try {
      setLoading(true)
      const [txData, catData, finSummary] = await Promise.all([
        getTransactions(),
        getCategories(),
        getFinancialSummary(),
      ])

      setTransactions(txData)
      setCategories(catData)
      setSummary({
        total_income: finSummary.total_income,
        total_expense: finSummary.total_expense,
        net_flow: finSummary.total_income - finSummary.total_expense,
        total_savings: finSummary.total_savings,
      })

      processChartData(txData, catData)
    } catch (error) {
      console.error('Failed to load analysis data:', error)
    } finally {
      setLoading(false)
    }
  }

  const processChartData = (txData: any[], catData: any[]) => {
    const now = new Date()
    const periodCount = period === 'daily' ? 30 : period === 'weekly' ? 12 : period === 'monthly' ? 12 : 5
    const startDate = getPeriodStart(new Date(now.getFullYear(), now.getMonth() - (periodCount - 1), 1), period)
    const labels = generatePeriodLabels(startDate, period, periodCount)
    setPeriodLabels(labels)

    const incomeMap: Record<string, number> = {}
    const expenseMap: Record<string, number> = {}
    const expenseCategoryMap: Record<string, number> = {}
    const incomeCategoryMap: Record<string, number> = {}

    txData.forEach((t) => {
      const date = new Date(t.date)
      const key = getDateKey(date, period)
      const amount = Number(t.amount || 0)

      if (t.type === 'income') {
        incomeMap[key] = (incomeMap[key] || 0) + amount
        incomeCategoryMap[t.category_id] = (incomeCategoryMap[t.category_id] || 0) + amount
      } else {
        expenseMap[key] = (expenseMap[key] || 0) + amount
        expenseCategoryMap[t.category_id] = (expenseCategoryMap[t.category_id] || 0) + amount
      }
    })

    const chartDataPoints = labels.map((label, i) => {
      const periodDate = new Date(startDate)
      switch (period) {
        case 'daily':
          periodDate.setDate(periodDate.getDate() + i)
          break
        case 'weekly':
          periodDate.setDate(periodDate.getDate() + i * 7)
          break
        case 'monthly':
          periodDate.setMonth(periodDate.getMonth() + i)
          break
        case 'yearly':
          periodDate.setFullYear(periodDate.getFullYear() + i)
          break
      }
      const key = getDateKey(periodDate, period)
      return {
        label,
        income: incomeMap[key] || 0,
        expense: expenseMap[key] || 0,
        net: (incomeMap[key] || 0) - (expenseMap[key] || 0),
      }
    })
    setChartData(chartDataPoints)

    const catMap = new Map(catData.map((c) => [c.id, c]))

    const expenseByCat = Object.entries(expenseCategoryMap)
      .map(([catId, amount]) => ({
        name: catMap.get(catId)?.name || 'Lainnya',
        value: amount,
        color: catMap.get(catId)?.color || '#64748B',
        icon: catMap.get(catId)?.icon || 'MoreHorizontal',
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8)
    setExpenseByCategory(expenseByCat)

    const incomeByCat = Object.entries(incomeCategoryMap)
      .map(([catId, amount]) => ({
        name: catMap.get(catId)?.name || 'Lainnya',
        value: amount,
        color: catMap.get(catId)?.color || '#2563EB',
        icon: catMap.get(catId)?.icon || 'PlusCircle',
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
    setIncomeByCategory(incomeByCat)

    setTopExpenses(expenseByCat.slice(0, 5))
  }

  const hasData = transactions.length > 0

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F8FF] dark:bg-[#0B1224] flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="text-slate-500 dark:text-slate-400 mt-4">Memuat analisis keuangan...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F8FF] dark:bg-[#0B1224] text-slate-900 dark:text-[#F8FAFC] p-4 lg:p-8 pt-18 lg:pt-8 pb-24 lg:pb-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-[#F8FAFC]">Analisis Keuangan</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Pahami pola keuanganmu dengan grafik interaktif berbasis data nyata
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as Period)}
            className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-48 appearance-none"
          >
            {Object.entries(PERIOD_LABELS).map(([value, label]) => (
              <option key={value} value={value as Period}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white dark:bg-[#111C35] border-slate-200 dark:border-[#263653] shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Pemasukan</p>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-[#F8FAFC]">{formatRupiah(summary.total_income)}</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#111C35] border-slate-200 dark:border-[#263653] shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Pengeluaran</p>
              <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/30 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-[#F8FAFC]">{formatRupiah(summary.total_expense)}</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#111C35] border-slate-200 dark:border-[#263653] shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Arus Kas Bersih</p>
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                {summary.net_flow >= 0 ? (
                  <ArrowUpRight className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                ) : (
                  <ArrowDownLeft className="w-5 h-5 text-red-600 dark:text-red-400" />
                )}
              </div>
            </div>
            <p className={cn(
              'text-2xl font-bold',
              summary.net_flow >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
            )}>
              {formatRupiah(summary.net_flow)}
            </p>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              {summary.net_flow >= 0 ? 'Surplus' : 'Defisit'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#111C35] border-slate-200 dark:border-[#263653] shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Tabungan</p>
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
                <Target className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-[#F8FAFC]">{formatRupiah(summary.total_savings)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Income vs Expense Chart */}
        <Card className="bg-white dark:bg-[#111C35] border-slate-200 dark:border-[#263653] shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <LineChartIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Pemasukan vs Pengeluaran
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hasData ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                    <XAxis
                      dataKey="label"
                      stroke="#64748B"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#64748B"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => formatRupiah(value).replace('Rp', '').trim()}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#111C35',
                        border: '1px solid #263653',
                        borderRadius: '12px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                      }}
                      labelStyle={{ color: '#F8FAFC', fontWeight: 500 }}
                      // @ts-expect-error Recharts formatter type complexity
                      formatter={(value: string | number | undefined, name: string) => [formatRupiah(typeof value === 'number' ? value : 0), name] as [string, string]}
                    />
                    <Legend
                      wrapperStyle={{ paddingTop: '8px' }}
                      formatter={(value) => value}
                    />
                    <Line
                      type="monotone"
                      dataKey="income"
                      stroke="#2563EB"
                      strokeWidth={2.5}
                      dot={{ r: 4, strokeWidth: 2, stroke: '#2563EB' }}
                      activeDot={{ r: 6, strokeWidth: 3 }}
                      name="Pemasukan"
                    />
                    <Line
                      type="monotone"
                      dataKey="expense"
                      stroke="#EF4444"
                      strokeWidth={2.5}
                      dot={{ r: 4, strokeWidth: 2, stroke: '#EF4444' }}
                      activeDot={{ r: 6, strokeWidth: 3 }}
                      name="Pengeluaran"
                    />
                    <Line
                      type="monotone"
                      dataKey="net"
                      stroke="#F59E0B"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                      name="Arus Kas Bersih"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex flex-col items-center justify-center text-center">
                <BarChart3 className="w-14 h-14 text-slate-300 dark:text-slate-600 mb-4 opacity-50" />
                <h3 className="text-lg font-medium text-slate-500 dark:text-slate-400 mb-2">Belum ada data transaksi</h3>
                <p className="text-sm text-slate-400 dark:text-slate-500 max-w-xs">
                  Mulai catat transaksi untuk melihat grafik pemasukan dan pengeluaran
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expense by Category Pie Chart */}
        <Card className="bg-white dark:bg-[#111C35] border-slate-200 dark:border-[#263653] shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
              Pengeluaran per Kategori
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hasData && expenseByCategory.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseByCategory}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(1)}%`}
                      labelLine={false}
                    >
                      {expenseByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#111C35',
                        border: '1px solid #263653',
                        borderRadius: '12px',
                      }}
                      // @ts-expect-error Recharts formatter type complexity
                      formatter={(value: string | number | undefined, name: string) => [formatRupiah(typeof value === 'number' ? value : 0), name] as [string, string]}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={100}
                      formatter={(value) => value}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex flex-col items-center justify-center text-center">
                <PieChartIcon className="w-14 h-14 text-slate-300 dark:text-slate-600 mb-4 opacity-50" />
                <h3 className="text-lg font-medium text-slate-500 dark:text-slate-400 mb-2">Belum ada data pengeluaran</h3>
                <p className="text-sm text-slate-400 dark:text-slate-500">Catat pengeluaran untuk melihat distribusi kategori</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Monthly Comparison Bar Chart + Top Expenses */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Monthly Comparison */}
        <Card className="bg-white dark:bg-[#111C35] border-slate-200 dark:border-[#263653] shadow-sm lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Perbandingan {PERIOD_LABELS[period]}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hasData ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
                    <XAxis type="number" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => formatRupiah(v).replace('Rp', '').trim()} />
                    <YAxis type="category" dataKey="label" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} width={80} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#111C35',
                        border: '1px solid #263653',
                        borderRadius: '12px',
                      }}
                      // @ts-expect-error Recharts formatter type complexity
                      formatter={(value: string | number | undefined, name: string) => [formatRupiah(typeof value === 'number' ? value : 0), name] as [string, string]}
                    />
                    <Legend wrapperStyle={{ paddingTop: '8px' }} />
                    <Bar dataKey="income" fill="#2563EB" radius={[0, 4, 4, 0]} name="Pemasukan" />
                    <Bar dataKey="expense" fill="#EF4444" radius={[0, 4, 4, 0]} name="Pengeluaran" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex flex-col items-center justify-center text-center">
                <BarChart3 className="w-14 h-14 text-slate-300 dark:text-slate-600 mb-4 opacity-50" />
                <h3 className="text-lg font-medium text-slate-500 dark:text-slate-400 mb-2">Belum ada data untuk perbandingan</h3>
                <p className="text-sm text-slate-400 dark:text-slate-500">Catat transaksi untuk melihat tren perbandingan</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Expense Categories + Income by Category */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Top Expenses */}
        <Card className="bg-white dark:bg-[#111C35] border-slate-200 dark:border-[#263653] shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
              Top 5 Kategori Pengeluaran
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hasData && topExpenses.length > 0 ? (
              <div className="space-y-4">
                {topExpenses.map((item, index) => (
                  <div key={item.name} className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 text-sm font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 dark:text-[#F8FAFC] truncate">{item.name}</p>
                      <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-1">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${(item.value / (topExpenses[0]?.value || 1)) * 100}%`,
                            backgroundColor: item.color,
                          }}
                        />
                      </div>
                    </div>
                    <span className="font-semibold text-slate-900 dark:text-[#F8FAFC] whitespace-nowrap">
                      {formatRupiah(item.value)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <TrendingDown className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3 opacity-50" />
                <p className="text-slate-500 dark:text-slate-400">Belum ada pengeluaran</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Income by Category */}
        <Card className="bg-white dark:bg-[#111C35] border-slate-200 dark:border-[#263653] shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Sumber Pemasukan
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hasData && incomeByCategory.length > 0 ? (
              <div className="space-y-4">
                {incomeByCategory.map((item, index) => (
                  <div key={item.name} className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 text-sm font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 dark:text-[#F8FAFC] truncate">{item.name}</p>
                      <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-1">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${(item.value / (incomeByCategory[0]?.value || 1)) * 100}%`,
                            backgroundColor: item.color,
                          }}
                        />
                      </div>
                    </div>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                      {formatRupiah(item.value)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <TrendingUp className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3 opacity-50" />
                <p className="text-slate-500 dark:text-slate-400">Belum ada pemasukan</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Financial Health Indicators */}
      <Card className="bg-white dark:bg-[#111C35] border-slate-200 dark:border-[#263653] shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Indikator Kesehatan Keuangan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#101B3D]">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-[#F8FAFC]">Rasio Tabungan</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Pemasukan yang ditabung</p>
                </div>
              </div>
              <p className={cn(
                'text-2xl font-bold',
                summary.total_income > 0 && summary.total_savings / summary.total_income >= 0.2
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-amber-600 dark:text-amber-400'
              )}>
                {summary.total_income > 0
                  ? `${((summary.total_savings / summary.total_income) * 100).toFixed(1)}%`
                  : 'N/A'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {summary.total_income > 0 && summary.total_savings / summary.total_income >= 0.2
                  ? 'Baik: ≥20% pemasukan ditabung'
                  : 'Perlu perbaikan: tabung minimal 20%'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#101B3D]">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-[#F8FAFC]">Rasio Pengeluaran</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Pengeluaran vs Pemasukan</p>
                </div>
              </div>
              <p className={cn(
                'text-2xl font-bold',
                summary.total_income > 0 && summary.total_expense / summary.total_income <= 0.8
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-red-600 dark:text-red-400'
              )}>
                {summary.total_income > 0
                  ? `${((summary.total_expense / summary.total_income) * 100).toFixed(1)}%`
                  : 'N/A'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {summary.total_income > 0 && summary.total_expense / summary.total_income <= 0.8
                  ? 'Sehat: pengeluaran ≤80% pemasukan'
                  : 'Waspada: pengeluaran >80% pemasukan'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#101B3D]">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
                  <Target className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-[#F8FAFC]">Arus Kas Bersih</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Sisa bulanan</p>
                </div>
              </div>
              <p className={cn(
                'text-2xl font-bold',
                summary.net_flow >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
              )}>
                {formatRupiah(summary.net_flow)}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {summary.net_flow >= 0 ? 'Positif: uang bertambah' : 'Negatif: uang berkurang'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}