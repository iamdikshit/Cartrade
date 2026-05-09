'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Search, SlidersHorizontal, X, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import CarCard from './CarCard'

const FUEL_TYPES = ['petrol', 'diesel', 'cng', 'electric', 'hybrid']
const STATUSES = [
  { value: '', label: 'All Cars' },
  { value: 'active', label: 'Available' },
  { value: 'hold', label: 'On Hold' },
  { value: 'sold', label: 'Sold' },
]

interface CarsListingProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default function CarsListingClient({ searchParams: initialParams }: CarsListingProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [cars, setCars] = useState<any[]>([])
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, hasNext: false, hasPrev: false })
  const [loading, setLoading] = useState(true)
  const [filtersOpen, setFiltersOpen] = useState(false)

  // Filter state
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [status, setStatus] = useState(searchParams.get('status') || '')
  const [fuelType, setFuelType] = useState(searchParams.get('fuelType') || '')
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'createdAt')
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'))

  const fetchCars = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (status) params.set('status', status)
      if (fuelType) params.set('fuelType', fuelType)
      params.set('sortBy', sortBy)
      params.set('page', String(page))
      params.set('limit', '12')

      const res = await fetch(`/api/cars?${params}`)
      const data = await res.json()
      if (data.success) {
        setCars(data.cars)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Failed to fetch cars:', error)
    } finally {
      setLoading(false)
    }
  }, [search, status, fuelType, sortBy, page])

  useEffect(() => {
    fetchCars()
  }, [fetchCars])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchCars()
  }

  const handleFilterChange = (key: string, value: string) => {
    setPage(1)
    if (key === 'status') setStatus(value)
    if (key === 'fuelType') setFuelType(value)
    if (key === 'sortBy') setSortBy(value)
  }

  const clearFilters = () => {
    setSearch('')
    setStatus('')
    setFuelType('')
    setSortBy('createdAt')
    setPage(1)
  }

  const activeFiltersCount = [status, fuelType].filter(Boolean).length

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl sm:text-4xl font-700 text-dark-900 mb-2">Browse Cars</h1>
        <p className="text-dark-500">
          {loading ? 'Searching...' : `${pagination.total} cars found`}
        </p>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-2xl border border-dark-100 p-4 mb-8 shadow-sm">
        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by make, model, or car ID..."
              className="w-full pl-11 pr-4 py-3 bg-dark-50 border border-dark-200 rounded-xl text-dark-900 placeholder-dark-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            className="bg-brand-gradient text-white px-5 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity"
          >
            Search
          </button>
          <button
            type="button"
            onClick={() => setFiltersOpen(!filtersOpen)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border font-medium transition-colors relative ${
              filtersOpen || activeFiltersCount > 0
                ? 'bg-brand-50 border-brand-300 text-brand-700'
                : 'border-dark-200 text-dark-600 hover:bg-dark-50'
            }`}
          >
            <SlidersHorizontal className="w-5 h-5" />
            <span className="hidden sm:inline">Filters</span>
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-brand-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </form>

        {/* Status tabs */}
        <div className="flex gap-2 flex-wrap">
          {STATUSES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => handleFilterChange('status', value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                status === value
                  ? 'bg-brand-gradient text-white shadow-sm'
                  : 'bg-dark-50 text-dark-600 hover:bg-dark-100'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Expanded filters */}
        {filtersOpen && (
          <div className="mt-4 pt-4 border-t border-dark-100 grid sm:grid-cols-3 gap-4 animate-slide-up">
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">Fuel Type</label>
              <select
                value={fuelType}
                onChange={e => handleFilterChange('fuelType', e.target.value)}
                className="w-full px-3 py-2.5 bg-dark-50 border border-dark-200 rounded-xl text-dark-900 focus:outline-none focus:border-brand-500"
              >
                <option value="">All Fuel Types</option>
                {FUEL_TYPES.map(f => (
                  <option key={f} value={f} className="capitalize">{f.charAt(0).toUpperCase() + f.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={e => handleFilterChange('sortBy', e.target.value)}
                className="w-full px-3 py-2.5 bg-dark-50 border border-dark-200 rounded-xl text-dark-900 focus:outline-none focus:border-brand-500"
              >
                <option value="createdAt">Newest First</option>
                <option value="askingPrice">Price: Low to High</option>
                <option value="-askingPrice">Price: High to Low</option>
                <option value="year">Year: Newest</option>
                <option value="views">Most Viewed</option>
              </select>
            </div>
            {activeFiltersCount > 0 && (
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 text-dark-500 hover:text-red-500 text-sm font-medium transition-colors"
                >
                  <X className="w-4 h-4" /> Clear all filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cars grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden border border-dark-100">
              <div className="h-48 skeleton" />
              <div className="p-4 space-y-3">
                <div className="h-5 skeleton rounded-lg w-3/4" />
                <div className="h-4 skeleton rounded-lg w-1/2" />
                <div className="h-6 skeleton rounded-lg w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : cars.length > 0 ? (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cars.map((car) => (
              <CarCard key={car._id} car={car} />
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-10">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={!pagination.hasPrev}
                className="flex items-center gap-1 px-4 py-2 rounded-xl border border-dark-200 text-dark-600 hover:bg-dark-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Prev
              </button>
              
              <span className="text-dark-600 text-sm font-medium">
                Page {pagination.page} of {pagination.pages}
              </span>

              <button
                onClick={() => setPage(p => p + 1)}
                disabled={!pagination.hasNext}
                className="flex items-center gap-1 px-4 py-2 rounded-xl border border-dark-200 text-dark-600 hover:bg-dark-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="font-display text-xl font-700 text-dark-900 mb-2">No cars found</h3>
          <p className="text-dark-500 mb-6">Try adjusting your search or filters</p>
          <button
            onClick={clearFilters}
            className="bg-brand-gradient text-white px-6 py-3 rounded-xl font-semibold"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  )
}
