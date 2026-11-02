import { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import { Package, Addon } from '@/types/database';
import PackageCard from '@/components/PackageCard';
import AddonCard from '@/components/AddonCard';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Paket Meeting — Banquet Booking',
  description:
    'Jelajahi berbagai paket meeting lengkap untuk acara Anda. Pilih paket yang paling sesuai dengan kebutuhan.',
};

export default async function PackagesPage() {
  /* ── fetch packages ── */
  const { data: packages, error: packagesError } = await supabase
    .from('packages')
    .select('*')
    .eq('is_active', true);

  /* ── fetch addons ── */
  const { data: addons, error: addonsError } = await supabase
    .from('addons')
    .select('*')
    .eq('is_active', true);

  /* ── group addons by category ── */
  const addonsByCategory: Record<string, Addon[]> = {};
  if (addons && addons.length > 0) {
    for (const a of addons as Addon[]) {
      const cat = a.category ?? 'Lainnya';
      if (!addonsByCategory[cat]) addonsByCategory[cat] = [];
      addonsByCategory[cat].push(a);
    }
  }

  return (
    <section className="bg-gray-50 min-h-screen py-16">
      <div className="container-custom">
        {/* ── header ── */}
        <div className="text-center mb-14">
          <h1 className="section-title">Paket Meeting</h1>
          <p className="section-subtitle">
            Pilih paket yang sesuai kebutuhan acara Anda
          </p>
        </div>

        {/* ── packages grid ── */}
        {packagesError ? (
          <div className="card p-8 text-center text-red-600">
            <p className="font-semibold mb-1">
              Gagal memuat data paket. Silakan coba lagi nanti.
            </p>
            <p className="text-sm text-red-400">{packagesError.message}</p>
          </div>
        ) : !packages || packages.length === 0 ? (
          <p className="text-center text-gray-500 py-16">
            Belum ada data paket tersedia.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(packages as Package[]).map((pkg) => (
              <PackageCard key={String(pkg.package_id ?? pkg.id)} pkg={pkg} />
            ))}
          </div>
        )}

        {/* ── addons section ── */}
        {!addonsError &&
          addons &&
          addons.length > 0 && (
            <div className="mt-20">
              <h2 className="section-title text-center">Tambahan (Add-ons)</h2>
              <p className="section-subtitle text-center mb-10">
                Lengkapi acara Anda dengan layanan tambahan
              </p>

              {Object.entries(addonsByCategory).map(([category, items]) => (
                <div key={category} className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 capitalize">
                    {category}
                  </h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((addon) => (
                      <AddonCard
                        key={String(addon.addon_id ?? addon.id)}
                        name={addon.addon_name || addon.name || 'Add-on'}
                        category={category}
                        description={addon.notes || addon.description}
                        price={addon.unit_price ?? addon.price}
                        unit={addon.unit}
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
