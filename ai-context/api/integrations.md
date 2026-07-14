---
type: api
group: integrations
sourceFile: src/lib/api.ts (integrationApi, evolutionApi, googleIntegrationApi)
usedByFeatures: [integrations, lb_forms, ads]
---
# API: integrations

All functions throw a `new Error(message)` on failure (message extracted from `error.response?.data?.{message|error}`, or via the shared `formatMetaErrorMessage(error, fallback)` helper for most `createMeta*`/`updateMeta*`/`duplicateMeta*` calls). `integrationApi` spans `src/lib/api.ts` lines 457–1447. Base URL: `API_BASE_URL = 'https://api.leadbajaar.com/api'`.

## Generic Integrations CRUD
| Function | Method + Endpoint | Params | Purpose | Line |
|---|---|---|---|---|
| `getIntegrations` | GET `/integrations` | — | List all integrations | 459 |
| `saveIntegration` | POST `/integrations` | `IntegrationConfig{type,config,isActive,environment}` | Create/connect new integration | 470 |
| `updateIntegration` | PUT `/integrations/{id}` | `id`, `IntegrationConfig` | Update integration config | 497 |
| `updateIntegrationStatus` | PATCH `/integrations/{id}/status` | `id`, `isActive` | Activate/deactivate | 514 |
| `getIntegrationLogs` | GET `/integrations/{id}/logs` | `id` | Full log history | 525 |
| `getLatestLog` | GET `/integrations/{id}/latest-log` | `id` | Most recent log (webhook "listen" polling) | 536 |
| `deleteIntegration` | DELETE `/integrations/{id}` | `id` | Remove integration | 547 |
| `getConnectedIntegrations` | GET `/integrations/connected` | — | List active connected integrations (used by hub, sidebar `canSee`, and most sub-pages) | 692 |
| `debugIntegrations` | GET `/debug-integrations` | — | Debug/diagnostic dump | 724 |

## WhatsApp Cloud API
| Function | Method + Endpoint | Params | Purpose | Line |
|---|---|---|---|---|
| `getWhatsAppProfiles` | GET `/integrations/whatsapp/profiles` | — | Business profiles | 557 |
| `getWhatsAppAccounts` | GET `/integrations/whatsapp/accounts` | — | Connected WABA accounts | 567 |
| `getWhatsAppTemplates` | GET `/integrations/whatsapp/{accountId}/templates` | `accountId` | List templates | 577 |
| `syncWhatsAppTemplates` | POST `/integrations/whatsapp/{accountId}/templates/sync` | `accountId` | Sync templates from Meta | 587 |
| `createWhatsAppTemplate` | POST `/integrations/whatsapp/{accountId}/templates` | `accountId`, `templateData` | Submit new template for approval | 601 |
| `checkIntegrationStatus` | GET `/integrations/whatsapp/{accountId}/status` | `accountId` | Detects `needs_token_update` | 624 |
| `markReauthenticated` | POST `/integrations/whatsapp/{accountId}/reauth` | `accountId` | Clear reauth flag | 634 |
| `updateAccessToken` | POST `/integrations/whatsapp/{accountId}/update-token` | `accountId`, `accessToken` | Update expired token | 644 |
| `updateWhatsAppTemplate` | PUT `/integrations/whatsapp/{accountId}/templates/{templateId}` | `accountId`, `templateId`, `templateData` | Edit/resubmit rejected template | 661 |
| `deleteWhatsAppTemplate` | DELETE `/integrations/whatsapp/{accountId}/templates/{templateId}` | `accountId`, `templateId` | Delete template | 671 |
| `getWhatsAppTemplateDetails` | GET `/integrations/whatsapp/{accountId}/templates/{templateId}/details` | `accountId`, `templateId` | Template detail | 681 |

## Facebook Lead Forms (manual) & Retrieval
| Function | Method + Endpoint | Params | Purpose | Line |
|---|---|---|---|---|
| `getFacebookLeadForms` | GET `/facebook-lead-forms` | — | List manually-connected lead forms | 714 |
| `retrieveFacebookLeads` | POST `/facebook-lead-retrieval` | `{form_id, integration_id, date_from?, date_to?}` | Manual/backfill lead pull (used from Leads cluster, cross-ref) | 826 |

