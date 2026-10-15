const Property = require('../models/Property');
const Booking = require('../models/Booking');
const Favorite = require('../models/Favorite');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// Get all properties with filtering, search, sorting, and pagination
const getProperties = async (req, res, next) => {
  try {
    const {
      search,
      city,
      minRent,
      maxRent,
      propertyType,
      bedrooms,
      bathrooms,
      furnishingStatus,
      amenities,
      availabilityStatus,
      sortBy = 'newest',
      page = 1,
      limit = 12,
    } = req.query;

    const query = { isArchived: false };

    // Default to available properties for public browsing unless explicitly requested
    if (availabilityStatus && availabilityStatus !== 'all') {
      query.availabilityStatus = availabilityStatus;
    } else if (!availabilityStatus) {
      query.availabilityStatus = 'available';
    }

    if (city) {
      query.city = { $regex: new RegExp(`^${city}$`, 'i') };
    }

    if (propertyType) {
      query.propertyType = propertyType;
    }

    if (furnishingStatus) {
      query.furnishingStatus = furnishingStatus;
    }

    if (bedrooms !== undefined && bedrooms !== '') {
      query.bedrooms = { $gte: Number(bedrooms) };
    }

    if (bathrooms !== undefined && bathrooms !== '') {
      query.bathrooms = { $gte: Number(bathrooms) };
    }

    if (minRent || maxRent) {
      query.monthlyRent = {};
      if (minRent) query.monthlyRent.$gte = Number(minRent);
      if (maxRent) query.monthlyRent.$lte = Number(maxRent);
    }

    if (amenities) {
      const amenitiesList = Array.isArray(amenities)
        ? amenities
        : amenities.split(',').map((a) => a.trim());
      if (amenitiesList.length > 0) {
        query.amenities = { $all: amenitiesList };
      }
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { city: searchRegex },
        { address: searchRegex },
      ];
    }

    // Sorting
    let sortOptions = { createdAt: -1 };
    if (sortBy === 'price_asc') {
      sortOptions = { monthlyRent: 1 };
    } else if (sortBy === 'price_desc') {
      sortOptions = { monthlyRent: -1 };
    } else if (sortBy === 'size_desc') {
      sortOptions = { sizeSqm: -1 };
    } else if (sortBy === 'oldest') {
      sortOptions = { createdAt: 1 };
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [properties, total] = await Promise.all([
      Property.find(query)
        .populate('owner', 'name avatarUrl phone email')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Property.countDocuments(query),
    ]);

    // Check favorites if user is authenticated
    let userFavorites = new Set();
    if (req.user) {
      const favs = await Favorite.find({
        user: req.user._id,
        property: { $in: properties.map((p) => p._id) },
      }).select('property');
      userFavorites = new Set(favs.map((f) => f.property.toString()));
    }

    const propertiesWithFav = properties.map((prop) => ({
      ...prop,
      isFavorite: userFavorites.has(prop._id.toString()),
    }));

    return successResponse(
      res,
      200,
      'Properties retrieved successfully',
      propertiesWithFav,
      {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      }
    );
  } catch (error) {
    next(error);
  }
};

// Get single property details
const getPropertyById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const property = await Property.findById(id).populate(
      'owner',
      'name avatarUrl phone email role createdAt'
    );

    if (!property || property.isArchived) {
      return errorResponse(res, 404, 'Property listing not found or has been removed');
    }

    let isFavorite = false;
    if (req.user) {
      const fav = await Favorite.findOne({
        user: req.user._id,
        property: property._id,
      });
      isFavorite = !!fav;
    }

    // Fetch up to 3 similar properties in the same city or same property type
    const similarProperties = await Property.find({
      _id: { $ne: property._id },
      isArchived: false,
      availabilityStatus: 'available',
      $or: [{ city: property.city }, { propertyType: property.propertyType }],
    })
      .limit(3)
      .lean();

    const responseData = {
      ...property.toObject(),
      isFavorite,
      similarProperties,
    };

    return successResponse(res, 200, 'Property details retrieved', responseData);
  } catch (error) {
    next(error);
  }
};

// Create a new property listing (Approved owners or Admins)
const createProperty = async (req, res, next) => {
  try {
    const propertyData = {
      ...req.body,
      owner: req.user._id,
    };

    const property = await Property.create(propertyData);

    return successResponse(res, 201, 'Property listed successfully', property);
  } catch (error) {
    next(error);
  }
};

// Update property listing
const updateProperty = async (req, res, next) => {
  try {
    const { id } = req.params;
    const property = await Property.findById(id);

    if (!property) {
      return errorResponse(res, 404, 'Property not found');
    }

    // Verify ownership
    const isOwner = property.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return errorResponse(res, 403, 'You do not have permission to edit this property');
    }

    // Disallow owner reassignment
    delete req.body.owner;

    Object.assign(property, req.body);
    await property.save();

    return successResponse(res, 200, 'Property updated successfully', property);
  } catch (error) {
    next(error);
  }
};

// Delete / Archive property listing
const deleteProperty = async (req, res, next) => {
  try {
    const { id } = req.params;
    const property = await Property.findById(id);

    if (!property) {
      return errorResponse(res, 404, 'Property not found');
    }

    const isOwner = property.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return errorResponse(res, 403, 'You do not have permission to delete this property');
    }

    // Implement soft-delete archive policy to preserve historical booking references
    property.isArchived = true;
    property.availabilityStatus = 'maintenance';
    await property.save();

    return successResponse(
      res,
      200,
      'Property has been successfully archived. Historical bookings are safely preserved.'
    );
  } catch (error) {
    next(error);
  }
};

// Get listings for current owner with booking metrics
const getMyListings = async (req, res, next) => {
  try {
    const properties = await Property.find({
      owner: req.user._id,
      isArchived: false,
    }).sort({ createdAt: -1 });

    // Fetch booking request counts for these properties
    const propertyIds = properties.map((p) => p._id);
    const bookings = await Booking.find({ property: { $in: propertyIds } }).lean();

    const bookingsByProperty = {};
    bookings.forEach((b) => {
      const pid = b.property.toString();
      if (!bookingsByProperty[pid]) {
        bookingsByProperty[pid] = { total: 0, pending: 0, approved: 0 };
      }
      bookingsByProperty[pid].total += 1;
      if (b.status === 'pending') bookingsByProperty[pid].pending += 1;
      if (b.status === 'approved') bookingsByProperty[pid].approved += 1;
    });

    const enrichedProperties = properties.map((p) => {
      const stats = bookingsByProperty[p._id.toString()] || {
        total: 0,
        pending: 0,
        approved: 0,
      };
      return {
        ...p.toObject(),
        bookingStats: stats,
      };
    });

    return successResponse(res, 200, 'My listings retrieved', enrichedProperties);
  } catch (error) {
    next(error);
  }
};

// Upload property images
const uploadImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return errorResponse(res, 400, 'No image files uploaded');
    }

    const uploadedImages = req.files.map((file, idx) => ({
      url: `/uploads/${file.filename}`,
      caption: file.originalname,
      isPrimary: idx === 0,
    }));

    return successResponse(res, 200, 'Images uploaded successfully', uploadedImages);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  getMyListings,
  uploadImages,
};
