export function formatPrice(price?: number): string {
  if (!price) return 'N/A'
  if (price >= 100000) {
    return `₹${(price / 100000).toFixed(2)} L`
  }
  if (price >= 1000) {
    return `₹${(price / 1000).toFixed(1)}K`
  }
  return `₹${price.toLocaleString('en-IN')}`
}

export function formatDate(date?: Date | string): string {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatMonthYear(date?: Date | string): string {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
  })
}

export function getPrimaryImage(images?: Array<{ url: string; isPrimary?: boolean }>): string | null {
  if (!images || images.length === 0) return null
  const primary = images.find(img => img.isPrimary)
  return primary?.url || images[0]?.url || null
}

export function getStatusConfig(status: string) {
  switch (status) {
    case 'active':
      return { label: 'Available', className: 'bg-green-100 text-green-700', color: '#16a34a' }
    case 'hold':
      return { label: 'On Hold', className: 'bg-amber-100 text-amber-700', color: '#d97706' }
    case 'sold':
      return { label: 'Sold', className: 'bg-red-100 text-red-700', color: '#dc2626' }
    default:
      return { label: status, className: 'bg-gray-100 text-gray-700', color: '#64748b' }
  }
}

export function getConditionConfig(status: 'ok' | 'repaired' | 'notOk') {
  switch (status) {
    case 'ok':
      return { label: 'OK', className: 'bg-green-100 text-green-700 border-green-200', dot: 'bg-green-500' }
    case 'repaired':
      return { label: 'Repaired', className: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-500' }
    case 'notOk':
      return { label: 'Not OK', className: 'bg-red-100 text-red-700 border-red-200', dot: 'bg-red-500' }
  }
}

export function isExpired(date?: Date | string): boolean {
  if (!date) return false
  return new Date(date) < new Date()
}

export function clsx(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function generateShareText(car: {
  name: string
  year: number
  askingPrice?: number
  carId: string
  fuelType: string
  odometer?: number
}): string {
  return `🚗 ${car.year} ${car.name}
💰 ${formatPrice(car.askingPrice)}
⛽ ${car.fuelType}
📍 ID: ${car.carId}
${car.odometer ? `🔢 ${(car.odometer / 1000).toFixed(0)}k km` : ''}`
}

export function truncate(str: string, length: number): string {
  return str.length > length ? `${str.substring(0, length)}...` : str
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export const PERMISSIONS_LABELS: Record<string, string> = {
  'cars:create': 'Add Cars',
  'cars:edit': 'Edit Cars',
  'cars:delete': 'Delete Cars',
  'cars:view': 'View Cars',
  'inquiries:view': 'View Inquiries',
  'inquiries:reply': 'Reply to Inquiries',
  'employees:manage': 'Manage Employees',
}

export const FUEL_TYPES = ['petrol', 'diesel', 'cng', 'electric', 'hybrid']
export const TRANSMISSION_TYPES = ['manual', 'automatic', 'amt']
export const CAR_STATUSES = ['active', 'hold', 'sold']
export const IMAGE_CATEGORIES = ['front', 'back', 'left', 'right', 'engine', 'interior', 'dashboard', 'other']
