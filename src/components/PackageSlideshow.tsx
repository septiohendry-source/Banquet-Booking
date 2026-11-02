'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const slides = [
  {
    src: '/packages/Morning Coffee Break.jpg',
    alt: 'Hidangan Morning Coffee Break',
    caption: 'Morning Coffee Break',
  },
  {
    src: '/packages/Lunch.jpg',
    alt: 'Hidangan makan siang',
    caption: 'Lunch',
  },
  {
    src: '/packages/Afternoon Coffee Break.jpg',
    alt: 'Hidangan Afternoon Coffee Break',
    caption: 'Afternoon Coffee Break',
  },
]

export default function PackageSlideshow() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (isPaused) return

    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length)
    }, 5000)

    return () => window.clearInterval(intervalId)
  }, [isPaused])

  function showPrevious() {
    setActiveIndex((current) => (current - 1 + slides.length) % slides.length)
  }

  function showNext() {
    setActiveIndex((current) => (current + 1) % slides.length)
  }

  return (
    <div
      className="group relative h-56 w-full overflow-hidden bg-gray-100"
      role="region"
      aria-roledescription="carousel"
      aria-label="Foto hidangan paket meeting"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsPaused(false)
        }
      }}
    >
      {slides.map((slide, index) => (
        <div
          key={slide.src}
          className={`absolute inset-0 transition-opacity duration-700 ${
            index === activeIndex ? 'opacity-100' : 'opacity-0'
          }`}
          aria-hidden={index !== activeIndex}
        >
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            unoptimized
            priority={index === 0}
          />
        </div>
      ))}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-4 pt-12">
        <p className="text-sm font-semibold text-white" aria-live="polite">
          {slides[activeIndex].caption}
        </p>
      </div>

      <button
        type="button"
        onClick={showPrevious}
        aria-label="Foto sebelumnya"
        className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={showNext}
        aria-label="Foto berikutnya"
        className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div className="absolute bottom-4 right-4 flex gap-1.5">
        {slides.map((slide, index) => (
          <button
            key={slide.src}
            type="button"
            onClick={() => setActiveIndex(index)}
            aria-label={`Tampilkan foto ${slide.caption}`}
            aria-current={index === activeIndex}
            className={`h-2.5 rounded-full transition-all ${
              index === activeIndex
                ? 'w-6 bg-white'
                : 'w-2.5 bg-white/60 hover:bg-white/90'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
