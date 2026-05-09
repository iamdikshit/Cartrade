'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import CarForm from '@/components/admin/CarForm'
import { Loader2 } from 'lucide-react'

export default function EditCarPage() {
  const { id } = useParams()
  const { fetchWithAuth } = useAdminAuth()
  const [car, setCar] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchCar() {
      try {
        const res = await fetchWithAuth(`/api/cars/${id}`)
        const data = await res.json()
        if (data.success) {
          setCar(data.car)
        } else {
          setError('Car not found')
        }
      } catch {
        setError('Failed to load car')
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchCar()
  }, [id, fetchWithAuth])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    )
  }

  if (error || !car) {
    return (
      <div className="text-center py-12">
        <p className="text-dark-500">{error || 'Car not found'}</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-700 text-dark-900">Edit Car</h2>
        <p className="text-dark-500 text-sm mt-1 font-mono">{car.carId} — {car.name}</p>
      </div>
      <CarForm initialData={car} carId={id as string} />
    </div>
  )
}
