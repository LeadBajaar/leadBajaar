'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import {
  Send, Phone, Video, Search, Loader2,
  MoreVertical, Info, User, Clock, Check,
  CheckCheck, Hash, MessageSquare, AlertCircle,
  Hash as Hashtag, ChevronLeft, Calendar,
  Sparkles, Zap, ShieldCheck,
  Paperclip, Smile, X
} from 'lucide-react'
import {
  getMessages,
  sendMessage,
  getLeadsWithLatestMessages,
  getConversationMessages
} from '@/lib/api'
import { format } from 'date-fns'

interface WhatsAppInteractive {
  type: string;
  body: { text: string };
  action: {
    buttons: Array<{
      type: string;
      reply: { id: string; title: string };
    }>;
  };
}

interface Message {
  id: number;
  content: string;
  metadata?: string | any | null;
  sender: 'user' | 'agent';
  time: string;
  created_at: string;
  direction?: 'inbound' | 'outbound';
  status?: 'sent' | 'delivered' | 'read';
}

interface ChatUser {
  id: number;
  name: string;
  email: string;
  avatar: string;
  company: string;
  location: string;
  last_message?: Message;
  unread_count?: number;
}

interface Chat {
  id: number;
  user: ChatUser;
  messages: Message[];
  status: 'active' | 'inactive';
  lastActive: string;
  priority: 'high' | 'medium' | 'low';
}

