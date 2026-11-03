'use client'

import { useState } from 'react'
import { formatRupiah } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Plus, Edit, ChevronLeft, ChevronRight, AlertTriangle, TrendingUp } from 'lucide-react'

type Budget = {
  id: string
  category_id: string
  category_name: string
  category_icon: string
  amount: number
  spent: number
}

const CATEGORIES = [
  { id: 'makanan', name: 'Makanan', icon: '🍔' },
  { id: 'transportasi', name: 'Transportasi', icon: '🚗' },
  { id: 'belanja', name: 'Belanja', icon: '🛍️' },
  { id: 'hiburan', name: 'Hiburan', icon: '🎬' },
  { id: 'kesehatan', name: 'Kesehatan', icon: '🏥' },
  { id: 'pendidikan', name: 'Pendidikan', icon: '📚' },
  { id: 'tagihan', name: 'Tagihan', icon: '🧾' },
  { id: 'lainnya', name: 'Lainnya', icon: '📦' },
]

const INITIAL_BUDGETS: Budget[] = [
  { id: '1', category_id: 'makanan', category_name: 'Makanan', category_icon: '🍔', amount: 2000000, spent: 1850000 },
  { id: '2', category_id: 'transportasi', category_name: 'Transportasi', category_icon: '🚗', amount: 1500000, spent: 1650000 },
  { id: '3', category_id: 'belanja', category_name: 'Belanja', category_icon: '🛍️', amount: 1000000, spent: 350000 },
  { id: '4', category_id: 'hiburan', category_name: 'Hiburan', category_icon: '🎬', amount: 500000, spent: 450000 },
  { id: '5', category_id: 'kesehatan', category_name: 'Kesehatan', category_icon: '🏥', amount: 800000, spent: 285000 },
  { id: '6', category_id: 'tagihan', category_name: 'Tagihan', category_icon: '🧾', amount: 2500000, spent: 2480000 },
]

const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

