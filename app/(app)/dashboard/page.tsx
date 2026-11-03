'use client'

import { StatCard } from '@/components/dashboard/StatCard'
import { IncomeExpenseChart } from '@/components/dashboard/IncomeExpenseChart'
import { CategoryPieChart } from '@/components/dashboard/CategoryPieChart'
import { RecentTransactions } from '@/components/dashboard/RecentTransactions'
import { BudgetProgress } from '@/components/dashboard/BudgetProgress'
import { Wallet, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react'

export default function DashboardPage() {
  return (
    <div className='min-h-screen bg-black p-6'>
      <div className='mx-auto max-w-7xl space-y-6'>
        {/* Stats Grid */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
          <StatCard title='Total Saldo' value={15000000} icon={Wallet} change={12} trend='up' />
          <StatCard title='Pemasukan' value={8000000} icon={TrendingUp} change={8} trend='up' />
          <StatCard title='Pengeluaran' value={3500000} icon={TrendingDown} change={5} trend='down' />
          <StatCard title='Tabungan' value={5000000} icon={PiggyBank} change={15} trend='up' />
        </div>

        {/* Charts Grid */}
        <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
          <IncomeExpenseChart />
          <CategoryPieChart />
        </div>

        {/* Bottom Grid */}
        <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
          <RecentTransactions />
          <BudgetProgress />
        </div>
      </div>
    </div>
  )
}
