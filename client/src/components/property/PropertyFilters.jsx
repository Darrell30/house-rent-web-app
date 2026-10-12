import React, { useState } from 'react';
import { Search, Filter, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { CITIES, PROPERTY_TYPES, FURNISHING_OPTIONS, COMMON_AMENITIES } from '../../utils/constants';
import { Button } from '../ui/Button';

export const PropertyFilters = ({ filters, onFilterChange, onReset }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleTextChange = (field, value) => {
    onFilterChange({ ...filters, [field]: value, page: 1 });
  };

  const handleAmenityToggle = (amenity) => {
    const currentAmenities = filters.amenities ? filters.amenities.split(',').filter(Boolean) : [];
    let updated;
    if (currentAmenities.includes(amenity)) {
      updated = currentAmenities.filter((a) => a !== amenity);
    } else {
      updated = [...currentAmenities, amenity];
    }
    onFilterChange({
      ...filters,
      amenities: updated.join(','),
      page: 1,
    });
  };

  const selectedAmenities = filters.amenities ? filters.amenities.split(',').filter(Boolean) : [];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
      {/* Top Bar: Keyword Search, City, Property Type */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={filters.search || ''}
            onChange={(e) => handleTextChange('search', e.target.value)}
            placeholder="Search keyword, title, area..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
          />
        </div>

        {/* City */}
        <div>
          <select
            value={filters.city || ''}
            onChange={(e) => handleTextChange('city', e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
          >
            <option value="">All Indonesian Cities</option>
            {CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Property Type */}
        <div>
          <select
            value={filters.propertyType || ''}
            onChange={(e) => handleTextChange('propertyType', e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
          >
            <option value="">All Property Types</option>
            {PROPERTY_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Sort By */}
        <div>
          <select
            value={filters.sortBy || 'newest'}
            onChange={(e) => handleTextChange('sortBy', e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
          >
            <option value="newest">Sort: Newest Listings</option>
            <option value="price_asc">Sort: Lowest Price</option>
            <option value="price_desc">Sort: Highest Price</option>
            <option value="size_desc">Sort: Largest Size</option>
          </select>
        </div>
      </div>

      {/* Advanced Toggle & Clear */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center space-x-1.5 font-semibold text-teal-600 hover:text-teal-700"
        >
          <Filter className="w-3.5 h-3.5" />
          <span>{showAdvanced ? 'Hide Advanced Filters' : 'Show Advanced Filters'}</span>
          {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        <button
          type="button"
          onClick={onReset}
          className="flex items-center space-x-1 text-slate-500 hover:text-slate-800"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Filters</span>
        </button>
      </div>

      {/* Advanced Filter Collapsible Section */}
      {showAdvanced && (
        <div className="pt-4 border-t border-slate-100 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Min Price */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Min Rent (IDR)
              </label>
              <input
                type="number"
                value={filters.minRent || ''}
                onChange={(e) => handleTextChange('minRent', e.target.value)}
                placeholder="e.g. 3000000"
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Max Price */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Max Rent (IDR)
              </label>
              <input
                type="number"
                value={filters.maxRent || ''}
                onChange={(e) => handleTextChange('maxRent', e.target.value)}
                placeholder="e.g. 25000000"
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Bedrooms */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Min Bedrooms
              </label>
              <select
                value={filters.bedrooms || ''}
                onChange={(e) => handleTextChange('bedrooms', e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
              >
                <option value="">Any</option>
                <option value="1">1+ Bedrooms</option>
                <option value="2">2+ Bedrooms</option>
                <option value="3">3+ Bedrooms</option>
                <option value="4">4+ Bedrooms</option>
              </select>
            </div>

            {/* Furnishing */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Furnishing
              </label>
              <select
                value={filters.furnishingStatus || ''}
                onChange={(e) => handleTextChange('furnishingStatus', e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
              >
                <option value="">Any Furnishing</option>
                {FURNISHING_OPTIONS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Amenities Multi-Select */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-2">
              Filter by Amenities
            </label>
            <div className="flex flex-wrap gap-2">
              {COMMON_AMENITIES.slice(0, 10).map((amenity) => {
                const isSelected = selectedAmenities.includes(amenity);
                return (
                  <button
                    type="button"
                    key={amenity}
                    onClick={() => handleAmenityToggle(amenity)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                      isSelected
                        ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {amenity}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
