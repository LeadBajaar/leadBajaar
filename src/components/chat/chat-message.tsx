import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface ChatMessageProps {
  message: string
  isBot: boolean
  timestamp: string
  status?: 'sending' | 'sent' | 'error'
}

export function ChatMessage({ message, isBot, timestamp, status }: ChatMessageProps) {
  return (
    <div className={cn(
      "flex gap-3 p-4",
      isBot ? "bg-muted/50" : "flex-row-reverse"
    )}>
      <Avatar>
        <AvatarImage src={isBot ? "/bot-avatar.png" : "/user-avatar.png"} />
        <AvatarFallback>{isBot ? 'B' : 'U'}</AvatarFallback>
      </Avatar>
      <div className={cn(
        "flex flex-col gap-1",
        !isBot && "items-end"
      )}>
        <div className={cn(
          "rounded-lg p-3",
          isBot ? "bg-background" : "bg-primary text-primary-foreground",
          status === 'sending' && "opacity-70",
          status === 'error' && "bg-destructive"
        )}>
          {message}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{new Date(timestamp).toLocaleTimeString()}</span>
          {status && !isBot && (
            <span>{status === 'sending' ? '...' : status === 'error' ? '⚠️' : '✓'}</span>
          )}
        </div>
      </div>
    </div>
  )
} 
