import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { propertyService } from '../../services/propertyService';
import { useAuth } from '../../hooks/useAuth';
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
  availabilityStatus: z.enum(['available', 'rented', 'maintenance']).default('available'),
});

export const AddPropertyPage = () => {
  const { isApprovedOwner } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  // Dynamic image list
  const [images, setImages] = useState([
    {
      url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      caption: 'Front View',
      isPrimary: true,
    },
  ]);

  // Selected amenities array
  const [selectedAmenities, setSelectedAmenities] = useState([
    'High-Speed WiFi',
    'AC',
    '24/7 Security',
  ]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      title: '',
      description: '',
      propertyType: 'Apartment',
      address: '',
      city: 'Jakarta',
      province: 'DKI Jakarta',
      postalCode: '',
      monthlyRent: 12000000,
      currency: 'IDR',
      bedrooms: 2,
      bathrooms: 2,
      sizeSqm: 75,
      furnishingStatus: 'fully-furnished',
      availabilityStatus: 'available',
    },
  });

  const handleAmenityToggle = (amenity) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const handleAddImageField = () => {
    setImages((prev) => [
      ...prev,
      {
        url: '',
        caption: `Photo ${prev.length + 1}`,
        isPrimary: prev.length === 0,
      },
    ]);
  };

  const handleRemoveImage = (index) => {
    if (images.length <= 1) {
      toast.error('Listing requires at least one photo');
      return;
    }
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleImageChange = (index, field, value) => {
    setImages((prev) =>
      prev.map((img, i) => {
        if (i === index) {
          return { ...img, [field]: value };
        }
        if (field === 'isPrimary' && value === true) {
          return { ...img, isPrimary: false };
        }
        return img;
      })
    );
  };

  const setSampleImages = () => {
    setImages([
      {
        url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
        caption: 'Exterior Facade',
        isPrimary: true,
      },
      {
        url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
        caption: 'Spacious Living Room',
        isPrimary: false,
      },
      {
        url: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80',
        caption: 'Modern Kitchen & Dining',
        isPrimary: false,
      },
    ]);
    toast.success('Sample high-resolution images loaded!');
  };

  const onSubmit = async (data) => {
    if (!isApprovedOwner) {
      toast.error('Your owner account is pending admin approval and cannot list properties');
      return;
    }

    const validImages = images.filter((img) => img.url.trim().length > 0);
    if (validImages.length === 0) {
      toast.error('Please provide at least one valid image URL');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...data,
        amenities: selectedAmenities,
        images: validImages,
      };

      const res = await propertyService.createProperty(payload);
      if (res.success) {
        toast.success('Property listing published successfully!');
        navigate('/owner/properties');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create property listing');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Add New Property Listing</h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-600">
          Provide complete specifications and photos to attract qualified tenants across Indonesia
        </p>
      </div>

      {!isApprovedOwner && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center space-x-3 text-amber-800 text-xs">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <span>
            <strong>Action Restricted:</strong> Your landlord account is awaiting admin approval.
            You can review the listing form, but publishing will be enabled once approved.
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Section 1: Basic Information */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-teal-600" />
            <span>Basic Information</span>
          </h2>

          <Input
            label="Property Title *"
            placeholder="e.g. Modern Minimalist 2BR Apartment in SCBD"
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
              Full Property Description *
            </label>
            <textarea
              rows="4"
              placeholder="Highlight special features, natural light, security, nearby transit, malls, and schools..."
              className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
              {...register('description')}
            />
            {errors.description && (
              <p className="mt-1 text-xs text-rose-600">{errors.description.message}</p>
            )}
          </div>
        </div>

        {/* Section 2: Location */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-teal-600" />
            <span>Location in Indonesia</span>
          </h2>

          <Input
            label="Street Address *"
            placeholder="e.g. Jl. Senopati No. 28, Kebayoran Baru"
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
              placeholder="e.g. DKI Jakarta"
              error={errors.province?.message}
              {...register('province')}
            />

            <Input
              label="Postal Code"
              placeholder="e.g. 12190"
              error={errors.postalCode?.message}
              {...register('postalCode')}
            />
          </div>
        </div>

        {/* Section 3: Pricing & Specifications */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-teal-600" />
            <span>Pricing & Physical Specifications</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Monthly Rent (IDR) *"
              type="number"
              placeholder="e.g. 15000000"
              error={errors.monthlyRent?.message}
              {...register('monthlyRent')}
            />

            <Input
              label="Living Area Size (m²) *"
              type="number"
              placeholder="e.g. 85"
              error={errors.sizeSqm?.message}
              {...register('sizeSqm')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Number of Bedrooms *"
              type="number"
              min="0"
              error={errors.bedrooms?.message}
              {...register('bedrooms')}
            />

            <Input
              label="Number of Bathrooms *"
              type="number"
              min="0"
              error={errors.bathrooms?.message}
              {...register('bathrooms')}
            />

            <Select
              label="Availability Status"
              options={[
                { value: 'available', label: 'Available for Rent' },
                { value: 'rented', label: 'Already Rented' },
                { value: 'maintenance', label: 'Under Maintenance' },
              ]}
              error={errors.availabilityStatus?.message}
              {...register('availabilityStatus')}
            />
          </div>
        </div>

        {/* Section 4: Amenities Multi-Select */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <CheckSquare className="w-4 h-4 text-teal-600" />
            <span>Included Amenities</span>
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

        {/* Section 5: Property Images */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <ImageIcon className="w-4 h-4 text-teal-600" />
              <span>Property Photos</span>
            </h2>

            <button
              type="button"
              onClick={setSampleImages}
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center space-x-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Fill Sample Photos</span>
            </button>
          </div>

          <div className="space-y-3">
            {images.map((img, idx) => (
              <div
                key={idx}
                className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-200/60"
              >
                <div className="w-12 h-12 rounded-lg bg-slate-200 overflow-hidden flex-shrink-0">
                  {img.url ? (
                    <img src={img.url} alt="preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                      No img
                    </div>
                  )}
                </div>

                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={img.url}
                    onChange={(e) => handleImageChange(idx, 'url', e.target.value)}
                    className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Caption (e.g. Master Bedroom)"
                    value={img.caption}
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
                        : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-100'
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

        {/* Submit Bar */}
        <div className="pt-4 flex items-center justify-end space-x-3">
          <Button variant="ghost" onClick={() => navigate('/owner/properties')}>
            Cancel
          </Button>
          <Button type="submit" size="lg" loading={submitting}>
            Publish Listing
          </Button>
        </div>
      </form>
    </div>
  );
};
