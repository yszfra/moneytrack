'use client'

import { supabase } from './supabase'

export interface CategoryItem {
  id: string
  name: string
  type: 'income' | 'expense'
  icon: string
  color: string
}

export interface TransactionItem {
  id: string
  type: 'income' | 'expense'
  amount: number
  category_id: string
  category_name?: string
  category_icon?: string
  date: string
  payment_method: string
  description: string
  created_at: string
}

export interface BudgetItem {
  id: string
  category_id: string
  category_name: string
  category_icon: string
  amount: number
  spent: number
  month: number // 0-11
  year: number
}

export interface SavingsContributionItem {
  id: string
  goal_id: string
  amount: number
  type: 'deposit' | 'withdraw'
  note?: string
  date: string
}

export interface SavingsGoalItem {
  id: string
  name: string
  target_amount: number
  current_amount: number
  target_date: string
  icon: string
  color: string
  contributions?: SavingsContributionItem[]
}

export interface FinancialSummary {
  total_balance: number
  total_income: number
  total_expense: number
  total_savings: number
  transaction_count: number
}

export const DEFAULT_INCOME_CATEGORIES: CategoryItem[] = [
  { id: 'cat-inc-1', name: 'Gaji', type: 'income', icon: 'Briefcase', color: '#2563EB' },
  { id: 'cat-inc-2', name: 'Bisnis', type: 'income', icon: 'TrendingUp', color: '#3B82F6' },
  { id: 'cat-inc-3', name: 'Investasi', type: 'income', icon: 'LineChart', color: '#60A5FA' },
  { id: 'cat-inc-4', name: 'Bonus', type: 'income', icon: 'Award', color: '#F59E0B' },
  { id: 'cat-inc-5', name: 'Pemasukan Lainnya', type: 'income', icon: 'PlusCircle', color: '#64748B' },
]

export const DEFAULT_EXPENSE_CATEGORIES: CategoryItem[] = [
  { id: 'cat-exp-1', name: 'Makanan', type: 'expense', icon: 'Utensils', color: '#EF4444' },
  { id: 'cat-exp-2', name: 'Transportasi', type: 'expense', icon: 'Car', color: '#F97316' },
  { id: 'cat-exp-3', name: 'Belanja', type: 'expense', icon: 'ShoppingBag', color: '#EC4899' },
  { id: 'cat-exp-4', name: 'Hiburan', type: 'expense', icon: 'Film', color: '#8B5CF6' },
  { id: 'cat-exp-5', name: 'Kesehatan', type: 'expense', icon: 'HeartPulse', color: '#06B6D4' },
  { id: 'cat-exp-6', name: 'Pendidikan', type: 'expense', icon: 'GraduationCap', color: '#3B82F6' },
  { id: 'cat-exp-7', name: 'Tagihan', type: 'expense', icon: 'Receipt', color: '#EAB308' },
  { id: 'cat-exp-8', name: 'Tempat Tinggal', type: 'expense', icon: 'Home', color: '#6366F1' },
  { id: 'cat-exp-9', name: 'Pengeluaran Lainnya', type: 'expense', icon: 'MoreHorizontal', color: '#64748B' },
]

const STORAGE_KEYS = {
  TRANSACTIONS: 'moneytrack_transactions',
  CATEGORIES: 'moneytrack_categories',
  BUDGETS: 'moneytrack_budgets',
  SAVINGS: 'moneytrack_savings',
}

function getLocalData<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function setLocalData<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore
  }
}

// Categories
export async function getCategories(): Promise<CategoryItem[]> {
  const local = getLocalData<CategoryItem[]>(STORAGE_KEYS.CATEGORIES, [])
  if (local.length === 0) {
    const initial = [...DEFAULT_INCOME_CATEGORIES, ...DEFAULT_EXPENSE_CATEGORIES]
    setLocalData(STORAGE_KEYS.CATEGORIES, initial)
    return initial
  }
  return local
}

