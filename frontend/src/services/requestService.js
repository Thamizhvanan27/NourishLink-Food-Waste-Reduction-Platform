import api from './api';

export const requestService = {
  createRequest: async (requestData) => {
    const response = await api.post('/donation-requests', requestData);
    return response.data;
  },

  getMyRequests: async (params = {}) => {
    const response = await api.get('/donation-requests/my', { params });
    return response.data;
  },

  getRequestsForDonor: async (params = {}) => {
    const response = await api.get('/donation-requests/donor', { params });
    return response.data;
  },

  acceptRequest: async (requestId) => {
    const response = await api.put(`/donation-requests/${requestId}/accept`);
    return response.data;
  },

  rejectRequest: async (requestId) => {
    const response = await api.put(`/donation-requests/${requestId}/reject`);
    return response.data;
  },

  cancelRequest: async (requestId) => {
    const response = await api.put(`/donation-requests/${requestId}/cancel`);
    return response.data;
  },

  pickupRequest: async (requestId) => {
    const response = await api.put(`/donation-requests/${requestId}/pickup`);
    return response.data;
  },

  completeRequest: async (requestId) => {
    const response = await api.put(`/donation-requests/${requestId}/complete`);
    return response.data;
  }
};

export default requestService;
