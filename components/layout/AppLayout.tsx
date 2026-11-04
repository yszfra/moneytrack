'use client'

import { ReactNode } from 'react'
import Sidebar from './Sidebar'
import ThemeProvider from './ThemeProvider'

interface AppLayoutProps {
  children: ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-[#F5F8FF] dark:bg-[#0B1224] text-slate-900 dark:text-[#F8FAFC]">
        <Sidebar />
        <main className="lg:ml-64 min-h-screen">
          <div className="p-4 lg:p-8 pt-18 lg:pt-8 pb-24 lg:pb-8">
            {children}
          </div>
        </main>
      </div>
    </ThemeProvider>
  )
}
