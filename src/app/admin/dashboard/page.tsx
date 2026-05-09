'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Car, MessageSquare, Eye, TrendingUp, Plus, ArrowRight, Clock, CheckCircle } from 'lucide-react'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { formatPrice, formatDate, getStatusConfig } from '@/lib/utils'

interface DashboardStats {
  totalCars: number
  activeCars: number
  soldCars: number
  holdCars: number
  totalInquiries: number
  newInquiries: number
  totalViews: number
  recentCars: any[]
  recentInquiries: any[]
}

export default function AdminDashboard() {
  const { fetchWithAuth, user } = useAdminAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const [carsRes, inqRes] = await Promise.all([
          fetchWithAuth('/api/cars?limit=5&page=1'),
          fetchWithAuth('/api/inquiry?limit=5'),
        ])

        const carsData = await carsRes.json()
        const inqData = await inqRes.json()

        // Also get stats for different statuses
        const [activeRes, soldRes, holdRes] = await Promise.all([
          fetchWithAuth('/api/cars?status=active&limit=1'),
          fetchWithAuth('/api/cars?status=sold&limit=1'),
          fetchWithAuth('/api/cars?status=hold&limit=1'),
        ])

        const activeData = await activeRes.json()
        const soldData = await soldRes.json()
        const holdData = await holdRes.json()

        setStats({
          totalCars: carsData.pagination?.total || 0,
          activeCars: activeData.pagination?.total || 0,
          soldCars: soldData.pagination?.total || 0,
          holdCars: holdData.pagination?.total || 0,
          totalInquiries: inqData.pagination?.total || 0,
          newInquiries: inqData.inquiries?.filter((i: any) => i.status === 'new').length || 0,
          totalViews: carsData.cars?.reduce((sum: number, c: any) => sum + (c.views || 0), 0) || 0,
          recentCars: carsData.cars || [],
          recentInquiries: inqData.inquiries || [],
        })
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [fetchWithAuth])

  const statCards = [
    {
      label: 'Total Cars', value: stats?.totalCars || 0, icon: Car,
      color: 'bg-blue-500', bg: 'bg-blue-50', text: 'text-blue-600',
      sub: `${stats?.activeCars || 0} active`,
    },
    {
      label: 'Cars Sold', value: stats?.soldCars || 0, icon: CheckCircle,
      color: 'bg-green-500', bg: 'bg-green-50', text: 'text-green-600',
      sub: `${stats?.holdCars || 0} on hold`,
    },
    {
      label: 'Inquiries', value: stats?.totalInquiries || 0, icon: MessageSquare,
      color: 'bg-purple-500', bg: 'bg-purple-50', text: 'text-purple-600',
      sub: `${stats?.newInquiries || 0} new`,
    },
    {
      label: 'Total Views', value: stats?.totalViews || 0, icon: Eye,
      color: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-600',
      sub: 'across all listings',
    },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome banner */}
      <div className="bg-brand-gradient rounded-2xl p-6 text-white">
        <h2 className="font-display text-2xl font-700 mb-1">
          Welcome back, {user?.name?.split(' ')[0]}! 👋
        </h2>
        <p className="text-orange-100 text-sm">Here's what's happening with your inventory today.</p>
        <Link
          href="/admin/cars/new"
          className="inline-flex items-center gap-2 bg-white text-brand-600 font-semibold px-4 py-2 rounded-xl mt-4 text-sm hover:bg-orange-50 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add New Car
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-dark-100 h-28 skeleton" />
          ))
        ) : statCards.map(({ label, value, icon: Icon, bg, text, sub }) => (
          <div key={label} className="bg-white rounded-2xl p-5 border border-dark-100 shadow-sm">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${text}`} />
            </div>
            <p className="font-display text-2xl font-800 text-dark-900">{value.toLocaleString()}</p>
            <p className="text-dark-600 text-sm font-medium">{label}</p>
            <p className="text-dark-400 text-xs mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Cars */}
        <div className="bg-white rounded-2xl border border-dark-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-dark-100">
            <h3 className="font-display font-700 text-dark-900">Recent Cars</h3>
            <Link href="/admin/cars" className="text-brand-600 text-sm font-medium hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-dark-50">
            {loading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="p-4 flex gap-3">
                  <div className="w-12 h-10 skeleton rounded-lg flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 skeleton rounded w-2/3" />
                    <div className="h-3 skeleton rounded w-1/3" />
                  </div>
                </div>
              ))
            ) : stats?.recentCars.map((car: any) => {
              const status = getStatusConfig(car.status)
              return (
                <Link key={car._id} href={`/admin/cars/${car._id}`} className="flex items-center gap-3 p-4 hover:bg-dark-50 transition-colors">
                  <div className="w-12 h-10 bg-dark-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                    {car.images?.[0]?.url ? (
                      <img src={car.images[0].url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-dark-400 text-xs">🚗</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-dark-800 text-sm font-semibold truncate">{car.year} {car.name}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-dark-400 text-xs font-mono">{car.carId}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${status.className}`}>{status.label}</span>
                    </div>
                  </div>
                  <p className="text-brand-600 text-sm font-semibold flex-shrink-0">{formatPrice(car.askingPrice)}</p>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Recent Inquiries */}
        <div className="bg-white rounded-2xl border border-dark-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-dark-100">
            <h3 className="font-display font-700 text-dark-900">Recent Inquiries</h3>
            <Link href="/admin/inquiries" className="text-brand-600 text-sm font-medium hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-dark-50">
            {loading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="p-4 space-y-2">
                  <div className="h-4 skeleton rounded w-1/2" />
                  <div className="h-3 skeleton rounded w-3/4" />
                </div>
              ))
            ) : stats?.recentInquiries.length === 0 ? (
              <div className="p-8 text-center text-dark-400 text-sm">No inquiries yet</div>
            ) : stats?.recentInquiries.map((inq: any) => (
              <Link key={inq._id} href={`/admin/inquiries?id=${inq._id}`} className="block p-4 hover:bg-dark-50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-dark-800 text-sm font-semibold truncate">{inq.name}</p>
                    <p className="text-dark-400 text-xs truncate">{inq.carName}</p>
                    <p className="text-dark-500 text-xs mt-1 truncate">{inq.message}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      inq.status === 'new' ? 'bg-blue-100 text-blue-600' :
                      inq.status === 'replied' ? 'bg-green-100 text-green-600' :
                      'bg-dark-100 text-dark-500'
                    }`}>{inq.status}</span>
                    <span className="text-dark-400 text-xs flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(inq.createdAt)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
