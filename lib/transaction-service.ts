import { supabase } from './supabase'
import { Transaction } from './supabase'
import { updateProfileBalance } from './profile-service'

export async function getTransactions({
  limit = 10,
  offset = 0,
  search = '',
  category_id,
  type,
  sort = 'date',
  order = 'desc',
}: {
  limit?: number
  offset?: number
  search?: string
  category_id?: string
  type?: 'income' | 'expense'
  sort?: 'date' | 'amount' | 'created_at'
  order?: 'asc' | 'desc'
}) {
  let query = supabase
    .from('transactions')
    .select(
      `
      *,
      category:categories(name, type, color, icon)
    `,
      { count: 'exact' }
    )
    .order(sort, { ascending: order === 'asc' })

  if (search) {
    query = query.or(`description.ilike.%${search}%,categories.name.ilike.%${search}%`)
  }

  if (category_id) {
    query = query.eq('category_id', category_id)
  }

  if (type) {
    query = query.eq('type', type)
  }

  const { data, error, count } = await query.range(offset, offset + limit - 1)

  if (error) {
    console.error('Error fetching transactions:', error)
    throw error
  }

  return { transactions: data as Transaction[], count: count || 0 }
}

export async function getTransactionById(id: string): Promise<Transaction | null> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching transaction:', error)
    return null
  }

  return data as Transaction
}

export async function createTransaction(input: {
  user_id: string
  category_id: string | null
  amount: number
  type: 'income' | 'expense'
  description?: string | null
  payment_method?: string | null
  date: string
}) {
  const { data, error } = await supabase
    .from('transactions')
    .insert([input])
    .select()
    .single()

  if (error) {
    console.error('Error creating transaction:', error)
    throw error
  }

  // Update profile balance
  await updateProfileBalance(input.user_id, input.amount, input.type)

  return data as Transaction
}

export async function updateTransaction(
  id: string,
  input: {
    category_id?: string | null
    amount?: number
    type?: 'income' | 'expense'
    description?: string | null
    payment_method?: string | null
    date?: string
  }
) {
  const existing = await getTransactionById(id)
  if (!existing) {
    throw new Error('Transaction not found')
  }

  // Calculate balance adjustment
  const oldAmount = existing.amount
  const oldType = existing.type
  const newAmount = input.amount ?? oldAmount
  const newType = input.type ?? oldType

  const { data, error } = await supabase
    .from('transactions')
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating transaction:', error)
    throw error
  }

  // Adjust balance: reverse old, apply new
  await updateProfileBalance(existing.user_id, oldAmount, oldType === 'income' ? 'expense' : 'income')
  await updateProfileBalance(existing.user_id, newAmount, newType)

  return data as Transaction
}

export async function deleteTransaction(id: string) {
  const existing = await getTransactionById(id)
  if (!existing) {
    throw new Error('Transaction not found')
  }

  const { error } = await supabase.from('transactions').delete().eq('id', id)

  if (error) {
    console.error('Error deleting transaction:', error)
    throw error
  }

  // Revert balance
  await updateProfileBalance(existing.user_id, existing.amount, existing.type === 'income' ? 'expense' : 'income')

  return true
}

export async function getCategories(): Promise<any[]> {
  const { data, error } = await supabase.from('categories').select('*').order('name')

  if (error) {
    console.error('Error fetching categories:', error)
    throw error
  }

  return data
}

export async function validateExpenseExceedsBalance(userId: string, amount: number): Promise<boolean> {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('total_balance')
    .eq('user_id', userId)
    .single()

  if (error || !profile) {
    // If no profile, allow (will be created on first income)
    return false
  }

  return profile.total_balance < amount
}