export async function saveCategory(category: Omit<CategoryItem, 'id'> & { id?: string }): Promise<CategoryItem> {
  const categories = await getCategories()
  let saved: CategoryItem
  if (category.id) {
    saved = { ...category, id: category.id }
    const updated = categories.map((c) => (c.id === category.id ? saved : c))
    setLocalData(STORAGE_KEYS.CATEGORIES, updated)
  } else {
    saved = { ...category, id: `cat-${Date.now()}` }
    const updated = [...categories, saved]
    setLocalData(STORAGE_KEYS.CATEGORIES, updated)
  }
  return saved
}

export async function deleteCategory(id: string): Promise<void> {
  const categories = await getCategories()
  const updated = categories.filter((c) => c.id !== id)
  setLocalData(STORAGE_KEYS.CATEGORIES, updated)
}

// Transactions
export async function getTransactions(): Promise<TransactionItem[]> {
  const raw = getLocalData<TransactionItem[]>(STORAGE_KEYS.TRANSACTIONS, [])
  const categories = await getCategories()
  return raw.map((t) => {
    const cat = categories.find((c) => c.id === t.category_id)
    return {
      ...t,
      category_name: cat?.name || t.category_name || 'Lainnya',
      category_icon: cat?.icon || t.category_icon || 'MoreHorizontal',
    }
  })
}

export async function saveTransaction(
  transaction: Omit<TransactionItem, 'id' | 'created_at'> & { id?: string }
): Promise<TransactionItem> {
  const transactions = await getTransactions()
  let saved: TransactionItem

  if (transaction.id) {
    saved = {
      ...transaction,
      id: transaction.id,
      created_at: new Date().toISOString(),
    }
    const updated = transactions.map((t) => (t.id === transaction.id ? saved : t))
    setLocalData(STORAGE_KEYS.TRANSACTIONS, updated)
  } else {
    saved = {
      ...transaction,
      id: `tx-${Date.now()}`,
      created_at: new Date().toISOString(),
    }
    const updated = [saved, ...transactions]
    setLocalData(STORAGE_KEYS.TRANSACTIONS, updated)
  }

  return saved
}

export async function deleteTransaction(id: string): Promise<void> {
  const transactions = await getTransactions()
  const updated = transactions.filter((t) => t.id !== id)
  setLocalData(STORAGE_KEYS.TRANSACTIONS, updated)
}

// Budgets
export async function getBudgets(month?: number, year?: number): Promise<BudgetItem[]> {
  const budgets = getLocalData<BudgetItem[]>(STORAGE_KEYS.BUDGETS, [])
  const transactions = await getTransactions()
  const categories = await getCategories()

  const currentMonth = month !== undefined ? month : new Date().getMonth()
  const currentYear = year !== undefined ? year : new Date().getFullYear()

  // Calculate actual spent per category for the specified month/year
  return budgets
    .filter((b) => b.month === currentMonth && b.year === currentYear)
    .map((b) => {
      const cat = categories.find((c) => c.id === b.category_id)
      const spent = transactions
        .filter((t) => {
          if (t.type !== 'expense' || t.category_id !== b.category_id) return false
          const d = new Date(t.date)
          return d.getMonth() === currentMonth && d.getFullYear() === currentYear
        })
        .reduce((sum, t) => sum + Number(t.amount || 0), 0)

      return {
        ...b,
        category_name: cat?.name || b.category_name || 'Kategori',
        category_icon: cat?.icon || b.category_icon || 'Wallet',
        spent,
      }
    })
}

export async function saveBudget(
  budget: Omit<BudgetItem, 'id' | 'spent'> & { id?: string }
): Promise<BudgetItem> {
  const all = getLocalData<BudgetItem[]>(STORAGE_KEYS.BUDGETS, [])
  const categories = await getCategories()
  const cat = categories.find((c) => c.id === budget.category_id)

  let saved: BudgetItem
  if (budget.id) {
    saved = {
      ...budget,
      id: budget.id,
      category_name: cat?.name || 'Kategori',
      category_icon: cat?.icon || 'Wallet',
      spent: 0,
    }
    const updated = all.map((b) => (b.id === budget.id ? saved : b))
    setLocalData(STORAGE_KEYS.BUDGETS, updated)
  } else {
    // check duplicate for same month/year
    const existingIndex = all.findIndex(
      (b) => b.category_id === budget.category_id && b.month === budget.month && b.year === budget.year
    )
    saved = {
      ...budget,
      id: `bg-${Date.now()}`,
      category_name: cat?.name || 'Kategori',
      category_icon: cat?.icon || 'Wallet',
      spent: 0,
    }
    let updated: BudgetItem[]
    if (existingIndex >= 0) {
      updated = [...all]
      updated[existingIndex] = { ...saved, id: all[existingIndex].id }
      saved.id = all[existingIndex].id
    } else {
      updated = [...all, saved]
    }
    setLocalData(STORAGE_KEYS.BUDGETS, updated)
  }

  return saved
}

