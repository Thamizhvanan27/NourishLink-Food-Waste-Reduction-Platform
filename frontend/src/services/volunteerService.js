import api from './api';

export const volunteerService = {
  registerVolunteer: async (data) => {
    const response = await api.post('/volunteers/register', data);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/volunteers/profile');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put('/volunteers/profile', data);
    return response.data;
  },

  getMyTasks: async (status = null) => {
    const params = status ? { status } : {};
    const response = await api.get('/volunteer/tasks', { params });
    return response.data;
  },

  getNearbyTasks: async (latitude, longitude, radius = 25) => {
    const response = await api.get('/volunteer/tasks/nearby', {
      params: { latitude, longitude, radius }
    });
    return response.data;
  },

  getTaskById: async (id) => {
    const response = await api.get(`/volunteer/tasks/${id}`);
    return response.data;
  },

  acceptTask: async (id) => {
    const response = await api.post(`/volunteer/tasks/${id}/accept`);
    return response.data;
  },

  pickupTask: async (id) => {
    const response = await api.put(`/volunteer/tasks/${id}/pickup`);
    return response.data;
  },

  deliverTask: async (id) => {
    const response = await api.put(`/volunteer/tasks/${id}/deliver`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/volunteer/tasks/stats');
    return response.data;
  }
};

export default volunteerService;
