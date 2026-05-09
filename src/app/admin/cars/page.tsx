'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Plus, Search, Edit, Trash2, Eye, MoreVertical, Car, Filter } from 'lucide-react'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { formatPrice, getStatusConfig } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function AdminCarsPage() {
  const { fetchWithAuth, hasPermission, isRoot } = useAdminAuth()
  const [cars, setCars] = useState<any[]>([])
  const [pagination, setPagination] = useState({ total: 0, pages: 1, page: 1 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [actionMenu, setActionMenu] = useState<string | null>(null)

  const fetchCars = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '15' })
      if (search) params.set('search', search)
      if (status) params.set('status', status)

      const res = await fetchWithAuth(`/api/cars?${params}`)
      const data = await res.json()
      if (data.success) {
        setCars(data.cars)
        setPagination(data.pagination)
      }
    } catch { } finally { setLoading(false) }
  }, [fetchWithAuth, page, search, status])

  useEffect(() => { fetchCars() }, [fetchCars])

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    try {
      const res = await fetchWithAuth(`/api/cars/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Car deleted')
        fetchCars()
      } else {
        toast.error('Failed to delete car')
      }
    } catch { toast.error('Error deleting car') }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetchWithAuth(`/api/cars/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        toast.success(`Status updated to ${newStatus}`)
        fetchCars()
      }
    } catch { toast.error('Failed to update status') }
    setActionMenu(null)
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <h2 className="font-display text-xl font-700 text-dark-900">Car Inventory</h2>
          <p className="text-dark-500 text-sm">{pagination.total} total cars</p>
        </div>
        {(hasPermission('cars:create') || isRoot) && (
          <Link
            href="/admin/cars/new"
            className="inline-flex items-center gap-2 bg-brand-gradient text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add New Car
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-dark-100 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
            <input
              type="text"
              placeholder="Search cars..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              className="w-full pl-10 pr-4 py-2.5 bg-dark-50 border border-dark-200 rounded-xl text-sm text-dark-900 placeholder-dark-400 focus:outline-none focus:border-brand-500"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {[
              { value: '', label: 'All' },
              { value: 'active', label: 'Active' },
              { value: 'hold', label: 'Hold' },
              { value: 'sold', label: 'Sold' },
            ].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => { setStatus(value); setPage(1) }}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  status === value ? 'bg-brand-gradient text-white' : 'bg-dark-50 text-dark-600 hover:bg-dark-100'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-dark-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : cars.length === 0 ? (
          <div className="p-12 text-center">
            <Car className="w-12 h-12 text-dark-200 mx-auto mb-3" />
            <p className="text-dark-500 font-medium">No cars found</p>
            <Link href="/admin/cars/new" className="text-brand-600 text-sm hover:underline mt-2 inline-block">Add your first car</Link>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-dark-50 border-b border-dark-100">
                  <tr>
                    {['Car', 'ID', 'Fuel/Trans', 'Price', 'Status', 'Views', 'Actions'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-dark-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-50">
                  {cars.map(car => {
                    const status = getStatusConfig(car.status)
                    return (
                      <tr key={car._id} className="hover:bg-dark-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-9 bg-dark-100 rounded-lg overflow-hidden flex-shrink-0">
                              {car.images?.[0]?.url ? (
                                <img src={car.images[0].url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-dark-300 text-xs">🚗</div>
                              )}
                            </div>
                            <div>
                              <p className="text-dark-800 text-sm font-semibold">{car.year} {car.name}</p>
                              <p className="text-dark-400 text-xs">{car.make} {car.model}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs bg-dark-100 px-2 py-0.5 rounded">{car.carId}</span>
                        </td>
                        <td className="px-4 py-3 text-dark-600 text-sm capitalize">
                          {car.fuelType} / {car.transmission}
                        </td>
                        <td className="px-4 py-3 font-semibold text-brand-600 text-sm">
                          {formatPrice(car.askingPrice)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${status.className}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-dark-400 text-sm">{car.views || 0}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Link
                              href={`/cars/${car.slug}`}
                              target="_blank"
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-dark-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              title="View public page"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            {(hasPermission('cars:edit') || isRoot) && (
                              <Link
                                href={`/admin/cars/${car._id}`}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-dark-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </Link>
                            )}
                            {(hasPermission('cars:delete') || isRoot) && (
                              <button
                                onClick={() => handleDelete(car._id, car.name)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-dark-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                            {/* Status dropdown */}
                            <div className="relative">
                              <button
                                onClick={() => setActionMenu(actionMenu === car._id ? null : car._id)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-dark-400 hover:text-dark-600 hover:bg-dark-100 transition-colors"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>
                              {actionMenu === car._id && (
                                <div className="absolute right-0 top-9 bg-white border border-dark-200 rounded-xl shadow-lg z-10 py-1 w-36 animate-scale-in">
                                  {['active', 'hold', 'sold'].filter(s => s !== car.status).map(s => (
                                    <button
                                      key={s}
                                      onClick={() => handleStatusChange(car._id, s)}
                                      className="w-full text-left px-4 py-2 text-sm capitalize text-dark-700 hover:bg-dark-50 transition-colors"
                                    >
                                      Mark as {s}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-dark-100">
              {cars.map(car => {
                const status = getStatusConfig(car.status)
                return (
                  <div key={car._id} className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-14 h-11 bg-dark-100 rounded-lg overflow-hidden flex-shrink-0">
                        {car.images?.[0]?.url ? (
                          <img src={car.images[0].url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-lg">🚗</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-dark-800 truncate">{car.year} {car.name}</p>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-dark-400">{car.carId}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.className}`}>{status.label}</span>
                        </div>
                      </div>
                      <p className="font-bold text-brand-600 text-sm">{formatPrice(car.askingPrice)}</p>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/cars/${car.slug}`} target="_blank" className="flex-1 text-center py-2 text-xs font-medium bg-dark-100 text-dark-600 rounded-lg hover:bg-dark-200 transition-colors">View</Link>
                      {(hasPermission('cars:edit') || isRoot) && (
                        <Link href={`/admin/cars/${car._id}`} className="flex-1 text-center py-2 text-xs font-medium bg-brand-50 text-brand-600 rounded-lg hover:bg-brand-100 transition-colors">Edit</Link>
                      )}
                      {(hasPermission('cars:delete') || isRoot) && (
                        <button onClick={() => handleDelete(car._id, car.name)} className="flex-1 py-2 text-xs font-medium bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors">Delete</button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-dark-100">
            <p className="text-dark-500 text-sm">Page {pagination.page} of {pagination.pages}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm border border-dark-200 rounded-lg disabled:opacity-50 hover:bg-dark-50 transition-colors"
              >Prev</button>
              <button
                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                disabled={page === pagination.pages}
                className="px-3 py-1.5 text-sm border border-dark-200 rounded-lg disabled:opacity-50 hover:bg-dark-50 transition-colors"
              >Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
