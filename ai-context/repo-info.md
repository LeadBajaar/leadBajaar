name: leadbajaar-frontend
type: nextjs-frontend
depends_on:
  - leadbajaar-backend
  - evolution-service
exports:
  - dashboard-ui
  - crm-ui
  - booking-ui
consumes:
  - rest-api
  - websocket
  - webhooks
