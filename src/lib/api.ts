import axios, { AxiosError } from 'axios';
import { setSession, clearSession, getSession } from './auth';
import { parseError } from '@/utils/errorParser';
import { logger } from '@/utils/logger';

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
// export const API_BASE_URL = 'https://api.leadbajaar.com/api'
export const API_BASE_URL = 'http://localhost:8000/api'
// export const WHATSAPP_BASE_URL = 'http://localhost:3000/api'
export const WHATSAPP_BASE_URL = 'https://wp.leadbajaar.com/api'

// Export both httpClient and api
export const httpClient = {
  async get(url: string) {
    const response = await fetch(`${API_BASE_URL}${url}`)
    if (!response.ok) throw new Error('API Error')
    return response.json()
  },

  async post(url: string, data?: any) {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('API Error')
    return response.json()
  },

  async put(url: string, data?: any) {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('API Error')
    return response.json()
  },

  async delete(url: string) {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'DELETE',
    })
    if (!response.ok) throw new Error('API Error')
    return response.json()
  },
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

// Add request interceptor to include token in headers
api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('token') // or get from your auth system
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const parsedError = parseError(error);

    // Only log to console/logger if it's a server error or unexpected crash
    // 422 (Validation), 401 (Auth), and 402 (Payment) are handled by the UI
    if (!parsedError.status || parsedError.status >= 500) {
      logger.error("API Error", error, { hideConsole: true });
    }

    // Global session handling (401)
    if (parsedError.status === 401) {
      clearSession();
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        if (currentPath !== '/signin' && currentPath !== '/signup') {
          window.location.href = '/signin';
        }
      }
    }

    // Subscription Expired (402)
    if (parsedError.status === 402) {
      // The SubscriptionGuard will handle the UI overlay, 
      // but we can also trigger a toast or log here
      logger.warn("Subscription Expired", parsedError);
    }

    return Promise.reject(parsedError);
  }
);

interface LoginError {
  message: string;
  errors?: {
    [key: string]: string[];
  };
}

interface ErrorResponse {
  message?: string;
}

export const login = async (email: string, password: string) => {
  try {
    const response = await api.post('/login', { email, password });
    // Store the actual token from the response
    const token = response.data.token || response.data.access_token;
    if (!token) {
      throw new Error('No token received from server');
    }
    setSession(token);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<LoginError>;
      // Don't log the error to console for expected errors like invalid credentials
      if (axiosError.response?.status === 422) {
        throw new Error(axiosError.response.data.message || 'Invalid credentials');
      }
      if (axiosError.response?.data?.message) {
        throw new Error(axiosError.response.data.message);
      }
    }
    // Only log unexpected errors
    logger.error('Login Failed', error);
    throw error;
  }
};

export const register = async (name: string, email: string, password: string, password_confirmation: string, phone: string) => {
  try {
    const response = await api.post('/register', {
      name,
      email,
      password,
      password_confirmation,
      phone
    });
    setSession('your_auth_token');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const forgotPassword = async (email: string) => {
  try {
    const response = await api.post('/forgot-password', { email });
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || 'Failed to send reset link';
    throw new Error(message);
  }
};

export const resetPassword = async (token: string, email: string, password: string, password_confirmation: string) => {
  try {
    const response = await api.post('/reset-password', {
      token,
      email,
      password,
      password_confirmation
    });
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || 'Failed to reset password';
    throw new Error(message);
  }
};

export const logout = async () => {
  try {
    const session = await getSession();
    if (!session?.token) {
      clearSession();
      return true;
    }

    await api.post('/logout', {}, {
      headers: {
        Authorization: `Bearer ${session.token}`
      }
    });
    clearSession();
    return true;
  } catch (error) {
    clearSession(); // Clear session even if logout fails
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ErrorResponse>;
      if (axiosError.response?.data?.message) {
        throw new Error(axiosError.response.data.message);
      }
    }
    throw new Error('Logout failed');
  }
};

export const getUser = async () => {
  const response = await api.get('/user');
  return response.data;
};
export const submitTesterRequest = async (data: { name: string; email: string; phone: string }) => {
  const response = await api.post('/tester-requests', data);
  return response.data;
};

export const loginWithGoogle = async (token: string) => {
  const response = await api.post('/login/google', { token });
  setSession(token);
  return response.data;
};

// Update or add these interfaces
export interface CreateLeadDto {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  stage: string;
  status?: 'Hot' | 'Warm' | 'Cold';
  source?: string;
  city?: string;
  profession?: string;
  notes?: string;
}

export interface ImportLeadDto {
  leads: CreateLeadDto[];
}

// API functions

// Add these functions
export const createLead = async (data: CreateLeadDto) => {
  const response = await api.post('/leads', {
    ...data,
    stage: data.stage || 'New'
  });
  return response.data;
};

export const importLeads = async (data: ImportLeadDto) => {
  const response = await api.post('/leads/import', data);
  return response.data;
};

// Add these interfaces
export interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
  stage: string;
  status: 'Hot' | 'Warm' | 'Cold';
  source: string;
  city: string;
  profession: string;
  notes?: string;
  deal_value?: number;
  paid_amount?: number;
  last_contact: string;
  created_at: string;
  updated_at: string;
  user_id?: number | null;
  agent?: {
    id: number;
    name: string;
  } | null;
  new_note?: string;
}

export interface LeadsResponse {
  data: Lead[];
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
  };
}

// Add these API functions
interface GetLeadsParams {
  page?: number;
  search?: string;
  status?: string;
  stage?: string;
  source?: string;
  last_contact_from?: string;
  last_contact_to?: string;
  created_from?: string;
  created_to?: string;
  per_page?: number;
}

export const getLeads = async (params: GetLeadsParams) => {
  try {
    const response = await api.get('/leads', { params });

    // If the response is already in the correct format, return it
    if (response.data?.data && Array.isArray(response.data.data)) {
      return response.data;
    }

    // If we get an array directly, wrap it in the expected format
    if (Array.isArray(response.data)) {
      return {
        data: response.data,
        meta: {
          current_page: params.page || 1,
          from: 1,
          last_page: 1,
          per_page: response.data.length,
          to: response.data.length,
          total: response.data.length
        }
      };
    }

    // Return the response data as is
    return response.data;
  } catch (error: any) {
    logger.error('Error fetching leads', error);
    throw error;
  }
};

