import type { BookingStatus } from '@/types/database'

interface StatusBadgeProps {
  status: BookingStatus
}

const STATUS_CONFIG: Record<BookingStatus, { bg: string; text: string; dot: string }> = {
  Pending: {
    bg: 'bg-yellow-100 border-yellow-300',
    text: 'text-yellow-800',
    dot: 'bg-yellow-500',
  },
  Confirmed: {
    bg: 'bg-green-100 border-green-300',
    text: 'text-green-800',
    dot: 'bg-green-500',
  },
  Completed: {
    bg: 'bg-blue-100 border-blue-300',
    text: 'text-blue-800',
    dot: 'bg-blue-500',
  },
  Cancelled: {
    bg: 'bg-red-100 border-red-300',
    text: 'text-red-800',
    dot: 'bg-red-500',
  },
  Expired: {
    bg: 'bg-gray-100 border-gray-300',
    text: 'text-gray-600',
    dot: 'bg-gray-400',
  },
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status]

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${config.bg} ${config.text}`}
    >
      <span className={`h-2 w-2 rounded-full ${config.dot}`} />
      {status}
    </span>
  )
}
