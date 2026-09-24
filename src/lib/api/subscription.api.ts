import api from './client';

export const subscriptionApi = {
  getSettings: async (): Promise<any> => {
    try {
      const response = await api.get('/subscription/settings');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch subscription settings');
    }
  },

  validateCoupon: async (couponCode: string): Promise<any> => {
    try {
      const response = await api.post('/subscription/validate-coupon', { coupon_code: couponCode });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to validate coupon');
    }
  },

  getInvoices: async (): Promise<any> => {
    try {
      const response = await api.get('/subscription/invoices');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch invoices');
    }
  }
};

