'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Calendar,
  Clock,
  Users,
  Minus,
  Plus,
  CheckCircle2,
  AlertCircle,
  Building2,
  Package as PackageIcon,
  User,
  ArrowRight,
  ArrowLeft,
  Info,
  Check,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import {
  formatRupiah,
  formatDate,
  formatCapacity,
  toInputDate,
} from '@/utils/format'
import {
  calculateRoomPrice,
  calculatePackageTotal,
  calculateBookingTotal,
  calculateInclusiveDays,
  RoomPriceCalculation,
} from '@/utils/pricing'
import type { Addon, Room, Package, EventType } from '@/types/database'
import { EVENT_TYPES } from '@/types/database'
import PriceSummary from './PriceSummary'
import RoomImage from './RoomImage'

interface FormData {
  // Step 1: Ruangan
  selectedRoomIds: string[]

  // Step 2: Acara & jadwal
  eventName: string
  eventType: EventType
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  expectedPax: number

  // Step 3: Paket
  selectedPackageId: string | null
  selectedAddonsByRoom: Record<string, Record<string, number>>

  // Step 4: Kontak Pelanggan
  customerName: string
  customerEmail: string
  customerPhone: string
  customerCompany: string
}

interface AvailabilityResult {
  key: string
  unavailableRoomIds: string[]
}

interface RoomAvailabilityRow {
  room_id: string | number
  is_available: boolean
}

function isRoomAvailabilityRow(value: unknown): value is RoomAvailabilityRow {
  return (
    typeof value === 'object' &&
    value !== null &&
    'room_id' in value &&
    (typeof value.room_id === 'string' || typeof value.room_id === 'number') &&
    'is_available' in value &&
    typeof value.is_available === 'boolean'
  )
}

function addDaysToDate(date: string, days: number): string {
  const [year, month, day] = date.split('-').map(Number)
  const result = new Date(Date.UTC(year, month - 1, day + days))
  return result.toISOString().slice(0, 10)
}

async function findUnavailableRooms(
  roomIds: string[],
  startDate: string,
  startTime: string,
  endDate: string,
  endTime: string
): Promise<string[]> {
  const startIso = new Date(`${startDate}T${startTime}:00+07:00`).toISOString()
  const endIso = new Date(`${endDate}T${endTime}:00+07:00`).toISOString()
  const { data, error } = await supabase.rpc('check_room_availability', {
    p_room_ids: roomIds,
    p_starts_at: startIso,
    p_ends_at: endIso,
  })

  if (error) {
    throw new Error(
      `Gagal memeriksa ketersediaan ruangan. Pastikan fungsi database check_room_availability sudah diterapkan: ${error.message}`
    )
  }

  const rawData: unknown = data
  if (!Array.isArray(rawData)) {
    throw new Error('Format hasil pengecekan ketersediaan tidak valid.')
  }
  const availabilityRows = rawData.filter(isRoomAvailabilityRow)
  if (availabilityRows.length !== rawData.length) {
    throw new Error('Format hasil pengecekan ketersediaan tidak valid.')
  }
  const availabilityByRoom = new Map(
    availabilityRows.map((room) => [String(room.room_id), room.is_available])
  )
  if (roomIds.some((roomId) => !availabilityByRoom.has(roomId))) {
    throw new Error('Pengecekan ketersediaan tidak mengembalikan semua ruangan.')
  }

  return roomIds.filter((roomId) => !availabilityByRoom.get(roomId))
}

