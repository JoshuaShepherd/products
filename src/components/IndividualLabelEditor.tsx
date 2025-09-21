'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  AlertTriangle, 
  Save, 
  RotateCcw, 
  Eye, 
  EyeOff,
  FileEdit,
  FileText,
  Clock
} from 'lucide-react';
import { useIndividualLabelEditor } from '@/hooks/use-individual-label-editor';
import { cn } from '@/lib/utils';

interface IndividualLabelEditorProps {
  productId: number;
  productName: string;
  className?: string;
}

export function IndividualLabelEditor({ 
  productId, 
  productName, 
  className 
}: IndividualLabelEditorProps) {
  const {
    currentSize,
    cssContent,
    hasIndividualEdit,
    loading,
    hasChanges,
    setCurrentSize,
    setCssContent,
    saveIndividualEdit,
    revertToTemplate,
  } = useIndividualLabelEditor(productId);

  const [showPreview, setShowPreview] = useState(true);
  const [autoSave, setAutoSave] = useState(false);
  const [saving, setSaving] = useState(false);
  const previewRef = useRef<HTMLIFrameElement>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-save functionality
  useEffect(() => {
    if (autoSave && hasChanges && !saving) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      
      autoSaveTimeoutRef.current = setTimeout(() => {
        handleSave();
      }, 2000); // Auto-save after 2 seconds of no changes
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [autoSave, hasChanges, cssContent, saving]);

  // Update preview when CSS changes
  useEffect(() => {
    updatePreview();
  }, [cssContent, currentSize, showPreview]);

  const handleSave = async () => {
    setSaving(true);
    console.log('Saving individual edit for product:', productId, 'size:', currentSize);
    const result = await saveIndividualEdit();
    setSaving(false);
    
    if (result.success) {
      console.log('Label saved successfully');
      // Could add toast notification here
    } else {
      console.error('Failed to save label:', result.error);
      alert(`Failed to save: ${JSON.stringify(result.error) || 'Unknown error'}`);
    }
  };

  const handleRevert = async () => {
    if (window.confirm('Revert to template? This will delete your individual edits.')) {
      await revertToTemplate();
    }
  };

  const updatePreview = () => {
    if (!showPreview || !previewRef.current) return;

    const iframe = previewRef.current;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    
    if (!doc) return;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { 
            margin: 0; 
            padding: 20px; 
            background: #f5f5f5;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
          }
          ${cssContent}
        </style>
      </head>
      <body>
        <div class="label-container">
          <div class="product-name">${productName}</div>
          <div class="product-content">
            <p>Sample label content for preview</p>
            <p>Size: ${currentSize}</p>
            ${hasIndividualEdit ? '<p><em>Individual Edit Active</em></p>' : '<p><em>Using Template</em></p>'}
          </div>
        </div>
      </body>
      </html>
    `;

    doc.open();
    doc.write(html);
    doc.close();
  };

  return (
    <div className={cn("h-screen flex flex-col", className)}>
      {/* Header */}
      <div className="border-b p-4 flex justify-between items-center bg-background">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FileEdit className="h-6 w-6" />
              Individual Label Editor
            </h1>
            <p className="text-muted-foreground">{productName} (ID: {productId})</p>
          </div>
          
          <Badge 
            variant={hasIndividualEdit ? 'destructive' : 'secondary'}
            className="flex items-center gap-1"
          >
            {hasIndividualEdit ? (
              <>
                <FileEdit className="h-3 w-3" />
                Individual Edit
              </>
            ) : (
              <>
                <FileText className="h-3 w-3" />
                Using Template
              </>
            )}
          </Badge>

          {loading && (
            <Badge variant="outline" className="animate-pulse">
              Loading...
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          {/* Size Selector */}
          <div className="flex gap-2">
            {(['14x7', '5x9'] as const).map((size) => (
              <Button
                key={size}
                variant={currentSize === size ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentSize(size)}
                disabled={loading}
              >
                {size}
              </Button>
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <Label htmlFor="auto-save" className="text-sm">Auto-save</Label>
            <Switch
              id="auto-save"
              checked={autoSave}
              onCheckedChange={setAutoSave}
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showPreview ? 'Hide' : 'Show'} Preview
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* CSS Editor */}
        <div className={cn(
          "border-r flex flex-col bg-background",
          showPreview ? "w-1/2" : "w-full"
        )}>
          {/* Editor Toolbar */}
          <div className="border-b p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">CSS Editor</h3>
              {hasChanges && (
                <Badge variant="outline" className="text-yellow-600">
                  <Clock className="h-3 w-3 mr-1" />
                  Unsaved Changes
                </Badge>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={!hasChanges || loading || saving}
                size="sm"
                className="flex items-center gap-1"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save'}
              </Button>
              
              {hasIndividualEdit && (
                <Button
                  onClick={handleRevert}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <RotateCcw className="h-4 w-4" />
                  Revert to Template
                </Button>
              )}
            </div>
          </div>
          
          {/* CSS Textarea */}
          <div className="flex-1 p-4">
            <Textarea
              value={cssContent}
              onChange={(e) => setCssContent(e.target.value)}
              className="h-full font-mono text-sm resize-none"
              placeholder="Enter CSS styles for your label..."
              disabled={loading}
            />
          </div>

          {/* Status Bar */}
          <div className="border-t p-2 bg-muted/50 text-xs text-muted-foreground flex justify-between">
            <span>Size: {currentSize}</span>
            <span>
              {hasIndividualEdit ? 'Individual edit active' : 'Using default template'}
            </span>
          </div>
        </div>

        {/* Preview Panel */}
        {showPreview && (
          <div className="w-1/2 p-4 bg-muted/30">
            <Card className="h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Live Preview - {currentSize}
                </CardTitle>
              </CardHeader>
              <CardContent className="h-full p-4">
                <div className="h-full border border-border rounded-lg overflow-hidden bg-white">
                  <iframe
                    ref={previewRef}
                    className="w-full h-full"
                    style={{
                      aspectRatio: currentSize === '14x7' ? '14/7' : '5/9',
                      minHeight: '200px'
                    }}
                    title={`Label Preview - ${currentSize}`}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Warning for unsaved changes */}
      {hasChanges && !autoSave && (
        <div className="border-t bg-yellow-50 border-yellow-200 p-3">
          <div className="flex items-center gap-2 text-yellow-800">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm">You have unsaved changes. Don't forget to save!</span>
          </div>
        </div>
      )}
    </div>
  );
}
