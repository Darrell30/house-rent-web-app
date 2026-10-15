const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },
    caption: {
      type: String,
      default: '',
    },
    isPrimary: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const propertySchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Property title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    propertyType: {
      type: String,
      required: [true, 'Property type is required'],
      enum: ['Apartment', 'House', 'Studio', 'Townhouse', 'Villa', 'Boarding House / Kost'],
      index: true,
    },
    address: {
      type: String,
      required: [true, 'Street address is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      index: true,
    },
    province: {
      type: String,
      required: [true, 'Province is required'],
      trim: true,
    },
    postalCode: {
      type: String,
      trim: true,
      default: '',
    },
    monthlyRent: {
      type: Number,
      required: [true, 'Monthly rent is required'],
      min: [0, 'Monthly rent cannot be negative'],
      index: true,
    },
    currency: {
      type: String,
      default: 'IDR',
      trim: true,
    },
    bedrooms: {
      type: Number,
      required: [true, 'Number of bedrooms is required'],
      min: [0, 'Bedrooms cannot be negative'],
      index: true,
    },
    bathrooms: {
      type: Number,
      required: [true, 'Number of bathrooms is required'],
      min: [0, 'Bathrooms cannot be negative'],
      index: true,
    },
    sizeSqm: {
      type: Number,
      required: [true, 'Size in square meters is required'],
      min: [1, 'Size must be at least 1 square meter'],
    },
    furnishingStatus: {
      type: String,
      required: [true, 'Furnishing status is required'],
      enum: ['unfurnished', 'semi-furnished', 'fully-furnished'],
      index: true,
    },
    amenities: {
      type: [String],
      default: [],
    },
    images: {
      type: [imageSchema],
      default: [],
      validate: [
        {
          validator: function (images) {
            return images.length > 0;
          },
          message: 'At least one property image is required',
        },
      ],
    },
    availabilityStatus: {
      type: String,
      enum: ['available', 'rented', 'maintenance'],
      default: 'available',
      index: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes for high performance compound filtering and text searching
propertySchema.index({ city: 1, monthlyRent: 1, availabilityStatus: 1, isArchived: 1 });
propertySchema.index({ propertyType: 1, availabilityStatus: 1 });
propertySchema.index({
  title: 'text',
  description: 'text',
  city: 'text',
  address: 'text',
});

const Property = mongoose.model('Property', propertySchema);
module.exports = Property;
