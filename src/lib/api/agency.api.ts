import api from './client';

export const agencyApi = {
  getClients: async (): Promise<any> => {
    try {
      const response = await api.get('/agency/clients');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch clients');
    }
  },

  onboardClient: async (data: Record<string, unknown>): Promise<any> => {
    try {
      const response = await api.post('/agency/onboard', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to onboard client');
    }
  },

  getStats: async (): Promise<any> => {
    try {
      const response = await api.get('/agency/stats');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch agency stats');
    }
  },

  loginAsClient: async (id: number): Promise<any> => {
    try {
      const response = await api.post(`/agency/clients/${id}/login`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to impersonate client');
    }
  },

  deleteClient: async (id: number): Promise<any> => {
    try {
      const response = await api.delete(`/agency/clients/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete client');
    }
  },

  renewClient: async (id: number): Promise<any> => {
    try {
      const response = await api.post(`/agency/clients/${id}/renew`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to renew client');
    }
  },

  getClientHistory: async (id: number): Promise<any> => {
    try {
      const response = await api.get(`/agency/clients/${id}/history`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch history');
    }
  }
};

export default api;
