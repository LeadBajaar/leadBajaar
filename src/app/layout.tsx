import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { ErrorProvider } from '@/contexts/ErrorContext'
import { NavigationProgressBar } from '@/components/NavigationProgressBar'
import '@/styles/globals.css'
import '@tabler/icons-webfont/dist/tabler-icons.min.css'
import '@/lib/globalErrorHandler'
import { ReactQueryProvider } from './ReactQueryProvider'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <ReactQueryProvider>
            <ErrorProvider>
              <NavigationProgressBar />
              {children}
              <Toaster position="top-right" richColors closeButton />
            </ErrorProvider>
          </ReactQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
