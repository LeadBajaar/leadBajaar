# Facebook Conversion API Implementation Guide

## Overview

This guide covers the complete implementation of Facebook Conversion API in your LeadBajar project. The Conversion API allows you to track conversions and events server-side, providing better attribution and data privacy compliance.

## Features Implemented

### Backend Features
- **FacebookConversionApiService**: Core service for sending conversion events
- **FacebookConversionApiController**: API endpoints for event management
- **Automatic Lead Tracking**: Server-side tracking when leads are created or updated
- **Stage Change Tracking**: Automatic tracking when leads progress through stages
- **Batch Event Support**: Send multiple events in a single API call
- **Test Event Support**: Send test events for validation
- **Event Diagnostics**: Monitor pixel health and match quality via Graph API 🩺
- **Offline Event Sets**: Manage offline conversions hubs for deal attribution

### Frontend Features
- **Conversion API Manager**: Configure and manage Conversion API settings
- **Diagnostics Dashboard**: Real-time view of pixel health and EMQ
- **Lead Conversion Tracker**: Manually track lead conversions
- **Conversion API Tester**: Test and validate your setup
- **Event Type Browser**: View available event types
- **Configuration Management**: Update pixel IDs and test event codes

## Setup Instructions

### 1. Backend Configuration

#### Environment Variables
Add these to your `.env` file:

```env
# Facebook Conversion API
FACEBOOK_CONVERSION_API_TEST_EVENT_CODE=your_test_event_code
FACEBOOK_DEFAULT_PIXEL_ID=your_default_pixel_id
```

#### Database Migration
The existing `integrations` table will store Conversion API configurations. No additional migration is needed.

### 2. Frontend Configuration

The frontend components are already integrated into the integrations page. Navigate to:
- **Integrations** → **Conversion API** tab

### 3. Facebook Setup

