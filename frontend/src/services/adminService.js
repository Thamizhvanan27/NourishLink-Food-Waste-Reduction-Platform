import api from './api';

export const adminService = {
  getDashboard: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  getUsers: async (params = {}) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  blockUser: async (userId) => {
    const response = await api.put(`/admin/users/${userId}/block`);
    return response.data;
  },

  unblockUser: async (userId) => {
    const response = await api.put(`/admin/users/${userId}/unblock`);
    return response.data;
  },

  getNgos: async (params = {}) => {
    const response = await api.get('/admin/ngos', { params });
    return response.data;
  },

  approveNgo: async (ngoId) => {
    const response = await api.put(`/admin/ngos/${ngoId}/approve`);
    return response.data;
  },

  rejectNgo: async (ngoId) => {
    const response = await api.put(`/admin/ngos/${ngoId}/reject`);
    return response.data;
  },

  getAllDonations: async (params = {}) => {
    const response = await api.get('/admin/donations', { params });
    return response.data;
  },

  deleteDonation: async (donationId) => {
    const response = await api.delete(`/admin/donations/${donationId}`);
    return response.data;
  },

  getAllRequests: async (params = {}) => {
    const response = await api.get('/admin/requests', { params });
    return response.data;
  }
};

export default adminService;
