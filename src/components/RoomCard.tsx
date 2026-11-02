import Link from 'next/link'
import { Users, MapPin } from 'lucide-react'
import { formatRupiah } from '@/utils/format'
import type { Room } from '@/types/database'
import RoomImage from '@/components/RoomImage'

interface RoomCardProps {
  room: Room
}

export default function RoomCard({ room }: RoomCardProps) {
  const roomId = String(room.room_id ?? room.id ?? '')
  const hasTaxAndService =
    room.tax_per_room != null && room.service_per_room != null

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative overflow-hidden">
        <div className="h-56 overflow-hidden">
          <RoomImage room={room} className="relative h-full w-full overflow-hidden" />
        </div>
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {room.room_type && (
            <span className="rounded-full bg-white/90 backdrop-blur px-2.5 py-0.5 text-xs font-semibold text-primary-700 shadow-sm">
              {room.room_type}
            </span>
          )}
          {room.is_dummy && (
            <span className="rounded-full border border-accent-300 bg-accent-100/90 px-2.5 py-0.5 text-xs font-semibold text-accent-700 shadow-sm backdrop-blur">
              Demo
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <h3 className="text-xl font-bold text-gray-900 leading-snug">
            {room.room_name || room.name}
          </h3>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
          {room.capacity != null && (
            <span className="inline-flex items-center gap-1.5">
              <Users className="h-4 w-4 text-primary-500" />
              {room.capacity} orang
            </span>
          )}
          {room.location && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-primary-500" />
              {room.location}
            </span>
          )}
        </div>

        {(room.notes || room.description) && (
          <p className="mb-4 text-sm leading-relaxed text-gray-500 line-clamp-2">
            {room.notes || room.description}
          </p>
        )}

        <div className="mt-auto">
          <div className="mb-4 rounded-xl bg-gray-50 p-3.5">
            {room.base_price != null ? (
              <>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-primary-700">
                    {formatRupiah(room.base_price)}
                  </span>
                  <span className="text-xs text-gray-500">/hari</span>
                </div>
                {!hasTaxAndService && (
                  <p className="mt-1 text-xs text-amber-600">
                    Pajak &amp; biaya layanan belum ditetapkan
                  </p>
                )}
              </>
            ) : (
              <span className="text-sm font-medium text-gray-400">
                Belum tersedia
              </span>
            )}
          </div>

          <Link
            href={`/rooms/${encodeURIComponent(roomId)}`}
            className="btn-primary block w-full text-center text-sm"
          >
            Lihat Detail
          </Link>
        </div>
      </div>
    </div>
  )
}
