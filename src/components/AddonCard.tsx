import Image from 'next/image'
import { Package } from 'lucide-react'
import { formatRupiah } from '@/utils/format'
import { getAddonImageUrl } from '@/utils/addonImages'

interface AddonCardProps {
  name: string
  category: string
  description?: string | null
  price?: number | null
  unit?: string | null
}

export default function AddonCard({
  name,
  category,
  description,
  price,
  unit,
}: AddonCardProps) {
  return (
    <article
      className="card flex h-full flex-col"
      title={description ?? undefined}
    >
      <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
        <Image
          src={getAddonImageUrl(name, category)}
          alt={`Foto ${name}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover"
          unoptimized
        />
        <span className="absolute bottom-2 right-2 rounded bg-black/55 px-2 py-1 text-[10px] font-medium text-white">
          Foto add-on
        </span>
      </div>

      <div className="flex flex-1 items-start gap-3 p-4">
        <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-accent-50 text-accent-700">
          <Package className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <h4 className="font-semibold text-gray-900">{name}</h4>
          {description && (
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-gray-500">
              {description}
            </p>
          )}
          {price != null && (
            <p className="mt-3 text-sm font-semibold text-accent-700">
              {formatRupiah(price)}
              {unit ? `/${unit}` : ''}
            </p>
          )}
        </div>
      </div>
    </article>
  )
}
