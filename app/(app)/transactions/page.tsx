'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/layout/AuthProvider'
import { LoadingSpinner } from '@/components/ui/Loading'
import { formatRupiah, formatDate } from '@/lib/utils'
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
import { Plus, Edit, Trash2, Search, ChevronLeft, ChevronRight, InboxIcon } from 'lucide-react'
import { getCategories, Category } from '@/lib/categories'

type TransactionType = 'income' | 'expense'
type Transaction = {
  id: string
  type: TransactionType
  category_id: string
  category_name: string
  description: string
  amount: number
  date: string
}

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: '1', type: 'expense', category_id: 'makanan', category_name: 'Makanan', description: 'Makan siang di warung', amount: 35000, date: '2026-11-01' },
  { id: '2', type: 'income', category_id: 'gaji', category_name: 'Gaji', description: 'Gaji bulanan', amount: 8500000, date: '2026-11-01' },
  { id: '3', type: 'expense', category_id: 'transportasi', category_name: 'Transportasi', description: 'Bensin motor', amount: 50000, date: '2026-11-02' },
  { id: '4', type: 'expense', category_id: 'tagihan', category_name: 'Tagihan', description: 'Listrik bulanan', amount: 250000, date: '2026-11-02' },
  { id: '5', type: 'expense', category_id: 'hiburan', category_name: 'Hiburan', description: 'Nonton bioskop', amount: 150000, date: '2026-11-03' },
  { id: '6', type: 'income', category_id: 'bisnis', category_name: 'Bisnis', description: 'Penjualan online', amount: 1200000, date: '2026-11-03' },
  { id: '7', type: 'expense', category_id: 'kesehatan', category_name: 'Kesehatan', description: 'Belanja obat', amount: 85000, date: '2026-11-03' },
  { id: '8', type: 'expense', category_id: 'transportasi', category_name: 'Transportasi', description: 'Ojek online', amount: 25000, date: '2026-11-04' },
  { id: '9', type: 'expense', category_id: 'makanan', category_name: 'Makanan', description: 'Belanja sembako', amount: 180000, date: '2026-11-04' },
  { id: '10', type: 'income', category_id: 'investasi', category_name: 'Investasi', description: 'Dividen saham', amount: 500000, date: '2026-11-05' },
  { id: '11', type: 'expense', category_id: 'pendidikan', category_name: 'Pendidikan', description: 'Kursus online', amount: 450000, date: '2026-11-05' },
  { id: '12', type: 'expense', category_id: 'belanja', category_name: 'Belanja', description: 'Beli pakaian', amount: 350000, date: '2026-11-06' },
]

