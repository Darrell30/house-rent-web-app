import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Heart,
  Clock,
  CheckCircle,
  Search,
  ArrowRight,
  Compass,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { bookingService } from '../../services/bookingService';
import { favoriteService } from '../../services/favoriteService';
import { StatCard } from '../../components/ui/StatCard';
import { Button } from '../../components/ui/Button';
import { PropertyCard } from '../../components/property/PropertyCard';
import { formatDate, formatIDR } from '../../utils/formatters';
import { BOOKING_STATUS_CONFIG } from '../../utils/constants';

export const TenantDashboardPage = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quickSearch, setQuickSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [bookingsRes, favsRes] = await Promise.all([
          bookingService.getMyBookings(),
          favoriteService.getFavorites(),
        ]);
        if (bookingsRes.success) setBookings(bookingsRes.data || []);
        if (favsRes.success) setFavorites(favsRes.data || []);
      } catch (err) {
        console.error('Failed to load tenant dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const pendingCount = bookings.filter((b) => b.status === 'pending').length;
  const approvedCount = bookings.filter((b) => b.status === 'approved').length;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-700 to-teal-900 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-wider text-teal-200">
            Tenant Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">
            Welcome back, {user?.name}!
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-teal-100">
            Track your rental requests, view approved bookings, and browse newly listed
            homes across Indonesia.
          </p>

          {/* Quick search input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (quickSearch.trim()) {
                window.location.href = `/properties?search=${encodeURIComponent(quickSearch.trim())}`;
              }
            }}
            className="mt-5 flex items-center max-w-md bg-white rounded-xl p-1 shadow-sm"
          >
            <Search className="w-4 h-4 text-slate-400 ml-2.5" />
            <input
              type="text"
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value)}
              placeholder="Quick search properties..."
              className="flex-1 text-xs text-slate-900 px-3 py-2 bg-transparent focus:outline-none"
            />
            <Button type="submit" size="sm" className="rounded-lg text-xs py-1.5 font-bold">
              Search
            </Button>
          </form>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Bookings"
          value={bookings.length}
          icon={Calendar}
          color="teal"
          trendText="Historical requests"
        />
        <StatCard
          title="Pending Review"
          value={pendingCount}
          icon={Clock}
          color="amber"
          trendText="Awaiting owner response"
        />
        <StatCard
          title="Approved Leases"
          value={approvedCount}
          icon={CheckCircle}
          color="blue"
          trendText="Ready for tenancy"
        />
        <StatCard
          title="Saved Favorites"
          value={favorites.length}
          icon={Heart}
          color="rose"
          trendText="Watchlisted homes"
        />
      </div>

      {/* Recent Booking Requests */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Rental Requests</h2>
            <p className="text-xs text-slate-500">Your latest submissions to landlords</p>
          </div>
          <Link
            to="/tenant/bookings"
            className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
            You have not submitted any rental booking requests yet.{' '}
            <Link to="/properties" className="text-teal-600 font-bold hover:underline">
              Browse listings
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Property</th>
                  <th className="py-3 px-4">Landlord</th>
                  <th className="py-3 px-4">Move-in Date</th>
                  <th className="py-3 px-4">Rent</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.slice(0, 5).map((booking) => {
                  const statusConf =
                    BOOKING_STATUS_CONFIG[booking.status] || BOOKING_STATUS_CONFIG.pending;
                  return (
                    <tr key={booking._id} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4 font-semibold text-slate-900 max-w-[200px] truncate">
                        {booking.property?.title || 'Unknown Property'}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {booking.owner?.name || 'Owner'}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {formatDate(booking.moveInDate)}
                      </td>
                      <td className="py-3 px-4 font-bold text-teal-700">
                        {booking.property?.monthlyRent
                          ? formatIDR(booking.property.monthlyRent)
                          : '-'}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border ${statusConf.color}`}
                        >
                          {statusConf.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          to="/tenant/bookings"
                          className="font-semibold text-teal-600 hover:text-teal-700"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Saved Properties Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Saved Properties</h2>
            <p className="text-xs text-slate-500">Quick access to your favorites</p>
          </div>
          <Link
            to="/tenant/saved"
            className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center space-x-1"
          >
            <span>See All Saved ({favorites.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
            No saved properties yet.{' '}
            <Link to="/properties" className="text-teal-600 font-bold hover:underline">
              Explore rental listings
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {favorites.slice(0, 4).map((prop) => (
              <PropertyCard
                key={prop._id}
                property={{ ...prop, isFavorite: true }}
                onFavoriteToggle={(id, isFav) => {
                  if (!isFav) {
                    setFavorites((prev) => prev.filter((p) => p._id !== id));
                  }
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
