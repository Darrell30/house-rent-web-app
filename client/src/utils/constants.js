export const PROPERTY_TYPES = [
  'Apartment',
  'House',
  'Studio',
  'Townhouse',
  'Villa',
  'Boarding House / Kost',
];

export const CITIES = [
  'Jakarta',
  'Tangerang',
  'BSD City',
  'Alam Sutera',
  'Bandung',
  'Surabaya',
  'Yogyakarta',
];

export const FURNISHING_OPTIONS = [
  { value: 'unfurnished', label: 'Unfurnished' },
  { value: 'semi-furnished', label: 'Semi-Furnished' },
  { value: 'fully-furnished', label: 'Fully Furnished' },
];

export const COMMON_AMENITIES = [
  'High-Speed WiFi',
  'AC',
  'Swimming Pool',
  '24/7 Security',
  'Covered Garage',
  'Carport',
  'Gym',
  'Water Heater',
  'Balcony',
  'Smart Door Lock',
  'Garden',
  'Bathtub',
  'Private Pool',
  'Daily Cleaning',
  'Direct Mall Access',
  'Jogging Track',
];

export const BOOKING_STATUS_CONFIG = {
  pending: {
    label: 'Pending Review',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
  },
  approved: {
    label: 'Approved',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
  },
  rejected: {
    label: 'Declined',
    color: 'bg-rose-50 text-rose-700 border-rose-200',
    dot: 'bg-rose-500',
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-slate-100 text-slate-600 border-slate-200',
    dot: 'bg-slate-400',
  },
};

export const AVAILABILITY_STATUS_CONFIG = {
  available: {
    label: 'Available',
    color: 'bg-teal-50 text-teal-700 border-teal-200',
    dot: 'bg-teal-500',
  },
  rented: {
    label: 'Rented',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    dot: 'bg-blue-500',
  },
  maintenance: {
    label: 'Maintenance',
    color: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-500',
  },
};
