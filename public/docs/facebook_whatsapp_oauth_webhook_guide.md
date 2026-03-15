# Facebook Lead Ads + WhatsApp Cloud API Integration Guide (OAuth + Webhook)
**Language:** Hindi (with code samples in English)  
**Scope:** Step-by-step developer guide to integrate Facebook Lead Forms and WhatsApp Cloud API into a Laravel backend + React frontend CRM. Covers OAuth flow, automatic webhook subscription, webhook handling, DB mapping, and sample code.

---

## Overview (What you'll build)
- React frontend: "Connect Facebook" / "Connect WhatsApp" button that starts OAuth.
- Laravel backend:
  - Handles OAuth callback and exchanges code for tokens.
  - Saves user tokens, page IDs, and WhatsApp business account IDs.
  - Subscribes connected Pages/WhatsApp accounts to the app-level webhook using the Page Access Token.
  - A single webhook endpoint (`/facebook/webhook`) receives events for all clients and maps `page_id` / `wa_id` to CRM accounts.
  - Fetch full lead details when webhook sends `leadgen_id`.

---

## Prerequisites
1. Meta Developer account and an App (https://developers.facebook.com/)
2. Add products: **Facebook Login**, **Webhooks**, **WhatsApp**, **Pages**, **Leads Retrieval**
3. App configured with a valid callback URL and webhook callback URL (HTTPS).
4. Laravel (8/9/10) backend with HTTPS domain.
5. React frontend.
6. `laravel/socialite` (optional) or manual OAuth exchange using HTTP client.

---

## 1) App-level setup (one-time)
1. Create Meta App → Add **Webhooks** product.
2. Set the **Callback URL** to your backend endpoint:
   ```
   https://your-crm.com/facebook/webhook
   ```
   and add a **Verify Token** (store same in `.env` as `FB_VERIFY_TOKEN`).
3. Add required permissions for review if you want public use:
   - `pages_show_list`, `pages_read_engagement`, `leads_retrieval`, `whatsapp_business_management`, `whatsapp_business_messaging`, `ads_management`, etc.
4. Add **Facebook Login** product and set OAuth redirect URI:
   ```
   https://your-crm.com/facebook/callback
   ```

---

## 2) React: "Connect Facebook" button (frontend)
- Redirect user to Meta OAuth URL:
```
https://www.facebook.com/v16.0/dialog/oauth?
  client_id={APP_ID}&
  redirect_uri={REDIRECT_URI}&
  scope=pages_show_list,leads_retrieval,whatsapp_business_messaging,whatsapp_business_management
```
- After user authorizes, Facebook redirects to `REDIRECT_URI` with `code` query param.
- Send `code` to Laravel backend (server-side) to exchange for tokens.

Example React (simplified):
```js
// Open OAuth in new window
const openFbOAuth = () => {
  const url = `https://www.facebook.com/v16.0/dialog/oauth?client_id=${APP_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=pages_show_list,leads_retrieval,whatsapp_business_messaging,whatsapp_business_management`;
  window.location.href = url;
}
```

---

## 3) Laravel: Exchange code -> get user token, get pages, store tokens
Route:
```php
Route::get('/facebook/callback', [FacebookController::class, 'callback']);
```

Controller (simplified):
```php
public function callback(Request $req) {
    $code = $req->get('code');
    // Exchange code for short-lived user access token
    $resp = Http::get('https://graph.facebook.com/v16.0/oauth/access_token', [
        'client_id' => env('FB_APP_ID'),
        'redirect_uri' => env('FB_REDIRECT_URI'),
        'client_secret' => env('FB_APP_SECRET'),
        'code' => $code,
    ])->json();

    $shortLived = $resp['access_token'];

    // Exchange for long-lived token
    $resp2 = Http::get('https://graph.facebook.com/v16.0/oauth/access_token', [
        'grant_type' => 'fb_exchange_token',
        'client_id' => env('FB_APP_ID'),
        'client_secret' => env('FB_APP_SECRET'),
        'fb_exchange_token' => $shortLived,
    ])->json();

    $longLivedUserToken = $resp2['access_token'];

    // Get pages the user manages
    $pages = Http::get("https://graph.facebook.com/v16.0/me/accounts", [
        'access_token' => $longLivedUserToken
    ])->json();

    // Store pages and their page_access_token in DB mapped to CRM user
    foreach ($pages['data'] as $p) {
        // save page: id, name, page_access_token => map to your user record
    }

    // For WhatsApp: you can get business accounts similarly when permissions present
}
```

**Store securely:**
- `page_id`, `page_access_token`, `token_expires_at`, `user_id` (your CRM user).
- For WhatsApp: `whatsapp_business_account_id`, `phone_number_id`.

---

## 4) Auto-subscribe Page to App Webhook (server-side)
After storing `page_access_token` for each page, call:
```php
Http::post("https://graph.facebook.com/{$pageId}/subscribed_apps", [
    'subscribed_fields' => 'leadgen,messages,comments,messaging_postbacks',
    'access_token' => $pageAccessToken
]);
```
- This tells Facebook to send events for that page to your **app-level webhook URL** (the URL you registered in App Settings).
- No per-page webhook URL is needed.

---

## 5) Webhook endpoint (verify + handle) — Laravel
Routes:
```php
Route::get('/facebook/webhook', [WebhookController::class, 'verify']);
Route::post('/facebook/webhook', [WebhookController::class, 'handle']);
```

Verify:
```php
public function verify(Request $req) {
    if ($req->get('hub_verify_token') === env('FB_VERIFY_TOKEN')) {
        return response($req->get('hub_challenge'));
    }
    return response('Invalid token', 403);
}
```

Handle (simplified):
```php
public function handle(Request $req) {
    $payload = $req->all();
    foreach ($payload['entry'] as $entry) {
        $pageId = $entry['id']; // page id or wa_business_id
        foreach ($entry['changes'] as $change) {
            $field = $change['field'];
            $value = $change['value'];

            if ($field === 'leadgen') {
                $leadgenId = $value['leadgen_id'];
                // Fetch full lead details using Page token
                $pageToken = Page::where('page_id', $pageId)->first()->page_access_token;
                $lead = Http::get("https://graph.facebook.com/v16.0/{$leadgenId}", [
                    'access_token' => $pageToken
                ])->json();
                // Save lead by form_id mapping
                $formId = $lead['form_id'] ?? null;
                // map page_id+form_id -> crm_account and save lead
            } elseif ($field === 'messages' || isset($value['messages'])) {
                // WhatsApp / Messenger message handling
            }
        }
    }
    return response('EVENT_RECEIVED', 200);
}
```

---

## 6) Fetch lead details & map to form
- When you GET `/{leadgen_id}?access_token={page_token}`, response contains `form_id`, `field_data`.
- Store leads in `leads` table: `id`, `leadgen_id`, `page_id`, `form_id`, `data (json)`, `created_at`.

---

## 7) DB Schema (simple)
```sql
users (id, name, email, ...)

