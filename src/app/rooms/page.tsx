import { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import { Room, Facility } from '@/types/database';
import RoomCard from '@/components/RoomCard';
import FacilityCard from '@/components/FacilityCard';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Katalog Ruangan — Banquet Booking',
  description:
    'Jelajahi koleksi meeting room dan ballroom kami. Pilih ruangan yang sesuai untuk acara Anda.',
};

export default async function RoomsPage() {
  /* ── fetch rooms ── */
  const { data: rooms, error: roomsError } = await supabase
    .from('rooms')
    .select('*')
    .eq('is_active', true)
    .order('capacity', { ascending: true });

  /* ── fetch facilities ── */
  const { data: facilities, error: facilitiesError } = await supabase
    .from('facilities')
    .select('*')
    .eq('is_active', true);

  /* ── group facilities by category ── */
  const facilitiesByCategory: Record<string, Facility[]> = {};
  if (facilities && facilities.length > 0) {
    for (const f of facilities as Facility[]) {
      const cat = f.category ?? 'Lainnya';
      if (!facilitiesByCategory[cat]) facilitiesByCategory[cat] = [];
      facilitiesByCategory[cat].push(f);
    }
  }

  return (
    <section className="bg-gray-50 min-h-screen py-16">
      <div className="container-custom">
        {/* ── header ── */}
        <div className="text-center mb-14">
          <h1 className="section-title">Katalog Ruangan</h1>
          <p className="section-subtitle">
            Pilih ruangan yang sesuai untuk acara Anda
          </p>
        </div>

        {/* ── rooms grid ── */}
        {roomsError ? (
          <div className="card p-8 text-center text-red-600">
            <p className="font-semibold mb-1">
              Gagal memuat data ruangan. Silakan coba lagi nanti.
            </p>
            <p className="text-sm text-red-400">{roomsError.message}</p>
          </div>
        ) : !rooms || rooms.length === 0 ? (
          <p className="text-center text-gray-500 py-16">
            Belum ada data ruangan tersedia.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(rooms as Room[]).map((room) => (
              <RoomCard key={String(room.room_id ?? room.id)} room={room} />
            ))}
          </div>
        )}

        {/* ── facilities section ── */}
        {!facilitiesError &&
          facilities &&
          facilities.length > 0 && (
            <div className="mt-20">
              <h2 className="section-title text-center">Fasilitas Tersedia</h2>
              <p className="section-subtitle text-center mb-10">
                Fasilitas pendukung yang dapat Anda gunakan
              </p>

              {Object.entries(facilitiesByCategory).map(([category, items]) => (
                <div key={category} className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 capitalize">
                    {category}
                  </h3>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {items.map((facility) => (
                      <FacilityCard
                        key={String(facility.facility_id ?? facility.id)}
                        facility={facility}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>
    </section>
  );
}
