import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  CheckCircle,
  Clock,
  Calendar,
  PlusCircle,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { propertyService } from '../../services/propertyService';
import { bookingService } from '../../services/bookingService';
import { useAuth } from '../../hooks/useAuth';
import { StatCard } from '../../components/ui/StatCard';
import { Button } from '../../components/ui/Button';
import { formatIDR, formatDate } from '../../utils/formatters';
import { BOOKING_STATUS_CONFIG } from '../../utils/constants';

const COLORS = ['#0d9488', '#3b82f6', '#f59e0b', '#ef4444'];

export const OwnerDashboardPage = () => {
  const { user, isApprovedOwner } = useAuth();
  const [properties, setProperties] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOwnerData = async () => {
      try {
        setLoading(true);
        const [propsRes, bookingsRes] = await Promise.all([
          propertyService.getMyListings(),
          bookingService.getOwnerBookings(),
        ]);
        if (propsRes.success) setProperties(propsRes.data || []);
        if (bookingsRes.success) setBookings(bookingsRes.data || []);
      } catch (err) {
        console.error('Failed to load owner dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOwnerData();
  }, []);

  const totalProperties = properties.length;
  const availableProperties = properties.filter((p) => p.availabilityStatus === 'available').length;
  const rentedProperties = properties.filter((p) => p.availabilityStatus === 'rented').length;
  const pendingRequests = bookings.filter((b) => b.status === 'pending').length;
  const approvedBookings = bookings.filter((b) => b.status === 'approved').length;

  // Chart data: Properties by city
  const cityCounts = {};
  properties.forEach((p) => {
    cityCounts[p.city] = (cityCounts[p.city] || 0) + 1;
  });
  const cityChartData = Object.keys(cityCounts).map((city) => ({
    city,
    count: cityCounts[city],
  }));

  // Chart data: Availability breakdown
  const availabilityData = [
    { name: 'Available', value: availableProperties },
    { name: 'Rented', value: rentedProperties },
    { name: 'Maintenance', value: properties.filter((p) => p.availabilityStatus === 'maintenance').length },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <span className="text-xs font-semibold text-teal-600 uppercase tracking-wider">
            Owner Management Overview
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your rental listings, screen applicant bookings, and oversee occupancy.
          </p>
        </div>

        <div>
          {isApprovedOwner ? (
            <Link to="/owner/properties/add">
              <Button size="md" icon={PlusCircle}>
                List New Property
              </Button>
            </Link>
          ) : (
            <div className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 text-xs font-semibold border border-amber-200">
              Pending Admin Approval
            </div>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Listings"
          value={totalProperties}
          icon={Building2}
          color="teal"
          trendText="Published properties"
        />
        <StatCard
          title="Available for Rent"
          value={availableProperties}
          icon={CheckCircle}
          color="blue"
          trendText="Active in marketplace"
        />
        <StatCard
          title="Currently Rented"
          value={rentedProperties}
          icon={Calendar}
          color="purple"
          trendText="Occupied units"
        />
        <StatCard
          title="Pending Applications"
          value={pendingRequests}
          icon={Clock}
          color="amber"
          trendText="Needs your review"
        />
      </div>

      {/* Charts Row */}
      {properties.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* City Distribution Bar Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Listings by City</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cityChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="city" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#0d9488" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Occupancy Pie Chart */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Occupancy Breakdown</h3>
            <div className="h-64 w-full flex items-center justify-center">
              {availabilityData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={availabilityData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={75}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {availabilityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-xs text-slate-400">No data available</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Pending Booking Requests Action Queue */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Incoming Rental Applications</h2>
            <p className="text-xs text-slate-500">Tenants requesting to rent your listed properties</p>
          </div>
          <Link
            to="/owner/bookings"
            className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center space-x-1"
          >
            <span>Manage All Bookings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-10 text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
            No rental requests received yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Property</th>
                  <th className="py-3 px-4">Applicant</th>
                  <th className="py-3 px-4">Requested Move-in</th>
                  <th className="py-3 px-4">Occupants</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Review Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.slice(0, 5).map((booking) => {
                  const statusConf =
                    BOOKING_STATUS_CONFIG[booking.status] || BOOKING_STATUS_CONFIG.pending;
                  return (
                    <tr key={booking._id} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4 font-semibold text-slate-900 max-w-[200px] truncate">
                        {booking.property?.title}
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">
                        {booking.tenant?.name}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {formatDate(booking.moveInDate)}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{booking.occupants} person(s)</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusConf.color}`}
                        >
                          {statusConf.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          to="/owner/bookings"
                          className="font-bold text-teal-600 hover:text-teal-700"
                        >
                          Review →
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
    </div>
  );
};