export default function LiveChatPage() {
  const [activeChat, setActiveChat] = useState<Chat | null>(null)
  const [message, setMessage] = useState('')
  const [chats, setChats] = useState<Chat[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoadingChats, setIsLoadingChats] = useState(true)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [showUserDetails, setShowUserDetails] = useState(false)
  const unreadMessages = chats.reduce((acc, chat) => acc + (chat.user.unread_count || 0), 0)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const formatMessageTime = (timestamp: string | undefined): string => {
    if (!timestamp) return ''
    try {
      return format(new Date(timestamp), 'hh:mm a')
    } catch (e) {
      return ''
    }
  }

  const formatLastActive = (timestamp: string | undefined): string => {
    if (!timestamp) return 'Never'
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`
    return format(date, 'MMM d')
  }

  const fetchChatMessages = useCallback(async (chatId: number) => {
    try {
      setIsLoadingMessages(true)
      const response = await getConversationMessages(chatId)
      if (response?.messages && Array.isArray(response.messages)) {
        const formatted = response.messages.map((msg: any) => ({
          id: msg.id,
          content: msg.content || '',
          metadata: msg.metadata,
          sender: (msg.direction === 'outbound' ? 'agent' : 'user') as 'user' | 'agent',
          time: formatMessageTime(msg.created_at || msg.timestamp),
          created_at: msg.created_at || msg.timestamp,
          direction: msg.direction,
          status: 'read' as const
        }))
        setMessages(formatted)
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setIsLoadingMessages(false)
    }
  }, [])

  const fetchActiveConversations = useCallback(async () => {
    try {
      setIsLoadingChats(true)
      const response = await getLeadsWithLatestMessages()
      if (!response || !Array.isArray(response)) return

      const formattedChats: Chat[] = response.map((chat: any) => ({
        id: parseInt(chat.conversation_id) || 0,
        user: {
          id: chat.lead?.id || 0,
          name: chat.lead?.name || 'Unknown User',
          email: chat.lead?.email || '',
          avatar: chat.lead?.avatar || '',
          company: chat.lead?.company || 'Unknown Corp',
          location: chat.lead?.location || 'Unknown',
          last_message: chat.last_message ? {
            id: 0,
            content: chat.last_message.content || '',
            sender: (chat.last_message.direction === 'outbound' ? 'agent' : 'user') as 'user' | 'agent',
            time: formatMessageTime(chat.last_message.timestamp),
            created_at: chat.last_message.timestamp || '',
          } : undefined,
          unread_count: chat.unread_count || 0
        },
        status: (chat.status || 'active') as 'active' | 'inactive',
        lastActive: formatLastActive(chat.last_activity || chat.last_message?.timestamp),
        priority: (chat.priority || (chat.unread_count > 0 ? 'high' : 'low')) as 'high' | 'medium' | 'low',
        messages: []
      })).filter(c => c.id !== 0)

      setChats(formattedChats)
      if (!activeChat && formattedChats.length > 0) {
        setActiveChat(formattedChats[0])
        fetchChatMessages(formattedChats[0].id)
      }
    } catch (error) {
      console.error('Error fetching conversations:', error)
    } finally {
      setIsLoadingChats(false)
    }
  }, [activeChat, fetchChatMessages])

  useEffect(() => {
    fetchActiveConversations()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!message.trim() || !activeChat || isSending) return
    const text = message
    setMessage('')

    try {
      setIsSending(true)
      const response = await sendMessage({
        receiver_id: activeChat.user.id,
        sender_id: 1, // Current agent
        message: text
      })

      if (response?.message) {
        const newMsg: Message = {
          id: response.message.id || Date.now(),
          content: response.message.content,
          sender: 'agent',
          time: formatMessageTime(new Date().toISOString()),
          created_at: new Date().toISOString(),
          status: 'sent'
        }
        setMessages(prev => [...prev, newMsg])
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsSending(false)
    }
  }

  const filteredChats = chats.filter(c =>
    c.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.user.company.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {}
    messages.forEach(m => {
      const d = format(new Date(m.created_at), 'MMMM d, yyyy')
      if (!groups[d]) groups[d] = []
      groups[d].push(m)
    })
    return Object.entries(groups)
  }

  return (
    <div className="flex flex-col lg:flex-row h-full p-2 sm:p-4 lg:p-6 gap-2 sm:gap-4 lg:gap-6 overflow-hidden bg-slate-50/50 dark:bg-slate-950/20">

      {/* ── Sidebar: Conversations ─────────────────────────────────────── */}
      <div className={cn(
        "w-full lg:w-[340px] flex flex-col gap-4 shrink-0 overflow-hidden transition-all duration-300",
        activeChat ? "hidden lg:flex" : "flex"
      )}>
        <div className="flex items-center justify-between shrink-0">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Conversations
            <Badge className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800 pointer-events-none">
              {unreadMessages || chats.length}
            </Badge>
          </h1>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>

        <Card className="flex-1 flex flex-col min-h-0 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-slate-900 ring-1 ring-slate-100 dark:ring-slate-800/50">
          <div className="p-3 border-b border-slate-100 dark:border-slate-800">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <Input
                placeholder="Find customer..."
                className="pl-9 h-10 bg-slate-50 dark:bg-slate-800/50 border-transparent focus:bg-white dark:focus:bg-slate-800 transition-all rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <ScrollArea className="flex-1 [&>div>div]:!block">
            <div className="flex flex-col p-2 space-y-1 overflow-hidden">
              {isLoadingChats ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                    <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-2/5 bg-slate-100 dark:bg-slate-800 rounded" />
                      <div className="h-2 w-3/4 bg-slate-50 dark:bg-slate-800/50 rounded" />
                    </div>
                  </div>
                ))
              ) : filteredChats.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                  <div className="h-12 w-12 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center mb-4">
                    <MessageSquare className="h-6 w-6 text-slate-300" />
                  </div>
                  <p className="text-sm font-medium text-slate-500">No active chats found</p>
                </div>
              ) : (
                filteredChats.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => {
                      setActiveChat(chat)
                      fetchChatMessages(chat.id)
                    }}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-2xl transition-all duration-200 group relative min-w-0 overflow-hidden",
                      activeChat?.id === chat.id
                        ? "bg-indigo-50 dark:bg-indigo-900/20 ring-1 ring-indigo-200 dark:ring-indigo-500/30"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/50 active:scale-[0.98]"
                    )}
                  >
                    <div className="relative shrink-0">
                      <Avatar className="h-11 w-11 border-2 border-white dark:border-slate-900 shadow-sm">
                        <AvatarImage src={chat.user.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 font-bold text-xs uppercase">
                          {chat.user.name.substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      {chat.priority === 'high' && (
                        <div className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-red-500 border-2 border-white dark:border-slate-900 animate-pulse" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 text-left overflow-hidden">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <p className={cn(
                          "text-sm font-bold truncate flex-1 min-w-0",
                          activeChat?.id === chat.id ? "text-indigo-700 dark:text-indigo-400" : "text-slate-900 dark:text-white"
                        )}>
                          {chat.user.name}
                        </p>
                        <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap shrink-0">
                          {chat.lastActive}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5 font-medium leading-relaxed break-all">
                        {chat.user.last_message?.content || 'Started a conversation'}
                      </p>
                    </div>

                    {(chat.user.unread_count ?? 0) > 0 && (
                      <div className="h-5 min-w-[20px] px-1.5 flex items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white shadow-lg shadow-indigo-500/40 shrink-0">
                        {chat.user.unread_count ?? 0}
                      </div>
                    )}

                    {activeChat?.id === chat.id && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-indigo-500 rounded-r-full" />
                    )}
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </Card>
      </div>

      {/* ── Main Chat Area ───────────────────────────────────────────── */}
      <div className={cn(
        "flex-1 flex flex-col gap-4 overflow-hidden transition-all duration-300",
        !activeChat ? "hidden lg:flex" : "flex"
      )}>
        {activeChat ? (
          <>
            {/* Header */}
            <Card className="shrink-0 border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900/80 backdrop-blur-md rounded-2xl overflow-hidden ring-1 ring-slate-100 dark:ring-slate-800/50">
              <div className="px-4 py-3 sm:px-5 sm:py-4 flex items-center justify-between">
                <div className="flex items-center gap-3 sm:gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setActiveChat(null)}
                    className="h-9 w-9 -ml-1 lg:hidden rounded-xl bg-slate-100 dark:bg-slate-800"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <div className="relative">
                    <Avatar className="h-10 w-10 shadow-sm ring-2 ring-indigo-500/10">
                      <AvatarImage src={activeChat.user.avatar} />
                      <AvatarFallback className="font-bold text-xs">{activeChat.user.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 shadow-sm" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 truncate">
                      <span className="truncate">{activeChat.user.name}</span>
                      {activeChat.priority === 'high' && <Badge className="bg-red-50 text-red-600 border-red-100 text-[10px] font-bold px-1.5 py-0 shrink-0">URGENT</Badge>}
                    </h2>
                    <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-0.5 truncate">
                      <span className="flex items-center gap-1"><Zap className="h-3 w-3 text-amber-500 fill-amber-500" /> <span className="hidden sm:inline">{activeChat.user.company}</span></span>
                      <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">·</span>
                      <span>Active now</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 sm:gap-2">
                  <div className="hidden sm:flex items-center gap-2">
                    <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800">
                      <Phone className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800">
                      <Video className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    </Button>
                    <Separator orientation="vertical" className="h-6 mx-1 bg-slate-200 dark:bg-slate-800" />
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowUserDetails(!showUserDetails)}
                    className={cn(
                      "h-9 w-9 rounded-xl transition-all",
                      showUserDetails ? "bg-indigo-50 text-indigo-600 border-indigo-200" : "border-slate-200 dark:border-slate-800"
                    )}
                  >
                    <Info className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>

            {/* Messages Area */}
            <div className="flex-1 flex gap-4 min-h-0">
              <Card className="flex-1 flex flex-col min-h-0 border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl overflow-hidden ring-1 ring-slate-100 dark:ring-slate-800/50">
                <ScrollArea className="flex-1 px-5 py-6">
                  {isLoadingMessages ? (
                    <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-400">
                      <Loader2 className="h-8 w-8 animate-spin" />
                      <p className="text-sm font-medium">Securing connection...</p>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-4 max-w-xs mx-auto">
                      <div className="p-4 rounded-3xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 animate-bounce">
                        <Sparkles className="h-8 w-8" />
                      </div>
                      <h3 className="font-bold text-slate-900 dark:text-white">Start the conversation</h3>
                      <p className="text-xs text-slate-500">Send a friendly greeting to {activeChat.user.name} to get things moving.</p>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {groupMessagesByDate(messages).map(([date, dateMessages]) => (
                        <div key={date} className="space-y-6">
                          <div className="relative flex justify-center">
                            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                              <div className="w-full border-t border-slate-100 dark:border-slate-800" />
                            </div>
                            <span className="relative px-3 py-1 bg-white dark:bg-slate-900 text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none rounded-full border border-slate-100 dark:border-slate-800 shadow-sm">
                              {date}
                            </span>
                          </div>

                          {dateMessages.map((msg, idx) => {
                            const isAgent = msg.sender === 'agent'
                            return (
                              <div key={msg.id} className={cn("flex w-full group animate-in fade-in slide-in-from-bottom-2 duration-300", isAgent ? "justify-end" : "justify-start")}>
                                <div className={cn("max-w-[75%] flex flex-col", isAgent ? "items-end" : "items-start")}>
                                  <div className={cn(
                                    "px-4 py-2.5 rounded-2xl shadow-sm relative group/msg",
                                    isAgent
                                      ? "bg-indigo-600 text-white rounded-tr-none"
                                      : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 rounded-tl-none"
                                  )}>
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                                      {msg.content}
                                    </p>

                                    <div className={cn(
                                      "absolute -bottom-5 flex items-center gap-1 opacity-0 group-hover/msg:opacity-100 transition-opacity whitespace-nowrap",
                                      isAgent ? "right-0" : "left-0"
                                    )}>
                                      <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter">{msg.time}</span>
                                      {isAgent && (
                                        <CheckCheck className="h-3 w-3 text-indigo-400" />
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      ))}
                      <div ref={messagesEndRef} className="h-4" />
                    </div>
                  )}
                </ScrollArea>

                {/* Input Area */}
                <div className="p-4 bg-white/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
                  <div className="relative flex items-end gap-2 p-2 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-transparent focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
                    <div className="flex shrink-0 pb-1.5 pl-1.5 gap-1">
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-slate-400 hover:text-indigo-500 hover:bg-white dark:hover:bg-slate-900 transition-all">
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-slate-400 hover:text-indigo-500 hover:bg-white dark:hover:bg-slate-900 transition-all">
                        <Smile className="h-4 w-4" />
                      </Button>
                    </div>
                    <textarea
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      placeholder="Write a message..."
                      className="flex-1 bg-transparent border-none focus:ring-0 resize-none py-2.5 px-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 min-h-[44px] max-h-32 overflow-y-auto w-full no-scrollbar"
                      value={message}
                      onChange={(e) => {
                        setMessage(e.target.value);
                        e.target.style.height = 'auto';
                        e.target.style.height = `${Math.min(e.target.scrollHeight, 128)}px`;
                      }}
                      rows={1}
                    />
                    <div className="flex shrink-0 pb-1.5 pr-1.5 gap-1">
                      <Button
                        onClick={handleSend}
                        disabled={!message.trim() || isSending}
                        className="h-9 w-9 p-0 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-500/30 transition-all active:scale-95 disabled:opacity-50 disabled:shadow-none"
                      >
                        {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-2 px-2 overflow-x-auto no-scrollbar pb-1">
                    {['Pricing Plan', 'API Help', 'Product Demo', 'Refund Policy'].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => handleSend()} // Mock suggest
                        className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider h-6 px-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-indigo-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-colors whitespace-nowrap"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </Card>

              {/* User Detailed Sidebar */}
              {showUserDetails && (
                <Card className="w-[280px] shrink-0 border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 rounded-2xl p-6 flex flex-col gap-6 animate-in slide-in-from-right-4 duration-300">
                  <div className="text-center">
                    <Avatar className="h-20 w-20 mx-auto shadow-xl ring-4 ring-slate-50 dark:ring-slate-800">
                      <AvatarImage src={activeChat.user.avatar} />
                      <AvatarFallback className="text-xl font-bold">{activeChat.user.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mt-4">{activeChat.user.name}</h3>
                    <p className="text-xs text-slate-500 font-medium">{activeChat.user.company}</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase tracking-widest text-slate-400">Email Address</Label>
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{activeChat.user.email}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase tracking-widest text-slate-400">Location</Label>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{activeChat.user.location}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase tracking-widest text-slate-400">Current State</Label>
                      <div className="flex flex-wrap gap-2 pt-1">
                        <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 flex items-center gap-1 text-[10px]"><ShieldCheck className="h-3 w-3" /> VERIFIED</Badge>
                        <Badge className="bg-indigo-50 text-indigo-600 border-indigo-100 text-[10px]">PREMIUM</Badge>
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-slate-100 dark:bg-slate-800" />

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Common Tags</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {['New Lead', 'Enterprise', 'Support', 'Urgent'].map(t => (
                        <span key={t} className="text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-1 rounded-md">{t}</span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-auto pt-4 flex flex-col gap-2">
                    <Button variant="outline" className="w-full h-10 rounded-xl text-xs font-bold border-slate-200 dark:border-slate-800">Block Customer</Button>
                    <Button className="w-full h-10 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 shadow-md">Mark as Resolved</Button>
                  </div>
                </Card>
              )}
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-center p-12">
            <div className="max-w-md space-y-6">
              <div className="h-24 w-24 mx-auto rounded-3xl bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center animate-bounce">
                <MessageSquare className="h-10 w-10 text-indigo-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Select a conversation</h2>
                <p className="text-slate-500 mt-2">Welcome back! Choose a customer from the left sidebar to start messaging and providing world-class support.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
