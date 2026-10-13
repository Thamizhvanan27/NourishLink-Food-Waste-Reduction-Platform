import api from './api';

export const analyticsService = {
  getAdminAnalytics: async () => {
    const response = await api.get('/analytics/admin');
    return response.data;
  },

  getDonorAnalytics: async () => {
    const response = await api.get('/analytics/donor');
    return response.data;
  },

  getNgoAnalytics: async () => {
    const response = await api.get('/analytics/ngo');
    return response.data;
  }
};

export default analyticsService;
