import { supabase } from './supabase'
import { Tables, InsertTables } from '@/types/database'

export type Category = Tables<'categories'>

const DEFAULT_CATEGORIES = [
  { name: 'Gaji', type: 'income' as const, icon: '💰', color: '#10b981' },
  { name: 'Bisnis', type: 'income' as const, icon: '💼', color: '#06b6d4' },
  { name: 'Investasi', type: 'income' as const, icon: '📈', color: '#8b5cf6' },
  { name: 'Makanan', type: 'expense' as const, icon: '🍔', color: '#f59e0b' },
  { name: 'Transportasi', type: 'expense' as const, icon: '🚗', color: '#ef4444' },
  { name: 'Belanja', type: 'expense' as const, icon: '🛍️', color: '#ec4899' },
  { name: 'Hiburan', type: 'expense' as const, icon: '🎬', color: '#a855f7' },
  { name: 'Kesehatan', type: 'expense' as const, icon: '🏥', color: '#06b6d4' },
  { name: 'Pendidikan', type: 'expense' as const, icon: '📚', color: '#3b82f6' },
  { name: 'Tagihan', type: 'expense' as const, icon: '🧾', color: '#6366f1' },
  { name: 'Lainnya', type: 'expense' as const, icon: '📦', color: '#64748b' },
]

export async function getCategories(userId: string): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data || []
}

export async function createCategory(
  userId: string,
  name: string,
  type: 'income' | 'expense',
  icon: string,
  color: string
): Promise<Category> {
  // Validate duplicate
  const { data: existing } = await supabase
    .from('categories')
    .select('id')
    .eq('user_id', userId)
    .eq('name', name)
    .eq('type', type)
    .single()

  if (existing) {
    throw new Error(`Kategori "${name}" sudah ada untuk tipe ${type === 'income' ? 'pendapatan' : 'pengeluaran'}`)
  }

  const { data, error } = await supabase
    .from('categories')
    .insert({
      user_id: userId,
      name,
      type,
      icon,
      color,
      is_default: false,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateCategory(
  categoryId: string,
  userId: string,
  name: string,
  type: 'income' | 'expense',
  icon: string,
  color: string
): Promise<Category> {
  // Validate duplicate (exclude current category)
  const { data: existing } = await supabase
    .from('categories')
    .select('id')
    .eq('user_id', userId)
    .eq('name', name)
    .eq('type', type)
    .neq('id', categoryId)
    .single()

  if (existing) {
    throw new Error(`Kategori "${name}" sudah ada untuk tipe ${type === 'income' ? 'pendapatan' : 'pengeluaran'}`)
  }

  const { data, error } = await supabase
    .from('categories')
    .update({
      name,
      type,
      icon,
      color,
    })
    .eq('id', categoryId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteCategory(categoryId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', categoryId)
    .eq('user_id', userId)

  if (error) throw error
}

export async function seedDefaultCategories(userId: string): Promise<void> {
  // Check if user already has categories
  const { data: existing } = await supabase
    .from('categories')
    .select('id')
    .eq('user_id', userId)
    .limit(1)

  if (existing && existing.length > 0) {
    return // Already seeded
  }

  // Insert defaults
  const categoriesToInsert = DEFAULT_CATEGORIES.map((cat) => ({
    user_id: userId,
    ...cat,
    is_default: true,
  }))

  const { error } = await supabase.from('categories').insert(categoriesToInsert)
  if (error) throw error
}
