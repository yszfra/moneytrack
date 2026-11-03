'use client'

import { useState, useEffect } from 'react'
import { LoadingSpinner } from '@/components/ui/Loading'
import { formatRupiah, cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { Plus, Target, Plane, Smartphone, Calendar, PiggyBank } from 'lucide-react'

interface SavingsGoal {
  id: string
  name: string
  icon: string
  targetAmount: number
  currentAmount: number
  targetDate: string
  color: string
}

export default function SavingsGoalsPage() {
  const [goals, setGoals] = useState<SavingsGoal[]>([
    { id: '1', name: 'Dana Darurat', icon: 'target', targetAmount: 10000000, currentAmount: 4500000, targetDate: '2024-12-31', color: 'emerald' },
    { id: '2', name: 'Liburan', icon: 'plane', targetAmount: 5000000, currentAmount: 2000000, targetDate: '2024-08-15', color: 'blue' },
    { id: '3', name: 'Gadget Baru', icon: 'smartphone', targetAmount: 3000000, currentAmount: 1500000, targetDate: '2024-06-30', color: 'violet' },
  ])

  const [now, setNow] = useState<number>(0)
  useEffect(() => {
    setNow(Date.now())
  }, [])
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
    color: 'emerald'
  })
  const [addAmount, setAddAmount] = useState('')

  const handleAddGoal = () => {
    if (!newGoal.name || !newGoal.targetAmount || !newGoal.targetDate) return

    const newGoalObj: SavingsGoal = {
      id: Date.now().toString(),
      name: newGoal.name,
      icon: newGoal.icon,
      targetAmount: parseInt(newGoal.targetAmount),
      currentAmount: 0,
      targetDate: newGoal.targetDate,
      color: newGoal.color
    }

    setGoals([...goals, newGoalObj])
    setNewGoal({ name: '', targetAmount: '', targetDate: '', icon: 'target', color: 'emerald' })
    setAddGoalOpen(false)
  }

  const handleAddMoney = () => {
    if (!selectedGoalId || !addAmount || parseInt(addAmount) <= 0) return

    setGoals(goals.map(goal => {
      if (goal.id === selectedGoalId) {
        return {
          ...goal,
          currentAmount: goal.currentAmount + parseInt(addAmount)
        }
      }
      return goal
    }))

    setAddAmount('')
    setAddMoneyOpen(false)
    setSelectedGoalId('')
  }

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'target': return <Target className="h-6 w-6" />
      case 'plane': return <Plane className="h-6 w-6" />
      case 'smartphone': return <Smartphone className="h-6 w-6" />
      default: return <PiggyBank className="h-6 w-6" />
    }
  }

  const getColorClass = (color: string) => {
    switch (color) {
      case 'emerald': return 'bg-emerald-500'
      case 'blue': return 'bg-blue-500'
      case 'violet': return 'bg-violet-500'
      default: return 'bg-emerald-500'
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Target Tabungan</h1>
        <Button onClick={() => setAddGoalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Target
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal) => {
          const progress = (goal.currentAmount / goal.targetAmount) * 100
          const daysLeft = now ? Math.ceil((new Date(goal.targetDate).getTime() - now) / (1000 * 60 * 60 * 24)) : 0

          return (
            <Card key={goal.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn('p-2 rounded-lg', getColorClass(goal.color))}>
                      {getIcon(goal.icon)}
                    </div>
                    <div>
                      <CardTitle>{goal.name}</CardTitle>
                      <p className="text-sm text-gray-400">Target: {formatRupiah(goal.targetAmount)}</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">Terkumpul</span>
                      <span className="font-medium">{formatRupiah(goal.currentAmount)}</span>
                    </div>
                    <Progress value={progress} />
                    <div className="text-right text-sm text-gray-400 mt-1">{progress.toFixed(1)}%</div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(goal.targetDate).toLocaleDateString('id-ID')}</span>
                    </div>
                    <div className="text-gray-400">{daysLeft > 0 ? `${daysLeft} hari lagi` : 'Jatuh tempo'}</div>
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
                    <Button variant="outline" className="flex-1">
                      Edit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Add Goal Dialog */}
      <Dialog open={addGoalOpen} onOpenChange={setAddGoalOpen}>
        <DialogContent>
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
                onChange={(e) => setNewGoal({...newGoal, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetAmount">Jumlah Target (Rp)</Label>
              <Input 
                id="targetAmount"
                type="number"
                placeholder="10000000"
                value={newGoal.targetAmount}
                onChange={(e) => setNewGoal({...newGoal, targetAmount: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetDate">Target Tanggal</Label>
              <Input 
                id="targetDate"
                type="date"
                value={newGoal.targetDate}
                onChange={(e) => setNewGoal({...newGoal, targetDate: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="icon">Ikon</Label>
                <Select 
                  id="icon"
                  value={newGoal.icon}
                  onChange={(e) => setNewGoal({...newGoal, icon: e.target.value})}
                >
                  <option value="target">Target</option>
                  <option value="plane">Pesawat</option>
                  <option value="smartphone">Smartphone</option>
                  <option value="piggybank">Celengan</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Warna</Label>
                <Select 
                  id="color"
                  value={newGoal.color}
                  onChange={(e) => setNewGoal({...newGoal, color: e.target.value})}
                >
                  <option value="emerald">Hijau</option>
                  <option value="blue">Biru</option>
                  <option value="violet">Ungu</option>
                </Select>
              </div>
            </div>
            <Button onClick={handleAddGoal} className="w-full">
              Simpan Target
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Money Dialog */}
      <Dialog open={addMoneyOpen} onOpenChange={setAddMoneyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Uang ke Tabungan</DialogTitle>
            <DialogClose />
          </DialogHeader>
          <div className="space-y-4">
            {selectedGoalId && (
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className={cn('p-2 rounded-lg', getColorClass(goals.find(g => g.id === selectedGoalId)?.color || 'emerald'))}>
                    {getIcon(goals.find(g => g.id === selectedGoalId)?.icon || 'target')}
                  </div>
                  <div>
                    <h3 className="font-semibold">{goals.find(g => g.id === selectedGoalId)?.name}</h3>
                    <p className="text-sm text-gray-400">
                      Saat ini: {formatRupiah(goals.find(g => g.id === selectedGoalId)?.currentAmount || 0)}
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
            <Button onClick={handleAddMoney} className="w-full">
              Tambah Uang
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
