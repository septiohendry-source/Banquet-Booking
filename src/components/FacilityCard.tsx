import Image from 'next/image'
import type { Facility } from '@/types/database'
import { getFacilityImageUrl } from '@/utils/facilityImages'

interface FacilityCardProps {
  facility: Facility
}

export default function FacilityCard({ facility }: FacilityCardProps) {
  const name = facility.facility_name || facility.name || 'Fasilitas'
  const description =
    facility.notes || facility.description || 'Informasi fasilitas belum tersedia.'

  return (
    <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow duration-300 hover:shadow-lg">
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <Image
          src={getFacilityImageUrl(name)}
          alt={`Foto ${name}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 hover:scale-105"
          unoptimized
        />
      </div>
      <div className="p-4">
        <h4 className="text-base font-bold text-gray-900">{name}</h4>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">
          {description}
        </p>
      </div>
    </article>
  )
}
