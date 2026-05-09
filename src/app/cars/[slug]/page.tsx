import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import connectDB from '@/lib/db'
import { Car } from '@/models/Car'
import Navbar from '@/components/public/Navbar'
import CarDetailClient from '@/components/public/CarDetailClient'

interface Props {
  params: { slug: string }
}

async function getCar(slug: string) {
  try {
    await connectDB()
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(slug)
    const query = isObjectId ? { _id: slug } : { $or: [{ slug }, { carId: slug }] }
    const car = await Car.findOne(query).lean()
    return car ? JSON.parse(JSON.stringify(car)) : null
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const car = await getCar(params.slug)
  if (!car) return { title: 'Car Not Found' }
  return {
    title: `${car.year} ${car.name}`,
    description: `${car.year} ${car.name} | ${car.fuelType} | ${car.transmission} | Available at CarTrade`,
    openGraph: {
      title: `${car.year} ${car.name} — CarTrade`,
      description: car.description || `Inspected ${car.year} ${car.name} for sale`,
      images: car.images?.[0]?.url ? [{ url: car.images[0].url }] : [],
    },
  }
}

export default async function CarDetailPage({ params }: Props) {
  const car = await getCar(params.slug)
  if (!car) notFound()

  // Increment views
  Car.findByIdAndUpdate(car._id, { $inc: { views: 1 } }).exec().catch(() => {})

  return (
    <div className="min-h-screen bg-dark-50">
      <Navbar />
      <div className="pt-16">
        <CarDetailClient car={car} />
      </div>
    </div>
  )
}
