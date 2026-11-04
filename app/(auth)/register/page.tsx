'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
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
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError('Nama pengguna hanya boleh huruf, angka, dan underscore')
      return false
    }
    if (!fullName) {
      setError('Nama lengkap wajib diisi')
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
    if (password !== confirmPassword) {
      setError('Konfirmasi kata sandi tidak cocok')
      return false
    }
    return true
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const email = `${username}@moneytrack.local`
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            username,
          },
        },
      })

      if (error) {
        if (error.message.includes('User already registered')) {
          setError('Nama pengguna sudah terdaftar')
        } else if (error.message.includes('Email already registered')) {
          setError('Nama pengguna sudah terdaftar')
        } else {
          setError(error.message)
        }
        setLoading(false)
        return
      }

      if (data.user) {
        setSuccess(true)
        setLoading(false)
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      }
    } catch (err) {
      setError('Terjadi kesalahan yang tidak terduga')
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F8FF] dark:bg-[#0B1224] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="rounded-xl bg-green-50 dark:bg-green-900/30 p-4 border border-green-200 dark:border-green-800">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                  Pendaftaran berhasil! Silakan masuk dengan nama pengguna dan kata sandi Anda.
                </h3>
                <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                  <p>Mengalihkan ke halaman masuk...</p>
                </div>
              </div>
            </div>
          </div>
          <div className="text-center">
            <Link href="/login" className="font-medium text-[#2563EB] hover:text-[#3B82F6]">
              Ke halaman masuk
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F8FF] dark:bg-[#0B1224] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-[#101B3D] dark:text-[#F8FAFC]">
            Buat Akun Baru
          </h2>
          <p className="mt-2 text-center text-sm text-[#64748B] dark:text-slate-400">
            Sudah punya akun?{' '}
            <Link href="/login" className="font-medium text-[#2563EB] hover:text-[#3B82F6]">
              Masuk di sini
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          {error && (
            <div className="rounded-xl bg-red-50 dark:bg-red-900/30 p-4 border border-red-200 dark:border-red-800">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">{error}</h3>
                </div>
              </div>
            </div>
          )}
          <div className="rounded-xl border border-[#E2E8F0] dark:border-[#263653] overflow-hidden shadow-sm bg-white dark:bg-[#111C35] space-y-0">
            <div>
              <label htmlFor="full-name" className="sr-only">
                Nama lengkap
              </label>
              <input
                id="full-name"
                name="full-name"
                type="text"
                autoComplete="name"
                required
                className="appearance-none relative block w-full px-4 py-3 border-0 placeholder-[#64748B] dark:placeholder-slate-500 text-[#101B3D] dark:text-[#F8FAFC] rounded-none focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent sm:text-sm bg-transparent"
                placeholder="Nama lengkap"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="border-t border-[#E2E8F0] dark:border-[#263653]">
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
                placeholder="Nama pengguna (min 3 karakter, huruf/angka/_)"
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
                autoComplete="new-password"
                required
                className="appearance-none relative block w-full px-4 py-3 border-0 placeholder-[#64748B] dark:placeholder-slate-500 text-[#101B3D] dark:text-[#F8FAFC] rounded-none focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent sm:text-sm bg-transparent"
                placeholder="Kata sandi (min 6 karakter)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="border-t border-[#E2E8F0] dark:border-[#263653]">
              <label htmlFor="confirm-password" className="sr-only">
                Konfirmasi kata sandi
              </label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none relative block w-full px-4 py-3 border-0 placeholder-[#64748B] dark:placeholder-slate-500 text-[#101B3D] dark:text-[#F8FAFC] rounded-none focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent sm:text-sm bg-transparent"
                placeholder="Konfirmasi kata sandi"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
              {loading ? 'Membuat akun...' : 'Buat Akun'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}