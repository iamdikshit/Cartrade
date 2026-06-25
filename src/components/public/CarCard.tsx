'use client'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Fuel, Gauge, Settings, Star, Share2, Eye } from 'lucide-react'
import { formatPrice, getStatusConfig, getPrimaryImage } from '@/lib/utils'

interface Car {
  _id: string
  carId: string
  name: string
  make: string
  year: number
  color?: string
  fuelType: string
  transmission: string
  odometer?: number
  askingPrice?: number
  status: string
  images?: Array<{ url: string; category: string; isPrimary?: boolean }>
  ratings?: { exterior: number; engine: number; ac: number; electrical: number; steering: number }
  location?: { address?: string; city?: string }
  slug: string
  views?: number
}

export default function CarCard({ car }: { car: Car }) {
  const primaryImage = getPrimaryImage(car.images)
  const avgRating = car.ratings
    ? Object.values(car.ratings).reduce((a, b) => a + b, 0) / 5
    : 0
  const statusConfig = getStatusConfig(car.status)

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault()
    const url = `${window.location.origin}/cars/${car.slug}`
    if (navigator.share) {
      await navigator.share({ title: `${car.name} - Cars Noida 99`, text: `Check out this ${car.year} ${car.name}`, url })
    } else {
      await navigator.clipboard.writeText(url)
    }
  }

  return (
    <Link href={`/cars/${car.slug}`} className="group block">
      <div className="bg-white rounded-2xl overflow-hidden border border-dark-100 card-hover shadow-sm h-full flex flex-col">
        {/* Image */}
        <div className="relative h-44 sm:h-48 bg-dark-100 overflow-hidden flex-shrink-0">
          {primaryImage ? (
            <Image
              src={primaryImage} alt={car.name} fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-dark-100 to-dark-200">
              <span className="text-dark-400 text-4xl">🚗</span>
            </div>
          )}

          <div className={`absolute top-2 left-2 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${statusConfig.className}`}>
            {statusConfig.label}
          </div>

          <button onClick={handleShare}
            className="absolute top-2 right-2 w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-dark-600 hover:text-brand-600 shadow-sm opacity-0 group-hover:opacity-100 transition-all"
            aria-label="Share">
            <Share2 className="w-3.5 h-3.5" />
          </button>

          <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-lg">
            <span className="text-white text-xs font-mono">{car.carId}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4 flex flex-col flex-1">
          <h3 className="font-display font-700 text-dark-900 text-base sm:text-lg leading-tight mb-1 group-hover:text-brand-600 transition-colors line-clamp-1">
            {car.year} {car.name}
          </h3>

          {avgRating > 0 && (
            <div className="flex items-center gap-1 mb-2">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span className="text-xs font-semibold text-dark-700">{avgRating.toFixed(1)}</span>
              <span className="text-xs text-dark-400">rating</span>
            </div>
          )}

          {/* Specs — 3 col grid */}
          <div className="grid grid-cols-3 gap-1.5 mb-2">
            <div className="flex items-center gap-1 text-dark-500">
              <Fuel className="w-3 h-3 flex-shrink-0" />
              <span className="text-xs capitalize truncate">{car.fuelType}</span>
            </div>
            <div className="flex items-center gap-1 text-dark-500">
              <Settings className="w-3 h-3 flex-shrink-0" />
              <span className="text-xs capitalize truncate">{car.transmission}</span>
            </div>
            {car.odometer !== undefined && (
              <div className="flex items-center gap-1 text-dark-500">
                <Gauge className="w-3 h-3 flex-shrink-0" />
                <span className="text-xs truncate">{(car.odometer / 1000).toFixed(0)}k km</span>
              </div>
            )}
          </div>

          {car.location?.city && (
            <div className="flex items-center gap-1 text-dark-400 mb-2">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="text-xs truncate">{car.location.city}</span>
            </div>
          )}

          {/* Price row */}
          <div className="flex items-center justify-between pt-2 border-t border-dark-100 mt-auto">
            {car.askingPrice ? (
              <p className="font-display font-700 text-lg text-brand-600">{formatPrice(car.askingPrice)}</p>
            ) : (
              <p className="text-dark-400 text-sm">Price on request</p>
            )}
            {(car.views ?? 0) > 0 && (
              <div className="flex items-center gap-1 text-dark-400">
                <Eye className="w-3 h-3" />
                <span className="text-xs">{car.views}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
