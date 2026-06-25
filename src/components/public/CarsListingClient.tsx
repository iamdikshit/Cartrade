'use client'
import { useState, useEffect, useCallback } from 'react'
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react'
import CarCard from './CarCard'

const FUEL_TYPES = ['petrol', 'diesel', 'cng', 'electric', 'hybrid']
const STATUSES = [
  { value: '',       label: 'All' },
  { value: 'active', label: 'Available' },
  { value: 'hold',   label: 'On Hold' },
  { value: 'sold',   label: 'Sold' },
]

export default function CarsListingClient({ searchParams: initialParams }: { searchParams: any }) {
  const [cars, setCars]             = useState<any[]>([])
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, hasNext: false, hasPrev: false })
  const [loading, setLoading]       = useState(true)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const [search,  setSearch]  = useState('')
  const [status,  setStatus]  = useState('')
  const [fuelType,setFuelType]= useState('')
  const [sortBy,  setSortBy]  = useState('createdAt')
  const [page,    setPage]    = useState(1)

  const fetchCars = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search)   params.set('search', search)
      if (status)   params.set('status', status)
      if (fuelType) params.set('fuelType', fuelType)
      params.set('sortBy', sortBy)
      params.set('page', String(page))
      params.set('limit', '12')

      const res  = await fetch(`/api/cars?${params}`)
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

  useEffect(() => { fetchCars() }, [fetchCars])

  const activeFiltersCount = [status, fuelType].filter(Boolean).length

  const clearFilters = () => {
    setSearch(''); setStatus(''); setFuelType(''); setSortBy('createdAt'); setPage(1)
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 overflow-x-hidden">
      {/* Header */}
      <div className="mb-5 sm:mb-8">
        <h1 className="font-display text-2xl sm:text-4xl font-700 text-dark-900 mb-1">Browse Cars</h1>
        <p className="text-dark-500 text-sm">{loading ? 'Searching...' : `${pagination.total} cars found`}</p>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-2xl border border-dark-100 p-3 sm:p-4 mb-6 shadow-sm">
        {/* Search bar */}
        <form onSubmit={e => { e.preventDefault(); setPage(1); fetchCars() }} className="flex gap-2 mb-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by make, model or ID..."
              className="w-full pl-9 pr-3 py-2.5 bg-dark-50 border border-dark-200 rounded-xl text-dark-900 placeholder-dark-400 text-sm focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>
          <button type="submit"
            className="bg-brand-gradient text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity flex-shrink-0">
            Search
          </button>
          <button type="button" onClick={() => setFiltersOpen(!filtersOpen)}
            className={`relative flex items-center gap-1.5 px-3 py-2.5 rounded-xl border font-medium text-sm transition-colors flex-shrink-0 ${
              filtersOpen || activeFiltersCount > 0
                ? 'bg-brand-50 border-brand-300 text-brand-700'
                : 'border-dark-200 text-dark-600 hover:bg-dark-50'
            }`}>
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-brand-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </form>

        {/* Status tabs — scrollable on mobile */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-0.5">
          {STATUSES.map(({ value, label }) => (
            <button key={value} onClick={() => { setStatus(value); setPage(1) }}
              className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-colors ${
                status === value ? 'bg-brand-gradient text-white shadow-sm' : 'bg-dark-50 text-dark-600 hover:bg-dark-100'
              }`}>
              {label}
            </button>
          ))}
        </div>

        {/* Expanded filters */}
        {filtersOpen && (
          <div className="mt-3 pt-3 border-t border-dark-100 grid grid-cols-2 sm:grid-cols-3 gap-3 animate-slide-up">
            <div>
              <label className="block text-xs font-medium text-dark-700 mb-1.5">Fuel Type</label>
              <select value={fuelType} onChange={e => { setFuelType(e.target.value); setPage(1) }}
                className="w-full px-3 py-2 bg-dark-50 border border-dark-200 rounded-xl text-dark-900 text-sm focus:outline-none focus:border-brand-500">
                <option value="">All Fuels</option>
                {FUEL_TYPES.map(f => <option key={f} value={f} className="capitalize">{f.charAt(0).toUpperCase() + f.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-dark-700 mb-1.5">Sort By</label>
              <select value={sortBy} onChange={e => { setSortBy(e.target.value); setPage(1) }}
                className="w-full px-3 py-2 bg-dark-50 border border-dark-200 rounded-xl text-dark-900 text-sm focus:outline-none focus:border-brand-500">
                <option value="createdAt">Newest First</option>
                <option value="askingPrice">Price: Low to High</option>
                <option value="year">Year: Newest</option>
                <option value="views">Most Viewed</option>
              </select>
            </div>
            {activeFiltersCount > 0 && (
              <div className="flex items-end col-span-2 sm:col-span-1">
                <button onClick={clearFilters}
                  className="flex items-center gap-1.5 text-dark-500 hover:text-red-500 text-sm font-medium transition-colors">
                  <X className="w-4 h-4" /> Clear filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cars grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden border border-dark-100">
              <div className="h-40 sm:h-48 skeleton" />
              <div className="p-3 space-y-2">
                <div className="h-4 skeleton rounded-lg w-3/4" />
                <div className="h-3 skeleton rounded-lg w-1/2" />
                <div className="h-5 skeleton rounded-lg w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : cars.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {cars.map(car => <CarCard key={car._id} car={car} />)}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-8">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={!pagination.hasPrev}
                className="flex items-center gap-1 px-3 sm:px-4 py-2 rounded-xl border border-dark-200 text-dark-600 hover:bg-dark-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm">
                <ChevronLeft className="w-4 h-4" /> Prev
              </button>
              <span className="text-dark-600 text-sm font-medium">
                {pagination.page} / {pagination.pages}
              </span>
              <button onClick={() => setPage(p => p + 1)} disabled={!pagination.hasNext}
                className="flex items-center gap-1 px-3 sm:px-4 py-2 rounded-xl border border-dark-200 text-dark-600 hover:bg-dark-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm">
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="font-display text-xl font-700 text-dark-900 mb-2">No cars found</h3>
          <p className="text-dark-500 mb-5 text-sm">Try adjusting your search or filters</p>
          <button onClick={clearFilters}
            className="bg-brand-gradient text-white px-6 py-3 rounded-xl font-semibold text-sm">
            Clear Filters
          </button>
        </div>
      )}
    </div>
  )
}
