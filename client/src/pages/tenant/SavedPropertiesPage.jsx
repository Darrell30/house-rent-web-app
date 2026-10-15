import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { favoriteService } from '../../services/favoriteService';
import { PropertyCard } from '../../components/property/PropertyCard';
import { CardSkeleton } from '../../components/ui/CardSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';

export const SavedPropertiesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setLoading(true);
        const res = await favoriteService.getFavorites();
        if (res.success) {
          setFavorites(res.data || []);
        }
      } catch (err) {
        toast.error(err.message || 'Failed to load saved properties');
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  const handleFavoriteToggle = (propertyId, isFav) => {
    if (!isFav) {
      setFavorites((prev) => prev.filter((p) => p._id !== propertyId));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Saved Properties</h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-600">
          Your personal watchlist of rental homes and apartments across Indonesia
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : favorites.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favorites.map((prop) => (
            <PropertyCard
              key={prop._id}
              property={{ ...prop, isFavorite: true }}
              onFavoriteToggle={handleFavoriteToggle}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Heart}
          title="No saved properties yet"
          description="Browse available properties and tap the heart icon on any card to save it for quick review."
          actionLabel="Explore Properties"
          onAction={() => (window.location.href = '/properties')}
        />
      )}
    </div>
  );
};
