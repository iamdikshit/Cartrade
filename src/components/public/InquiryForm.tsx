'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { inquirySchema, InquiryInput } from '@/lib/validation'
import { Send, Loader2, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface InquiryFormProps {
  carId: string
  carName: string
  onSuccess?: () => void
}

export default function InquiryForm({ carId, carName, onSuccess }: InquiryFormProps) {
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<InquiryInput>({
    resolver: zodResolver(inquirySchema),
    defaultValues: { carId },
  })

  const onSubmit = async (data: InquiryInput) => {
    try {
      const res = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await res.json()

      if (!res.ok) {
        toast.error(result.error || 'Failed to send inquiry')
        return
      }

      setSubmitted(true)
      toast.success('Inquiry sent! We will contact you shortly.')
      reset()
      onSuccess?.()
    } catch {
      toast.error('Network error. Please try again.')
    }
  }

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
        <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
        <h3 className="font-display font-700 text-green-800 text-lg mb-1">Inquiry Sent!</h3>
        <p className="text-green-600 text-sm">Our team will get back to you within 24 hours.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-dark-100 shadow-sm p-5">
      <h3 className="font-display font-700 text-dark-900 text-lg mb-1">Send Inquiry</h3>
      <p className="text-dark-400 text-xs mb-4">About: <span className="font-medium text-dark-600">{carName}</span></p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <input type="hidden" {...register('carId')} value={carId} />

        <div>
          <input
            {...register('name')}
            placeholder="Your full name *"
            className="w-full px-4 py-3 bg-dark-50 border border-dark-200 rounded-xl text-dark-900 placeholder-dark-400 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <input
            {...register('email')}
            type="email"
            placeholder="Email address *"
            className="w-full px-4 py-3 bg-dark-50 border border-dark-200 rounded-xl text-dark-900 placeholder-dark-400 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <input
            {...register('phone')}
            type="tel"
            placeholder="Phone number *"
            className="w-full px-4 py-3 bg-dark-50 border border-dark-200 rounded-xl text-dark-900 placeholder-dark-400 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
          />
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
        </div>

        <div>
          <textarea
            {...register('message')}
            placeholder="Your message (questions, preferred visit time, etc.) *"
            rows={4}
            className="w-full px-4 py-3 bg-dark-50 border border-dark-200 rounded-xl text-dark-900 placeholder-dark-400 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors resize-none"
          />
          {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-brand-gradient text-white py-3 rounded-xl font-semibold text-sm hover:opacity-90 disabled:opacity-60 transition-opacity flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
          ) : (
            <><Send className="w-4 h-4" /> Send Inquiry</>
          )}
        </button>

        <p className="text-dark-400 text-xs text-center">
          By submitting, you agree to be contacted about this vehicle.
        </p>
      </form>
    </div>
  )
}
