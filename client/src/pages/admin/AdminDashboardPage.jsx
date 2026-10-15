import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Building2,
  Calendar,
  CheckSquare,
  ShieldCheck,
  Clock,
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
import { adminService } from '../../services/adminService';
import { StatCard } from '../../components/ui/StatCard';
import { Button } from '../../components/ui/Button';
import { formatDate } from '../../utils/formatters';

const PIE_COLORS = ['#0d9488', '#3b82f6', '#f59e0b', '#8b5cf6'];

export const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await adminService.getDashboard();
        if (res.success) {
          setStats(res.data);
        }
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading || !stats) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-200 rounded w-1/3 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-white rounded-2xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const userDistribution = [
    { name: 'Tenants', value: stats.totalTenants },
    { name: 'Owners', value: stats.totalOwners },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <span className="text-xs font-semibold text-teal-600 uppercase tracking-wider">
            System Administration
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
            Platform Command Center
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time oversight of registered users, property listings, and rental transactions
          </p>
        </div>

        {stats.pendingOwnerApprovals > 0 && (
          <Link to="/admin/approvals">
            <Button size="sm" variant="danger" icon={Clock}>
              {stats.pendingOwnerApprovals} Pending Owner Approvals
            </Button>
          </Link>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Platform Users"
          value={stats.totalUsers}
          icon={Users}
          color="teal"
          trendText={`${stats.totalTenants} tenants, ${stats.totalOwners} owners`}
        />
        <StatCard
          title="Owner Approvals Queue"
          value={stats.pendingOwnerApprovals}
          icon={Clock}
          color={stats.pendingOwnerApprovals > 0 ? 'rose' : 'teal'}
          trendText="Awaiting admin action"
        />
        <StatCard
          title="Live Properties"
          value={stats.totalProperties}
          icon={Building2}
          color="blue"
          trendText={`${stats.availableProperties} currently available`}
        />
        <StatCard
          title="Total Bookings"
          value={stats.totalBookings}
          icon={Calendar}
          color="amber"
          trendText={`${stats.pendingBookings} in pending state`}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Properties by Type Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Listings by Category</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.propertyTypeBreakdown || []}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <XAxis dataKey="type" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#0d9488" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Roles Ratio Pie Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900">User Role Distribution</h3>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={userDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {userDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Registrations */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Recently Registered Users</h3>
            <Link to="/admin/users" className="text-xs font-semibold text-teal-600 hover:text-teal-700">
              Manage Users →
            </Link>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {stats.recentActivity?.recentUsers?.map((u) => (
              <div key={u._id} className="py-2.5 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">{u.name}</p>
                  <p className="text-slate-500 text-[11px]">{u.email}</p>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                    {u.role}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">{formatDate(u.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Booking Transactions */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Recent Booking Requests</h3>
            <Link to="/admin/bookings" className="text-xs font-semibold text-teal-600 hover:text-teal-700">
              Audit All →
            </Link>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {stats.recentActivity?.recentBookings?.map((b) => (
              <div key={b._id} className="py-2.5 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">{b.property?.title}</p>
                  <p className="text-slate-500 text-[11px]">Applicant: {b.tenant?.name}</p>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold capitalize bg-teal-50 text-teal-700">
                    {b.status}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">{formatDate(b.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
