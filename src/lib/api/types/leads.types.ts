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

export interface ImportError {
  row: number;
  field: string;
  value: string | number;
  reason: string;
}

export interface ImportLeadsResponse {
  successful?: number;
  skipped?: number;
  errors?: ImportError[];
}

export interface CreatePaymentDto {
  lead_id: number;
  amount: number;
  payment_method: string;
  status: string;
  payment_date: string;
}

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
  total?: number;
  last_page?: number;
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
  };
}

export interface GetLeadsParams {
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
