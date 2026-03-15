# Facebook OAuth Setup Guide for LeadBajar

This guide will help you set up Facebook OAuth integration for your LeadBajar CRM system.

## 🚀 **Overview**

The Facebook OAuth integration allows users to connect their Facebook accounts and automatically access:
- **Facebook Pages** - For lead generation and page management
- **WhatsApp Business Accounts** - For messaging and automation
- **Instagram Business Accounts** - For social media management
- **Ad Accounts** - For advertising management
- **Lead Forms** - For automatic lead capture

## 📋 **Prerequisites**

1. **Facebook Developer Account** - Create at [developers.facebook.com](https://developers.facebook.com)
2. **Laravel Backend** - Your existing LeadBajar backend
3. **React Frontend** - Your existing LeadBajar frontend
4. **HTTPS Domain** - Required for Facebook OAuth (use ngrok for local development)

## 🔧 **Step 1: Facebook App Setup**

### 1.1 Create Facebook App
1. Go to [Facebook Developers](https://developers.facebook.com)
2. Click "Create App"
3. Choose "Business" as app type
4. Fill in app details:
   - **App Name**: LeadBajar CRM
   - **App Contact Email**: your-email@example.com
   - **App Purpose**: Business

### 1.2 Add Required Products
Add these products to your Facebook app:
- ✅ **Facebook Login**
- ✅ **Webhooks**
- ✅ **WhatsApp**
- ✅ **Pages**
- ✅ **Leads Retrieval**
- ✅ **Instagram Basic Display**
- ✅ **Marketing API**

### 1.3 Configure Facebook Login
1. Go to **Facebook Login** → **Settings**
2. Add Valid OAuth Redirect URIs:
   ```
   https://your-domain.com/api/facebook/oauth/callback
   http://localhost:8000/api/facebook/oauth/callback (for development)
   ```
3. Enable **Client OAuth Login**
4. Enable **Web OAuth Login**

### 1.4 Configure Webhooks
1. Go to **Webhooks** → **Products**
2. Add webhook URL:
   ```
   https://your-domain.com/api/webhook/leadform
   ```
3. Set **Verify Token**: `your_webhook_verify_token`
4. Subscribe to these fields:
   - ✅ `leadgen`
   - ✅ `messages`
   - ✅ `comments`
   - ✅ `messaging_postbacks`

### 1.5 Configure WhatsApp
1. Go to **WhatsApp** → **API Setup**
2. Add webhook URL:
   ```
   https://your-domain.com/api/webhook/whatsapp
   ```
3. Set **Verify Token**: `123abc`
4. Subscribe to:
   - ✅ `messages`
   - ✅ `message_deliveries`
   - ✅ `message_reads`

## 🔧 **Step 2: Backend Configuration**

### 2.1 Environment Variables
Add these to your `.env` file:

```env
# Facebook OAuth Configuration
FACEBOOK_CLIENT_ID=your_facebook_app_id
FACEBOOK_CLIENT_SECRET=your_facebook_app_secret
FACEBOOK_REDIRECT_URI=https://your-domain.com/api/facebook/oauth/callback
FACEBOOK_VERIFY_TOKEN=your_webhook_verify_token

# WhatsApp Configuration
WHATSAPP_VERIFY_TOKEN=123abc
```

### 2.2 Run Migrations
```bash
cd leadbajar-backend
php artisan migrate
```

### 2.3 Update CORS Configuration
Ensure your `config/cors.php` allows the frontend domain:

```php
'allowed_origins' => [
    'http://localhost:3000',
    'https://your-frontend-domain.com',
],
```

## 🔧 **Step 3: Frontend Configuration**

### 3.1 Update API Base URL
In your frontend `.env.local`:

```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api
```

### 3.2 Install Dependencies
The required dependencies are already included in your `package.json`.

## 🚀 **Step 4: Testing the Integration**

### 4.1 Local Development Setup
1. **Start Backend**:
   ```bash
   cd leadbajar-backend
   php artisan serve
   ```

2. **Start Frontend**:
   ```bash
   cd leadbajaar1.0
   npm run dev
   ```

3. **Use ngrok for HTTPS** (required for Facebook OAuth):
   ```bash
   ngrok http 8000
   ```
   Update your Facebook app redirect URIs with the ngrok URL.

### 4.2 Test OAuth Flow
1. Go to **Integrations** → **Facebook OAuth** tab
2. Click **"Connect Facebook Services"**
3. Complete Facebook OAuth flow
4. Verify services are connected in the dashboard

## 📊 **Step 5: Using the Integration**

### 5.1 Connect Facebook Services
1. Navigate to **Integrations** → **Facebook OAuth**
2. Click **"Connect Facebook Services"**
3. Authorize the required permissions
4. Services will be automatically connected

### 5.2 Manage Connected Services
- **View Analytics**: See performance metrics for pages and accounts
- **Sync Services**: Refresh data from Facebook API
- **Manage Permissions**: View and update service permissions

### 5.3 Lead Capture
- Facebook Lead Forms will automatically capture leads
- Leads will be processed through your existing webhook system
- WhatsApp welcome messages will be sent automatically

## 🔐 **Security Considerations**

### 5.1 Token Management
- Access tokens are stored encrypted in the database
- Long-lived tokens (60 days) are used for better reliability
- Automatic token refresh is implemented

### 5.2 Webhook Security
- Webhook verification tokens are used
- Request validation is implemented
- Error logging and monitoring

### 5.3 Data Privacy
- Only necessary permissions are requested
- User data is handled according to Facebook's policies
- GDPR compliance considerations

## 🐛 **Troubleshooting**

### Common Issues

#### 1. OAuth Redirect URI Mismatch
**Error**: `redirect_uri_mismatch`
**Solution**: Ensure the redirect URI in Facebook app matches exactly with your backend URL.

#### 2. Invalid Client ID
**Error**: `invalid_client_id`
**Solution**: Check that `FACEBOOK_CLIENT_ID` in `.env` matches your Facebook app ID.

#### 3. Webhook Verification Failed
**Error**: `webhook_verification_failed`
**Solution**: Ensure `FACEBOOK_VERIFY_TOKEN` matches the token set in Facebook app webhook settings.

#### 4. Token Expired
**Error**: `token_expired`
**Solution**: Use the refresh token functionality or reconnect the account.

### Debug Mode
Enable debug mode in your `.env`:
```env
APP_DEBUG=true
LOG_LEVEL=debug
```

Check logs in `storage/logs/laravel.log` for detailed error information.

## 📈 **Advanced Features**

### 1. Page Insights
- View page performance metrics
- Track impressions and engagement
- Monitor page growth

### 2. WhatsApp Management
- Manage multiple phone numbers
- View account status and limits
- Monitor message delivery

### 3. Lead Analytics
- Track lead sources
- Monitor conversion rates
- Analyze lead quality

### 4. Automated Workflows
- Welcome message automation
- Lead nurturing sequences
- Follow-up campaigns

## 🔄 **Maintenance**

### Regular Tasks
1. **Token Refresh**: Monitor token expiration and refresh as needed
2. **Service Sync**: Regularly sync data from Facebook API
3. **Error Monitoring**: Check logs for any integration errors
4. **Permission Updates**: Ensure all required permissions are granted

### Monitoring
- Check integration status in the dashboard
- Monitor webhook delivery success rates
- Track API usage and limits

## 📞 **Support**

If you encounter issues:
1. Check the troubleshooting section above
2. Review Facebook Developer documentation
3. Check Laravel logs for detailed error messages
4. Ensure all environment variables are correctly set

## 🎉 **Success!**

Once set up, your LeadBajar system will have:
- ✅ Automatic Facebook OAuth integration
- ✅ Multi-service management (Pages, WhatsApp, Instagram, Ads)
- ✅ Real-time lead capture from Facebook Lead Forms
- ✅ Automated WhatsApp follow-up messages
- ✅ Comprehensive analytics and monitoring
- ✅ Secure token management and refresh

Your CRM is now fully integrated with Facebook's ecosystem!


