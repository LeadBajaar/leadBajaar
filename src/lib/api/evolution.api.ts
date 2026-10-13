import api from './client';

export const evolutionApi = {
  getAccounts: async (): Promise<any> => {
    const response = await api.get('/evolution/accounts');
    return response.data;
  },
  createAccount: async (phoneNumber: string): Promise<any> => {
    const response = await api.post('/evolution/accounts', { phone_number: phoneNumber });
    return response.data;
  },
  connectInstance: async (instanceName: string): Promise<any> => {
    const response = await api.post(`/evolution/accounts/${instanceName}/connect`);
    return response.data;
  },
  getQrCode: async (instanceName: string): Promise<any> => {
    const response = await api.get(`/evolution/accounts/${instanceName}/qrcode`);
    return response.data;
  },
  getStatus: async (instanceName: string): Promise<any> => {
    const response = await api.get(`/evolution/accounts/${instanceName}/status`);
    return response.data;
  },
  disconnectInstance: async (instanceName: string): Promise<any> => {
    const response = await api.post(`/evolution/accounts/${instanceName}/disconnect`);
    return response.data;
  },
  deleteAccount: async (instanceName: string): Promise<any> => {
    const response = await api.delete(`/evolution/accounts/${instanceName}`);
    return response.data;
  },
  getConversations: async (page: number = 1, search: string = ''): Promise<any> => {
    const response = await api.get('/evolution/inbox/conversations', {
      params: { page, search }
    });
    return response.data;
  },
  getMessages: async (conversationId: number | string, page: number = 1): Promise<any> => {
    const response = await api.get(`/evolution/inbox/conversations/${conversationId}/messages`, {
      params: { page, limit: 25 }
    });
    return response.data;
  },
  sendMessage: async (conversationId: number | string, message?: string, file?: File | null): Promise<any> => {
    let payload: any;
    let headers: any = {};
    if (file) {
      const fd = new FormData();
      fd.append('conversation_id', conversationId.toString());
      if (message) fd.append('message', message);
      fd.append('file', file);
      payload = fd;
      headers['Content-Type'] = 'multipart/form-data';
    } else {
      payload = {
        conversation_id: conversationId,
        message: message || '',
      };
    }
    const response = await api.post('/evolution/inbox/messages/send', payload, { headers });
    return response.data;
  },
  deleteConversation: async (conversationId: number | string): Promise<any> => {
    const response = await api.delete(`/evolution/inbox/conversations/${conversationId}`);
    return response.data;
  },
  clearSession: async (conversationId: number | string): Promise<any> => {
    const response = await api.post('/evolution/inbox/session/clear', {
      conversation_id: conversationId,
    });
    return response.data;
  }
};

