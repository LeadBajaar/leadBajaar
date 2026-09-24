export type UserRole = 'Super Admin' | 'Admin' | 'Manager' | 'Agent';
export type UserType = 'agency' | 'individual' | 'super_admin';

export interface User {
  id: number;
  name: string;
  email: string;
  avatar_url?: string;
  phone?: string;
  bio?: string;
  company_name?: string;
  role: UserRole;
  user_type: UserType;
  company_id: number | null;
  notification_settings?: Record<string, unknown>;
  company?: {
    id?: number;
    name?: string;
    plan?: string;
    status?: string;
    type?: string;
    expires_at?: string;
    subscription_started_at?: string;
    monthly_email_count?: number;
    custom_setup_fee?: number;
    custom_renewal_fee?: number;
    plan_details?: {
      id: number;
      name: string;
      features: string[];
      price?: number;
    };
  };
}

export interface AuthResponse {
  token: string;
  user: User;
  message?: string;
}

export interface MessageResponse {
  message: string;
}

export interface TesterRequestDto {
  name: string;
  email: string;
  phone: string;
}
