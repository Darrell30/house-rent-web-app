import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  Building,
  Key,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Users,
  BadgePercent,
  Home,
} from 'lucide-react';
import { propertyService } from '../../services/propertyService';
import { PropertyCard } from '../../components/property/PropertyCard';
import { CardSkeleton } from '../../components/ui/CardSkeleton';
import { Button } from '../../components/ui/Button';
import { CITIES, PROPERTY_TYPES } from '../../utils/constants';

export const LandingPage = () => {
  const navigate = useNavigate();
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quick search form state
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedType, setSelectedType] = useState('');

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await propertyService.getProperties({ limit: 6, sortBy: 'newest' });
        if (res.success) {
          setFeaturedProperties(res.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch featured properties:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const handleQuickSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (selectedCity) params.set('city', selectedCity);
    if (selectedType) params.set('propertyType', selectedType);
    navigate(`/properties?${params.toString()}`);
  };

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white overflow-hidden py-20 lg:py-28">
        {/* Background Image Overlay */}
        <div className="absolute inset-0 z-0 opacity-20">
          <img
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=80"
            alt="Hero Real Estate"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Indonesia's Modern House & Apartment Rental Marketplace</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight">
            Find Your Next Place to <span className="text-teal-400">Call Home</span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto">
            Discover verified apartments, family houses, luxury villas, and executive kost
            across Jakarta, BSD City, Bandung, Surabaya, and Yogyakarta.
          </p>

          {/* Quick Search Widget */}
          <div className="mt-10 max-w-4xl mx-auto bg-white/95 backdrop-blur-md rounded-2xl p-4 sm:p-5 shadow-2xl text-slate-900">
            <form
              onSubmit={handleQuickSearch}
              className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center"
            >
              {/* City Selector */}
              <div className="text-left">
                <label className="block text-xs font-bold text-slate-500 mb-1 flex items-center">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-teal-600" />
                  City / Location
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full text-xs sm:text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">All Indonesian Cities</option>
                  {CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Property Type */}
              <div className="text-left">
                <label className="block text-xs font-bold text-slate-500 mb-1 flex items-center">
                  <Building className="w-3.5 h-3.5 mr-1 text-teal-600" />
                  Property Type
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full text-xs sm:text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">All Types</option>
                  {PROPERTY_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Submit Button */}
              <div className="sm:self-end">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full font-bold shadow-md shadow-teal-600/30"
                  icon={Search}
                >
                  Search Properties
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Browse by Property Category
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Tailored rental accommodations for every lifestyle and budget
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {PROPERTY_TYPES.map((type) => (
            <Link
              key={type}
              to={`/properties?propertyType=${encodeURIComponent(type)}`}
              className="group p-4 bg-white rounded-2xl border border-slate-200/80 hover:border-teal-500 hover:shadow-md transition-all text-center flex flex-col items-center justify-center space-y-2"
            >
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-colors">
                <Building className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-slate-800 group-hover:text-teal-600 transition-colors">
                {type}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Properties Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
          <div>
            <div className="inline-flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-teal-600 mb-1">
              <span>Verified Listings</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Featured Rental Homes
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Hand-picked properties ready for immediate move-in
            </p>
          </div>
          <Link
            to="/properties"
            className="mt-4 sm:mt-0 inline-flex items-center space-x-1 text-sm font-bold text-teal-600 hover:text-teal-700"
          >
            <span>View All Listings</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : featuredProperties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProperties.map((property) => (
              <PropertyCard key={property._id} property={property} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
            <p className="text-sm text-slate-500">No properties currently available.</p>
          </div>
        )}
      </section>

      {/* How HouseHunt Works */}
      <section className="bg-slate-100/70 py-16 border-y border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              How HouseHunt Works
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Rent with confidence in three simple, transparent steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-extrabold text-lg mb-4">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900">Discover & Filter</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Browse detailed property listings with verified photography, amenities,
                specs, and transparent monthly rental prices in IDR.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-extrabold text-lg mb-4">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900">Submit Rental Request</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Choose your move-in date and send your rental application directly to the
                property owner without intermediary brokerage confusion.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-extrabold text-lg mb-4">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900">Get Approved & Move In</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Receive real-time in-app notification when the owner approves your booking.
                Connect directly and finalize your lease agreement smoothly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits for Tenants & Landlords */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* For Tenants */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-sm space-y-4">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
              <Key className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">For Prospective Tenants</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Find transparent housing without hidden fees, duplicate broker ads, or misleading photos.
            </p>
            <ul className="space-y-2.5 text-xs text-slate-700 pt-2">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
                <span>Save favorites and track multiple rental requests in one place</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
                <span>Direct inquiry messaging with verified property owners</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
                <span>Clear availability statuses and real-time status notifications</span>
              </li>
            </ul>
            <div className="pt-2">
              <Link to="/properties">
                <Button size="sm" variant="outline">
                  Browse Properties
                </Button>
              </Link>
            </div>
          </div>

          {/* For Landlords */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-sm space-y-4">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
              <Building className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">For Property Owners</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Publish your properties to qualified tenants and manage rental bookings seamlessly.
            </p>
            <ul className="space-y-2.5 text-xs text-slate-700 pt-2">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
                <span>Full CRUD management with photos, amenities, and specs</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
                <span>Approve or decline tenant rental applications in one click</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
                <span>Automatic occupancy updates to prevent double booking conflicts</span>
              </li>
            </ul>
            <div className="pt-2">
              <Link to="/register">
                <Button size="sm" variant="secondary">
                  Register as Owner
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-teal-700 text-white p-8 sm:p-12 text-center shadow-xl relative overflow-hidden">
          <h2 className="text-2xl sm:text-3xl font-extrabold max-w-xl mx-auto leading-tight">
            Ready to find your ideal home in Indonesia?
          </h2>
          <p className="mt-3 text-sm text-teal-100 max-w-md mx-auto">
            Join HouseHunt today to start searching properties or list your own rental space.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-3">
            <Link to="/properties">
              <Button size="lg" className="bg-white text-teal-800 hover:bg-teal-50 font-bold">
                Browse All Properties
              </Button>
            </Link>
            <Link to="/register">
              <Button size="lg" variant="outline" className="text-white border-white/40 hover:bg-white/10 font-bold">
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
