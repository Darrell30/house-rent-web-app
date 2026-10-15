import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { propertyService } from '../../services/propertyService';
import { PropertyCard } from '../../components/property/PropertyCard';
import { PropertyFilters } from '../../components/property/PropertyFilters';
import { CardSkeleton } from '../../components/ui/CardSkeleton';
import { Pagination } from '../../components/common/Pagination';
import { EmptyState } from '../../components/ui/EmptyState';
import { Home } from 'lucide-react';

export const BrowsePropertiesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [properties, setProperties] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 12, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  // Initialize filters from URL parameters
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    city: searchParams.get('city') || '',
    propertyType: searchParams.get('propertyType') || '',
    minRent: searchParams.get('minRent') || '',
    maxRent: searchParams.get('maxRent') || '',
    bedrooms: searchParams.get('bedrooms') || '',
    furnishingStatus: searchParams.get('furnishingStatus') || '',
    amenities: searchParams.get('amenities') || '',
    sortBy: searchParams.get('sortBy') || 'newest',
    page: parseInt(searchParams.get('page') || '1', 10),
  });

  // Sync state with URL params when URL changes
  useEffect(() => {
    const params = Object.fromEntries(searchParams.entries());
    setFilters((prev) => ({
      ...prev,
      ...params,
      page: parseInt(params.page || '1', 10),
    }));
  }, [searchParams]);

  // Fetch properties from backend API
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const queryParams = { ...filters };
        // Clean empty keys
        Object.keys(queryParams).forEach((k) => {
          if (!queryParams[k]) delete queryParams[k];
        });

        const res = await propertyService.getProperties(queryParams);
        if (res.success) {
          setProperties(res.data || []);
          if (res.meta) setMeta(res.meta);
        }
      } catch (err) {
        console.error('Failed to load properties:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [filters]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    const query = {};
    Object.keys(newFilters).forEach((key) => {
      if (newFilters[key]) query[key] = newFilters[key];
    });
    setSearchParams(query);
  };

  const handleResetFilters = () => {
    const defaultFilters = {
      search: '',
      city: '',
      propertyType: '',
      minRent: '',
      maxRent: '',
      bedrooms: '',
      furnishingStatus: '',
      amenities: '',
      sortBy: 'newest',
      page: 1,
    };
    setFilters(defaultFilters);
    setSearchParams({});
  };

  const handlePageChange = (newPage) => {
    handleFilterChange({ ...filters, page: newPage });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Browse Rental Properties
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-600">
          Explore {meta.total} available rental properties across top cities in Indonesia
        </p>
      </div>

      {/* Filter Component */}
      <PropertyFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Results Section */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : properties.length > 0 ? (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {properties.map((property) => (
              <PropertyCard key={property._id} property={property} />
            ))}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={meta.page}
            totalPages={meta.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      ) : (
        <EmptyState
          icon={Home}
          title="No properties match your search"
          description="Try broadening your filters, choosing a different city, or resetting your price range."
          actionLabel="Reset All Filters"
          onAction={handleResetFilters}
        />
      )}
    </div>
  );
};
