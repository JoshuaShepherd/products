/**
 * Client-side streaming infrastructure for OpenAI Agents
 * Provides utilities for handling server-sent events and streaming responses in React components
 */

'use client'

import { useState } from 'react';

export interface StreamEvent {
  type: 'start' | 'chunk' | 'progress' | 'done' | 'error'
  data?: string
  progress?: number
  error?: string
  metadata?: any
}

/**
 * Creates a ReadableStream for Server-Sent Events
 */
export function createSSEStream(
  generator: AsyncGenerator<StreamEvent>
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const event of generator) {
          const sseData = `data: ${JSON.stringify(event)}\n\n`;
          controller.enqueue(encoder.encode(sseData));
        }
      } catch (error) {
        const errorEvent: StreamEvent = {
          type: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        };
        const sseData = `data: ${JSON.stringify(errorEvent)}\n\n`;
        controller.enqueue(encoder.encode(sseData));
      } finally {
        controller.close();
      }
    }
  });
}

/**
 * Consumes a Server-Sent Event stream on the client side
 */
export function consumeSSEStream(
  url: string,
  onEvent: (event: StreamEvent) => void,
  onError?: (error: Error) => void
): () => void {
  const eventSource = new EventSource(url);

  eventSource.onmessage = (event) => {
    try {
      const streamEvent: StreamEvent = JSON.parse(event.data);
      onEvent(streamEvent);
    } catch (error) {
      onError?.(new Error('Failed to parse stream event'));
    }
  };

  eventSource.onerror = () => {
    onError?.(new Error('Stream connection error'));
  };

  // Return cleanup function
  return () => {
    eventSource.close();
  };
}

/**
 * Utility for handling OpenAI streaming responses
 */
export async function* streamOpenAIResponse(
  stream: AsyncIterable<any>,
  type: 'chat' | 'responses' = 'chat'
): AsyncGenerator<StreamEvent> {
  yield { type: 'start' };

  try {
    if (type === 'chat') {
      // Handle Chat Completions streaming
      for await (const chunk of stream) {
        const content = chunk.choices?.[0]?.delta?.content;
        if (content) {
          yield {
            type: 'chunk',
            data: content,
            metadata: {
              finishReason: chunk.choices?.[0]?.finish_reason,
              usage: chunk.usage
            }
          };
        }
      }
    } else {
      // Handle Responses API streaming
      for await (const event of stream) {
        if (event.type === 'response.output_text.delta') {
          yield {
            type: 'chunk',
            data: event.delta,
            metadata: { eventType: event.type }
          };
        } else if (event.type === 'response.done') {
          yield {
            type: 'done',
            metadata: {
              usage: event.response?.usage,
              outputText: event.response?.output_text
            }
          };
        }
      }
    }

    yield { type: 'done' };
  } catch (error) {
    yield {
      type: 'error',
      error: error instanceof Error ? error.message : 'Stream error'
    };
  }
}

/**
 * Hook for handling streaming in React components
 */
export function useStreaming() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamContent, setStreamContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  const startStreaming = async (
    endpoint: string,
    payload: any,
    onComplete?: (content: string) => void
  ) => {
    setIsStreaming(true);
    setStreamContent('');
    setError(null);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...payload, stream: true }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body reader available');
      }

      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const event: StreamEvent = JSON.parse(line.slice(6));
              
              if (event.type === 'chunk' && event.data) {
                fullContent += event.data;
                setStreamContent(fullContent);
              } else if (event.type === 'error') {
                throw new Error(event.error || 'Streaming error');
              }
            } catch (parseError) {
              // Skip malformed JSON
            }
          }
        }
      }

      onComplete?.(fullContent);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
    } finally {
      setIsStreaming(false);
    }
  };

  return {
    isStreaming,
    streamContent,
    error,
    startStreaming
  };
}
