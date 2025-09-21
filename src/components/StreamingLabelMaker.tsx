'use client'

import { useState, useRef } from 'react'
import { Upload, FileText, Loader2, CheckCircle, AlertCircle, X, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useStreaming } from '@/lib/streaming'

interface StreamingLabelMakerProps {
  onExtractComplete?: (extractionResult: any) => void
}

export function StreamingLabelMaker({ onExtractComplete }: StreamingLabelMakerProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [extractionResult, setExtractionResult] = useState<any>(null)
  const [streamLog, setStreamLog] = useState<string[]>([])
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const { isStreaming, streamContent, error, startStreaming } = useStreaming()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const pdfFiles = files.filter(file => file.type === 'application/pdf')
    
    if (pdfFiles.length !== files.length) {
      alert('Only PDF files are allowed')
      return
    }
    
    if (pdfFiles.some(file => file.size > 10 * 1024 * 1024)) {
      alert('File size must be under 10MB')
      return
    }
    
    setSelectedFiles(pdfFiles)
  }

  const removeFile = (index: number) => {
    setSelectedFiles(files => files.filter((_, i) => i !== index))
  }

  const clearFiles = () => {
    setSelectedFiles([])
    setExtractionResult(null)
    setStreamLog([])
    setProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const startExtraction = async () => {
    if (selectedFiles.length === 0) return

    setStreamLog([])
    setProgress(0)
    setExtractionResult(null)

    const formData = new FormData()
    selectedFiles.forEach(file => {
      formData.append('files', file)
    })
    formData.append('stream', 'true')

    try {
      // Using Server-Sent Events for streaming
      const response = await fetch('/api/labelmaker/extract/stream', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('No response body reader available')
      }

      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const event = JSON.parse(line.slice(6))
              
              if (event.type === 'start') {
                setStreamLog(prev => [...prev, '🚀 Starting extraction...'])
                setProgress(10)
              } else if (event.type === 'chunk') {
                if (event.data) {
                  setStreamLog(prev => [...prev, `📝 ${event.data}`])
                  
                  // Update progress based on stage
                  if (event.metadata?.stage === 'preparation') {
                    setProgress(20)
                  } else if (event.metadata?.stage === 'extraction') {
                    setProgress(40)
                  } else if (event.metadata?.stage === 'streaming') {
                    const contentProgress = Math.min(80, 40 + (event.metadata.contentLength / 10000) * 40)
                    setProgress(contentProgress)
                  } else if (event.metadata?.stage === 'validation') {
                    setProgress(90)
                  }
                }
              } else if (event.type === 'done') {
                setStreamLog(prev => [...prev, '✅ Extraction completed successfully!'])
                setProgress(100)
                setExtractionResult(event.metadata)
                onExtractComplete?.(event.metadata)
              } else if (event.type === 'error') {
                setStreamLog(prev => [...prev, `❌ Error: ${event.error}`])
                throw new Error(event.error || 'Extraction failed')
              }
            } catch (parseError) {
              // Skip malformed JSON lines
            }
          }
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setStreamLog(prev => [...prev, `❌ Error: ${errorMessage}`])
    }
  }

  return (
    <div className="space-y-6">
      {/* File Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            LabelMaker - Streaming PDF Extraction
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* File Input */}
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
                id="pdf-upload"
              />
              <label
                htmlFor="pdf-upload"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <FileText className="h-12 w-12 text-muted-foreground" />
                <p className="text-lg font-medium">Upload TDS/SDS PDFs</p>
                <p className="text-sm text-muted-foreground">
                  Click to select multiple PDF files (max 10MB each)
                </p>
              </label>
            </div>

            {/* Selected Files */}
            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Selected Files ({selectedFiles.length})</h3>
                  <Button variant="outline" size="sm" onClick={clearFiles}>
                    <X className="h-4 w-4 mr-2" />
                    Clear All
                  </Button>
                </div>
                
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span className="font-medium">{file.name}</span>
                      <Badge variant="outline">
                        {(file.size / 1024 / 1024).toFixed(1)} MB
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Extract Button */}
            <Button
              onClick={startExtraction}
              disabled={selectedFiles.length === 0 || isStreaming}
              className="w-full"
              size="lg"
            >
              {isStreaming ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Extracting...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Start Streaming Extraction
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Progress Section */}
      {(isStreaming || extractionResult) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isStreaming ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : extractionResult ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-orange-500" />
              )}
              Extraction Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-muted-foreground">
                {progress}% complete
              </p>
              
              {/* Stream Log */}
              <ScrollArea className="h-32 w-full border rounded-lg p-3">
                <div className="space-y-1">
                  {streamLog.map((log, index) => (
                    <div key={index} className="text-sm font-mono">
                      {log}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Section */}
      {extractionResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Extraction Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">
                    {extractionResult.extraction?.metadata?.fieldsExtracted || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Fields Extracted</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">
                    {extractionResult.extraction?.metadata?.labelFieldsExtracted || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Label Fields</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">
                    {extractionResult.extraction?.validation?.submissionType || 'Unknown'}
                  </div>
                  <div className="text-sm text-muted-foreground">Submission Type</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">
                    {(extractionResult.extraction?.validation?.overallConfidence * 100 || 0).toFixed(0)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Confidence</div>
                </div>
              </div>

              {/* Validation Status */}
              {extractionResult.extraction?.validation && (
                <div className="space-y-2">
                  <h3 className="font-medium">Validation Status</h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={extractionResult.extraction.validation.isValid ? "default" : "destructive"}>
                      {extractionResult.extraction.validation.isValid ? "Valid" : "Invalid"}
                    </Badge>
                    <Badge variant={extractionResult.extraction.validation.requiresReview ? "secondary" : "outline"}>
                      {extractionResult.extraction.validation.requiresReview ? "Requires Review" : "Ready"}
                    </Badge>
                    <Badge variant="outline">
                      {extractionResult.extraction.validation.errors?.length || 0} Errors
                    </Badge>
                    <Badge variant="outline">
                      {extractionResult.extraction.validation.warnings?.length || 0} Warnings
                    </Badge>
                  </div>
                </div>
              )}

              {/* Label Fields Preview */}
              {extractionResult.extraction?.labelFields && (
                <div className="space-y-2">
                  <h3 className="font-medium">Label-Relevant Fields</h3>
                  <ScrollArea className="h-32 w-full border rounded-lg p-3">
                    <div className="space-y-1">
                      {Object.entries(extractionResult.extraction.labelFields).slice(0, 10).map(([key, value]) => (
                        <div key={key} className="text-sm">
                          <span className="font-medium">{key}:</span> {String(value).substring(0, 100)}...
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
