import { AlertTriangle } from 'lucide-react'
import { formatRupiah } from '@/utils/format'
import type { BookingTotalCalculation } from '@/utils/pricing'

interface PriceSummaryProps {
  calculation: BookingTotalCalculation
  packageName?: string | null
}

export default function PriceSummary({ calculation, packageName }: PriceSummaryProps) {
  return (
    <div className="card overflow-hidden">
      <div className="bg-primary-50 px-5 py-3 border-b border-primary-100">
        <h3 className="text-sm font-semibold text-primary-800 uppercase tracking-wider">
          Rincian Harga
        </h3>
      </div>

      <div className="p-5">
        {/* Room breakdown */}
        <div className="space-y-4">
          {calculation.roomTotals.map((room, idx) => (
            <div key={idx} className="rounded-lg border border-gray-100 p-4">
              <h4 className="font-semibold text-gray-900 mb-2">{room.roomName}</h4>

              <table className="w-full text-sm">
                <tbody className="divide-y divide-gray-50">
                  <tr>
                    <td className="py-1 text-gray-500">
                      Tarif × {room.days} hari
                    </td>
                    <td className="py-1 text-right tabular-nums text-gray-700">
                      {formatRupiah(room.ratePerDay)} × {room.days} ={' '}
                      <span className="font-medium">
                        {formatRupiah(room.roomBaseTotal)}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1 text-gray-500">Pajak</td>
                    <td className="py-1 text-right tabular-nums text-gray-700">
                      {room.taxAmount != null ? (
                        formatRupiah(room.taxAmount)
                      ) : (
                        <span className="text-amber-500 italic">Belum ditetapkan</span>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1 text-gray-500">Biaya Layanan</td>
                    <td className="py-1 text-right tabular-nums text-gray-700">
                      {room.serviceAmount != null ? (
                        formatRupiah(room.serviceAmount)
                      ) : (
                        <span className="text-amber-500 italic">Belum ditetapkan</span>
                      )}
                    </td>
                  </tr>
                  <tr className="border-t border-gray-200">
                    <td className="py-1.5 font-medium text-gray-900">
                      Total Ruangan
                    </td>
                    <td className="py-1.5 text-right tabular-nums font-semibold text-gray-900">
                      {formatRupiah(room.totalPerRoom)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ))}
        </div>

        {/* Package line */}
        {calculation.packageTotal != null && (
          <div className="mt-4 flex items-center justify-between rounded-lg border border-gray-100 p-4">
            <div>
              <span className="text-sm font-medium text-gray-900">Paket</span>
              {packageName && (
                <span className="ml-2 text-sm text-gray-500">({packageName})</span>
              )}
            </div>
            <span className="text-sm tabular-nums font-semibold text-gray-900">
              {formatRupiah(calculation.packageTotal)}
            </span>
          </div>
        )}

        {calculation.addonTotalsByRoom.some((room) => room.items.length > 0) && (
          <div className="mt-4 space-y-3">
            {calculation.addonTotalsByRoom
              .filter((room) => room.items.length > 0)
              .map((room) => (
                <div
                  key={room.roomId}
                  className="rounded-lg border border-gray-100 p-4"
                >
                  <h4 className="mb-2 text-sm font-semibold text-gray-900">
                    Add-on — {room.roomName}
                  </h4>
                  <div className="space-y-1">
                    {room.items.map((item) => (
                      <div
                        key={item.addonId}
                        className="flex items-center justify-between gap-3 text-sm"
                      >
                        <span className="text-gray-600">
                          {item.addonName} ({item.quantity} ×{' '}
                          {formatRupiah(item.unitPrice)})
                        </span>
                        <span className="tabular-nums font-medium text-gray-900">
                          {formatRupiah(item.total)}
                        </span>
                      </div>
                    ))}
                    <div className="flex justify-between border-t border-gray-100 pt-2 text-sm font-semibold">
                      <span>Total add-on ruangan</span>
                      <span className="tabular-nums">{formatRupiah(room.total)}</span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Grand total */}
        <div className="mt-4 rounded-lg bg-primary-600 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-white">Total Booking</span>
            <span className="text-xl font-bold text-white tabular-nums">
              {formatRupiah(calculation.grandTotal)}
            </span>
          </div>
        </div>

        {/* Warning for incomplete pricing */}
        {!calculation.isComplete && (
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
            <p className="text-xs text-amber-700 leading-relaxed">
              Total bersifat sementara — pajak dan/atau biaya layanan belum ditetapkan
              oleh hotel.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
