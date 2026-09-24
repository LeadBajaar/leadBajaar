import api from './client';

export const tutorialApi = {
  getTutorials: async (): Promise<any> => {
    const response = await api.get('/tutorials');
    return response.data;
  },
  createTutorial: async (data: Record<string, unknown>): Promise<any> => {
    const response = await api.post('/tutorials', data);
    return response.data;
  },
  updateTutorial: async (id: number, data: Record<string, unknown>): Promise<any> => {
    const response = await api.put(`/tutorials/${id}`, data);
    return response.data;
  },
  deleteTutorial: async (id: number): Promise<any> => {
    const response = await api.delete(`/tutorials/${id}`);
    return response.data;
  }
};
