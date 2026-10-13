import api from './api';

export const donorService = {
  getDashboard: async () => {
    const response = await api.get('/donors/dashboard');
    return response.data;
  }
};

export default donorService;
