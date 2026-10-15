const { z } = require('zod');

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().email('Invalid email address').toLowerCase(),
    phone: z.string().optional().default(''),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters'),
    role: z.enum(['tenant', 'owner']).default('tenant'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

const loginSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
    confirmNewPassword: z.string().min(6, 'Confirm new password must be at least 6 characters'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "New passwords don't match",
    path: ['confirmNewPassword'],
  });

const profileUpdateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
  phone: z.string().max(20).optional(),
  avatarUrl: z.string().url().or(z.literal('')).optional(),
});

const propertyImageSchema = z.object({
  url: z.string().min(1, 'Image URL is required'),
  caption: z.string().optional().default(''),
  isPrimary: z.boolean().optional().default(false),
});

const propertyCreateSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  propertyType: z.enum(['Apartment', 'House', 'Studio', 'Townhouse', 'Villa', 'Boarding House / Kost']),
  address: z.string().min(5, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  province: z.string().min(2, 'Province is required'),
  postalCode: z.string().optional().default(''),
  monthlyRent: z.coerce.number().positive('Monthly rent must be greater than 0'),
  currency: z.string().default('IDR'),
  bedrooms: z.coerce.number().int().min(0, 'Bedrooms cannot be negative'),
  bathrooms: z.coerce.number().int().min(0, 'Bathrooms cannot be negative'),
  sizeSqm: z.coerce.number().positive('Size must be at least 1 square meter'),
  furnishingStatus: z.enum(['unfurnished', 'semi-furnished', 'fully-furnished']),
  amenities: z.array(z.string()).optional().default([]),
  images: z.array(propertyImageSchema).min(1, 'At least one property image is required'),
  availabilityStatus: z.enum(['available', 'rented', 'maintenance']).optional().default('available'),
});

const propertyUpdateSchema = propertyCreateSchema.partial();

const bookingCreateSchema = z.object({
  propertyId: z.string().min(1, 'Property ID is required'),
  moveInDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid move-in date format',
  }),
  moveOutDate: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: 'Invalid move-out date format',
    }),
  occupants: z.coerce.number().int().min(1, 'At least 1 occupant is required').default(1),
  message: z.string().max(1000).optional().default(''),
});

const bookingStatusSchema = z.object({
  status: z.enum(['approved', 'rejected'], {
    errorMap: () => ({ message: "Status must be 'approved' or 'rejected'" }),
  }),
  reason: z.string().optional(),
});

const adminUserApprovalSchema = z.object({
  status: z.enum(['approved', 'rejected'], {
    errorMap: () => ({ message: "Status must be 'approved' or 'rejected'" }),
  }),
});

const adminUserStatusSchema = z.object({
  isActive: z.boolean(),
});

const messageCreateSchema = z.object({
  propertyId: z.string().min(1, 'Property ID is required'),
  recipientId: z.string().min(1, 'Recipient ID is required'),
  content: z.string().min(1, 'Message content cannot be empty').max(2000),
});

module.exports = {
  registerSchema,
  loginSchema,
  passwordChangeSchema,
  profileUpdateSchema,
  propertyCreateSchema,
  propertyUpdateSchema,
  bookingCreateSchema,
  bookingStatusSchema,
  adminUserApprovalSchema,
  adminUserStatusSchema,
  messageCreateSchema,
};
