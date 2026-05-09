'use client'
import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createEmployeeSchema, CreateEmployeeInput } from '@/lib/validation'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { PERMISSIONS_LABELS } from '@/lib/utils'
import { Plus, User, Shield, Loader2, Eye, EyeOff, X, Trash2, Check } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

const ALL_PERMISSIONS = Object.keys(PERMISSIONS_LABELS) as any[]

export default function AdminEmployeesPage() {
  const { fetchWithAuth, isRoot, user } = useAdminAuth()
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<CreateEmployeeInput>({
    resolver: zodResolver(createEmployeeSchema),
    defaultValues: { permissions: [] },
  })

  const watchedPermissions = watch('permissions') || []

  const fetchEmployees = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetchWithAuth('/api/admin/employees')
      const data = await res.json()
      if (data.success) setEmployees(data.employees)
    } catch { } finally { setLoading(false) }
  }, [fetchWithAuth])

  useEffect(() => { fetchEmployees() }, [fetchEmployees])

  const onSubmit = async (data: CreateEmployeeInput) => {
    try {
      const res = await fetchWithAuth('/api/admin/employees', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      const result = await res.json()
      if (!res.ok) {
        toast.error(result.error || 'Failed to create employee')
        return
      }
      toast.success('Employee created! Welcome email sent.')
      reset()
      setShowForm(false)
      fetchEmployees()
    } catch {
      toast.error('Error creating employee')
    }
  }

  const handleDeactivate = async (id: string, name: string) => {
    if (!confirm(`Deactivate ${name}?`)) return
    try {
      const res = await fetchWithAuth(`/api/admin/employees/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: false }),
      })
      if (res.ok) {
        toast.success('Employee deactivated')
        fetchEmployees()
      }
    } catch { toast.error('Failed') }
  }

  const togglePermission = (perm: string) => {
    const current = watchedPermissions || []
    if (current.includes(perm as any)) {
      setValue('permissions', current.filter(p => p !== perm) as any)
    } else {
      setValue('permissions', [...current, perm] as any)
    }
  }

  if (!isRoot) {
    return (
      <div className="text-center py-16">
        <Shield className="w-12 h-12 text-dark-200 mx-auto mb-3" />
        <p className="text-dark-500 font-medium">Only root admin can manage employees</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-700 text-dark-900">Employee Management</h2>
          <p className="text-dark-500 text-sm">{employees.length} employees</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 bg-brand-gradient text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-sm"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancel' : 'Add Employee'}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-dark-100 shadow-sm p-6 animate-slide-up">
          <h3 className="font-display font-700 text-dark-900 text-lg mb-5">Create Employee Account</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1.5">Full Name *</label>
                <input
                  {...register('name')}
                  placeholder="Employee name"
                  className="w-full px-3.5 py-2.5 bg-dark-50 border border-dark-200 rounded-xl text-sm text-dark-900 placeholder-dark-400 focus:outline-none focus:border-brand-500"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1.5">Email *</label>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="employee@cartrade.com"
                  className="w-full px-3.5 py-2.5 bg-dark-50 border border-dark-200 rounded-xl text-sm text-dark-900 placeholder-dark-400 focus:outline-none focus:border-brand-500"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1.5">Initial Password *</label>
                <div className="relative">
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min. 8 chars, uppercase, number"
                    className="w-full px-3.5 py-2.5 bg-dark-50 border border-dark-200 rounded-xl text-sm text-dark-900 placeholder-dark-400 focus:outline-none focus:border-brand-500 pr-10"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-600">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-1.5">Phone</label>
                <input
                  {...register('phone')}
                  type="tel"
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2.5 bg-dark-50 border border-dark-200 rounded-xl text-sm text-dark-900 placeholder-dark-400 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            {/* Permissions */}
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">Permissions</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ALL_PERMISSIONS.map(perm => (
                  <button
                    key={perm}
                    type="button"
                    onClick={() => togglePermission(perm)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
                      watchedPermissions.includes(perm)
                        ? 'bg-brand-50 border-brand-300 text-brand-700'
                        : 'bg-white border-dark-200 text-dark-500 hover:border-dark-300'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                      watchedPermissions.includes(perm) ? 'bg-brand-500 border-brand-500' : 'border-dark-300'
                    }`}>
                      {watchedPermissions.includes(perm) && <Check className="w-3 h-3 text-white" />}
                    </div>
                    {PERMISSIONS_LABELS[perm]}
                  </button>
                ))}
              </div>
              {errors.permissions && <p className="text-red-500 text-xs mt-1">Select at least one permission</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-brand-gradient text-white px-6 py-3 rounded-xl font-semibold text-sm hover:opacity-90 disabled:opacity-60"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {isSubmitting ? 'Creating...' : 'Create Employee'}
            </button>
          </form>
        </div>
      )}

      {/* Employee list */}
      <div className="bg-white rounded-2xl border border-dark-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-brand-500 mx-auto" />
          </div>
        ) : employees.length === 0 ? (
          <div className="p-12 text-center">
            <User className="w-10 h-10 text-dark-200 mx-auto mb-2" />
            <p className="text-dark-400 text-sm">No employees yet</p>
          </div>
        ) : (
          <div className="divide-y divide-dark-50">
            {employees.map(emp => (
              <div key={emp._id} className="p-5 flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-gradient rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">{emp.name[0]?.toUpperCase()}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-dark-800">{emp.name}</p>
                      {!emp.isActive && <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">Inactive</span>}
                    </div>
                    <p className="text-dark-400 text-sm">{emp.email}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {emp.permissions?.map((perm: string) => (
                        <span key={perm} className="text-xs bg-brand-50 text-brand-600 px-2 py-0.5 rounded-full">
                          {PERMISSIONS_LABELS[perm] || perm}
                        </span>
                      ))}
                    </div>
                    <p className="text-dark-300 text-xs mt-1">Added {formatDate(emp.createdAt)}</p>
                  </div>
                </div>
                {emp._id !== user?.id && emp.isActive && (
                  <button
                    onClick={() => handleDeactivate(emp._id, emp.name)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors flex-shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Deactivate
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
