import api, { setAuthToken } from './api';

export const authService = {
  async register(userData) {
    const response = await api.post('/auth/register', userData);
    if (response.data?.token) {
      setAuthToken(response.data.token);
    }
    return response;
  },

  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    if (response.data?.token) {
      setAuthToken(response.data.token);
    }
    return response;
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } finally {
      setAuthToken(null);
    }
  },

  async getMe() {
    return api.get('/auth/me');
  },

  async changePassword(passwordData) {
    return api.patch('/auth/password', passwordData);
  },

  async updateProfile(profileData) {
    return api.patch('/users/me', profileData);
  },
};
