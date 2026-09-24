export interface AdAccount {
  id: string;
  name: string;
  account_id?: string;
  currency?: string;
}

export interface Campaign {
  id: string;
  name: string;
  status: "ACTIVE" | "PAUSED" | "DELETED" | "ARCHIVED";
  objective?: string;
  daily_budget?: string;
  lifetime_budget?: string;
  start_time?: string;
}

export interface AdInsight {
  campaign_name: string;
  campaign_id: string;
  status?: string;
  spend: string;
  impressions: string;
  clicks: string;
  cpc?: string;
  ctr?: string;
  leads?: string;
  reach?: string;
  cpm?: string;
  cpl?: number | null;
}

export interface UpdateCampaignStatusDto {
  status: "ACTIVE" | "PAUSED";
}

export interface UpdateBudgetDto {
  daily_budget?: number;
  lifetime_budget?: number;
}

export interface CreateCampaignDto {
  name: string;
  objective?: string;
  status?: string;
}

export interface CreateAdSetDto {
  campaign_id: string;
  name: string;
  daily_budget?: number;
  lifetime_budget?: number;
  billing_event?: string;
  promoted_object?: any;
  destination_type?: string;
  targeting?: any;
  bid_strategy?: string;
}

export interface CreateAdDto {
  adset_id: string;
  name: string;
  creative?: any;
  existing_creative_id?: string;
}
