import { logger } from '@/utils/logger';
import api from './client';
import { AdAccount, Campaign, AdInsight, UpdateCampaignStatusDto, UpdateBudgetDto, CreateCampaignDto, CreateAdSetDto, CreateAdDto } from './types/ads.types';
import { formatMetaErrorMessage } from './integrations.api';

export const getAdAccounts = async (): Promise<AdAccount[]> => {
  try {
    const response = await api.get('/meta/ads/adaccounts');
    return response.data?.ad_accounts ?? response.data?.data ?? [];
  } catch (error: any) {
    logger.error('Error fetching ad accounts', error);
    throw new Error(formatMetaErrorMessage(error, 'Failed to fetch ad accounts'));
  }
};

export const getCampaigns = async (adAccountId: string): Promise<Campaign[]> => {
  try {
    const response = await api.get(`/meta/ads/adaccounts/${adAccountId}/campaigns`);
    return response.data?.campaigns ?? response.data?.data ?? [];
  } catch (error: any) {
    logger.error('Error fetching campaigns', error);
    throw new Error(formatMetaErrorMessage(error, 'Failed to fetch campaigns'));
  }
};

export const updateCampaignStatus = async (campaignId: string, data: UpdateCampaignStatusDto): Promise<any> => {
  try {
    const response = await api.post(`/meta/ads/${campaignId}/status`, data);
    return response.data;
  } catch (error: any) {
    logger.error('Error updating campaign status', error);
    throw new Error(formatMetaErrorMessage(error, 'Failed to update campaign status'));
  }
};

export const updateAdSetBudget = async (adSetId: string, data: UpdateBudgetDto): Promise<any> => {
  try {
    const response = await api.post(`/meta/ads/adsets/${adSetId}/budget`, data);
    return response.data;
  } catch (error: any) {
    logger.error('Error updating budget', error);
    throw new Error(formatMetaErrorMessage(error, 'Failed to update budget'));
  }
};

export const getInsights = async (adAccountId: string, datePreset: string): Promise<AdInsight[]> => {
  try {
    const response = await api.get(`/meta/ads/adaccounts/${adAccountId}/insights`, {
      params: { date_preset: datePreset }
    });
    return response.data?.insights ?? response.data?.data ?? [];
  } catch (error: any) {
    logger.error('Error fetching insights', error);
    throw new Error(formatMetaErrorMessage(error, 'Failed to fetch insights'));
  }
};

export const createCampaign = async (adAccountId: string, data: CreateCampaignDto): Promise<any> => {
  try {
    const response = await api.post(`/meta/ads/adaccounts/${adAccountId}/campaigns`, data);
    return response.data;
  } catch (error: any) {
    logger.error('Error creating campaign', error);
    throw new Error(formatMetaErrorMessage(error, 'Failed to create campaign'));
  }
};

export const createAdSet = async (adAccountId: string, data: CreateAdSetDto): Promise<any> => {
  try {
    const response = await api.post(`/meta/ads/adaccounts/${adAccountId}/adsets`, data);
    return response.data;
  } catch (error: any) {
    logger.error('Error creating ad set', error);
    throw new Error(formatMetaErrorMessage(error, 'Failed to create ad set'));
  }
};

export const createAd = async (adAccountId: string, data: CreateAdDto): Promise<any> => {
  try {
    const response = await api.post(`/meta/ads/adaccounts/${adAccountId}/ads`, data);
    return response.data;
  } catch (error: any) {
    logger.error('Error creating ad', error);
    throw new Error(formatMetaErrorMessage(error, 'Failed to create ad'));
  }
};

export const deleteObject = async (objectId: string): Promise<any> => {
  try {
    const response = await api.delete(`/meta/ads/${objectId}`);
    return response.data;
  } catch (error: any) {
    logger.error('Error deleting object', error);
    throw new Error(formatMetaErrorMessage(error, 'Failed to delete object'));
  }
};

