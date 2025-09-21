'use client'

import { useState, useRef } from 'react'
import { MessageCircle, X, Send, Loader2, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isStreaming?: boolean
}

export function FloatingAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [useStreaming, setUseStreaming] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  
  // Streaming functionality
  const [streamingContent, setStreamingContent] = useState('')
  const [streamingError, setStreamingError] = useState<string | null>(null)

  const startStreamingResponse = async (
    endpoint: string,
    payload: any,
    onComplete?: (content: string) => void
  ) => {
    setStreamingContent('')
    setStreamingError(null)
    setIsStreaming(true)

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...payload, stream: true }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('No response body reader available')
      }

      let fullContent = ''

      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const event = JSON.parse(line.slice(6))
              
              if (event.type === 'chunk' && event.data) {
                fullContent += event.data
                setStreamingContent(fullContent)
              } else if (event.type === 'error') {
                throw new Error(event.error || 'Streaming error')
              }
            } catch (parseError) {
              // Skip malformed JSON
            }
          }
        }
      }

      onComplete?.(fullContent)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setStreamingError(errorMessage)
    } finally {
      setIsStreaming(false)
    }
  }

  // Use a counter to ensure unique IDs
  const messageIdCounter = useRef(0)

  const addMessage = (role: 'user' | 'assistant', content: string, isStreamingMsg: boolean = false) => {
    const newMessage: Message = {
      id: `msg-${++messageIdCounter.current}-${Date.now()}`,
      role,
      content,
      timestamp: new Date(),
      isStreaming: isStreamingMsg
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
    // Clear streaming content when message is finalized
    setStreamingContent('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading || isStreaming) return

    const userMessage = input.trim()
    setInput('')
    addMessage('user', userMessage)

    if (useStreaming) {
      // Use streaming approach
      const assistantMessageId = addMessage('assistant', '', true)

      try {
        await startStreamingResponse(
          '/api/assistant/stream',
          { 
            message: userMessage, 
            messages: messages.filter(m => m.role !== 'assistant' || !m.isStreaming),
            stream: true,
            api: 'responses'
          },
          (finalContent: string) => {
            updateLastMessage(finalContent)
          }
        )
      } catch (err) {
        console.error('Streaming error:', err)
        updateLastMessage('Sorry, I encountered an error. Please try again.')
      }
    } else {
      // Use traditional non-streaming approach (your existing implementation)
      setIsLoading(true)

      try {
        const response = await fetch('/api/assistant', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: userMessage, messages }),
        })

        if (!response.ok) {
          throw new Error('Failed to get response')
        }

        const data = await response.json()
        addMessage('assistant', data.response)
      } catch (error) {
        console.error('Error:', error)
        addMessage('assistant', 'Sorry, I encountered an error. Please try again.')
      } finally {
        setIsLoading(false)
      }
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
              <div className="flex items-center gap-2">
                <span>SpecChem Assistant</span>
                {useStreaming && (
                  <Badge variant="secondary" className="text-xs">
                    <Zap className="h-3 w-3 mr-1" />
                    Streaming
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {/* Streaming Toggle */}
                <Button
                  variant={useStreaming ? "default" : "outline"}
                  size="sm"
                  onClick={() => setUseStreaming(!useStreaming)}
                  className="text-xs"
                >
                  <Zap className="h-3 w-3 mr-1" />
                  {useStreaming ? 'ON' : 'OFF'}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-6 w-6"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>

          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Hi! I'm your SpecChem assistant.</p>
                <p className="text-sm mt-2">Ask me about products, search our database, or get help with anything SpecChem related.</p>
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="text-xs">
                    💡 <strong>New:</strong> Toggle streaming mode for real-time responses!
                  </p>
                </div>
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
                          ? streamingContent 
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
                
                {(isLoading && !useStreaming) && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg px-3 py-2">
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}

                {streamingError && (
                  <div className="flex justify-start">
                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2 max-w-[80%]">
                      <p className="text-sm text-destructive">
                        ⚠️ {streamingError}
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
                placeholder={
                  isLoading || isStreaming 
                    ? "Assistant is responding..." 
                    : "Ask me anything about SpecChem products..."
                }
                disabled={isLoading || isStreaming}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading || isStreaming || !input.trim()}>
                {(isLoading || isStreaming) ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
            
            {(isLoading || isStreaming) && (
              <div className="mt-2 text-xs text-muted-foreground flex items-center">
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                {useStreaming ? 'Streaming response...' : 'Generating response...'}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
