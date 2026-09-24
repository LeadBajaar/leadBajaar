export interface IntegrationConfig {
  type: string;
  config: Record<string, unknown>;
  isActive: boolean;
  environment: 'sandbox' | 'production';
}
