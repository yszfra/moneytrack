import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = 'IDR'): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount)
}

// Alias for backward compatibility
export const formatRupiah = formatCurrency

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d)
}

export function formatDateInput(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toISOString().split('T')[0]
}

export const paymentMethods = [
  { value: 'cash', label: 'Cash' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'e_wallet', label: 'E-Wallet' },
  { value: 'debit_card', label: 'Kartu Debit' },
  { value: 'credit_card', label: 'Kartu Kredit' },
] as const

export type PaymentMethod = typeof paymentMethods[number]['value']

export function getPaymentMethodLabel(method: PaymentMethod | null): string {
  const found = paymentMethods.find(m => m.value === method)
  return found?.label || 'Tidak diketahui'
}