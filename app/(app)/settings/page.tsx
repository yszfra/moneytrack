'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select } from '@/components/ui/select'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog'
import { User, Lock, Bell, Palette, DollarSign, LogOut, AlertTriangle, Camera, UserCircle } from 'lucide-react'
import { useAuth } from '@/components/layout/AuthProvider'

export default function SettingsPage() {
  const { user } = useAuth()
  const [currency, setCurrency] = useState('IDR')
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    weekly: true,
    monthly: true
  })

  const [changePasswordOpen, setChangePasswordOpen] = useState(false)
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false)
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  })

  const handleProfileSave = () => {
    console.log('Profile saved:', { name: user?.fullName, email: user?.email })
  }

  const handleChangePassword = () => {
    if (!passwords.current || !passwords.new || !passwords.confirm) return
    if (passwords.new !== passwords.confirm) {
      alert('Kata sandi tidak cocok')
      return
    }
    console.log('Password changed')
    setPasswords({ current: '', new: '', confirm: '' })
    setChangePasswordOpen(false)
  }

  const handleDeleteAccount = () => {
    console.log('Account deleted')
    setDeleteAccountOpen(false)
  }

  const handleLogout = async () => {
    const { signOut } = useAuth()
    await signOut()
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-[#101B3D] dark:text-[#F8FAFC]">Pengaturan</h1>

      <div className="max-w-2xl space-y-6">
        {/* Profile Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-[#2563EB]" />
              <CardTitle className="text-[#101B3D] dark:text-[#F8FAFC]">Profil</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-[#2563EB] flex items-center justify-center text-2xl text-white">
                  <UserCircle className="h-10 w-10" />
                </div>
                <button className="absolute bottom-0 right-0 p-1.5 bg-[#101B3D] rounded-full hover:bg-[#101B3D]/80">
                  <Camera className="h-4 w-4 text-white" />
                </button>
              </div>
              <div>
                <p className="text-sm text-[#64748B] dark:text-slate-400">Ubah foto profil Anda</p>
                <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1">Format: JPG, PNG (Max 5MB)</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name" className="text-[#64748B] dark:text-slate-400">Nama Lengkap</Label>
              <Input
                id="name"
                value={user?.fullName || ''}
                onChange={() => {}} // Read-only, synced from auth
                disabled
                className="bg-[#F5F8FF] dark:bg-[#101B3D]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username" className="text-[#64748B] dark:text-slate-400">Nama Pengguna</Label>
              <Input
                id="username"
                value={user?.username || ''}
                onChange={() => {}} // Read-only, synced from auth
                disabled
                className="bg-[#F5F8FF] dark:bg-[#101B3D]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#64748B] dark:text-slate-400">Email (internal)</Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ''}
                onChange={() => {}} // Read-only, internal use only
                disabled
                className="bg-[#F5F8FF] dark:bg-[#101B3D]"
              />
              <p className="text-xs text-[#64748B] dark:text-slate-400">Email digunakan secara internal untuk autentikasi Supabase</p>
            </div>

            <Button onClick={handleProfileSave} className="w-full" disabled>
              Data profil disinkronkan otomatis
            </Button>
          </CardContent>
        </Card>

        {/* Currency Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-[#2563EB]" />
              <CardTitle className="text-[#101B3D] dark:text-[#F8FAFC]">Mata Uang</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currency" className="text-[#64748B] dark:text-slate-400">Pilih Mata Uang</Label>
              <Select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                <option value="IDR">IDR - Rupiah Indonesia</option>
                <option value="USD">USD - Dollar AS</option>
                <option value="EUR">EUR - Euro</option>
                <option value="SGD">SGD - Dollar Singapura</option>
              </Select>
            </div>
            <p className="text-sm text-[#64748B] dark:text-slate-400">
              Semua jumlah uang akan ditampilkan dalam {currency}
            </p>
            <Button className="w-full bg-[#2563EB] hover:bg-[#1D4ED8]">
              Simpan Pengaturan
            </Button>
          </CardContent>
        </Card>

        {/* Theme Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-[#2563EB]" />
              <CardTitle className="text-[#101B3D] dark:text-[#F8FAFC]">Tema</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Label className="text-[#64748B] dark:text-slate-400">Pilih Tema</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setTheme('light')}
                  className={cn(
                    'p-4 rounded-lg border-2 transition-colors text-center',
                    theme === 'light'
                      ? 'border-[#2563EB] bg-[#DBEAFE] dark:bg-[#1E3A5F]'
                      : 'border-[#E2E8F0] dark:border-[#263653] bg-white dark:bg-[#111C35] hover:bg-[#F5F8FF] dark:hover:bg-[#101B3D]'
                  )}
                >
                  <div className="text-sm font-medium text-[#101B3D] dark:text-[#F8FAFC]">☀️ Terang</div>
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={cn(
                    'p-4 rounded-lg border-2 transition-colors text-center',
                    theme === 'dark'
                      ? 'border-[#2563EB] bg-[#DBEAFE] dark:bg-[#1E3A5F]'
                      : 'border-[#E2E8F0] dark:border-[#263653] bg-white dark:bg-[#111C35] hover:bg-[#F5F8FF] dark:hover:bg-[#101B3D]'
                  )}
                >
                  <div className="text-sm font-medium text-[#101B3D] dark:text-[#F8FAFC]">🌙 Gelap</div>
                </button>
              </div>
            </div>
            <Button className="w-full bg-[#2563EB] hover:bg-[#1D4ED8]">
              Simpan Tema
            </Button>
          </CardContent>
        </Card>

        {/* Notifications Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-[#2563EB]" />
              <CardTitle className="text-[#101B3D] dark:text-[#F8FAFC]">Notifikasi</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between py-3 px-3 rounded-lg bg-[#F5F8FF] dark:bg-[#101B3D] border border-[#E2E8F0] dark:border-[#263653]">
                <div>
                  <p className="font-medium text-[#101B3D] dark:text-[#F8FAFC]">Email</p>
                  <p className="text-sm text-[#64748B] dark:text-slate-400">Terima notifikasi melalui email</p>
                </div>
                <Switch checked={notifications.email} onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked })} />
              </div>

              <div className="flex items-center justify-between py-3 px-3 rounded-lg bg-[#F5F8FF] dark:bg-[#101B3D] border border-[#E2E8F0] dark:border-[#263653]">
                <div>
                  <p className="font-medium text-[#101B3D] dark:text-[#F8FAFC]">Push</p>
                  <p className="text-sm text-[#64748B] dark:text-slate-400">Notifikasi browser</p>
                </div>
                <Switch checked={notifications.push} onCheckedChange={(checked) => setNotifications({ ...notifications, push: checked })} />
              </div>

              <div className="flex items-center justify-between py-3 px-3 rounded-lg bg-[#F5F8FF] dark:bg-[#101B3D] border border-[#E2E8F0] dark:border-[#263653]">
                <div>
                  <p className="font-medium text-[#101B3D] dark:text-[#F8FAFC]">SMS</p>
                  <p className="text-sm text-[#64748B] dark:text-slate-400">Notifikasi SMS</p>
                </div>
                <Switch checked={notifications.sms} onCheckedChange={(checked) => setNotifications({ ...notifications, sms: checked })} />
              </div>

              <div className="flex items-center justify-between py-3 px-3 rounded-lg bg-[#F5F8FF] dark:bg-[#101B3D] border border-[#E2E8F0] dark:border-[#263653]">
                <div>
                  <p className="font-medium text-[#101B3D] dark:text-[#F8FAFC]">Laporan Mingguan</p>
                  <p className="text-sm text-[#64748B] dark:text-slate-400">Ringkasan mingguan</p>
                </div>
                <Switch checked={notifications.weekly} onCheckedChange={(checked) => setNotifications({ ...notifications, weekly: checked })} />
              </div>

              <div className="flex items-center justify-between py-3 px-3 rounded-lg bg-[#F5F8FF] dark:bg-[#101B3D] border border-[#E2E8F0] dark:border-[#263653]">
                <div>
                  <p className="font-medium text-[#101B3D] dark:text-[#F8FAFC]">Laporan Bulanan</p>
                  <p className="text-sm text-[#64748B] dark:text-slate-400">Ringkasan bulanan</p>
                </div>
                <Switch checked={notifications.monthly} onCheckedChange={(checked) => setNotifications({ ...notifications, monthly: checked })} />
              </div>
            </div>

            <Button className="w-full bg-[#2563EB] hover:bg-[#1D4ED8]">
              Simpan Preferensi
            </Button>
          </CardContent>
        </Card>

        {/* Account Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-[#2563EB]" />
              <CardTitle className="text-[#101B3D] dark:text-[#F8FAFC]">Keamanan Akun</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start bg-white dark:bg-[#111C35] border-[#E2E8F0] dark:border-[#263653] hover:bg-[#F5F8FF] dark:hover:bg-[#101B3D]"
              onClick={() => setChangePasswordOpen(true)}
            >
              <Lock className="mr-2 h-4 w-4 text-[#2563EB]" />
              <span className="text-[#101B3D] dark:text-[#F8FAFC]">Ubah Kata Sandi</span>
            </Button>

            <Button
              variant="destructive"
              className="w-full justify-start"
              onClick={() => setDeleteAccountOpen(true)}
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              Hapus Akun
            </Button>
          </CardContent>
        </Card>

        {/* Logout */}
        <Button 
          variant="outline" 
          onClick={handleLogout} 
          className="w-full bg-white dark:bg-[#111C35] border-[#E2E8F0] dark:border-[#263653] hover:bg-[#F5F8FF] dark:hover:bg-[#101B3D] text-[#EF4444] border-[#EF4444]"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Keluar
        </Button>
      </div>

      {/* Change Password Dialog */}
      <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
        <DialogContent className="bg-white dark:bg-[#111C3D]">
          <DialogHeader>
            <DialogTitle className="text-[#101B3D] dark:text-[#F8FAFC]">Ubah Kata Sandi</DialogTitle>
            <DialogClose />
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current" className="text-[#64748B] dark:text-slate-400">Kata Sandi Saat Ini</Label>
              <Input
                id="current"
                type="password"
                placeholder="••••••••"
                value={passwords.current}
                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                className="bg-white dark:bg-[#101B3D] border-[#E2E8F0] dark:border-[#263653]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new" className="text-[#64748B] dark:text-slate-400">Kata Sandi Baru</Label>
              <Input
                id="new"
                type="password"
                placeholder="••••••••"
                value={passwords.new}
                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                className="bg-white dark:bg-[#101B3D] border-[#E2E8F0] dark:border-[#263653]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm" className="text-[#64748B] dark:text-slate-400">Konfirmasi Kata Sandi</Label>
              <Input
                id="confirm"
                type="password"
                placeholder="••••••••"
                value={passwords.confirm}
                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                className="bg-white dark:bg-[#101B3D] border-[#E2E8F0] dark:border-[#263653]"
              />
            </div>
            <Button onClick={handleChangePassword} className="w-full bg-[#2563EB] hover:bg-[#1D4ED8]">
              Ubah Kata Sandi
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={deleteAccountOpen} onOpenChange={setDeleteAccountOpen}>
        <DialogContent className="bg-white dark:bg-[#111C3D]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#EF4444]">
              <AlertTriangle className="h-5 w-5" />
              Hapus Akun Selamanya
            </DialogTitle>
            <DialogClose />
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-800 dark:text-red-200">
                Menghapus akun adalah tindakan yang permanen. Semua data, transaksi, dan pengaturan Anda akan dihapus selamanya dan tidak dapat dipulihkan.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-username" className="text-[#64748B] dark:text-slate-400">Ketik nama pengguna Anda untuk konfirmasi</Label>
              <Input
                id="confirm-username"
                placeholder={user?.username || ''}
                disabled
                className="bg-[#F5F8FF] dark:bg-[#101B3D] border-[#E2E8F0] dark:border-[#263653]"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 bg-white dark:bg-[#111C35] border-[#E2E8F0] dark:border-[#263653]"
                onClick={() => setDeleteAccountOpen(false)}
              >
                Batal
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleDeleteAccount}
              >
                Ya, Hapus Akun Saya
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
