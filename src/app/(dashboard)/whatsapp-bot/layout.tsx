import { WhatsAppProvider } from '@/contexts/WhatsAppContext'

export default function WhatsAppBotLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <WhatsAppProvider>
      {children}
    </WhatsAppProvider>
  )
}
