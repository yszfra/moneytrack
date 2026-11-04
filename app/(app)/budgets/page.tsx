'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/layout/AuthProvider'
import { LoadingSpinner, LoadingPage } from '@/components/ui/Loading'
import { formatRupiah, cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog'
import { Plus, Edit, ChevronLeft, ChevronRight, AlertTriangle, TrendingUp, Trash2, Loader2, ShoppingCart, Utensils, Car, Film, ShoppingBag, HeartPulse, GraduationCap, Receipt, Home, MoreHorizontal } from 'lucide-react'
import {
  getBudgets,
  saveBudget,
  deleteBudget,
  getCategories,
  BudgetItem,
  CategoryItem,
} from '@/lib/store'

const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

const BUDGET_ICON_MAP: Record<string, React.ElementType> = {
  'shopping-cart': ShoppingCart,
  utensils: Utensils,
  car: Car,
  film: Film,
  'shopping-bag': ShoppingBag,
  'heart-pulse': HeartPulse,
  'graduation-cap': GraduationCap,
  receipt: Receipt,
  home: Home,
  'more-horizontal': MoreHorizontal,
}

const getBudgetIcon = (iconName: string) => {
  const Icon = BUDGET_ICON_MAP[iconName] || MoreHorizontal
  return <Icon className="h-6 w-6" />
}

const emptyForm = () => ({
  category_id: '',
  amount: '',
})

export default function BudgetsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [budgets, setBudgets] = useState<BudgetItem[]>([])
  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [selectedMonth, setSelectedMonth] = useState(0)
  const [selectedYear, setSelectedYear] = useState(2026)
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setSelectedMonth(new Date().getMonth())
    setSelectedYear(new Date().getFullYear())
  }, [])
  const [form, setForm] = useState(emptyForm())
  const [error, setError] = useState<string | null>(null)

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
      setError(null)
      const [cats, budgetData] = await Promise.all([
        getCategories(),
        getBudgets(selectedMonth, selectedYear),
      ])
      setCategories(cats)
      setBudgets(budgetData)
      if (!editingId && cats.length > 0 && !form.category_id) {
        setForm((prev) => ({ ...prev, category_id: cats[0].id }))
      }
    } catch (err: any) {
      console.error('Failed to load budgets:', err)
      setError('Gagal memuat data anggaran')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [selectedMonth, selectedYear, user])

  const handleOpenAdd = () => {
    setEditingId(null)
    setForm(emptyForm())
    setError(null)
    setIsFormOpen(true)
  }

  const handleOpenEdit = (budget: BudgetItem) => {
    setEditingId(budget.id)
    setForm({
      category_id: budget.category_id,
      amount: budget.amount.toString(),
    })
    setError(null)
    setIsFormOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !form.category_id || !form.amount) return

    const amount = parseFloat(form.amount)
    if (isNaN(amount) || amount <= 0) {
      setError('Jumlah anggaran harus lebih dari 0')
      return
    }

    const cat = categories.find((c) => c.id === form.category_id)
    if (!cat) return

    setIsSubmitting(true)
    setError(null)

    try {
      if (editingId) {
        const updated = await saveBudget({
          id: editingId,
          category_id: form.category_id,
          category_name: cat.name,
          category_icon: cat.icon,
          amount,
          month: selectedMonth,
          year: selectedYear,
        })
        setBudgets((prev) =>
          prev.map((b) => (b.id === editingId ? updated : b))
        )
      } else {
        const created = await saveBudget({
          category_id: form.category_id,
          category_name: cat.name,
          category_icon: cat.icon,
          amount,
          month: selectedMonth,
          year: selectedYear,
        })
        setBudgets((prev) => [...prev, created])
      }
      setIsFormOpen(false)
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan anggaran')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!user) return
    try {
      await deleteBudget(id)
      setBudgets((prev) => prev.filter((b) => b.id !== id))
    } catch (err: any) {
      setError(err.message || 'Gagal menghapus anggaran')
    }
  }

  const handleConfirmDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus anggaran ini?')) {
      handleDelete(id)
    }
  }

  const getPercentage = (spent: number, budget: number) => {
    return budget > 0 ? (spent / budget) * 100 : 0
  }

  const getStatusBadge = (percentage: number) => {
    if (percentage > 100) {
      return (
        <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400">
          <AlertTriangle className="h-3 w-3" />
          Melebihi Anggaran
        </div>
      )
    }
    if (percentage > 80) {
      return (
        <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
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
      setSelectedYear((y) => y - 1)
    } else {
      setSelectedMonth((m) => m - 1)
    }
  }

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0)
      setSelectedYear((y) => y + 1)
    } else {
      setSelectedMonth((m) => m + 1)
    }
  }

  const expenseCategories = categories.filter((c) => c.type === 'expense')

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

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-foreground">Anggaran Bulanan</h1>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2 flex-1 sm:flex-none">
            <button
              onClick={handlePrevMonth}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Bulan sebelumnya"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-medium text-foreground min-w-[120px] text-center">
              {MONTHS[selectedMonth]} {selectedYear}
            </span>
            <button
              onClick={handleNextMonth}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Bulan berikutnya"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <Button onClick={handleOpenAdd} disabled={expenseCategories.length === 0}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Anggaran
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ringkasan Anggaran</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Anggaran</p>
              <p className="text-2xl font-semibold text-foreground">{formatRupiah(totalBudget)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Pengeluaran</p>
              <p className="text-2xl font-semibold text-destructive">{formatRupiah(totalSpent)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Sisa Anggaran</p>
              <p className={cn('text-2xl font-semibold', totalRemaining >= 0 ? 'text-primary' : 'text-destructive')}>
                {formatRupiah(Math.abs(totalRemaining))}
              </p>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Progress Total</span>
              <span className="text-foreground font-medium">{getPercentage(totalSpent, totalBudget).toFixed(1)}%</span>
            </div>
            <Progress
              value={totalSpent}
              max={totalBudget}
              className={cn(totalSpent > totalBudget ? 'bg-destructive/20' : '')}
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
            <Card key={budget.id} className="hover:bg-accent/30 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary text-xl">
                      {getBudgetIcon(budget.category_icon)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{budget.category_name}</h3>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {formatRupiah(budget.spent)} / {formatRupiah(budget.amount)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenEdit(budget)}
                      className="rounded-lg p-2 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                      aria-label="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleConfirmDelete(budget.id)}
                      className="rounded-lg p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      aria-label="Hapus"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {getStatusBadge(percentage) && (
                  <div className="mb-3">{getStatusBadge(percentage)}</div>
                )}

                <div className="space-y-2">
                  <Progress
                    value={budget.spent}
                    max={budget.amount}
                    className={cn(percentage > 100 ? 'bg-destructive/20' : '')}
                  />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Sisa</span>
                    <span className={cn('font-semibold', remaining >= 0 ? 'text-primary' : 'text-destructive')}>
                      {remaining >= 0 ? formatRupiah(remaining) : `−${formatRupiah(Math.abs(remaining))}`}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}

        {budgets.length === 0 && (
          <Card className="lg:col-span-2 flex flex-col items-center justify-center py-20 text-center">
            <TrendingUp className="h-14 w-14 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-1">Belum ada anggaran</h3>
            <p className="text-sm text-muted-foreground mb-4">Mulai atur keuangan dengan membuat anggaran bulanan</p>
            <Button onClick={handleOpenAdd} disabled={expenseCategories.length === 0}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Anggaran
            </Button>
            {expenseCategories.length === 0 && (
              <p className="text-xs text-muted-foreground mt-2">Tambah kategori pengeluaran terlebih dahulu</p>
            )}
          </Card>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-md w-full">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Anggaran' : 'Tambah Anggaran'}</DialogTitle>
          </DialogHeader>
          <DialogClose onClick={() => setIsFormOpen(false)} />
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Kategori</Label>
              <select
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {expenseCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Jumlah Anggaran (Rp)</Label>
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
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button type="submit" className="flex-1" loading={isSubmitting}>
                Simpan
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
