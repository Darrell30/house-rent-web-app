import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { bookingService } from '../../services/bookingService';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { formatIDR, formatDate, formatDateTime } from '../../utils/formatters';
import { BOOKING_STATUS_CONFIG } from '../../utils/constants';
import toast from 'react-hot-toast';

export const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  // Selected booking for detail modal
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Cancellation confirm modal
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await bookingService.getMyBookings();
      if (res.success) {
        setBookings(res.data || []);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelConfirm = async () => {
    if (!bookingToCancel) return;
    try {
      setCancelling(true);
      const res = await bookingService.cancelBooking(bookingToCancel._id);
      if (res.success) {
        toast.success('Rental request cancelled successfully');
        setBookings((prev) =>
          prev.map((b) => (b._id === bookingToCancel._id ? { ...b, status: 'cancelled' } : b))
        );
        setCancelModalOpen(false);
        setBookingToCancel(null);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to cancel booking');
    } finally {
      setCancelling(false);
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
        <h1 className="text-2xl font-extrabold text-slate-900">My Rental Requests</h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-600">
          Track the status of your rental applications and review landlord decisions
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
            {status === 'all' ? `All Requests (${bookings.length})` : `${status} (${bookings.filter((b) => b.status === status).length})`}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 bg-white rounded-2xl animate-pulse border border-slate-200" />
          ))}
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No requests found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            You do not have any {statusFilter !== 'all' ? statusFilter : ''} booking requests yet.
          </p>
          <div className="mt-4">
            <Link to="/properties">
              <Button size="sm">Browse Rental Properties</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => {
            const statusConf =
              BOOKING_STATUS_CONFIG[booking.status] || BOOKING_STATUS_CONFIG.pending;
            const property = booking.property;

            return (
              <div
                key={booking._id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left: Property image & details */}
                <div className="flex items-start space-x-4">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                    <img
                      src={
                        property?.images?.[0]?.url ||
                        'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=400&q=80'
                      }
                      alt={property?.title || 'Property'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusConf.color}`}
                      >
                        {statusConf.label}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Requested on {formatDate(booking.createdAt)}
                      </span>
                    </div>

                    <h3 className="mt-1 text-sm font-bold text-slate-900 line-clamp-1">
                      {property?.title || 'Archived Property Listing'}
                    </h3>

                    <div className="mt-1 flex items-center text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      <span>{property?.city || 'Location unavailable'}</span>
                      <span className="mx-2">•</span>
                      <span className="font-bold text-teal-700">
                        {property?.monthlyRent ? formatIDR(property.monthlyRent) : '-'} / bln
                      </span>
                    </div>

                    <div className="mt-2 text-xs text-slate-600 flex items-center space-x-4">
                      <span>
                        <strong>Move-in:</strong> {formatDate(booking.moveInDate)}
                      </span>
                      <span>
                        <strong>Occupants:</strong> {booking.occupants} person(s)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-row md:flex-col items-end justify-between md:justify-center space-y-2 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedBooking(booking)}
                    >
                      View Details
                    </Button>

                    {booking.status === 'pending' && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => {
                          setBookingToCancel(booking);
                          setCancelModalOpen(true);
                        }}
                      >
                        Cancel Request
                      </Button>
                    )}
                  </div>

                  {property && (
                    <Link
                      to={`/properties/${property._id}`}
                      className="text-xs font-semibold text-teal-600 hover:text-teal-700 inline-flex items-center space-x-1"
                    >
                      <span>Property Page</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Booking Details Modal */}
      {selectedBooking && (
        <Modal
          isOpen={!!selectedBooking}
          onClose={() => setSelectedBooking(null)}
          title="Rental Request Information"
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-xs">
            {/* Property summary */}
            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <p className="text-[10px] uppercase font-bold text-slate-400">Property</p>
              <p className="font-bold text-slate-900">{selectedBooking.property?.title}</p>
              <p className="text-slate-500">{selectedBooking.property?.address}, {selectedBooking.property?.city}</p>
              <p className="text-teal-700 font-bold">
                {selectedBooking.property?.monthlyRent ? formatIDR(selectedBooking.property.monthlyRent) : '-'} / bulan
              </p>
            </div>

            {/* Application Data */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Move-in Date</p>
                <p className="font-semibold text-slate-800">{formatDate(selectedBooking.moveInDate)}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Move-out Date</p>
                <p className="font-semibold text-slate-800">{formatDate(selectedBooking.moveOutDate) || 'Flexible'}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Occupants</p>
                <p className="font-semibold text-slate-800">{selectedBooking.occupants} Person(s)</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Status</p>
                <p className="font-bold capitalize text-teal-700">{selectedBooking.status}</p>
              </div>
            </div>

            {/* Tenant Message */}
            {selectedBooking.message && (
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Your Message to Landlord</p>
                <p className="p-3 bg-slate-50 rounded-xl text-slate-700 leading-relaxed italic">
                  "{selectedBooking.message}"
                </p>
              </div>
            )}

            {/* Landlord Contact Info */}
            <div className="p-3 border border-slate-200 rounded-xl space-y-2">
              <p className="text-[10px] text-slate-400 uppercase font-bold">Landlord Information</p>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-xs">
                  {selectedBooking.owner?.name?.charAt(0) || 'O'}
                </div>
                <div>
                  <p className="font-bold text-slate-900">{selectedBooking.owner?.name}</p>
                  <p className="text-slate-500 text-[11px]">{selectedBooking.owner?.email}</p>
                  {selectedBooking.owner?.phone && (
                    <p className="text-slate-500 text-[11px]">{selectedBooking.owner?.phone}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button size="sm" onClick={() => setSelectedBooking(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={handleCancelConfirm}
        title="Cancel Booking Request?"
        message="Are you sure you want to withdraw your rental application for this property? The landlord will be notified."
        confirmText="Yes, Cancel Request"
        confirmVariant="danger"
        loading={cancelling}
      />
    </div>
  );
};
