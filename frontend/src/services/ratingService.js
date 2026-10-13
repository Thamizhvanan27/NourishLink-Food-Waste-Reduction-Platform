import api from './api';

export const ratingService = {
  createRating: async (data) => {
    // data: { donationId, rating, feedback }
    const response = await api.post('/ratings', data);
    return response.data;
  },

  getDonationRatings: async (donationId) => {
    const response = await api.get(`/ratings/donation/${donationId}`);
    return response.data;
  },

  getUserRatings: async (userId) => {
    const response = await api.get(`/ratings/user/${userId}`);
    return response.data;
  },

  getUserSummary: async (userId) => {
    const response = await api.get(`/ratings/user/${userId}/summary`);
    return response.data;
  },

  getMyRatings: async () => {
    const response = await api.get('/ratings/my');
    return response.data;
  }
};

export default ratingService;
