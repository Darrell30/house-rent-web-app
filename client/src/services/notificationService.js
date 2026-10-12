import api from './api';

export const notificationService = {
  async getNotifications() {
    return api.get('/notifications');
  },

  async markAsRead(id) {
    return api.patch(`/notifications/${id}/read`);
  },

  async markAllAsRead() {
    return api.patch('/notifications/read-all');
  },
};
