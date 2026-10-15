import { useState, useEffect, useCallback } from 'react';
import { CalendarDays, RefreshCw, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { adminService } from '../../services/adminService';
import { EmptyState } from '../../components/ui/EmptyState';
import { Pagination } from '../../components/common/Pagination';
import { formatDate, formatIDR } from '../../utils/formatters';
import { BOOKING_STATUS_CONFIG } from '../../utils/constants';
import { Button } from '../../components/ui/Button';

const STATUS_TABS = [
  { key: '', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'cancelled', label: 'Cancelled' },
];

export function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.getBookings({
        page,
        limit: 15,
        status: statusFilter || undefined,
      });
      const bookingsList = Array.isArray(res.data) ? res.data : (res.data?.bookings || []);
      setBookings(bookingsList);
      setPagination(
        res.meta || res.data?.pagination || { page: 1, totalPages: 1, total: bookingsList.length }
      );
    } catch {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleTabChange = (key) => {
    setStatusFilter(key);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">All Bookings</h1>
          <p className="text-sm text-slate-500 mt-1">
            Audit view of all rental requests across the platform
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchBookings}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Status Tabs */}
        <div className="border-b border-slate-200 px-6">
          <nav className="flex gap-1 -mb-px overflow-x-auto" aria-label="Booking status filter">
            {STATUS_TABS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => handleTabChange(key)}
                className={`flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  statusFilter === key
                    ? 'border-teal-600 text-teal-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Total */}
        <div className="px-6 py-3 border-b border-slate-100 bg-slate-50/50">
          <p className="text-xs text-slate-500">
            <span className="font-semibold text-slate-700">{pagination.total}</span>{' '}
            booking{pagination.total !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <div className="p-10">
              <EmptyState
                icon={CalendarDays}
                title="No bookings found"
                description={
                  statusFilter
                    ? `No ${statusFilter} bookings on the platform.`
                    : 'No bookings have been submitted yet.'
                }
              />
            </div>
          ) : (
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="pl-6 pr-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Property
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Tenant
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Owner
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Move-in Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Rent
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Submitted
                  </th>
                  <th className="pl-4 pr-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    View
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {bookings.map((booking) => {
                  const statusCfg = BOOKING_STATUS_CONFIG[booking.status] || {};
                  return (
                    <tr key={booking._id} className="hover:bg-slate-50 transition-colors">
                      <td className="pl-6 pr-4 py-4">
                        <p className="text-sm font-semibold text-slate-800 max-w-[180px] truncate">
                          {booking.property?.title || '—'}
                        </p>
                        <p className="text-xs text-slate-500">
                          {booking.property?.city || ''}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-slate-700">{booking.tenant?.name || '—'}</p>
                        <p className="text-xs text-slate-500">{booking.tenant?.email || ''}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-slate-700">{booking.owner?.name || '—'}</p>
                        <p className="text-xs text-slate-500">{booking.owner?.email || ''}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-slate-700">
                          {booking.moveInDate || booking.preferredMoveInDate
                            ? formatDate(booking.moveInDate || booking.preferredMoveInDate)
                            : '—'}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm font-semibold text-slate-700">
                          {booking.property?.monthlyRent ?? booking.property?.rentPrice
                            ? formatIDR(booking.property.monthlyRent ?? booking.property.rentPrice)
                            : '—'}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${statusCfg.className || 'bg-slate-100 text-slate-600'}`}
                        >
                          {statusCfg.label || booking.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-slate-600">{formatDate(booking.createdAt)}</p>
                      </td>
                      <td className="pl-4 pr-6 py-4 text-right">
                        {booking.property?._id && (
                          <Link
                            to={`/properties/${booking.property._id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center p-1.5 rounded-lg text-slate-500 hover:text-teal-600 hover:bg-teal-50 transition-colors"
                            title="View property"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-100">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminBookingsPage;
