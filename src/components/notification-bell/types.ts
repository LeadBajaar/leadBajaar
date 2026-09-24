export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  lead?: {
    id: number;
    name: string;
    phone: string;
  };
  data?: {
    days_since_creation?: number;
    facebook_lead_id?: string;
    original_created_at?: string;
    frequency?: 'once' | 'session' | 'always';
    [key: string]: any;
  };
}
