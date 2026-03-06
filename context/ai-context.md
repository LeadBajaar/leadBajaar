# LeadBajaar Web - AI Context

This document provides context for AI assistants to understand the project structure, technology stack, and business logic of the LeadBajaar web application.

## Project Overview
LeadBajaar Web is the primary interface for the lead management and CRM platform. It provides a comprehensive dashboard for users to monitor their business, interact with leads in real-time, build AI chatbots, and manage integrations.

## Tech Stack
- **Framework**: [Next.js 15](https://nextjs.org/docs) (App Router)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) (using the Shadcn UI pattern)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: React Hooks + NextAuth.js for session management.
- **Charts**: [Recharts](https://recharts.org/)
- **Real-time**: [Laravel Echo](https://laravel.com/docs/11.x/broadcasting) & [Pusher JS](https://pusher.com/docs/channels/using_channels/pusher-js/)
- **Workflow Builder**: [@xyflow/react](https://reactflow.dev/) (formerly React Flow)
- **API Client**: [Axios](https://axios-http.com/)

## Directory Structure
- `/src/app`: Application routes and layouts using Next.js App Router.
  - `(dashboard)`: Grouped routes accessible after login (analytics, leads, chatbot, integrations, etc.).
  - `api`: Next.js API routes (if any) or route handlers.
- `/src/components`: UI components.
  - `/ui`: Low-level base components (Radix/Shadcn).
  - Feature-specific components for dashboard, leads, chatbot, etc.
- `/src/lib`: Core utilities and library configurations.
  - `api.ts`: Comprehensive API client and service definitions for communicating with the Laravel backend.
  - `auth.ts`: Authentication utilities.
- `/src/hooks`: Custom React hooks.
- `/src/services`: Feature-specific data fetching services.
- `/src/types`: TypeScript interfaces and type definitions.

## Key Web Features
1. **Interactive Dashboard**: Real-time analytics and performance overview using Recharts.
2. **Lead CRM**: Sophisticated table with filtering, sorting, bulk actions, and import/export via CSV.
3. **Chatbot Builder**: A node-based visual interface for designing automated conversational flows.
4. **Live Chat**: Real-time messaging interface for WhatsApp and platform-native chat.
5. **Meetings & Calendar**: Scheduling system for demos and calls with availability management.
6. **Platform Integration Center**: Configuration UI for Facebook (OAuth, Pixel, Conversion API) and WhatsApp Cloud API.

## Development Standards
- **Component Architecture**: Prefer small, reusable components. Follow the Shadcn UI pattern for base elements.
- **Data Fetching**: Use functions from `src/lib/api.ts` for consistency.
- **Types**: Always define and use TypeScript interfaces for API responses and component props.
- **Styling**: Use utility-first CSS with Tailwind. Follow the brand design system.
- **Form Handling**: Use `react-hook-form` paired with zod for validation where applicable.

## AI Tool Instructions
When assisting with this codebase:
- Refer to `src/lib/api.ts` to see existing API service patterns.
- Follow the App Router conventions in `src/app`.
- Use the established UI patterns from `src/components/ui`.
- For any node-based logic, refer to the chatbot builder implementation using `@xyflow/react`.
- Ensure real-time features use the established Echo/Pusher configuration.
