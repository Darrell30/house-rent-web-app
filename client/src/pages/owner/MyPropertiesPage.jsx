import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  PlusCircle,
  Edit3,
  Trash2,
  ExternalLink,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Calendar,
} from 'lucide-react';
import { propertyService } from '../../services/propertyService';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { formatIDR } from '../../utils/formatters';
import { AVAILABILITY_STATUS_CONFIG } from '../../utils/constants';
import toast from 'react-hot-toast';

export const MyPropertiesPage = () => {
  const { isApprovedOwner } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  // Archive modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const res = await propertyService.getMyListings();
      if (res.success) {
        setProperties(res.data || []);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load your listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!propertyToDelete) return;
    try {
      setDeleting(true);
      const res = await propertyService.deleteProperty(propertyToDelete._id);
      if (res.success) {
        toast.success('Property archived successfully. Booking records preserved.');
        setProperties((prev) => prev.filter((p) => p._id !== propertyToDelete._id));
        setDeleteModalOpen(false);
        setPropertyToDelete(null);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to archive property');
    } finally {
      setDeleting(false);
    }
  };

  const handleStatusChange = async (propertyId, newStatus) => {
    try {
      const res = await propertyService.updateProperty(propertyId, {
        availabilityStatus: newStatus,
      });
      if (res.success) {
        toast.success(`Property marked as ${newStatus}`);
        setProperties((prev) =>
          prev.map((p) => (p._id === propertyId ? { ...p, availabilityStatus: newStatus } : p))
        );
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update property status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">My Properties</h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-600">
            Manage your listed real estate assets, pricing, availability, and tenant inquiries
          </p>
        </div>

        {isApprovedOwner && (
          <Link to="/owner/properties/add">
            <Button size="md" icon={PlusCircle}>
              Add New Property
            </Button>
          </Link>
        )}
      </div>

      {/* Properties List */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 bg-white rounded-2xl animate-pulse border border-slate-200" />
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No properties listed yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            You have not published any properties. Start listing your homes or apartments.
          </p>
          <div className="mt-4">
            {isApprovedOwner ? (
              <Link to="/owner/properties/add">
                <Button size="sm" icon={PlusCircle}>
                  Add Your First Property
                </Button>
              </Link>
            ) : (
              <p className="text-xs text-amber-700 font-semibold">
                (Awaiting administrator approval before you can publish properties)
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {properties.map((prop) => {
            const statusConfig =
              AVAILABILITY_STATUS_CONFIG[prop.availabilityStatus] ||
              AVAILABILITY_STATUS_CONFIG.available;
            const primaryImg =
              prop.images?.[0]?.url ||
              'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80';

            return (
              <div
                key={prop._id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
              >
                {/* Left: Image & Details */}
                <div className="flex items-start space-x-4">
                  <div className="w-28 h-24 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                    <img
                      src={primaryImg}
                      alt={prop.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900 text-white">
                        {prop.propertyType}
                      </span>
                      {/* Availability status dropdown selector */}
                      <select
                        value={prop.availabilityStatus}
                        onChange={(e) => handleStatusChange(prop._id, e.target.value)}
                        className={`text-[11px] font-bold rounded-full px-2.5 py-0.5 border cursor-pointer focus:outline-none ${statusConfig.color}`}
                      >
                        <option value="available">Available</option>
                        <option value="rented">Rented</option>
                        <option value="maintenance">Maintenance</option>
                      </select>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{prop.title}</h3>

                    <div className="flex items-center text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      <span>{prop.address}, {prop.city}</span>
                    </div>

                    <div className="text-xs font-bold text-teal-700">
                      {formatIDR(prop.monthlyRent)} <span className="text-slate-400 font-normal">/ month</span>
                    </div>

                    <div className="flex items-center space-x-3 text-[11px] text-slate-500 pt-1">
                      <span>{prop.bedrooms} Bed</span>
                      <span>•</span>
                      <span>{prop.bathrooms} Bath</span>
                      <span>•</span>
                      <span>{prop.sizeSqm} m²</span>
                    </div>
                  </div>
                </div>

                {/* Right: Booking metrics and action buttons */}
                <div className="flex flex-row md:flex-col items-end justify-between md:justify-center space-y-3 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                  {/* Booking Badges */}
                  <div className="flex items-center space-x-2 text-xs">
                    <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded-lg font-bold border border-amber-200">
                      Pending: {prop.bookingStats?.pending || 0}
                    </span>
                    <span className="px-2 py-1 bg-teal-50 text-teal-700 rounded-lg font-bold border border-teal-200">
                      Approved: {prop.bookingStats?.approved || 0}
                    </span>
                  </div>

                  {/* Buttons */}
                  <div className="flex items-center space-x-2">
                    <Link to={`/properties/${prop._id}`} target="_blank">
                      <Button variant="ghost" size="sm" icon={ExternalLink}>
                        View
                      </Button>
                    </Link>

                    <Link to={`/owner/properties/${prop._id}/edit`}>
                      <Button variant="outline" size="sm" icon={Edit3}>
                        Edit
                      </Button>
                    </Link>

                    <Button
                      variant="danger"
                      size="sm"
                      icon={Trash2}
                      onClick={() => {
                        setPropertyToDelete(prop);
                        setDeleteModalOpen(true);
                      }}
                    >
                      Archive
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete/Archive Confirmation Modal */}
      <ConfirmDialog
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Archive Property Listing?"
        message="Archiving will remove this property from public marketplace search while safely preserving historical tenant booking records."
        confirmText="Yes, Archive Property"
        confirmVariant="danger"
        loading={deleting}
      />
    </div>
  );
};
