/**
 * Utility functions untuk formatting tampilan.
 * Semua waktu menggunakan timezone Asia/Jakarta (WIB).
 */

const TIMEZONE = 'Asia/Jakarta'

/**
 * Format angka sebagai mata uang Rupiah Indonesia.
 * Mengembalikan "Belum tersedia" jika nilai null/undefined.
 */
export function formatRupiah(amount: number | null | undefined): string {
  if (amount == null) return 'Belum tersedia'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format tanggal lengkap dalam bahasa Indonesia.
 * Contoh: "Senin, 3 November 2026"
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: TIMEZONE,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d)
}

/**
 * Format tanggal singkat.
 * Contoh: "3 Nov 2026"
 */
export function formatShortDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: TIMEZONE,
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d)
}

/**
 * Format waktu dengan suffix WIB.
 * Contoh: "09:00 WIB"
 */
export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return (
    new Intl.DateTimeFormat('id-ID', {
      timeZone: TIMEZONE,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(d) + ' WIB'
  )
}

/**
 * Format tanggal dan waktu gabungan.
 * Contoh: "Senin, 3 November 2026, 09:00 WIB"
 */
export function formatDateTime(date: Date | string): string {
  return `${formatDate(date)}, ${formatTime(date)}`
}

/**
 * Format input date (YYYY-MM-DD) untuk HTML date input.
 */
export function toInputDate(date: Date): string {
  return date.toLocaleDateString('en-CA', { timeZone: TIMEZONE })
}

/**
 * Format kapasitas orang.
 * Mengembalikan "Belum tersedia" jika null.
 */
export function formatCapacity(capacity: number | null): string {
  if (capacity == null) return 'Belum tersedia'
  return `${capacity} orang`
}

