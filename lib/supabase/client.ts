import { createBrowserClient } from '@supabase/ssr'

let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null
let mockAuthState: { user: any; session: any } | null = null
let mockAuthListeners: Array<(event: string, session: any) => void> = []

function setSessionCookie(session: any) {
  if (typeof document !== 'undefined') {
    const cookieValue = encodeURIComponent(JSON.stringify(session))
    document.cookie = `moneytrack_session=${cookieValue}; path=/; max-age=3600; SameSite=Lax`
  }
}

function clearSessionCookie() {
  if (typeof document !== 'undefined') {
    document.cookie = 'moneytrack_session=; path=/; max-age=0; SameSite=Lax'
  }
}

function getSessionFromCookie() {
  if (typeof document === 'undefined') return null
  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === 'moneytrack_session') {
      try {
        return JSON.parse(decodeURIComponent(value))
      } catch {
        return null
      }
    }
  }
  return null
}

function getMockClient() {
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  return {
    auth: {
      async signUp({ email, password, options }: any) {
        await delay(500)
        const username = email.replace('@moneytrack.local', '')
        const existingUsers = JSON.parse(localStorage.getItem('moneytrack_users') || '[]')
        if (existingUsers.find((u: any) => u.email === email || u.username === username)) {
          return { data: { user: null }, error: { message: 'User already registered' } }
        }
        const user = {
          id: crypto.randomUUID(),
          email,
          user_metadata: {
            full_name: options?.data?.full_name,
            username: options?.data?.username,
          },
          created_at: new Date().toISOString(),
        }
        existingUsers.push({ ...user, password, username })
        localStorage.setItem('moneytrack_users', JSON.stringify(existingUsers))
        
        const session = {
          access_token: 'mock-token-' + crypto.randomUUID(),
          refresh_token: 'mock-refresh-' + crypto.randomUUID(),
          expires_in: 3600,
          expires_at: Date.now() / 1000 + 3600,
          token_type: 'bearer',
          user,
        }
        
        mockAuthState = { user, session }
        localStorage.setItem('moneytrack_session', JSON.stringify(session))
        setSessionCookie(session)
        mockAuthListeners.forEach(cb => cb('SIGNED_IN', session))
        
        return { data: { user, session }, error: null }
      },

      async signInWithPassword({ email, password }: any) {
        await delay(500)
        const users = JSON.parse(localStorage.getItem('moneytrack_users') || '[]')
        const user = users.find((u: any) => u.email === email && u.password === password)
        if (!user) {
          return { data: { user: null, session: null }, error: { message: 'Invalid login credentials' } }
        }
        const { password: _, ...userWithoutPassword } = user
        const session = {
          access_token: 'mock-token-' + crypto.randomUUID(),
          refresh_token: 'mock-refresh-' + crypto.randomUUID(),
          expires_in: 3600,
          expires_at: Date.now() / 1000 + 3600,
          token_type: 'bearer',
          user: userWithoutPassword,
        }
        
        mockAuthState = { user: userWithoutPassword, session }
        localStorage.setItem('moneytrack_session', JSON.stringify(session))
        setSessionCookie(session)
        mockAuthListeners.forEach(cb => cb('SIGNED_IN', session))
        
        return { data: { user: userWithoutPassword, session }, error: null }
      },

      async signOut() {
        await delay(200)
        mockAuthState = null
        localStorage.removeItem('moneytrack_session')
        clearSessionCookie()
        mockAuthListeners.forEach(cb => cb('SIGNED_OUT', null))
        return { error: null }
      },

      async getSession() {
        await delay(100)
        const storedSession = localStorage.getItem('moneytrack_session')
        if (storedSession) {
          const session = JSON.parse(storedSession)
          if (session.expires_at > Date.now() / 1000) {
            return { data: { session }, error: null }
          } else {
            localStorage.removeItem('moneytrack_session')
            clearSessionCookie()
          }
        }
        return { data: { session: mockAuthState?.session || null }, error: null }
      },

      onAuthStateChange(callback: (event: string, session: any) => void) {
        mockAuthListeners.push(callback)
        
        const storedSession = localStorage.getItem('moneytrack_session')
        if (storedSession) {
          const session = JSON.parse(storedSession)
          if (session.expires_at > Date.now() / 1000) {
            const user = session.user
            mockAuthState = { user, session }
            setTimeout(() => callback('INITIAL_SESSION', session), 0)
          }
        }
        
        return {
          data: {
            subscription: {
              unsubscribe: () => {
                const idx = mockAuthListeners.indexOf(callback)
                if (idx > -1) mockAuthListeners.splice(idx, 1)
              },
            },
          },
        }
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

function getClient() {
  if (supabaseInstance) return supabaseInstance

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  if (
    !supabaseUrl ||
    !supabaseAnonKey ||
    supabaseUrl.includes('your-supabase-project-url') ||
    supabaseUrl.includes('placeholder.supabase.co')
  ) {
    supabaseInstance = getMockClient()
    return supabaseInstance
  }

  supabaseInstance = createBrowserClient(supabaseUrl, supabaseAnonKey)
  return supabaseInstance
}

export function createClient() {
  return new Proxy({} as ReturnType<typeof createBrowserClient>, {
    get(target, prop, receiver) {
      const client = getClient()
      return Reflect.get(client, prop, receiver)
    },
  })
}
