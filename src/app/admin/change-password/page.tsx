'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { Eye, EyeOff, Loader2, Lock, AlertTriangle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { changePasswordSchema } from '@/lib/validation'
import toast from 'react-hot-toast'

interface ChangePasswordInput {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export default function ForceChangePasswordPage() {
  const router = useRouter()
  const { fetchWithAuth, user } = useAdminAuth()
  const [showPw, setShowPw] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
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
        toast.error(result.error || 'Failed')
        return
      }
      // Update local storage to remove mustChangePassword
      const stored = localStorage.getItem('adminUser')
      if (stored) {
        const u = JSON.parse(stored)
        u.mustChangePassword = false
        localStorage.setItem('adminUser', JSON.stringify(u))
      }
      toast.success('Password changed! Redirecting...')
      setTimeout(() => router.push('/admin/dashboard'), 1000)
    } catch {
      toast.error('Error')
    }
  }

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-dark-900 border border-dark-700 rounded-3xl p-8 shadow-2xl">
        <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <p className="text-amber-200 text-sm">You must change your password before continuing.</p>
        </div>

        <h2 className="font-display text-2xl font-700 text-white mb-1">Set New Password</h2>
        <p className="text-dark-400 text-sm mb-6">Hi <span className="text-white">{user?.name}</span>, please create a secure password.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-dark-300 text-sm mb-1.5">Temporary Password</label>
            <input
              {...register('currentPassword')}
              type="password"
              placeholder="Your temporary password"
              className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-xl text-white placeholder-dark-500 text-sm focus:outline-none focus:border-brand-500"
            />
            {errors.currentPassword && <p className="text-red-400 text-xs mt-1">{errors.currentPassword.message}</p>}
          </div>
          <div>
            <label className="block text-dark-300 text-sm mb-1.5">New Password</label>
            <div className="relative">
              <input
                {...register('newPassword')}
                type={showPw ? 'text' : 'password'}
                placeholder="Min 8 chars, uppercase + number"
                className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-xl text-white placeholder-dark-500 text-sm focus:outline-none focus:border-brand-500 pr-10"
              />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-200">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.newPassword && <p className="text-red-400 text-xs mt-1">{errors.newPassword.message}</p>}
          </div>
          <div>
            <label className="block text-dark-300 text-sm mb-1.5">Confirm New Password</label>
            <input
              {...register('confirmPassword')}
              type="password"
              placeholder="Repeat new password"
              className="w-full px-4 py-3 bg-dark-800 border border-dark-600 rounded-xl text-white placeholder-dark-500 text-sm focus:outline-none focus:border-brand-500"
            />
            {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-brand-gradient text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-60 mt-2"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-5 h-5" />}
            {isSubmitting ? 'Updating...' : 'Set New Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
