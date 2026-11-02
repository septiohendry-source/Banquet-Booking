import Image from 'next/image'
import { Package, Wifi } from 'lucide-react'
import { formatRupiah } from '@/utils/format'
import { getFacilityImageUrl } from '@/utils/facilityImages'

interface FacilityBadgeProps {
  name: string
  description?: string | null
  price?: number | null
  unit?: string | null
  type?: 'facility' | 'addon'
}

export default function FacilityBadge({
  name,
  description,
  price,
  unit,
  type = 'facility',
}: FacilityBadgeProps) {
  const imageUrl = getFacilityImageUrl(name)
  const badgeClasses =
    type === 'addon'
      ? 'border-accent-200 bg-accent-50 text-accent-800'
      : 'border-primary-200 bg-primary-50 text-primary-700'

  const iconClasses =
    type === 'addon'
      ? 'bg-accent-100 text-accent-700'
      : 'bg-primary-100 text-primary-700'

  const badgeIcon =
    type === 'addon' ? <Package className="h-3.5 w-3.5 flex-shrink-0" /> : <Wifi className="h-3.5 w-3.5 flex-shrink-0" />

  return (
    <span
      className={`inline-flex items-center gap-2.5 rounded-xl border px-2.5 py-1.5 text-xs font-medium shadow-sm ${badgeClasses}`}
      title={description ?? undefined}
    >
      <span className={`relative h-8 w-8 overflow-hidden rounded-md border border-white/70 ${iconClasses}`}>
        <Image
          src={imageUrl}
          alt={name}
          fill
          sizes="32px"
          className="object-cover"
          unoptimized
        />
      </span>

      <span className="flex items-center gap-1.5">
        <span>{name}</span>
        {type === 'addon' && price != null && (
          <span className="text-accent-600">
            {formatRupiah(price)}
            {unit ? `/${unit}` : ''}
          </span>
        )}
      </span>

      {type !== 'addon' && badgeIcon}
    </span>
  )
}
