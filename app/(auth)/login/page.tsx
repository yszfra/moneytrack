'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Wallet, Mail, Lock } from 'lucide-react'

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Login attempt:', formData)
    // TODO: Implement actual Supabase authentication
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center space-y-2">
        <div className="flex justify-center mb-2">
          <div className="p-3 bg-emerald-600 rounded-xl">
            <Wallet className="h-8 w-8" />
          </div>
        </div>
        <CardTitle className="text-2xl">MoneyTrack</CardTitle>
        <p className="text-sm text-gray-400">Masuk ke akun Anda</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="nama@example.com"
                className="pl-10"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="pl-10"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded border-gray-700" />
              <span className="text-gray-400">Ingat saya</span>
            </label>
            <Link href="/forgot-password" className="text-emerald-500 hover:text-emerald-400">
              Lupa password?
            </Link>
          </div>

          <Button type="submit" className="w-full" size="lg">
            Masuk
          </Button>

          <div className="text-center text-sm text-gray-400">
            Belum punya akun?{' '}
            <Link href="/register" className="text-emerald-500 hover:text-emerald-400 font-medium">
              Daftar
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
