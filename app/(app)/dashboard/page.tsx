'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Target,
  Eye,
  EyeOff,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet as WalletIcon,
  LineChart,
  BarChart3,
  FileText,
  RefreshCw,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { getFinancialSummary, getTransactions, getBudgets, getSavingsGoals } from '@/lib/store'

export default function DashboardPage() {
  const router = useRouter()
  const [summary, setSummary] = useState<{
    total_balance: number
    total_income: number
    total_expense: number
    total_savings: number
    transaction_count: number
  }>({
    total_balance: 0,
    total_income: 0,
    total_expense: 0,
    total_savings: 0,
    transaction_count: 0,
  })
  const [showBalance, setShowBalance] = useState(true)
  const [loading, setLoading] = useState(true)

  const formatRupiah = (amount: number) => {
    if (!showBalance) return '•••••••••••'
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatRupiahShort = (amount: number) => {
    if (!showBalance) return '•••••••••••'
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const loadData = async () => {
    try {
      setLoading(true)
      const [financialSummary, recentTx] = await Promise.all([
        getFinancialSummary(),
        getTransactions(),
      ])
      setSummary(financialSummary)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const [currentDate, setCurrentDate] = useState('Memuat tanggal...')

  useEffect(() => {
    loadData()
    setCurrentDate(
      new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    )
  }, [])

  const handleRefresh = () => loadData()

  const isEmpty = summary.transaction_count === 0

  const handleAddTransaction = () => {
    router.push('/transactions?add=true')
  }

  return (
    <div className="min-h-screen bg-[#F5F8FF] dark:bg-[#0B1224] text-slate-900 dark:text-[#F8FAFC]">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-[#F8FAFC]">
              Selamat Datang di MoneyTrack
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              {currentDate}
            </p>
          </div>
          <Button onClick={handleAddTransaction} size="md" className="gap-2">
            <Plus className="w-4 h-4" />
            Tambah Transaksi
          </Button>
        </div>

        {/* Toggle Balance Visibility */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowBalance(!showBalance)}
            className="gap-2"
          >
            {showBalance ? (
              <>
                <EyeOff className="w-4 h-4" />
                Sembunyikan Saldo
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                Tampilkan Saldo
              </>
            )}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleRefresh} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Welcome Empty State */}
      {isEmpty && (
        <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25 mb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />
          <div className="relative p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-xl md:text-2xl font-bold mb-2">
                  Selamat Datang di MoneyTrack!
                </h2>
                <p className="text-blue-100 mb-4 max-w-md">
                  Mulai kelola keuanganmu dengan mencatat transaksi pertama.
                  Semua data dimulai dari Rp0 — kami tidak menampilkan data dummy.
                </p>
                <Button onClick={handleAddTransaction} size="lg" className="bg-white text-blue-600 hover:bg-blue-50 gap-2">
                  <Plus className="w-5 h-5" />
                  Tambah Transaksi Pertama
                </Button>
              </div>
              <div className="hidden md:block w-48 h-48">
                <div className="relative w-full h-full">
                  <svg viewBox="0 0 200 200" className="w-full h-full opacity-80">
                    <circle cx="100" cy="100" r="80" fill="none" stroke="white" strokeWidth="8" strokeDasharray="502.65" strokeDashoffset="100" />
                    <circle cx="100" cy="100" r="80" fill="none" stroke="white" strokeWidth="8" strokeDasharray="502.65" strokeDashoffset="502.65" opacity="0.3" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-3xl font-bold">Rp0</p>
                      <p className="text-sm text-blue-100">Saldo Awal</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {/* Total Saldo - Primary Card */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-blue-700 to-blue-900 text-white shadow-xl shadow-blue-500/30">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')]" />
          <CardContent className="relative p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-blue-200 text-sm font-medium uppercase tracking-wider">Total Saldo</p>
                <p className="text-3xl md:text-4xl font-bold mt-1">{formatRupiah(summary.total_balance)}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
                <Wallet className="w-7 h-7" />
              </div>
            </div>
            <div className="flex items-center gap-4 pt-4 border-t border-white/10">
              <div className="flex items-center gap-1.5 text-blue-200 text-sm">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Pemasukan: {formatRupiahShort(summary.total_income)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-blue-200 text-sm">
                <ArrowDownLeft className="w-3.5 h-3.5" />
                <span>Pengeluaran: {formatRupiahShort(summary.total_expense)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pemasukan */}
        <Card className="bg-white dark:bg-[#111C35] border-slate-200 dark:border-[#263653] shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Pemasukan Bulan Ini</p>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-[#F8FAFC]">{formatRupiah(summary.total_income)}</p>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
              Total transaksi: {summary.transaction_count}
            </p>
          </CardContent>
        </Card>

        {/* Pengeluaran */}
        <Card className="bg-white dark:bg-[#111C35] border-slate-200 dark:border-[#263653] shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Pengeluaran Bulan Ini</p>
              <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/30 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-[#F8FAFC]">{formatRupiah(summary.total_expense)}</p>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
              {summary.total_expense > summary.total_income
                ? '⚠️ Pengeluaran melebihi pemasukan'
                : 'Pengeluaran terkendali'}
            </p>
          </CardContent>
        </Card>

        {/* Tabungan */}
        <Card className="bg-white dark:bg-[#111C35] border-slate-200 dark:border-[#263653] shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Tabungan</p>
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
                <Target className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-[#F8FAFC]">{formatRupiah(summary.total_savings)}</p>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
              {summary.total_savings > 0 ? 'Target tabungan aktif' : 'Belum ada target tabungan'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Grid - Quick Actions & Insights */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Quick Action: Add Transaction */}
        <Card className="bg-white dark:bg-[#111C35] border-slate-200 dark:border-[#263653] shadow-sm hover:shadow-md transition-shadow lg:col-span-2">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                  <Plus className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-[#F8FAFC]">Catat Transaksi Baru</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    Tambah pemasukan atau pengeluaran untuk memulai pelacakan keuangan
                  </p>
                </div>
              </div>
              <Button onClick={handleAddTransaction} size="lg" className="gap-2 w-full md:w-auto">
                <Plus className="w-4 h-4" />
                Tambah Transaksi
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats Card */}
        <Card className="bg-white dark:bg-[#111C35] border-slate-200 dark:border-[#263653] shadow-sm">
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-[#F8FAFC] mb-4">Ringkasan Cepat</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-[#101B3D]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                    <WalletIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-slate-600 dark:text-slate-300 text-sm">Saldo Saat Ini</span>
                </div>
                <span className="font-semibold text-slate-900 dark:text-[#F8FAFC]">{formatRupiah(summary.total_balance)}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-[#101B3D]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="text-slate-600 dark:text-slate-300 text-sm">Total Pemasukan</span>
                </div>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatRupiah(summary.total_income)}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-[#101B3D]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/30 flex items-center justify-center">
                    <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                  </div>
                  <span className="text-slate-600 dark:text-slate-300 text-sm">Total Pengeluaran</span>
                </div>
                <span className="font-semibold text-red-600 dark:text-red-400">{formatRupiah(summary.total_expense)}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-[#101B3D]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
                    <Target className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <span className="text-slate-600 dark:text-slate-300 text-sm">Total Tabungan</span>
                </div>
                <span className="font-semibold text-amber-600 dark:text-amber-400">{formatRupiah(summary.total_savings)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="fixed inset-0 bg-white/90 dark:bg-[#0B1224]/90 z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-slate-600 dark:text-slate-400">Memuat data keuangan...</p>
          </div>
        </div>
      )}
    </div>
  )
}
