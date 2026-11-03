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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <Sidebar />
        <main className="lg:ml-64 min-h-screen">
          <div className="p-4 lg:p-8 pt-20 lg:pt-8">
            {children}
          </div>
        </main>
      </div>
    </ThemeProvider>
  )
}
