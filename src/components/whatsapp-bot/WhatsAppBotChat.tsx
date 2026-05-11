'use client';

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, User, Search, Loader2, Phone, Calendar, Check, CheckCheck, MessageSquare, RefreshCw, Trash2, ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { WHATSAPP_BASE_URL } from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface Message {
  id: number;
  phone: string;
  sender_name: string | null;
  message: string;
  direction: 'incoming' | 'outgoing';
  status: string;
  created_at: string;
}

interface Conversation {
  phone: string;
  name: string | null;
  last_message: string;
  last_message_at: string;
}

interface WhatsAppBotChatProps {
  userId: string;
}

export function WhatsAppBotChat({ userId }: WhatsAppBotChatProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(() => {
      if (document.hasFocus()) fetchConversations();
    }, 10000); 
    return () => clearInterval(interval);
  }, [userId]);

  useEffect(() => {
    if (selectedContact) {
      fetchMessages(selectedContact);
      if (pollingRef.current) clearInterval(pollingRef.current);
      pollingRef.current = setInterval(() => {
        if (document.hasFocus()) fetchMessages(selectedContact, true);
      }, 3000);
    }
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [userId, selectedContact]);

  // Auto-scroll disabled per user request to maintain manual scroll position
  // useEffect(() => {
  //   scrollToBottom();
  // }, [messages]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const fetchConversations = async () => {
    try {
      const res = await axios.get(`${WHATSAPP_BASE_URL}/chat/conversations/${userId}`);
      setConversations(res.data || []);
    } catch (err) {
      console.error('Failed to fetch conversations', err);
    }
  };

  const fetchMessages = async (phone: string, isPolling = false) => {
    if (!isPolling) setMessagesLoading(true);
    try {
      const res = await axios.get(`${WHATSAPP_BASE_URL}/chat/history/${userId}/${phone}`);
      setMessages(res.data || []);
    } catch (err) {
      console.error('Failed to fetch history', err);
    } finally {
      if (!isPolling) setMessagesLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedContact) return;

    const messageText = newMessage;
    setNewMessage('');

    try {
      await axios.post(`${WHATSAPP_BASE_URL}/messages/send-message`, {
        userId,
        phone: selectedContact,
        message: messageText
      }, {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_WHATSAPP_SECRET}`
        }
      });
      fetchMessages(selectedContact, true); // Refresh messages
    } catch (err) {
      toast.error('Failed to send message');
      setNewMessage(messageText); // Restore if failed
    }
  };

  const handleDeleteChat = async (e: React.MouseEvent, phone: string) => {
    e.stopPropagation();
    if (confirm(`Delete entire conversation history for +${phone}? This cannot be undone.`)) {
      try {
        await axios.delete(`${WHATSAPP_BASE_URL}/chat/history/${userId}/${phone}`);
        toast.success('Conversation deleted');
        fetchConversations();
        if (selectedContact === phone) {
          setSelectedContact(null);
          setMessages([]);
        }
      } catch (err) {
        toast.error('Failed to delete conversation');
      }
    }
  };

  const filteredConversations = conversations.filter(c => 
    c.phone.includes(searchQuery) || (c.name && c.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className={cn(
      "flex h-[500px] bg-white dark:bg-slate-900 overflow-hidden",
      "rounded-none sm:rounded-2xl" 
    )}>
      {/* Sidebar: Contacts */}
      <div className={cn(
        "w-full md:w-80 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all",
        selectedContact ? "hidden md:flex" : "flex" // Hide list on mobile if chat open
      )}>
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search chats..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl h-10 text-sm"
            />
          </div>
        </div>
        
        <ScrollArea className="flex-1">
          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <User className="h-10 w-10 text-slate-200 mb-4" />
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No Conversations</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {filteredConversations.map((chat) => (
                <div
                  key={chat.phone}
                  onClick={() => setSelectedContact(chat.phone)}
                  className={cn(
                    "flex items-center gap-3 p-4 cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-slate-800/40 group relative",
                    selectedContact === chat.phone && "bg-indigo-50/50 dark:bg-indigo-500/10 border-r-2 border-indigo-500"
                  )}
                >
                  <Avatar className="h-12 w-12 border-2 border-white dark:border-slate-800 shadow-sm">
                    <AvatarFallback className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-black">
                      {chat.name ? chat.name.substring(0, 2).toUpperCase() : <Phone className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white truncate text-sm">
                          {chat.name || 'Unknown Contact'}
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold tracking-tighter">
                          +{chat.phone}
                        </p>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {chat.last_message_at ? format(new Date(chat.last_message_at), 'HH:mm') : ''}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate font-medium">
                      {chat.last_message}
                    </p>
                  </div>

                  {/* Delete Button (Visible on Hover) */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white dark:bg-slate-900 text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm border border-slate-100 dark:border-slate-800 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                    onClick={(e) => handleDeleteChat(e, chat.phone)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Main: Chat Window */}
      <div className={cn(
        "flex-1 flex flex-col bg-slate-50/30 dark:bg-slate-950/20 transition-all",
        !selectedContact ? "hidden md:flex" : "flex" // Hide chat on mobile if list open
      )}>
        {selectedContact ? (
          <>
            {/* Header */}
            <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Back Button for Mobile */}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="md:hidden h-9 w-9 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                  onClick={() => setSelectedContact(null)}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                
                <Avatar className="h-9 w-9 sm:h-10 sm:w-10 ring-2 ring-indigo-500/10">
                  <AvatarFallback className="bg-indigo-600 text-white font-black text-xs sm:text-sm">
                    {selectedContact.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-black text-slate-900 dark:text-white text-sm">
                    {conversations.find(c => c.phone === selectedContact)?.name || 'Unknown Contact'}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                    +{selectedContact}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Active Chat</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-9 px-3 rounded-xl border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 font-bold text-xs"
                  onClick={async () => {
                    if (confirm('Force reset this conversation state to START?')) {
                      try {
                        await axios.post(`${WHATSAPP_BASE_URL}/chatbot/sessions/reset`, {
                          user_id: userId,
                          phone: selectedContact
                        });
                        toast.success('Chatbot session reset to START');
                      } catch (err) {
                        toast.error('Failed to reset session');
                      }
                    }
                  }}
                >
                  <RefreshCw className="mr-2 h-3.5 w-3.5" /> Reset Bot
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messagesLoading && messages.length === 0 ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
                  </div>
                ) : messages.map((msg, idx) => {
                  const isOutgoing = msg.direction === 'outgoing';
                  const showDate = idx === 0 || format(new Date(messages[idx-1].created_at), 'yyyy-MM-dd') !== format(new Date(msg.created_at), 'yyyy-MM-dd');

                  return (
                    <React.Fragment key={msg.id}>
                      {showDate && (
                        <div className="flex justify-center my-6">
                          <Badge variant="outline" className="bg-slate-100 dark:bg-slate-800 border-none text-slate-500 text-[10px] font-black tracking-widest px-3">
                            {format(new Date(msg.created_at), 'MMMM dd, yyyy')}
                          </Badge>
                        </div>
                      )}
                      <div className={cn(
                        "flex flex-col max-w-[80%]",
                        isOutgoing ? "ml-auto items-end" : "mr-auto items-start"
                      )}>
                        <div className={cn(
                          "px-4 py-3 rounded-2xl text-sm font-medium shadow-sm",
                          isOutgoing 
                            ? "bg-indigo-600 text-white rounded-tr-none shadow-indigo-500/10" 
                            : "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-none border border-slate-100 dark:border-slate-700"
                        )}>
                          {msg.message}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1.5 px-1">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                            {format(new Date(msg.created_at), 'HH:mm')}
                          </span>
                          {isOutgoing && (
                            msg.status === 'read' ? (
                              <CheckCheck className="h-3 w-3 text-indigo-500" />
                            ) : (
                              <Check className="h-3 w-3 text-slate-400" />
                            )
                          )}
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl h-12 font-medium"
                />
                <Button type="submit" size="icon" className="h-12 w-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 shrink-0">
                  <Send className="h-5 w-5" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="h-24 w-24 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mb-6 border border-indigo-100 dark:border-indigo-800 shadow-inner">
              <MessageSquare className="h-10 w-10 text-indigo-500" />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">Select a conversation</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mt-2 font-medium">
              Choose a contact from the list to start chatting in real-time with your connected WhatsApp node.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
