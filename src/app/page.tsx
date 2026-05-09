import { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Shield,
  Search,
  FileCheck,
  Star,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
} from "lucide-react";
import Navbar from "@/components/public/Navbar";
import connectDB from "@/lib/db";
import { Car } from "@/models/Car";
import CarCard from "@/components/public/CarCard";

export const metadata: Metadata = {
  title: "CarTrade — Buy & Sell Cars with Confidence",
  description:
    "Find inspected, verified used cars with detailed auction reports. Transparent pricing, full condition history.",
};

async function getFeaturedCars() {
  try {
    await connectDB();
    const cars = await Car.find({ status: "active" })
      .select(
        "carId name make model year color fuelType transmission odometer askingPrice status images ratings location slug views",
      )
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();
    return JSON.parse(JSON.stringify(cars));
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const featuredCars = await getFeaturedCars();

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-dark-950">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        {/* Gradient orbs */}
        <div className="absolute top-20 right-20 w-96 h-96 bg-brand-600 rounded-full filter blur-3xl opacity-20 animate-pulse-slow" />
        <div
          className="absolute bottom-20 left-20 w-80 h-80 bg-brand-400 rounded-full filter blur-3xl opacity-10 animate-pulse-slow"
          style={{ animationDelay: "1s" }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-brand-600/20 border border-brand-600/30 rounded-full px-4 py-2 mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
            <span className="text-brand-300 text-sm font-medium">
              India's most transparent car marketplace
            </span>
          </div>

          <h1
            className="font-display text-5xl sm:text-6xl lg:text-7xl font-800 text-white mb-6 animate-slide-up"
            style={{ lineHeight: "1.1" }}
          >
            Buy Cars With
            <br />
            <span className="text-gradient">Full Confidence</span>
          </h1>

          <p
            className="text-dark-300 text-lg sm:text-xl max-w-2xl mx-auto mb-10 animate-slide-up"
            style={{ animationDelay: "0.1s" }}
          >
            Every car comes with a detailed inspection report covering 80+
            checkpoints. No surprises. No hidden defects.
          </p>

          <div
            className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up"
            style={{ animationDelay: "0.2s" }}
          >
            <Link
              href="/cars"
              className="inline-flex items-center gap-2 bg-brand-gradient text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:opacity-90 transition-opacity shadow-xl"
            >
              Browse All Cars
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/#how-it-works"
              className="inline-flex items-center gap-2 bg-white/10 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-white/20 transition-colors border border-white/20"
            >
              How It Works
            </Link>
          </div>

          {/* Stats */}
          <div
            className="grid grid-cols-3 gap-8 max-w-lg mx-auto mt-16 animate-slide-up"
            style={{ animationDelay: "0.3s" }}
          >
            {[
              { value: "80+", label: "Checkpoints" },
              { value: "100%", label: "Transparent" },
              { value: "24h", label: "Support" },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="font-display text-3xl font-800 text-white">
                  {value}
                </p>
                <p className="text-dark-400 text-sm mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Cars */}
      {featuredCars.length > 0 && (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="font-display text-4xl font-700 text-dark-900 mb-2">
                  Available Now
                </h2>
                <p className="text-dark-500">
                  Freshly inspected vehicles ready for you
                </p>
              </div>
              <Link
                href="/cars"
                className="hidden sm:flex items-center gap-2 text-brand-600 font-semibold hover:gap-3 transition-all"
              >
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCars.map((car: any) => (
                <CarCard key={car._id} car={car} />
              ))}
            </div>

            <div className="text-center mt-10 sm:hidden">
              <Link
                href="/cars"
                className="inline-flex items-center gap-2 bg-brand-gradient text-white px-6 py-3 rounded-xl font-semibold"
              >
                View All Cars <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      <section className="py-20 bg-dark-50" id="how-it-works">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="font-display text-4xl font-700 text-dark-900 mb-4">
              Why Choose CarTrade?
            </h2>
            <p className="text-dark-500 text-lg max-w-2xl mx-auto">
              We inspect every vehicle thoroughly and provide complete
              transparency about its condition.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Shield className="w-7 h-7" />,
                title: "Full Inspection Report",
                desc: "80+ checkpoints covering engine, body, electricals, AC, and more. Every defect documented.",
              },
              {
                icon: <Search className="w-7 h-7" />,
                title: "Transparent History",
                desc: "Complete documentation status — RC, insurance, fitness, road tax — all verified.",
              },
              {
                icon: <FileCheck className="w-7 h-7" />,
                title: "Honest Rating System",
                desc: "Each car rated on exterior, engine, AC, electrical, and steering independently.",
              },
              {
                icon: <Star className="w-7 h-7" />,
                title: "Photo & Video Evidence",
                desc: "Every reported defect backed by photos and videos. See exactly what you're buying.",
              },
              {
                icon: <CheckCircle className="w-7 h-7" />,
                title: "No Hidden Surprises",
                desc: "Color-coded condition indicators: Green for OK, Yellow for repaired, Red for issues.",
              },
              {
                icon: <Phone className="w-7 h-7" />,
                title: "Direct Inquiry",
                desc: "Connect directly with our team. No middlemen, no commission games.",
              },
            ].map(({ icon, title, desc }) => (
              <div
                key={title}
                className="bg-white rounded-2xl p-7 border border-dark-100 hover:border-brand-200 hover:shadow-lg transition-all group"
              >
                <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center text-brand-600 mb-5 group-hover:bg-brand-gradient group-hover:text-white transition-all">
                  {icon}
                </div>
                <h3 className="font-display font-700 text-dark-900 text-lg mb-2">
                  {title}
                </h3>
                <p className="text-dark-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-dark-950" id="contact">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-4xl font-700 text-white mb-4">
            Get In Touch
          </h2>
          <p className="text-dark-300 mb-10">
            Have a question? Our team is here to help.
          </p>

          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                icon: <Phone className="w-5 h-5" />,
                label: "Call Us",
                value: "+91 98765 43210",
              },
              {
                icon: <Mail className="w-5 h-5" />,
                label: "Email",
                value: "info@cartrade.com",
              },
              {
                icon: <MapPin className="w-5 h-5" />,
                label: "Location",
                value: "New Delhi, India",
              },
            ].map(({ icon, label, value }) => (
              <div
                key={label}
                className="bg-dark-800 rounded-2xl p-6 border border-dark-700"
              >
                <div className="w-10 h-10 bg-brand-gradient rounded-xl flex items-center justify-center text-white mx-auto mb-3">
                  {icon}
                </div>
                <p className="text-dark-400 text-sm mb-1">{label}</p>
                <p className="text-white font-semibold">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark-950 border-t border-dark-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-dark-500 text-sm">
              © {new Date().getFullYear()} CarTrade. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="/cars"
                className="text-dark-500 hover:text-dark-300 text-sm transition-colors"
              >
                Browse Cars
              </Link>
              <Link
                href="/admin/login"
                className="text-dark-500 hover:text-dark-300 text-sm transition-colors"
              >
                Admin
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
