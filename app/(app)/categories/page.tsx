'use client'

import { useState } from 'react'
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
import { Plus, Edit, Trash2, Grid3x3 } from 'lucide-react'

type CategoryType = 'income' | 'expense'

type Category = {
  id: string
  name: string
  type: CategoryType
  icon: string
}

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'makanan', name: 'Makanan', type: 'expense', icon: '🍔' },
  { id: 'transportasi', name: 'Transportasi', type: 'expense', icon: '🚗' },
  { id: 'belanja', name: 'Belanja', type: 'expense', icon: '🛍️' },
  { id: 'hiburan', name: 'Hiburan', type: 'expense', icon: '🎬' },
  { id: 'kesehatan', name: 'Kesehatan', type: 'expense', icon: '🏥' },
  { id: 'pendidikan', name: 'Pendidikan', type: 'expense', icon: '📚' },
  { id: 'tagihan', name: 'Tagihan', type: 'expense', icon: '🧾' },
  { id: 'gaji', name: 'Gaji', type: 'income', icon: '💰' },
  { id: 'bisnis', name: 'Bisnis', type: 'income', icon: '💼' },
  { id: 'investasi', name: 'Investasi', type: 'income', icon: '📈' },
  { id: 'lainnya', name: 'Lainnya', type: 'expense', icon: '📦' },
]

const ICON_OPTIONS = ['🍔', '🚗', '🛍️', '🎬', '🏥', '📚', '🧾', '💰', '💼', '📈', '📦', '🎵', '🏋️', '✈️', '🎓', '💊', '🚕', '🍕', '📱', '💻']

const emptyForm = () => ({
  name: '',
  type: 'expense' as CategoryType,
  icon: '📦',
})

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleOpenAdd = () => {
    setEditingId(null)
    setForm(emptyForm())
    setIsFormOpen(true)
  }

  const handleOpenEdit = (cat: Category) => {
    setEditingId(cat.id)
    setForm({
      name: cat.name,
      type: cat.type,
      icon: cat.icon,
    })
    setIsFormOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return
    
    setIsSubmitting(true)
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800))

    if (editingId) {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === editingId
            ? { ...c, name: form.name, type: form.type, icon: form.icon }
            : c
        )
      )
    } else {
      setCategories((prev) => [
        { id: Date.now().toString(), name: form.name, type: form.type, icon: form.icon },
        ...prev,
      ])
    }
    setIsFormOpen(false)
    setIsSubmitting(false)
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600))
    
    setCategories((prev) => prev.filter((c) => c.id !== deleteId))
    setDeleteId(null)
    setIsDeleting(false)
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
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-800 text-2xl">
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
                  className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    cat.type === 'income'
                      ? 'bg-emerald-900/40 text-emerald-400'
                      : 'bg-red-900/40 text-red-400'
                  }`}
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
              <div className="grid grid-cols-5 gap-2">
                {ICON_OPTIONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setForm({ ...form, icon })}
                    className={`flex h-12 items-center justify-center rounded-lg border-2 text-2xl transition-colors ${
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
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={() => setIsFormOpen(false)}
              >
                Batal
              </Button>
              <Button type="submit" variant="primary" className="flex-1">
                Simpan
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
            <Button variant="secondary" className="flex-1" onClick={() => setDeleteId(null)}>
              Batal
            </Button>
            <Button variant="danger" className="flex-1" onClick={handleDelete}>
              Hapus
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
