'use client'

import { useEffect, useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { Send, Phone, Video, Search, Loader2 } from 'lucide-react'
// import useEcho from '@/hooks/echo'
// import { axios } from '@/lib/axios'
import { getMessages, sendMessage, getLeadsWithLatestMessages, getConversationMessages } from '@/lib/api'

interface WhatsAppInteractive {
  type: string;
  body: {
    text: string;
  };
  action: {
    buttons: Array<{
      type: string;
      reply: {
        id: string;
        title: string;
      };
    }>;
  };
}

interface Message {
  id: number;
  content: string;
  metadata?: string | null;
  sender: 'user' | 'agent';
  time: string;
  created_at: string;
  sender_id: number;
  receiver_id: number;
  direction?: 'inbound' | 'outbound';
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

interface WhatsAppButtonMessage {
  context?: {
    from: string;
    id: string;
  };
  from: string;
  id: string;
  timestamp: string;
  type: 'button';
  button: {
    payload: string;
    text: string;
  };
}

interface MessageMetadata {
  type: 'button' | 'interactive';
  context?: {
    from: string;
    id: string;
  };
  originalMessage?: WhatsAppButtonMessage;
  interactive?: WhatsAppInteractive;
}

interface MessageResponse {
  id: number;
  content: string;
  metadata: string | MessageMetadata;
  direction: 'inbound' | 'outbound';
  timestamp: string;
  sender: { id: number; type: string };
  receiver: { id: number; type: string };
}

// const initialChats = [
//   {
//     id: 1,
//     user: { 
//       name: 'John Doe', 
//       email: 'john@example.com', 
//       avatar: 'https://cdn-icons-png.flaticon.com/512/924/924915.png',
//       company: 'Tech Corp',
//       location: 'New York, USA'
//     },
//     messages: [
//       { id: 1, content: 'Hi, I need help with your enterprise plan', sender: 'user', time: '10:00 AM' },
//       { id: 2, content: 'Hello John! I\'d be happy to assist you with our enterprise plan. What specific information are you looking for?', sender: 'agent', time: '10:02 AM' },
//       { id: 3, content: 'I\'m interested in the pricing and features for a team of 50', sender: 'user', time: '10:05 AM' },
//       { id: 4, content: 'For a team of 50, our enterprise plan offers customized pricing. It includes advanced collaboration tools, priority support, and enhanced security features. Would you like me to arrange a call with our sales team to discuss this further?', sender: 'agent', time: '10:07 AM' },
//     ],
//     status: 'active',
//     lastActive: 'Just now',
//     priority: 'high'
//   },
//   {
//     id: 2,
//     user: { 
//       name: 'Sarah Wilson', 
//       email: 'sarah@example.com', 
//       avatar: 'https://cdn-icons-png.flaticon.com/512/924/924915.png',
//       company: 'Design Co',
//       location: 'London, UK'
//     },
//     messages: [
//       { id: 1, content: 'Is there a free trial available for the pro plan?', sender: 'user', time: '9:45 AM' },
//       { id: 2, content: 'Hello Sarah! Yes, we offer a 14-day free trial for our pro plan. Would you like me to set that up for you?', sender: 'agent', time: '9:47 AM' },
//       { id: 3, content: 'That would be great, thank you!', sender: 'user', time: '9:50 AM' },
//       { id: 4, content: 'Excellent! I\'ve just activated your 14-day pro trial. You should receive an email shortly with login details and a quick start guide. Is there anything else you\'d like to know about the features?', sender: 'agent', time: '9:52 AM' },
//     ],
//     status: 'active',
//     lastActive: '5m ago',
//     priority: 'medium'
//   },
//   {
//     id: 3,
//     user: { 
//       name: 'Alex Johnson', 
//       email: 'alex@example.com', 
//       avatar: 'https://cdn-icons-png.flaticon.com/512/924/924915.png',
//       company: 'Dev Solutions',
//       location: 'Toronto, Canada'
//     },
//     messages: [
//       { id: 1, content: 'I\'m having trouble integrating your API', sender: 'user', time: '11:30 AM' },
//       { id: 2, content: 'I\'m sorry to hear that, Alex. Can you provide more details about the specific issue you\'re encountering?', sender: 'agent', time: '11:32 AM' },
//     ],
//     status: 'active',
//     lastActive: '30m ago',
//     priority: 'high'
//   }
// ]

export default function LiveChatPage() {
  const [activeChat, setActiveChat] = useState<Chat | null>(null)
  const [message, setMessage] = useState('')
  const [chats, setChats] = useState<Chat[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [unreadMessages, setUnreadMessages] = useState(0)
  const [isLoadingChats, setIsLoadingChats] = useState(true)
  // const echo = useEcho()
  const user = { id: 1 } // Mocked user for testing
  const [activeConversations, setActiveConversations] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const initializeChat = async () => {
      try {
        // Initialize Echo
        // if (echo) {
        //   echo.private(`chat.${user.id}`)
        //     .listen('MessageSent', (event: any) => {
        //       // console.log('Real-time event received: ', event)
        //       if (event.receiver.id === 1) {
        //         console.log('Real-time event received: ', event);
        //         console.log('event.message: ', event.message);
        //         console.log('message');
        //         setUnreadMessages(prev => prev + 1)
        //         // Add new message to messages list
        //         setMessages(prev => [...prev, event.message])
        //       }
        //     })
          
        //   // // Listening to WhatsAppMessageEvent
        //   // echo.private(`whatsapp.chat.${user.id}`)
        //   //   .listen('WhatsAppMessageEvent', (event: any) => {
        //   //     console.log('WhatsApp message received: ', event)
        //   //     // Handle WhatsApp message event
        //   //     setMessages(prev => [...prev, event.message])
        //   //   })
        // }

        // Fetch messages
        // const response = await getMessages({
        //   user_id: user.id,
        // })
        // console.log('response: ', response);
        // setMessages(response.data)
        // setUnreadMessages(response.data.length)
      } catch (error) {
        console.error('Error initializing chat:', error)
      }
    }

    if (user?.id) {
      initializeChat()
    }
    console.log('unreadMessages: ', unreadMessages)
    console.log(isSending)
    return () => {
      // Cleanup Echo listeners when component unmounts
      // echo?.private(`chat.${user.id}`)?.stopListening('MessageSent')
      // echo?.private(`whatsapp.chat.${user.id}`)?.stopListening('WhatsAppMessageEvent') // Cleanup for WhatsAppMessageEvent
    }
  // }, [echo, user?.id])
  }, [ user?.id])

  // const sendTestMessage = async () => {
  //   try {
  //     setIsSending(true)
      
  //     // Ensure CSRF token is fresh
  //     // await axios.get('/sanctum/csrf-cookie')
      
  //     const response = await sendMessage({
  //       receiver_id: 1, // Sending to user 2
  //       sender_id: 2,
  //       message: 'Test notification message',
  //     })

  //     if (response.status === 200) {
  //       console.log('Test message sent successfully')
  //     }
  //   } catch (error) {
  //     console.error('Error sending message:', error)
  //   } finally {
  //     setIsSending(false)
  //   }
  // }

  const handleSend = async (predefinedText?: string) => {
    const messageText = predefinedText || message;
    if (!messageText.trim() || !activeChat) return;

    try {
      setIsSending(true);
      const response = await sendMessage({
        receiver_id: activeChat.user.id,
        sender_id: 1, // Use your actual agent/user ID
        message: messageText
      });

      if (response?.message) {
        setMessages(prev => [...prev, response.message]);
        if (!predefinedText) setMessage(''); // Only clear input if not a quick reply
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  // const filteredChats = chats.filter(chat => 
  //   chat.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //   chat.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //   chat.user.company.toLowerCase().includes(searchQuery.toLowerCase())
  // )

  const fetchActiveConversations = async () => {
    try {
      const response = await getLeadsWithLatestMessages();
      console.log('response: ', response);
      
      if (!response || !Array.isArray(response)) {
        throw new Error('Invalid response format');
      }

      const formattedChats: Chat[] = response.map((chat: any) => {
        // Add null checks for lead object
        if (!chat?.lead) {
          console.warn('Chat object missing lead data:', chat);
          return null;
        }

        return {
          id: parseInt(chat.conversation_id) || 0, // Handle string ID
          user: {
            id: chat.lead?.id || 0,
            name: chat.lead?.name || 'Unknown User',
            email: chat.lead?.email || '',
            avatar: chat.lead?.avatar || 'https://cdn-icons-png.flaticon.com/512/924/924915.png',
            company: chat.lead?.company || 'Unknown Company',
            location: chat.lead?.location || 'Unknown Location',
            last_message: chat.last_message ? {
              id: Date.now(), // Generate temporary ID if needed
              content: chat.last_message.content || '',
              sender: chat.last_message.direction === 'outbound' ? 'agent' : 'user',
              time: formatMessageTime(chat.last_message.timestamp),
              created_at: chat.last_message.timestamp || '',
              sender_id: 0,
              receiver_id: 0,
            } : undefined,
            unread_count: chat.unread_count || 0
          } as ChatUser,
          messages: [], // Messages will be loaded separately
          status: chat.status || 'active',
          lastActive: formatLastActive(chat.last_activity || chat.last_message?.timestamp),
          priority: determinePriority(chat.priority, chat.unread_count)
        } as Chat;
      }).filter((chat): chat is Chat => chat !== null); // Filter out null values

      setChats(formattedChats);
      if (!activeChat && formattedChats.length > 0) {
        setActiveChat(formattedChats[0]);
        // Fetch messages for the first chat
        fetchChatMessages(formattedChats[0].id);
      }
      setActiveConversations(formattedChats);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setError('Error fetching conversations.');
    } finally {
      setIsLoadingChats(false);
    }
  };

  const formatLastActive = (timestamp: string | undefined): string => {
    if (!timestamp) return 'Never';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  const determinePriority = (priority: string | undefined, unreadCount: number = 0): 'high' | 'medium' | 'low' => {
    if (unreadCount > 5) return 'high';
    if (priority === 'high') return 'high';
    if (unreadCount > 0) return 'medium';
    return 'low';
  };

  const processMessage = (message: Message) => {
    try {
      // Check if content is JSON
      if (typeof message.content === 'string' && message.content.startsWith('{')) {
        const parsedContent = JSON.parse(message.content);
        
        // Handle button message type
        if (parsedContent.type === 'button') {
          const buttonMessage = parsedContent as WhatsAppButtonMessage;
          return {
            ...message,
            content: buttonMessage.button.text, // or use buttonMessage.button.payload
            metadata: {
              type: 'button',
              context: buttonMessage.context,
              originalMessage: buttonMessage
            }
          };
        }
      }
      return message;
    } catch (error) {
      // If JSON parsing fails, return original message
      return message;
    }
  };

  const fetchChatMessages = async (chatId: number) => {
    try {
      const response = await getConversationMessages(chatId);
      if (response?.messages && Array.isArray(response.messages)) {
        const formattedMessages = response.messages.map((msg: any) => ({
          id: msg.id,
          content: msg.content || '',
          metadata: msg.metadata,
          sender: msg.direction === 'outbound' ? 'agent' : 'user',
          time: formatMessageTime(msg.created_at || msg.timestamp),
          created_at: msg.created_at || msg.timestamp,
          sender_id: msg.sender?.id || 0,
          receiver_id: msg.receiver?.id || 0,
          direction: msg.direction
        }));
        setMessages(formattedMessages.map(processMessage));
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const formatMessageTime = (timestamp: string | undefined): string => {
    if (!timestamp) return '';
    
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      console.error('Error formatting message time:', error);
      return '';
    }
  };

  // Add this function to fetch only latest messages for active chat
  const fetchLatestMessages = async (chatId: number, lastMessageTimestamp?: string) => {
    try {
      const timestamp = lastMessageTimestamp ? new Date(lastMessageTimestamp).toISOString() : undefined;
      const response = await getConversationMessages(chatId, timestamp);
      
      if (response?.messages && Array.isArray(response.messages)) {
        const newMessages = response.messages.map((msg: MessageResponse) => ({
          id: msg.id,
          content: msg.content || '',
          metadata: msg.metadata,
          sender: msg.direction === 'outbound' ? 'agent' : 'user',
          time: formatMessageTime(msg.timestamp),
          created_at: msg.timestamp,
          sender_id: msg.sender?.id || 0,
          receiver_id: msg.receiver?.id || 0,
          direction: msg.direction
        }));
        
        // Filter out duplicate messages using message IDs
        setMessages(prev => {
          const existingIds = new Set(prev.map(m => m.id));
          const uniqueNewMessages = newMessages
            .map(processMessage)
            .filter(msg => !existingIds.has(msg.id));
          return [...prev, ...uniqueNewMessages];
        });
      }
    } catch (error) {
      console.error('Error fetching latest messages:', error);
    }
  };

  // Update the useEffect for chat refresh
  useEffect(() => {
    // Initial fetch of all conversations
    fetchActiveConversations();

    // Set up interval only for active chat
    let interval: NodeJS.Timeout;
    if (activeChat) {
      // Initial fetch of messages
      fetchChatMessages(activeChat.id);
      
      interval = setInterval(() => {
        const lastMessage = messages[messages.length - 1];
        console.log('lastMessage: ', lastMessage);
        if (lastMessage?.created_at) {
          fetchLatestMessages(activeChat.id, lastMessage.created_at);
        }
      }, 30000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeChat?.id]); // Dependency on activeChat.id

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const groupMessagesByDate = (messages: Message[]) => {
    const groups = messages.reduce((groups: { [key: string]: Message[] }, message) => {
      const date = new Date(message.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
      return groups;
    }, {});

    return Object.entries(groups).sort((a, b) => 
      new Date(a[0]).getTime() - new Date(b[0]).getTime()
    );
  };

  const handleButtonClick = (buttonId: string, buttonTitle: string) => {
    if (!activeChat) return;
    handleSend(buttonTitle);
  };

  const MessageDisplay = ({ message }: { message: Message }) => {
    // Function to format text with emojis and quick replies
    const formatContent = (content: string) => {
      // Split content by "Quick Reply:" to separate main message and quick replies
      const parts = content.split('Quick Reply:');
      const mainMessage = parts[0];
      const quickReplies = parts.slice(1).map(reply => reply.trim());

      return (
        <div className="space-y-2">
          <p className="whitespace-pre-line">{mainMessage}</p>
          {quickReplies.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {quickReplies.map((reply, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleButtonClick(`quick-reply-${index}`, reply)}
                  className="text-xs"
                >
                  {reply}
                </Button>
              ))}
            </div>
          )}
        </div>
      );
    };

    const processedMessage = processMessage(message);
    
    // Handle WhatsApp button responses
    if (processedMessage.metadata?.type === 'button') {
      return (
        <div className="space-y-2">
          <p className="whitespace-pre-line">
            {processedMessage.content}
          </p>
          <div className="text-xs text-muted-foreground">
            Button Response
          </div>
        </div>
      );
    }

    // Handle interactive messages (WhatsApp)
    if (message.metadata) {
      try {
        const metadata = typeof message.metadata === 'string' 
          ? JSON.parse(message.metadata) 
          : message.metadata;

        if (metadata.type === 'interactive' && metadata.interactive) {
          const { body, action } = metadata.interactive as WhatsAppInteractive;
          
          return (
            <div className="space-y-2">
              <p className="whitespace-pre-line">{body.text}</p>
              {action?.buttons && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {action.buttons.map((btn) => (
                    <Button
                      key={btn.reply.id}
                      variant="outline"
                      size="sm"
                      onClick={() => handleButtonClick(btn.reply.id, btn.reply.title)}
                      className="text-xs"
                    >
                      {btn.reply.title}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          );
        }
      } catch (e) {
        console.error('Error handling message metadata:', e);
      }
    }

    // Handle regular messages with quick replies
    if (message.content && message.content.includes('Quick Reply:')) {
      return formatContent(message.content);
    }

    // Default message display
    return <p className="whitespace-pre-line">{processedMessage.content}</p>;
  };

  return (
    <div className="h-full flex gap-4 p-2">
      <Card className="w-80 flex flex-col">
        <CardHeader className="p-4 pb-2 flex-shrink-0">
          <div className="space-y-2">
            <CardTitle>Active Conversations</CardTitle>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto">
            {isLoadingChats ? (
              <div className="p-4 text-center">
                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                <p className="text-sm text-muted-foreground mt-2">Loading conversations...</p>
              </div>
            ) : error ? (
              <div className="p-4 text-center text-red-500">
                {error}
              </div>
            ) : chats.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No active conversations
              </div>
            ) : (
              <div className="space-y-1 w-full">
                {activeConversations.map((chat) => (
                  <button
                    key={chat.id}
                    className={cn(
                      "w-full p-3 text-left transition-colors block relative",
                      activeChat?.id === chat.id
                        ? "bg-gray-100 dark:bg-gray-800"
                        : "hover:bg-gray-50 dark:hover:bg-gray-900"
                    )}
                    onClick={() => {
                      setActiveChat(chat);
                      fetchChatMessages(chat.id);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="flex-shrink-0">
                        <AvatarImage src={chat.user.avatar} alt={chat.user.name} />
                        <AvatarFallback>{chat.user.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate pr-2">{chat.user.name}</p>
                          {chat.user.unread_count !== undefined && chat.user.unread_count > 0 && (
                            <Badge variant="destructive" className="flex-shrink-0">
                              {chat.user.unread_count}
                            </Badge>
                          )}
                          <Badge 
                            variant={chat.priority === 'high' ? 'destructive' : 'secondary'}
                            className="flex-shrink-0"
                          >
                            {chat.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {chat.user.company}
                        </p>
                        {chat.user.last_message && (
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-muted-foreground truncate">
                              {chat.user.last_message.content}
                            </p>
                            <span className="text-xs text-muted-foreground flex-shrink-0 ml-auto">
                              {chat.lastActive}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="flex-1 flex flex-col">
        <CardHeader className="p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={activeChat?.user.avatar} alt={activeChat?.user.name} />
                <AvatarFallback>{activeChat?.user.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle>{activeChat?.user.name}</CardTitle>
                  <Badge 
                    variant={activeChat?.priority === 'high' ? 'destructive' : 'secondary'}
                  >
                    {activeChat?.priority}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <p>{activeChat?.user.company}</p>
                  <span>•</span>
                  <p>{activeChat?.user.location}</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon">
                <Phone className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Video className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {/* <Button 
            onClick={sendTestMessage}
            disabled={isSending}
            className="ml-2"
          >
            {isSending ? 'Sending...' : 'Send Test Message to User 2'}
          </Button> */}
        </CardHeader>
        <Separator />
        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-full">
            <div className="space-y-6 p-4">
              {groupMessagesByDate(messages).map(([date, dateMessages]) => (
                <div key={date} className="space-y-4">
                  <div className="flex justify-center">
                    <div className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground">
                      {date === new Date().toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) ? 'Today' : date}
                    </div>
                  </div>
                  
                  {dateMessages.sort((a, b) => 
                    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                  ).map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex",
                        message.sender === 'user' ? "justify-end" : "justify-start"
                      )}
                    >
                      <div className={cn(
                        "rounded-lg px-4 py-2 max-w-[50%] shadow-sm",
                        message.sender === 'user'
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}>
                        <MessageDisplay message={message} />
                        <p className="text-xs mt-1 opacity-70">
                          {new Date(message.created_at).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </CardContent>
        <Separator />
        <CardContent className="p-4 flex-shrink-0">
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
            <Input
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-grow"
            />
            <Button type="submit">
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

