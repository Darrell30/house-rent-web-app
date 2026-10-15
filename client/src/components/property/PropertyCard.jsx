import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin, Bed, Bath, Maximize2 } from 'lucide-react';
import { formatIDR } from '../../utils/formatters';
import { favoriteService } from '../../services/favoriteService';
import { useAuth } from '../../hooks/useAuth';
import { AVAILABILITY_STATUS_CONFIG } from '../../utils/constants';
import toast from 'react-hot-toast';

export const PropertyCard = ({ property, onFavoriteToggle }) => {
  const { isAuthenticated, isTenant } = useAuth();
  const [isFavorite, setIsFavorite] = useState(property.isFavorite || false);
  const [loadingFav, setLoadingFav] = useState(false);

  const primaryImage =
    property.images?.find((img) => img.isPrimary)?.url ||
    property.images?.[0]?.url ||
    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80';

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Please log in to save properties');
      return;
    }
    if (!isTenant) {
      toast.error('Only tenant accounts can save properties');
      return;
    }

    try {
      setLoadingFav(true);
      if (isFavorite) {
        await favoriteService.removeFavorite(property._id);
        setIsFavorite(false);
        toast.success('Removed from favorites');
        if (onFavoriteToggle) onFavoriteToggle(property._id, false);
      } else {
        await favoriteService.addFavorite(property._id);
        setIsFavorite(true);
        toast.success('Saved to favorites');
        if (onFavoriteToggle) onFavoriteToggle(property._id, true);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update favorite');
    } finally {
      setLoadingFav(false);
    }
  };

  const statusConfig = AVAILABILITY_STATUS_CONFIG[property.availabilityStatus] || AVAILABILITY_STATUS_CONFIG.available;

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col h-full">
      {/* Property Image & Overlays */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        <img
          src={primaryImage}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Status Badge */}
        <div className="absolute top-3 left-3 flex items-center space-x-1.5">
          <span
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold border backdrop-blur-md shadow-sm ${statusConfig.color}`}
          >
            {statusConfig.label}
          </span>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-900/80 text-white backdrop-blur-md">
            {property.propertyType}
          </span>
        </div>

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          disabled={loadingFav}
          className={`absolute top-3 right-3 p-2 rounded-full transition-all shadow-sm ${
            isFavorite
              ? 'bg-rose-50 text-rose-500 hover:bg-rose-100'
              : 'bg-white/90 text-slate-500 hover:text-rose-500 hover:bg-white'
          }`}
          aria-label={isFavorite ? 'Remove from saved' : 'Save property'}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Property Information */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Price */}
          <div className="flex items-baseline space-x-1">
            <span className="text-lg font-extrabold text-teal-700">
              {formatIDR(property.monthlyRent)}
            </span>
            <span className="text-xs text-slate-500">/ bulan</span>
          </div>

          {/* Title */}
          <Link to={`/properties/${property._id}`}>
            <h3 className="mt-1.5 text-sm font-bold text-slate-900 group-hover:text-teal-600 transition-colors line-clamp-1">
              {property.title}
            </h3>
          </Link>

          {/* Location */}
          <div className="mt-1 flex items-center text-xs text-slate-500">
            <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400 flex-shrink-0" />
            <span className="truncate">
              {property.city}, {property.province}
            </span>
          </div>
        </div>

        {/* Specifications & CTA */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1" title={`${property.bedrooms} Bedrooms`}>
              <Bed className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-medium">{property.bedrooms}</span>
            </div>
            <div className="flex items-center space-x-1" title={`${property.bathrooms} Bathrooms`}>
              <Bath className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-medium">{property.bathrooms}</span>
            </div>
            <div className="flex items-center space-x-1" title={`${property.sizeSqm} m² Size`}>
              <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-medium">{property.sizeSqm}m²</span>
            </div>
          </div>

          <Link
            to={`/properties/${property._id}`}
            className="text-xs font-semibold text-teal-600 hover:text-teal-700"
          >
            Details →
          </Link>
        </div>
      </div>
    </div>
  );
};
