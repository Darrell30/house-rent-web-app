import api from './api';

export const messageService = {
  async sendMessage(messageData) {
    return api.post('/messages', messageData);
  },

  async getConversation(propertyId, otherUserId) {
    return api.get(`/messages/${propertyId}/${otherUserId}`);
  },

  async getConversationsList() {
    return api.get('/messages/conversations');
  },
};
