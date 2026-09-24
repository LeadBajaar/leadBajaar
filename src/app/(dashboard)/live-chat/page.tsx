'use client'

import { useEffect, useState, useRef, useCallback, useLayoutEffect } from 'react'
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
  MoreVertical, Info, Clock, CheckCheck,
  ChevronLeft, X,
  MessageSquare, AlertCircle, Sparkles, Zap, ShieldCheck,
  Paperclip, Smile, ExternalLink, Trash2
} from 'lucide-react'
import {
  getMessages,
  sendMessage,
  getLeadsWithLatestMessages,
  getConversationMessages,
  me
} from '@/lib/api'
// import '@/app/echo'
import { format } from 'date-fns'
import { RoleGuard } from '@/components/RoleGuard'
import { getAgentColor } from '@/utils/agentColors'

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

declare global {
  interface Window {
    Echo: any;
    Pusher: any;
  }
}

interface Message {
  id: string | number
  content: string
  sender: 'user' | 'agent'
  time: string
  created_at: string
  status?: 'pending' | 'sent' | 'delivered' | 'read' | 'failed'
  metadata?: any
  direction?: 'inbound' | 'outbound'
}

interface ChatUser {
  id: string | number;
  name: string;
  email: string;
  avatar: string;
  company: string;
  location: string;
  last_message?: Message;
  unread_count?: number;
}

