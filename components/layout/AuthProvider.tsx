'use client'

import { createContext, useContext, ReactNode, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface User {
  id: string
  email: string
  username: string
  fullName: string
  avatarUrl: string | null
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session on mount
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.user) {
          const userMetadata = session.user.user_metadata || {}
          const username = userMetadata.username || session.user.email?.split('@')[0] || 'Pengguna'
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            username,
            fullName: userMetadata.full_name || username,
            avatarUrl: userMetadata.avatar_url || null,
          })
        }
      } catch (error) {
        console.error('Auth check failed:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: string, session: import('@supabase/supabase-js').Session | null) => {
      if (session?.user) {
        const userMetadata = session.user.user_metadata || {}
        const username = userMetadata.username || session.user.email?.split('@')[0] || 'Pengguna'
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          username,
          fullName: userMetadata.full_name || username,
          avatarUrl: userMetadata.avatar_url || null,
        })
      } else {
        setUser(null)
      }
    })

    return () => subscription?.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
