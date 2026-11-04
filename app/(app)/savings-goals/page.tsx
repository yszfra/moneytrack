'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/layout/AuthProvider'
import { LoadingSpinner, LoadingPage } from '@/components/ui/Loading'
import { formatRupiah, cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Plus, Target, Plane, Smartphone, Calendar, Wallet, Trash2, Edit, Loader2 } from 'lucide-react'
import {
  getSavingsGoals,
  saveSavingsGoal,
  deleteSavingsGoal,
  contributeSavingsGoal,
  SavingsGoalItem,
} from '@/lib/store'

const ICON_MAP: Record<string, React.ElementType> = {
  target: Target,
  plane: Plane,
  smartphone: Smartphone,
  wallet: Wallet,
}

export default function SavingsGoalsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [goals, setGoals] = useState<SavingsGoalItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [now, setNow] = useState<number>(0)
  const [addGoalOpen, setAddGoalOpen] = useState(false)
  const [addMoneyOpen, setAddMoneyOpen] = useState(false)
  const [selectedGoalId, setSelectedGoalId] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [newGoal, setNewGoal] = useState({
    name: '',
    targetAmount: '',
    targetDate: '',
    icon: 'target',
    color: '#2563EB',
  })
  const [addAmount, setAddAmount] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      setIsLoading(false)
      return
    }
    loadGoals()
  }, [user, authLoading])

  useEffect(() => {
    setNow(Date.now())
  }, [])

  const loadGoals = async () => {
    if (!user) return
    try {
      setIsLoading(true)
      setError(null)
      const data = await getSavingsGoals()
      setGoals(data)
    } catch (err: any) {
      console.error('Failed to load savings goals:', err)
      setError('Gagal memuat target tabungan')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddGoal = async () => {
    if (!user || !newGoal.name || !newGoal.targetAmount || !newGoal.targetDate) return

    const targetAmount = parseInt(newGoal.targetAmount)
    if (isNaN(targetAmount) || targetAmount <= 0) {
      setError('Jumlah target harus lebih dari 0')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const newGoalObj = await saveSavingsGoal({
        name: newGoal.name,
        target_amount: targetAmount,
        current_amount: 0,
        target_date: newGoal.targetDate,
        icon: newGoal.icon,
        color: newGoal.color,
      })
      setGoals([...goals, newGoalObj])
      setNewGoal({ name: '', targetAmount: '', targetDate: '', icon: 'target', color: '#2563EB' })
      setAddGoalOpen(false)
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan target')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddMoney = async () => {
    if (!selectedGoalId || !addAmount || parseInt(addAmount) <= 0) return

    const amount = parseInt(addAmount)
    setIsSubmitting(true)
    setError(null)

    try {
      const updated = await contributeSavingsGoal(selectedGoalId, amount, 'deposit')
      setGoals(goals.map((g) => (g.id === selectedGoalId ? updated : g)))
      setAddAmount('')
      setAddMoneyOpen(false)
      setSelectedGoalId('')
    } catch (err: any) {
      setError(err.message || 'Gagal menambah uang')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!user) return
    try {
      await deleteSavingsGoal(id)
      setGoals((prev) => prev.filter((g) => g.id !== id))
    } catch (err: any) {
      setError(err.message || 'Gagal menghapus target')
    }
  }

  const handleConfirmDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus target tabungan ini?')) {
      handleDelete(id)
    }
  }

  const getIcon = (iconName: string) => {
    const Icon = ICON_MAP[iconName] || Target
    return <Icon className="h-6 w-6" />
  }

  const getColorClass = (color: string) => {
    return `bg-[${color}]`
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

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Target Tabungan</h1>
        <Button onClick={() => setAddGoalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Target
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-destructive text-sm">
          {error}
        </div>
      )}

      {goals.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-20 text-center">
          <Target className="h-14 w-14 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-1">Belum ada target tabungan</h3>
          <p className="text-sm text-muted-foreground mb-4">Mulai menabung dengan membuat target tabungan pertama</p>
          <Button onClick={() => setAddGoalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Target
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => {
            const progress = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0
            const daysLeft = now ? Math.ceil((new Date(goal.target_date).getTime() - now) / (1000 * 60 * 60 * 24)) : 0

            return (
              <Card key={goal.id} className="hover:bg-accent/30 transition-colors">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn('p-3 rounded-lg', getColorClass(goal.color))}>
                        {getIcon(goal.icon)}
                      </div>
                      <div>
                        <CardTitle>{goal.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">Target: {formatRupiah(goal.target_amount)}</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Terkumpul</span>
                        <span className="font-medium text-foreground">{formatRupiah(goal.current_amount)}</span>
                      </div>
                      <Progress value={progress} />
                      <div className="text-right text-sm text-muted-foreground mt-1">{progress.toFixed(1)}%</div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(goal.target_date).toLocaleDateString('id-ID')}</span>
                      </div>
                      <div className="text-muted-foreground">{daysLeft > 0 ? `${daysLeft} hari lagi` : 'Jatuh tempo'}</div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        onClick={() => {
                          setSelectedGoalId(goal.id)
                          setAddMoneyOpen(true)
                        }}
                      >
                        Tambah Uang
                      </Button>
                      <Button variant="outline" className="flex-1" onClick={() => handleConfirmDelete(goal.id)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Hapus
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Add Goal Dialog */}
      <Dialog open={addGoalOpen} onOpenChange={setAddGoalOpen}>
        <DialogContent className="max-w-md w-full">
          <DialogHeader>
            <DialogTitle>Tambah Target Tabungan</DialogTitle>
            <DialogClose />
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Target</Label>
              <Input
                id="name"
                placeholder="Contoh: Dana Darurat"
                value={newGoal.name}
                onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetAmount">Jumlah Target (Rp)</Label>
              <Input
                id="targetAmount"
                type="number"
                placeholder="10000000"
                value={newGoal.targetAmount}
                onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetDate">Target Tanggal</Label>
              <Input
                id="targetDate"
                type="date"
                value={newGoal.targetDate}
                onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="icon">Ikon</Label>
                            <select
                              id="icon"
                              value={newGoal.icon}
                              onChange={(e) => setNewGoal({ ...newGoal, icon: e.target.value })}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <option value="target">Target</option>
                              <option value="plane">Pesawat</option>
                              <option value="smartphone">Smartphone</option>
                              <option value="wallet">Dompet</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="color">Warna</Label>
                            <select
                              id="color"
                              value={newGoal.color}
                              onChange={(e) => setNewGoal({ ...newGoal, color: e.target.value })}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <option value="#2563EB">Biru</option>
                              <option value="#3B82F6">Biru Terang</option>
                              <option value="#60A5FA">Biru Muda</option>
                              <option value="#10B981">Hijau</option>
                              <option value="#F59E0B">Kuning</option>
                              <option value="#EF4444">Merah</option>
                              <option value="#8B5CF6">Ungu</option>
                              <option value="#EC4899">Pink</option>
                            </select>
                          </div>
                        </div>
            <Button onClick={handleAddGoal} className="w-full" loading={isSubmitting}>
              Simpan Target
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Money Dialog */}
      <Dialog open={addMoneyOpen} onOpenChange={setAddMoneyOpen}>
        <DialogContent className="max-w-md w-full">
          <DialogHeader>
            <DialogTitle>Tambah Uang ke Tabungan</DialogTitle>
            <DialogClose />
          </DialogHeader>
          <div className="space-y-4">
            {selectedGoalId && (
              <div className="bg-accent rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className={cn('p-2 rounded-lg', getColorClass(goals.find((g) => g.id === selectedGoalId)?.color || '#2563EB'))}>
                    {getIcon(goals.find((g) => g.id === selectedGoalId)?.icon || 'target')}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{goals.find((g) => g.id === selectedGoalId)?.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Saat ini: {formatRupiah(goals.find((g) => g.id === selectedGoalId)?.current_amount || 0)}
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="amount">Jumlah (Rp)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="100000"
                value={addAmount}
                onChange={(e) => setAddAmount(e.target.value)}
              />
            </div>
            <Button onClick={handleAddMoney} className="w-full" loading={isSubmitting}>
              Tambah Uang
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
