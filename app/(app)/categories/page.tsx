'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/layout/AuthProvider'
import { LoadingSpinner } from '@/components/ui/Loading'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react'
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  seedDefaultCategories,
  Category,
} from '@/lib/categories'

type CategoryType = 'income' | 'expense'

const ICON_OPTIONS = [
  '🍔', '🚗', '🛍️', '🎬', '🏥', '📚', '🧾', '💰', '💼', '📈', '📦',
  '🎵', '🏋️', '✈️', '🎓', '💊', '🚕', '🍕', '📱', '💻', '🏠', '⚡',
  '💳', '🎁', '☕', '🍜', '🚌', '🎮', '📺', '👕',
]

const COLOR_OPTIONS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
  '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e', '#64748b', '#71717a', '#78716c',
]

const emptyForm = () => ({
  name: '',
  type: 'expense' as CategoryType,
  icon: '📦',
  color: '#64748b',
})

export default function CategoriesPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      setIsLoading(false)
      return
    }

    loadCategories()
  }, [user, authLoading])

  const loadCategories = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      setError(null)

      await seedDefaultCategories(user.id)

      const data = await getCategories(user.id)
      setCategories(data)
    } catch (err: any) {
      console.error('Failed to load categories:', err)
      setError('Gagal memuat kategori')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenAdd = () => {
    setEditingId(null)
    setForm(emptyForm())
    setError(null)
    setIsFormOpen(true)
  }

  const handleOpenEdit = (cat: Category) => {
    setEditingId(cat.id)
    setForm({
      name: cat.name,
      type: cat.type,
      icon: cat.icon,
      color: cat.color,
    })
    setError(null)
    setIsFormOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !form.name.trim()) return

    setIsSubmitting(true)
    setError(null)

    try {
      if (editingId) {
        const updated = await updateCategory(
          editingId,
          user.id,
          form.name.trim(),
          form.type,
          form.icon,
          form.color
        )
        setCategories((prev) =>
          prev.map((c) => (c.id === editingId ? updated : c))
        )
      } else {
        const created = await createCategory(
          user.id,
          form.name.trim(),
          form.type,
          form.icon,
          form.color
        )
        setCategories((prev) => [created, ...prev])
      }
      setIsFormOpen(false)
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan kategori')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId || !user) return
    setIsDeleting(true)
    setError(null)

    try {
      await deleteCategory(deleteId, user.id)
      setCategories((prev) => prev.filter((c) => c.id !== deleteId))
      setDeleteId(null)
    } catch (err: any) {
      setError(err.message || 'Gagal menghapus kategori')
      setDeleteId(null)
    } finally {
      setIsDeleting(false)
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400">Silakan login terlebih dahulu</p>
      </div>
    )
  }

  const expenseCount = categories.filter((c) => c.type === 'expense').length
  const incomeCount = categories.filter((c) => c.type === 'income').length

  return (
    <div className="min-h-screen bg-gray-950 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-100">Kategori Keuangan</h1>
        <Button onClick={handleOpenAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Kategori
        </Button>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Pengeluaran</p>
              <p className="text-3xl font-semibold text-red-400">{expenseCount}</p>
            </div>
            <div className="text-4xl opacity-50">📊</div>
          </div>
        </Card>
        <Card className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Pendapatan</p>
              <p className="text-3xl font-semibold text-emerald-500">{incomeCount}</p>
            </div>
            <div className="text-4xl opacity-50">💹</div>
          </div>
        </Card>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <Card
            key={cat.id}
            className="px-6 py-4 hover:bg-gray-800/50 transition-colors flex flex-col justify-between"
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-lg text-2xl"
                style={{ backgroundColor: (cat.color || '#64748b') + '20' }}
              >
                {cat.icon}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleOpenEdit(cat)}
                  className="rounded-lg p-2 text-gray-500 hover:text-gray-100 hover:bg-gray-700 transition-colors"
                  aria-label="Edit"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setDeleteId(cat.id)}
                  className="rounded-lg p-2 text-gray-500 hover:text-red-400 hover:bg-red-900/30 transition-colors"
                  aria-label="Hapus"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-100 mb-2">{cat.name}</h3>
              <div className="flex items-center gap-2">
                <span
                  className="inline-block px-3 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: (cat.color || '#64748b') + '20',
                    color: cat.color || '#64748b',
                  }}
                >
                  {cat.type === 'income' ? 'Pendapatan' : 'Pengeluaran'}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-md w-full">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Kategori' : 'Tambah Kategori'}</DialogTitle>
          </DialogHeader>
          <DialogClose onClick={() => setIsFormOpen(false)} />
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-400">Nama Kategori</label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Cth: Makan Siang"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-400">Tipe</label>
              <Select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as CategoryType })}
              >
                <option value="expense">Pengeluaran</option>
                <option value="income">Pendapatan</option>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-400">Ikon</label>
              <div className="grid grid-cols-6 gap-2 max-h-36 overflow-y-auto p-1">
                {ICON_OPTIONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setForm({ ...form, icon })}
                    className={`flex h-10 items-center justify-center rounded-lg border-2 text-xl transition-colors ${
                      form.icon === icon
                        ? 'border-emerald-500 bg-emerald-900/20'
                        : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-400">Warna</label>
              <div className="grid grid-cols-10 gap-2">
                {COLOR_OPTIONS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setForm({ ...form, color })}
                    className={`h-7 w-7 rounded-lg border-2 transition-all ${
                      form.color === color
                        ? 'border-white scale-110 ring-2 ring-emerald-500'
                        : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
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
              <Button type="submit" variant="primary" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  'Simpan'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="max-w-sm w-full">
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus</DialogTitle>
          </DialogHeader>
          <DialogClose onClick={() => setDeleteId(null)} />
          <p className="text-gray-400 text-sm mt-2">
            Apakah Anda yakin ingin menghapus kategori ini? Tindakan ini tidak dapat dibatalkan.
          </p>
          <div className="flex gap-3 mt-6">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setDeleteId(null)}
              disabled={isDeleting}
            >
              Batal
            </Button>
            <Button variant="danger" className="flex-1" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menghapus...
                </>
              ) : (
                'Hapus'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
