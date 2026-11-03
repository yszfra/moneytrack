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
import { User, Lock, Bell, Palette, DollarSign, LogOut, AlertTriangle, Camera } from 'lucide-react'

export default function SettingsPage() {
  const [profile, setProfile] = useState({
    name: 'Budi Santoso',
    email: 'budi@example.com',
    avatar: '👤'
  })

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
    console.log('Profile saved:', profile)
  }

  const handleChangePassword = () => {
    if (!passwords.current || !passwords.new || !passwords.confirm) return
    if (passwords.new !== passwords.confirm) {
      alert('Password tidak cocok')
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

  const handleLogout = () => {
    console.log('Logout')
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Pengaturan</h1>

      <div className="max-w-2xl space-y-6">
        {/* Profile Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <CardTitle>Profil</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-emerald-600 flex items-center justify-center text-2xl">
                  {profile.avatar}
                </div>
                <button className="absolute bottom-0 right-0 p-1.5 bg-gray-700 rounded-full hover:bg-gray-600">
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <div>
                <p className="text-sm text-gray-400">Ubah foto profil Anda</p>
                <p className="text-xs text-gray-500 mt-1">Format: JPG, PNG (Max 5MB)</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input
                id="name"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              />
            </div>

            <Button onClick={handleProfileSave} className="w-full">
              Simpan Perubahan
            </Button>
          </CardContent>
        </Card>

        {/* Currency Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              <CardTitle>Mata Uang</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Pilih Mata Uang</Label>
              <Select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                <option value="IDR">IDR - Rupiah Indonesia</option>
                <option value="USD">USD - Dollar AS</option>
                <option value="EUR">EUR - Euro</option>
                <option value="SGD">SGD - Dollar Singapura</option>
              </Select>
            </div>
            <p className="text-sm text-gray-400">
              Semua jumlah uang akan ditampilkan dalam {currency}
            </p>
            <Button className="w-full">
              Simpan Pengaturan
            </Button>
          </CardContent>
        </Card>

        {/* Theme Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              <CardTitle>Tema</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Label>Pilih Tema</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setTheme('light')}
                  className={cn(
                    'p-4 rounded-lg border-2 transition-colors text-center',
                    theme === 'light'
                      ? 'border-emerald-500 bg-gray-100'
                      : 'border-gray-700 bg-gray-800 hover:bg-gray-700'
                  )}
                >
                  <div className="text-sm font-medium text-black">☀️ Terang</div>
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={cn(
                    'p-4 rounded-lg border-2 transition-colors text-center',
                    theme === 'dark'
                      ? 'border-emerald-500 bg-gray-800'
                      : 'border-gray-700 bg-gray-800 hover:bg-gray-700'
                  )}
                >
                  <div className="text-sm font-medium text-white">🌙 Gelap</div>
                </button>
              </div>
            </div>
            <Button className="w-full">
              Simpan Tema
            </Button>
          </CardContent>
        </Card>

        {/* Notifications Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <CardTitle>Notifikasi</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between py-3 px-3 rounded-lg bg-gray-800">
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-sm text-gray-400">Terima notifikasi melalui email</p>
                </div>
                <Switch checked={notifications.email} onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked })} />
              </div>

              <div className="flex items-center justify-between py-3 px-3 rounded-lg bg-gray-800">
                <div>
                  <p className="font-medium">Push</p>
                  <p className="text-sm text-gray-400">Notifikasi browser</p>
                </div>
                <Switch checked={notifications.push} onCheckedChange={(checked) => setNotifications({ ...notifications, push: checked })} />
              </div>

              <div className="flex items-center justify-between py-3 px-3 rounded-lg bg-gray-800">
                <div>
                  <p className="font-medium">SMS</p>
                  <p className="text-sm text-gray-400">Notifikasi SMS</p>
                </div>
                <Switch checked={notifications.sms} onCheckedChange={(checked) => setNotifications({ ...notifications, sms: checked })} />
              </div>

              <div className="flex items-center justify-between py-3 px-3 rounded-lg bg-gray-800">
                <div>
                  <p className="font-medium">Laporan Mingguan</p>
                  <p className="text-sm text-gray-400">Ringkasan mingguan</p>
                </div>
                <Switch checked={notifications.weekly} onCheckedChange={(checked) => setNotifications({ ...notifications, weekly: checked })} />
              </div>

              <div className="flex items-center justify-between py-3 px-3 rounded-lg bg-gray-800">
                <div>
                  <p className="font-medium">Laporan Bulanan</p>
                  <p className="text-sm text-gray-400">Ringkasan bulanan</p>
                </div>
                <Switch checked={notifications.monthly} onCheckedChange={(checked) => setNotifications({ ...notifications, monthly: checked })} />
              </div>
            </div>

            <Button className="w-full">
              Simpan Preferensi
            </Button>
          </CardContent>
        </Card>

        {/* Account Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              <CardTitle>Keamanan Akun</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => setChangePasswordOpen(true)}
            >
              <Lock className="mr-2 h-4 w-4" />
              Ubah Password
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
        <Button variant="outline" onClick={handleLogout} className="w-full">
          <LogOut className="mr-2 h-4 w-4" />
          Keluar
        </Button>
      </div>

      {/* Change Password Dialog */}
      <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ubah Password</DialogTitle>
            <DialogClose />
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current">Password Saat Ini</Label>
              <Input
                id="current"
                type="password"
                placeholder="••••••••"
                value={passwords.current}
                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new">Password Baru</Label>
              <Input
                id="new"
                type="password"
                placeholder="••••••••"
                value={passwords.new}
                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Konfirmasi Password</Label>
              <Input
                id="confirm"
                type="password"
                placeholder="••••••••"
                value={passwords.confirm}
                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
              />
            </div>
            <Button onClick={handleChangePassword} className="w-full">
              Ubah Password
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={deleteAccountOpen} onOpenChange={setDeleteAccountOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-500">
              <AlertTriangle className="h-5 w-5" />
              Hapus Akun Selamanya
            </DialogTitle>
            <DialogClose />
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-sm text-red-400">
                Menghapus akun adalah tindakan yang permanen. Semua data, transaksi, dan pengaturan Anda akan dihapus selamanya dan tidak dapat dipulihkan.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-email">Ketik email Anda untuk konfirmasi</Label>
              <Input
                id="confirm-email"
                placeholder={profile.email}
                disabled
                className="bg-gray-800"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
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
