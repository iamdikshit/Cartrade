'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { changePasswordSchema } from '@/lib/validation'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { Eye, EyeOff, Loader2, Shield, User, Bell, Lock } from 'lucide-react'
import toast from 'react-hot-toast'

interface ChangePasswordInput {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export default function AdminSettingsPage() {
  const { user, fetchWithAuth } = useAdminAuth()
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
  })

  const onSubmit = async (data: ChangePasswordInput) => {
    try {
      const res = await fetchWithAuth('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword: data.currentPassword, newPassword: data.newPassword }),
      })
      const result = await res.json()
      if (!res.ok) {
        toast.error(result.error || 'Failed to change password')
        return
      }
      toast.success('Password changed successfully!')
      reset()
    } catch {
      toast.error('Error changing password')
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Profile card */}
      <div className="bg-white rounded-2xl border border-dark-100 shadow-sm p-6">
        <h3 className="font-display font-700 text-dark-900 text-lg mb-5 flex items-center gap-2">
          <User className="w-5 h-5 text-brand-500" /> Profile Information
        </h3>
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 bg-brand-gradient rounded-2xl flex items-center justify-center shadow-md">
            <span className="text-white font-display font-800 text-2xl">{user?.name?.[0]?.toUpperCase()}</span>
          </div>
          <div>
            <p className="font-display font-700 text-dark-900 text-xl">{user?.name}</p>
            <p className="text-dark-500">{user?.email}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <Shield className="w-3.5 h-3.5 text-brand-500" />
              <span className="text-xs font-semibold text-brand-600 capitalize bg-brand-50 px-2 py-0.5 rounded-full">
                {user?.role}
              </span>
            </div>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-dark-700 mb-2">Permissions</p>
          <div className="flex flex-wrap gap-2">
            {user?.role === 'root' ? (
              <span className="text-xs bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-medium">
                ⚡ Full Access (Root)
              </span>
            ) : (
              user?.permissions?.map(perm => (
                <span key={perm} className="text-xs bg-brand-50 text-brand-600 px-2.5 py-1 rounded-full capitalize">
                  {perm.replace(':', ': ')}
                </span>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-2xl border border-dark-100 shadow-sm p-6">
        <h3 className="font-display font-700 text-dark-900 text-lg mb-5 flex items-center gap-2">
          <Lock className="w-5 h-5 text-brand-500" /> Change Password
        </h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-700 mb-1.5">Current Password</label>
            <div className="relative">
              <input
                {...register('currentPassword')}
                type={showCurrent ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Your current password"
                className="w-full px-3.5 py-2.5 bg-dark-50 border border-dark-200 rounded-xl text-sm text-dark-900 placeholder-dark-400 focus:outline-none focus:border-brand-500 pr-10"
              />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-600">
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.currentPassword && <p className="text-red-500 text-xs mt-1">{errors.currentPassword.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-700 mb-1.5">New Password</label>
            <div className="relative">
              <input
                {...register('newPassword')}
                type={showNew ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Min. 8 chars, uppercase, number"
                className="w-full px-3.5 py-2.5 bg-dark-50 border border-dark-200 rounded-xl text-sm text-dark-900 placeholder-dark-400 focus:outline-none focus:border-brand-500 pr-10"
              />
              <button type="button" onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-600">
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.newPassword && <p className="text-red-500 text-xs mt-1">{errors.newPassword.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-700 mb-1.5">Confirm New Password</label>
            <input
              {...register('confirmPassword')}
              type="password"
              autoComplete="new-password"
              placeholder="Repeat new password"
              className="w-full px-3.5 py-2.5 bg-dark-50 border border-dark-200 rounded-xl text-sm text-dark-900 placeholder-dark-400 focus:outline-none focus:border-brand-500"
            />
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-brand-gradient text-white px-6 py-3 rounded-xl font-semibold text-sm hover:opacity-90 disabled:opacity-60 transition-opacity"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            {isSubmitting ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* Security info */}
      <div className="bg-dark-50 rounded-2xl border border-dark-100 p-5">
        <h4 className="font-semibold text-dark-800 mb-3 flex items-center gap-2">
          <Bell className="w-4 h-4 text-amber-500" /> Security Notes
        </h4>
        <ul className="space-y-1.5 text-sm text-dark-500">
          <li>• Access tokens expire every 15 minutes and are automatically refreshed</li>
          <li>• Accounts lock after 5 failed login attempts for 2 hours</li>
          <li>• All admin actions are logged for security audit</li>
          <li>• Use a strong, unique password for your admin account</li>
        </ul>
      </div>
    </div>
  )
}
