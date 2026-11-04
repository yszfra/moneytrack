'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const validateForm = () => {
    if (!username) {
      setError('Nama pengguna wajib diisi')
      return false
    }
    if (username.length < 3) {
      setError('Nama pengguna minimal 3 karakter')
      return false
    }
    if (!password) {
      setError('Kata sandi wajib diisi')
      return false
    }
    if (password.length < 6) {
      setError('Kata sandi minimal 6 karakter')
      return false
    }
    return true
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const email = `${username}@moneytrack.local`
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setError('Nama pengguna atau kata sandi salah')
        } else {
          setError(error.message)
        }
        setLoading(false)
        return
      }

      if (data.user) {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err) {
      setError('Terjadi kesalahan yang tidak terduga')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F8FF] dark:bg-[#0B1224] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-[#101B3D] dark:text-[#F8FAFC]">
            Masuk ke Akun Anda
          </h2>
          <p className="mt-2 text-center text-sm text-[#64748B] dark:text-slate-400">
            Belum punya akun?{' '}
            <Link href="/register" className="font-medium text-[#2563EB] hover:text-[#3B82F6]">
              Daftar di sini
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="rounded-xl bg-red-50 dark:bg-red-900/30 p-4 border border-red-200 dark:border-red-800">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">{error}</h3>
                </div>
              </div>
            </div>
          )}
          <div className="rounded-xl border border-[#E2E8F0] dark:border-[#263653] overflow-hidden shadow-sm bg-white dark:bg-[#111C35]">
            <div>
              <label htmlFor="username" className="sr-only">
                Nama pengguna
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                className="appearance-none relative block w-full px-4 py-3 border-0 placeholder-[#64748B] dark:placeholder-slate-500 text-[#101B3D] dark:text-[#F8FAFC] rounded-none focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent sm:text-sm bg-transparent"
                placeholder="Nama pengguna"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="border-t border-[#E2E8F0] dark:border-[#263653]">
              <label htmlFor="password" className="sr-only">
                Kata sandi
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none relative block w-full px-4 py-3 border-0 placeholder-[#64748B] dark:placeholder-slate-500 text-[#101B3D] dark:text-[#F8FAFC] rounded-none focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent sm:text-sm bg-transparent"
                placeholder="Kata sandi"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2563EB] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
