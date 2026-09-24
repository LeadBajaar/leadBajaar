import api from './client';

export const getDashboardStats = async (): Promise<any> => {
  const response = await api.get('/dashboard/stats');
  return response.data;
};

export const getAnalyticsData = async (): Promise<any> => {
  const response = await api.get('/analytics');
  return response.data;
};

// ─────────────────────────────────────────────────────────────────────────────
// Finance Module API — Super Admin Only
// ─────────────────────────────────────────────────────────────────────────────
