'use client'
import { useState, useEffect, useCallback } from 'react'
import { MessageSquare, Mail, Phone, Car, Clock, Send, Loader2, ChevronDown } from 'lucide-react'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  read: 'bg-dark-100 text-dark-600',
  replied: 'bg-green-100 text-green-700',
  closed: 'bg-dark-200 text-dark-500',
}

export default function AdminInquiriesPage() {
  const { fetchWithAuth } = useAdminAuth()
  const [inquiries, setInquiries] = useState<any[]>([])
  const [pagination, setPagination] = useState({ total: 0, pages: 1, page: 1 })
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [selectedInquiry, setSelectedInquiry] = useState<any>(null)
  const [replyText, setReplyText] = useState('')
  const [replying, setReplying] = useState(false)

  const fetchInquiries = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' })
      if (status) params.set('status', status)
      const res = await fetchWithAuth(`/api/inquiry?${params}`)
      const data = await res.json()
      if (data.success) {
        setInquiries(data.inquiries)
        setPagination(data.pagination)
      }
    } catch { } finally { setLoading(false) }
  }, [fetchWithAuth, page, status])

  useEffect(() => { fetchInquiries() }, [fetchInquiries])

  const markAsRead = async (id: string) => {
    await fetchWithAuth(`/api/inquiry/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'read' }),
    })
    setInquiries(prev => prev.map(i => i._id === id ? { ...i, status: 'read' } : i))
  }

  const handleSelectInquiry = (inq: any) => {
    setSelectedInquiry(inq)
    setReplyText('')
    if (inq.status === 'new') markAsRead(inq._id)
  }

  const handleReply = async () => {
    if (!replyText.trim() || !selectedInquiry) return
    setReplying(true)
    try {
      const res = await fetchWithAuth(`/api/inquiry/${selectedInquiry._id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'replied', reply: replyText }),
      })
      if (res.ok) {
        toast.success('Reply sent!')
        setSelectedInquiry((prev: any) => ({ ...prev, status: 'replied', reply: replyText }))
        setInquiries(prev => prev.map(i => i._id === selectedInquiry._id ? { ...i, status: 'replied' } : i))
        setReplyText('')
      }
    } catch { toast.error('Failed to send reply') }
    setReplying(false)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-700 text-dark-900">Customer Inquiries</h2>
          <p className="text-dark-500 text-sm">{pagination.total} total inquiries</p>
        </div>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 flex-wrap">
        {[
          { value: '', label: 'All' },
          { value: 'new', label: '🔵 New' },
          { value: 'read', label: 'Read' },
          { value: 'replied', label: '✅ Replied' },
          { value: 'closed', label: 'Closed' },
        ].map(({ value, label }) => (
          <button
            key={value}
            onClick={() => { setStatus(value); setPage(1) }}
            className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
              status === value ? 'bg-brand-gradient text-white' : 'bg-white border border-dark-200 text-dark-600 hover:bg-dark-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-5">
        {/* List */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-dark-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-brand-500 mx-auto" />
            </div>
          ) : inquiries.length === 0 ? (
            <div className="p-8 text-center">
              <MessageSquare className="w-10 h-10 text-dark-200 mx-auto mb-2" />
              <p className="text-dark-400 text-sm">No inquiries found</p>
            </div>
          ) : (
            <div className="divide-y divide-dark-50 max-h-[600px] overflow-y-auto">
              {inquiries.map(inq => (
                <button
                  key={inq._id}
                  onClick={() => handleSelectInquiry(inq)}
                  className={`w-full text-left p-4 hover:bg-dark-50 transition-colors ${selectedInquiry?._id === inq._id ? 'bg-brand-50 border-l-4 border-brand-500' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="font-semibold text-dark-800 text-sm truncate">{inq.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${STATUS_COLORS[inq.status]}`}>
                      {inq.status}
                    </span>
                  </div>
                  <p className="text-dark-500 text-xs truncate mb-1">{inq.carName}</p>
                  <p className="text-dark-400 text-xs truncate">{inq.message}</p>
                  <p className="text-dark-300 text-xs mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {formatDate(inq.createdAt)}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Detail panel */}
        <div className="lg:col-span-3">
          {selectedInquiry ? (
            <div className="bg-white rounded-2xl border border-dark-100 shadow-sm p-6 space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display font-700 text-dark-900 text-lg">{selectedInquiry.name}</h3>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[selectedInquiry.status]}`}>
                    {selectedInquiry.status}
                  </span>
                </div>
                <p className="text-dark-400 text-xs">{formatDate(selectedInquiry.createdAt)}</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 p-3 bg-dark-50 rounded-xl">
                  <Mail className="w-4 h-4 text-brand-500" />
                  <div>
                    <p className="text-xs text-dark-400">Email</p>
                    <a href={`mailto:${selectedInquiry.email}`} className="text-sm font-medium text-brand-600 hover:underline">
                      {selectedInquiry.email}
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-dark-50 rounded-xl">
                  <Phone className="w-4 h-4 text-brand-500" />
                  <div>
                    <p className="text-xs text-dark-400">Phone</p>
                    <a href={`tel:${selectedInquiry.phone}`} className="text-sm font-medium text-dark-700 hover:underline">
                      {selectedInquiry.phone}
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-dark-50 rounded-xl sm:col-span-2">
                  <Car className="w-4 h-4 text-brand-500" />
                  <div>
                    <p className="text-xs text-dark-400">Interested in</p>
                    <p className="text-sm font-medium text-dark-700">{selectedInquiry.carName} <span className="font-mono text-dark-400">({selectedInquiry.carId})</span></p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-dark-700 mb-2">Message</p>
                <div className="bg-dark-50 rounded-xl p-4 text-dark-700 text-sm leading-relaxed">
                  {selectedInquiry.message}
                </div>
              </div>

              {selectedInquiry.reply && (
                <div>
                  <p className="text-sm font-semibold text-green-700 mb-2">Your Reply</p>
                  <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-dark-700 text-sm leading-relaxed">
                    {selectedInquiry.reply}
                  </div>
                </div>
              )}

              {selectedInquiry.status !== 'closed' && (
                <div>
                  <p className="text-sm font-semibold text-dark-700 mb-2">Reply</p>
                  <textarea
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder="Type your reply..."
                    rows={4}
                    className="w-full px-4 py-3 bg-dark-50 border border-dark-200 rounded-xl text-sm text-dark-900 placeholder-dark-400 focus:outline-none focus:border-brand-500 resize-none mb-3"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleReply}
                      disabled={replying || !replyText.trim()}
                      className="flex items-center gap-2 bg-brand-gradient text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
                    >
                      {replying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      Send Reply
                    </button>
                    <a
                      href={`mailto:${selectedInquiry.email}?subject=Re: ${selectedInquiry.carName}&body=${encodeURIComponent(replyText)}`}
                      className="flex items-center gap-2 bg-dark-100 text-dark-700 px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-dark-200 transition-colors"
                    >
                      <Mail className="w-4 h-4" /> Open in Mail
                    </a>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-dark-100 shadow-sm h-64 flex items-center justify-center">
              <div className="text-center text-dark-400">
                <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm">Select an inquiry to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
