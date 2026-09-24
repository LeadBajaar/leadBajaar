import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ErrorProvider } from '@/contexts/ErrorContext'

export function renderWithQueryClient(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  // Create a fresh QueryClient for each test to avoid cache leakage
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Don't retry failed requests in tests
        staleTime: 0, // Ensure data is always refetched if needed
      },
    },
  })

  return render(
    <ErrorProvider>
      <QueryClientProvider client={queryClient}>
        {ui}
      </QueryClientProvider>
    </ErrorProvider>,
    options
  )
}

