'use client'

import { useState } from 'react'
import { MessageCircle, X, Send, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isStreaming?: boolean
}

export function StreamingFloatingAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [streamContent, setStreamContent] = useState('')

  const addMessage = (role: 'user' | 'assistant', content: string, isStreaming: boolean = false) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date(),
      isStreaming
    }
    setMessages(prev => [...prev, newMessage])
    return newMessage.id
  }

  const updateLastMessage = (content: string) => {
    setMessages(prev => {
      const updated = [...prev]
      if (updated.length > 0 && updated[updated.length - 1].role === 'assistant') {
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          content,
          isStreaming: false
        }
      }
      return updated
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isStreaming) return

    const userMessage = input.trim()
    setInput('')
    addMessage('user', userMessage)

    // Add placeholder for streaming assistant message
    const assistantMessageId = addMessage('assistant', '', true)

    try {
      // TODO: Implement streaming functionality
      // Placeholder response for now
      setTimeout(() => {
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessageId 
            ? { ...msg, content: 'Streaming functionality is not yet implemented. This is a placeholder response.', isStreaming: false }
            : msg
        ))
      }, 1000)
    } catch (err) {
      console.error('Streaming error:', err)
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessageId 
          ? { ...msg, content: 'Sorry, I encountered an error. Please try again.', isStreaming: false }
          : msg
      ))
    }
  }

  return (
    <>
      {/* Floating Action Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-50"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      {/* Chat Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px] h-[600px] flex flex-col p-0">
          <DialogHeader className="p-4 pb-2 border-b">
            <DialogTitle className="flex items-center justify-between">
              <span>SpecChem Assistant (Streaming)</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>

          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Hi! I'm your SpecChem assistant with streaming responses.</p>
                <p className="text-sm mt-2">Ask me about products, search our database, or get help with anything SpecChem related. Responses will stream in real-time!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-3 py-2 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">
                        {message.role === 'assistant' && message.isStreaming 
                          ? streamContent 
                          : message.content}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs opacity-70">
                          {message.timestamp.toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                        {message.role === 'assistant' && message.isStreaming && (
                          <div className="flex items-center space-x-1">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            <span className="text-xs opacity-70">streaming...</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {error && (
                  <div className="flex justify-start">
                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2 max-w-[80%]">
                      <p className="text-sm text-destructive">
                        ⚠️ {error}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 border-t">
            <form onSubmit={handleSubmit} className="flex space-x-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isStreaming ? "Assistant is responding..." : "Ask me anything about SpecChem products..."}
                disabled={isStreaming}
                className="flex-1"
              />
              <Button type="submit" disabled={isStreaming || !input.trim()}>
                {isStreaming ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
            
            {isStreaming && (
              <div className="mt-2 text-xs text-muted-foreground flex items-center">
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                Assistant is typing...
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