facebook_pages (
  id,
  user_id,         -- your CRM user
  page_id,         -- FB page id
  page_name,
  page_access_token,
  token_expires_at,
  created_at, updated_at
)

lead_forms (
  id,
  page_id,         -- FB page_id
  form_id,         -- FB form id
  name,
  active (bool)
)

leads (
  id,
  crm_user_id,
  page_id,
  form_id,
  leadgen_id,
  data json,
  received_at
)

whatsapp_accounts (
  id,
  user_id,
  waba_id,         -- WhatsApp Business Account ID
  phone_number_id,
  access_token,
  created_at, updated_at
)

whatsapp_messages (
  id, waba_id, from_number, to_number, body json, received_at
)
```

---

## 8) WhatsApp Cloud API OAuth specifics
- Scope: `whatsapp_business_messaging`, `whatsapp_business_management`
- After user OAuth and getting user token, get `whatsapp_business_accounts`:
```
GET /{user-id}/accounts?access_token={user_token}
```
- Get `whatsapp_business_account_id`, then list phone numbers:
```
GET /{waba_id}/phone_numbers?access_token={page_access_token}
```
- Store `phone_number_id` and `access_token`.

### Send message (Example)
```php
Http::post("https://graph.facebook.com/v16.0/{$phoneNumberId}/messages", [
  'messaging_product' => 'whatsapp',
  'to' => '919876543210',
  'type' => 'text',
  'text' => ['body' => 'Hello from CRM'],
  'access_token' => $pageAccessToken
]);
```

---

## 9) Security & Best Practices
- Store tokens encrypted at rest.
- Refresh long-lived tokens when needed; monitor expiry.
- Validate webhook payload signatures (X-Hub-Signature header) if required.
- Implement idempotency (save leads by `leadgen_id` unique) to avoid duplicates.
- Rate limit API calls and implement exponential backoff.

---

## 10) Example: Full lead webhook payload (leadgen)
```json
{
  "object": "page",
  "entry": [
    {
      "id": "123456789012345",
      "time": 1672531200,
      "changes": [
        {
          "field": "leadgen",
          "value": {
            "leadgen_id": "678901234567890",
            "form_id": "987654321098765",
            "page_id": "123456789012345"
          }
        }
      ]
    }
  ]
}
```

---

## 11) Flow Summary (TL;DR)
1. App-level webhook URL set once in Meta Developer Console.
2. User clicks "Connect Facebook" → OAuth → server gets long-lived token.
3. Server saves page tokens and subscribes page to app webhook via `/subscribed_apps`.
4. Facebook posts events to the single webhook URL.
5. Server inspects `page_id` / `waba_id`, maps to CRM user, fetches details (lead/message), saves to DB.

---

## 12) Next Steps (Implementation checklist)
- [ ] Create Meta App & configure webhook callback url.
- [ ] Implement OAuth flow in React + Laravel.
- [ ] Save tokens + page/waba mapping.
- [ ] Auto-subscribe pages to webhook.
- [ ] Build webhook handler (verify + handle).
- [ ] Implement lead fetch & save logic.
- [ ] Implement WhatsApp message handling & sending.
- [ ] Add monitoring & token refresh jobs.

---

If you want, I can now export this doc as a markdown file and give you a download link. Or I can generate ready-to-use Laravel controllers + migrations as code files. Kaunsa chahiye?