import {
  User, Mail, Phone, Building2, Tag, Globe,
  CheckCircle, Clock, Star, AlertCircle, Globe2,
  Facebook, Linkedin, MonitorSmartphone, MessageSquare, X,
  Flame, ThermometerSun, Snowflake, Thermometer, CalendarIcon, Map, Computer, IndianRupee, Wallet
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
  stage: string;
  status: string;
  source: string;
  city?: string;
  profession?: string;
  notes?: string;
  deal_value?: number;
  paid_amount?: number;
  last_contact: string;
  created_at: string;
  updated_at: string;
}

export interface NewLead {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  stage: string;
  status: 'Hot' | 'Warm' | 'Cold';
  source?: string;
  city?: string;
  profession?: string;
}

export type TemperatureType = 'Hot' | 'Warm' | 'Cold';

export interface ColumnMapping {
  csvHeader: string;
  leadField: string;
}

export interface ImportError {
  row: number;
  field: string;
  value: string;
  reason: string;
}

export interface ImportStats {
  totalRows: number;
  successfulRows: number;
  skippedRows: number;
  errors: ImportError[];
  skippedColumns: string[];
}

export const columns = [
  { id: 'name', label: 'Name', icon: User },
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'phone', label: 'Phone', icon: Phone },
  { id: 'profession', label: 'profession', icon: Computer },
  { id: 'city', label: 'city', icon: Map },
  { id: 'company', label: 'Company', icon: Building2 },
  { id: 'stage', label: 'Stage', icon: Tag },
  { id: 'status', label: 'Temperature', icon: Thermometer },
  { id: 'source', label: 'Source', icon: Globe },
  { id: 'deal_value', label: 'Deal Value', icon: IndianRupee },
  { id: 'paid_amount', label: 'Paid Amount', icon: Wallet },
  { id: 'lastContact', label: 'Last Contact', icon: CalendarIcon },
  { id: 'created_at', label: 'Created At', icon: CalendarIcon },
  { id: 'actions', label: 'Actions' },
];

export const temperatureConfig: Record<TemperatureType, { color: string; icon: LucideIcon }> = {
  'Hot': { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100', icon: Flame },
  'Warm': { color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100', icon: ThermometerSun },
  'Cold': { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100', icon: Snowflake }
};

export const defaultStages = {
  'Lead': { color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300', icon: User },
  'Appointment Booked': { color: 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300', icon: CalendarIcon },
  'Qualified': { color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300', icon: CheckCircle },
  'Disqualified': { color: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-300', icon: AlertCircle },
  'Not Connected': { color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300', icon: Phone },
  'Deal Closed': { color: 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-300', icon: CheckCircle },
  'Closed Won': { color: 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-300', icon: CheckCircle },
  'DNP': { color: 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-300', icon: AlertCircle },
  'Follow Up': { color: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-300', icon: Clock },
  'Call Back': { color: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300', icon: Phone },
  'Consultation': { color: 'bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-300', icon: MessageSquare },
  'Not Interested': { color: 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-300', icon: X },
  'Broadcast Done': { color: 'bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-300', icon: Globe },
  'Wrong Number': { color: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-300', icon: Phone },
  'Payment Received': { color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300', icon: CheckCircle },
};

export const sourceConfig = {
  'Website': { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100', icon: Globe2 },
  'Facebook Ad': { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100', icon: Facebook },
  'LinkedIn': { color: 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-100', icon: Linkedin },
  'Referral': { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100', icon: MessageSquare },
  'Google Ad': { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100', icon: MonitorSmartphone }
};

export const iconMapping = {
  User, Mail, Phone, Building2, Tag, Globe, CalendarIcon, CheckCircle, Clock, Star, AlertCircle, Globe2, Facebook, Linkedin, MonitorSmartphone, MessageSquare
};

export interface TemplateComponent {
  type: 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS';
  text?: string;
  format?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT';
  example?: {
    header_handle?: string[];
    header_text?: string[];
    body_text?: string[];
  };
  file?: File;
  buttons?: Array<{
    type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER' | 'COPY_CODE';
    text: string;
    url?: string;
    phone_number?: string;
    code?: string;
  }>;
}

export interface MessageTemplate {
  id: number;
  template_id: string;
  name: string;
  category: string;
  language: string;
  status: string;
  components: TemplateComponent[];
}

export interface BroadcastResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface LeadFormErrors {
  name?: string;
  email?: string;
  phone?: string;
}
