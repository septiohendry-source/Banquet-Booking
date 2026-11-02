import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Building2, MapPin, Users } from 'lucide-react'
import RoomImage from '@/components/RoomImage'
import { supabase } from '@/lib/supabase'
import { formatRupiah } from '@/utils/format'
import type { Room } from '@/types/database'

export const revalidate = 60

interface RoomDetailPageProps {
  params: {
    roomId: string
  }
}

export async function generateMetadata({
  params,
}: RoomDetailPageProps): Promise<Metadata> {
  const { data: room, error } = await supabase
    .from('rooms')
    .select('room_name')
    .eq('room_id', params.roomId)
    .eq('is_active', true)
    .maybeSingle()

  if (error) {
    return { title: 'Detail Ruangan — Banquet Booking' }
  }

  return {
    title: room
      ? `${room.room_name} — Banquet Booking`
      : 'Detail Ruangan — Banquet Booking',
  }
}

export default async function RoomDetailPage({
  params,
}: RoomDetailPageProps) {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('room_id', params.roomId)
    .eq('is_active', true)
    .maybeSingle()

  if (error) {
    return (
      <section className="bg-gray-50 min-h-screen py-16">
        <div className="container-custom max-w-4xl">
          <Link
            href="/rooms"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-primary-700 hover:text-primary-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke daftar ruangan
          </Link>
          <div className="card p-8 text-center">
            <h1 className="text-xl font-bold text-red-600">
              Gagal memuat detail ruangan
            </h1>
            <p className="mt-2 text-sm text-gray-600">{error.message}</p>
          </div>
        </div>
      </section>
    )
  }

  if (!data) {
    notFound()
  }

  const room = data as Room
  const roomName = room.room_name || room.name || 'Ruangan'
  const description =
    room.notes || room.description || 'Informasi detail ruangan belum tersedia.'

  return (
    <section className="bg-gray-50 min-h-screen py-12 md:py-16">
      <div className="container-custom max-w-6xl">
        <Link
          href="/rooms"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-primary-700 transition hover:text-primary-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke daftar ruangan
        </Link>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="h-64 sm:h-80 md:h-[26rem]">
            <RoomImage
              room={room}
              className="group relative h-full w-full overflow-hidden"
              sizes="(max-width: 768px) 100vw, 1152px"
              priority
            />
          </div>

          <div className="grid gap-8 p-6 md:grid-cols-[1fr_19rem] md:p-10">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                {room.room_type && (
                  <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">
                    {room.room_type}
                  </span>
                )}
                {room.is_dummy && (
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                    Data demo
                  </span>
                )}
              </div>

              <h1 className="mt-4 text-3xl font-bold text-gray-900">
                {roomName}
              </h1>
              <p className="mt-4 whitespace-pre-line leading-relaxed text-gray-600">
                {description}
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3 rounded-xl bg-gray-50 p-4">
                  <Users className="mt-0.5 h-5 w-5 text-primary-600" />
                  <div>
                    <p className="text-xs text-gray-500">Kapasitas</p>
                    <p className="mt-1 font-semibold text-gray-900">
                      {room.capacity != null
                        ? `${room.capacity} orang`
                        : 'Belum tersedia'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl bg-gray-50 p-4">
                  <MapPin className="mt-0.5 h-5 w-5 text-primary-600" />
                  <div>
                    <p className="text-xs text-gray-500">Lokasi</p>
                    <p className="mt-1 font-semibold text-gray-900">
                      {room.location || 'Belum tersedia'}
                    </p>
                  </div>
                </div>

                {room.floor && (
                  <div className="flex items-start gap-3 rounded-xl bg-gray-50 p-4">
                    <Building2 className="mt-0.5 h-5 w-5 text-primary-600" />
                    <div>
                      <p className="text-xs text-gray-500">Lantai</p>
                      <p className="mt-1 font-semibold text-gray-900">
                        {room.floor}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <aside className="h-fit rounded-xl border border-gray-200 p-5">
              <p className="text-sm font-medium text-gray-500">Harga mulai</p>
              <p className="mt-1 text-2xl font-bold text-primary-700">
                {formatRupiah(room.base_price)}
              </p>
              {room.base_price != null && (
                <p className="text-sm text-gray-500">per hari</p>
              )}

              <div className="my-5 border-t border-gray-100" />

              <dl className="space-y-3 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-gray-500">Pajak</dt>
                  <dd className="text-right font-medium text-gray-900">
                    {formatRupiah(room.tax_per_room)}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-gray-500">Biaya layanan</dt>
                  <dd className="text-right font-medium text-gray-900">
                    {formatRupiah(room.service_per_room)}
                  </dd>
                </div>
              </dl>

              {(room.tax_per_room == null ||
                room.service_per_room == null) && (
                <p className="mt-4 rounded-lg bg-amber-50 p-3 text-xs leading-relaxed text-amber-700">
                  Total harga bisa berubah karena pajak atau biaya layanan
                  belum lengkap.
                </p>
              )}

              <Link
                href="/booking"
                className="btn-primary mt-5 block w-full text-center text-sm"
              >
                Buat Booking
              </Link>
            </aside>
          </div>
        </div>
      </div>
    </section>
  )
}
