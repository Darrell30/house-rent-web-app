const Favorite = require('../models/Favorite');
const Property = require('../models/Property');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// Get current user's favorite properties
const getFavorites = async (req, res, next) => {
  try {
    const favorites = await Favorite.find({ user: req.user._id })
      .populate({
        path: 'property',
        populate: { path: 'owner', select: 'name avatarUrl' },
      })
      .sort({ createdAt: -1 });

    // Filter out null or archived properties if any
    const validFavorites = favorites
      .filter((fav) => fav.property && !fav.property.isArchived)
      .map((fav) => fav.property);

    return successResponse(res, 200, 'Saved properties retrieved', validFavorites);
  } catch (error) {
    next(error);
  }
};

// Add property to favorites
const addFavorite = async (req, res, next) => {
  try {
    const { propertyId } = req.body;

    const property = await Property.findById(propertyId);
    if (!property || property.isArchived) {
      return errorResponse(res, 404, 'Property not found');
    }

    const favorite = await Favorite.findOneAndUpdate(
      { user: req.user._id, property: propertyId },
      { user: req.user._id, property: propertyId },
      { upsert: true, new: true }
    );

    return successResponse(res, 201, 'Property saved to favorites', favorite);
  } catch (error) {
    next(error);
  }
};

// Remove property from favorites
const removeFavorite = async (req, res, next) => {
  try {
    const { propertyId } = req.params;

    await Favorite.findOneAndDelete({
      user: req.user._id,
      property: propertyId,
    });

    return successResponse(res, 200, 'Property removed from favorites');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFavorites,
  addFavorite,
  removeFavorite,
};
