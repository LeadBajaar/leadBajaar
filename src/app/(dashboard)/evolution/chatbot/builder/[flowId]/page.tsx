'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import EvolutionFlowBuilder from '@/components/chatbot/evolution-flow-builder'
import { RoleGuard } from '@/components/RoleGuard'

interface PageParams {
  params: Promise<{ flowId: string }>
}

export default function EvolutionChatbotBuilderPage({ params }: PageParams) {
  const router = useRouter()
  const { flowId } = use(params)
  const isNewFlow = flowId === 'new'

  return (
    <RoleGuard allowedFeatures={['chatbot']}>
      <EvolutionFlowBuilder 
      flowId={isNewFlow ? null : flowId} 
      isNew={isNewFlow}
      onSave={(savedFlow) => {
        if (isNewFlow && savedFlow?.id) {
          router.replace(`/evolution/chatbot/builder/${savedFlow.id}`)
        }
      }}
    />
    </RoleGuard>
  )
}
