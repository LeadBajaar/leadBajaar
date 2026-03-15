'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import FlowBuilder from '@/components/chatbot/flow-builder'
import { RoleGuard } from '@/components/RoleGuard'
// import { ChatbotFlow } from '@/services/chatbot'

interface PageParams {
  params: Promise<{ flowId: string }>
}

export default function ChatbotBuilderPage({ params }: PageParams) {
  const router = useRouter()
  const { flowId } = use(params)
  const isNewFlow = flowId === 'new'

  return (
    <RoleGuard allowedRoles={['Super Admin', 'Admin', 'Manager']}>
      <FlowBuilder 
      flowId={isNewFlow ? null : flowId} 
      isNew={isNewFlow}
      onSave={(savedFlow) => {
        if (isNewFlow && savedFlow?.id) {
          router.replace(`/chatbot/builder/${savedFlow.id}`)
        }
      }}
    />
    </RoleGuard>
  )
}