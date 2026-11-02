export function getFacilityImageUrl(name: string): string {
  const normalized = (name ?? '')
    .toLowerCase()
    .replace(/[\u2014\u2013\-_]+/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  const imageMap: Record<string, string> = {
    'extension cable': '/facilities/Extension Cable.jpg',
    'flipchart': '/facilities/Flipchart.jpg',
    'lan cable': '/facilities/LAN Cable.jpg',
    'podium': '/facilities/Podium.jpg',
    'projector screen': '/facilities/Projector + Screen.jpg',
    'projector + screen': '/facilities/Projector + Screen.jpg',
    'sound system': '/facilities/Sound System.jpg',
    'wifi': '/facilities/Wi-Fi.jpg',
    'wi fi': '/facilities/Wi-Fi.jpg',
    'wireless microphone': '/facilities/Wireless Microphone.jpg',
  }

  const exact = Object.keys(imageMap).find((key) => normalized === key)
  if (exact) return imageMap[exact]

  const partial = Object.keys(imageMap).find((key) => normalized.includes(key))
  if (partial) return imageMap[partial]

  return '/facilities/Wi-Fi.jpg'
}
