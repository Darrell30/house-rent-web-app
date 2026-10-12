import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Building2,
  MapPin,
  DollarSign,
  Maximize2,
  CheckSquare,
  Image as ImageIcon,
  Plus,
  Trash2,
  Loader2,
} from 'lucide-react';
import { propertyService } from '../../services/propertyService';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import {
  CITIES,
  PROPERTY_TYPES,
  FURNISHING_OPTIONS,
  COMMON_AMENITIES,
} from '../../utils/constants';
import toast from 'react-hot-toast';

const propertySchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  propertyType: z.enum(PROPERTY_TYPES),
  address: z.string().min(5, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  province: z.string().min(2, 'Province is required'),
  postalCode: z.string().optional(),
  monthlyRent: z.coerce.number().positive('Monthly rent must be greater than 0'),
  currency: z.string().default('IDR'),
  bedrooms: z.coerce.number().int().min(0, 'Bedrooms cannot be negative'),
  bathrooms: z.coerce.number().int().min(0, 'Bathrooms cannot be negative'),
  sizeSqm: z.coerce.number().positive('Size must be at least 1 square meter'),
  furnishingStatus: z.enum(['unfurnished', 'semi-furnished', 'fully-furnished']),
  availabilityStatus: z.enum(['available', 'rented', 'maintenance']),
});

export const EditPropertyPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [images, setImages] = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(propertySchema),
  });

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        const res = await propertyService.getPropertyById(id);
        if (res.success && res.data) {
          const p = res.data;
          reset({
            title: p.title,
            description: p.description,
            propertyType: p.propertyType,
            address: p.address,
            city: p.city,
            province: p.province,
            postalCode: p.postalCode || '',
            monthlyRent: p.monthlyRent,
            currency: p.currency || 'IDR',
            bedrooms: p.bedrooms,
            bathrooms: p.bathrooms,
            sizeSqm: p.sizeSqm,
            furnishingStatus: p.furnishingStatus,
            availabilityStatus: p.availabilityStatus,
          });
          setImages(p.images || []);
          setSelectedAmenities(p.amenities || []);
        }
      } catch (err) {
        toast.error('Failed to load property details');
        navigate('/owner/properties');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id, reset, navigate]);

  const handleAmenityToggle = (amenity) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const handleAddImageField = () => {
    setImages((prev) => [
      ...prev,
      { url: '', caption: `Photo ${prev.length + 1}`, isPrimary: prev.length === 0 },
    ]);
  };

  const handleRemoveImage = (index) => {
    if (images.length <= 1) {
      toast.error('At least one image is required');
      return;
    }
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleImageChange = (index, field, value) => {
    setImages((prev) =>
      prev.map((img, i) => {
        if (i === index) return { ...img, [field]: value };
        if (field === 'isPrimary' && value === true) return { ...img, isPrimary: false };
        return img;
      })
    );
  };

  const onSubmit = async (data) => {
    const validImages = images.filter((img) => img.url.trim().length > 0);
    if (validImages.length === 0) {
      toast.error('At least one valid image URL is required');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...data,
        amenities: selectedAmenities,
        images: validImages,
      };

      const res = await propertyService.updateProperty(id, payload);
      if (res.success) {
        toast.success('Property updated successfully!');
        navigate('/owner/properties');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update property');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Edit Property Listing</h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-600">
          Update your property details, pricing, photos, or rental availability
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-teal-600" />
            <span>Basic Information</span>
          </h2>

          <Input
            label="Property Title *"
            error={errors.title?.message}
            {...register('title')}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Property Category *"
              options={PROPERTY_TYPES}
              error={errors.propertyType?.message}
              {...register('propertyType')}
            />

            <Select
              label="Furnishing Status *"
              options={FURNISHING_OPTIONS}
              error={errors.furnishingStatus?.message}
              {...register('furnishingStatus')}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Full Description *
            </label>
            <textarea
              rows="4"
              className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
              {...register('description')}
            />
            {errors.description && (
              <p className="mt-1 text-xs text-rose-600">{errors.description.message}</p>
            )}
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-teal-600" />
            <span>Location</span>
          </h2>

          <Input
            label="Street Address *"
            error={errors.address?.message}
            {...register('address')}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="City *"
              options={CITIES}
              error={errors.city?.message}
              {...register('city')}
            />

            <Input
              label="Province *"
              error={errors.province?.message}
              {...register('province')}
            />

            <Input
              label="Postal Code"
              error={errors.postalCode?.message}
              {...register('postalCode')}
            />
          </div>
        </div>

        {/* Pricing & Specifications */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-teal-600" />
            <span>Pricing & Specifications</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Monthly Rent (IDR) *"
              type="number"
              error={errors.monthlyRent?.message}
              {...register('monthlyRent')}
            />

            <Input
              label="Living Area (m²) *"
              type="number"
              error={errors.sizeSqm?.message}
              {...register('sizeSqm')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Bedrooms *"
              type="number"
              min="0"
              error={errors.bedrooms?.message}
              {...register('bedrooms')}
            />

            <Input
              label="Bathrooms *"
              type="number"
              min="0"
              error={errors.bathrooms?.message}
              {...register('bathrooms')}
            />

            <Select
              label="Availability Status"
              options={[
                { value: 'available', label: 'Available' },
                { value: 'rented', label: 'Rented' },
                { value: 'maintenance', label: 'Maintenance' },
              ]}
              error={errors.availabilityStatus?.message}
              {...register('availabilityStatus')}
            />
          </div>
        </div>

        {/* Amenities */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <CheckSquare className="w-4 h-4 text-teal-600" />
            <span>Amenities</span>
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {COMMON_AMENITIES.map((amenity) => {
              const isChecked = selectedAmenities.includes(amenity);
              return (
                <button
                  type="button"
                  key={amenity}
                  onClick={() => handleAmenityToggle(amenity)}
                  className={`p-2.5 rounded-xl border text-xs text-left font-medium transition-colors ${
                    isChecked
                      ? 'bg-teal-50 border-teal-600 text-teal-800'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {isChecked ? '✓ ' : '+ '} {amenity}
                </button>
              );
            })}
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <ImageIcon className="w-4 h-4 text-teal-600" />
            <span>Photos</span>
          </h2>

          <div className="space-y-3">
            {images.map((img, idx) => (
              <div
                key={idx}
                className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-200/60"
              >
                <div className="w-12 h-12 rounded-lg bg-slate-200 overflow-hidden flex-shrink-0">
                  {img.url ? (
                    <img src={img.url} alt="thumb" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                      No img
                    </div>
                  )}
                </div>

                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="url"
                    value={img.url}
                    onChange={(e) => handleImageChange(idx, 'url', e.target.value)}
                    className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
                  />
                  <input
                    type="text"
                    value={img.caption || ''}
                    onChange={(e) => handleImageChange(idx, 'caption', e.target.value)}
                    className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleImageChange(idx, 'isPrimary', true)}
                    className={`px-2 py-1 text-[11px] font-bold rounded-lg border ${
                      img.isPrimary
                        ? 'bg-teal-600 text-white border-teal-600'
                        : 'bg-white text-slate-500 border-slate-200'
                    }`}
                  >
                    {img.isPrimary ? 'Cover' : 'Set Cover'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="p-1 text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            icon={Plus}
            onClick={handleAddImageField}
          >
            Add Photo Slot
          </Button>
        </div>

        {/* Buttons */}
        <div className="pt-4 flex items-center justify-end space-x-3">
          <Button variant="ghost" onClick={() => navigate('/owner/properties')}>
            Cancel
          </Button>
          <Button type="submit" size="lg" loading={submitting}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};