## Meta OAuth, Status & Business Assets
| Function | Method + Endpoint | Params | Purpose | Line |
|---|---|---|---|---|
| `connectMeta` | GET `/meta/connect` | — | Returns `auth_url` for OAuth popup | 848 |
| `getMetaStatus` | GET `/meta/status` | — | Connection status, pages, businesses, `setup_checklist` | 857 |
| `disconnectMeta` | POST `/meta/deauthorize` | — | Disconnect Meta account | 866 |
| `dataDeletionRequest` | POST `/meta/data-deletion` | — | GDPR-style data deletion request | 875 |
| `getDeletionRequests` | GET `/meta/deletion-requests` | — | List past deletion requests | 884 |
| `getMetaBusinessAssets` | GET `/meta/business/{businessId}/assets` | `businessId` | Ad accounts + pages for a Business Manager | 893 |
| `getMetaPages` | GET `/meta/pages` | — | Connected Facebook pages | 735 |
| `getMetaPageForms` | GET `/meta/pages/{pageId}/forms` | `pageId` | Lead forms for a page | 745 |
| `getMetaWebhookChecklist` | GET `/meta/pages/{pageId}/webhook-checklist` | `pageId` | Permissions + subscription status | 976 |
| `subscribeMetaPage` | POST `/meta/pages/{pageId}/subscribe` | `pageId` | Subscribe page to leadgen webhook | 1104 |
| `createMetaPageForm` | POST `/meta/pages/{pageId}/forms` | `pageId`, `{name,questions,privacy_policy?,follow_up_url?}` | Create new lead form on Facebook | 1074 |
| `trackMetaForm` | POST `/meta/pages/{pageId}/forms/track` | `pageId`, `formId`, `formName?`, `pageName?` | Mark a form for lead sync | 1308 |
| `getMetaTrackedForms` | GET `/meta/pages/{pageId}/forms/tracked` | `pageId` | List tracked forms | 1317 |
| `getMetaFormDetails` | GET `/meta/forms/{formId}` | `formId` | Form detail | 1289 |
| `updateMetaFormStatus` | POST `/meta/forms/{formId}/status` | `formId`, `status` | Archive/activate a form | 1298 |
| `syncMetaLeads` | POST `/meta/forms/{formId}/sync-leads` | `formId`, `days=7` | Manual historical lead sync | 1010 |
| `testMetaLeadRetrieval` | GET `/meta/debug/lead/{leadId}` | `leadId` | Round-trip debug fetch of one lead | 986 |
| `syncMetaAssets` | POST `/meta/ads/sync` | — | Sync all ad accounts/pages | 1084 |