export async function deleteBudget(id: string): Promise<void> {
  const all = getLocalData<BudgetItem[]>(STORAGE_KEYS.BUDGETS, [])
  const updated = all.filter((b) => b.id !== id)
  setLocalData(STORAGE_KEYS.BUDGETS, updated)
}

// Savings Goals
export async function getSavingsGoals(): Promise<SavingsGoalItem[]> {
  return getLocalData<SavingsGoalItem[]>(STORAGE_KEYS.SAVINGS, [])
}

export async function saveSavingsGoal(
  goal: Omit<SavingsGoalItem, 'id' | 'current_amount' | 'contributions'> & { id?: string; current_amount?: number }
): Promise<SavingsGoalItem> {
  const all = await getSavingsGoals()
  let saved: SavingsGoalItem

  if (goal.id) {
    const existing = all.find((g) => g.id === goal.id)
    saved = {
      ...goal,
      id: goal.id,
      current_amount: goal.current_amount !== undefined ? goal.current_amount : (existing?.current_amount || 0),
      contributions: existing?.contributions || [],
    }
    const updated = all.map((g) => (g.id === goal.id ? saved : g))
    setLocalData(STORAGE_KEYS.SAVINGS, updated)
  } else {
    saved = {
      ...goal,
      id: `sg-${Date.now()}`,
      current_amount: goal.current_amount || 0,
      contributions: [],
    }
    const updated = [...all, saved]
    setLocalData(STORAGE_KEYS.SAVINGS, updated)
  }

  return saved
}

export async function contributeSavingsGoal(
  goalId: string,
  amount: number,
  type: 'deposit' | 'withdraw' = 'deposit',
  note?: string
): Promise<SavingsGoalItem> {
  const all = await getSavingsGoals()
  const goal = all.find((g) => g.id === goalId)
  if (!goal) throw new Error('Target tabungan tidak ditemukan')

  const change = type === 'deposit' ? amount : -amount
  const newCurrent = Math.max(0, goal.current_amount + change)

  const contribution: SavingsContributionItem = {
    id: `sc-${Date.now()}`,
    goal_id: goalId,
    amount,
    type,
    note,
    date: new Date().toISOString(),
  }

  const updatedGoal: SavingsGoalItem = {
    ...goal,
    current_amount: newCurrent,
    contributions: [contribution, ...(goal.contributions || [])],
  }

  const updatedAll = all.map((g) => (g.id === goalId ? updatedGoal : g))
  setLocalData(STORAGE_KEYS.SAVINGS, updatedAll)

  return updatedGoal
}

export async function deleteSavingsGoal(id: string): Promise<void> {
  const all = await getSavingsGoals()
  const updated = all.filter((g) => g.id !== id)
  setLocalData(STORAGE_KEYS.SAVINGS, updated)
}

// Financial Summary Calculation (ALL REAL DATA, RP0 IF EMPTY)
export async function getFinancialSummary(): Promise<FinancialSummary> {
  const transactions = await getTransactions()
  const savings = await getSavingsGoals()

  const total_income = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0)

  const total_expense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0)

  const total_savings = savings.reduce((sum, g) => sum + Number(g.current_amount || 0), 0)

  // Saldo bersih = Total Pemasukan - Total Pengeluaran
  const total_balance = total_income - total_expense

  return {
    total_balance,
    total_income,
    total_expense,
    total_savings,
    transaction_count: transactions.length,
  }
}
