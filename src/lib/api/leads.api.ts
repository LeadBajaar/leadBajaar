import axios from 'axios';
import { logger } from '@/utils/logger';
import api from './client';
import { CreateLeadDto, ImportLeadDto, Lead, GetLeadsParams, ImportLeadsResponse, LeadsResponse, CreatePaymentDto } from './types/leads.types';

export const createLead = async (data: CreateLeadDto): Promise<Lead> => {
  const response = await api.post('/leads', {
    ...data,
    stage: data.stage || 'New'
  });
  return response.data;
};

export const importLeads = async (data: ImportLeadDto): Promise<ImportLeadsResponse> => {
  const response = await api.post('/leads/import', data);
  return response.data;
};

export const getLeads = async (params: GetLeadsParams): Promise<LeadsResponse> => {
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

export const getLead = async (id: number): Promise<Lead> => {
  const response = await api.get<Lead>(`/leads/${id}`);
  return response.data;
};

export const deleteLead = async (id: number): Promise<void> => {
  await api.delete(`/leads/${id}`);
};

export const bulkDeleteLeads = async (ids: number[]): Promise<void> => {
  await api.post('/leads/bulk-destroy', { ids });
};

export const bulkUpdateLeadStatus = async (ids: number[], status: string): Promise<void> => {
  await api.post('/leads/bulk-update-status', { ids, status });
};

export const bulkUpdateLeadStage = async (ids: number[], stage: string): Promise<void> => {
  await api.post('/leads/bulk-update-stage', { ids, stage });
};

export const updateLead = async (id: number, data: Partial<Lead>): Promise<Lead> => {
  const response = await api.put<Lead>(`/leads/${id}`, data);
  return response.data;
};

export const updateLeadStage = async (id: number, stage: string, deal_value?: number): Promise<Lead> => {
  const response = await api.patch(`/leads/${id}/stage`, { stage, deal_value });
  return response.data;
};

export const updateLeadDetails = async (id: number, data: Partial<Lead>): Promise<Lead> => {
  const response = await api.put(`/leads/${id}`, data);
  return response.data;
};

export const exportLeads = async (ids?: number[]): Promise<boolean> => {
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

export const createPayment = async (data: CreatePaymentDto): Promise<unknown> => {
  const response = await api.post('/payments', data);
  return response.data;
};