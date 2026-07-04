'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Car, Search } from 'lucide-react'

export default function Navbar() {
  const [open, setOpen]           = useState(false)
  const [scrolled, setScrolled]   = useState(false)
  const pathname                  = usePathname()
  const isHome                    = pathname === '/'

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    handler()
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // On homepage: transparent → white on scroll
  // On other pages: always white
  const isTransparent = isHome && !scrolled

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 w-full ${
      isTransparent
        ? 'bg-transparent'
        : 'bg-white/95 backdrop-blur-md shadow-sm border-b border-dark-100'
    }`}>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className="w-9 h-9 bg-brand-gradient rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Car className="w-5 h-5 text-white" />
            </div>
            <div className="leading-tight">
              <span className={`font-display text-lg font-800 transition-colors ${isTransparent ? 'text-white' : 'text-dark-900'}`}>
                Car Noida <span style={{ color: '#f97316' }}>99</span>
              </span>
            </div>
          </Link>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-7">
            {[
              { href: '/cars',               label: 'Browse Cars' },
              { href: '/cars?status=active', label: 'Available' },
              { href: '/#how-it-works',      label: 'How It Works' },
              { href: '/#contact',           label: 'Contact' },
            ].map(({ href, label }) => (
              <Link key={href} href={href}
                className={`font-medium text-sm transition-colors ${
                  isTransparent
                    ? 'text-white/80 hover:text-white'
                    : 'text-dark-600 hover:text-brand-600'
                }`}>
                {label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <Link href="/cars"
              className={`flex items-center gap-1.5 font-medium text-sm px-3 py-2 rounded-xl transition-colors ${
                isTransparent ? 'text-white/70 hover:text-white hover:bg-white/10' : 'text-dark-600 hover:text-brand-600 hover:bg-dark-50'
              }`}>
              <Search className="w-4 h-4" /> Search
            </Link>
            <Link href="/admin/login"
              className="bg-brand-gradient text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity shadow-md">
              Admin Portal
            </Link>
          </div>

          {/* Mobile menu button */}
          <button onClick={() => setOpen(!open)}
            className={`lg:hidden p-2 rounded-xl transition-colors flex-shrink-0 ${
              isTransparent ? 'text-white hover:bg-white/10' : 'text-dark-700 hover:bg-dark-100'
            }`}
            aria-label="Toggle menu">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden bg-white border-t border-dark-100 w-full shadow-xl">
          <div className="px-4 py-3 space-y-1 max-w-7xl mx-auto">
            {[
              { href: '/cars',               label: 'Browse Cars' },
              { href: '/cars?status=active', label: 'Available Cars' },
              { href: '/#how-it-works',      label: 'How It Works' },
              { href: '/#contact',           label: 'Contact' },
            ].map(({ href, label }) => (
              <Link key={href} href={href} onClick={() => setOpen(false)}
                className="block px-4 py-3 rounded-xl text-dark-700 hover:bg-brand-50 hover:text-brand-600 font-medium transition-colors text-sm">
                {label}
              </Link>
            ))}
            <div className="pt-2 border-t border-dark-100">
              <Link href="/admin/login" onClick={() => setOpen(false)}
                className="block bg-brand-gradient text-white px-4 py-3 rounded-xl font-semibold text-center text-sm">
                Admin Portal
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
