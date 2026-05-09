import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
      <div className="text-center">
        <p className="font-display text-8xl font-800 text-brand-500 mb-4">404</p>
        <h1 className="font-display text-3xl font-700 text-white mb-3">Page Not Found</h1>
        <p className="text-dark-400 mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <div className="flex gap-4 justify-center">
          <Link href="/" className="bg-brand-gradient text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity">
            Go Home
          </Link>
          <Link href="/cars" className="bg-dark-800 text-white px-6 py-3 rounded-xl font-semibold hover:bg-dark-700 transition-colors">
            Browse Cars
          </Link>
        </div>
      </div>
    </div>
  )
}