## Meta Ads: Accounts, Campaigns, Ad Sets, Ads, Creatives
| Function | Method + Endpoint | Params | Purpose | Line |
|---|---|---|---|---|
| `getMetaAdAccounts` | GET `/meta/ads/adaccounts` | — | List ad accounts | 756 |
| `getMetaBusinessAdAccounts` | GET `/meta/ads/businesses/{businessId}/adaccounts` | `businessId` | Ad accounts scoped to a business | 766 |
| `syncMetaAdAccountDetails` | POST `/meta/ads/adaccounts/{adAccountId}/sync` | `adAccountId` | Deep sync one account | 1094 |
| `getMetaCampaigns` | GET `/meta/ads/adaccounts/{adAccountId}/campaigns` | `adAccountId` | List campaigns | 776 |
| `createMetaCampaign` | POST `/meta/ads/adaccounts/{adAccountId}/campaigns` | `adAccountId`, `{name,objective?,status?,special_ad_categories?}` | Create campaign | 1020 |
| `updateMetaCampaign` | POST `/meta/ads/campaigns/{campaignId}` | `campaignId`, `data` | Rename/update campaign | 1144 |
| `duplicateMetaCampaign` | POST `/meta/ads/campaigns/{campaignId}/duplicate` | `campaignId`, `{status?,rename_suffix?}` | Duplicate campaign | 1226 |
| `getMetaCampaignAds` | GET `/meta/ads/campaigns/{campaignId}/ads` | `campaignId` | Ads under a campaign | 1346 |
| `getMetaAdSets` | GET `/meta/ads/campaigns/{campaignId}/adsets` | `campaignId` | List ad sets | 786 |
| `createMetaAdSet` | POST `/meta/ads/adaccounts/{adAccountId}/adsets` | `adAccountId`, `data` | Create ad set | 1029 |
| `updateMetaAdSet` | POST `/meta/ads/adsets/{adSetId}` | `adSetId`, `{daily_budget?,status?}` | Update ad set (budget etc.) — note: `/ads/campaigns/page.tsx` calls a differently-shaped `POST /meta/ads/adsets/{campaignId}/budget` directly via its own fetch helper, not this function | 1038 |
| `getMetaAds` | GET `/meta/ads/adsets/{adSetId}/ads` | `adSetId` | Ads under an ad set | 796 |
| `getMetaAccountAds` | GET `/meta/ads/adaccounts/{adAccountId}/ads` | `adAccountId` | All ads for an account | 1337 |
| `createMetaAd` | POST `/meta/ads/adaccounts/{adAccountId}/ads` | `adAccountId`, `data` | Create ad | 1047 |
| `updateMetaAd` | POST `/meta/ads/ads/{adId}` | `adId`, `data` | Update ad | 1355 |
| `getMetaAdCreatives` | GET `/meta/ads/adaccounts/{adAccountId}/adcreatives` | `adAccountId` | List creatives (library) | 1056 |
| `createMetaAdCreativeStandalone` | POST `/meta/ads/adaccounts/{adAccountId}/adcreatives` | `adAccountId`, `data` | Create standalone creative | 1065 |
| `uploadMetaAdImage` | POST `/meta/ads/adaccounts/{adAccountId}/adimages` | `adAccountId`, `image: File\|string` | Upload ad image (multipart or URL) | 1178 |
| `uploadMetaAdVideo` | POST `/meta/ads/adaccounts/{adAccountId}/advideos` | `adAccountId`, `video: File\|string`, `title?` | Upload ad video | 1196 |
| `getMetaAdPreview` | GET `/meta/ads/previews/{objectId}` | `objectId`, `adFormat='DESKTOP_FEED_STANDARD'` | Rendered ad preview | 1215 |
| `getMetaAdAccountInsights` | GET `/meta/ads/adaccounts/{adAccountId}/insights` | `adAccountId` | Spend/leads/CTR insights | 806 |
| `getMetaDeliveryEstimate` | GET `/meta/ads/adaccounts/{adAccountId}/delivery-estimate` | `adAccountId`, `targetingSpec` (query param) | Estimated reach for targeting | 1326 |
| `updateMetaStatus` | POST `/meta/ads/{objectId}/status` | `objectId`, `status: ACTIVE\|PAUSED\|ARCHIVED` | Pause/resume/archive any ads object | 816 |
| `duplicateMetaObject` | POST `/meta/ads/{objectId}/duplicate` | `objectId` | Duplicate any ads object | 1235 |
| `deleteMetaObject` | DELETE `/meta/ads/{objectId}` | `objectId` | Delete any ads object | 1134 |
| `getMetaTemplates` | GET `/meta/ads/templates` | — | Pre-built campaign templates | 1114 |
| `launchMetaTemplate` | POST `/meta/ads/adaccounts/{adAccountId}/launch-template` | `adAccountId`, `templateId`, `customName?` | One-click launch a template campaign | 1124 |
| `createMetaCustomAudience` | POST `/meta/ads/adaccounts/{adAccountId}/customaudiences` | `adAccountId`, `{name,subtype?,description?}` | Create custom audience | 1153 |
| `createMetaLookalikeAudience` | POST `/meta/ads/adaccounts/{adAccountId}/lookalike-audiences` | `adAccountId`, `{name,origin_audience_id,country?,ratio?,lookalike_type?,description?}` | Create lookalike audience | 1162 |
| `getMetaOfflineEventSets` | GET `/meta/ads/offline-event-sets/{objectId}` | `objectId` | Offline event sets | 1244 |
| `createMetaOfflineEventSet` | POST `/meta/ads/offline-event-sets/{businessId}` | `businessId`, `{name,description?}` | Create offline event set | 1253 |
| `getMetaAutomatedRules` | GET `/meta/ads/adaccounts/{adAccountId}/adrules` | `adAccountId` | List automated rules | 1262 |
| `createMetaAutomatedRule` | POST `/meta/ads/adaccounts/{adAccountId}/adrules` | `adAccountId`, `{name,filters?,execution_options?}` | Create automated rule | 1271 |
| `deleteMetaAutomatedRule` | DELETE `/meta/ads/adrules/{ruleId}` | `ruleId` | Delete automated rule | 1280 |

