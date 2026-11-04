import { supabase } from './supabase'

export async function createProfile(
  userId: string,
  username: string,
  fullName: string,
  email: string
) {
  const { data: existing, error: fetchError } = await supabase
    .from('profiles')
    .select('user_id')
    .eq('user_id', userId)
    .single()

  if (existing) {
    return existing
  }

  const { data, error } = await supabase.from('profiles').insert([{
    user_id: userId,
    username,
    full_name: fullName,
    total_balance: 0,
    total_income: 0,
    total_expense: 0,
    total_savings: 0,
  }]).select().single()

  if (error) {
    console.error('Error creating profile:', error)
    throw error
  }

  return data
}

export async function updateProfileBalance(
  userId: string,
  amount: number,
  type: 'income' | 'expense',
  username?: string,
  fullName?: string,
  email?: string
) {
  // Get current profile
  const { data: profile, error: fetchError } = await supabase
    .from('profiles')
    .select('total_balance')
    .eq('user_id', userId)
    .single()

  if (fetchError && fetchError.code !== 'PGRST116') {
    // PGRST116 is not found
    console.error('Error fetching profile:', fetchError)
    throw fetchError
  }

  const currentBalance = profile?.total_balance ?? 0
  const adjustment = type === 'income' ? amount : -amount
  const newBalance = currentBalance + adjustment

  if (!profile) {
    // Insert new profile
    const { error: insertError } = await supabase.from('profiles').insert([{
      user_id: userId,
      username: username || null,
      full_name: fullName || null,
      total_balance: newBalance,
      total_income: type === 'income' ? amount : 0,
      total_expense: type === 'expense' ? amount : 0,
      total_savings: 0,
    }])

    if (insertError) {
      console.error('Error creating profile:', insertError)
      throw insertError
    }
  } else {
    // Update existing profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ total_balance: newBalance, updated_at: new Date().toISOString() })
      .eq('user_id', userId)

    if (updateError) {
      console.error('Error updating profile:', updateError)
      throw updateError
    }
  }

  return newBalance
}

export async function getProfileBalance(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from('profiles')
    .select('total_balance')
    .eq('user_id', userId)
    .single()

  if (error) {
    console.error('Error fetching profile balance:', error)
    return 0
  }

  return data?.total_balance ?? 0
}