const emptyForm = () => ({
  category_id: 'makanan',
  amount: '',
})

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>(INITIAL_BUDGETS)
  const [selectedMonth, setSelectedMonth] = useState(10) // November (0-indexed)
  const [selectedYear, setSelectedYear] = useState(2026)
  
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState(emptyForm())

  const handleOpenAdd = () => {
    setEditingId(null)
    setForm(emptyForm())
    setIsFormOpen(true)
  }

  const handleOpenEdit = (budget: Budget) => {
    setEditingId(budget.id)
    setForm({
      category_id: budget.category_id,
      amount: budget.amount.toString(),
    })
    setIsFormOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const amount = parseFloat(form.amount) || 0
    const cat = CATEGORIES.find((c) => c.id === form.category_id)
    if (!cat) return
    setIsSubmitting(true)

    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 800))

    if (editingId) {
      setBudgets((prev) =>
        prev.map((b) =>
          b.id === editingId
            ? { ...b, amount, category_id: form.category_id, category_name: cat.name, category_icon: cat.icon }
            : b
        )
      )
    } else {
      setBudgets((prev) => [
        ...prev,
        { id: Date.now().toString(), category_id: form.category_id, category_name: cat.name, category_icon: cat.icon, amount, spent: 0 },
      ])
    }
    setIsFormOpen(false)
    setIsSubmitting(false)
  }

  const getPercentage = (spent: number, budget: number) => {
    return budget > 0 ? (spent / budget) * 100 : 0
  }

  const getStatusBadge = (percentage: number) => {
    if (percentage > 100) {
      return (
        <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-900/40 text-red-400">
          <AlertTriangle className="h-3 w-3" />
          Melebihi Anggaran
        </div>
      )
    }
    if (percentage > 80) {
      return (
        <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-900/40 text-yellow-400">
          <AlertTriangle className="h-3 w-3" />
          Hampir Habis
        </div>
      )
    }
    return null
  }

  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0)
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0)
  const totalRemaining = totalBudget - totalSpent

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11)
      setSelectedYear(selectedYear - 1)
    } else {
      setSelectedMonth(selectedMonth - 1)
    }
  }

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0)
      setSelectedYear(selectedYear + 1)
    } else {
      setSelectedMonth(selectedMonth + 1)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-gray-100">Anggaran Bulanan</h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-lg px-3 py-2">
            <button
              onClick={handlePrevMonth}
              className="text-gray-400 hover:text-gray-200 transition-colors"
              aria-label="Bulan sebelumnya"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-medium text-gray-100 min-w-[120px] text-center">
              {MONTHS[selectedMonth]} {selectedYear}
            </span>
            <button
              onClick={handleNextMonth}
              className="text-gray-400 hover:text-gray-200 transition-colors"
              aria-label="Bulan berikutnya"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <Button onClick={handleOpenAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Anggaran
          </Button>
        </div>
      </div>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ringkasan Anggaran</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Anggaran</p>
              <p className="text-2xl font-semibold text-gray-100">{formatRupiah(totalBudget)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Pengeluaran</p>
              <p className="text-2xl font-semibold text-red-400">{formatRupiah(totalSpent)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Sisa Anggaran</p>
              <p className={`text-2xl font-semibold ${totalRemaining >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {formatRupiah(Math.abs(totalRemaining))}
              </p>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-500">Progress Total</span>
              <span className="text-gray-300 font-medium">{getPercentage(totalSpent, totalBudget).toFixed(1)}%</span>
            </div>
            <Progress
              value={totalSpent}
              max={totalBudget}
              className={totalSpent > totalBudget ? 'bg-red-900' : ''}
            />
          </div>
        </CardContent>
      </Card>

      {/* Budget Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {budgets.map((budget) => {
          const percentage = getPercentage(budget.spent, budget.amount)
          const remaining = budget.amount - budget.spent
          return (
            <Card key={budget.id} className="hover:bg-gray-800/30 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-800 text-2xl">
                      {budget.category_icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-100">{budget.category_name}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {formatRupiah(budget.spent)} / {formatRupiah(budget.amount)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleOpenEdit(budget)}
                    className="rounded-lg p-2 text-gray-500 hover:text-gray-100 hover:bg-gray-700 transition-colors"
                    aria-label="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                </div>

                {getStatusBadge(percentage) && (
                  <div className="mb-3">{getStatusBadge(percentage)}</div>
                )}

                <div className="space-y-2">
                  <Progress
                    value={budget.spent}
                    max={budget.amount}
                    className={percentage > 100 ? 'bg-gray-800' : ''}
                  />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Sisa</span>
                    <span className={`font-semibold ${remaining >= 0 ? 'text-emerald-500' : 'text-red-400'}`}>
                      {remaining >= 0 ? formatRupiah(remaining) : `−${formatRupiah(Math.abs(remaining))}`}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {budgets.length === 0 && (
        <Card className="flex flex-col items-center justify-center py-20 text-center">
          <TrendingUp className="h-14 w-14 text-gray-700 mb-4" />
          <h3 className="text-lg font-medium text-gray-300 mb-1">Belum ada anggaran</h3>
          <p className="text-sm text-gray-500 mb-4">Mulai atur keuangan dengan membuat anggaran bulanan</p>
          <Button onClick={handleOpenAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Anggaran
          </Button>
        </Card>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-md w-full">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Anggaran' : 'Tambah Anggaran'}</DialogTitle>
          </DialogHeader>
          <DialogClose onClick={() => setIsFormOpen(false)} />
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-400">Kategori</label>
              <Select
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-400">Jumlah Anggaran (Rp)</label>
              <Input
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="0"
                min="0"
                step="10000"
                required
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={() => setIsFormOpen(false)}
              >
                Batal
              </Button>
              <Button type="submit" variant="primary" className="flex-1" loading={isSubmitting}>
                Simpan
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
