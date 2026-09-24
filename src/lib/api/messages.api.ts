import api from './client';
import { logger } from '@/utils/logger';
import { 
  Conversation, 
  ConversationMessagesResponse, 
  SendMessageDto, 
  AuthorizeDto 
} from './types/messages.types';

export const sendMessage = async (data: SendMessageDto): Promise<unknown> => {
  const response = await api.post('/send-message', data);
  return response.data;
};

export const authorize = async (data: AuthorizeDto): Promise<unknown> => {
  const response = await api.post('/broadcasting/auth', data);
  return response.data;
};

export const getMessages = async (data: {
  user_id: string | number;
}): Promise<unknown> => {
  const response = await api.post('/messages', data);
  return response.data;
};

export const initializeChat = async (data: {
  user_id: string | number;
}): Promise<unknown> => {
  const response = await api.post('/initialize-chat', data);
  return response.data;
};

export const getLeadsWithLatestMessages = async (page: number = 1, search: string = ''): Promise<any> => {
  try {
    const response = await api.get('/conversations', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      params: {
        page,
        search
      }
    });
    return response.data;
  } catch (error: any) {
    logger.error('Error fetching conversations:', error);
    throw error;
  }
};

export const getConversationMessages = async (conversationId: string | number, page: number = 1, lastTimestamp?: string): Promise<ConversationMessagesResponse> => {
  try {
    const response = await api.get<ConversationMessagesResponse>(`/conversations/${conversationId}/messages`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      params: {
        after: lastTimestamp,
        page,
        limit: 25
      }
    });
    return response.data;
  } catch (error: any) {
    logger.error('Error fetching messages:', error);
    throw error;
  }
};