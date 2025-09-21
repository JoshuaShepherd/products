/**
 * Server-side streaming utilities for OpenAI API integration
 * Handles SSE stream creation and OpenAI response streaming
 */

export interface StreamEvent {
  type: 'start' | 'chunk' | 'progress' | 'done' | 'error'
  data?: string
  progress?: number
  error?: string
  metadata?: any
}

/**
 * Creates a Server-Sent Events stream from an async generator
 */
export function createSSEStream(generator: AsyncGenerator<StreamEvent>): ReadableStream {
  const encoder = new TextEncoder()
  
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const event of generator) {
          const sseEvent = `data: ${JSON.stringify(event)}\n\n`
          controller.enqueue(encoder.encode(sseEvent))
        }
      } catch (error) {
        console.error('SSE Stream error:', error)
        const errorEvent = `data: ${JSON.stringify({
          type: 'error',
          error: error instanceof Error ? error.message : 'Unknown streaming error'
        })}\n\n`
        controller.enqueue(encoder.encode(errorEvent))
      } finally {
        controller.close()
      }
    }
  })
}

/**
 * Streams OpenAI API responses as Server-Sent Events
 */
export async function* streamOpenAIResponse(
  openaiStream: AsyncIterable<any>,
  options: {
    extractContent?: (chunk: any) => string | null
    onProgress?: (progress: number) => void
    onComplete?: () => void
  } = {}
): AsyncGenerator<StreamEvent> {
  const { 
    extractContent = (chunk) => chunk.choices?.[0]?.delta?.content || null,
    onProgress,
    onComplete 
  } = options

  let totalChunks = 0
  
  try {
    for await (const chunk of openaiStream) {
      totalChunks++
      
      // Extract content from chunk
      const content = extractContent(chunk)
      
      if (content) {
        yield {
          type: 'chunk',
          data: content,
          metadata: {
            chunkIndex: totalChunks,
            finishReason: chunk.choices?.[0]?.finish_reason,
            usage: chunk.usage
          }
        }
      }
      
      // Report progress if callback provided
      if (onProgress) {
        onProgress(totalChunks)
        yield {
          type: 'progress',
          progress: totalChunks,
          metadata: { totalChunks }
        }
      }
      
      // Check for completion
      if (chunk.choices?.[0]?.finish_reason === 'stop') {
        if (onComplete) onComplete()
        yield { 
          type: 'done',
          metadata: { 
            totalChunks,
            finishReason: chunk.choices[0].finish_reason,
            usage: chunk.usage
          }
        }
        break
      }
    }
  } catch (error) {
    console.error('OpenAI streaming error:', error)
    yield {
      type: 'error',
      error: error instanceof Error ? error.message : 'OpenAI streaming error'
    }
  }
}

/**
 * Server-side utility to consume and process SSE streams
 */
export async function* consumeServerStream(
  response: Response
): AsyncGenerator<StreamEvent> {
  const reader = response.body?.getReader()
  const decoder = new TextDecoder()

  if (!reader) {
    throw new Error('No response body reader available')
  }

  try {
    while (true) {
      const { done, value } = await reader.read()
      
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split('\n')

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const event = JSON.parse(line.slice(6))
            yield event as StreamEvent
          } catch (parseError) {
            // Skip malformed JSON
            console.warn('Failed to parse SSE event:', line)
          }
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
}
