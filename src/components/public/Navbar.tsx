"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Car, Phone, Search } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/95 backdrop-blur-md shadow-md" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-brand-gradient rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Car className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-xl font-800 text-dark-500">
              Car noida <span className="text-gradient">99</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-8">
            <Link
              href="/cars"
              className="text-dark-600 hover:text-brand-600 font-medium transition-colors"
            >
              Browse Cars
            </Link>
            <Link
              href="/cars?status=active"
              className="text-dark-600 hover:text-brand-600 font-medium transition-colors"
            >
              Available
            </Link>
            <Link
              href="/#how-it-works"
              className="text-dark-600 hover:text-brand-600 font-medium transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="/#contact"
              className="text-dark-600 hover:text-brand-600 font-medium transition-colors"
            >
              Contact
            </Link>
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/cars"
              className="flex items-center gap-2 text-dark-600 hover:text-brand-600 font-medium transition-colors px-3 py-2"
            >
              <Search className="w-4 h-4" />
              Search
            </Link>
            <Link
              href="/admin/login"
              className="bg-brand-gradient text-white px-5 py-2 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity shadow-md"
            >
              Admin Portal
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden p-2 rounded-xl text-dark-700 hover:bg-dark-100 transition-colors"
            aria-label="Toggle menu"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden bg-white border-t border-dark-100 animate-slide-up">
          <div className="px-4 py-4 space-y-1">
            {[
              { href: "/cars", label: "Browse Cars" },
              { href: "/cars?status=active", label: "Available Cars" },
              { href: "/#how-it-works", label: "How It Works" },
              { href: "/#contact", label: "Contact" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="block px-4 py-3 rounded-xl text-dark-700 hover:bg-brand-50 hover:text-brand-600 font-medium transition-colors"
              >
                {label}
              </Link>
            ))}
            <div className="pt-2 border-t border-dark-100">
              <Link
                href="/admin/login"
                onClick={() => setOpen(false)}
                className="block bg-brand-gradient text-white px-4 py-3 rounded-xl font-semibold text-center"
              >
                Admin Portal
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
