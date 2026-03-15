'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ChatMessage } from './chat-message'
import { wsService } from '@/services/websocket-service'
import { Send } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface Message {
  id: string
  content: string
  isBot: boolean
  timestamp: string
  status?: 'sending' | 'sent' | 'error'
}

export function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    wsService.initialize()
    wsService.addMessageHandler(handleIncomingMessage)
    
    // Subscribe to user's chat channel
    const userId = localStorage.getItem('userId') // Get from your auth system
    if (userId) {
      wsService.subscribeToChat(userId)
    }

    return () => {
      wsService.removeMessageHandler(handleIncomingMessage)
      wsService.disconnect()
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleIncomingMessage = (data: any) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      content: data.message,
      isBot: true,
      timestamp: new Date().toISOString(),
    }])
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const sendMessage = async () => {
    if (!input.trim()) return

    const messageId = Date.now().toString()
    const newMessage: Message = {
      id: messageId,
      content: input,
      isBot: false,
      timestamp: new Date().toISOString(),
      status: 'sending'
    }

    setMessages(prev => [...prev, newMessage])
    setInput('')
    setIsLoading(true)

    try {
      await wsService.sendMessage(input)
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, status: 'sent' } : msg
      ))
    } catch (error) {
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, status: 'error' } : msg
      ))
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[600px] border rounded-lg">
      <div className="flex-1 overflow-y-auto">
        {messages.map((message) => (
          <ChatMessage key={message.id} {...message} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t">
        <form onSubmit={(e) => {
          e.preventDefault()
          sendMessage()
        }} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  )
} 
