import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Check,
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Clock,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { bookingService } from '../../services/bookingService';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { formatIDR, formatDate } from '../../utils/formatters';
import { BOOKING_STATUS_CONFIG } from '../../utils/constants';
import toast from 'react-hot-toast';

export const OwnerBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  // Approve modal state
  const [approveConfirmOpen, setApproveConfirmOpen] = useState(false);
  const [bookingToApprove, setBookingToApprove] = useState(null);
  const [approving, setApproving] = useState(false);

  // Reject modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [bookingToReject, setBookingToReject] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejecting, setRejecting] = useState(false);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await bookingService.getOwnerBookings();
      if (res.success) {
        setBookings(res.data || []);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to fetch incoming bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleApproveConfirm = async () => {
    if (!bookingToApprove) return;
    try {
      setApproving(true);
      const res = await bookingService.updateBookingStatus(bookingToApprove._id, 'approved');
      if (res.success) {
        toast.success(
          'Booking approved! Property marked as rented and other conflicting requests closed.'
        );
        setApproveConfirmOpen(false);
        setBookingToApprove(null);
        // Refresh bookings list to update all status changes
        await fetchBookings();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to approve booking');
    } finally {
      setApproving(false);
    }
  };

  const handleRejectConfirm = async (e) => {
    e.preventDefault();
    if (!bookingToReject) return;
    try {
      setRejecting(true);
      const res = await bookingService.updateBookingStatus(
        bookingToReject._id,
        'rejected',
        rejectReason
      );
      if (res.success) {
        toast.success('Booking application rejected');
        setRejectModalOpen(false);
        setBookingToReject(null);
        setRejectReason('');
        await fetchBookings();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to reject booking');
    } finally {
      setRejecting(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (statusFilter === 'all') return true;
    return b.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Tenant Booking Requests</h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-600">
          Review tenant applications, approve leases, or decline requests with notifications
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3 text-xs">
        {['all', 'pending', 'approved', 'rejected', 'cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1.5 rounded-xl font-bold capitalize transition-colors ${
              statusFilter === status
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {status === 'all'
              ? `All Requests (${bookings.length})`
              : `${status} (${bookings.filter((b) => b.status === status).length})`}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-44 bg-white rounded-2xl animate-pulse border border-slate-200" />
          ))}
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No applications found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            You do not currently have any {statusFilter !== 'all' ? statusFilter : ''} booking requests.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => {
            const statusConf =
              BOOKING_STATUS_CONFIG[booking.status] || BOOKING_STATUS_CONFIG.pending;
            const property = booking.property;
            const tenant = booking.tenant;

            return (
              <div
                key={booking._id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col lg:flex-row lg:items-center justify-between gap-5"
              >
                {/* Left: Applicant details & property info */}
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusConf.color}`}
                    >
                      {statusConf.label}
                    </span>
                    <span className="text-xs text-slate-400">
                      Submitted on {formatDate(booking.createdAt)}
                    </span>
                  </div>

                  {/* Target Property */}
                  <div className="flex items-center space-x-2 text-xs">
                    <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                      Property:
                    </span>
                    <span className="font-bold text-slate-900">{property?.title}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-teal-700 font-bold">
                      {property?.monthlyRent ? formatIDR(property.monthlyRent) : '-'} / bln
                    </span>
                  </div>

                  {/* Tenant Profile Snippet */}
                  <div className="p-3 bg-slate-50 rounded-xl flex items-center space-x-3 text-xs">
                    <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-xs">
                      {tenant?.name?.charAt(0) || 'T'}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-900">{tenant?.name}</p>
                      <div className="flex items-center space-x-3 text-slate-500 text-[11px]">
                        <span>{tenant?.email}</span>
                        {tenant?.phone && <span>• {tenant.phone}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Lease Parameters */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-slate-600">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Move-in Date</span>
                      <span className="font-semibold">{formatDate(booking.moveInDate)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Move-out Date</span>
                      <span className="font-semibold">{formatDate(booking.moveOutDate) || 'Not specified'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Occupants</span>
                      <span className="font-semibold">{booking.occupants} person(s)</span>
                    </div>
                  </div>

                  {/* Message */}
                  {booking.message && (
                    <div className="p-2.5 rounded-lg bg-teal-50/40 text-xs text-slate-700 italic border border-teal-100/60">
                      "{booking.message}"
                    </div>
                  )}
                </div>

                {/* Right: Actions */}
                <div className="lg:w-48 flex flex-col justify-center space-y-2 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  {booking.status === 'pending' ? (
                    <>
                      <Button
                        variant="primary"
                        size="sm"
                        className="w-full"
                        icon={Check}
                        onClick={() => {
                          setBookingToApprove(booking);
                          setApproveConfirmOpen(true);
                        }}
                      >
                        Approve Request
                      </Button>

                      <Button
                        variant="danger"
                        size="sm"
                        className="w-full"
                        icon={X}
                        onClick={() => {
                          setBookingToReject(booking);
                          setRejectModalOpen(true);
                        }}
                      >
                        Decline
                      </Button>
                    </>
                  ) : (
                    <div className="text-center py-2 text-xs font-semibold text-slate-500">
                      Status: {statusConf.label}
                    </div>
                  )}

                  {property && (
                    <Link
                      to={`/properties/${property._id}`}
                      target="_blank"
                      className="text-center text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center justify-center space-x-1 pt-1"
                    >
                      <span>View Listing</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Approve Confirmation Modal */}
      <ConfirmDialog
        isOpen={approveConfirmOpen}
        onClose={() => setApproveConfirmOpen(false)}
        onConfirm={handleApproveConfirm}
        title="Approve Rental Booking?"
        message={`Approving this request will accept ${bookingToApprove?.tenant?.name}'s tenancy for "${bookingToApprove?.property?.title}". The property availability will automatically be set to 'Rented', and other pending applications for this property will be closed.`}
        confirmText="Confirm Approval"
        confirmVariant="primary"
        loading={approving}
      />

      {/* Reject Modal with optional reason */}
      {rejectModalOpen && (
        <Modal
          isOpen={rejectModalOpen}
          onClose={() => setRejectModalOpen(false)}
          title="Decline Rental Application"
          maxWidth="max-w-md"
        >
          <form onSubmit={handleRejectConfirm} className="space-y-4">
            <p className="text-xs text-slate-600">
              Are you sure you want to decline the rental booking from{' '}
              <strong>{bookingToReject?.tenant?.name}</strong>?
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reason for Declining (Optional, visible to tenant)
              </label>
              <textarea
                rows="3"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Property already committed, dates incompatible, etc."
                className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRejectModalOpen(false)}
                disabled={rejecting}
              >
                Cancel
              </Button>
              <Button type="submit" variant="danger" size="sm" loading={rejecting}>
                Decline Application
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
