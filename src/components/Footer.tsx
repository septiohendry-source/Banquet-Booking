import Link from 'next/link'
import { Building2 } from 'lucide-react'

const QUICK_LINKS = [
  { href: '/', label: 'Beranda' },
  { href: '/rooms', label: 'Ruangan' },
  { href: '/packages', label: 'Paket' },
  { href: '/booking', label: 'Buat Booking' },
] as const

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-primary-900 text-white">
      <div className="container-custom py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Company info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-700">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">
                Banquet<span className="text-accent-400">Book</span>
              </span>
            </div>
            <p className="text-sm text-primary-300 leading-relaxed max-w-xs">
              Sistem pemesanan ruang banquet yang mudah dan efisien. Temukan ruangan
              ideal untuk acara Anda.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-primary-400">
              Menu Cepat
            </h3>
            <ul className="space-y-2">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-primary-300 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact placeholder */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-primary-400">
              Kontak
            </h3>
            <ul className="space-y-2 text-sm text-primary-300">
              <li>📧 info@banquetbook.example</li>
              <li>📞 +62 21 1234 5678</li>
              <li>📍 Jakarta, Indonesia</li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-10 border-t border-primary-800 pt-6">
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
            <p className="text-xs text-primary-400">
              &copy; {currentYear} BanquetBook. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
