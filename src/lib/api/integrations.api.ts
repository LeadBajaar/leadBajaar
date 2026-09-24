import api from './client';
import { IntegrationConfig } from './types/integrations.types';

export const formatMetaErrorMessage = (error: any, defaultMessage: string): string => {
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
  getIntegrations: async (): Promise<any> => {
    try {
      const response = await api.get('/integrations');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch integrations';
      throw new Error(message);
    }
  },

  // Save integration configuration
  saveIntegration: async (config: IntegrationConfig): Promise<any> => {
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
      throw error;
    }
  },

  // Update integration configuration
  updateIntegration: async (id: string, config: IntegrationConfig): Promise<any> => {
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
      throw error;
    }
  },

  // Update integration status
  updateIntegrationStatus: async (id: string, isActive: boolean): Promise<any> => {
    try {
      const response = await api.patch(`/integrations/${id}/status`, { isActive });
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update integration status';
      throw new Error(message);
    }
  },

  // Get integration logs
  getIntegrationLogs: async (id: string): Promise<any> => {
    try {
      const response = await api.get(`/integrations/${id}/logs`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch integration logs';
      throw new Error(message);
    }
  },

  // Get the most recent log for an integration (used for testing webhooks)
  getLatestLog: async (id: string): Promise<any> => {
    try {
      const response = await api.get(`/integrations/${id}/latest-log`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch latest log';
      throw new Error(message);
    }
  },

  // Delete integration
  deleteIntegration: async (id: string): Promise<void> => {
    try {
      const response = await api.delete(`/integrations/${id}`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to delete integration';
      throw new Error(message);
    }
  },

  getWhatsAppProfiles: async (): Promise<any> => {
    try {
      const response = await api.get('/integrations/whatsapp/profiles');
      return response.data.profiles;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch WhatsApp profiles';
      throw new Error(message);
    }
  },

  getWhatsAppAccounts: async (): Promise<any> => {
    try {
      const response = await api.get('/integrations/whatsapp/accounts');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch WhatsApp accounts';
      throw new Error(message);
    }
  },

  getWhatsAppTemplates: async (accountId: number): Promise<any> => {
    try {
      const response = await api.get(`/integrations/whatsapp/${accountId}/templates`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch templates';
      throw new Error(message);
    }
  },

  syncWhatsAppTemplates: async (accountId: number): Promise<void> => {
    try {
      const response = await api.post(`/integrations/whatsapp/${accountId}/templates/sync`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to sync templates';
      throw new Error(message);
    }
  },





  createWhatsAppTemplate: async (accountId: number, templateData: any): Promise<any> => {
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

  checkIntegrationStatus: async (accountId: number): Promise<any> => {
    try {
      const response = await api.get(`/integrations/whatsapp/${accountId}/status`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to check integration status';
      throw new Error(message);
    }
  },

  markReauthenticated: async (accountId: number): Promise<any> => {
    try {
      const response = await api.post(`/integrations/whatsapp/${accountId}/reauth`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to mark integration as re-authenticated';
      throw new Error(message);
    }
  },

  updateAccessToken: async (accountId: number, accessToken: string): Promise<any> => {
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



  updateWhatsAppTemplate: async (accountId: number, templateId: string, templateData: any): Promise<any> => {
    try {
      const response = await api.put(`/integrations/whatsapp/${accountId}/templates/${templateId}`, templateData);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update template';
      throw new Error(message);
    }
  },

  deleteWhatsAppTemplate: async (accountId: number, templateId: string): Promise<void> => {
    try {
      const response = await api.delete(`/integrations/whatsapp/${accountId}/templates/${templateId}`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to delete template';
      throw new Error(message);
    }
  },

  getWhatsAppTemplateDetails: async (accountId: number, templateId: string): Promise<any> => {
    try {
      const response = await api.get(`/integrations/whatsapp/${accountId}/templates/${templateId}/details`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to get template details';
      throw new Error(message);
    }
  },


  getConnectedIntegrations: async (): Promise<any[]> => {
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
  }): Promise<unknown> => {
    const response = await api.post('/leads/send-template', data);
    return response.data;
  },

  // Facebook Lead Retrieval Methods
  getFacebookLeadForms: async (): Promise<any> => {
    try {
      const response = await api.get('/facebook-lead-forms');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch Facebook lead forms';
      throw new Error(message);
    }
  },

  debugIntegrations: async (): Promise<any> => {
    try {
      const response = await api.get('/debug-integrations');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to debug integrations';
      throw new Error(message);
    }
  },

  // New Meta API Methods (v25.0)
  getMetaPages: async (): Promise<any> => {
    try {
      const response = await api.get('/meta/pages');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch Meta pages';
      throw new Error(message);
    }
  },

  getMetaPageForms: async (pageId: string): Promise<any> => {
    try {
      const response = await api.get(`/meta/pages/${pageId}/forms`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch Meta lead forms';
      throw new Error(message);
    }
  },

  // Meta Ads API Methods
  getMetaAdAccounts: async (): Promise<any> => {
    try {
      const response = await api.get('/meta/ads/adaccounts');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch Meta ad accounts';
      throw new Error(message);
    }
  },

  getMetaBusinessAdAccounts: async (businessId: string): Promise<any> => {
    try {
      const response = await api.get(`/meta/ads/businesses/${businessId}/adaccounts`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch business ad accounts';
      throw new Error(message);
    }
  },

  getMetaCampaigns: async (adAccountId: string): Promise<any> => {
    try {
      const response = await api.get(`/meta/ads/adaccounts/${adAccountId}/campaigns`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch Meta campaigns';
      throw new Error(message);
    }
  },

  getMetaAdSets: async (campaignId: string): Promise<any> => {
    try {
      const response = await api.get(`/meta/ads/campaigns/${campaignId}/adsets`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch Meta ad sets';
      throw new Error(message);
    }
  },

  getMetaAds: async (adSetId: string): Promise<any> => {
    try {
      const response = await api.get(`/meta/ads/adsets/${adSetId}/ads`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch Meta ads';
      throw new Error(message);
    }
  },

  getMetaAdAccountInsights: async (adAccountId: string): Promise<any> => {
    try {
      const response = await api.get(`/meta/ads/adaccounts/${adAccountId}/insights`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch Meta ad insights';
      throw new Error(message);
    }
  },

  updateMetaStatus: async (objectId: string, status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED'): Promise<any> => {
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

  connectMeta: async (): Promise<any> => {
    try {
      const response = await api.get('/meta/connect');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to get Meta connection URL');
    }
  },

  getMetaStatus: async (): Promise<any> => {
    try {
      const response = await api.get('/meta/status');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch Meta status');
    }
  },

  disconnectMeta: async (): Promise<any> => {
    try {
      const response = await api.post('/meta/deauthorize'); // Now hits the authenticated route
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to disconnect Meta');
    }
  },

  dataDeletionRequest: async (): Promise<any> => {
    try {
      const response = await api.post('/meta/data-deletion'); // Now hits the authenticated route
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to request data deletion');
    }
  },

  getDeletionRequests: async (): Promise<any> => {
    try {
      const response = await api.get('/meta/deletion-requests');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch deletion requests');
    }
  },

  getMetaBusinessAssets: async (businessId: string): Promise<any> => {
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

  getConversionApiEventTypes: async (): Promise<any> => {
    try {
      const response = await api.get('/facebook/conversion-api/event-types');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch event types';
      throw new Error(message);
    }
  },

  getConversionApiConfiguration: async (): Promise<any> => {
    try {
      const response = await api.get('/facebook/conversion-api/configuration');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch Conversion API configuration';
      throw new Error(message);
    }
  },

  getMetaWebhookChecklist: async (pageId: string): Promise<any> => {
    try {
      const response = await api.get(`/meta/pages/${pageId}/webhook-checklist`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch webhook checklist';
      throw new Error(message);
    }
  },

  testMetaLeadRetrieval: async (leadId: string): Promise<any> => {
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

  syncMetaLeads: async (formId: string, days: number = 7): Promise<any> => {
    try {
      const response = await api.post(`/meta/forms/${formId}/sync-leads`, { days });
      return response.data;
    } catch (error: any) {
      throw new Error(formatMetaErrorMessage(error, 'Failed to sync leads'));
    }
  },


  createMetaCampaign: async (adAccountId: string, data: { name: string; objective?: string; status?: string; special_ad_categories?: string[] }): Promise<any> => {
    try {
      const response = await api.post(`/meta/ads/adaccounts/${adAccountId}/campaigns`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(formatMetaErrorMessage(error, 'Failed to create Meta campaign'));
    }
  },

  createMetaAdSet: async (adAccountId: string, data: any): Promise<any> => {
    try {
      const response = await api.post(`/meta/ads/adaccounts/${adAccountId}/adsets`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(formatMetaErrorMessage(error, 'Failed to create Meta ad set'));
    }
  },

  updateMetaAdSet: async (adSetId: string, data: { daily_budget?: number; status?: string }): Promise<any> => {
    try {
      const response = await api.post(`/meta/ads/adsets/${adSetId}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(formatMetaErrorMessage(error, 'Failed to update Meta ad set'));
    }
  },

  createMetaAd: async (adAccountId: string, data: any): Promise<any> => {
    try {
      const response = await api.post(`/meta/ads/adaccounts/${adAccountId}/ads`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(formatMetaErrorMessage(error, 'Failed to create Meta ad'));
    }
  },

  getMetaAdCreatives: async (adAccountId: string): Promise<any> => {
    try {
      const response = await api.get(`/meta/ads/adaccounts/${adAccountId}/adcreatives`);
      return response.data;
    } catch (error: any) {
      throw new Error(formatMetaErrorMessage(error, 'Failed to fetch Meta ad creatives'));
    }
  },

  createMetaAdCreativeStandalone: async (adAccountId: string, data: any): Promise<any> => {
    try {
      const response = await api.post(`/meta/ads/adaccounts/${adAccountId}/adcreatives`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(formatMetaErrorMessage(error, 'Failed to create Meta ad creative'));
    }
  },

  createMetaPageForm: async (pageId: string, formData: { name: string; questions: any[]; privacy_policy?: any; follow_up_url?: string }): Promise<any> => {
    try {
      const response = await api.post(`/meta/pages/${pageId}/forms`, formData);
      return response.data;
    } catch (error: any) {
      throw new Error(formatMetaErrorMessage(error, 'Failed to create Meta Lead Form'));
    }
  },


  syncMetaAssets: async (): Promise<any> => {
    try {
      const response = await api.post('/meta/ads/sync');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to sync Meta assets';
      throw new Error(message);
    }
  },

  syncMetaAdAccountDetails: async (adAccountId: string): Promise<any> => {
    try {
      const response = await api.post(`/meta/ads/adaccounts/${adAccountId}/sync`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to sync ad account details';
      throw new Error(message);
    }
  },

  subscribeMetaPage: async (pageId: string): Promise<any> => {
    try {
      const response = await api.post(`/meta/pages/${pageId}/subscribe`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to subscribe page to webhook';
      throw new Error(message);
    }
  },

  getMetaTemplates: async (): Promise<any> => {
    try {
      const response = await api.get('/meta/ads/templates');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch Meta templates';
      throw new Error(message);
    }
  },

  launchMetaTemplate: async (adAccountId: string, templateId: number, customName?: string): Promise<any> => {
    try {
      const response = await api.post(`/meta/ads/adaccounts/${adAccountId}/launch-template`, { template_id: templateId, custom_name: customName });
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to launch Meta template';
      throw new Error(message);
    }
  },

  deleteMetaObject: async (objectId: string): Promise<any> => {
    try {
      const response = await api.delete(`/meta/ads/${objectId}`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to delete Meta object';
      throw new Error(message);
    }
  },

  updateMetaCampaign: async (campaignId: string, data: any): Promise<any> => {
    try {
      const response = await api.post(`/meta/ads/campaigns/${campaignId}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(formatMetaErrorMessage(error, 'Failed to update Meta campaign'));
    }
  },

  createMetaCustomAudience: async (adAccountId: string, data: { name: string; subtype?: string; description?: string }): Promise<any> => {
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

  uploadMetaAdImage: async (adAccountId: string, image: File | string): Promise<any> => {
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

  uploadMetaAdVideo: async (adAccountId: string, video: File | string, title?: string): Promise<any> => {
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

  getMetaAdPreview: async (objectId: string, adFormat: string = 'DESKTOP_FEED_STANDARD'): Promise<any> => {
    try {
      const response = await api.get(`/meta/ads/previews/${objectId}`, {
        params: { ad_format: adFormat }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(formatMetaErrorMessage(error, 'Failed to fetch Meta ad preview'));
    }
  },



  getMetaFormDetails: async (formId: string): Promise<any> => {
    try {
      const response = await api.get(`/meta/forms/${formId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(formatMetaErrorMessage(error, 'Failed to fetch Meta form details'));
    }
  },

  updateMetaFormStatus: async (formId: string, status: 'ACTIVE' | 'ARCHIVED'): Promise<any> => {
    try {
      const response = await api.post(`/meta/forms/${formId}/status`, { status });
      return response.data;
    } catch (error: any) {
      throw new Error(formatMetaErrorMessage(error, 'Failed to update Meta form status'));
    }
  },

  // Fix 14: Track form endpoints
  trackMetaForm: async (pageId: string, formId: string, formName?: string, pageName?: string): Promise<any> => {
    try {
      const response = await api.post(`/meta/pages/${pageId}/forms/track`, { form_id: formId, form_name: formName, page_name: pageName });
      return response.data;
    } catch (error: any) {
      throw new Error(formatMetaErrorMessage(error, 'Failed to track form'));
    }
  },

  getMetaTrackedForms: async (pageId: string): Promise<any> => {
    try {
      const response = await api.get(`/meta/pages/${pageId}/forms/tracked`);
      return response.data;
    } catch (error: any) {
      throw new Error(formatMetaErrorMessage(error, 'Failed to load tracked forms'));
    }
  },



  updateMetaAd: async (adId: string, data: any): Promise<any> => {
    try {
      const response = await api.post(`/meta/ads/ads/${adId}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(formatMetaErrorMessage(error, 'Failed to update Meta ad'));
    }
  },

  // Meta Pixel Methods
  getMetaPixels: async (): Promise<any> => {
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

  getMetaPixelDiagnostics: async (pixelId: string): Promise<any> => {
    try {
      const response = await api.get(`/meta/pixels/${pixelId}/diagnostics`);
      return response.data;
    } catch (error: any) {
      throw new Error(formatMetaErrorMessage(error, 'Failed to fetch pixel diagnostics'));
    }
  },

  syncMetaPixels: async (): Promise<any> => {
    try {
      const response = await api.post('/meta/pixels/sync');
      return response.data;
    } catch (error: any) {
      throw new Error(formatMetaErrorMessage(error, 'Failed to sync Meta pixels'));
    }
  },

  updateMetaPixel: async (id: number, data: { name?: string; is_active?: boolean }): Promise<any> => {
    try {
      const response = await api.patch(`/meta/pixels/${id}`, data);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to update Meta pixel';
      throw new Error(message);
    }
  },

  deleteMetaPixel: async (id: number): Promise<any> => {
    try {
      const response = await api.delete(`/meta/pixels/${id}`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to delete Meta pixel';
      throw new Error(message);
    }
  },

  getMetaPixelRoiSummary: async (days = 30): Promise<any> => {
    try {
      const response = await api.get('/meta/pixels/roi-summary', { params: { days } });
      return response.data;
    } catch (error: any) {
      throw new Error(formatMetaErrorMessage(error, 'Failed to fetch ROI summary'));
    }
  },

  createMetaPixel: async (data: { name: string; ad_account_id: string }): Promise<any> => {
    try {
      const response = await api.post('/meta/pixels/create', data);
      return response.data;
    } catch (error: any) {
      throw new Error(formatMetaErrorMessage(error, 'Failed to create pixel'));
    }
  },
};

// Company Settings API
export const googleIntegrationApi = {
  getStatus: async (): Promise<any> => {
    try {
      const response = await api.get('/google/status');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch Google status';
      throw new Error(message);
    }
  },

  disconnect: async (): Promise<any> => {
    try {
      const response = await api.delete('/google/disconnect');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to disconnect Google account';
      throw new Error(message);
    }
  },

  getConnectUrl: async (scope?: string): Promise<any> => {
    try {
      const response = await api.get('/google/connect', { params: { scope } });
      return response.data.url;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to get connection URL';
      throw new Error(message);
    }
  }
};

// Subscription API
