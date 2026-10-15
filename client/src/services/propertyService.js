import api from './api';

export const propertyService = {
  async getProperties(params = {}) {
    return api.get('/properties', { params });
  },

  async getPropertyById(id) {
    return api.get(`/properties/${id}`);
  },

  async createProperty(propertyData) {
    return api.post('/properties', propertyData);
  },

  async updateProperty(id, propertyData) {
    return api.patch(`/properties/${id}`, propertyData);
  },

  async deleteProperty(id) {
    return api.delete(`/properties/${id}`);
  },

  async getMyListings() {
    return api.get('/properties/my/listings');
  },

  async uploadImages(formData) {
    return api.post('/properties/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};