export const uploadAdImage = async (adAccountId: string, image: File | string): Promise<any> => {
  try {
    let response;
    if (typeof image === 'string') {
      response = await api.post(`/meta/ads/adaccounts/${adAccountId}/adimages`, { image_url: image });
    } else {
      const formData = new FormData();
      formData.append('image', image);
      response = await api.post(`/meta/ads/adaccounts/${adAccountId}/adimages`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    return response.data;
  } catch (error: any) {
    logger.error('Error uploading ad image', error);
    throw new Error(formatMetaErrorMessage(error, 'Failed to upload Meta ad image'));
  }
};

// Endpoints extracted from integrations.api.ts
export const duplicateMetaCampaign = async (campaignId: string, options?: { status?: 'PAUSED' | 'ACTIVE'; rename_suffix?: string }): Promise<any> => {
  try {
    const response = await api.post(`/meta/ads/campaigns/${campaignId}/duplicate`, options);
    return response.data;
  } catch (error: any) {
    throw new Error(formatMetaErrorMessage(error, 'Failed to duplicate Meta campaign'));
  }
};

export const duplicateMetaObject = async (objectId: string): Promise<any> => {
  try {
    const response = await api.post(`/meta/ads/${objectId}/duplicate`);
    return response.data;
  } catch (error: any) {
    throw new Error(formatMetaErrorMessage(error, 'Failed to duplicate Meta object'));
  }
};

export const getMetaOfflineEventSets = async (objectId: string): Promise<any> => {
  try {
    const response = await api.get(`/meta/ads/offline-event-sets/${objectId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(formatMetaErrorMessage(error, 'Failed to fetch offline event sets'));
  }
};

export const createMetaOfflineEventSet = async (businessId: string, data: { name: string; description?: string }): Promise<any> => {
  try {
    const response = await api.post(`/meta/ads/offline-event-sets/${businessId}`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(formatMetaErrorMessage(error, 'Failed to create offline event set'));
  }
};

export const getMetaAutomatedRules = async (adAccountId: string): Promise<any> => {
  try {
    const response = await api.get(`/meta/ads/adaccounts/${adAccountId}/adrules`);
    return response.data;
  } catch (error: any) {
    throw new Error(formatMetaErrorMessage(error, 'Failed to fetch automated rules'));
  }
};

export const createMetaAutomatedRule = async (adAccountId: string, data: { name: string; filters?: any[]; execution_options?: any[] }): Promise<any> => {
  try {
    const response = await api.post(`/meta/ads/adaccounts/${adAccountId}/adrules`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(formatMetaErrorMessage(error, 'Failed to create automated rule'));
  }
};

export const deleteMetaAutomatedRule = async (ruleId: string): Promise<any> => {
  try {
    const response = await api.delete(`/meta/ads/adrules/${ruleId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(formatMetaErrorMessage(error, 'Failed to delete automated rule'));
  }
};

export const getMetaDeliveryEstimate = async (adAccountId: string, targetingSpec: any): Promise<any> => {
  try {
    const response = await api.get(`/meta/ads/adaccounts/${adAccountId}/delivery-estimate`, {
      params: { targeting_spec: targetingSpec }
    });
    return response.data;
  } catch (error: any) {
    throw new Error(formatMetaErrorMessage(error, 'Failed to fetch delivery estimate'));
  }
};

export const getMetaAccountAds = async (adAccountId: string): Promise<any> => {
  try {
    const response = await api.get(`/meta/ads/adaccounts/${adAccountId}/ads`);
    return response.data;
  } catch (error: any) {
    throw new Error(formatMetaErrorMessage(error, 'Failed to fetch account ads'));
  }
};

export const getMetaCampaignAds = async (campaignId: string): Promise<any> => {
  try {
    const response = await api.get(`/meta/ads/campaigns/${campaignId}/ads`);
    return response.data;
  } catch (error: any) {
    throw new Error(formatMetaErrorMessage(error, 'Failed to fetch campaign ads'));
  }
};
