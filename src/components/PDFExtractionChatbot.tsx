'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Loader2, Upload, FileText, CheckCircle2, AlertCircle, Database, Eye, GitCompare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getFieldOwner } from '@/lib/fieldOwnership'

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  metadata?: {
    fileName?: string
    fileSize?: number
    extractionStatus?: 'uploading' | 'processing' | 'complete' | 'error'
    extractedData?: any
    confidence?: string
    runId?: string
    updatesPerformed?: number
    productId?: string
  }
}

interface ExtractionRun {
  id: string
  product_candidate: string | null
  product_id: string | null
  document_type: string
  source_file_path: string
  raw_text: string | null
  extracted_json: any
  confidence: string
  needs_manual_review: boolean
  status: string
  error: string | null
  created_at: string
  audit_log: AuditLogEntry[]
}

interface AuditLogEntry {
  id: string
  field: string
  old_value: any
  new_value: any
  action: string
  reason: string
  created_at: string
}

interface ExtractionResult {
  metadata: {
    document_type: string
    product_name_extracted: string
    extraction_confidence: 'high' | 'medium' | 'low'
    document_quality: string
    flags: {
      needs_manual_review: boolean
      has_ambiguities: boolean
      missing_critical_data: boolean
    }
  }
  product_match: {
    existing_product_id: string | null
    match_confidence: string
    action_required: string
  }
  extracted_data: {
    product: Record<string, any>
    pictograms: Array<{ slug: string; confidence: string }>
    category: { suggested_slug: string; confidence: string }
  }
  extraction_notes: {
    high_confidence_fields: string[]
    low_confidence_fields: string[]
    missing_fields: string[]
    ambiguities: Array<{ field: string; issue: string; recommendation: string }>
    data_quality_issues: Array<{ field: string; issue: string }>
  }
  recommended_actions: string[]
}

