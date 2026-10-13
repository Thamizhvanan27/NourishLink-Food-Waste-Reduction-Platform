import api from './api';

export const settingService = {
  getSettings: async () => {
    const response = await api.get('/admin/settings');
    return response.data;
  },

  updateSetting: async (key, value) => {
    const response = await api.put(`/admin/settings/${key}`, { value });
    return response.data;
  }
};

export default settingService;
