import { createBrowserClient } from '@supabase/ssr'

let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null

function getClient() {
  if (supabaseInstance) return supabaseInstance

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  // Skip if not configured
  if (
    !supabaseUrl ||
    !supabaseAnonKey ||
    supabaseUrl.includes('your-supabase-project-url') ||
    supabaseUrl.includes('placeholder.supabase.co')
  ) {
    // Return a mock client that won't crash
    supabaseInstance = createBrowserClient(
      'https://placeholder.supabase.co',
      'placeholder-anon-key'
    )
    return supabaseInstance
  }

  supabaseInstance = createBrowserClient(supabaseUrl, supabaseAnonKey)
  return supabaseInstance
}

export const supabase = new Proxy({} as ReturnType<typeof createBrowserClient>, {
  get(target, prop, receiver) {
    const client = getClient()
    return Reflect.get(client, prop, receiver)
  },
})

// Helper to check if Supabase is properly configured
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  return !!(
    url &&
    key &&
    !url.includes('your-supabase-project-url') &&
    !url.includes('placeholder.supabase.co')
  )
}

// Database Types
export type Profile = {
  id: string
  user_id: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
  total_balance: number
  total_income: number
  total_expense: number
  total_savings: number
  updated_at: string
}

export type Category = {
  id: string
  user_id: string
  name: string
  type: 'income' | 'expense'
  color: string | null
  icon: string | null
  created_at: string
}

export type Transaction = {
  id: string
  user_id: string
  category_id: string | null
  amount: number
  type: 'income' | 'expense'
  description: string | null
  payment_method: 'cash' | 'bank_transfer' | 'e_wallet' | 'debit_card' | 'credit_card' | null
  date: string
  created_at: string
}

export type Budget = {
  id: string
  user_id: string
  category_id: string
  amount: number
  month: string
  created_at: string
}

export type SavingsGoal = {
  id: string
  user_id: string
  title: string
  target_amount: number
  current_amount: number
  deadline: string | null
  created_at: string
}

export type SavingsContribution = {
  id: string
  user_id: string
  goal_id: string
  amount: number
  date: string
  created_at: string
}

export type UserPreference = {
  id: string
  user_id: string
  currency: string
  theme: string
  notifications_enabled: boolean
  created_at: string
}
