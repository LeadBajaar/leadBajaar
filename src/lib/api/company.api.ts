import api from './client';

export const companyApi = {
  getSettings: async (): Promise<any> => {
    try {
      const response = await api.get('/company/settings');
      return response.data.settings;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch company settings';
      throw new Error(message);
    }
  },

  updateSettings: async (settings: Record<string, unknown>): Promise<any> => {
    try {
      const response = await api.patch('/company/settings', settings);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update company settings';
      throw new Error(message);
    }
  }
};


// Add export functions
