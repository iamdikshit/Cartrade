import CarForm from '@/components/admin/CarForm'

export default function NewCarPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-700 text-dark-900">Add New Car</h2>
        <p className="text-dark-500 text-sm mt-1">Fill in all details for the auction report</p>
      </div>
      <CarForm />
    </div>
  )
}
