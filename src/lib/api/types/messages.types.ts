export interface ChatMessage {
  id: number;
  content: string;
  direction: 'inbound' | 'outbound';
  sender: {
    id: string | number;
    type: 'lead' | 'system';
  };
  receiver: {
    id: string | number;
    type: 'lead' | 'system';
  };
  timestamp: string;
  created_at: string;
  status: string;
  type?: string;
  metadata?: unknown;
  integration?: unknown;
}

export interface ConversationLead {
  id: number;
  name: string;
  email?: string;
  phone: string;
  company?: string;
  status?: string;
  stage?: string;
}

export interface Conversation {
  conversation_id: string;
  lead: ConversationLead;
  last_message: {
    content: string;
    direction: 'inbound' | 'outbound';
    status: string;
    timestamp: string;
  };
  unread_count: number;
  priority: string;
  status: string;
  integration?: unknown;
  last_activity: string;
}

export interface ConversationMessagesResponse {
  messages: ChatMessage[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  latest_timestamp: string;
  next_after?: string;
}

export interface SendMessageDto {
  receiver_id: string | number;
  sender_id?: string | number;
  message: string;
}

export interface AuthorizeDto {
  socket_id: string;
  channel_name: string;
}
