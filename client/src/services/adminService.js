import api from './api';

export const adminService = {
  async getDashboard() {
    return api.get('/admin/dashboard');
  },

  async getUsers(params = {}) {
    return api.get('/admin/users', { params });
  },

  async updateUserApproval(id, status) {
    return api.patch(`/admin/users/${id}/approval`, { status });
  },

  async updateUserStatus(id, isActive) {
    return api.patch(`/admin/users/${id}/status`, { isActive });
  },

  async getProperties(params = {}) {
    return api.get('/admin/properties', { params });
  },

  async toggleArchiveProperty(id) {
    return api.patch(`/admin/properties/${id}/archive`);
  },

  async getBookings(params = {}) {
    return api.get('/admin/bookings', { params });
  },
};
