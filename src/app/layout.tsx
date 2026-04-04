import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { ErrorProvider } from '@/contexts/ErrorContext'
import '@/styles/globals.css'
import '@/lib/globalErrorHandler'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <ErrorProvider>
            {children}
            <Toaster position="top-right" richColors closeButton />
          </ErrorProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

