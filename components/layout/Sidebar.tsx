'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  Target,
  LineChart,
  FileText,
  Tags,
  Settings,
  Menu,
  X,
  LogOut,
  User,
  Moon,
  Sun
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from './AuthProvider'
import { useTheme } from './ThemeProvider'

const navLinks = [
  { href: '/dashboard', label: 'Beranda', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transaksi', icon: ArrowLeftRight },
  { href: '/budgets', label: 'Anggaran', icon: Wallet },
  { href: '/savings-goals', label: 'Target Tabungan', icon: Target },
  { href: '/analysis', label: 'Analisis Keuangan', icon: LineChart },
  { href: '/reports', label: 'Laporan', icon: FileText },
  { href: '/categories', label: 'Kategori', icon: Tags },
  { href: '/settings', label: 'Pengaturan', icon: Settings },
]

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/login')
    } catch {
      router.push('/login')
    }
  }

  const userDisplayName = user?.fullName || user?.username || user?.email?.split('@')[0] || 'Pengguna'

  return (
    <>
      {/* Mobile top bar */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-white/95 dark:bg-[#111C35]/95 backdrop-blur border-b border-slate-200 dark:border-[#263653] z-40 flex items-center justify-between px-4 lg:hidden">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsOpen(true)}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#101B3D] text-slate-700 dark:text-slate-200"
            aria-label="Buka menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Wallet className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-900 dark:text-[#F8FAFC]">MoneyTrack</span>
          </div>
        </div>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#101B3D] text-slate-600 dark:text-slate-300"
          aria-label="Ganti mode tampilan"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-blue-600" />}
        </button>
      </header>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-50 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Desktop & Mobile Drawer Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full w-64 bg-white dark:bg-[#111C35] border-r border-slate-200 dark:border-[#263653] z-50 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div>
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200 dark:border-[#263653]">
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <Wallet className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-slate-900 dark:text-[#F8FAFC] tracking-tight">MoneyTrack</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 -mt-1 font-medium">Kelola Uang, Raih Masa Depan</span>
              </div>
            </Link>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#101B3D] text-slate-500 lg:hidden"
              aria-label="Tutup menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon
              const isActive = pathname === link.href || (link.href !== '/dashboard' && pathname?.startsWith(link.href))

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all',
                    isActive
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-600/15 dark:text-blue-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#101B3D] hover:text-slate-900 dark:hover:text-[#F8FAFC]'
                  )}
                >
                  <Icon className={cn('w-4 h-4', isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500')} />
                  <span>{link.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* User Profile & Footer Controls */}
        <div className="p-3 border-t border-slate-200 dark:border-[#263653] space-y-2">
          {/* Quick theme toggle */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#101B3D]"
          >
            <span className="flex items-center gap-2">
              {theme === 'dark' ? <Moon className="w-4 h-4 text-blue-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
              <span>{theme === 'dark' ? 'Mode Gelap' : 'Mode Terang'}</span>
            </span>
            <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Ubah</span>
          </button>

          {/* User profile card */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-[#101B3D] border border-slate-100 dark:border-[#263653]">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 font-bold text-xs">
                <User className="w-4 h-4" />
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-slate-900 dark:text-[#F8FAFC] truncate">
                  {userDisplayName}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {user?.email || 'Akun Aktif'}
                </p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              title="Keluar dari Akun"
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white/95 dark:bg-[#111C35]/95 backdrop-blur border-t border-slate-200 dark:border-[#263653] z-40 flex items-center justify-around px-2 lg:hidden">
        <Link
          href="/dashboard"
          className={cn(
            'flex flex-col items-center justify-center py-1 px-2 rounded-lg text-xs font-medium transition-colors',
            pathname === '/dashboard' ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-slate-500 dark:text-slate-400'
          )}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Beranda</span>
        </Link>
        <Link
          href="/transactions"
          className={cn(
            'flex flex-col items-center justify-center py-1 px-2 rounded-lg text-xs font-medium transition-colors',
            pathname?.startsWith('/transactions') ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-slate-500 dark:text-slate-400'
          )}
        >
          <ArrowLeftRight className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Transaksi</span>
        </Link>
        <Link
          href="/budgets"
          className={cn(
            'flex flex-col items-center justify-center py-1 px-2 rounded-lg text-xs font-medium transition-colors',
            pathname?.startsWith('/budgets') ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-slate-500 dark:text-slate-400'
          )}
        >
          <Wallet className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Anggaran</span>
        </Link>
        <Link
          href="/savings-goals"
          className={cn(
            'flex flex-col items-center justify-center py-1 px-2 rounded-lg text-xs font-medium transition-colors',
            pathname?.startsWith('/savings-goals') ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-slate-500 dark:text-slate-400'
          )}
        >
          <Target className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Tabungan</span>
        </Link>
        <Link
          href="/settings"
          className={cn(
            'flex flex-col items-center justify-center py-1 px-2 rounded-lg text-xs font-medium transition-colors',
            pathname?.startsWith('/settings') ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-slate-500 dark:text-slate-400'
          )}
        >
          <Settings className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Setelan</span>
        </Link>
      </nav>
    </>
  )
}
