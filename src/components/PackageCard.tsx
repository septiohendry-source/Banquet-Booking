import { Check, Clock } from 'lucide-react'
import { formatRupiah } from '@/utils/format'
import type { Package } from '@/types/database'
import PackageSlideshow from '@/components/PackageSlideshow'

interface PackageCardProps {
  pkg: Package
}

export default function PackageCard({ pkg }: PackageCardProps) {
  const packageName = pkg.package_name || pkg.name || 'Paket Meeting'

  return (
    <div className="card flex flex-col">
      <PackageSlideshow />
      <div className="flex flex-1 flex-col p-6">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-lg font-bold text-gray-900">
              {packageName}
            </h3>
            {pkg.price_is_net && (
              <span className="flex-shrink-0 rounded-full bg-green-100 border border-green-300 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                Harga Nett
              </span>
            )}
          </div>
          {pkg.duration_type && (
            <div className="mt-1 inline-flex items-center gap-1 text-xs text-gray-500">
              <Clock className="h-3.5 w-3.5" />
              {pkg.duration_type}
            </div>
          )}
        </div>

        {/* Description / Includes note */}
        {(pkg.includes_description || pkg.description) && (
          <p className="mb-4 text-sm text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
            {pkg.includes_description || pkg.description}
          </p>
        )}

        {/* Includes list */}
        {pkg.includes && pkg.includes.length > 0 && (
          <div className="mb-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Termasuk
            </p>
            <ul className="space-y-1.5">
              {pkg.includes.map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-sm text-gray-600"
                >
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Spacer */}
        <div className="mt-auto">
          {/* Price */}
          <div className="rounded-lg bg-gray-50 p-3">
            {pkg.price_per_pax != null ? (
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-primary-700">
                  {formatRupiah(pkg.price_per_pax)}
                </span>
                <span className="text-xs text-gray-500">/pax/hari</span>
              </div>
            ) : (
              <span className="text-sm font-medium text-gray-400">
                Belum tersedia
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
