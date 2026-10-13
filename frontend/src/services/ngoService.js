import api from './api';

export const ngoService = {
  getProfile: async () => {
    const response = await api.get('/ngos/profile');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/ngos/profile', profileData);
    return response.data;
  },

  getDashboard: async () => {
    const response = await api.get('/ngos/dashboard');
    return response.data;
  }
};

export default ngoService;
