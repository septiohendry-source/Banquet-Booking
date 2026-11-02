import Image from 'next/image'
import type { Room } from '@/types/database'
import { getRoomImageUrl } from '@/utils/roomImages'

interface RoomImageProps {
  room: Room
  className?: string
  sizes?: string
  priority?: boolean
}

export default function RoomImage({
  room,
  className = 'relative h-48 w-full overflow-hidden',
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  priority = false,
}: RoomImageProps) {
  const roomName = room.room_name || room.name || 'Ruangan'

  return (
    <div className={className}>
      <Image
        src={getRoomImageUrl(room)}
        alt={`Foto ruangan ${roomName}`}
        fill
        sizes={sizes}
        priority={priority}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        unoptimized
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
      <span className="absolute bottom-2 right-2 rounded bg-black/55 px-2 py-1 text-[10px] font-medium text-white">
        Foto ruangan
      </span>
    </div>
  )
}
