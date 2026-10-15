import api from './api';

export const favoriteService = {
  async getFavorites() {
    return api.get('/favorites');
  },

  async addFavorite(propertyId) {
    return api.post('/favorites', { propertyId });
  },

  async removeFavorite(propertyId) {
    return api.delete(`/favorites/${propertyId}`);
  },
};