export function PDFExtractionChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'system',
      content: 'Welcome to the SpecChem PDF Data Extractor! Upload a Technical Data Sheet (TDS) or Safety Data Sheet (SDS) and I\'ll extract and map the data to your database.',
      timestamp: new Date(),
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null)
  const [extractionRun, setExtractionRun] = useState<ExtractionRun | null>(null)
  const [currentProduct, setCurrentProduct] = useState<any>(null)
  const [showPreview, setShowPreview] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const messageIdCounter = useRef(0)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const addMessage = (role: 'user' | 'assistant' | 'system', content: string, metadata?: Message['metadata']) => {
    const newMessage: Message = {
      id: `msg-${++messageIdCounter.current}-${Date.now()}`,
      role,
      content,
      timestamp: new Date(),
      metadata
    }
    setMessages(prev => [...prev, newMessage])
    return newMessage.id
  }

  const updateMessage = (id: string, updates: Partial<Message>) => {
    setMessages(prev => prev.map(msg => 
      msg.id === id ? { ...msg, ...updates } : msg
    ))
  }

  const fetchExtractionRun = async (runId: string) => {
    try {
      const response = await fetch(`/api/extractions/${runId}`)
      if (!response.ok) throw new Error('Failed to fetch extraction run')
      const run: ExtractionRun = await response.json()
      setExtractionRun(run)
      
      // If there's a matched product, fetch its current data
      if (run.product_id) {
        const productResponse = await fetch(`/api/product?id=${run.product_id}&format=canonical`)
        if (productResponse.ok) {
          const productData = await productResponse.json()
          setCurrentProduct(productData.product)
        }
      }
    } catch (error) {
      console.error('Failed to fetch extraction run:', error)
    }
  }

  const handleShowPreview = (runId: string) => {
    setSelectedRunId(runId)
    setShowPreview(true)
    fetchExtractionRun(runId)
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      addMessage('system', '⚠️ Please upload a PDF file only.')
      return
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      addMessage('system', '⚠️ File size must be less than 10MB.')
      return
    }

    const userMessageId = addMessage('user', `Uploaded: ${file.name}`, {
      fileName: file.name,
      fileSize: file.size,
      extractionStatus: 'uploading'
    })

    const assistantMessageId = addMessage('assistant', 'Processing your PDF...', {
      extractionStatus: 'uploading'
    })

    setIsLoading(true)
    setUploadProgress(10)

    try {
      setUploadProgress(30)
      updateMessage(assistantMessageId, {
        content: '🤖 Analyzing document with Agent Builder...',
        metadata: { extractionStatus: 'processing' }
      })

      // Process with Agent Builder + Chatkit
      const formData = new FormData()
      formData.append('files', file)

      const extractResponse = await fetch('/api/labelmaker/agents/extract-simple', {
        method: 'POST',
        body: formData,
      })

      if (!extractResponse.ok) {
        throw new Error(`Extraction failed: ${extractResponse.statusText}`)
      }

      const extractResult = await extractResponse.json()
      
      if (!extractResult.success) {
        throw new Error(`Agent Builder extraction failed: ${extractResult.error}`)
      }

      setUploadProgress(75)
      updateMessage(assistantMessageId, {
        content: '💾 Injecting data into database...',
        metadata: { extractionStatus: 'processing' }
      })

      // Inject data into database
      const injectResponse = await fetch('/api/labelmaker/agents/inject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(extractResult.data)
      })

      if (!injectResponse.ok) {
        throw new Error(`Database injection failed: ${injectResponse.statusText}`)
      }

      const injectResult = await injectResponse.json()
      
      if (!injectResult.success) {
        throw new Error(`Database injection failed: ${injectResult.error}`)
      }

      const result = injectResult.data.extractionData
      const runId = injectResult.data.runId
      const updatesPerformed = injectResult.data.updatesPerformed
      const productId = injectResult.data.productId

      setUploadProgress(100)

      // Format the result message
      const resultMessage = formatExtractionResult(result)
      
      updateMessage(assistantMessageId, {
        content: resultMessage,
        metadata: { 
          extractionStatus: 'complete',
          extractedData: result,
          confidence: result.metadata.extraction_confidence,
          runId: runId,
          updatesPerformed: updatesPerformed,
          productId: productId
        }
      })

      // Add follow-up message with actions
      if (result.recommended_actions.length > 0) {
        setTimeout(() => {
          addMessage('assistant', 
            '📋 **Recommended Actions:**\n\n' + 
            result.recommended_actions.map((action, i) => `${i + 1}. ${action}`).join('\n'),
            { extractionStatus: 'complete' }
          )
        }, 500)
      }

    } catch (error) {
      console.error('PDF processing error:', error)
      updateMessage(assistantMessageId, {
        content: `❌ Error processing PDF: ${error instanceof Error ? error.message : 'Unknown error'}`,
        metadata: { extractionStatus: 'error' }
      })
    } finally {
      setIsLoading(false)
      setUploadProgress(0)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const formatExtractionResult = (result: ExtractionResult): string => {
    const { metadata, product_match, extracted_data, extraction_notes } = result

    let message = `✅ **Extraction Complete!**\n\n`
    
    // Document info
    message += `📄 **Document Type:** ${metadata.document_type}\n`
    message += `📦 **Product:** ${metadata.product_name_extracted}\n`
    message += `🎯 **Confidence:** ${metadata.extraction_confidence.toUpperCase()}\n`
    message += `📊 **Quality:** ${metadata.document_quality}\n\n`

    // Product match
    message += `🔍 **Database Match:**\n`
    if (product_match.existing_product_id) {
      message += `   ✓ Found existing product (${product_match.match_confidence} confidence)\n`
      message += `   → Action: ${product_match.action_required}\n\n`
    } else {
      message += `   ℹ️ No existing product found\n`
      message += `   → Action: ${product_match.action_required}\n\n`
    }

    // Key extracted fields
    const product = extracted_data.product
    message += `📝 **Key Data Extracted:**\n`
    if (product.signal_word) message += `   • Signal Word: ${product.signal_word}\n`
    if (product.hazard_statements) message += `   • Hazard Statements: Present ✓\n`
    if (product.un_number) message += `   • UN Number: ${product.un_number}\n`
    if (extracted_data.pictograms.length > 0) {
      message += `   • Pictograms: ${extracted_data.pictograms.length} identified\n`
    }
    message += `\n`

    // Quality indicators
    if (extraction_notes.high_confidence_fields.length > 0) {
      message += `✨ **High Confidence Fields:** ${extraction_notes.high_confidence_fields.slice(0, 5).join(', ')}`
      if (extraction_notes.high_confidence_fields.length > 5) {
        message += ` (+${extraction_notes.high_confidence_fields.length - 5} more)`
      }
      message += `\n\n`
    }

    // Warnings
    if (metadata.flags.needs_manual_review) {
      message += `⚠️ **Manual review recommended**\n`
    }
    if (metadata.flags.has_ambiguities) {
      message += `⚠️ **Some ambiguities detected**\n`
    }
    if (metadata.flags.missing_critical_data) {
      message += `⚠️ **Missing critical data**\n`
    }

    return message
  }

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    addMessage('user', userMessage)

    // Simple text-based assistant response
    addMessage('assistant', 
      'I can help you with PDF extraction. Please upload a TDS or SDS PDF file using the upload button, and I\'ll extract the product data for you.'
    )
  }

  return (
    <>
      {/* Floating Action Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-50 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
        size="icon"
      >
        <Database className="h-6 w-6" />
      </Button>

      {/* Chat Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[600px] h-[700px] flex flex-col p-0">
          <DialogHeader className="p-4 pb-3 border-b bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center">
                  <Database className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold">PDF Data Extractor</div>
                  <div className="text-xs text-muted-foreground font-normal">
                    TDS & SDS Processing
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>

          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : message.role === 'system'
                        ? 'bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800'
                        : 'bg-muted'
                    }`}
                  >
                    {/* Status badge for extraction messages */}
                    {message.metadata?.extractionStatus && (
                      <div className="mb-2">
                        <Badge 
                          variant={
                            message.metadata.extractionStatus === 'complete' ? 'default' :
                            message.metadata.extractionStatus === 'error' ? 'destructive' :
                            'secondary'
                          }
                          className="text-xs"
                        >
                          {message.metadata.extractionStatus === 'uploading' && <Upload className="h-3 w-3 mr-1" />}
                          {message.metadata.extractionStatus === 'processing' && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                          {message.metadata.extractionStatus === 'complete' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                          {message.metadata.extractionStatus === 'error' && <AlertCircle className="h-3 w-3 mr-1" />}
                          {message.metadata.extractionStatus}
                        </Badge>
                      </div>
                    )}

                    {/* File info for user uploads */}
                    {message.metadata?.fileName && (
                      <div className="flex items-center gap-2 mb-2 text-sm opacity-90">
                        <FileText className="h-4 w-4" />
                        <span className="font-medium">{message.metadata.fileName}</span>
                        {message.metadata.fileSize && (
                          <span className="text-xs opacity-75">
                            ({(message.metadata.fileSize / 1024).toFixed(0)} KB)
                          </span>
                        )}
                      </div>
                    )}

                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                      {message.content}
                    </p>

                    {/* Confidence indicator */}
                    {message.metadata?.confidence && (
                      <div className="mt-2 pt-2 border-t border-white/10">
                        <div className="text-xs opacity-75">
                          Confidence: <span className="font-semibold">{message.metadata.confidence.toUpperCase()}</span>
                        </div>
                      </div>
                    )}

                    {/* Preview button for completed extractions */}
                    {message.metadata?.runId && message.metadata?.extractionStatus === 'complete' && (
                      <div className="mt-2 pt-2 border-t border-white/10">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleShowPreview(message.metadata!.runId!)}
                          className="text-xs h-6 px-2 bg-white/10 hover:bg-white/20 border-white/20"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Preview & Diff
                        </Button>
                      </div>
                    )}

                    <p className="text-xs opacity-70 mt-2">
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Upload Progress */}
          {uploadProgress > 0 && (
            <div className="px-4 pb-2">
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 border-t bg-gray-50 dark:bg-neutral-900">
            {/* Upload Button */}
            <div className="mb-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isLoading}
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="w-full"
                variant="outline"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload TDS/SDS PDF
                  </>
                )}
              </Button>
            </div>

            {/* Text Input */}
            <form onSubmit={handleTextSubmit} className="flex space-x-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me about the extraction process..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading || !input.trim()} size="icon">
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
            
            <div className="mt-2 text-xs text-muted-foreground text-center">
              Max file size: 10MB • Supported: PDF only
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview & Diff Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="sm:max-w-[1200px] h-[800px] flex flex-col p-0">
          <DialogHeader className="p-4 pb-3 border-b bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950">
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-green-600 flex items-center justify-center">
                  <GitCompare className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold">Extraction Preview & Diff</div>
                  <div className="text-xs text-muted-foreground font-normal">
                    {extractionRun?.product_candidate || 'Unknown Product'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {extractionRun && (
                  <Badge 
                    variant={
                      extractionRun.status === 'updated' ? 'default' :
                      extractionRun.status === 'skipped' ? 'secondary' :
                      extractionRun.status === 'failed' ? 'destructive' :
                      'outline'
                    }
                  >
                    {extractionRun.status}
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPreview(false)}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 p-4 overflow-hidden">
            {extractionRun ? (
              <Tabs defaultValue="overview" className="h-full flex flex-col">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="diff">Field Diff</TabsTrigger>
                  <TabsTrigger value="raw">Raw Data</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="flex-1 overflow-auto">
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Extraction Summary</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Document Type:</span> {extractionRun.document_type}
                          </div>
                          <div>
                            <span className="font-medium">Confidence:</span> 
                            <Badge variant="outline" className="ml-2">{extractionRun.confidence}</Badge>
                          </div>
                          <div>
                            <span className="font-medium">Product Match:</span> 
                            {extractionRun.product_id ? 'Found' : 'Not Found'}
                          </div>
                          <div>
                            <span className="font-medium">Manual Review:</span> 
                            {extractionRun.needs_manual_review ? 'Required' : 'Not Required'}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {extractionRun.audit_log && extractionRun.audit_log.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Field Changes</CardTitle>
                          <div className="flex gap-2 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Badge variant="outline" className="border-blue-200 text-blue-700">TDS</Badge>
                              <span>Technical Data Sheet fields</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Badge variant="outline" className="border-red-200 text-red-700">SDS</Badge>
                              <span>Safety Data Sheet fields</span>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {extractionRun.audit_log.map((entry) => {
                              const fieldOwner = getFieldOwner(entry.field)
                              return (
                                <div key={entry.id} className="flex items-center justify-between p-2 border rounded">
                                  <div className="flex-1">
                                    <span className="font-medium">{entry.field}</span>
                                    <Badge 
                                      variant={entry.action === 'write' ? 'default' : 'secondary'}
                                      className="ml-2"
                                    >
                                      {entry.action}
                                    </Badge>
                                    {fieldOwner && (
                                      <Badge 
                                        variant="outline"
                                        className={`ml-2 ${
                                          fieldOwner === 'TDS' ? 'border-blue-200 text-blue-700' : 
                                          fieldOwner === 'SDS' ? 'border-red-200 text-red-700' : ''
                                        }`}
                                      >
                                        {fieldOwner}
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {entry.reason}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="diff" className="flex-1 overflow-auto">
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Current Database</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {currentProduct ? (
                          <div className="space-y-2 text-sm">
                            <div><span className="font-medium">Name:</span> {currentProduct.name}</div>
                            <div><span className="font-medium">Description:</span> {currentProduct.description || 'N/A'}</div>
                            <div><span className="font-medium">Application:</span> {currentProduct.application || 'N/A'}</div>
                            <div><span className="font-medium">Features:</span> {currentProduct.features || 'N/A'}</div>
                            <div><span className="font-medium">Coverage:</span> {currentProduct.coverage || 'N/A'}</div>
                            <div><span className="font-medium">Limitations:</span> {currentProduct.limitations || 'N/A'}</div>
                            <div><span className="font-medium">Shelf Life:</span> {currentProduct.shelf_life || 'N/A'}</div>
                          </div>
                        ) : (
                          <div className="text-muted-foreground">No product match found</div>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Extracted Data</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {extractionRun.extracted_json?.extracted_data?.product ? (
                          <div className="space-y-2 text-sm">
                            <div><span className="font-medium">Name:</span> {extractionRun.extracted_json.extracted_data.product.name || 'N/A'}</div>
                            <div><span className="font-medium">Description:</span> {extractionRun.extracted_json.extracted_data.product.description || 'N/A'}</div>
                            <div><span className="font-medium">Application:</span> {extractionRun.extracted_json.extracted_data.product.application || 'N/A'}</div>
                            <div><span className="font-medium">Features:</span> {extractionRun.extracted_json.extracted_data.product.features || 'N/A'}</div>
                            <div><span className="font-medium">Coverage:</span> {extractionRun.extracted_json.extracted_data.product.coverage || 'N/A'}</div>
                            <div><span className="font-medium">Limitations:</span> {extractionRun.extracted_json.extracted_data.product.limitations || 'N/A'}</div>
                            <div><span className="font-medium">Shelf Life:</span> {extractionRun.extracted_json.extracted_data.product.shelf_life || 'N/A'}</div>
                          </div>
                        ) : (
                          <div className="text-muted-foreground">No extracted data available</div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="raw" className="flex-1 overflow-auto">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Raw Extraction Data</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="text-xs bg-muted p-4 rounded overflow-auto max-h-96">
                        {JSON.stringify(extractionRun.extracted_json, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p>Loading extraction data...</p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}


