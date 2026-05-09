import { Metadata } from 'next'
import { Suspense } from 'react'
import Navbar from '@/components/public/Navbar'
import CarsListingClient from '@/components/public/CarsListingClient'

export const metadata: Metadata = {
  title: 'Browse Cars',
  description: 'Browse our inventory of inspected used cars with detailed condition reports.',
}

export default function CarsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  return (
    <div className="min-h-screen bg-dark-50">
      <Navbar />
      <div className="pt-20">
        <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>}>
          <CarsListingClient searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  )
}
