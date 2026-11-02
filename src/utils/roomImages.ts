import type { Room } from '@/types/database'

const meetingRoomImages = [
  'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1497366858526-0766cadbe8fa?auto=format&fit=crop&w=1200&q=80',
]

const roomTypeImages: Record<string, string> = {
  ballroom:
    'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80',
  restaurant:
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
  event_space:
    'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1200&q=80',
}

const roomSpecificImages: Record<string, string> = {
  agate: '/rooms/Agate — Meeting Room.jpg',
  'city grand ballroom': '/rooms/City Grand Ballroom — Ballroom.jpg',
  coral: '/rooms/Coral — Meeting Room.jpg',
  diamond: '/rooms/Diamond — Meeting Room.jpg',
  emerald: '/rooms/Emerald — Meeting Room.jpg',
  'han palace': '/rooms/Han Palace — Restauran.jpg',
  'harmoni square': '/rooms/Harmoni Square — Restaurant  Event Space.jpg',
  opal: '/rooms/Opal — Meeting Room.jpg',
  'pool side': '/rooms/Pool Side — Event Space.jpg',
  sapphire: '/rooms/Sapphire — Meeting Room.jpg',
  topaz: '/rooms/Topaz.jpg',
}

const roomIdImages: Record<number, string> = {
  1: '/rooms/Topaz.jpg',
  2: '/rooms/Harmoni Square — Restaurant  Event Space.jpg',
  3: '/rooms/Pool Side — Event Space.jpg',
  4: '/rooms/Han Palace — Restauran.jpg',
  5: '/rooms/City Grand Ballroom — Ballroom.jpg',
  6: '/rooms/Diamond — Meeting Room.jpg',
  7: '/rooms/Agate — Meeting Room.jpg',
  8: '/rooms/Sapphire — Meeting Room.jpg',
  9: '/rooms/Emerald — Meeting Room.jpg',
  10: '/rooms/Coral — Meeting Room.jpg',
  11: '/rooms/Opal — Meeting Room.jpg',
}

function normalizeRoomName(value: string): string {
  return value
    .toLowerCase()
    .replace(/[\u2014\u2013\-_]+/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function getRoomImageUrl(room: Room): string {
  const roomId = Number(room.room_id ?? room.id ?? 0)
  if (Number.isFinite(roomId) && roomId > 0 && roomIdImages[roomId]) {
    return encodeURI(roomIdImages[roomId])
  }

  const roomType = room.room_type?.toLowerCase() ?? ''
  const roomName = normalizeRoomName(room.room_name || room.name || '')

  const roomKey = Object.keys(roomSpecificImages).find((key) => {
    const normalizedKey = normalizeRoomName(key)
    return roomName === normalizedKey || roomName.includes(normalizedKey)
  })

  if (roomKey) {
    return encodeURI(roomSpecificImages[roomKey])
  }

  if (roomName.includes('pool')) {
    return encodeURI('/rooms/Pool Side — Event Space.jpg')
  }
  if (roomName.includes('ballroom') || roomType === 'ballroom') {
    return encodeURI('/rooms/City Grand Ballroom — Ballroom.jpg')
  }
  if (roomName.includes('palace') || roomType === 'restaurant') {
    return encodeURI('/rooms/Han Palace — Restauran.jpg')
  }
  if (roomType === 'restaurant' || roomType === 'event_space') {
    return encodeURI('/rooms/Harmoni Square — Restaurant  Event Space.jpg')
  }

  const imageIndex = Number.isFinite(roomId)
    ? Math.abs(roomId) % meetingRoomImages.length
    : 0

  return meetingRoomImages[imageIndex]
}
