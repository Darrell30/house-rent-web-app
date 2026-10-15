import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Calendar,
  Heart,
  MessageSquare,
  CheckCircle,
  Share2,
  ArrowLeft,
  Shield,
  User,
  Phone,
  Mail,
} from 'lucide-react';
import { propertyService } from '../../services/propertyService';
import { favoriteService } from '../../services/favoriteService';
import { useAuth } from '../../hooks/useAuth';
import { ImageGallery } from '../../components/property/ImageGallery';
import { BookingModal } from '../../components/property/BookingModal';
import { MessageModal } from '../../components/property/MessageModal';
import { PropertyCard } from '../../components/property/PropertyCard';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/common/Badge';
import { formatIDR, formatDate } from '../../utils/formatters';
import { AVAILABILITY_STATUS_CONFIG } from '../../utils/constants';
import toast from 'react-hot-toast';

export const PropertyDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isTenant } = useAuth();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);

  // Modals
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [messageModalOpen, setMessageModalOpen] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await propertyService.getPropertyById(id);
        if (res.success && res.data) {
          setProperty(res.data);
          setIsFavorite(res.data.isFavorite || false);
        }
      } catch (err) {
        setError(err.message || 'Property not found');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const handleFavoriteToggle = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to save properties');
      return;
    }
    if (!isTenant) {
      toast.error('Only tenants can save properties');
      return;
    }

    try {
      if (isFavorite) {
        await favoriteService.removeFavorite(property._id);
        setIsFavorite(false);
        toast.success('Removed from favorites');
      } else {
        await favoriteService.addFavorite(property._id);
        setIsFavorite(true);
        toast.success('Saved to favorites');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update favorite');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Property link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <div className="animate-pulse space-y-6 max-w-4xl mx-auto">
          <div className="h-8 bg-slate-200 rounded w-1/2 mx-auto" />
          <div className="aspect-[16/9] bg-slate-200 rounded-2xl" />
          <div className="h-20 bg-slate-200 rounded" />
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Property Not Found</h2>
        <p className="mt-2 text-sm text-slate-500">
          The listing you are looking for may have been removed or archived.
        </p>
        <div className="mt-6">
          <Link to="/properties">
            <Button>Back to Listings</Button>
          </Link>
        </div>
      </div>
    );
  }

  const statusConfig = AVAILABILITY_STATUS_CONFIG[property.availabilityStatus] || AVAILABILITY_STATUS_CONFIG.available;
  const isAvailable = property.availabilityStatus === 'available';
  const isOwnerOfProperty = user && property.owner && user._id === property.owner._id;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button & Action buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center space-x-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          <span>Back</span>
        </button>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            icon={Share2}
          >
            Share
          </Button>
          <Button
            variant={isFavorite ? 'danger' : 'outline'}
            size="sm"
            onClick={handleFavoriteToggle}
            icon={Heart}
          >
            {isFavorite ? 'Saved' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Main Property Header */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusConfig.color}`}>
            {statusConfig.label}
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-900 text-white">
            {property.propertyType}
          </span>
          <span className="text-xs font-medium text-slate-500 capitalize">
            {property.furnishingStatus}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight">
          {property.title}
        </h1>

        <div className="flex items-center text-xs sm:text-sm text-slate-600">
          <MapPin className="w-4 h-4 mr-1 text-teal-600 flex-shrink-0" />
          <span>
            {property.address}, {property.city}, {property.province} {property.postalCode}
          </span>
        </div>
      </div>

      {/* Image Gallery */}
      <ImageGallery images={property.images} />

      {/* Grid: Details (Left 2 cols) & Booking Action Card (Right 1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Specifications, Description, Amenities */}
        <div className="lg:col-span-2 space-y-8">
          {/* Key Specifications Grid */}
          <div className="grid grid-cols-3 gap-4 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm text-center">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-1">
                <Bed className="w-5 h-5" />
              </div>
              <span className="text-base font-bold text-slate-900">{property.bedrooms}</span>
              <span className="text-xs text-slate-500">Bedrooms</span>
            </div>
            <div className="flex flex-col items-center border-x border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-1">
                <Bath className="w-5 h-5" />
              </div>
              <span className="text-base font-bold text-slate-900">{property.bathrooms}</span>
              <span className="text-xs text-slate-500">Bathrooms</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-1">
                <Maximize2 className="w-5 h-5" />
              </div>
              <span className="text-base font-bold text-slate-900">{property.sizeSqm} m²</span>
              <span className="text-xs text-slate-500">Living Area</span>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-3">
            <h2 className="text-lg font-bold text-slate-900">About this Property</h2>
            <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {property.description}
            </div>
          </div>

          {/* Amenities Grid */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Amenities & Features</h2>
            {property.amenities && property.amenities.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {property.amenities.map((amenity, idx) => (
                  <div key={idx} className="flex items-center space-x-2 text-xs text-slate-700">
                    <CheckCircle className="w-4 h-4 text-teal-600 flex-shrink-0" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">Standard residential utilities included.</p>
            )}
          </div>

          {/* Owner Information Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-800 font-bold text-sm flex items-center justify-center overflow-hidden border border-teal-200">
                {property.owner?.avatarUrl ? (
                  <img
                    src={property.owner.avatarUrl}
                    alt={property.owner.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  property.owner?.name?.charAt(0).toUpperCase() || 'O'
                )}
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500">Listed by Property Owner</p>
                <h3 className="text-base font-bold text-slate-900">{property.owner?.name}</h3>
                <p className="text-[11px] text-slate-500">
                  Member since {formatDate(property.owner?.createdAt)}
                </p>
              </div>
            </div>

            {isAuthenticated && !isOwnerOfProperty && (
              <Button
                variant="outline"
                size="sm"
                icon={MessageSquare}
                onClick={() => setMessageModalOpen(true)}
              >
                Inquire
              </Button>
            )}
          </div>
        </div>

        {/* Right Column: Pricing & Booking Action Card */}
        <div className="space-y-6">
          <div className="sticky top-24 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-md space-y-6">
            <div>
              <span className="text-xs font-semibold text-slate-500">Monthly Rent</span>
              <div className="mt-1 flex items-baseline space-x-2">
                <span className="text-3xl font-extrabold text-teal-700">
                  {formatIDR(property.monthlyRent)}
                </span>
                <span className="text-xs text-slate-500">/ bulan</span>
              </div>
            </div>

            {/* Availability Alert */}
            {!isAvailable ? (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                This property is currently <strong>{property.availabilityStatus}</strong> and not
                accepting new booking applications.
              </div>
            ) : isOwnerOfProperty ? (
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs">
                You are the registered owner of this property. Manage this listing in your owner dashboard.
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-xs">
                Verified Indonesian rental listing. Submit your booking request for landlord approval.
              </div>
            )}

            {/* CTA Buttons */}
            <div className="space-y-3">
              {isAvailable && !isOwnerOfProperty && (
                <Button
                  size="lg"
                  className="w-full font-bold shadow-md shadow-teal-600/20"
                  icon={Calendar}
                  onClick={() => {
                    if (!isAuthenticated) {
                      toast.error('Please log in to submit a rental booking request');
                      navigate('/login', { state: { from: window.location.pathname } });
                      return;
                    }
                    if (!isTenant) {
                      toast.error('Only registered tenants can book rental properties');
                      return;
                    }
                    setBookingModalOpen(true);
                  }}
                >
                  Request to Rent
                </Button>
              )}

              {!isOwnerOfProperty && (
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full font-semibold"
                  icon={MessageSquare}
                  onClick={() => {
                    if (!isAuthenticated) {
                      toast.error('Please log in to contact the property owner');
                      navigate('/login');
                      return;
                    }
                    setMessageModalOpen(true);
                  }}
                >
                  Contact Landlord
                </Button>
              )}
            </div>

            {/* Trust Badges */}
            <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-500">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-teal-600 flex-shrink-0" />
                <span>Transparent landlord communication</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-teal-600 flex-shrink-0" />
                <span>Zero hidden booking commission fees</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Properties Section */}
      {property.similarProperties && property.similarProperties.length > 0 && (
        <div className="pt-10 border-t border-slate-200 space-y-6">
          <h2 className="text-xl font-bold text-slate-900">Similar Properties in {property.city}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {property.similarProperties.map((simProp) => (
              <PropertyCard key={simProp._id} property={simProp} />
            ))}
          </div>
        </div>
      )}

      {/* Booking Modal */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        property={property}
        onSuccess={() => {
          navigate('/tenant/bookings');
        }}
      />

      {/* Message Modal */}
      <MessageModal
        isOpen={messageModalOpen}
        onClose={() => setMessageModalOpen(false)}
        property={property}
      />
    </div>
  );
};
