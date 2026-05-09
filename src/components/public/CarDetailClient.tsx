'use client'
import { useState } from 'react'
import Image from 'next/image'
import { 
  Star, MapPin, Fuel, Settings, Gauge, Share2, Phone, Mail, 
  ChevronLeft, ChevronRight, FileText, Zap, Wind, Cog,
  CheckCircle, XCircle, AlertCircle, Calendar, Car, Navigation
} from 'lucide-react'
import { formatPrice, formatDate, formatMonthYear, getStatusConfig, getConditionConfig, isExpired, generateShareText } from '@/lib/utils'
import InquiryForm from './InquiryForm'
import toast from 'react-hot-toast'

interface CarDetailProps {
  car: any
}

const RATING_LABELS = {
  exterior: { label: 'Exterior', icon: '🚗' },
  engine: { label: 'Engine', icon: '⚙️' },
  ac: { label: 'A/C', icon: '❄️' },
  electrical: { label: 'Electrical', icon: '⚡' },
  steering: { label: 'Steering', icon: '🎯' },
}

const SECTION_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'documents', label: 'Documents' },
  { id: 'exterior', label: 'Exterior' },
  { id: 'engine', label: 'Engine' },
  { id: 'ac', label: 'AC & Electrical' },
  { id: 'tyres', label: 'Tyres' },
  { id: 'lights', label: 'Lights' },
]

function ConditionBadge({ status, label }: { status?: string; label: string }) {
  if (!status) return (
    <div className="flex items-center justify-between py-2.5 border-b border-dark-100 last:border-0">
      <span className="text-dark-600 text-sm">{label}</span>
      <span className="text-dark-300 text-xs">Not inspected</span>
    </div>
  )

  const config = getConditionConfig(status as any)
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-dark-100 last:border-0">
      <span className="text-dark-700 text-sm font-medium">{label}</span>
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.className}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
        {config.label}
      </span>
    </div>
  )
}

function DocItem({ label, value, type = 'bool' }: { label: string; value: any; type?: 'bool' | 'insurance' | 'text' }) {
  let content
  if (type === 'bool') {
    content = value 
      ? <span className="flex items-center gap-1 text-green-600 text-xs font-semibold"><CheckCircle className="w-3.5 h-3.5" /> Yes</span>
      : <span className="flex items-center gap-1 text-red-500 text-xs font-semibold"><XCircle className="w-3.5 h-3.5" /> No</span>
  } else if (type === 'insurance') {
    const map: any = {
      yes: <span className="text-green-600 text-xs font-semibold">✓ Valid</span>,
      no: <span className="text-red-500 text-xs font-semibold">✗ None</span>,
      expired: <span className="text-amber-600 text-xs font-semibold">⚠ Expired</span>,
    }
    content = map[value] || <span className="text-dark-400 text-xs">N/A</span>
  } else {
    content = <span className="text-dark-700 text-xs font-medium">{value || 'N/A'}</span>
  }

  return (
    <div className="flex items-center justify-between py-2.5 border-b border-dark-100 last:border-0">
      <span className="text-dark-500 text-sm">{label}</span>
      {content}
    </div>
  )
}

