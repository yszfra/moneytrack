import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  // Return mock client if not configured
  if (
    !supabaseUrl ||
    !supabaseAnonKey ||
    supabaseUrl.includes('your-supabase-project-url') ||
    supabaseUrl.includes('placeholder.supabase.co')
  ) {
    // Read session from cookie
    const sessionCookie = cookieStore.get('moneytrack_session')
    let user = null
    let session = null
    
    if (sessionCookie) {
      try {
        const sessionData = JSON.parse(decodeURIComponent(sessionCookie.value))
        if (sessionData.expires_at > Date.now() / 1000) {
          user = sessionData.user
          session = sessionData
        }
      } catch {
        // Invalid cookie
      }
    }

    return {
      auth: {
        async getUser() {
          return { data: { user }, error: null }
        },
        async getSession() {
          return { data: { session }, error: null }
        },
      },
      from: (table: string) => ({
        select: () => ({
          eq: () => ({
            single: async () => ({ data: null, error: { code: 'PGRST116' } }),
          }),
        }),
        insert: () => ({
          select: () => ({
            single: async () => ({ data: null, error: null }),
          }),
        }),
        update: () => ({
          eq: () => ({ error: null }),
        }),
      }),
    } as any
  }

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignore in Server Components
          }
        },
      },
    }
  )
}