interface Chat {
  id: string | number;
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
  const [isDeleting, setIsDeleting] = useState(false)
  const unreadMessages = chats.reduce((acc, chat) => acc + (chat.user.unread_count || 0), 0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const isInitialScrollRef = useRef(true)

  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isFetchingMore, setIsFetchingMore] = useState(false)
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 500)
    return () => clearTimeout(handler)
  }, [searchQuery])

  const formatMessageTime = (timestamp: string | Date | undefined): string => {
    if (!timestamp) return ''
    try {
      const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp
      return format(date, 'hh:mm a')
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

  const [messagesPage, setMessagesPage] = useState(1)
  const [hasMoreMessages, setHasMoreMessages] = useState(true)

  const scrollViewportRef = useRef<HTMLDivElement | null>(null);
  const previousScrollHeightRef = useRef<number>(0);
  const isFetchingOlderRef = useRef<boolean>(false);

  useLayoutEffect(() => {
    if (isFetchingOlderRef.current && scrollViewportRef.current) {
      const newScrollHeight = scrollViewportRef.current.scrollHeight;
      scrollViewportRef.current.scrollTop += (newScrollHeight - previousScrollHeightRef.current);
      isFetchingOlderRef.current = false;
    }
  }, [messages])

  const fetchChatMessages = useCallback(async (chatId: string | number, pageNum = 1) => {
    try {
      if (pageNum === 1) {
        setIsLoadingMessages(true)
        isInitialScrollRef.current = true
      }
      let response: any = await getConversationMessages(chatId, pageNum)
      let messagesArray = response?.messages || response?.data || response;

      if (messagesArray && Array.isArray(messagesArray)) {
        if (messagesArray.length < 25) setHasMoreMessages(false);
        const formatted = messagesArray.map((msg: any) => ({
          id: msg.id || Math.random(), // Fallback ID to prevent React render issues
          content: msg.content || '',
          metadata: msg.metadata,
          sender: (msg.direction === 'outbound' ? 'agent' : 'user') as 'user' | 'agent',
          time: formatMessageTime(msg.timestamp || msg.created_at),
          created_at: msg.timestamp || msg.created_at, // Use either key
          direction: msg.direction,
          status: msg.status || 'read'
        }))
        
        const viewport = messagesEndRef.current?.closest('[data-radix-scroll-area-viewport]') as HTMLDivElement | null;
        if (pageNum > 1 && viewport) {
          previousScrollHeightRef.current = viewport.scrollHeight;
          isFetchingOlderRef.current = true;
          scrollViewportRef.current = viewport;
        }

        setMessages(prev => {
          if (pageNum === 1) {
            // Keep any pending local messages
            const pendingLocalMessages = prev.filter(m => String(m.id).startsWith('local-'));
            return [...formatted.reverse(), ...pendingLocalMessages.filter(local => 
              !formatted.some(f => f.id === local.id)
            )];
          } else {
            const newFormatted = formatted.reverse().filter((newMsg: any) => !prev.some(oldMsg => oldMsg.id === newMsg.id));
            return [...newFormatted, ...prev];
          }
        })
      } else {
        if (pageNum === 1) setMessages([])
        setHasMoreMessages(false)
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      if (pageNum === 1) setIsLoadingMessages(false)
    }
  }, [])

  const fetchActiveConversations = useCallback(async (pageNum = 1, query = debouncedSearchQuery) => {
    try {
      if (pageNum === 1) {
        setIsLoadingChats(true)
      } else {
        setIsFetchingMore(true)
      }
      let response: any = await getLeadsWithLatestMessages(pageNum, query)
      let rawData = response;
      if (response && !Array.isArray(response) && Array.isArray(response.data)) {
        rawData = response.data;
        if (response.data.length < 20) setHasMore(false);
      }
      if (!rawData || !Array.isArray(rawData)) return

      const formattedChats: Chat[] = rawData.map((chat: any) => ({
        id: chat.conversation_id, // Use string phone number directly
        user: {
          id: chat.conversation_id, // Use string phone number as the receiver_id
          name: chat.lead?.name || chat.conversation_id,
          email: chat.lead?.email || '',
          avatar: chat.lead?.avatar || '',
          company: chat.lead?.company || 'WhatsApp Contact',
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
      }))

      setChats(prev => {
        if (pageNum === 1) return formattedChats;
        const newChats = [...prev];
        formattedChats.forEach(chat => {
          if (!newChats.some(c => c.id === chat.id)) {
            newChats.push(chat);
          }
        });
        return newChats;
      })
    } catch (error) {
      console.error('Error fetching conversations:', error)
    } finally {
      setIsLoadingChats(false)
      setIsFetchingMore(false)
    }
  }, [debouncedSearchQuery, fetchChatMessages])

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchActiveConversations(1, debouncedSearchQuery)
  }, [debouncedSearchQuery, fetchActiveConversations])

  useEffect(() => {
    // Real-time listener for incoming messages
    let channel: any;

    const setupRealtime = async () => {
      try {
        const user = await me();
        if (!user || !user.id || !window.Echo) return;

        channel = window.Echo.channel(`whatsapp.user.${user.id}`)
          .listen('.whatsapp.message', (data: any) => {
            const incomingMsg = data.message;
            const type = data.type;

            // 1. If the message is for the currently active chat, append it
            setActiveChat(currentActive => {
              if (currentActive && currentActive.id === incomingMsg.sender_id) {
                const formattedMsg: Message = {
                  id: incomingMsg.id,
                  content: incomingMsg.content,
                  sender: (incomingMsg.direction === 'outbound' ? 'agent' : 'user') as 'user' | 'agent',
                  time: formatMessageTime(incomingMsg.message_timestamp || incomingMsg.created_at),
                  created_at: incomingMsg.message_timestamp || incomingMsg.created_at,
                  status: incomingMsg.status,
                  metadata: incomingMsg.metadata
                };

                setMessages(prev => {
                  // Prevent duplicate messages
                  if (prev.some(m => m.id === formattedMsg.id)) return prev;
                  return [...prev, formattedMsg];
                });
              }
              return currentActive;
            });

            // 2. Refresh the conversation list to show new message preview/unread count
            fetchActiveConversations();
          });
      } catch (err) {
        console.error('Failed to setup realtime chat:', err);
      }
    };

    // setupRealtime();

    return () => {
      if (channel) {
        channel.stopListening('.whatsapp.message');
      }
    };
  }, [])

  useEffect(() => {
    if (messagesEndRef.current) {
      if (isInitialScrollRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'instant', block: 'nearest' })
        isInitialScrollRef.current = false
      } else {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
    }
  }, [messages[messages.length - 1]?.id])

  const handleSend = async () => {
    if (!message.trim() || !activeChat || isSending) return
    const text = message
    const optimisticId = `local-${Date.now()}`;
    const newMsg: Message = {
      id: optimisticId,
      content: text,
      sender: 'agent',
      time: formatMessageTime(new Date()),
      created_at: new Date().toISOString(),
      status: 'pending' // Show timer icon immediately
    }

    // Add message to UI immediately
    setMessages(prev => [...prev, newMsg])
    setMessage('')

    try {
      setIsSending(true)
      await sendMessage({
        receiver_id: activeChat.id || activeChat.user.id || 0,
        message: text
      })

      // Update the status to 'sent' once confirmed by server
      setMessages(prev => prev.map(m =>
        m.id === optimisticId ? { ...m, status: 'sent' } : m
      ))
    } catch (error) {
      console.error('Error sending message:', error)
      // Show failed status if server error
      setMessages(prev => prev.map(m =>
        m.id === optimisticId ? { ...m, status: 'failed' } : m
      ))
    } finally {
      setIsSending(false)
    }
  }



  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {}
    messages.forEach(m => {
      let d = 'Today'
      try {
        if (m.created_at) {
          const parsed = new Date(m.created_at)
          if (!isNaN(parsed.getTime())) {
            d = format(parsed, 'MMMM d, yyyy')
          }
        }
      } catch (err) {
        console.error('Date parsing error:', err, m)
      }
      if (!groups[d]) groups[d] = []
      groups[d].push(m)
    })
    return Object.entries(groups)
  }

  return (
    <RoleGuard allowedFeatures={['live_chat']}>
      <div className="h-full w-full flex flex-col flex-1 min-h-0 overflow-hidden p-2 sm:p-3 lg:p-4">
        <div className="h-full w-full flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden bg-[var(--crm-surface-1)] rounded-[var(--r-sm)] border border-[var(--crm-border)] shadow-sm">

        {/* ── Sidebar: Conversations ─────────────────────────────────────── */}
        <div className={cn(
            "w-full lg:w-[320px] flex flex-col shrink-0 overflow-hidden transition-all duration-300 border-r border-[var(--crm-border)] bg-[var(--crm-surface-1)]",
          activeChat ? "hidden lg:flex" : "flex"
        )}>
          <div className="p-4 border-b border-[var(--crm-border)] shrink-0 flex flex-col gap-4 bg-[var(--crm-surface-1)] z-10">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-[var(--crm-text-primary)] flex items-center gap-2">
                Conversations
                <Badge className="bg-[var(--crm-surface-2)] text-[var(--crm-text-primary)] border-[var(--crm-border)] pointer-events-none">
                  {unreadMessages || chats.length}
                </Badge>
              </h1>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-[var(--r-md)] hover:bg-[var(--crm-surface-2)]">
                <MoreVertical className="h-4 w-4 text-[var(--crm-text-secondary)]" />
              </Button>
            </div>
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--crm-text-tertiary)] group-focus-within:text-[var(--crm-text-primary)] transition-colors" />
              <Input
                placeholder="Find customer..."
                className="pl-9 h-9 bg-[var(--crm-surface-2)] border-[var(--crm-border)] hover:border-[var(--crm-border-hover)] focus:bg-[var(--crm-surface-1)] focus:border-[var(--crm-accent)] transition-all rounded-[var(--r-md)]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <ScrollArea 
            className="flex-1 [&>div>div]:!block bg-[var(--crm-surface-1)]"
            onScrollCapture={(e) => {
              const target = e.target as HTMLDivElement;
              if (target.scrollHeight - target.scrollTop <= target.clientHeight + 50) {
                if (hasMore && !isFetchingMore && !isLoadingChats) {
                  const nextPage = page + 1;
                  setPage(nextPage);
                  fetchActiveConversations(nextPage, debouncedSearchQuery);
                }
              }
            }}
          >
              <div className="flex flex-col overflow-hidden">
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
                ) : chats.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                    <div className="h-12 w-12 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center mb-4">
                      <MessageSquare className="h-6 w-6 text-slate-300" />
                    </div>
                    <p className="text-sm font-medium text-slate-500">No active chats found</p>
                  </div>
                ) : (
                  chats.map((chat) => (
                    <Button variant="ghost"
                      key={chat.id}
                      onClick={() => {
                        setActiveChat(chat)
                        setMessagesPage(1)
                        setHasMoreMessages(true)
                        fetchChatMessages(chat.id, 1)
                      }}
                      className={cn(
                        "flex items-center gap-3 p-4 border-b border-[var(--crm-border)] transition-all duration-200 group relative min-w-0 overflow-hidden h-auto w-full rounded-none justify-start",
                        activeChat?.id === chat.id
                          ? "bg-[var(--crm-surface-2)]"
                          : "hover:bg-[var(--crm-surface-2)] active:scale-[0.98]"
                      )}
                    >
                      <div className="relative shrink-0">
                        <div 
                          className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold font-heading text-xs shadow-xs"
                          style={{ backgroundColor: getAgentColor(chat.id).bg }}
                        >
                          {chat.user.name.substring(0, 2).toUpperCase()}
                        </div>
                        {chat.priority === 'high' && (
                          <div className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-red-500 border-2 border-white dark:border-slate-900" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0 text-left overflow-hidden">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <p className={cn(
                            "text-sm font-semibold font-heading truncate flex-1 min-w-0",
                            activeChat?.id === chat.id ? "text-[#FE4548]" : "text-slate-900 dark:text-white"
                          )}>
                            {chat.user.name}
                          </p>
                          <span className="text-[10px] font-normal text-slate-400 whitespace-nowrap shrink-0">
                            {chat.lastActive}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5 font-normal leading-relaxed break-all">
                          {(() => {
                            const content = chat.user.last_message?.content;
                            if (!content) return 'Started a conversation';
                            if (typeof content === 'string') {
                              if (content.startsWith('{')) {
                                try {
                                  const parsed = JSON.parse(content);
                                  return parsed.text?.body || parsed.interactive?.body?.text || parsed.message || parsed.body || content;
                                } catch (e) { return content; }
                              }
                              return content;
                            }
                            if (typeof content === 'object') {
                              return (content as any).text?.body || (content as any).interactive?.body?.text || (content as any).message || (content as any).body || '[Complex Message]';
                            }
                            return String(content);
                          })()}
                        </p>
                      </div>

                      {(chat.user.unread_count ?? 0) > 0 && (
                        <div className="h-5 min-w-[20px] px-1.5 flex items-center justify-center rounded-full bg-[var(--crm-accent)] text-[10px] font-bold text-white shadow-sm shrink-0">
                          {chat.user.unread_count ?? 0}
                        </div>
                      )}

                      {activeChat?.id === chat.id && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-[var(--crm-accent)] rounded-r-full" />
                      )}
                    </Button>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

        {/* ── Main Chat Area ───────────────────────────────────────────── */}
        <div className={cn(
          "flex-1 flex flex-col min-w-0 bg-[var(--crm-surface-1)] overflow-hidden transition-all duration-300",
          !activeChat ? "hidden lg:flex" : "flex"
        )}>
          {activeChat ? (
            <>
              {/* Header */}
              <div className="shrink-0 border-b border-[var(--crm-border)] bg-[var(--crm-surface-1)]">
                <div className="px-4 py-3 sm:px-4 sm:py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3 sm:gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setActiveChat(null)}
                      className="h-9 w-9 -ml-1 lg:hidden rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <div className="relative">
                      <Avatar className="h-10 w-10 shadow-sm ring-2 ring-[var(--crm-accent)]/10">
                        <AvatarImage src={activeChat.user.avatar} />
                        <AvatarFallback className="font-bold text-xs">{activeChat.user.name.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 shadow-sm" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="font-bold text-[var(--crm-text-primary)] flex items-center gap-2 truncate">
                        <span className="truncate">{activeChat.user.name}</span>
                        {activeChat.priority === 'high' && <Badge className="bg-red-50 text-red-600 border-red-100 text-[10px] font-bold px-1.5 py-0 shrink-0">URGENT</Badge>}
                      </h2>
                      <p className="text-xs text-[var(--crm-text-secondary)] font-medium flex items-center gap-1.5 mt-0.5 truncate">
                        <span className="flex items-center gap-1"><Zap className="h-3 w-3 text-amber-500 fill-amber-500" /> <span className="hidden sm:inline">{activeChat.user.company}</span></span>
                        <span className="text-[var(--crm-text-tertiary)] hidden sm:inline">·</span>
                        <span>Active now</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 sm:gap-2">
                    <div className="hidden sm:flex items-center gap-2">
                      <Button variant="outline" size="icon" className="h-9 w-9 rounded-full border-[var(--crm-border)] hover:bg-[var(--crm-surface-2)]">
                        <Phone className="h-4 w-4 text-[var(--crm-text-secondary)]" />
                      </Button>
                      <Button variant="outline" size="icon" className="h-9 w-9 rounded-full border-[var(--crm-border)] hover:bg-[var(--crm-surface-2)]">
                        <Video className="h-4 w-4 text-[var(--crm-text-secondary)]" />
                      </Button>
                      <Separator orientation="vertical" className="h-6 mx-1 bg-[var(--crm-border)]" />
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowUserDetails(!showUserDetails)}
                      className={cn(
                        "h-9 w-9 rounded-full transition-all",
                        showUserDetails ? "bg-[var(--crm-accent-soft)] border-[var(--crm-accent-border)] text-[var(--crm-accent)]" : "border-[var(--crm-border)] hover:bg-[var(--crm-surface-2)]"
                      )}
                    >
                      <Info className="h-4 w-4 text-[var(--crm-text-secondary)]" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Messages & Sidebar Wrapper */}
              <div className="flex-1 flex flex-row min-h-0 overflow-hidden relative">
                <div className="flex-1 flex flex-col min-w-0">
                  <ScrollArea 
                    className="flex-1 px-5 py-6"
                    onScrollCapture={(e) => {
                      const target = e.target as HTMLDivElement;
                      if (target.scrollTop <= 50 && hasMoreMessages && !isFetchingOlderRef.current) {
                        isFetchingOlderRef.current = true;
                        const nextPage = messagesPage + 1;
                        setMessagesPage(nextPage);
                        if (activeChat) {
                          fetchChatMessages(activeChat.id, nextPage);
                        }
                      }
                    }}
                  >
                    {isLoadingMessages ? (
                      <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-400">
                        <Loader2 className="h-8 w-8 animate-spin" />
                        <p className="text-sm font-medium">Securing connection...</p>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center space-y-4 max-w-xs mx-auto">
                        <div className="p-4 rounded-3xl bg-[var(--crm-accent-soft)] text-[var(--crm-accent)] animate-bounce">
                          <Sparkles className="h-8 w-8" />
                        </div>
                        <h3 className="font-bold text-slate-900 dark:text-white">Start the conversation</h3>
                        <p className="text-xs text-slate-500">Send a friendly greeting to {activeChat.user.name} to get things moving.</p>
                      </div>
                    ) : (
                      <div className="min-h-full flex flex-col justify-end space-y-6">
                        {hasMoreMessages && (
                          <div className="flex justify-center py-4">
                            <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                          </div>
                        )}

                        {groupMessagesByDate(messages).map(([date, dateMessages]) => (
                          <div key={date} className="space-y-6">
                            <div className="relative flex justify-center">
                              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                <div className="w-full border-t border-[var(--crm-border)]" />
                              </div>
                              <span className="relative px-3 py-1 bg-[var(--crm-surface-1)] text-[10px] font-bold text-[var(--crm-text-secondary)] uppercase tracking-widest leading-none rounded-[var(--r-full)] border border-[var(--crm-border)]">
                                {date}
                              </span>
                            </div>

                            {dateMessages.map((msg, idx) => {
                              const isAgent = msg.sender === 'agent'
                              return (
                                <div key={msg.id} className={cn("flex w-full group animate-in fade-in slide-in-from-bottom-2 duration-300", isAgent ? "justify-end" : "justify-start")}>
                                  <div className={cn("max-w-[75%] flex flex-col", isAgent ? "items-end" : "items-start")}>
                                    <div className={cn(
                                      "px-4 py-2.5 rounded-[var(--r-lg)] relative group/msg",
                                      isAgent
                                        ? "bg-[var(--crm-accent-soft)] text-[var(--crm-text-primary)] border border-[var(--crm-accent-border)] rounded-tr-none shadow-sm"
                                        : "bg-[var(--crm-surface-1)] text-[var(--crm-text-primary)] rounded-tl-none border border-[var(--crm-border)] shadow-sm"
                                    )}>
                                      <div className="text-sm leading-relaxed whitespace-pre-wrap break-words overflow-wrap-anywhere [word-break:break-word] min-w-[50px]">
                                        {(() => {
                                          const raw = msg.content;
                                          const meta = msg.metadata;
                                          
                                          // Unsupported / error messages from Meta (code 131051)
                                          if (meta?.type === 'unsupported' || (typeof raw === 'string' && raw.startsWith('⚠️'))) {
                                            const errorTitle = meta?.errors?.[0]?.title || 'Message type not supported';
                                            return (
                                              <span className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 italic">
                                                <span>⚠️</span>
                                                <span>{errorTitle}</span>
                                              </span>
                                            );
                                          }

                                          // Media type labels from metadata
                                          if (meta?.type && typeof raw === 'string' && raw.match(/^[\p{Emoji}]/u)) {
                                            return <span className="italic text-[var(--crm-text-secondary)]">{raw}</span>;
                                          }

                                          const extractSafeString = (val: any): string => {
                                            if (!val) return '';
                                            if (typeof val === 'string') return val;
                                            if (typeof val === 'object') {
                                              // WhatsApp Text Object
                                              if (val.body && typeof val.body === 'string') return val.body;
                                              if (val.text && typeof val.text === 'string') return val.text;
                                              if (val.text && typeof val.text === 'object' && typeof val.text.body === 'string') return val.text.body;
                                              
                                              // WhatsApp Interactive Object
                                              if (val.interactive?.body?.text && typeof val.interactive.body.text === 'string') return val.interactive.body.text;
                                              
                                              // WhatsApp Button Object
                                              if (val.type === 'button' && val.button?.text && typeof val.button.text === 'string') return val.button.text;

                                              // Generic keys
                                              if (typeof val.message === 'string') return val.message;
                                              
                                              // Last resort for debugging/safeguard
                                              return ''; 
                                            }
                                            return String(val);
                                          };

                                          // Try raw content first
                                          const fromRaw = extractSafeString(raw);
                                          if (fromRaw && !fromRaw.startsWith('{')) return fromRaw;

                                          // Try JSON parsing
                                          if (typeof raw === 'string' && raw.trim().startsWith('{')) {
                                            try {
                                              const parsed = JSON.parse(raw);
                                              const fromParsed = extractSafeString(parsed);
                                              if (fromParsed) return fromParsed;
                                            } catch (e) {}
                                          }

                                          // Try metadata
                                          if (msg.metadata) {
                                            let metaObj = msg.metadata;
                                            if (typeof metaObj === 'string') {
                                              try {
                                                metaObj = JSON.parse(metaObj);
                                              } catch (e) {}
                                            }
                                            const fromMeta = extractSafeString(metaObj);
                                            if (fromMeta && !fromMeta.startsWith('{')) return fromMeta;
                                            if (metaObj.type === 'template' && typeof metaObj.template?.name === 'string') {
                                              return `Template: ${metaObj.template.name}`;
                                            }
                                          }

                                          return typeof raw === 'string' ? raw : '';
                                        })()}
                                      </div>

                                      {/* Interactive & Fallback Buttons Rendering */}
                                      {(() => {
                                        const buttons: string[] = [];

                                        // Extract from metadata
                                        const meta = msg.metadata;
                                        if (meta?.interactive?.action?.buttons && Array.isArray(meta.interactive.action.buttons)) {
                                          meta.interactive.action.buttons.forEach((b: any) => {
                                            if (b.reply?.title && typeof b.reply.title === 'string') buttons.push(b.reply.title);
                                          });
                                        }

                                        // Extract from text fallback
                                        const contentStr = typeof msg.content === 'string' ? msg.content : '';
                                        if (buttons.length === 0 && contentStr.includes('Quick Reply:')) {
                                          contentStr.split('\n').forEach(line => {
                                            if (line.trim().startsWith('Quick Reply:')) {
                                              buttons.push(line.replace('Quick Reply:', '').trim());
                                            }
                                          });
                                        }

                                        if (buttons.length > 0) {
                                          return (
                                            <div className={cn(
                                              "mt-3 flex flex-wrap gap-2 pt-3",
                                              isAgent ? "border-t border-[var(--crm-accent-border)]" : "border-t border-[var(--crm-border)]"
                                            )}>
                                              {buttons.map((label, i) => (
                                                <Button variant="ghost"
                                                  key={i}
                                                  className="px-3 py-1.5 rounded-[var(--r-lg)] bg-[var(--crm-accent)] text-white hover:opacity-90 active:scale-95 transition-all text-[11px] font-bold uppercase tracking-wider shadow-sm h-auto w-auto"
                                                >
                                                  {typeof label === 'string' ? label : 'Action'}
                                                </Button>
                                              ))}
                                            </div>
                                          );
                                        }

                                        // Handle CTA Link
                                        if (meta?.interactive?.type === 'cta_url') {
                                          const url = meta.interactive.action?.parameters?.url;
                                          const text = meta.interactive.action?.parameters?.display_text;
                                          return (
                                            <div className={cn(
                                              "mt-3 pt-3",
                                              isAgent ? "border-t border-[var(--crm-accent-border)]" : "border-t border-[var(--crm-border)]"
                                            )}>
                                              <a
                                                href={typeof url === 'string' ? url : '#'}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-[var(--r-lg)] bg-[var(--crm-blue)] text-white hover:opacity-90 active:scale-95 transition-all font-bold text-xs shadow-sm"
                                              >
                                                <ExternalLink className="h-3.5 w-3.5" />
                                                {typeof text === 'string' ? text : 'Visit Link'}
                                              </a>
                                            </div>
                                          );
                                        }

                                        return null;
                                      })()}



                                      <div className={cn(
                                        "mt-1.5 flex items-center justify-end gap-1.5",
                                        isAgent ? "text-[var(--crm-accent)]" : "text-[var(--crm-text-tertiary)]"
                                      )}>
                                        <span className="text-[10px] font-bold uppercase tracking-tight">{msg.time}</span>
                                        {isAgent && (
                                          <div className="flex items-center">
                                            {msg.status === 'pending' && (
                                              <Clock className="h-3.5 w-3.5 animate-pulse text-white/60" />
                                            )}
                                            {msg.status === 'failed' && (
                                              <AlertCircle className="h-3.5 w-3.5 text-red-200" />
                                            )}
                                            {(msg.status === 'sent' || msg.status === 'delivered' || msg.status === 'read' || !msg.status) && (
                                              <CheckCheck className={cn("h-4 w-4", msg.status === 'read' ? "text-primary" : "text-[var(--crm-accent)]/60")} />
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        ))}
                        <div ref={messagesEndRef} className="h-2 shrink-0" />
                      </div>
                    )}
                  </ScrollArea>

                  {/* Input Area */}
                  <div className="p-3 lg:p-4 bg-[var(--crm-surface-1)] border-t border-[var(--crm-border)]">
                    <div className="relative flex items-end gap-2 p-1.5 bg-white dark:bg-[#12121a] rounded-[24px] border border-[var(--crm-accent)] shadow-sm focus-within:shadow-md transition-all duration-300">
                      <div className="flex shrink-0 pb-0.5 pl-1 gap-0.5">
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-slate-400 hover:text-[var(--crm-accent)] hover:bg-white dark:hover:bg-slate-900 transition-all shrink-0">
                          <Paperclip className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-slate-400 hover:text-[var(--crm-accent)] hover:bg-white dark:hover:bg-slate-900 transition-all shrink-0">
                          <Smile className="h-5 w-5" />
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
                        className="flex-1 bg-transparent border-none focus:ring-0 focus-visible:ring-0 focus-visible:outline-none resize-none py-3 px-1 text-[14.5px] text-slate-900 dark:text-white placeholder:text-slate-400 min-h-[44px] max-h-32 overflow-y-auto w-full no-scrollbar leading-relaxed"
                        value={message}
                        onChange={(e) => {
                          setMessage(e.target.value);
                          e.target.style.height = 'auto';
                          e.target.style.height = `${Math.min(e.target.scrollHeight, 128)}px`;
                        }}
                        rows={1}
                      />
                      <div className="flex shrink-0 pb-0.5 pr-0.5 gap-1">
                        <Button
                          onClick={handleSend}
                          disabled={!message.trim() || isSending}
                          className="h-10 w-10 p-0 bg-[var(--crm-accent)] hover:opacity-90 text-white rounded-full shadow-[0_2px_8px_rgba(var(--crm-accent-rgb),0.3)] transition-all active:scale-95 disabled:opacity-50 disabled:shadow-none flex items-center justify-center shrink-0"
                        >
                          {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-4 w-4 ml-0.5" />}
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-2 px-2 overflow-x-auto no-scrollbar pb-1">
                      {['Pricing Plan', 'API Help', 'Product Demo', 'Refund Policy'].map((tag) => (
                        <Button variant="ghost"
                          key={tag}
                          onClick={() => handleSend()} // Mock suggest
                          className="text-[10px] font-bold text-[var(--crm-text-secondary)] uppercase tracking-wider h-6 px-2.5 rounded-[var(--r-md)] border border-[var(--crm-border)] hover:border-[var(--crm-border-hover)] hover:bg-[var(--crm-surface-2)] transition-colors whitespace-nowrap p-0 w-auto"
                        >
                          {tag}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* User Detailed Sidebar */}
                {showUserDetails && (
                  <div className="absolute lg:relative right-0 top-0 h-full w-full lg:w-[280px] z-20 shrink-0 border-l border-[var(--crm-border)] bg-white dark:bg-[#12121a] lg:bg-[var(--crm-surface-2)] p-4 flex flex-col gap-4 overflow-y-auto animate-in slide-in-from-right-4 duration-300">
                    <div className="lg:hidden flex items-center justify-between pb-2 border-b border-[var(--crm-border)]">
                      <h3 className="font-bold text-[14px] text-[var(--crm-text-primary)]">Contact Details</h3>
                      <Button variant="ghost" size="icon" onClick={() => setShowUserDetails(false)} className="h-8 w-8 rounded-full bg-[var(--crm-surface-3)]">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="text-center">
                      <h3 className="font-bold text-[15px] text-[var(--crm-text-primary)] mt-2">{activeChat.user.name}</h3>
                      <p className="text-[11px] text-[var(--crm-text-secondary)] font-medium">{activeChat.user.company}</p>
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-0.5">
                        <Label className="text-[10px] uppercase tracking-widest text-[var(--crm-text-tertiary)]">Email Address</Label>
                        <p className="text-[13px] font-medium text-[var(--crm-text-primary)] truncate">{activeChat.user.email || 'N/A'}</p>
                      </div>
                      <div className="space-y-0.5">
                        <Label className="text-[10px] uppercase tracking-widest text-[var(--crm-text-tertiary)]">Location</Label>
                        <p className="text-[13px] font-medium text-[var(--crm-text-primary)]">{activeChat.user.location || 'Unknown'}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase tracking-widest text-[var(--crm-text-tertiary)]">Status</Label>
                        <div className="flex flex-wrap gap-1.5">
                          <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 flex items-center gap-1 text-[9px] px-1.5 py-0"><ShieldCheck className="h-2.5 w-2.5" /> VERIFIED</Badge>
                          <Badge className="bg-[var(--crm-accent-soft)] text-[var(--crm-accent)] border-[var(--crm-accent-border)] text-[9px] px-1.5 py-0">PREMIUM</Badge>
                        </div>
                      </div>
                    </div>

                    <Separator className="bg-[var(--crm-border)]" />

                    <div className="space-y-2">
                      <h4 className="text-[10px] font-bold text-[var(--crm-text-secondary)] uppercase tracking-wider">Common Tags</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {['New Lead', 'Enterprise', 'Support', 'Urgent'].map(t => (
                          <span key={t} className="text-[9px] font-semibold bg-[var(--crm-surface-1)] border border-[var(--crm-border)] text-[var(--crm-text-secondary)] px-2 py-0.5 rounded-[var(--r-md)]">{t}</span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-auto pt-2 flex flex-col gap-2">
                      <Button variant="outline" className="w-full h-8 rounded-[var(--r-md)] text-xs font-semibold border-[var(--crm-border)] hover:bg-[var(--crm-surface-1)] text-[var(--crm-text-primary)]">Block Customer</Button>
                      <Button className="w-full h-8 rounded-[var(--r-md)] text-xs font-semibold bg-[var(--crm-accent)] hover:opacity-90 text-white">Mark as Resolved</Button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-center p-12 bg-[var(--crm-surface-1)]">
              <div className="max-w-md space-y-6">
                <div className="h-20 w-20 mx-auto rounded-[var(--r-lg)] bg-[var(--crm-surface-2)] border border-[var(--crm-border-hover)] flex items-center justify-center">
                  <MessageSquare className="h-8 w-8 text-[var(--crm-text-tertiary)]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[var(--crm-text-primary)]">Select a conversation</h2>
                  <p className="text-sm text-[var(--crm-text-secondary)] mt-2">Choose a customer from the left sidebar to start messaging and providing world-class support.</p>
                </div>
              </div>
            </div>
          )}
        </div>
        </div>
      </div>
    </RoleGuard>
  )
}