## Facebook / Meta Conversions API (CAPI)
| Function | Method + Endpoint | Params | Purpose | Line |
|---|---|---|---|---|
| `sendConversionEvent` | POST `/facebook/conversion-api/send-event` | `{pixel_id,event_name,event_data,user_data?,event_id?,integration_id?}` | Send one live event | 903 |
| `sendBatchConversionEvents` | POST `/facebook/conversion-api/send-batch-events` | `{pixel_id,events[],integration_id?}` | Send batch events | 920 |
| `sendTestConversionEvent` | POST `/facebook/conversion-api/send-test-event` | `{pixel_id,test_event_code,event_name,event_data,user_data?,event_id?,integration_id?}` | Send a Meta-test-mode event | 938 |
| `getConversionApiEventTypes` | GET `/facebook/conversion-api/event-types` | — | Standard event type catalog | 956 |
| `getConversionApiConfiguration` | GET `/facebook/conversion-api/configuration` | — | List manual pixel configs | 966 |
| `updateConversionApiConfiguration` | POST `/facebook/conversion-api/configuration` | `{integration_id,pixel_id,test_event_code?}` | Update manual config | 996 |

## Meta Pixels (OAuth-synced)
| Function | Method + Endpoint | Params | Purpose | Line |
|---|---|---|---|---|
| `getMetaPixels` | GET `/meta/pixels` | — | List synced pixels | 1365 |
| `syncMetaPixels` | POST `/meta/pixels/sync` | — | Sync pixels from connected Meta account | 1401 |
| `createMetaPixel` | POST `/meta/pixels/create` | `{name, ad_account_id}` | Create new pixel in an ad account | 1439 |
| `updateMetaPixel` | PATCH `/meta/pixels/{id}` | `id`, `{name?,is_active?}` | Rename/toggle pixel | 1410 |
| `deleteMetaPixel` | DELETE `/meta/pixels/{id}` | `id` | Delete pixel | 1420 |
| `getMetaPixelDiagnostics` | GET `/meta/pixels/{pixelId}/diagnostics` | `pixelId` | Diagnostics | 1392 |
| `getMetaPixelRoiSummary` | GET `/meta/pixels/roi-summary?days={n}` | `days=30` | Summary/breakdown/chart_data for ROI dashboards | 1430 |
| `sendMetaCapiEvent` | POST `/meta/pixels/send-event` or `/meta/pixels/test-event` | `{pixel_id,event_name,event_data,user_data?,test_event_code?}` | Alternate CAPI send path (chooses test vs. live endpoint based on `test_event_code` presence) | 1374 |

## Other cross-cluster helpers used by this cluster
| Function | Method + Endpoint | Purpose | Line |
|---|---|---|---|
| `sendBroadcast` (integrationApi) | POST `/leads/send-template` | Bulk WhatsApp template send to leads (Leads cluster, called from `LeadConversionTracker`-adjacent flows) | 703 |
| `companyApi.getSettings` / `updateSettings` | GET/POST `/company/settings` (path inferred from usage, not re-verified here) | WhatsApp welcome/meeting-message automation settings (fetched but **not rendered/saved** anywhere in the reviewed WhatsApp page — see [pages/integrations-whatsapp.md](../pages/integrations-whatsapp.md)) | 1451, 1461 |

## evolutionApi (`src/lib/api.ts` lines 2207–2255+)
| Function | Method + Endpoint | Purpose |
|---|---|---|
| `getAccounts` | GET `/evolution/accounts` | List Evolution WhatsApp accounts |
| `createAccount` | POST `/evolution/accounts` `{phone_number}` | Create shell account |
| `connectInstance` | POST `/evolution/accounts/{instanceName}/connect` | Start QR pairing |
| `getQrCode` | GET `/evolution/accounts/{instanceName}/qrcode` | Poll for QR image |
| `getStatus` | GET `/evolution/accounts/{instanceName}/status` | Poll connection state |
| `disconnectInstance` | POST `/evolution/accounts/{instanceName}/disconnect` | Disconnect |
| `deleteAccount` | DELETE `/evolution/accounts/{instanceName}` | Delete account |
| `getConversations` / `getMessages` / `sendMessage` / `clearSession` | `/evolution/inbox/...` | Belong to the Evolution Inbox/Chatbot cluster (Live Chat) — cross-reference only, not part of the connect-setup flow documented here. |

## googleIntegrationApi (`src/lib/api.ts` lines 2154–2184)
| Function | Method + Endpoint | Purpose |
|---|---|---|
| `getStatus` | GET `/google/status` | Connection + per-scope status |
| `disconnect` | DELETE `/google/disconnect` | Disconnect Google account |
| `getConnectUrl` | GET `/google/connect?scope={scope}` | OAuth URL for a given scope |
- **Belongs to another cluster** (Meetings/Calendar) — included here only because `GoogleAccountCard` (rendered in the Integrations hub) uses it.

## Coverage note
Read in full (lines 457–1447 for `integrationApi`; targeted reads for `evolutionApi` 2207–2255 and `googleIntegrationApi` 2154–2184). Nothing in this range was skipped.
