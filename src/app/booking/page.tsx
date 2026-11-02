import { Metadata } from 'next';
import BookingForm from '@/components/BookingForm';

export const metadata: Metadata = {
  title: 'Buat Booking Baru — Banquet Booking',
  description:
    'Isi form berikut untuk mengajukan booking ruangan meeting atau ballroom.',
};

export default function BookingPage() {
  return (
    <section className="bg-gray-50 min-h-screen py-16">
      <div className="container-custom max-w-4xl">
        {/* ── header ── */}
        <div className="text-center mb-12">
          <h1 className="section-title">Buat Booking Baru</h1>
          <p className="section-subtitle">
            Isi form berikut untuk mengajukan booking ruangan
          </p>
        </div>

        {/* ── booking form (client component, self-contained) ── */}
        <BookingForm />
      </div>
    </section>
  );
}
