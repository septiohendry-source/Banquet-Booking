// ============================================================
// Type definitions untuk schema banquet_v2 di Supabase
// Selaras dengan struktur tabel riil di database Supabase
// ============================================================

export interface Room {
  room_id: number | string
  id?: string // alias compatibility
  room_name: string
  name?: string // alias compatibility
  room_type: string | null
  capacity: number | null
  location: string | null
  floor?: string | null
  base_price: number | null
  currency: string
  tax_per_room: number | null
  service_per_room: number | null
  notes?: string | null
  description?: string | null
  is_active: boolean
  is_dummy: boolean
}

export interface Package {
  package_id: number | string
  id?: string // alias compatibility
  package_name: string
  name?: string // alias compatibility
  duration_type: string | null
  price_per_pax: number | null
  price_is_net: boolean
  includes_description?: string | null
  description?: string | null
  includes?: string[] | null
  image_url?: string | null
  source_note?: string | null
  is_active: boolean
}

export interface Facility {
  facility_id: number | string
  id?: string
  facility_name: string
  name?: string
  category: string | null
  unit?: string | null
  is_standard?: boolean
  is_chargeable?: boolean
  default_unit_price?: number | null
  notes?: string | null
  description?: string | null
  is_active: boolean
}

export interface Addon {
  addon_id: number | string
  id?: string
  addon_name: string
  name?: string
  category: string | null
  unit: string | null
  unit_price: number | null
  price?: number | null
  total_quantity: number | null
  stock?: number | null
  stock_verified?: boolean
  notes?: string | null
  description?: string | null
  is_active: boolean
}

export interface Customer {
  id?: string
  customer_id: number | string
  company: string
  customer_type: string
  notes: string | null
  is_dummy: boolean
  created_at?: string
}

export interface CustomerContact {
  contact_id?: number | string
  customer_id: number | string
  contact_name: string | null
  role_title: string | null
  phone: string | null
  email: string | null
  is_primary: boolean
  notes: string | null
  created_at?: string
}

export interface Booking {
  booking_id?: number | string
  booking_code?: string
  id?: string
  customer_id: string | number | null
  event_name: string
  event_type: string | null
  booking_status: BookingStatus
  starts_at: string
  ends_at: string
  expected_pax: number
  guaranteed_pax?: number | null
  hold_expires_at: string | null
  package_id: string | number | null
  package_price_snapshot: number | null
  package_days: number | null
  package_total_snapshot: number | null
  total_amount: number | null
  is_dummy: boolean
  created_at?: string
  updated_at?: string
}

export interface BookingRoomReservation {
  reservation_id?: number | string
  booking_id: string | number
  room_id: string | number
  starts_at: string
  ends_at: string
  days: number
  reservation_status: string
  hold_expires_at: string | null
  expected_pax?: number | null
  guaranteed_pax?: number | null
  setup_style?: string | null
  rate_per_day: number | null
  room_base_total: number | null
  tax_amount: number | null
  service_amount: number | null
  total_per_ruangan: number | null
  created_at?: string
}

export type BookingStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Completed'
  | 'Cancelled'
  | 'Expired'

export const HOLDING_STATUSES: BookingStatus[] = ['Pending', 'Confirmed']

export const EVENT_TYPES = [
  'Meeting',
  'Seminar',
  'Workshop',
  'Conference',
  'Wedding',
  'Birthday',
  'Gathering',
  'Exhibition',
  'Lainnya',
] as const

export type EventType = (typeof EVENT_TYPES)[number]