#### Create a Facebook Pixel
1. Go to [Facebook Events Manager](https://business.facebook.com/events_manager)
2. Create a new Pixel
3. Note down your Pixel ID

#### Get Page Access Token
1. Go to [Facebook for Developers](https://developers.facebook.com/)
2. Create or select your app
3. Add Facebook Login and Pages permissions
4. Generate a Page Access Token with these permissions:
   - `pages_show_list`
   - `pages_read_engagement`
   - `pages_manage_metadata`
   - `ads_management`

#### Test Event Code (Optional)
1. In Events Manager, go to your Pixel
2. Go to "Test Events" tab
3. Generate a test event code for testing

## Usage Guide

### 1. Configure Conversion API

1. Navigate to **Integrations** → **Conversion API**
2. Click **Configure** on your Facebook integration
3. Enter your Pixel ID
4. Optionally add a test event code
5. Click **Update Configuration**

### 2. Test Your Setup

1. Go to the **Conversion API Tester** section
2. Select your configuration
3. Choose **Connection Test** tab
4. Click **Test Connection**
5. Verify the test event appears in Facebook Events Manager

### 3. Track Lead Conversions

#### Automatic Tracking
- New leads are automatically tracked when created
- Lead stage changes are tracked for significant milestones
- No additional configuration needed

#### Manual Tracking
1. Go to **Lead Conversion Tracker**
2. Select your configuration
3. Choose leads to track
4. Select event type
5. Click **Send Conversion Events**

### 4. Monitor Events

1. Go to [Facebook Events Manager](https://business.facebook.com/events_manager)
2. Select your Pixel
3. View **Events** tab to see tracked events
4. Use **Test Events** tab to verify test events

## API Endpoints

### Send Single Event
```http
POST /api/facebook/conversion-api/send-event
```

**Request Body:**
```json
{
  "pixel_id": "123456789",
  "event_name": "Lead",
  "event_data": {
    "content_name": "Lead Form Submission",
    "value": 100,
    "currency": "USD"
  },
  "user_data": {
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe"
  },
  "integration_id": 1
}
```

### Send Batch Events
```http
POST /api/facebook/conversion-api/send-batch-events
```

**Request Body:**
```json
{
  "pixel_id": "123456789",
  "events": [
    {
      "event_name": "Lead",
      "event_data": {...},
      "user_data": {...}
    }
  ],
  "integration_id": 1
}
```

### Send Test Event
```http
POST /api/facebook/conversion-api/send-test-event
```

**Request Body:**
```json
{
  "pixel_id": "123456789",
  "test_event_code": "TEST12345",
  "event_name": "Lead",
  "event_data": {...},
  "user_data": {...},
  "integration_id": 1
}
```

### Get Configuration
```http
GET /api/facebook/conversion-api/configuration
```

### Update Configuration
```http
POST /api/facebook/conversion-api/configuration
```

**Request Body:**
```json
{
  "integration_id": 1,
  "pixel_id": "123456789",
  "test_event_code": "TEST12345"
}
```

## Event Types Supported

### Standard Events
- **Lead**: Lead generation events
- **PageView**: Page view events
- **Purchase**: Purchase events
- **AddToCart**: Add to cart events
- **InitiateCheckout**: Checkout initiation events
- **CompleteRegistration**: Registration completion events
- **ViewContent**: Content view events
- **Search**: Search events
- **AddToWishlist**: Wishlist events
- **Subscribe**: Subscription events

### Custom Events
You can send any custom event name with custom data.

## Data Privacy & Compliance

### User Data Hashing
All user data is automatically hashed using SHA-256 for privacy compliance:
- Email addresses
- Phone numbers
- Names
- Location data

### Data Retention
- User data is not stored permanently
- Only hashed data is sent to Facebook
- Original data remains in your database

## Troubleshooting

### Common Issues

#### 1. "Access token not found" Error
- Ensure your Facebook integration has a valid page access token
- Check that the integration is active
- Verify the token has required permissions

#### 2. "Pixel not found" Error
- Verify the Pixel ID is correct
- Ensure the pixel belongs to the same ad account as your access token
- Check that the pixel is active

#### 3. Events not appearing in Facebook
- Check the test event code if using test events
- Verify the access token has `ads_management` permission
- Ensure the pixel is properly configured

#### 4. Validation Errors
- Check that all required fields are provided
- Ensure JSON format is valid
- Verify event data structure matches Facebook requirements

### Debug Mode

Enable debug logging by setting in your `.env`:
```env
LOG_LEVEL=debug
```

Check logs in `storage/logs/laravel.log` for detailed error information.

### Test Event Verification

1. Use the Conversion API Tester
2. Send a test event with a test event code
3. Check Facebook Events Manager → Test Events
4. Verify the event appears within 5-10 minutes

## Best Practices

### 1. Event Naming
- Use consistent event names
- Follow Facebook's naming conventions
- Use descriptive custom event names

### 2. Data Quality
- Always provide email when available
- Include phone numbers for better matching
- Use consistent currency codes

### 3. Testing
- Always test with test event codes first
- Verify events in Facebook Events Manager
- Test different event types

### 4. Monitoring
- Monitor conversion rates
- Track event delivery success
- Set up alerts for failures

## Advanced Configuration

### Custom Event Mapping
You can customize how lead stages map to Facebook events by modifying the `getEventNameForStage` method in `LeadController.php`:

```php
private function getEventNameForStage(string $stage): string
{
    $stageEventMap = [
        'Qualified' => 'CompleteRegistration',
        'Proposal' => 'ViewContent',
        'Negotiation' => 'InitiateCheckout',
        'Closed Won' => 'Purchase'
    ];

    return $stageEventMap[$stage] ?? 'Lead';
}
```

### Batch Processing
For high-volume scenarios, consider implementing batch processing:

```php
// Process events in batches of 50
$batches = array_chunk($events, 50);
foreach ($batches as $batch) {
    $this->conversionApiService->sendBatchEvents($batch, $pixelId, $accessToken);
}
```

## Security Considerations

### Access Token Security
- Store access tokens securely
- Implement token refresh mechanisms
- Use environment variables for sensitive data

### Rate Limiting
- Facebook has rate limits on API calls
- Implement exponential backoff for retries
- Monitor API usage

### Data Validation
- Validate all input data
- Sanitize user inputs
- Implement proper error handling

## Monitoring & Analytics

### Key Metrics to Track
- Event delivery success rate
- Conversion attribution accuracy
- API response times
- Error rates by event type

### Logging
All Conversion API interactions are logged with:
- Event details
- Success/failure status
- Response data
- Error messages

### Alerts
Set up alerts for:
- High error rates
- API failures
- Token expiration
- Rate limit exceeded

## Support & Resources

### Facebook Resources
- [Facebook Conversion API Documentation](https://developers.facebook.com/docs/marketing-api/conversions-api)
- [Facebook Events Manager](https://business.facebook.com/events_manager)
- [Facebook for Developers](https://developers.facebook.com/)

### LeadBajar Support
- Check logs in `storage/logs/laravel.log`
- Use the Conversion API Tester for debugging
- Contact support for integration issues

## Changelog

### Version 1.0.0
- Initial Conversion API implementation
- Automatic lead tracking
- Stage change tracking
- Frontend management interface
- Testing and validation tools
- Comprehensive documentation

## Future Enhancements

### Planned Features
- Real-time event monitoring dashboard
- Advanced event filtering and segmentation
- Custom event templates
- A/B testing for event tracking
- Integration with other analytics platforms
- Automated reporting and insights

### Integration Opportunities
- Google Analytics 4
- LinkedIn Conversion API
- Twitter Conversion API
- Custom webhook endpoints

---

For additional support or questions, please refer to the Facebook Conversion API documentation or contact the development team.
