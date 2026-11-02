/**
 *
 * - room_base_total  = rate_per_day × days
 * - total_per_ruangan = room_base_total + tax_amount + service_amount
 *   (pajak & service dihitung SATU KALI per ruangan, bukan per hari)
 * - package_total    = price_per_pax × jumlah_pax × jumlah_hari
 * - total_booking    = Σ total_per_ruangan + total_paket
 *
 * Jika tax/service masih NULL, total bersifat sementara.
 * Snapshot booking lama TIDAK boleh dihitung ulang.
 */

export interface RoomPriceCalculation {
  roomName: string;
  ratePerDay: number;
  days: number;
  roomBaseTotal: number;
  taxAmount: number | null;
  serviceAmount: number | null;
  totalPerRoom: number;
  /** true jika tax dan service sudah tersedia (bukan NULL) */
  isComplete: boolean;
}

/**
 * Hitung harga satu ruangan untuk booking baru.
 * Tax dan service dikenakan satu kali per ruangan (dari data master).
 */
export function calculateRoomPrice(
  roomName: string,
  ratePerDay: number,
  days: number,
  taxPerRoom: number | null,
  servicePerRoom: number | null,
): RoomPriceCalculation {
  const roomBaseTotal = ratePerDay * days;
  const isComplete = taxPerRoom != null && servicePerRoom != null;
  const totalPerRoom =
    roomBaseTotal + (taxPerRoom ?? 0) + (servicePerRoom ?? 0);

  return {
    roomName,
    ratePerDay,
    days,
    roomBaseTotal,
    taxAmount: taxPerRoom,
    serviceAmount: servicePerRoom,
    totalPerRoom,
    isComplete,
  };
}

/**
 * Hitung total paket meeting.
 * price_per_pax × jumlah_pax × jumlah_hari
 */
export function calculatePackageTotal(
  pricePerPax: number,
  paxCount: number,
  days: number,
): number {
  return pricePerPax * paxCount * days;
}

export interface BookingTotalCalculation {
  roomTotals: RoomPriceCalculation[];
  packageTotal: number | null;
  addonTotalsByRoom: RoomAddonPriceCalculation[];
  addonTotal: number;
  grandTotal: number;
  /** true jika SEMUA komponen harga sudah lengkap */
  isComplete: boolean;
}

export interface RoomAddonPriceCalculation {
  roomId: string;
  roomName: string;
  items: {
    addonId: string;
    addonName: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  total: number;
}

/**
 * Hitung total booking keseluruhan.
 */
export function calculateBookingTotal(
  roomCalculations: RoomPriceCalculation[],
  packageTotal: number | null,
  addonTotalsByRoom: RoomAddonPriceCalculation[] = [],
): BookingTotalCalculation {
  const roomsGrandTotal = roomCalculations.reduce(
    (sum, r) => sum + r.totalPerRoom,
    0,
  );
  const allRoomsComplete = roomCalculations.every((r) => r.isComplete);
  const addonTotal = addonTotalsByRoom.reduce((sum, room) => sum + room.total, 0);
  const grandTotal = roomsGrandTotal + (packageTotal ?? 0) + addonTotal;

  return {
    roomTotals: roomCalculations,
    packageTotal,
    addonTotalsByRoom,
    addonTotal,
    grandTotal,
    isComplete: allRoomsComplete,
  };
}

/**
 * Menghitung jumlah hari kalender inklusif antara dua tanggal
 * dalam zona waktu Asia/Jakarta.
 *
 * Contoh: 3 Nov – 4 Nov = 2 hari (inklusif).
 */
export function calculateInclusiveDays(
  startDate: string,
  endDate: string,
): number {
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Ambil tanggal kalender di Jakarta (format YYYY-MM-DD)
  const startJkt = start.toLocaleDateString("en-CA", {
    timeZone: "Asia/Jakarta",
  });
  const endJkt = end.toLocaleDateString("en-CA", {
    timeZone: "Asia/Jakarta",
  });

  // Parse kembali sebagai Date murni tanpa timezone offset
  const startDay = new Date(startJkt + "T00:00:00");
  const endDay = new Date(endJkt + "T00:00:00");

  const diffMs = endDay.getTime() - startDay.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  // Minimum 1 hari, inklusif
  return Math.max(1, diffDays + 1);
}