export default function BookingForm() {
  const [currentStep, setCurrentStep] = useState<number>(1)

  // Inisialisasi tanggal default (besok dalam zona WIB)
  const tomorrowStr = useMemo(() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return toInputDate(tomorrow)
  }, [])
  const todayStr = useMemo(() => toInputDate(new Date()), [])

  const [formData, setFormData] = useState<FormData>({
    eventName: '',
    eventType: 'Meeting',
    startDate: tomorrowStr,
    endDate: tomorrowStr,
    startTime: '09:00',
    endTime: '17:00',
    expectedPax: 20,
    selectedRoomIds: [],
    selectedPackageId: null,
    selectedAddonsByRoom: {},
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerCompany: '',
  })

  // Data dari Supabase
  const [rooms, setRooms] = useState<Room[]>([])
  const [packages, setPackages] = useState<Package[]>([])
  const [addons, setAddons] = useState<Addon[]>([])
  const [loadingRooms, setLoadingRooms] = useState<boolean>(false)
  const [loadingPackages, setLoadingPackages] = useState<boolean>(false)
  const [loadingAddons, setLoadingAddons] = useState<boolean>(false)
  const [roomsError, setRoomsError] = useState<string | null>(null)
  const [packagesError, setPackagesError] = useState<string | null>(null)
  const [addonsError, setAddonsError] = useState<string | null>(null)
  const [availabilityResult, setAvailabilityResult] =
    useState<AvailabilityResult | null>(null)
  const [availabilityLoading, setAvailabilityLoading] = useState<boolean>(false)
  const [availabilityError, setAvailabilityError] = useState<string | null>(null)

  // Status submission
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [bookingSuccessId, setBookingSuccessId] = useState<string | null>(null)
  const [bookingSuccessTotal, setBookingSuccessTotal] = useState<number | null>(null)

  // Hitung jumlah hari inklusif (WIB)
  const days = useMemo(() => {
    return calculateInclusiveDays(formData.startDate, formData.endDate)
  }, [formData.startDate, formData.endDate])

  // Fetch data ruangan dari database
  useEffect(() => {
    async function fetchRooms() {
      setLoadingRooms(true)
      setRoomsError(null)
      try {
        const { data, error } = await supabase
          .from('rooms')
          .select('*')
          .eq('is_active', true)
          .order('capacity', { ascending: true })

        if (error) {
          setRoomsError(error.message)
        } else if (data) {
          setRooms(data as Room[])
        }
      } catch (err: unknown) {
        setRoomsError(err instanceof Error ? err.message : 'Gagal memuat data ruangan')
      } finally {
        setLoadingRooms(false)
      }
    }

    fetchRooms()
  }, [])

  // Fetch data paket dari database
  useEffect(() => {
    async function fetchPackages() {
      setLoadingPackages(true)
      setPackagesError(null)
      try {
        const { data, error } = await supabase
          .from('packages')
          .select('*')
          .eq('is_active', true)

        if (error) {
          setPackagesError(error.message)
        } else if (data) {
          setPackages(data as Package[])
        }
      } catch (err: unknown) {
        setPackagesError(err instanceof Error ? err.message : 'Gagal memuat data paket')
      } finally {
        setLoadingPackages(false)
      }
    }

    fetchPackages()
  }, [])

  useEffect(() => {
    async function fetchAddons() {
      setLoadingAddons(true)
      setAddonsError(null)
      try {
        const { data, error } = await supabase
          .from('addons')
          .select('*')
          .eq('is_active', true)
          .order('addon_name', { ascending: true })

        if (error) {
          setAddonsError(error.message)
        } else if (data) {
          setAddons(data as Addon[])
        }
      } catch (err: unknown) {
        setAddonsError(
          err instanceof Error ? err.message : 'Gagal memuat data add-on'
        )
      } finally {
        setLoadingAddons(false)
      }
    }

    fetchAddons()
  }, [])

  // Helper mendapatkan ID unik ruangan
  const getRoomId = (room: Room): string => {
    return String(room.room_id ?? room.id ?? '')
  }

  // Helper mendapatkan nama ruangan
  const getRoomName = (room: Room): string => {
    return room.room_name || room.name || 'Ruangan'
  }

  // Helper mendapatkan ID paket
  const getPackageId = (pkg: Package): string => {
    return String(pkg.package_id ?? pkg.id ?? '')
  }

  // Helper mendapatkan nama paket
  const getPackageName = (pkg: Package): string => {
    return pkg.package_name || pkg.name || 'Paket Meeting'
  }

  const getAddonId = (addon: Addon): string => {
    return String(addon.addon_id ?? addon.id ?? '')
  }

  const getAddonName = (addon: Addon): string => {
    return addon.addon_name || addon.name || 'Add-on'
  }

  const getAddonPrice = (addon: Addon): number | null => {
    return addon.unit_price ?? addon.price ?? null
  }

  // Kalkulasi harga ruangan yang dipilih
  const roomCalculations: RoomPriceCalculation[] = useMemo(() => {
    return formData.selectedRoomIds
      .map((roomIdStr) => {
        const room = rooms.find((r) => getRoomId(r) === roomIdStr)
        if (!room) return null
        return calculateRoomPrice(
          getRoomName(room),
          room.base_price ?? 0,
          days,
          room.tax_per_room,
          room.service_per_room
        )
      })
      .filter((calc): calc is RoomPriceCalculation => calc !== null)
  }, [formData.selectedRoomIds, rooms, days])

  // Paket yang dipilih & totalnya
  const selectedPackage = useMemo(() => {
    if (!formData.selectedPackageId) return null
    return packages.find((p) => getPackageId(p) === formData.selectedPackageId) || null
  }, [formData.selectedPackageId, packages])

  const packageTotal = useMemo(() => {
    if (!selectedPackage || selectedPackage.price_per_pax == null) return null
    return calculatePackageTotal(
      selectedPackage.price_per_pax,
      formData.expectedPax,
      days
    )
  }, [selectedPackage, formData.expectedPax, days])

  const addonTotalsByRoom = useMemo(() => {
    return formData.selectedRoomIds.flatMap((roomId) => {
      const room = rooms.find((item) => getRoomId(item) === roomId)
      if (!room) return []

      const selectedAddons = formData.selectedAddonsByRoom[roomId] ?? {}
      const items = Object.entries(selectedAddons).flatMap(
        ([addonId, quantity]) => {
          const addon = addons.find((item) => getAddonId(item) === addonId)
          const unitPrice = addon ? getAddonPrice(addon) : null
          if (!addon || unitPrice == null || quantity <= 0) return []

          return [{
            addonId,
            addonName: getAddonName(addon),
            quantity,
            unitPrice,
            total: unitPrice * quantity,
          }]
        }
      )

      return [{
        roomId,
        roomName: getRoomName(room),
        items,
        total: items.reduce((sum, item) => sum + item.total, 0),
      }]
    })
  }, [formData.selectedRoomIds, formData.selectedAddonsByRoom, rooms, addons])

  // Total kesepakatan keseluruhan
  const totalCalculation = useMemo(() => {
    return calculateBookingTotal(roomCalculations, packageTotal, addonTotalsByRoom)
  }, [roomCalculations, packageTotal, addonTotalsByRoom])

  const scheduleKey = useMemo(
    () =>
      [
        formData.startDate,
        formData.startTime,
        formData.endDate,
        formData.endTime,
        [...formData.selectedRoomIds].sort().join(','),
      ].join('|'),
    [
      formData.startDate,
      formData.startTime,
      formData.endDate,
      formData.endTime,
      formData.selectedRoomIds,
    ]
  )

  // Validasi Step 1: minimal satu ruangan dipilih
  const isStep1Valid = formData.selectedRoomIds.length > 0

  // Validasi Step 2: jadwal valid dan semua ruangan terpilih sudah dicek tersedia
  const isStep2Valid = useMemo(() => {
    if (!formData.eventName.trim()) return false
    if (!formData.startDate || !formData.endDate) return false
    if (new Date(formData.endDate) < new Date(formData.startDate)) return false
    if (formData.startDate === formData.endDate && formData.startTime >= formData.endTime) {
      return false
    }
    if (formData.expectedPax <= 0) return false
    if (formData.selectedRoomIds.length === 0) return false
    if (availabilityResult?.key !== scheduleKey) return false
    return formData.selectedRoomIds.every(
      (roomId) => !availabilityResult.unavailableRoomIds.includes(roomId)
    )
  }, [formData, availabilityResult, scheduleKey])

  // Validasi Step 4
  const isStep4Valid = useMemo(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return (
      formData.customerName.trim().length >= 2 &&
      emailRegex.test(formData.customerEmail.trim()) &&
      formData.customerPhone.trim().length >= 8 &&
      formData.customerCompany.trim().length >= 2
    )
  }, [
    formData.customerName,
    formData.customerEmail,
    formData.customerPhone,
    formData.customerCompany,
  ])

  const invalidateAvailability = () => {
    setAvailabilityResult(null)
    setAvailabilityError(null)
  }

  // Handler toggle ruangan
  const toggleRoom = (roomIdStr: string) => {
    if (!roomIdStr) return
    invalidateAvailability()
    setFormData((prev) => {
      const exists = prev.selectedRoomIds.includes(roomIdStr)
      return {
        ...prev,
        selectedRoomIds: exists
          ? prev.selectedRoomIds.filter((id) => id !== roomIdStr)
          : [...prev.selectedRoomIds, roomIdStr],
      }
    })
  }

  const handleCheckAvailability = async () => {
    if (
      formData.selectedRoomIds.length === 0 ||
      !formData.startDate ||
      !formData.endDate ||
      new Date(formData.endDate) < new Date(formData.startDate) ||
      (formData.startDate === formData.endDate &&
        formData.startTime >= formData.endTime)
    ) {
      return
    }

    setAvailabilityLoading(true)
    setAvailabilityError(null)
    setAvailabilityResult(null)

    try {
      const unavailableRoomIds = await findUnavailableRooms(
        formData.selectedRoomIds,
        formData.startDate,
        formData.startTime,
        formData.endDate,
        formData.endTime
      )
      setAvailabilityResult({ key: scheduleKey, unavailableRoomIds })
    } catch (err: unknown) {
      setAvailabilityError(
        err instanceof Error
          ? err.message
          : 'Terjadi kendala saat memeriksa ketersediaan ruangan.'
      )
    } finally {
      setAvailabilityLoading(false)
    }
  }

  // Submit booking ke Supabase
  const handleFinalSubmit = async () => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const startIso = new Date(
        `${formData.startDate}T${formData.startTime}:00+07:00`
      ).toISOString()
      const endIso = new Date(
        `${formData.endDate}T${formData.endTime}:00+07:00`
      ).toISOString()
      const unavailableRoomIds = await findUnavailableRooms(
        formData.selectedRoomIds,
        formData.startDate,
        formData.startTime,
        formData.endDate,
        formData.endTime
      )
      if (unavailableRoomIds.length > 0) {
        setAvailabilityResult({ key: scheduleKey, unavailableRoomIds })
        setCurrentStep(2)
        setSubmitError(
          'Ketersediaan ruangan berubah sejak pengecekan terakhir. Silakan pilih ruangan lain atau jadwal lain.'
        )
        return
      }

      const requestRooms = formData.selectedRoomIds.map((roomId) => {
        const room = rooms.find((item) => getRoomId(item) === roomId)
        if (!room) {
          throw new Error(`Data ruangan ${roomId} tidak ditemukan.`)
        }

        return {
          room_id: room.room_id,
          addons: Object.entries(formData.selectedAddonsByRoom[roomId] ?? {})
            .filter(([, quantity]) => quantity > 0)
            .map(([addonId, quantity]) => ({
              addon_id: addonId,
              quantity,
            })),
        }
      })

      const { data, error } = await supabase.rpc('submit_booking', {
        p_request: {
          company: formData.customerCompany.trim(),
          contact_name: formData.customerName.trim(),
          email: formData.customerEmail.trim(),
          phone: formData.customerPhone.trim(),
          event_name: formData.eventName.trim(),
          event_type: formData.eventType,
          starts_at: startIso,
          ends_at: endIso,
          expected_pax: formData.expectedPax,
          package_id: selectedPackage
            ? selectedPackage.package_id ?? selectedPackage.id
            : null,
          rooms: requestRooms,
        },
      })

      if (error) {
        throw new Error(
          `Gagal menyimpan booking (${error.message}). Pastikan migrasi submit_booking sudah diterapkan dan fungsi memiliki akses database yang diperlukan.`
        )
      }

      if (
        typeof data !== 'object' ||
        data === null ||
        !('booking_code' in data) ||
        typeof data.booking_code !== 'string' ||
        !('total_amount' in data) ||
        typeof data.total_amount !== 'number'
      ) {
        throw new Error('Format respons fungsi submit_booking tidak valid.')
      }

      setBookingSuccessTotal(data.total_amount)
      setBookingSuccessId(data.booking_code)
    } catch (err: unknown) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : 'Terjadi kendala saat memproses booking. Pastikan database mengizinkan pengajuan booking publik.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  // Tampilan Berhasil
  if (bookingSuccessId) {
    return (
      <div className="card p-8 text-center max-w-2xl mx-auto border-t-4 border-t-green-500">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 mb-4">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Pengajuan Booking Berhasil Diterima!
        </h2>
        <div className="inline-block mb-4" />
        <p className="text-gray-600 mb-6">
          Nomor Referensi Booking Anda:
          <span className="block text-xl font-mono font-bold text-primary-700 mt-1">
            #{bookingSuccessId}
          </span>
        </p>

        <div className="bg-gray-50 rounded-lg p-4 text-left text-sm text-gray-600 mb-6 space-y-2">
          <p>
            <strong>Status:</strong> <span className="text-amber-600 font-semibold">Pending (Menahan Jadwal)</span>
          </p>
          <p>
            <strong>Acara:</strong> {formData.eventName} ({formData.eventType})
          </p>
          <p>
            <strong>Jadwal:</strong> {formData.startDate} {formData.startTime} s/d{' '}
            {formData.endDate} {formData.endTime} WIB ({days} hari kalender)
          </p>
          <p>
            <strong>Ruangan:</strong> {roomCalculations.map((r) => r.roomName).join(', ')}
          </p>
          <p>
            <strong>Total Booking:</strong>{' '}
            {formatRupiah(bookingSuccessTotal ?? totalCalculation.grandTotal)}
          </p>
        </div>

        <p className="text-xs text-gray-400 mb-6 italic">
          Catatan: Ini adalah transaksi demo fiktif (is_dummy = true). Jadwal ruangan sementara ditahan dan menunggu persetujuan administrator hotel.
        </p>

        <button
          onClick={() => {
            setBookingSuccessId(null)
            setBookingSuccessTotal(null)
            setCurrentStep(1)
            setFormData({
              eventName: '',
              eventType: 'Meeting',
              startDate: tomorrowStr,
              endDate: tomorrowStr,
              startTime: '09:00',
              endTime: '17:00',
              expectedPax: 20,
              selectedRoomIds: [],
              selectedPackageId: null,
              selectedAddonsByRoom: {},
              customerName: '',
              customerEmail: '',
              customerPhone: '',
              customerCompany: '',
            })
          }}
          className="btn-primary"
        >
          Buat Booking Baru
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Step Indicators */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[
            { num: 1, label: 'Ruangan' },
            { num: 2, label: 'Jadwal' },
            { num: 3, label: 'Paket & Add-on' },
            { num: 4, label: 'Kontak' },
            { num: 5, label: 'Ringkasan' },
          ].map((s) => (
            <div key={s.num} className="flex-1 flex flex-col items-center relative">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                  currentStep === s.num
                    ? 'bg-primary-600 text-white shadow-md ring-4 ring-primary-100'
                    : currentStep > s.num
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {currentStep > s.num ? <Check className="w-5 h-5" /> : s.num}
              </div>
              <span
                className={`mt-2 text-xs font-medium hidden sm:block ${
                  currentStep === s.num ? 'text-primary-700 font-bold' : 'text-gray-500'
                }`}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Card Form */}
      <div className="card p-6 sm:p-8">
        {/* STEP 2: Detail Acara & Jadwal */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Detail Acara &amp; Jadwal</h2>
              <p className="text-sm text-gray-500">
                Tentukan jadwal penggunaan dan perkiraan jumlah peserta (Zona Waktu: Asia/Jakarta / WIB).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="label-field">Nama Acara *</label>
                <input
                  type="text"
                  placeholder="Contoh: Rapat Kerja Tahunan 2026"
                  className="input-field"
                  value={formData.eventName}
                  onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                />
              </div>

              <fieldset className="md:col-span-2">
                <legend className="label-field">Tipe Acara</legend>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {EVENT_TYPES.map((eventType) => (
                    <button
                      key={eventType}
                      type="button"
                      aria-pressed={formData.eventType === eventType}
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, eventType }))
                      }
                      className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 ${
                        formData.eventType === eventType
                          ? 'border-primary-600 bg-primary-50 text-primary-800'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-primary-300 hover:bg-primary-50/50'
                      }`}
                    >
                      {eventType}
                    </button>
                  ))}
                </div>
              </fieldset>

              <div className="md:col-span-2">
                <label className="label-field" htmlFor="expected-pax">
                  Perkiraan Jumlah Peserta (Pax) *
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex h-12 items-center overflow-hidden rounded-lg border border-gray-300 bg-white focus-within:ring-2 focus-within:ring-primary-500">
                    <button
                      type="button"
                      aria-label="Kurangi jumlah peserta"
                      disabled={formData.expectedPax <= 1}
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          expectedPax: Math.max(1, prev.expectedPax - 1),
                        }))
                      }
                      className="h-full px-3 text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <div className="relative h-full w-28">
                      <Users className="absolute left-2.5 top-3.5 h-4 w-4 text-gray-400" />
                      <input
                        id="expected-pax"
                        type="number"
                        min="1"
                        step="1"
                        inputMode="numeric"
                        className="h-full w-full border-x border-gray-200 bg-transparent pl-8 pr-2 text-center font-semibold tabular-nums focus:outline-none"
                        value={formData.expectedPax || ''}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            expectedPax: Math.max(
                              0,
                              parseInt(e.target.value, 10) || 0
                            ),
                          }))
                        }
                        onBlur={() => {
                          if (formData.expectedPax < 1) {
                            setFormData((prev) => ({ ...prev, expectedPax: 1 }))
                          }
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      aria-label="Tambah jumlah peserta"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          expectedPax: prev.expectedPax + 1,
                        }))
                      }
                      className="h-full px-3 text-gray-600 hover:bg-gray-100"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[10, 20, 50, 100].map((pax) => (
                      <button
                        key={pax}
                        type="button"
                        aria-pressed={formData.expectedPax === pax}
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, expectedPax: pax }))
                        }
                        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 ${
                          formData.expectedPax === pax
                            ? 'border-primary-600 bg-primary-50 text-primary-800'
                            : 'border-gray-200 text-gray-600 hover:border-primary-300'
                        }`}
                      >
                        {pax} pax
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="label-field">Tanggal Mulai (WIB) *</label>
                <div className="relative">
                  <input
                    type="date"
                    min={todayStr}
                    className="input-field pl-10"
                    value={formData.startDate}
                    onChange={(e) => {
                      const newStart = e.target.value
                      invalidateAvailability()
                      setFormData((prev) => ({
                        ...prev,
                        startDate: newStart,
                        endDate: prev.endDate < newStart ? newStart : prev.endDate,
                      }))
                    }}
                  />
                  <Calendar className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                </div>
              </div>

              <div>
                <label className="label-field">Tanggal Selesai (WIB) *</label>
                <div className="relative">
                  <input
                    type="date"
                    min={formData.startDate}
                    className="input-field pl-10"
                    value={formData.endDate}
                    onChange={(e) => {
                      invalidateAvailability()
                      setFormData({ ...formData, endDate: e.target.value })
                    }}
                  />
                  <Calendar className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                </div>
              </div>

              <div className="md:col-span-2">
                <span className="label-field">Durasi cepat</span>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3].map((duration) => (
                    <button
                      key={duration}
                      type="button"
                      disabled={!formData.startDate}
                      aria-pressed={days === duration}
                      onClick={() => {
                        invalidateAvailability()
                        setFormData((prev) => ({
                          ...prev,
                          endDate: addDaysToDate(prev.startDate, duration - 1),
                        }))
                      }}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-40 ${
                        days === duration
                          ? 'border-primary-600 bg-primary-50 text-primary-800'
                          : 'border-gray-200 text-gray-600 hover:border-primary-300'
                      }`}
                    >
                      {duration} hari
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label-field">Jam Mulai (WIB) *</label>
                <div className="relative">
                  <input
                    type="time"
                    step="1800"
                    className="input-field pl-10"
                    value={formData.startTime}
                    onChange={(e) => {
                      invalidateAvailability()
                      setFormData({ ...formData, startTime: e.target.value })
                    }}
                  />
                  <Clock className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                </div>
              </div>

              <div>
                <label className="label-field">Jam Selesai (WIB) *</label>
                <div className="relative">
                  <input
                    type="time"
                    step="1800"
                    className="input-field pl-10"
                    value={formData.endTime}
                    onChange={(e) => {
                      invalidateAvailability()
                      setFormData({ ...formData, endTime: e.target.value })
                    }}
                  />
                  <Clock className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                </div>
              </div>

              <div className="md:col-span-2">
                <span className="label-field">Pilihan jam cepat</span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'Pagi · 09.00–12.00', start: '09:00', end: '12:00' },
                    { label: 'Siang · 13.00–17.00', start: '13:00', end: '17:00' },
                    { label: 'Seharian · 09.00–17.00', start: '09:00', end: '17:00' },
                  ].map((slot) => {
                    const selected =
                      formData.startTime === slot.start &&
                      formData.endTime === slot.end

                    return (
                      <button
                        key={slot.label}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => {
                          invalidateAvailability()
                          setFormData((prev) => ({
                            ...prev,
                            startTime: slot.start,
                            endTime: slot.end,
                          }))
                        }}
                        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 ${
                          selected
                            ? 'border-primary-600 bg-primary-50 text-primary-800'
                            : 'border-gray-200 text-gray-600 hover:border-primary-300'
                        }`}
                      >
                        {slot.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Info kalkulasi hari */}
            <div className="rounded-lg bg-primary-50 p-4 flex items-center gap-3">
              <Info className="w-5 h-5 text-primary-600 flex-shrink-0" />
              <div className="text-sm text-primary-800">
                Durasi pemakaian terhitung: <strong>{days} hari kalender inklusif</strong> (
                {formData.startDate} s/d {formData.endDate})
              </div>
            </div>

            <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
              <div>
                <h3 className="font-semibold text-gray-900">Ketersediaan Ruangan</h3>
                <p className="text-sm text-gray-500">
                  Cek jadwal yang dipilih sebelum melanjutkan. Ruangan berstatus Pending yang masa tahan jadwalnya masih aktif juga dihitung.
                </p>
              </div>

              {availabilityResult?.key === scheduleKey && (
                <div className="space-y-2">
                  {formData.selectedRoomIds.map((roomId) => {
                    const room = rooms.find((item) => getRoomId(item) === roomId)
                    const unavailable =
                      availabilityResult.unavailableRoomIds.includes(roomId)

                    return (
                      <div
                        key={roomId}
                        className={`flex items-center gap-2 text-sm ${
                          unavailable ? 'text-red-700' : 'text-green-700'
                        }`}
                      >
                        {unavailable ? (
                          <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                        )}
                        <span>
                          <strong>{room ? getRoomName(room) : 'Ruangan'}</strong>
                          {unavailable
                            ? ' tidak tersedia pada jadwal ini.'
                            : ' tersedia pada jadwal ini.'}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}

              {availabilityError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {availabilityError}
                </div>
              )}

              <button
                type="button"
                onClick={handleCheckAvailability}
                disabled={
                  availabilityLoading ||
                  formData.selectedRoomIds.length === 0 ||
                  !formData.startDate ||
                  !formData.endDate ||
                  new Date(formData.endDate) < new Date(formData.startDate) ||
                  (formData.startDate === formData.endDate &&
                    formData.startTime >= formData.endTime)
                }
                className="btn-secondary text-sm"
              >
                {availabilityLoading
                  ? 'Memeriksa ketersediaan...'
                  : 'Cek Ketersediaan'}
              </button>
            </div>

            {formData.selectedRoomIds.some((roomId) => {
              const room = rooms.find((item) => getRoomId(item) === roomId)
              return (room?.capacity ?? 0) < formData.expectedPax
            }) && (
              <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
                Kapasitas satu atau lebih ruangan terpilih lebih kecil dari jumlah peserta.
              </div>
            )}
          </div>
        )}

        {/* STEP 1: Pilih Ruangan */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Pilih Ruangan</h2>
                <p className="text-sm text-gray-500">
                  Pilih ruangan yang ingin dipesan. Tanggal dan ketersediaan akan dikonfirmasi pada langkah berikutnya.
                </p>
              </div>
            </div>

            {loadingRooms ? (
              <div className="p-8 text-center text-gray-500">Memuat katalog ruangan dari database...</div>
            ) : roomsError ? (
              <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-200">
                Gagal memuat ruangan: {roomsError}
              </div>
            ) : rooms.length === 0 ? (
              <div className="p-8 text-center text-gray-500">Tidak ada data ruangan aktif.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rooms.map((room) => {
                  const roomIdStr = getRoomId(room)
                  const roomName = getRoomName(room)
                  const isSelected = formData.selectedRoomIds.includes(roomIdStr)
                  const calc = calculateRoomPrice(
                    roomName,
                    room.base_price ?? 0,
                    days,
                    room.tax_per_room,
                    room.service_per_room
                  )

                  return (
                    <div
                      key={roomIdStr}
                      onClick={() => toggleRoom(roomIdStr)}
                      className={`cursor-pointer rounded-xl border p-4 transition-all relative ${
                        isSelected
                          ? 'border-primary-600 bg-primary-50/60 shadow-sm ring-2 ring-primary-500'
                          : 'border-gray-200 hover:border-primary-300 bg-white'
                      }`}
                    >
                      <RoomImage
                          room={room}
                          className="-mx-4 -mt-4 mb-4 relative h-40 overflow-hidden rounded-t-xl"
                          sizes="(max-width: 768px) 100vw, 50vw"
                      />
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-gray-900 text-base">{roomName}</h3>
                            {room.room_type && (
                              <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-medium">
                                {room.room_type}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Kapasitas: {formatCapacity(room.capacity)}
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleRoom(roomIdStr)}
                          onClick={(event) => event.stopPropagation()}
                          className="h-5 w-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500 cursor-pointer"
                        />
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-100 text-xs flex justify-between items-baseline">
                        <span className="text-gray-500">Tarif harian:</span>
                        <span className="font-semibold text-gray-900">
                          {formatRupiah(room.base_price)} /hari
                        </span>
                      </div>

                      <div className="mt-1 text-xs flex justify-between items-baseline">
                        <span className="text-gray-500">Estimasi {days} hari:</span>
                        <span className="font-bold text-primary-700">
                          {formatRupiah(calc.totalPerRoom)}
                        </span>
                      </div>

                      {!calc.isComplete && (
                        <p className="mt-1 text-[11px] text-amber-600 italic">
                          Pajak &amp; layanan belum ditetapkan
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* STEP 3: Pilih Paket */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Pilih Paket Meeting (Opsional)</h2>
                <p className="text-sm text-gray-500">
                  Paket dihitung per peserta per hari ({formData.expectedPax} pax × {days} hari).
                </p>
              </div>
            </div>

            {loadingPackages ? (
              <div className="p-8 text-center text-gray-500">Memuat paket meeting...</div>
            ) : packagesError ? (
              <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-200">
                Gagal memuat paket: {packagesError}
              </div>
            ) : (
              <div className="space-y-3">
                {/* Opsi tanpa paket */}
                <div
                  onClick={() => setFormData({ ...formData, selectedPackageId: null })}
                  className={`cursor-pointer rounded-xl border p-4 transition-all flex items-center justify-between ${
                    formData.selectedPackageId === null
                      ? 'border-primary-600 bg-primary-50/60 ring-2 ring-primary-500'
                      : 'border-gray-200 hover:border-primary-300 bg-white'
                  }`}
                >
                  <div>
                    <h3 className="font-bold text-gray-900">Hanya Ruangan (Tanpa Paket)</h3>
                    <p className="text-xs text-gray-500">Hanya menyewa ruangan meeting tanpa paket F&amp;B/catering.</p>
                  </div>
                  <input
                    type="radio"
                    name="package"
                    checked={formData.selectedPackageId === null}
                    onChange={() => setFormData({ ...formData, selectedPackageId: null })}
                    className="h-4 w-4 text-primary-600"
                  />
                </div>

                {/* List paket */}
                {packages.map((pkg) => {
                  const pkgIdStr = getPackageId(pkg)
                  const pkgName = getPackageName(pkg)
                  const isSelected = formData.selectedPackageId === pkgIdStr
                  const total =
                    pkg.price_per_pax != null
                      ? calculatePackageTotal(pkg.price_per_pax, formData.expectedPax, days)
                      : null

                  return (
                    <div
                      key={pkgIdStr}
                      onClick={() => setFormData({ ...formData, selectedPackageId: pkgIdStr })}
                      className={`cursor-pointer rounded-xl border p-4 transition-all relative ${
                        isSelected
                          ? 'border-primary-600 bg-primary-50/60 ring-2 ring-primary-500'
                          : 'border-gray-200 hover:border-primary-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-gray-900">{pkgName}</h3>
                            {pkg.duration_type && (
                              <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-medium">
                                {pkg.duration_type}
                              </span>
                            )}
                            {pkg.price_is_net && (
                              <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700 font-medium">
                                Nett
                              </span>
                            )}
                          </div>
                          {pkg.includes_description && (
                            <p className="text-xs text-gray-600 mt-1">{pkg.includes_description}</p>
                          )}
                        </div>
                        <input
                          type="radio"
                          name="package"
                          checked={isSelected}
                          onChange={() => setFormData({ ...formData, selectedPackageId: pkgIdStr })}
                          className="h-4 w-4 text-primary-600"
                        />
                      </div>

                      <div className="mt-3 pt-2 border-t border-gray-100 text-xs flex justify-between items-baseline">
                        <span className="text-gray-500">Harga per pax:</span>
                        <span className="font-semibold text-gray-900">
                          {formatRupiah(pkg.price_per_pax)} /pax/hari
                        </span>
                      </div>

                      {total != null && (
                        <div className="mt-1 text-xs flex justify-between items-baseline">
                          <span className="text-gray-500">
                            Total paket ({formData.expectedPax} pax × {days} hari):
                          </span>
                          <span className="font-bold text-primary-700">{formatRupiah(total)}</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            <section className="space-y-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div>
                <h3 className="font-bold text-gray-900">Add-on per Ruangan (Opsional)</h3>
                <p className="mt-1 text-xs text-gray-500">
                  Pilih add-on untuk setiap ruangan. Harga dihitung per unit untuk seluruh reservasi, bukan per hari.
                </p>
              </div>

              {loadingAddons ? (
                <p className="text-sm text-gray-500">Memuat add-on...</p>
              ) : addonsError ? (
                <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                  Gagal memuat add-on: {addonsError}
                </p>
              ) : addons.length === 0 ? (
                <p className="text-sm text-gray-500">Belum ada add-on aktif.</p>
              ) : (
                formData.selectedRoomIds.map((roomId) => {
                  const room = rooms.find((item) => getRoomId(item) === roomId)
                  if (!room) return null

                  const selectedAddons =
                    formData.selectedAddonsByRoom[roomId] ?? {}

                  return (
                    <div
                      key={roomId}
                      className="rounded-lg border border-gray-200 bg-white p-4"
                    >
                      <h4 className="mb-3 font-semibold text-gray-900">
                        {getRoomName(room)}
                      </h4>
                      <div className="space-y-3">
                        {addons.map((addon) => {
                          const addonId = getAddonId(addon)
                          const price = getAddonPrice(addon)
                          const quantity = selectedAddons[addonId] ?? 0
                          const isSelected = quantity > 0
                          const canSelect = price != null && addon.is_active

                          return (
                            <div
                              key={addonId}
                              className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-3 first:border-0 first:pt-0"
                            >
                              <label className="flex min-w-0 flex-1 items-start gap-3">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  disabled={!canSelect}
                                  onChange={(event) => {
                                    setFormData((previous) => {
                                      const roomSelection = {
                                        ...previous.selectedAddonsByRoom[roomId],
                                      }
                                      if (event.target.checked) {
                                        roomSelection[addonId] = 1
                                      } else {
                                        delete roomSelection[addonId]
                                      }
                                      return {
                                        ...previous,
                                        selectedAddonsByRoom: {
                                          ...previous.selectedAddonsByRoom,
                                          [roomId]: roomSelection,
                                        },
                                      }
                                    })
                                  }}
                                  className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                />
                                <span>
                                  <span className="block text-sm font-medium text-gray-900">
                                    {getAddonName(addon)}
                                  </span>
                                  <span className="block text-xs text-gray-500">
                                    {price != null
                                      ? `${formatRupiah(price)}${addon.unit ? `/${addon.unit}` : ' per unit'}`
                                      : 'Harga belum tersedia'}
                                  </span>
                                </span>
                              </label>

                              {isSelected && (
                                <label className="flex items-center gap-2 text-xs text-gray-600">
                                  Jumlah
                                  <input
                                    type="number"
                                    min={1}
                                    step={1}
                                    value={quantity}
                                    onChange={(event) => {
                                      const nextQuantity = Math.max(
                                        1,
                                        Math.floor(Number(event.target.value) || 1)
                                      )
                                      setFormData((previous) => ({
                                        ...previous,
                                        selectedAddonsByRoom: {
                                          ...previous.selectedAddonsByRoom,
                                          [roomId]: {
                                            ...previous.selectedAddonsByRoom[roomId],
                                            [addonId]: nextQuantity,
                                          },
                                        },
                                      }))
                                    }}
                                    className="w-20 rounded-md border border-gray-300 px-2 py-1 text-sm"
                                  />
                                </label>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })
              )}
            </section>
          </div>
        )}

        {/* STEP 4: Data Pelanggan */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Data Pemesan (Guest Booking)</h2>
              <p className="text-sm text-gray-500">
                Informasi untuk konfirmasi reservasi dan administrasi hotel (Data disimpan sebagai Demo).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="label-field">Nama Lengkap *</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Nama Penanggung Jawab"
                    className="input-field pl-10"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  />
                  <User className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                </div>
              </div>

              <div>
                <label className="label-field">Alamat Email *</label>
                <input
                  type="email"
                  placeholder="email@perusahaan.com"
                  className="input-field"
                  value={formData.customerEmail}
                  onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                />
              </div>

              <div>
                <label className="label-field">Nomor Telepon / WhatsApp *</label>
                <input
                  type="tel"
                  placeholder="08123456789"
                  className="input-field"
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                />
              </div>

              <div className="md:col-span-2">
                <label className="label-field">Nama Perusahaan / Organisasi *</label>
                <input
                  type="text"
                  placeholder="PT Maju Bersama"
                  className="input-field"
                  value={formData.customerCompany}
                  onChange={(e) => setFormData({ ...formData, customerCompany: e.target.value })}
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Ringkasan & Submit */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Ringkasan &amp; Konfirmasi</h2>
                <p className="text-sm text-gray-500">
                  Periksa rincian sebelum mengajukan jadwal booking.
                </p>
              </div>
            </div>

            {/* Event & Customer Summary Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary-600" />
                  Jadwal &amp; Acara
                </h3>
                <dl className="text-xs space-y-1.5 text-gray-600">
                  <div className="flex justify-between">
                    <dt className="text-gray-400">Acara:</dt>
                    <dd className="font-medium text-gray-900">{formData.eventName}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-400">Tipe:</dt>
                    <dd className="font-medium">{formData.eventType}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-400">Tanggal:</dt>
                    <dd className="font-medium">{formatDate(formData.startDate)} s/d {formatDate(formData.endDate)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-400">Waktu:</dt>
                    <dd className="font-medium">{formData.startTime} – {formData.endTime} WIB</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-400">Durasi:</dt>
                    <dd className="font-medium">{days} hari kalender</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-400">Peserta:</dt>
                    <dd className="font-medium">{formData.expectedPax} orang</dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <User className="w-4 h-4 text-primary-600" />
                  Data Kontak Pemesan
                </h3>
                <dl className="text-xs space-y-1.5 text-gray-600">
                  <div className="flex justify-between">
                    <dt className="text-gray-400">Nama:</dt>
                    <dd className="font-medium text-gray-900">{formData.customerName}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-400">Email:</dt>
                    <dd className="font-medium">{formData.customerEmail}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-400">Telepon:</dt>
                    <dd className="font-medium">{formData.customerPhone}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-400">Perusahaan:</dt>
                    <dd className="font-medium">{formData.customerCompany}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-400">Tipe Data:</dt>
                    <dd className="font-medium text-amber-600">is_dummy: true (Demo)</dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Komponen PriceSummary */}
            <PriceSummary
              calculation={totalCalculation}
              packageName={selectedPackage ? getPackageName(selectedPackage) : null}
            />

            {/* Error Submit */}
            {submitError && (
              <div className="rounded-lg bg-red-50 p-4 border border-red-200 text-sm text-red-700 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
                <div>
                  <p className="font-semibold">Pengajuan Belum Berhasil Disimpan</p>
                  <p className="text-xs mt-1 leading-relaxed">{submitError}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
              className="btn-secondary flex items-center gap-2 text-sm"
              disabled={isSubmitting}
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali
            </button>
          ) : (
            <div />
          )}

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => Math.min(5, prev + 1))}
              disabled={
                (currentStep === 1 && !isStep1Valid) ||
                (currentStep === 2 && !isStep2Valid) ||
                (currentStep === 4 && !isStep4Valid)
              }
              className="btn-primary flex items-center gap-2 text-sm"
            >
              Lanjutkan
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinalSubmit}
              disabled={isSubmitting}
              className="btn-primary flex items-center gap-2 text-sm bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <>Memproses Pengajuan...</>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Ajukan Booking Sekarang
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
