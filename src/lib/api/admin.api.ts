import api from './client';

interface AdminUpdateUserDto {
  role?: string;
  status?: string;
  user_type?: 'agency' | 'individual' | 'super_admin';
  company_id?: number | null;
  tags?: string[];
}

export const adminApi = {
  getStats: async (): Promise<any> => {
    try {
      const response = await api.get('/admin/stats');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch admin stats');
    }
  },

  getCompanies: async (page = 1, limit = 10, search?: string, plan?: string, status?: string, tag?: string, expiration?: string, started?: string, expStart?: string, expEnd?: string, startStart?: string, startEnd?: string): Promise<any> => {
    try {
      let url = `/admin/companies?page=${page}&limit=${limit}`;
      if (search) url += `&search=${search}`;
      if (plan && plan !== 'all') url += `&plan=${plan}`;
      if (status && status !== 'all') url += `&status=${status}`;
      if (tag && tag !== 'all') url += `&tag=${tag}`;
      if (expiration && expiration !== 'all') url += `&expiration=${expiration}`;
      if (started && started !== 'all') url += `&started=${started}`;
      if (expStart) url += `&exp_start=${expStart}`;
      if (expEnd) url += `&exp_end=${expEnd}`;
      if (startStart) url += `&start_start=${startStart}`;
      if (startEnd) url += `&start_end=${startEnd}`;
      const response = await api.get(url);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch companies');
    }
  },

  updateCompany: async (id: number, data: { plan?: string; status?: string; expires_at?: string; subscription_started_at?: string; is_email_enabled?: boolean; custom_setup_fee?: number | null; custom_renewal_fee?: number | null }): Promise<any> => {
    try {
      const response = await api.patch(`/admin/companies/${id}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update company');
    }
  },

  getUsers: async (page = 1, limit = 10, search?: string, tag?: string, role?: string, status?: string, userType?: string): Promise<any> => {
    try {
      let url = `/admin/users?page=${page}&limit=${limit}`;
      if (search) url += `&search=${search}`;
      if (tag && tag !== 'all') url += `&tag=${tag}`;
      if (role && role !== 'all') url += `&role=${role}`;
      if (status && status !== 'all') url += `&status=${status}`;
      if (userType && userType !== 'all') url += `&user_type=${userType}`;
      const response = await api.get(url);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch users');
    }
  },

  updateUser: async (id: number, data: AdminUpdateUserDto): Promise<any> => {
    try {
      const response = await api.patch(`/admin/users/${id}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update user');
    }
  },

  getTesterRequests: async (page = 1, limit = 10, search?: string): Promise<any> => {
    try {
      let url = `/admin/tester-requests?page=${page}&limit=${limit}`;
      if (search) url += `&search=${search}`;
      const response = await api.get(url);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch tester requests');
    }
  },

  updateTesterRequestStatus: async (id: number | string, status: string): Promise<any> => {
    try {
      const response = await api.patch(`/admin/tester-requests/${id}/status`, { status });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update status');
    }
  },

  deleteUser: async (id: number): Promise<any> => {
    try {
      const response = await api.delete(`/admin/users/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete user');
    }
  },

  getEmailStats: async (search?: string, page = 1, limit = 10, filterStatus = 'all'): Promise<any> => {
    try {
      const response = await api.get('/admin/email-stats', { params: { search, page, limit, filterStatus } });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch email stats');
    }
  },

  toggleUserNotification: async (userId: number, type: string = 'new_lead'): Promise<any> => {
    try {
      const response = await api.post(`/admin/users/${userId}/toggle-notification`, { type });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to toggle notification');
    }
  },

  toggleCompanyEmail: async (id: number): Promise<any> => {
    try {
      const response = await api.post(`/admin/companies/${id}/toggle-email`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to toggle company email');
    }
  },

  deleteCompany: async (id: number): Promise<any> => {
    try {
      const response = await api.delete(`/admin/companies/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete company');
    }
  },

  renewCompany: async (id: number, days: number, notes?: string): Promise<any> => {
    try {
      const response = await api.post(`/admin/companies/${id}/renew`, { days, notes });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to renew company');
    }
  },

  getCompanyHistory: async (id: number): Promise<any> => {
    try {
      const response = await api.get(`/admin/companies/${id}/history`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch subscription history');
    }
  },

  loginAsAnyUser: async (id: number): Promise<any> => {
    try {
      const response = await api.post(`/admin/users/${id}/login`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to impersonate user');
    }
  },

  getBilling: async (page = 1, limit = 10, search?: string): Promise<any> => {
    try {
      const url = `/admin/billing?page=${page}&limit=${limit}${search ? `&search=${search}` : ''}`;
      const response = await api.get(url);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch billing data');
    }
  },

  getPendingPayments: async (page = 1, limit = 10): Promise<any> => {
    try {
      const url = `/admin/payments/pending?page=${page}&limit=${limit}`;
      const response = await api.get(url);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch pending payments');
    }
  },

  approvePayment: async (id: number): Promise<any> => {
    try {
      const response = await api.post(`/admin/payments/${id}/approve`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to approve payment');
    }
  },

  getPlans: async (): Promise<any> => {
    try {
      const response = await api.get('/admin/plans');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch plans');
    }
  },

  createPlan: async (data: Record<string, unknown>): Promise<any> => {
    try {
      const response = await api.post('/admin/plans', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create plan');
    }
  },

  updatePlan: async (id: number, data: Record<string, unknown>): Promise<any> => {
    try {
      const response = await api.patch(`/admin/plans/${id}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update plan');
    }
  },

  getTags: async (): Promise<any> => {
    try {
      const response = await api.get('/admin/tags');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch tags');
    }
  },

  sendBroadcast: async (data: {
    title: string;
    message: string;
    type: 'info' | 'warning' | 'success';
    category?: string;
    target: 'all' | 'company';
    image_url?: string;
    company_id?: number;
    company_ids?: number[];
    is_modal?: boolean;
    frequency?: 'once' | 'session' | 'always';
    cta_text?: string;
    cta_link?: string;
    expires_at?: string;
  }): Promise<any> => {
    try {
      const response = await api.post('/admin/broadcast', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to send broadcast');
    }
  },

  toggleBroadcastStatus: async (id: number): Promise<any> => {
    try {
      const response = await api.post(`/admin/broadcast/${id}/toggle-status`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to toggle broadcast status');
    }
  },

  getBroadcastHistory: async (): Promise<any> => {
    try {
      const response = await api.get('/admin/broadcast/history');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch broadcast history');
    }
  },

  deleteBroadcast: async (id: number): Promise<any> => {
    try {
      const response = await api.delete(`/admin/broadcast/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete broadcast');
    }
  },

  snoozeNotification: async (id: number): Promise<any> => {
    try {
      const response = await api.post(`/notifications/${id}/snooze`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to snooze notification');
    }
  },

  // Coupons
  getCoupons: async (): Promise<any> => {
    try {
      const response = await api.get('/admin/payments/coupons');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch coupons');
    }
  },

  createCoupon: async (data: Record<string, unknown>): Promise<any> => {
    try {
      const response = await api.post('/admin/payments/coupons', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create coupon');
    }
  },

  updateCoupon: async (id: number, data: Record<string, unknown>): Promise<any> => {
    try {
      const response = await api.patch(`/admin/payments/coupons/${id}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update coupon');
    }
  },

  deleteCoupon: async (id: number): Promise<any> => {
    try {
      const response = await api.delete(`/admin/payments/coupons/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete coupon');
    }
  },

  // Settings
  getSettings: async (): Promise<any> => {
    try {
      const response = await api.get('/admin/payments/settings');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch settings');
    }
  },

  updateSettings: async (data: Record<string, unknown>): Promise<any> => {
    try {
      const response = await api.post('/admin/payments/settings', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update settings');
    }
  }
};

// Agency Management API