export const getLead = async (id: number) => {
  const response = await api.get<Lead>(`/leads/${id}`);
  return response.data;
};

export const deleteLead = async (id: number) => {
  await api.delete(`/leads/${id}`);
};

export const bulkDeleteLeads = async (ids: number[]) => {
  await api.post('/leads/bulk-destroy', { ids });
};

export const bulkUpdateLeadStatus = async (ids: number[], status: string) => {
  await api.post('/leads/bulk-update-status', { ids, status });
};

export const bulkUpdateLeadStage = async (ids: number[], stage: string) => {
  await api.post('/leads/bulk-update-stage', { ids, stage });
};

export const updateLead = async (id: number, data: Partial<Lead>) => {
  const response = await api.put<Lead>(`/leads/${id}`, data);
  return response.data;
};

export const updateLeadStage = async (id: number, stage: string, deal_value?: number) => {
  const response = await api.patch(`/leads/${id}/stage`, { stage, deal_value });
  return response.data;
};

export interface Stage {
  id: number;
  company_id: number;
  name: string;
  color: string;
  icon: string;
  order: number;
  created_at: string;
  updated_at: string;
}

export const getStages = async () => {
  const response = await api.get<Stage[]>('/stages');
  return response.data;
};

export const createStage = async (data: Partial<Stage>) => {
  const response = await api.post<Stage>('/stages', data);
  return response.data;
};

export const updateStage = async (id: number, data: Partial<Stage>) => {
  const response = await api.put<Stage>(`/stages/${id}`, data);
  return response.data;
};

export const deleteStage = async (id: number) => {
  await api.delete(`/stages/${id}`);
};

export const reorderStages = async (stages: { id: number; order: number }[]) => {
  await api.post('/stages/reorder', { stages });
};

export const syncDefaultStages = async () => {
  await api.post('/stages/initialize-default');
};

export const createPayment = async (data: {
  lead_id: number;
  amount: number;
  payment_method: string;
  status: string;
  payment_date: string;
}) => {
  const response = await api.post('/payments', data);
  return response.data;
};

export const updateLeadDetails = async (id: number, data: Partial<Lead>) => {
  const response = await api.put(`/leads/${id}`, data);
  return response.data;
};

// Types for API requests
export interface IntegrationConfig {
  type: string;
  config: Record<string, any>;
  isActive: boolean;
  environment: 'sandbox' | 'production';
}

const formatMetaErrorMessage = (error: any, defaultMessage: string): string => {
  try {
    const errorData = error.response?.data?.error || error.response?.data;

    if (errorData) {
      if (typeof errorData === 'object') {
        // Meta errors usually have message, code, or error_subcode
        // We stringify the whole object so the frontend formatMetaError can parse it
        return JSON.stringify(errorData);
      }
      return String(errorData);
    }

    return error.message || defaultMessage;
  } catch (e) {
    return error?.message || defaultMessage;
  }
};

