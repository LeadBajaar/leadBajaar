import { ChatbotNode, ChatbotEdge } from '@/types/nodes'
import { logger } from '@/utils/logger'
import { API_BASE_URL } from '@/lib/api'

export interface SaveFlowPayload {
  id?: string
  name: string
  description: string
  trigger: string
  is_active?: boolean
  nodes: ChatbotNode[]
  edges: ChatbotEdge[]
}

export interface ChatbotFlow {
  id: string
  name: string
  description: string
  trigger: string
  is_active: boolean
  updatedAt: string
  createdAt: string
  nodes: ChatbotNode[]
  edges: ChatbotEdge[]
}

class ChatbotService {
  private baseUrl = API_BASE_URL

  private async fetchApi(url: string, options: RequestInit = {}) {
    const token = localStorage.getItem('token') // or get from your auth system

    const response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Request failed')
    }

    return data
  }

  async getFlows(): Promise<ChatbotFlow[]> {
    try {
      const response = await this.fetchApi(`${this.baseUrl}/chatbot/flows`)
      const data = await response.data || response

      return (Array.isArray(data) ? data : []).map(flow => ({
        id: flow.id,
        name: flow.name || '',
        description: flow.description || '',
        trigger: flow.trigger || 'message',
        is_active: flow.is_active !== undefined ? Boolean(flow.is_active) : true,
        updatedAt: flow.updatedAt || flow.updated_at || new Date().toISOString(),
        createdAt: flow.createdAt || flow.created_at || new Date().toISOString(),
        nodes: flow.nodes || [],
        edges: flow.edges || [],
      }))
    } catch (error) {
      logger.error('Error fetching flows', error)
      throw error
    }
  }

  async getFlow(id: string): Promise<ChatbotFlow> {
    try {
      const response = await this.fetchApi(`${this.baseUrl}/chatbot/flows/${id}`)
      const data = await response.data || response

      return {
        id: data.id,
        name: data.name || '',
        description: data.description || '',
        trigger: data.trigger || 'message',
        is_active: data.is_active !== undefined ? Boolean(data.is_active) : true,
        updatedAt: data.updatedAt || data.updated_at || new Date().toISOString(),
        createdAt: data.createdAt || data.created_at || new Date().toISOString(),
        nodes: data.nodes || [],
        edges: data.edges || [],
      }
    } catch (error) {
      logger.error('Error fetching flow', error)
      throw error
    }
  }

  async saveFlow(flow: SaveFlowPayload): Promise<ChatbotFlow> {
    const url = `${this.baseUrl}/chatbot/flows${flow.id ? `/${flow.id}` : ''}`
    const method = flow.id ? 'PUT' : 'POST'

    try {
      const response = await this.fetchApi(url, {
        method,
        body: JSON.stringify({
          name: flow.name,
          description: flow.description,
          trigger: flow.trigger,
          nodes: flow.nodes,
          edges: flow.edges,
        }),
      })

      const flowData = response.data || response

      return {
        id: flowData.id,
        name: flowData.name || '',
        description: flowData.description || '',
        trigger: flowData.trigger || 'message',
        is_active: flowData.is_active !== undefined ? Boolean(flowData.is_active) : true,
        updatedAt: flowData.updatedAt || flowData.updated_at || new Date().toISOString(),
        createdAt: flowData.createdAt || flowData.created_at || new Date().toISOString(),
        nodes: flowData.nodes || [],
        edges: flowData.edges || [],
      }
    } catch (error) {
      logger.error('Error saving flow', error)
      throw error
    }
  }

  /**
   * Toggle the active / inactive status of a chatbot flow.
   * PATCH /api/chatbot/flows/{id}/toggle
   * Returns the new is_active value from the server.
   */
  async toggleFlow(id: string): Promise<{ id: string; is_active: boolean }> {
    const response = await this.fetchApi(`${this.baseUrl}/chatbot/flows/${id}/toggle`, {
      method: 'PATCH',
    })
    return {
      id: response.id ?? id,
      is_active: Boolean(response.is_active),
    }
  }

  async deleteFlow(id: string): Promise<void> {
    await this.fetchApi(`${this.baseUrl}/chatbot/flows/${id}`, {
      method: 'DELETE',
    })
  }

  async duplicateFlow(id: string): Promise<ChatbotFlow> {
    const response = await this.fetchApi(`${this.baseUrl}/chatbot/flows/${id}/duplicate`, {
      method: 'POST',
    })
    return response.data || response
  }

  async exportFlow(id: string): Promise<Blob> {
    const response = await this.fetchApi(`${this.baseUrl}/chatbot/flows/${id}/export`)
    return response.blob()
  }

  async importFlow(file: File): Promise<ChatbotFlow> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${this.baseUrl}/chatbot/flows/import`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }))
      throw new Error(error.message || 'Failed to import flow')
    }

    return response.json()
  }
}

export const chatbotService = new ChatbotService()