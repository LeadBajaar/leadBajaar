'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ChatbotFlow, chatbotService } from '@/services/chatbot'
import { PlusCircle, Edit2, Copy, Trash } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { Badge } from '@/components/ui/badge'
import { RoleGuard } from '@/components/RoleGuard'

export default function ChatbotPage() {
  const router = useRouter()
  const [flows, setFlows] = useState<ChatbotFlow[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const loadFlows = async () => {
    try {
      setLoading(true)
      const data = await chatbotService.getFlows()
      setFlows(data)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load chatbot flows',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFlows()
  }, [])

  const handleDelete = async (id: string) => {
    try {
      await chatbotService.deleteFlow(id)
      toast({
        title: 'Success',
        description: 'Flow deleted successfully',
      })
      loadFlows()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete flow',
        variant: 'destructive',
      })
    }
  }

  const handleDuplicate = async (id: string) => {
    try {
      await chatbotService.duplicateFlow(id)
      toast({
        title: 'Success',
        description: 'Flow duplicated successfully',
      })
      loadFlows()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to duplicate flow',
        variant: 'destructive',
      })
    }
  }

  return (
    <RoleGuard allowedRoles={['Super Admin', 'Admin', 'Manager']}>
      <div className="container mx-auto py-8 p-2">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Chatbot Flows</h1>
          <p className="text-muted-foreground">Manage your chatbot conversation flows</p>
        </div>
        <Button onClick={() => router.push('/chatbot/builder/new')}>
          <PlusCircle className="w-4 h-4 mr-2" /> Create New Flow
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
        </div>
      ) : (
        <>
          {flows.length === 0 ? (
            <Card className="text-center py-8">
              <CardContent>
                <p className="text-muted-foreground mb-4">No chatbot flows found. Create your first flow to get started.</p>
                <Button onClick={() => router.push('/chatbot/builder/new')}>
                  <PlusCircle className="w-4 h-4 mr-2" /> Create New Flow
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {flows.map((flow) => (
                <Card key={flow.id} className="flex flex-col">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{flow.name}</CardTitle>
                        <CardDescription>{flow.description}</CardDescription>
                      </div>
                      <Badge variant="secondary">{flow.trigger}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Last Updated:</span>
                        <span>{new Date(flow.updatedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Nodes:</span>
                        <span>{flow.nodes?.length || 0}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => router.push(`/chatbot/builder/${flow.id}`)}
                    >
                      <Edit2 className="w-4 h-4 mr-2" /> Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleDuplicate(flow.id)}
                    >
                      <Copy className="w-4 h-4 mr-2" /> Duplicate
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(flow.id)}
                    >
                      <Trash className="w-4 h-4 mr-2" /> Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
    </RoleGuard>
  )
}
