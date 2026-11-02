import { Metadata } from 'next';
import Link from 'next/link';
import { Calendar, ShieldCheck, CreditCard, ArrowRight, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Room, Package } from '@/types/database';
import RoomCard from '@/components/RoomCard';
import PackageCard from '@/components/PackageCard';

export const metadata: Metadata = {
  title: 'Banquet Booking — Temukan Ruangan Sempurna untuk Acara Anda',
  description:
    'Pesan meeting room dan ballroom dengan mudah. Cek ketersediaan, pilih paket, dan lihat rincian biaya secara transparan.',
};

export default async function HomePage() {
  /* ── data fetching ── */
  const { data: rooms, error: roomsError } = await supabase
    .from('rooms')
    .select('*')
    .eq('is_active', true)
    .order('capacity', { ascending: true })
    .limit(4);

  const { data: packages, error: packagesError } = await supabase
    .from('packages')
    .select('*')
    .eq('is_active', true)
    .limit(3);

  return (
    <>
      {/* ═══════════ HERO ═══════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-800 to-primary-950 text-white">
        {/* decorative blobs */}
        <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary-600/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -right-40 h-[28rem] w-[28rem] rounded-full bg-accent-400/10 blur-3xl" />

        <div className="container-custom relative z-10 py-24 md:py-36 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight max-w-4xl mx-auto">
            Temukan Ruangan Sempurna untuk Acara Anda
          </h1>

          <p className="mt-6 text-lg md:text-xl text-primary-200 max-w-2xl mx-auto leading-relaxed">
            Pesan meeting room dan ballroom dengan mudah. Cek ketersediaan,
            pilih paket, dan lihat rincian biaya secara transparan.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/rooms"
              className="btn-primary bg-white text-primary-900 hover:bg-primary-50 inline-flex items-center gap-2 px-8 py-3 rounded-lg font-semibold shadow-lg transition"
            >
              Lihat Ruangan
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/booking"
              className="btn-accent inline-flex items-center gap-2 px-8 py-3 rounded-lg font-semibold shadow-lg transition"
            >
              <Sparkles className="h-5 w-5" />
              Buat Booking
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURED ROOMS ═══════════ */}
      <section className="bg-white py-20">
        <div className="container-custom">
          <h2 className="section-title text-center">Ruangan Tersedia</h2>
          <p className="section-subtitle text-center mb-12">
            Pilihan ruangan terbaik kami untuk berbagai jenis acara
          </p>

          {roomsError || !rooms || rooms.length === 0 ? (
            <p className="text-center text-gray-500 py-12">
              Data ruangan belum tersedia.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {(rooms as Room[]).map((room) => (
                <RoomCard key={String(room.room_id ?? room.id)} room={room} />
              ))}
            </div>
          )}

          <div className="mt-10 text-center">
            <Link
              href="/rooms"
              className="inline-flex items-center gap-1 text-primary-700 hover:text-primary-900 font-semibold transition"
            >
              Lihat Semua Ruangan
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURES ═══════════ */}
      <section className="bg-primary-50/60 py-20">
        <div className="container-custom">
          <h2 className="section-title text-center">Mengapa Memilih Kami</h2>
          <p className="section-subtitle text-center mb-14">
            Platform booking yang aman, transparan, dan mudah digunakan
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card p-8 text-center hover:shadow-xl transition-shadow">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
                <Calendar className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Cek Ketersediaan
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Lihat ketersediaan ruangan secara real-time. Tidak perlu
                menunggu konfirmasi manual — cukup pilih tanggal dan waktu yang
                Anda inginkan.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card p-8 text-center hover:shadow-xl transition-shadow">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Booking Aman
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Data Anda terlindungi dengan baik. Harga disimpan sebagai
                snapshot saat booking dibuat sehingga tidak berubah setelah
                konfirmasi.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card p-8 text-center hover:shadow-xl transition-shadow">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
                <CreditCard className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Harga Transparan
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Rincian biaya ditampilkan secara lengkap — termasuk harga dasar,
                pajak, dan layanan — sehingga tidak ada biaya tersembunyi.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ PACKAGES PREVIEW ═══════════ */}
      <section className="bg-white py-20">
        <div className="container-custom">
          <h2 className="section-title text-center">Paket Meeting</h2>
          <p className="section-subtitle text-center mb-12">
            Paket lengkap untuk memenuhi kebutuhan acara Anda
          </p>

          {packagesError || !packages || packages.length === 0 ? (
            <p className="text-center text-gray-500 py-12">
              Data paket belum tersedia.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(packages as Package[]).map((pkg) => (
                <PackageCard key={String(pkg.package_id ?? pkg.id)} pkg={pkg} />
              ))}
            </div>
          )}

          <div className="mt-10 text-center">
            <Link
              href="/packages"
              className="inline-flex items-center gap-1 text-primary-700 hover:text-primary-900 font-semibold transition"
            >
              Lihat Semua Paket
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════ CTA BANNER ═══════════ */}
      <section className="bg-gradient-to-r from-accent-500 to-accent-600 py-16">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Siap Merencanakan Acara Anda?
          </h2>
          <p className="text-accent-100 text-lg mb-8 max-w-xl mx-auto">
            Mulai sekarang dan dapatkan penawaran terbaik untuk ruangan dan
            paket yang Anda butuhkan.
          </p>
          <Link
            href="/booking"
            className="btn-primary inline-flex items-center gap-2 bg-white text-accent-800 hover:bg-accent-50 px-8 py-3 rounded-lg font-semibold shadow-lg transition"
          >
            Buat Booking Sekarang
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </>
  );
}