export default function CarDetailClient({ car }: CarDetailProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [imageIndex, setImageIndex] = useState(0)
  const [showInquiry, setShowInquiry] = useState(false)

  const images = car.images || []
  const currentImage = images[imageIndex]
  const status = getStatusConfig(car.status)

  const avgRating = car.ratings
    ? Object.values(car.ratings as Record<string, number>).reduce((a, b) => a + b, 0) / 5
    : 0

  const handleShare = async () => {
    const url = `${window.location.origin}/cars/${car.slug}`
    const text = generateShareText(car)
    if (navigator.share) {
      await navigator.share({ title: `${car.name} - CarTrade`, text, url })
    } else {
      await navigator.clipboard.writeText(`${text}\n${url}`)
      toast.success('Link copied to clipboard!')
    }
  }

  const fitnessExpiry = car.documents?.registrationAndFitness?.fitnessExpiry
  const fitnessExpired = isExpired(fitnessExpiry)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid lg:grid-cols-5 gap-8">
        {/* Main content - 3 cols */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Image gallery */}
          <div className="bg-white rounded-2xl overflow-hidden border border-dark-100 shadow-sm">
            <div className="relative aspect-video bg-dark-100">
              {currentImage ? (
                currentImage.type === 'video' ? (
                  <video src={currentImage.url} controls className="w-full h-full object-contain" />
                ) : (
                  <Image
                    src={currentImage.url}
                    alt={`${car.name} - ${currentImage.category}`}
                    fill
                    className="object-contain"
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    priority
                  />
                )
              ) : (
                <div className="w-full h-full flex items-center justify-center text-dark-300">
                  <Car className="w-16 h-16" />
                </div>
              )}

              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setImageIndex(i => Math.max(0, i - 1))}
                    disabled={imageIndex === 0}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 disabled:opacity-30 transition-all"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setImageIndex(i => Math.min(images.length - 1, i + 1))}
                    disabled={imageIndex === images.length - 1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 disabled:opacity-30 transition-all"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-lg">
                    <span className="text-white text-xs font-medium">{imageIndex + 1}/{images.length}</span>
                  </div>
                </>
              )}

              <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold uppercase ${status.className}`}>
                {status.label}
              </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="p-3 flex gap-2 overflow-x-auto scrollbar-hide">
                {images.map((img: any, i: number) => (
                  <button
                    key={i}
                    onClick={() => setImageIndex(i)}
                    className={`relative flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                      i === imageIndex ? 'border-brand-500 scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    {img.type === 'video' ? (
                      <div className="w-full h-full bg-dark-200 flex items-center justify-center text-dark-500 text-xs">▶</div>
                    ) : (
                      <Image src={img.url} alt="" fill className="object-cover" sizes="64px" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Section tabs */}
          <div className="bg-white rounded-2xl border border-dark-100 shadow-sm overflow-hidden">
            <div className="flex overflow-x-auto scrollbar-hide border-b border-dark-100">
              {SECTION_TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-shrink-0 px-4 py-3 text-sm font-semibold transition-colors border-b-2 ${
                    activeTab === tab.id
                      ? 'border-brand-500 text-brand-600 bg-brand-50'
                      : 'border-transparent text-dark-500 hover:text-dark-700 hover:bg-dark-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-5">
              {/* Overview tab */}
              {activeTab === 'overview' && (
                <div className="space-y-5 animate-fade-in">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { icon: <Fuel className="w-4 h-4" />, label: 'Fuel', value: car.fuelType },
                      { icon: <Settings className="w-4 h-4" />, label: 'Gearbox', value: car.transmission },
                      { icon: <Gauge className="w-4 h-4" />, label: 'Odometer', value: car.odometer ? `${(car.odometer/1000).toFixed(0)}k km` : 'N/A' },
                      { icon: <Calendar className="w-4 h-4" />, label: 'Year', value: car.year },
                    ].map(({ icon, label, value }) => (
                      <div key={label} className="bg-dark-50 rounded-xl p-3 text-center">
                        <div className="flex items-center justify-center gap-1 text-dark-500 mb-1">
                          {icon}
                          <span className="text-xs text-dark-400">{label}</span>
                        </div>
                        <span className="font-semibold text-dark-800 text-sm capitalize">{value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Ratings */}
                  <div>
                    <h3 className="font-display font-700 text-dark-900 mb-3">Inspection Ratings</h3>
                    <div className="space-y-2.5">
                      {Object.entries(RATING_LABELS).map(([key, { label, icon }]) => {
                        const rating = car.ratings?.[key] || 0
                        return (
                          <div key={key} className="flex items-center gap-3">
                            <span className="text-base w-7">{icon}</span>
                            <span className="text-sm text-dark-600 w-20 flex-shrink-0">{label}</span>
                            <div className="flex-1 h-2 bg-dark-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-brand-gradient rounded-full transition-all duration-500"
                                style={{ width: `${(rating / 5) * 100}%` }}
                              />
                            </div>
                            <div className="flex items-center gap-0.5 flex-shrink-0">
                              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                              <span className="text-sm font-semibold text-dark-700">{rating.toFixed(1)}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {car.description && (
                    <div>
                      <h3 className="font-display font-700 text-dark-900 mb-2">Description</h3>
                      <p className="text-dark-600 text-sm leading-relaxed">{car.description}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Documents tab */}
              {activeTab === 'documents' && (
                <div className="space-y-5 animate-fade-in">
                  <div>
                    <h3 className="font-display font-600 text-dark-900 mb-3 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-brand-500" /> Documentation Status
                    </h3>
                    <div className="bg-dark-50 rounded-xl p-4">
                      <DocItem label="RC Available" value={car.documents?.rcAvailability} />
                      <DocItem label="Insurance" value={car.documents?.insurance} type="insurance" />
                      <DocItem label="Road Tax Paid" value={car.documents?.roadTaxPaid} />
                      <DocItem label="Hypothecation" value={car.documents?.hypothecation} />
                    </div>
                  </div>

                  <div>
                    <h3 className="font-display font-600 text-dark-900 mb-3">Other Information</h3>
                    <div className="bg-dark-50 rounded-xl p-4">
                      <DocItem label="Duplicate Key" value={car.documents?.other?.duplicateKey} />
                      <DocItem label="Chassis Number" value={car.documents?.other?.chassisNumber} />
                      <DocItem label="Party-Peshi" value={car.documents?.other?.partyPeshi} />
                      <DocItem label="Pollution Norm" value={car.documents?.other?.pollutionNorm} type="text" />
                    </div>
                  </div>

                  <div>
                    <h3 className="font-display font-600 text-dark-900 mb-3">Registration & Fitness</h3>
                    <div className="bg-dark-50 rounded-xl p-4">
                      <DocItem 
                        label="Manufacturing Date" 
                        value={formatMonthYear(car.documents?.registrationAndFitness?.manufacturingDate)} 
                        type="text" 
                      />
                      <DocItem 
                        label="Registration Date" 
                        value={formatMonthYear(car.documents?.registrationAndFitness?.registrationDate)} 
                        type="text" 
                      />
                      <DocItem label="RTO Code" value={car.documents?.registrationAndFitness?.rtoCode} type="text" />
                      <DocItem label="RTO Name" value={car.documents?.registrationAndFitness?.rtoName} type="text" />
                      
                      {fitnessExpiry && (
                        <div className="flex items-center justify-between py-2.5 border-b border-dark-100 last:border-0">
                          <span className="text-dark-500 text-sm">Fitness Expiry</span>
                          <span className={`text-xs font-semibold flex items-center gap-1 ${fitnessExpired ? 'text-red-600' : 'text-green-600'}`}>
                            {fitnessExpired ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                            {formatDate(fitnessExpiry)} {fitnessExpired ? '(Expired)' : '(Valid)'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Exterior tab */}
              {activeTab === 'exterior' && (
                <div className="space-y-4 animate-fade-in">
                  <div>
                    <h3 className="font-display font-600 text-dark-900 mb-3">Exterior Details</h3>
                    <div className="bg-dark-50 rounded-xl p-4">
                      {[
                        ['apron', 'Apron'], ['pillar', 'Pillar'], ['cowlTop', 'Cowl Top'],
                        ['dicky', 'Dicky'], ['leftQuarterPanel', 'Left Quarter Panel'],
                        ['rightQuarterPanel', 'Right Quarter Panel'], ['firewall', 'Firewall'],
                        ['lowerMember', 'Lower Member'], ['leftRunningBoard', 'Left Running Board'],
                        ['headlightSupports', 'Headlight Supports'], ['upperMember', 'Upper Member (Bonnet Patti)'],
                        ['rightRunningBoard', 'Right Running Board'],
                      ].map(([key, label]) => (
                        <ConditionBadge key={key} status={car.exteriorDetails?.[key]?.status} label={label} />
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-display font-600 text-dark-900 mb-3">Exterior Panels</h3>
                    <div className="bg-dark-50 rounded-xl p-4">
                      {[
                        ['roof', 'Roof'], ['bonnet', 'Bonnet'], ['dickeyDoor', 'Dicky Door'],
                        ['rearBumper', 'Rear Bumper'], ['frontBumper', 'Front Bumper'],
                        ['leftFender', 'Left Fender'], ['rightFender', 'Right Fender'],
                        ['rearLeftDoor', 'Rear Left Door'], ['frontLeftDoor', 'Front Left Door'],
                        ['rearRightDoor', 'Rear Right Door'], ['frontRightDoor', 'Front Right Door'],
                      ].map(([key, label]) => (
                        <ConditionBadge key={key} status={car.exteriorPanels?.[key]?.status} label={label} />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Engine tab */}
              {activeTab === 'engine' && (
                <div className="animate-fade-in">
                  <h3 className="font-display font-600 text-dark-900 mb-3 flex items-center gap-2">
                    <Cog className="w-5 h-5 text-brand-500" /> Engine Details
                  </h3>
                  <div className="bg-dark-50 rounded-xl p-4">
                    {[
                      ['exhaustSmoke', 'Exhaust Smoke'],
                      ['engineMounting', 'Engine Mounting'],
                      ['clutch', 'Clutch'],
                      ['engine', 'Engine'],
                      ['engineSound', 'Engine Sound'],
                      ['battery', 'Battery'],
                      ['coolingSystem', 'Cooling System'],
                      ['engineOil', 'Engine Oil'],
                      ['gearShifting', 'Gear Shifting / Transmission'],
                    ].map(([key, label]) => (
                      <ConditionBadge key={key} status={car.engineDetails?.[key]?.status} label={label} />
                    ))}
                  </div>
                </div>
              )}

              {/* AC & Electrical tab */}
              {activeTab === 'ac' && (
                <div className="space-y-4 animate-fade-in">
                  <div>
                    <h3 className="font-display font-600 text-dark-900 mb-3 flex items-center gap-2">
                      <Wind className="w-5 h-5 text-brand-500" /> Air Conditioning
                    </h3>
                    <div className="bg-dark-50 rounded-xl p-4">
                      {[
                        ['cooling', 'Cooling'], ['compressor', 'Compressor'],
                        ['condenser', 'Condenser'], ['blower', 'Blower'], ['controls', 'Controls'],
                      ].map(([key, label]) => (
                        <ConditionBadge key={key} status={car.acDetails?.[key]?.status} label={label} />
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-display font-600 text-dark-900 mb-3 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-brand-500" /> Electrical
                    </h3>
                    <div className="bg-dark-50 rounded-xl p-4">
                      {[
                        ['musicSystem', 'Music System'], ['powerWindows', 'Power Windows'],
                        ['centralLocking', 'Central Locking'], ['horn', 'Horn'],
                        ['wipers', 'Wipers'], ['rearDefogger', 'Rear Defogger'],
                        ['powerSteering', 'Power Steering'], ['instruments', 'Instruments'],
                      ].map(([key, label]) => (
                        <ConditionBadge key={key} status={car.electricalDetails?.[key]?.status} label={label} />
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-display font-600 text-dark-900 mb-3">Steering</h3>
                    <div className="bg-dark-50 rounded-xl p-4">
                      {[
                        ['steering', 'Steering'], ['alignment', 'Alignment'],
                      ].map(([key, label]) => (
                        <ConditionBadge key={key} status={car.steeringDetails?.[key]?.status} label={label} />
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-display font-600 text-dark-900 mb-3">Brakes & Suspension</h3>
                    <div className="bg-dark-50 rounded-xl p-4">
                      {[
                        ['frontBrakes', 'Front Brakes'], ['rearBrakes', 'Rear Brakes'],
                        ['handbrake', 'Handbrake'], ['frontSuspension', 'Front Suspension'],
                        ['rearSuspension', 'Rear Suspension'],
                      ].map(([key, label]) => (
                        <ConditionBadge key={key} status={car.brakesSuspension?.[key]?.status} label={label} />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tyres tab */}
              {activeTab === 'tyres' && (
                <div className="animate-fade-in">
                  <h3 className="font-display font-600 text-dark-900 mb-3">Tyre Condition</h3>
                  <div className="bg-dark-50 rounded-xl p-4">
                    {[
                      ['frontLeft', 'Front Left Tyre'], ['frontRight', 'Front Right Tyre'],
                      ['rearLeft', 'Rear Left Tyre'], ['rearRight', 'Rear Right Tyre'],
                      ['spare', 'Spare Tyre'],
                    ].map(([key, label]) => (
                      <ConditionBadge key={key} status={car.tyres?.[key]?.status} label={label} />
                    ))}
                  </div>
                </div>
              )}

              {/* Lights tab */}
              {activeTab === 'lights' && (
                <div className="animate-fade-in">
                  <h3 className="font-display font-600 text-dark-900 mb-3">Windshield & Lights</h3>
                  <div className="bg-dark-50 rounded-xl p-4">
                    {[
                      ['headlights', 'Headlights'], ['tailLights', 'Tail Lights'],
                      ['windshield', 'Windshield'], ['leftSvm', 'Left SVM (Side View Mirror)'],
                      ['rightSvm', 'Right SVM (Side View Mirror)'], ['leftHeadlight', 'Left Headlight'],
                      ['rightHeadlight', 'Right Headlight'], ['leftTailLight', 'Left Tail Light'],
                      ['rightTailLight', 'Right Tail Light'],
                    ].map(([key, label]) => (
                      <ConditionBadge key={key} status={car.windshieldLights?.[key]?.status} label={label} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Google Map */}
          {car.location?.lat && car.location?.lng && (
            <div className="bg-white rounded-2xl overflow-hidden border border-dark-100 shadow-sm">
              <div className="p-4 border-b border-dark-100 flex items-center gap-2">
                <Navigation className="w-5 h-5 text-brand-500" />
                <h3 className="font-display font-700 text-dark-900">Location</h3>
                {car.location.city && <span className="text-dark-400 text-sm">— {car.location.address || car.location.city}</span>}
              </div>
              <div className="h-64">
                <iframe
                  src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${car.location.lat},${car.location.lng}&zoom=15`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Car location"
                />
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - 2 cols */}
        <div className="lg:col-span-2 space-y-5">
          {/* Car info card */}
          <div className="bg-white rounded-2xl border border-dark-100 shadow-sm p-5 sticky top-20">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs font-mono font-medium text-dark-400 bg-dark-100 px-2 py-0.5 rounded-lg inline-block mb-1">{car.carId}</p>
                <h1 className="font-display text-2xl font-800 text-dark-900 leading-tight">
                  {car.year} {car.name}
                </h1>
              </div>
              <button
                onClick={handleShare}
                className="w-9 h-9 bg-dark-100 rounded-xl flex items-center justify-center text-dark-500 hover:text-brand-600 hover:bg-brand-50 transition-colors flex-shrink-0"
                title="Share car"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            {car.color && (
              <p className="text-dark-500 text-sm mb-3 capitalize">Color: <span className="font-medium text-dark-700">{car.color}</span></p>
            )}

            {car.location?.city && (
              <div className="flex items-center gap-1.5 text-dark-500 text-sm mb-4">
                <MapPin className="w-4 h-4 text-brand-500" />
                <span>{car.location.address || car.location.city}</span>
              </div>
            )}

            {/* Avg rating */}
            {avgRating > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className={`w-4 h-4 ${i <= Math.round(avgRating) ? 'text-amber-500 fill-amber-500' : 'text-dark-200'}`} />
                  ))}
                </div>
                <span className="font-semibold text-dark-700">{avgRating.toFixed(1)}</span>
                <span className="text-dark-400 text-sm">avg. rating</span>
              </div>
            )}

            {/* Price */}
            <div className="bg-brand-50 rounded-xl p-4 mb-5">
              {car.askingPrice ? (
                <>
                  <p className="text-dark-500 text-xs mb-1">Asking Price</p>
                  <p className="font-display text-3xl font-800 text-brand-600">{formatPrice(car.askingPrice)}</p>
                  {car.price && car.price !== car.askingPrice && (
                    <p className="text-dark-400 text-xs line-through mt-1">{formatPrice(car.price)}</p>
                  )}
                </>
              ) : (
                <p className="text-dark-500 font-medium">Price on request</p>
              )}
            </div>

            {/* CTA */}
            {car.status !== 'sold' ? (
              <div className="space-y-3">
                <button
                  onClick={() => setShowInquiry(!showInquiry)}
                  className="w-full bg-brand-gradient text-white py-3.5 rounded-xl font-semibold text-center hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  {showInquiry ? 'Hide Form' : 'Send Inquiry'}
                </button>
                <a
                  href="tel:+919876543210"
                  className="w-full bg-dark-900 text-white py-3.5 rounded-xl font-semibold text-center hover:bg-dark-800 transition-colors flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  Call Now
                </a>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                <p className="text-red-600 font-semibold">This car has been sold</p>
                <a href="/cars" className="text-sm text-brand-600 hover:underline mt-1 block">Browse available cars →</a>
              </div>
            )}
          </div>

          {/* Inquiry form */}
          {showInquiry && car.status !== 'sold' && (
            <div className="animate-slide-up">
              <InquiryForm carId={car._id} carName={car.name} onSuccess={() => setShowInquiry(false)} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