// API functions for integrations
export const integrationApi = {
  // Get all integrations
  getIntegrations: async () => {
    try {
      const response = await api.get('/integrations');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch integrations';
      throw new Error(message);
    }
  },

  // Save integration configuration
  saveIntegration: async (config: IntegrationConfig) => {
    try {
      const response = await api.post('/integrations', config);
      return response.data;
    } catch (error: any) {
      // Enhanced error handling for validation errors
      if (error.response?.status === 422) {
        const validationErrors = error.response.data.errors;
        if (validationErrors && typeof validationErrors === 'object') {
          // Format validation errors into a readable message
          const errorMessages = Object.entries(validationErrors)
            .map(([field, messages]) => {
              const messageArray = Array.isArray(messages) ? messages : [messages];
              return `${field}: ${messageArray.join(', ')}`;
            })
            .join('; ');
          throw new Error(`Validation failed: ${errorMessages}`);
        }
        // If errors object is not in expected format, try to get message
        const message = error.response.data.message || 'Validation failed';
        throw new Error(message);
      }
      const message = error.response?.data?.message || 'Failed to save integration configuration';
      throw new Error(message);
    }
  },

  // Update integration configuration
  updateIntegration: async (id: string, config: IntegrationConfig) => {
    try {
      const response = await api.put(`/integrations/${id}`, config);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 422) {
        const validationErrors = error.response.data.errors;
        const message = validationErrors && typeof validationErrors === 'object'
          ? Object.entries(validationErrors).map(([f, m]) => `${f}: ${Array.isArray(m) ? m.join(', ') : m}`).join('; ')
          : error.response.data.message || 'Validation failed';
        throw new Error(message);
      }
      throw new Error(error.response?.data?.message || 'Failed to update integration');
    }
  },

  // Update integration status
  updateIntegrationStatus: async (id: string, isActive: boolean) => {
    try {
      const response = await api.patch(`/integrations/${id}/status`, { isActive });
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update integration status';
      throw new Error(message);
    }
  },

  // Get integration logs
  getIntegrationLogs: async (id: string) => {
    try {
      const response = await api.get(`/integrations/${id}/logs`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch integration logs';
      throw new Error(message);
    }
  },

  // Get the most recent log for an integration (used for testing webhooks)
  getLatestLog: async (id: string) => {
    try {
      const response = await api.get(`/integrations/${id}/latest-log`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch latest log';
      throw new Error(message);
    }
  },

  // Delete integration
  deleteIntegration: async (id: string) => {
    try {
      const response = await api.delete(`/integrations/${id}`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to delete integration';
      throw new Error(message);
    }
  },

  getWhatsAppProfiles: async () => {
    try {
      const response = await api.get('/integrations/whatsapp/profiles');
      return response.data.profiles;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch WhatsApp profiles';
      throw new Error(message);
    }
  },

  getWhatsAppAccounts: async () => {
    try {
      const response = await api.get('/integrations/whatsapp/accounts');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch WhatsApp accounts';
      throw new Error(message);
    }
  },

  getWhatsAppTemplates: async (accountId: number) => {
    try {
      const response = await api.get(`/integrations/whatsapp/${accountId}/templates`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch templates';
      throw new Error(message);
    }
  },

  syncWhatsAppTemplates: async (accountId: number) => {
    try {
      const response = await api.post(`/integrations/whatsapp/${accountId}/templates/sync`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to sync templates';
      throw new Error(message);
    }
  },





  createWhatsAppTemplate: async (accountId: number, templateData: any) => {
    try {
      const response = await api.post(`/integrations/whatsapp/${accountId}/templates`, templateData);
      return response.data;
    } catch (error: any) {
      // Enhanced error handling for validation errors
      if (error.response?.status === 422 && error.response?.data?.errors) {
        // Format validation errors
        const validationErrors = error.response.data.errors;
        const errorMessages = Object.entries(validationErrors)
          .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
          .join('; ');
        throw new Error(`Validation failed: ${errorMessages}`);
      } else if (error.response?.status === 401 && error.response?.data?.error_type === 'token_expired') {
        throw new Error('Your WhatsApp access token has expired. Please update your access token.');
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error('Failed to create template');
      }
    }
  },

  checkIntegrationStatus: async (accountId: number) => {
    try {
      const response = await api.get(`/integrations/whatsapp/${accountId}/status`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to check integration status';
      throw new Error(message);
    }
  },

  markReauthenticated: async (accountId: number) => {
    try {
      const response = await api.post(`/integrations/whatsapp/${accountId}/reauth`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to mark integration as re-authenticated';
      throw new Error(message);
    }
  },

  updateAccessToken: async (accountId: number, accessToken: string) => {
    try {
      const response = await api.post(`/integrations/whatsapp/${accountId}/update-token`, {
        access_token: accessToken
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 400 && error.response?.data?.error_type === 'invalid_token') {
        throw new Error('Invalid access token. Please check your token and try again.');
      }
      const message = error.response?.data?.message || 'Failed to update access token';
      throw new Error(message);
    }
  },



  updateWhatsAppTemplate: async (accountId: number, templateId: string, templateData: any) => {
    try {
      const response = await api.put(`/integrations/whatsapp/${accountId}/templates/${templateId}`, templateData);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update template';
      throw new Error(message);
    }
  },

  deleteWhatsAppTemplate: async (accountId: number, templateId: string) => {
    try {
      const response = await api.delete(`/integrations/whatsapp/${accountId}/templates/${templateId}`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to delete template';
      throw new Error(message);
    }
  },

  getWhatsAppTemplateDetails: async (accountId: number, templateId: string) => {
    try {
      const response = await api.get(`/integrations/whatsapp/${accountId}/templates/${templateId}/details`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to get template details';
      throw new Error(message);
    }
  },


  getConnectedIntegrations: async () => {
    try {
      const response = await api.get('/integrations/connected');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch connected integrations';
      throw new Error(message);
    }
  },

  // Add the sendBroadcast method
  sendBroadcast: async (data: {
    template_id: string;
    lead_ids: number[];
    variables: Record<string, string>;
    variable_column_mapping: Record<string, string>;
  }) => {
    const response = await api.post('/leads/send-template', data);
    return response.data;
  },

  // Facebook Lead Retrieval Methods
  getFacebookLeadForms: async () => {
    try {
      const response = await api.get('/facebook-lead-forms');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch Facebook lead forms';
      throw new Error(message);
    }
  },

  debugIntegrations: async () => {
    try {
      const response = await api.get('/debug-integrations');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to debug integrations';
      throw new Error(message);
    }
  },

  // New Meta API Methods (v25.0)
  getMetaPages: async () => {
    try {
      const response = await api.get('/meta/pages');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch Meta pages';
      throw new Error(message);
    }
  },

  getMetaPageForms: async (pageId: string) => {
    try {
      const response = await api.get(`/meta/pages/${pageId}/forms`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch Meta lead forms';
      throw new Error(message);
    }
  },

  // Meta Ads API Methods
  getMetaAdAccounts: async () => {
    try {
      const response = await api.get('/meta/ads/adaccounts');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch Meta ad accounts';
      throw new Error(message);
    }
  },

  getMetaBusinessAdAccounts: async (businessId: string) => {
    try {
      const response = await api.get(`/meta/ads/businesses/${businessId}/adaccounts`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch business ad accounts';
      throw new Error(message);
    }
  },

  getMetaCampaigns: async (adAccountId: string) => {
    try {
      const response = await api.get(`/meta/ads/adaccounts/${adAccountId}/campaigns`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch Meta campaigns';
      throw new Error(message);
    }
  },

  getMetaAdSets: async (campaignId: string) => {
    try {
      const response = await api.get(`/meta/ads/campaigns/${campaignId}/adsets`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch Meta ad sets';
      throw new Error(message);
    }
  },

  getMetaAds: async (adSetId: string) => {
    try {
      const response = await api.get(`/meta/ads/adsets/${adSetId}/ads`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch Meta ads';
      throw new Error(message);
    }
  },

  getMetaAdAccountInsights: async (adAccountId: string) => {
    try {
      const response = await api.get(`/meta/ads/adaccounts/${adAccountId}/insights`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch Meta ad insights';
      throw new Error(message);
    }
  },

  updateMetaStatus: async (objectId: string, status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED') => {
    try {
      const response = await api.post(`/meta/ads/${objectId}/status`, { status });
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to update Meta status';
      throw new Error(message);
    }
  },

  retrieveFacebookLeads: async (data: {
    form_id: string;
    integration_id: number;
    date_from?: string;
    date_to?: string;
  }) => {
    try {
      const response = await api.post('/facebook-lead-retrieval', data);
      return response.data;
    } catch (error: any) {
      // Enhanced error handling to preserve error details from backend
      if (error.response?.data) {
        // Create a new error with the backend's error details
        const backendError = new Error(error.response.data.error || 'Failed to retrieve Facebook leads');
        // Attach the response data to the error for the frontend to use
        (backendError as any).response = error.response;
        throw backendError;
      }
      throw new Error('Failed to retrieve Facebook leads');
    }
  },

  connectMeta: async () => {
    try {
      const response = await api.get('/meta/connect');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to get Meta connection URL');
    }
  },

  getMetaStatus: async () => {
    try {
      const response = await api.get('/meta/status');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch Meta status');
    }
  },

  disconnectMeta: async () => {
    try {
      const response = await api.post('/meta/deauthorize'); // Now hits the authenticated route
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to disconnect Meta');
    }
  },

  dataDeletionRequest: async () => {
    try {
      const response = await api.post('/meta/data-deletion'); // Now hits the authenticated route
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to request data deletion');
    }
  },

  getDeletionRequests: async () => {
    try {
      const response = await api.get('/meta/deletion-requests');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch deletion requests');
    }
  },

  getMetaBusinessAssets: async (businessId: string) => {
    try {
      const response = await api.get(`/meta/business/${businessId}/assets`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch business assets');
    }
  },

  // Facebook Conversion API Methods
  sendConversionEvent: async (data: {
    pixel_id: string;
    event_name: string;
    event_data: any;
    user_data?: any;
    event_id?: string;
    integration_id?: number;
  }) => {
    try {
      const response = await api.post('/facebook/conversion-api/send-event', data);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to send conversion event';
      throw new Error(message);
    }
  },

  sendBatchConversionEvents: async (data: {
    pixel_id: string;
    events: Array<{
      event_name: string;
      event_data: any;
      user_data?: any;
    }>;
    integration_id?: number;
  }) => {
    try {
      const response = await api.post('/facebook/conversion-api/send-batch-events', data);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to send batch conversion events';
      throw new Error(message);
    }
  },

  sendTestConversionEvent: async (data: {
    pixel_id: string;
    test_event_code: string;
    event_name: string;
    event_data: any;
    user_data?: any;
    event_id?: string;
    integration_id?: number;
  }) => {
    try {
      const response = await api.post('/facebook/conversion-api/send-test-event', data);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to send test conversion event';
      throw new Error(message);
    }
  },

  getConversionApiEventTypes: async () => {
    try {
      const response = await api.get('/facebook/conversion-api/event-types');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch event types';
      throw new Error(message);
    }
  },

  getConversionApiConfiguration: async () => {
    try {
      const response = await api.get('/facebook/conversion-api/configuration');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch Conversion API configuration';
      throw new Error(message);
    }
  },

  getMetaWebhookChecklist: async (pageId: string) => {
    try {
      const response = await api.get(`/meta/pages/${pageId}/webhook-checklist`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch webhook checklist';
      throw new Error(message);
    }
  },

  testMetaLeadRetrieval: async (leadId: string) => {
    try {
      const response = await api.get(`/meta/debug/lead/${leadId}`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch lead details';
      throw new Error(message);
    }
  },

  updateConversionApiConfiguration: async (data: {
    integration_id: number;
    pixel_id: string;
    test_event_code?: string;
  }) => {
    try {
      const response = await api.post('/facebook/conversion-api/configuration', data);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to update Conversion API configuration';
      throw new Error(message);
    }
  },

  syncMetaLeads: async (formId: string, days: number = 7) => {
    try {
      const response = await api.post(`/meta/forms/${formId}/sync-leads`, { days });
      return response.data;
    } catch (error: any) {
      throw new Error(formatMetaErrorMessage(error, 'Failed to sync leads'));
    }
  },


  createMetaCampaign: async (adAccountId: string, data: { name: string; objective?: string; status?: string; special_ad_categories?: string[] }) => {
    try {
      const response = await api.post(`/meta/ads/adaccounts/${adAccountId}/campaigns`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(formatMetaErrorMessage(error, 'Failed to create Meta campaign'));
    }
  },

  createMetaAdSet: async (adAccountId: string, data: any) => {
    try {
      const response = await api.post(`/meta/ads/adaccounts/${adAccountId}/adsets`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(formatMetaErrorMessage(error, 'Failed to create Meta ad set'));
    }
  },

  updateMetaAdSet: async (adSetId: string, data: { daily_budget?: number; status?: string }) => {
    try {
      const response = await api.post(`/meta/ads/adsets/${adSetId}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(formatMetaErrorMessage(error, 'Failed to update Meta ad set'));
    }
  },

  createMetaAd: async (adAccountId: string, data: any) => {
    try {
      const response = await api.post(`/meta/ads/adaccounts/${adAccountId}/ads`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(formatMetaErrorMessage(error, 'Failed to create Meta ad'));
    }
  },

  getMetaAdCreatives: async (adAccountId: string) => {
    try {
      const response = await api.get(`/meta/ads/adaccounts/${adAccountId}/adcreatives`);
      return response.data;
    } catch (error: any) {
      throw new Error(formatMetaErrorMessage(error, 'Failed to fetch Meta ad creatives'));
    }
  },

  createMetaAdCreativeStandalone: async (adAccountId: string, data: any) => {
    try {
      const response = await api.post(`/meta/ads/adaccounts/${adAccountId}/adcreatives`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(formatMetaErrorMessage(error, 'Failed to create Meta ad creative'));
    }
  },

  createMetaPageForm: async (pageId: string, formData: { name: string; questions: any[]; privacy_policy?: any; follow_up_url?: string }) => {
    try {
      const response = await api.post(`/meta/pages/${pageId}/forms`, formData);
      return response.data;
    } catch (error: any) {
      throw new Error(formatMetaErrorMessage(error, 'Failed to create Meta Lead Form'));
    }
  },


  syncMetaAssets: async () => {
    try {
      const response = await api.post('/meta/ads/sync');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to sync Meta assets';
      throw new Error(message);
    }
  },

  syncMetaAdAccountDetails: async (adAccountId: string) => {
    try {
      const response = await api.post(`/meta/ads/adaccounts/${adAccountId}/sync`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to sync ad account details';
      throw new Error(message);
    }
  },

  subscribeMetaPage: async (pageId: string) => {
    try {
      const response = await api.post(`/meta/pages/${pageId}/subscribe`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to subscribe page to webhook';
      throw new Error(message);
    }
  },

  getMetaTemplates: async () => {
    try {
      const response = await api.get('/meta/ads/templates');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch Meta templates';
      throw new Error(message);
    }
  },

  launchMetaTemplate: async (adAccountId: string, templateId: number, customName?: string) => {
    try {
      const response = await api.post(`/meta/ads/adaccounts/${adAccountId}/launch-template`, { template_id: templateId, custom_name: customName });
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to launch Meta template';
      throw new Error(message);
    }
  },

  deleteMetaObject: async (objectId: string) => {
    try {
      const response = await api.delete(`/meta/ads/${objectId}`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to delete Meta object';
      throw new Error(message);
    }
  },

  updateMetaCampaign: async (campaignId: string, data: any) => {
    try {
      const response = await api.post(`/meta/ads/campaigns/${campaignId}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(formatMetaErrorMessage(error, 'Failed to update Meta campaign'));
    }
  },

  createMetaCustomAudience: async (adAccountId: string, data: { name: string; subtype?: string; description?: string }) => {
    try {
      const response = await api.post(`/meta/ads/adaccounts/${adAccountId}/customaudiences`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(formatMetaErrorMessage(error, 'Failed to create Meta custom audience'));
    }
  },

  createMetaLookalikeAudience: async (adAccountId: string, data: {
    name: string;
    origin_audience_id: string;
    country?: string;
    ratio?: number;
    lookalike_type?: 'similarity' | 'reach';
    description?: string;
  }) => {
    try {
      const response = await api.post(`/meta/ads/adaccounts/${adAccountId}/lookalike-audiences`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(formatMetaErrorMessage(error, 'Failed to create Meta lookalike audience'));
    }
  },

  uploadMetaAdImage: async (adAccountId: string, image: File | string) => {
    try {
      let response;
      if (typeof image === 'string') {
        response = await api.post(`/meta/ads/adaccounts/${adAccountId}/adimages`, { image_url: image });
      } else {
        const formData = new FormData();
        formData.append('image', image);
        response = await api.post(`/meta/ads/adaccounts/${adAccountId}/adimages`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      return response.data;
    } catch (error: any) {
      throw new Error(formatMetaErrorMessage(error, 'Failed to upload Meta ad image'));
    }
  },

  uploadMetaAdVideo: async (adAccountId: string, video: File | string, title?: string) => {
    try {
      let response;
      if (typeof video === 'string') {
        response = await api.post(`/meta/ads/adaccounts/${adAccountId}/advideos`, { video_url: video, title });
      } else {
        const formData = new FormData();
        formData.append('video', video);
        if (title) formData.append('title', title);
        response = await api.post(`/meta/ads/adaccounts/${adAccountId}/advideos`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      return response.data;
    } catch (error: any) {
      throw new Error(formatMetaErrorMessage(error, 'Failed to upload Meta ad video'));
    }
  },

  getMetaAdPreview: async (objectId: string, adFormat: string = 'DESKTOP_FEED_STANDARD') => {
    try {
      const response = await api.get(`/meta/ads/previews/${objectId}`, {
        params: { ad_format: adFormat }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(formatMetaErrorMessage(error, 'Failed to fetch Meta ad preview'));
    }
  },

  duplicateMetaCampaign: async (campaignId: string, options?: { status?: 'PAUSED' | 'ACTIVE'; rename_suffix?: string }) => {
    try {
      const response = await api.post(`/meta/ads/campaigns/${campaignId}/duplicate`, options);
      return response.data;
    } catch (error: any) {
      throw new Error(formatMetaErrorMessage(error, 'Failed to duplicate Meta campaign'));
    }
  },

  duplicateMetaObject: async (objectId: string) => {
    try {
      const response = await api.post(`/meta/ads/${objectId}/duplicate`);
      return response.data;
    } catch (error: any) {
      throw new Error(formatMetaErrorMessage(error, 'Failed to duplicate Meta object'));
    }
  },

  getMetaOfflineEventSets: async (objectId: string) => {
    try {
      const response = await api.get(`/meta/ads/offline-event-sets/${objectId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(formatMetaErrorMessage(error, 'Failed to fetch offline event sets'));
    }
  },

  createMetaOfflineEventSet: async (businessId: string, data: { name: string; description?: string }) => {
    try {
      const response = await api.post(`/meta/ads/offline-event-sets/${businessId}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(formatMetaErrorMessage(error, 'Failed to create offline event set'));
    }
  },

  getMetaAutomatedRules: async (adAccountId: string) => {
    try {
      const response = await api.get(`/meta/ads/adaccounts/${adAccountId}/adrules`);
      return response.data;
    } catch (error: any) {
      throw new Error(formatMetaErrorMessage(error, 'Failed to fetch automated rules'));
    }
  },

  createMetaAutomatedRule: async (adAccountId: string, data: { name: string; filters?: any[]; execution_options?: any[] }) => {
    try {
      const response = await api.post(`/meta/ads/adaccounts/${adAccountId}/adrules`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(formatMetaErrorMessage(error, 'Failed to create automated rule'));
    }
  },

  deleteMetaAutomatedRule: async (ruleId: string) => {
    try {
      const response = await api.delete(`/meta/ads/adrules/${ruleId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(formatMetaErrorMessage(error, 'Failed to delete automated rule'));
    }
  },

  getMetaFormDetails: async (formId: string) => {
    try {
      const response = await api.get(`/meta/forms/${formId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(formatMetaErrorMessage(error, 'Failed to fetch Meta form details'));
    }
  },

  updateMetaFormStatus: async (formId: string, status: 'ACTIVE' | 'ARCHIVED') => {
    try {
      const response = await api.post(`/meta/forms/${formId}/status`, { status });
      return response.data;
    } catch (error: any) {
      throw new Error(formatMetaErrorMessage(error, 'Failed to update Meta form status'));
    }
  },

  // Fix 14: Track form endpoints
  trackMetaForm: async (pageId: string, formId: string, formName?: string, pageName?: string) => {
    try {
      const response = await api.post(`/meta/pages/${pageId}/forms/track`, { form_id: formId, form_name: formName, page_name: pageName });
      return response.data;
    } catch (error: any) {
      throw new Error(formatMetaErrorMessage(error, 'Failed to track form'));
    }
  },

  getMetaTrackedForms: async (pageId: string) => {
    try {
      const response = await api.get(`/meta/pages/${pageId}/forms/tracked`);
      return response.data;
    } catch (error: any) {
      throw new Error(formatMetaErrorMessage(error, 'Failed to load tracked forms'));
    }
  },

  getMetaDeliveryEstimate: async (adAccountId: string, targetingSpec: any) => {
    try {
      const response = await api.get(`/meta/ads/adaccounts/${adAccountId}/delivery-estimate`, {
        params: { targeting_spec: targetingSpec }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(formatMetaErrorMessage(error, 'Failed to fetch delivery estimate'));
    }
  },

  getMetaAccountAds: async (adAccountId: string) => {
    try {
      const response = await api.get(`/meta/ads/adaccounts/${adAccountId}/ads`);
      return response.data;
    } catch (error: any) {
      throw new Error(formatMetaErrorMessage(error, 'Failed to fetch account ads'));
    }
  },

  getMetaCampaignAds: async (campaignId: string) => {
    try {
      const response = await api.get(`/meta/ads/campaigns/${campaignId}/ads`);
      return response.data;
    } catch (error: any) {
      throw new Error(formatMetaErrorMessage(error, 'Failed to fetch campaign ads'));
    }
  },

  updateMetaAd: async (adId: string, data: any) => {
    try {
      const response = await api.post(`/meta/ads/ads/${adId}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(formatMetaErrorMessage(error, 'Failed to update Meta ad'));
    }
  },

  // Meta Pixel Methods
  getMetaPixels: async () => {
    try {
      const response = await api.get('/meta/pixels');
      return response.data;
    } catch (error: any) {
      throw new Error(formatMetaErrorMessage(error, 'Failed to fetch Meta pixels'));
    }
  },

  sendMetaCapiEvent: async (data: {
    pixel_id: string;
    event_name: string;
    event_data: any;
    user_data?: any;
    test_event_code?: string;
  }) => {
    try {
      // Use the test endpoint if a code is provided, otherwise standard send
      const endpoint = data.test_event_code ? '/meta/pixels/test-event' : '/meta/pixels/send-event';
      const response = await api.post(endpoint, data);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to send Meta CAPI event';
      throw new Error(message);
    }
  },

  getMetaPixelDiagnostics: async (pixelId: string) => {
    try {
      const response = await api.get(`/meta/pixels/${pixelId}/diagnostics`);
      return response.data;
    } catch (error: any) {
      throw new Error(formatMetaErrorMessage(error, 'Failed to fetch pixel diagnostics'));
    }
  },

  syncMetaPixels: async () => {
    try {
      const response = await api.post('/meta/pixels/sync');
      return response.data;
    } catch (error: any) {
      throw new Error(formatMetaErrorMessage(error, 'Failed to sync Meta pixels'));
    }
  },

  updateMetaPixel: async (id: number, data: { name?: string; is_active?: boolean }) => {
    try {
      const response = await api.patch(`/meta/pixels/${id}`, data);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to update Meta pixel';
      throw new Error(message);
    }
  },

  deleteMetaPixel: async (id: number) => {
    try {
      const response = await api.delete(`/meta/pixels/${id}`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to delete Meta pixel';
      throw new Error(message);
    }
  },

  getMetaPixelRoiSummary: async (days = 30) => {
    try {
      const response = await api.get('/meta/pixels/roi-summary', { params: { days } });
      return response.data;
    } catch (error: any) {
      throw new Error(formatMetaErrorMessage(error, 'Failed to fetch ROI summary'));
    }
  },

  createMetaPixel: async (data: { name: string; ad_account_id: string }) => {
    try {
      const response = await api.post('/meta/pixels/create', data);
      return response.data;
    } catch (error: any) {
      throw new Error(formatMetaErrorMessage(error, 'Failed to create pixel'));
    }
  },
};

// Company Settings API
export const companyApi = {
  getSettings: async () => {
    try {
      const response = await api.get('/company/settings');
      return response.data.settings;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch company settings';
      throw new Error(message);
    }
  },

  updateSettings: async (settings: Record<string, any>) => {
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
export const exportLeads = async (ids?: number[]) => {
  try {
    const response = await api.post('/leads/export', { ids }, {
      responseType: 'blob',
      headers: {
        'Accept': 'text/csv',
        'Content-Type': 'application/json',
      }
    });

    // Get filename from response headers or use default
    const filename = response.headers['content-disposition']?.split('filename=')[1] ||
      `leads-${new Date().toISOString().split('T')[0]}.csv`;

    // Create download link
    const blob = new Blob([response.data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);

    // Trigger download
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    logger.error('Export error:', error);
    if (axios.isAxiosError(error)) {
      // Handle different error types
      if (error.response?.status === 404) {
        throw new Error('No leads found to export.');
      }
      throw new Error('Failed to export leads. Please try again.');
    }
    throw new Error('An unexpected error occurred during export.');
  }
};

export const me = async () => {
  const response = await api.get('/user', {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  return response.data;
};

export const sendMessage = async (data: {
  receiver_id: string | number;
  sender_id?: string | number;
  message: string;
}) => {
  const response = await api.post('/send-message', data);
  return response.data;
};

export const authorize = async (data: {
  socket_id: string;
  channel_name: string;
}) => {
  const response = await api.post('/broadcasting/auth', data);
  return response.data;
};

export const getMessages = async (data: {
  user_id: string | number;
}) => {
  const response = await api.post('/messages', data);
  return response.data;
};

export const initializeChat = async (data: {
  user_id: string | number;
}) => {
  const response = await api.post('/initialize-chat', data);
  return response.data;
};

export const getLeadsWithLatestMessages = async () => {
  try {
    const response = await api.get('/conversations', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error: any) {
    logger.error('Error fetching conversations:', error);
    throw error;
  }
};

export const getConversationMessages = async (conversationId: string | number, lastTimestamp?: string) => {
  try {
    const response = await api.get(`/conversations/${conversationId}/messages`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      params: {
        after: lastTimestamp
      }
    });
    return response.data;
  } catch (error: any) {
    logger.error('Error fetching messages:', error);
    throw error;
  }
};

export const getBookings = async (params?: { page?: number; per_page?: number; type?: string; search?: string }) => {
  return api.get('/bookings', { params });
};

export const deleteBooking = async (id: number) => {
  return api.delete(`/bookings/${id}`);
};

export const updateBooking = async (id: number, data: any) => {
  return api.put(`/bookings/${id}`, data);
};

export const rescheduleBooking = async (id: number, data: { date: string, time: string, duration: number }) => {
  return api.patch(`/bookings/${id}/reschedule`, data);
};

// Team API Methods
export const teamApi = {
  getMembers: async () => {
    const response = await api.get('/team');
    return response.data.members;
  },

  inviteMember: async (data: { email: string, role: string }) => {
    const response = await api.post('/team/invite', data);
    return response.data;
  },

  resendInvite: async (id: string) => {
    const response = await api.post(`/team/${id}/resend-invite`);
    return response.data;
  },

  updateRole: async (id: string, role: string) => {
    const response = await api.patch(`/team/${id}/role`, { role });
    return response.data;
  },

  removeMember: async (id: string) => {
    const response = await api.delete(`/team/${id}`);
    return response.data;
  },

  setupAccount: async (data: any) => {
    try {
      const response = await api.post('/setup-account', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to setup account');
    }
  }
};

// Super Admin API Methods
export const adminApi = {
  getStats: async () => {
    try {
      const response = await api.get('/admin/stats');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch admin stats');
    }
  },

  getCompanies: async (page = 1, limit = 10, search?: string, plan?: string, status?: string, tag?: string, expiration?: string, started?: string, expStart?: string, expEnd?: string, startStart?: string, startEnd?: string) => {
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

  updateCompany: async (id: number, data: { plan?: string, status?: string, expires_at?: string, subscription_started_at?: string, is_email_enabled?: boolean }) => {
    try {
      const response = await api.patch(`/admin/companies/${id}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update company');
    }
  },

  getUsers: async (page = 1, limit = 10, search?: string, tag?: string, role?: string, status?: string, userType?: string) => {
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

  updateUser: async (id: number, data: any) => {
    try {
      const response = await api.patch(`/admin/users/${id}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update user');
    }
  },

  getTesterRequests: async (page = 1, limit = 10, search?: string) => {
    try {
      let url = `/admin/tester-requests?page=${page}&limit=${limit}`;
      if (search) url += `&search=${search}`;
      const response = await api.get(url);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch tester requests');
    }
  },

  updateTesterRequestStatus: async (id: number | string, status: string) => {
    try {
      const response = await api.patch(`/admin/tester-requests/${id}/status`, { status });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update status');
    }
  },

  deleteUser: async (id: number) => {
    try {
      const response = await api.delete(`/admin/users/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete user');
    }
  },

  getEmailStats: async (search?: string, page = 1, limit = 10, filterStatus = 'all') => {
    try {
      const response = await api.get('/admin/email-stats', { params: { search, page, limit, filterStatus } });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch email stats');
    }
  },
  toggleUserNotification: async (userId: number, type: string = 'new_lead') => {
    try {
      const response = await api.post(`/admin/users/${userId}/toggle-notification`, { type });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to toggle notification');
    }
  },
  toggleCompanyEmail: async (id: number) => {
    try {
      const response = await api.post(`/admin/companies/${id}/toggle-email`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to toggle company email');
    }
  },

  deleteCompany: async (id: number) => {
    try {
      const response = await api.delete(`/admin/companies/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete company');
    }
  },

  renewCompany: async (id: number, days: number, notes?: string) => {
    try {
      const response = await api.post(`/admin/companies/${id}/renew`, { days, notes });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to renew company');
    }
  },

  getCompanyHistory: async (id: number) => {
    try {
      const response = await api.get(`/admin/companies/${id}/history`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch subscription history');
    }
  },

  loginAsAnyUser: async (id: number) => {
    try {
      const response = await api.post(`/admin/users/${id}/login`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to impersonate user');
    }
  },

  getBilling: async (page = 1, limit = 10, search?: string) => {
    try {
      const url = `/admin/billing?page=${page}&limit=${limit}${search ? `&search=${search}` : ''}`;
      const response = await api.get(url);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch billing data');
    }
  },

  getPlans: async () => {
    try {
      const response = await api.get('/admin/plans');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch plans');
    }
  },

  createPlan: async (data: any) => {
    try {
      const response = await api.post('/admin/plans', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create plan');
    }
  },

  updatePlan: async (id: number, data: any) => {
    try {
      const response = await api.patch(`/admin/plans/${id}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update plan');
    }
  },

  getTags: async () => {
    try {
      const response = await api.get('/admin/tags');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch tags');
    }
  },

  sendBroadcast: async (data: {
    title: string,
    message: string,
    type: string,
    target?: 'all' | 'company',
    company_id?: number,
    company_ids?: number[],
    image_url?: string,
    is_modal?: boolean,
    frequency?: 'once' | 'session' | 'always',
    cta_text?: string,
    cta_link?: string,
    expires_at?: string
  }) => {
    try {
      const response = await api.post('/admin/broadcast', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to send broadcast');
    }
  },

  getBroadcastHistory: async () => {
    try {
      const response = await api.get('/admin/broadcast/history');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch broadcast history');
    }
  }
};

// Agency Management API
export const agencyApi = {
  getClients: async () => {
    try {
      const response = await api.get('/agency/clients');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch clients');
    }
  },

  onboardClient: async (data: any) => {
    try {
      const response = await api.post('/agency/onboard', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to onboard client');
    }
  },

  getStats: async () => {
    try {
      const response = await api.get('/agency/stats');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch agency stats');
    }
  },

  loginAsClient: async (id: number) => {
    try {
      const response = await api.post(`/agency/clients/${id}/login`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to impersonate client');
    }
  },

  deleteClient: async (id: number) => {
    try {
      const response = await api.delete(`/agency/clients/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete client');
    }
  },

  renewClient: async (id: number) => {
    try {
      const response = await api.post(`/agency/clients/${id}/renew`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to renew client');
    }
  },

  getClientHistory: async (id: number) => {
    try {
      const response = await api.get(`/agency/clients/${id}/history`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch history');
    }
  }
};

export default api;



export const getDashboardStats = async () => {
  const response = await api.get('/dashboard/stats');
  return response.data;
};

export const getAnalyticsData = async () => {
  const response = await api.get('/analytics');
  return response.data;
};

// ─────────────────────────────────────────────────────────────────────────────
// Finance Module API — Super Admin Only
// ─────────────────────────────────────────────────────────────────────────────
export const financeApi = {
  // ── Dashboard ─────────────────────────────────────────────────────────────
  getDashboard: (month?: number, year?: number) =>
    api.get('/super-admin/finance/dashboard', { params: { month, year } }).then(r => r.data),

  // ── Expense Categories ────────────────────────────────────────────────────
  getCategories: () =>
    api.get('/super-admin/finance/categories').then(r => r.data),
  createCategory: (data: any) =>
    api.post('/super-admin/finance/categories', data).then(r => r.data),
  updateCategory: (id: number, data: any) =>
    api.put(`/super-admin/finance/categories/${id}`, data).then(r => r.data),
  deleteCategory: (id: number) =>
    api.delete(`/super-admin/finance/categories/${id}`).then(r => r.data),

  // ── Expenses ──────────────────────────────────────────────────────────────
  getExpenses: (params?: Record<string, any>) =>
    api.get('/super-admin/finance/expenses', { params }).then(r => r.data),
  createExpense: (data: any) =>
    api.post('/super-admin/finance/expenses', data).then(r => r.data),
  updateExpense: (id: number, data: any) =>
    api.put(`/super-admin/finance/expenses/${id}`, data).then(r => r.data),
  deleteExpense: (id: number) =>
    api.delete(`/super-admin/finance/expenses/${id}`).then(r => r.data),
  uploadReceipt: (id: number, file: File) => {
    const fd = new FormData(); fd.append('receipt', file);
    return api.post(`/super-admin/finance/expenses/${id}/upload-receipt`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(r => r.data);
  },
  getDailyExpenses: (date: string) =>
    api.get(`/super-admin/finance/expenses/daily/${date}`).then(r => r.data),
  getMonthlyExpenses: (month: number, year: number) =>
    api.get(`/super-admin/finance/expenses/monthly/${month}/${year}`).then(r => r.data),
  getRecurringExpenses: () =>
    api.get('/super-admin/finance/expenses/recurring').then(r => r.data),

  // ── Employees ─────────────────────────────────────────────────────────────
  getEmployees: (params?: Record<string, any>) =>
    api.get('/super-admin/finance/employees', { params }).then(r => r.data),
  createEmployee: (data: any) =>
    api.post('/super-admin/finance/employees', data).then(r => r.data),
  updateEmployee: (id: number, data: any) =>
    api.put(`/super-admin/finance/employees/${id}`, data).then(r => r.data),
  deleteEmployee: (id: number) =>
    api.delete(`/super-admin/finance/employees/${id}`).then(r => r.data),
  getEmployeeSalaryHistory: (id: number) =>
    api.get(`/super-admin/finance/employees/${id}/salary-history`).then(r => r.data),
  toggleEmployeeActive: (id: number) =>
    api.post(`/super-admin/finance/employees/${id}/toggle-active`).then(r => r.data),
  getEmployeeRevisions: (id: number) =>
    api.get(`/super-admin/finance/employees/${id}/revisions`).then(r => r.data),
  addEmployeeRevision: (id: number, data: any) =>
    api.post(`/super-admin/finance/employees/${id}/revisions`, data).then(r => r.data),

  // ── Payroll ───────────────────────────────────────────────────────────────
  getPayrollCycle: (month: number, year: number) =>
    api.get(`/super-admin/finance/payroll/cycle/${month}/${year}`).then(r => r.data),
  generatePayroll: (month: number, year: number) =>
    api.post(`/super-admin/finance/payroll/generate/${month}/${year}`).then(r => r.data),
  markPayoutPaid: (payoutId: number, data: any) =>
    api.put(`/super-admin/finance/payroll/${payoutId}/mark-paid`, data).then(r => r.data),
  updatePayoutStatus: (payoutId: number, status: string) =>
    api.put(`/super-admin/finance/payroll/${payoutId}/status`, { status }).then(r => r.data),
  uploadPayoutProof: (payoutId: number, file: File) => {
    const fd = new FormData(); fd.append('proof', file);
    return api.post(`/super-admin/finance/payroll/${payoutId}/upload-proof`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(r => r.data);
  },
  getPayrollAnnualSummary: (year: number) =>
    api.get(`/super-admin/finance/payroll/summary/${year}`).then(r => r.data),

  // ── Revenue & MRR (Phase 2) ────────────────────────────────────────────────
  getRevenueCompanies: () =>
    api.get('/super-admin/finance/revenue/companies').then(r => r.data),
  getMrrBreakdown: () =>
    api.get('/super-admin/finance/revenue/mrr').then(r => r.data),
  getMrrHistory: () =>
    api.get('/super-admin/finance/revenue/mrr/history').then(r => r.data),
  getSubscriptions: (params?: any) =>
    api.get('/super-admin/finance/revenue/subscriptions', { params }).then(r => r.data),
  manualRenewal: (data: any) =>
    api.post('/super-admin/finance/revenue/renewals', data).then(r => r.data),
  getRevenueAdjustments: (params?: any) =>
    api.get('/super-admin/finance/revenue/adjustments', { params }).then(r => r.data),
  createRevenueAdjustment: (data: any) =>
    api.post('/super-admin/finance/revenue/adjustments', data).then(r => r.data),
  getRevenueTarget: (month: number, year: number) =>
    api.get(`/super-admin/finance/revenue/targets/${month}/${year}`).then(r => r.data),
  setRevenueTarget: (data: any) =>
    api.post('/super-admin/finance/revenue/targets', data).then(r => r.data),
  getUpgradeLog: (month?: number, year?: number) =>
    api.get('/super-admin/finance/revenue/upgrade-log', { params: { month, year } }).then(r => r.data),

  // ── Churn Tracking (Phase 2) ──────────────────────────────────────────────
  getChurnLog: (params?: any) =>
    api.get('/super-admin/finance/churn', { params }).then(r => r.data),
  tagChurnReason: (id: number, data: any) =>
    api.post(`/super-admin/finance/churn/${id}/reason`, data).then(r => r.data),
  detectChurn: () =>
    api.post('/super-admin/finance/churn/detect').then(r => r.data),

  // ── Plans & Pricing (Phase 2) ─────────────────────────────────────────────
  getPlans: () =>
    api.get('/super-admin/finance/plans').then(r => r.data),
  updatePlanPricing: (data: any) =>
    api.put('/super-admin/finance/plans/pricing', data).then(r => r.data),
  getPlanPricingHistory: (params?: any) =>
    api.get('/super-admin/finance/plans/pricing/history', { params }).then(r => r.data),

  // ── Reports (Phase 2) ─────────────────────────────────────────────────────
  getMonthlyPlReport: (month: number, year: number) =>
    api.get(`/super-admin/finance/reports/pl/${month}/${year}`).then(r => r.data),
  getAnnualReport: (year: number) =>
    api.get(`/super-admin/finance/reports/annual/${year}`).then(r => r.data),
  getPayrollReport: (year: number) =>
    api.get(`/super-admin/finance/reports/payroll/${year}`).then(r => r.data),
  getGstReport: (month: number, year: number) =>
    api.get(`/super-admin/finance/reports/gst/${month}/${year}`).then(r => r.data),
};

// Google Integration API
export const googleIntegrationApi = {
  getStatus: async () => {
    try {
      const response = await api.get('/google/status');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch Google status';
      throw new Error(message);
    }
  },

  disconnect: async () => {
    try {
      const response = await api.delete('/google/disconnect');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to disconnect Google account';
      throw new Error(message);
    }
  },

  getConnectUrl: async (scope?: string) => {
    try {
      const response = await api.get('/google/connect', { params: { scope } });
      return response.data.url;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to get connection URL';
      throw new Error(message);
    }
  }
};
