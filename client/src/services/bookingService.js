import api from './api';

export const bookingService = {
  async createBooking(bookingData) {
    return api.post('/bookings', bookingData);
  },

  async getMyBookings() {
    return api.get('/bookings/my');
  },

  async getOwnerBookings() {
    return api.get('/bookings/owner');
  },

  async getBookingById(id) {
    return api.get(`/bookings/${id}`);
  },

  async updateBookingStatus(id, status, reason = '') {
    return api.patch(`/bookings/${id}/status`, { status, reason });
  },

  async cancelBooking(id) {
    return api.patch(`/bookings/${id}/cancel`);
  },
};