export default function TransactionsPage() {
  const { user } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const itemsPerPage = 10

  const [initialDate, setInitialDate] = useState('')
  useEffect(() => {
    setInitialDate(new Date().toISOString().split('T')[0])
  }, [])

  useEffect(() => {
    if (!user) return
    const loadCategories = async () => {
      try {
        const data = await getCategories(user.id)
        setCategories(data)
        if (data.length > 0) {
          setForm(prev => ({ ...prev, category_id: prev.category_id === 'makanan' ? data[0].id : prev.category_id }))
        }
      } catch (err) {
        console.error('Failed to load categories:', err)
      }
    }
    loadCategories()
  }, [user])

  const [form, setForm] = useState({
    type: 'expense' as TransactionType,
    category_id: '',
    description: '',
    amount: '',
    date: '',
  })

  useEffect(() => {
    if (initialDate && !form.date) {
      setForm(prev => ({ ...prev, date: initialDate }))
    }
  }, [initialDate, form.date])

  const filteredTransactions = transactions.filter((t) => {
    if (typeFilter !== 'all' && t.type !== typeFilter) return false
    if (categoryFilter !== 'all' && t.category_id !== categoryFilter) return false
    if (searchTerm && !t.description.toLowerCase().includes(searchTerm.toLowerCase())) return false
    if (dateFrom && new Date(t.date) < new Date(dateFrom)) return false
    if (dateTo && new Date(t.date) > new Date(dateTo)) return false
    return true
  })

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800))
    
    const amount = parseFloat(form.amount) || 0
    if (editingTransaction) {
      setTransactions(
        transactions.map((t) =>
          t.id === editingTransaction.id
            ? {
                ...t,
                type: form.type,
                category_id: form.category_id,
                category_name: categories.find((c) => c.id === form.category_id)?.name || '',
                description: form.description,
                amount,
                date: form.date,
              }
            : t
        )
      )
    } else {
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        type: form.type,
        category_id: form.category_id,
        category_name: categories.find((c) => c.id === form.category_id)?.name || '',
        description: form.description,
        amount,
        date: form.date,
      }
      setTransactions([newTransaction, ...transactions])
    }
    setIsModalOpen(false)
    setIsSubmitting(false)
    setForm({
      type: 'expense',
      category_id: categories.length > 0 ? categories[0].id : '',
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
    })
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600))
    
    setTransactions(transactions.filter((t) => t.id !== deleteId))
    setDeleteId(null)
    setIsDeleting(false)
  }

  const openAddModal = () => {
    setEditingTransaction(null)
    setForm({
      type: 'expense',
      category_id: categories.length > 0 ? categories[0].id : '',
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
    })
    setIsModalOpen(true)
  }

  const openEditModal = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setForm({
      type: transaction.type,
      category_id: transaction.category_id,
      description: transaction.description,
      amount: transaction.amount.toString(),
      date: transaction.date,
    })
    setIsModalOpen(true)
  }

  const getCategoryIcon = (id: string) => {
    const cat = categories.find((c) => c.id === id)
    return cat?.icon || '📦'
  }

  const getCategoryName = (id: string) => {
    const cat = categories.find((c) => c.id === id)
    return cat?.name || id
  }

  return (
    <div className="min-h-screen bg-gray-950 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-100">Manajemen Transaksi</h1>
        <Button onClick={openAddModal}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Transaksi
        </Button>
      </div>

      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Cari deskripsi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-gray-900 pl-10 pr-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Semua Tipe</option>
              <option value="income">Pendapatan</option>
              <option value="expense">Pengeluaran</option>
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Semua Kategori</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-4">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </Card>

      {filteredTransactions.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-20 text-center">
          <InboxIcon className="h-14 w-14 text-gray-700 mb-4" />
          <h3 className="text-lg font-medium text-gray-300 mb-1">Tidak ada transaksi</h3>
          <p className="text-sm text-gray-500">Coba ubah filter atau tambah transaksi baru</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {paginatedTransactions.map((t) => (
            <Card key={t.id} className="p-4 hover:bg-gray-800/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-800 text-2xl">
                    {getCategoryIcon(t.category_id)}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-100">{t.description}</h4>
                    <p className="text-sm text-gray-500">
                      {getCategoryName(t.category_id)} • {formatDate(t.date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`text-base font-semibold ${
                      t.type === 'income' ? 'text-emerald-500' : 'text-red-400'
                    }`}
                  >
                    {t.type === 'income' ? '+' : '−'} {formatRupiah(t.amount)}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(t)}
                      className="rounded-lg p-2 hover:bg-gray-700 text-gray-400 hover:text-gray-200 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleteId(t.id)}
                      className="rounded-lg p-2 hover:bg-red-900/30 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-sm text-gray-100 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm text-gray-300">
            Halaman {currentPage} dari {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-sm text-gray-100 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md w-full">
          <DialogHeader>
            <DialogTitle>{editingTransaction ? 'Edit Transaksi' : 'Tambah Transaksi'}</DialogTitle>
          </DialogHeader>
          <DialogClose onClick={() => setIsModalOpen(false)} />
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-400">Tipe</label>
              <Select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as TransactionType })}
              >
                <option value="income">Pendapatan</option>
                <option value="expense">Pengeluaran</option>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-400">Kategori</label>
              <Select
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-400">Jumlah (Rp)</label>
              <Input
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="0"
                min="0"
                step="1000"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-400">Tanggal</label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-400">Deskripsi</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Deskripsi transaksi..."
                rows={3}
                className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 resize-none"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={() => setIsModalOpen(false)}
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

      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="max-w-sm w-full">
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus</DialogTitle>
          </DialogHeader>
          <DialogClose onClick={() => setDeleteId(null)} />
          <p className="text-gray-400 text-sm mt-2">
            Apakah Anda yakin ingin menghapus transaksi ini? Tindakan ini tidak dapat dibatalkan.
          </p>
          <div className="flex gap-3 mt-6">
            <Button variant="secondary" className="flex-1" onClick={() => setDeleteId(null)}>
              Batal
            </Button>
            <Button variant="danger" className="flex-1" onClick={handleDelete} loading={isDeleting}>
              Hapus
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
