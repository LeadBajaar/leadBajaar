# LeadBajaar Architecture & Conventions

This document outlines the explicit architectural conventions established across several refactoring phases in this codebase. To prevent feature modules from deteriorating into god-files, **all new code must follow these patterns**.

## 1. Page Structure
When a page's logic grows beyond ~200 lines (or mixes heavy state management with complex UI), extract the business logic into a dedicated `hooks/` subdirectory.
- **Rule:** The page component (`page.tsx`) should act only as a composition and JSX rendering layer. All data fetching, modal state, and bulk action logic belongs in custom hooks.
- **Reference Example:** See [`src/app/(dashboard)/leads/page.tsx`](file:///f:/LeadBajar/leadbajaar1.0/src/app/(dashboard)/leads/page.tsx) and its logic isolated in [`src/app/(dashboard)/leads/hooks/`](file:///f:/LeadBajar/leadbajaar1.0/src/app/(dashboard)/leads/hooks/).

## 2. Component Decomposition
When a UI component exceeds ~150-200 lines or begins to mix multiple concerns (e.g., polling state + complex conditional rendering), it must be split into a self-contained directory.
- **Rule:** Create a folder for the component. Provide a lean top-level file that composes the pieces, extract state logic into a local hook, and create focused sub-components for individual UI sections.
- **Reference Examples:** 
  - [`src/components/sidebar/`](file:///f:/LeadBajar/leadbajaar1.0/src/components/sidebar/) (decomposed from a monolithic 474-line file)
  - [`src/components/notification-bell/`](file:///f:/LeadBajar/leadbajaar1.0/src/components/notification-bell/)

## 3. API Layer & Typing
The API layer must be strictly typed and domain-driven. Do not build a shared monolith for API calls.
- **Rule:** All API calls live in [`src/lib/api/`](file:///f:/LeadBajar/leadbajaar1.0/src/lib/api/). Create one `.api.ts` file per domain. Each domain must have a corresponding `.types.ts` file in [`src/lib/api/types/`](file:///f:/LeadBajar/leadbajaar1.0/src/lib/api/types/) with exact interfaces matching the Laravel backend. **No `any` or `any[]` is permitted in new code.**
- **Reference Example:** See [`src/lib/api/leads.api.ts`](file:///f:/LeadBajar/leadbajaar1.0/src/lib/api/leads.api.ts) and [`src/lib/api/types/leads.types.ts`](file:///f:/LeadBajar/leadbajaar1.0/src/lib/api/types/leads.types.ts).

## 4. Data Fetching
Manual `useState` + `useEffect` data fetching is deprecated for server data.
- **Rule:** New features fetching server data must use React Query (`@tanstack/react-query`). Bind your query keys directly to your filter/pagination states so refetching is automatic. When passing a refetch trigger to sibling hooks or dialogs, expose a function that wraps React Query's `refetch()`.
- **Reference Example:** See [`src/app/(dashboard)/leads/hooks/useLeadsData.ts`](file:///f:/LeadBajar/leadbajaar1.0/src/app/(dashboard)/leads/hooks/useLeadsData.ts).

## 5. Dead Code Hygiene
Always verify existing implementations before creating new directories or components for a feature.
- **Rule:** Do a global search for similar implementations to prevent duplicate structures or orphaned stubs. 
- **Cautionary Example:** The `src/components/leads/` stub-directory was mistakenly created and orphaned because the actual leads components lived inside `src/app/(dashboard)/leads/components/`. Always check existing module boundaries.

## 6. Testing Expectations
We use Jest for testing (not Vitest).
- **Rule:** Any new pure utility function (parsers, formatters, validators, complex business logic) must ship with a corresponding `.test.ts` file directly alongside it.
- **Reference Example:** See [`src/lib/leads/csv-import.test.ts`](file:///f:/LeadBajar/leadbajaar1.0/src/lib/leads/csv-import.test.ts) testing the logic in `csv-import.ts`.
