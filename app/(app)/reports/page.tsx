'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/layout/AuthProvider'
import { LoadingSpinner, LoadingPage } from '@/components/ui/Loading'
import { formatRupiah, cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'
import {
  TrendingUp, TrendingDown, DollarSign, FileText, FileSpreadsheet,
  ArrowUpRight, ArrowDownRight, Download
} from 'lucide-react'
import {
  getTransactions,
  getCategories,
  getSavingsGoals,
  getFinancialSummary,
  TransactionItem,
  CategoryItem,
} from '@/lib/store'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import * as XLSX from 'xlsx'

const COLORS = ['#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#64748B']

type Period = 'harian' | 'mingguan' | 'bulanan' | 'tahunan'

export default function ReportsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [transactions, setTransactions] = useState<TransactionItem[]>([])
  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [savingsGoals, setSavingsGoals] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activePeriod, setActivePeriod] = useState<Period>('bulanan')
  const [exporting, setExporting] = useState<'pdf' | 'excel' | null>(null)

  const periods: { key: Period; label: string }[] = [
    { key: 'harian', label: 'Harian' },
    { key: 'mingguan', label: 'Mingguan' },
    { key: 'bulanan', label: 'Bulanan' },
    { key: 'tahunan', label: 'Tahunan' },
  ]

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      setIsLoading(false)
      return
    }
    loadData()
  }, [user, authLoading])

  const loadData = async () => {
    if (!user) return
    try {
      setIsLoading(true)
      const [tx, cats, savings] = await Promise.all([
        getTransactions(),
        getCategories(),
        getSavingsGoals(),
      ])
      setTransactions(tx)
      setCategories(cats)
      setSavingsGoals(savings)
    } catch (err: any) {
      console.error('Failed to load reports data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const getChartData = () => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    let data: { name: string; pemasukan: number; pengeluaran: number }[] = []

    if (activePeriod === 'harian') {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dayName = date.toLocaleDateString('id-ID', { weekday: 'short' })
        const dayTx = transactions.filter((t) => {
          const txDate = new Date(t.date)
          return txDate.toDateString() === date.toDateString()
        })
        const pemasukan = dayTx.filter((t) => t.type === 'income').reduce((sum, t) => sum + Number(t.amount || 0), 0)
        const pengeluaran = dayTx.filter((t) => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount || 0), 0)
        data.push({ name: dayName, pemasukan, pengeluaran })
      }
    } else if (activePeriod === 'mingguan') {
      // Last 4 weeks
      for (let i = 3; i >= 0; i--) {
        const weekStart = new Date()
        weekStart.setDate(weekStart.getDate() - (weekStart.getDay() + 7 * i))
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekEnd.getDate() + 6)
        const weekLabel = `Minggu ${4 - i}`
        const weekTx = transactions.filter((t) => {
          const txDate = new Date(t.date)
          return txDate >= weekStart && txDate <= weekEnd
        })
        const pemasukan = weekTx.filter((t) => t.type === 'income').reduce((sum, t) => sum + Number(t.amount || 0), 0)
        const pengeluaran = weekTx.filter((t) => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount || 0), 0)
        data.push({ name: weekLabel, pemasukan, pengeluaran })
      }
    } else if (activePeriod === 'bulanan') {
      // Last 12 months
      for (let i = 11; i >= 0; i--) {
        const month = (currentMonth - i + 12) % 12
        const year = currentYear - (currentMonth - i < 0 ? 1 : 0)
        const monthName = new Date(year, month).toLocaleDateString('id-ID', { month: 'short' })
        const monthTx = transactions.filter((t) => {
          const txDate = new Date(t.date)
          return txDate.getMonth() === month && txDate.getFullYear() === year
        })
        const pemasukan = monthTx.filter((t) => t.type === 'income').reduce((sum, t) => sum + Number(t.amount || 0), 0)
        const pengeluaran = monthTx.filter((t) => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount || 0), 0)
        data.push({ name: monthName, pemasukan, pengeluaran })
      }
    } else {
      // Yearly - last 5 years
      for (let i = 4; i >= 0; i--) {
        const year = currentYear - i
        const yearTx = transactions.filter((t) => new Date(t.date).getFullYear() === year)
        const pemasukan = yearTx.filter((t) => t.type === 'income').reduce((sum, t) => sum + Number(t.amount || 0), 0)
        const pengeluaran = yearTx.filter((t) => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount || 0), 0)
        data.push({ name: year.toString(), pemasukan, pengeluaran })
      }
    }
    return data
  }

  const getCategoryExpenses = () => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    let filteredTx = transactions
    if (activePeriod === 'bulanan') {
      filteredTx = transactions.filter((t) => {
        const txDate = new Date(t.date)
        return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear
      })
    } else if (activePeriod === 'tahunan') {
      filteredTx = transactions.filter((t) => new Date(t.date).getFullYear() === currentYear)
    } else if (activePeriod === 'mingguan') {
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - weekStart.getDay())
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 6)
      filteredTx = transactions.filter((t) => {
        const txDate = new Date(t.date)
        return txDate >= weekStart && txDate <= weekEnd
      })
    } else if (activePeriod === 'harian') {
      const today = new Date().toDateString()
      filteredTx = transactions.filter((t) => new Date(t.date).toDateString() === today)
    }

    const expenseTx = filteredTx.filter((t) => t.type === 'expense')
    const categoryMap = new Map<string, { name: string; value: number; color: string }>()

    expenseTx.forEach((t) => {
      const cat = categories.find((c) => c.id === t.category_id)
      const key = cat?.id || 'other'
      const existing = categoryMap.get(key) || { name: cat?.name || 'Lainnya', value: 0, color: cat?.color || '#64748B' }
      existing.value += Number(t.amount || 0)
      categoryMap.set(key, existing)
    })

    return Array.from(categoryMap.values()).sort((a, b) => b.value - a.value)
  }

  const getComparisonData = () => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    let currentPeriodStart = new Date(currentYear, currentMonth, 1)
    let currentPeriodEnd = new Date(currentYear, currentMonth + 1, 0)
    let prevPeriodStart = new Date(currentYear, currentMonth - 1, 1)
    let prevPeriodEnd = new Date(currentYear, currentMonth, 0)

    if (activePeriod === 'tahunan') {
      currentPeriodStart = new Date(currentYear, 0, 1)
      currentPeriodEnd = new Date(currentYear, 11, 31)
      prevPeriodStart = new Date(currentYear - 1, 0, 1)
      prevPeriodEnd = new Date(currentYear - 1, 11, 31)
    } else if (activePeriod === 'mingguan') {
      const today = new Date()
      currentPeriodStart = new Date(today)
      currentPeriodStart.setDate(today.getDate() - today.getDay())
      currentPeriodEnd = new Date(currentPeriodStart)
      currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 6)
      prevPeriodStart = new Date(currentPeriodStart)
      prevPeriodStart.setDate(prevPeriodStart.getDate() - 7)
      prevPeriodEnd = new Date(currentPeriodStart)
      prevPeriodEnd.setDate(prevPeriodEnd.getDate() - 1)
    } else if (activePeriod === 'harian') {
      currentPeriodStart = new Date()
      currentPeriodStart.setHours(0, 0, 0, 0)
      currentPeriodEnd = new Date(currentPeriodStart)
      prevPeriodStart = new Date(currentPeriodStart)
      prevPeriodStart.setDate(prevPeriodStart.getDate() - 1)
      prevPeriodEnd = new Date(prevPeriodStart)
    }

    const currentTx = transactions.filter((t) => {
      const d = new Date(t.date)
      return d >= currentPeriodStart && d <= currentPeriodEnd
    })
    const prevTx = transactions.filter((t) => {
      const d = new Date(t.date)
      return d >= prevPeriodStart && d <= prevPeriodEnd
    })

    const expenseCats = categories.filter((c) => c.type === 'expense')

    return expenseCats.map((cat) => {
      const current = currentTx
        .filter((t) => t.category_id === cat.id)
        .reduce((sum, t) => sum + Number(t.amount || 0), 0)
      const previous = prevTx
        .filter((t) => t.category_id === cat.id)
        .reduce((sum, t) => sum + Number(t.amount || 0), 0)
      return { kategori: cat.name, bulanIni: current, bulanLalu: previous, color: cat.color }
    })
  }

  const summary = {
    totalIncome: transactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + Number(t.amount || 0), 0),
    totalExpense: transactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount || 0), 0),
    totalSavings: savingsGoals.reduce((sum, g) => sum + Number(g.current_amount || 0), 0),
  }
  const net = summary.totalIncome - summary.totalExpense

  const exportToPDF = async () => {
    setExporting('pdf')
    try {
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()

      // Title
      doc.setFontSize(20)
      doc.setTextColor(37, 99, 235) // #2563EB
      doc.text('Laporan Keuangan MoneyTrack', pageWidth / 2, 20, { align: 'center' })

      // Period
      doc.setFontSize(12)
      doc.setTextColor(100, 116, 139) // #64748B
      doc.text(`Periode: ${periods.find(p => p.key === activePeriod)?.label} - ${new Date().toLocaleDateString('id-ID')}`, pageWidth / 2, 30, { align: 'center' })

      // Summary
      let y = 45
      doc.setFontSize(14)
      doc.setTextColor(16, 27, 61) // #101B3D
      doc.text('Ringkasan', 14, y)

      const summaryData = [
        ['Total Pemasukan', formatRupiah(summary.totalIncome)],
        ['Total Pengeluaran', formatRupiah(summary.totalExpense)],
        ['Sisa Bersih', formatRupiah(net)],
        ['Total Tabungan', formatRupiah(summary.totalSavings)],
      ]

      ;(doc as any).autoTable({
        startY: y + 5,
        head: [['Item', 'Jumlah']],
        body: summaryData,
        theme: 'striped',
        headStyles: { fillColor: [37, 99, 235], textColor: 255 },
        styles: { fontSize: 10 },
      })

      // Category Expenses
      const catExpenses = getCategoryExpenses()
      if (catExpenses.length > 0) {
        y = (doc as any).lastAutoTable.finalY + 10
        doc.setFontSize(14)
        doc.setTextColor(16, 27, 61)
        doc.text('Pengeluaran per Kategori', 14, y)

        const catData = catExpenses.map((c) => [c.name, formatRupiah(c.value)])
        ;(doc as any).autoTable({
          startY: y + 5,
          head: [['Kategori', 'Jumlah']],
          body: catData,
          theme: 'striped',
          headStyles: { fillColor: [37, 99, 235], textColor: 255 },
          styles: { fontSize: 10 },
        })
      }

      // Transactions table
      y = (doc as any).lastAutoTable.finalY + 10
      doc.setFontSize(14)
      doc.setTextColor(16, 27, 61)
      doc.text('Detail Transaksi', 14, y)

      const txData = transactions.slice(0, 50).map((t) => {
        const cat = categories.find((c) => c.id === t.category_id)
        return [
          new Date(t.date).toLocaleDateString('id-ID'),
          t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
          cat?.name || t.category_name || 'Lainnya',
          formatRupiah(Number(t.amount || 0)),
          t.description || '-',
        ]
      })

      ;(doc as any).autoTable({
        startY: y + 5,
        head: [['Tanggal', 'Tipe', 'Kategori', 'Jumlah', 'Keterangan']],
        body: txData,
        theme: 'striped',
        headStyles: { fillColor: [37, 99, 235], textColor: 255 },
        styles: { fontSize: 8 },
        columnStyles: { 3: { halign: 'right' } },
      })

      doc.save(`laporan-keuangan-${activePeriod}-${new Date().toISOString().split('T')[0]}.pdf`)
    } catch (err) {
      console.error('PDF export error:', err)
      alert('Gagal mengekspor PDF')
    } finally {
      setExporting(null)
    }
  }

  const exportToExcel = async () => {
    setExporting('excel')
    try {
      const wb = XLSX.utils.book_new()

      // Summary sheet
      const summaryData = [
        ['Laporan Keuangan MoneyTrack'],
        ['Periode', periods.find(p => p.key === activePeriod)?.label],
        ['Tanggal', new Date().toLocaleDateString('id-ID')],
        [],
        ['Ringkasan'],
        ['Total Pemasukan', summary.totalIncome],
        ['Total Pengeluaran', summary.totalExpense],
        ['Sisa Bersih', net],
        ['Total Tabungan', summary.totalSavings],
      ]
      const wsSummary = XLSX.utils.aoa_to_sheet(summaryData)
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan')

      // Category expenses
      const catExpenses = getCategoryExpenses()
      const catData = [['Pengeluaran per Kategori'], ['Kategori', 'Jumlah'], ...catExpenses.map(c => [c.name, c.value])]
      const wsCat = XLSX.utils.aoa_to_sheet(catData)
      XLSX.utils.book_append_sheet(wb, wsCat, 'Kategori')

      // Transactions
      const txData = [
        ['Detail Transaksi'],
        ['Tanggal', 'Tipe', 'Kategori', 'Jumlah', 'Keterangan'],
        ...transactions.map((t) => {
          const cat = categories.find((c) => c.id === t.category_id)
          return [
            new Date(t.date).toLocaleDateString('id-ID'),
            t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
            cat?.name || t.category_name || 'Lainnya',
            Number(t.amount || 0),
            t.description || '-',
          ]
        }),
      ]
      const wsTx = XLSX.utils.aoa_to_sheet(txData)
      XLSX.utils.book_append_sheet(wb, wsTx, 'Transaksi')

      XLSX.writeFile(wb, `laporan-keuangan-${activePeriod}-${new Date().toISOString().split('T')[0]}.xlsx`)
    } catch (err) {
      console.error('Excel export error:', err)
      alert('Gagal mengekspor Excel')
    } finally {
      setExporting(null)
    }
  }

  if (authLoading || isLoading) {
    return <LoadingPage />
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Silakan login terlebih dahulu</p>
      </div>
    )
  }

  const chartData = getChartData()
  const categoryExpenses = getCategoryExpenses()
  const comparisonData = getComparisonData()

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-foreground">Laporan & Analitik</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToPDF} disabled={!!exporting || transactions.length === 0}>
            <FileText className="mr-2 h-4 w-4" />
            {exporting === 'pdf' ? (
              <>
                <LoadingSpinner className="mr-2 h-4 w-4 animate-spin" />
                Mengekspor...
              </>
            ) : (
              'Ekspor PDF'
            )}
          </Button>
          <Button variant="outline" onClick={exportToExcel} disabled={!!exporting || transactions.length === 0}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            {exporting === 'excel' ? (
              <>
                <LoadingSpinner className="mr-2 h-4 w-4 animate-spin" />
                Mengekspor...
              </>
            ) : (
              'Ekspor Excel'
            )}
          </Button>
        </div>
      </div>

      {/* Period Tabs */}
      <div className="inline-flex items-center rounded-lg bg-accent p-1 mb-6">
        {periods.map((period) => (
          <button
            key={period.key}
            onClick={() => setActivePeriod(period.key)}
            className={cn(
              'rounded-md px-4 py-2 text-sm font-medium transition-colors',
              activePeriod === period.key
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
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
                <p className="text-sm text-muted-foreground">Total Pemasukan</p>
                <p className="text-2xl font-bold text-primary">{formatRupiah(summary.totalIncome)}</p>
              </div>
              <div className="p-3 rounded-lg bg-primary/10">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm text-primary">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              {summary.totalIncome > 0 ? '+ dari periode sebelumnya' : 'Belum ada data'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Pengeluaran</p>
                <p className="text-2xl font-bold text-destructive">{formatRupiah(summary.totalExpense)}</p>
              </div>
              <div className="p-3 rounded-lg bg-destructive/10">
                <TrendingDown className="h-6 w-6 text-destructive" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm text-destructive">
              <ArrowDownRight className="h-4 w-4 mr-1" />
              {summary.totalExpense > 0 ? '+ dari periode sebelumnya' : 'Belum ada data'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sisa Bersih</p>
                <p className="text-2xl font-bold text-blue-500">{formatRupiah(net)}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-500/10">
                <DollarSign className="h-6 w-6 text-blue-500" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm text-blue-500">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              {net >= 0 ? 'Surplus' : 'Defisit'}
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
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" />
                <YAxis
                  stroke="var(--muted-foreground)"
                  tickFormatter={(v) => {
                    if (v >= 1000000) return `${(v / 1000000).toFixed(1)}jt`
                    if (v >= 1000) return `${(v / 1000).toFixed(0)}rb`
                    return v.toString()
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: 'var(--muted-foreground)' }}
                  formatter={(value: any) => [formatRupiah(Number(value) || 0)]}
                />
                <Legend />
                <Line type="monotone" dataKey="pemasukan" stroke="#2563EB" strokeWidth={2} dot={{ fill: '#2563EB' }} />
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
              {categoryExpenses.length > 0 ? (
                <>
                  <PieChart>
                    <Pie
                      data={categoryExpenses}
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
                      {categoryExpenses.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                      }}
                      formatter={(value: any) => [formatRupiah(Number(value) || 0)]}
                    />
                  </PieChart>
                </>
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  <p>Belum ada data pengeluaran untuk periode ini</p>
                </div>
              )}
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Perbandingan: Periode Ini vs Periode Sebelumnya</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-muted-foreground">Kategori</th>
                  <th className="text-right py-3 px-4 text-muted-foreground">Periode Ini</th>
                  <th className="text-right py-3 px-4 text-muted-foreground">Periode Lalu</th>
                  <th className="text-right py-3 px-4 text-muted-foreground">Selisih</th>
                  <th className="text-right py-3 px-4 text-muted-foreground">Perubahan</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((item, index) => {
                  const diff = item.bulanIni - item.bulanLalu
                  const pctChange = item.bulanLalu > 0 ? ((diff / item.bulanLalu) * 100).toFixed(1) : '0'
                  const isUp = diff > 0

                  return (
                    <tr key={index} className="border-b border-border/50">
                      <td className="py-3 px-4 font-medium text-foreground">{item.kategori}</td>
                      <td className="text-right py-3 px-4 text-foreground">{formatRupiah(item.bulanIni)}</td>
                      <td className="text-right py-3 px-4 text-foreground">{formatRupiah(item.bulanLalu)}</td>
                      <td className={cn('text-right py-3 px-4', isUp ? 'text-destructive' : diff < 0 ? 'text-primary' : 'text-muted-foreground')}>
                        {diff !== 0 ? (isUp ? '+' : '') + formatRupiah(diff) : '-'}
                      </td>
                      <td className={cn('text-right py-3 px-4', isUp ? 'text-destructive' : diff < 0 ? 'text-primary' : 'text-muted-foreground')}>
                        {diff !== 0 ? `${isUp ? '+' : ''}${pctChange}%` : '-'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr className="border-t border-border font-semibold">
                  <td className="py-3 px-4 text-foreground">Total</td>
                  <td className="text-right py-3 px-4 text-foreground">
                    {formatRupiah(comparisonData.reduce((sum, i) => sum + i.bulanIni, 0))}
                  </td>
                  <td className="text-right py-3 px-4 text-foreground">
                    {formatRupiah(comparisonData.reduce((sum, i) => sum + i.bulanLalu, 0))}
                  </td>
                  <td className="text-right py-3 px-4 text-destructive">
                    {formatRupiah(comparisonData.reduce((sum, i) => sum + i.bulanIni, 0) - comparisonData.reduce((sum, i) => sum + i.bulanLalu, 0))}
                  </td>
                  <td className="text-right py-3 px-4 text-destructive">
                    {(((comparisonData.reduce((sum, i) => sum + i.bulanIni, 0) - comparisonData.reduce((sum, i) => sum + i.bulanLalu, 0)) / comparisonData.reduce((sum, i) => sum + i.bulanLalu, 0)) * 100).toFixed(1)}%
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
