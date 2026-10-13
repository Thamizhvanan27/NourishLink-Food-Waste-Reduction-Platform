import api from './api';

export const donationService = {
  createDonation: async (donationData) => {
    const response = await api.post('/donations', donationData);
    return response.data;
  },

  getMyDonations: async (params = {}) => {
    const response = await api.get('/donations/my', { params });
    return response.data;
  },

  getAvailableDonations: async (params = {}) => {
    const response = await api.get('/donations/available', { params });
    return response.data;
  },

  getDonationById: async (id) => {
    const response = await api.get(`/donations/${id}`);
    return response.data;
  },

  updateDonation: async (id, updateData) => {
    const response = await api.put(`/donations/${id}`, updateData);
    return response.data;
  },

  deleteDonation: async (id) => {
    const response = await api.delete(`/donations/${id}`);
    return response.data;
  },

  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/donations/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  getNearbyDonations: async (params = {}) => {
    const response = await api.get('/donations/nearby', { params });
    return response.data;
  },

  searchDonations: async (params = {}) => {
    const response = await api.get('/donations/search', { params });
    return response.data;
  }
};

export default donationService;
