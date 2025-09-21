"use client";

import { useState, useEffect, useCallback } from 'react';
import { Editor } from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, RefreshCw, Eye, Code, Palette, Home } from 'lucide-react';
import Link from 'next/link';

interface LabelTemplate {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  width_mm: number | null;
  height_mm: number | null;
  html_template: string;
  css_template: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface SampleData {
  product_name: string;
  description: string;
  features: string;
  signal_word: string;
  hazard_statements: string;
  proper_shipping_name: string;
  application: string;
  limitations: string;
  shelf_life: string;
  coverage: string;
  voc_data: string;
  first_aid: string;
  storage: string;
  disposal: string;
}

export function LabelEditor() {
  const [templates, setTemplates] = useState<LabelTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [currentTemplate, setCurrentTemplate] = useState<LabelTemplate | null>(null);
  const [htmlCode, setHtmlCode] = useState('');
  const [cssCode, setCssCode] = useState('');
  const [previewHtml, setPreviewHtml] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Sample data for preview
  const [sampleData] = useState<SampleData>({
    product_name: 'Sample Product Name',
    description: 'This is a sample product description for preview purposes. It demonstrates how the description field will appear in the final label.',
    features: 'Sample features include durability, reliability, and effectiveness. Easy to apply and long-lasting performance.',
    signal_word: 'WARNING',
    hazard_statements: 'May cause eye irritation. Keep out of reach of children.',
    proper_shipping_name: 'Sample Shipping Name',
    application: 'Apply to clean, dry surfaces at temperatures between 50-90°F.',
    limitations: 'Do not apply in wet conditions or temperatures below 32°F.',
    shelf_life: '2 years from date of manufacture when stored properly',
    coverage: 'Approximately 300-400 sq ft per gallon',
    voc_data: 'Less than 50 g/L',
    first_aid: 'If in eyes, rinse with water for 15 minutes and seek medical attention.',
    storage: 'Store in cool, dry place away from direct sunlight.',
    disposal: 'Dispose of in accordance with local regulations.',
  });

  // Load templates on mount
  useEffect(() => {
    loadTemplates();
  }, []);

  // Update preview when code changes
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      updatePreview();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [htmlCode, cssCode]);

  // Check for unsaved changes
  useEffect(() => {
    if (currentTemplate) {
      const hasChanges = 
        htmlCode !== currentTemplate.html_template ||
        cssCode !== currentTemplate.css_template ||
        templateName !== currentTemplate.name ||
        templateDescription !== (currentTemplate.description || '');
      
      setHasUnsavedChanges(hasChanges);
    }
  }, [htmlCode, cssCode, templateName, templateDescription, currentTemplate]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 's':
            e.preventDefault();
            saveTemplate();
            break;
          case 'r':
            e.preventDefault();
            updatePreview();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setError(type === 'error' ? message : null);
    if (type === 'success') {
      // You can implement a toast notification system here
      console.log('Success:', message);
    }
  };

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/label-templates');
      if (!response.ok) throw new Error('Failed to load templates');
      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      console.error('Error loading templates:', error);
      showToast('Failed to load templates', 'error');
    }
  };

  const loadTemplate = async (templateId: string) => {
    if (!templateId) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/label-templates/${templateId}`);
      if (!response.ok) throw new Error('Failed to load template');
      
      const template = await response.json();
      setCurrentTemplate(template);
      setHtmlCode(template.html_template);
      setCssCode(template.css_template);
      setTemplateName(template.name);
      setTemplateDescription(template.description || '');
    } catch (error) {
      console.error('Error loading template:', error);
      showToast('Failed to load template', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updatePreview = async () => {
    if (!htmlCode && !cssCode) return;

    try {
      const response = await fetch('/api/label-templates/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          html_template: htmlCode,
          css_template: cssCode,
          sample_data: sampleData,
        }),
      });

      if (response.ok) {
        const html = await response.text();
        setPreviewHtml(html);
      }
    } catch (error) {
      console.error('Preview update error:', error);
    }
  };

  const saveTemplate = async () => {
    if (!currentTemplate) return;

    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/label-templates/${currentTemplate.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          html_template: htmlCode,
          css_template: cssCode,
          name: templateName,
          description: templateDescription,
        }),
      });

      if (!response.ok) throw new Error('Failed to save template');

      const updatedTemplate = await response.json();
      setCurrentTemplate(updatedTemplate);
      
      // Update templates list
      setTemplates(prev => 
        prev.map(t => t.id === updatedTemplate.id ? updatedTemplate : t)
      );

      showToast('Template saved successfully');
    } catch (error) {
      console.error('Error saving template:', error);
      showToast('Failed to save template', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId);
    loadTemplate(templateId);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="border-b bg-white dark:bg-gray-800 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
              <Home className="h-5 w-5" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
            <h1 className="text-xl font-semibold">Label Editor</h1>
            <Select value={selectedTemplateId} onValueChange={handleTemplateSelect}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasUnsavedChanges && (
              <span className="text-sm text-amber-600 font-medium">Unsaved changes</span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={updatePreview}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Preview
            </Button>
            <Button
              onClick={saveTemplate}
              disabled={saving || !currentTemplate || !hasUnsavedChanges}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Template'}
            </Button>
          </div>
        </div>
        
        {error && (
          <div className="mt-2 p-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Editor */}
        <div className="w-1/2 border-r bg-white dark:bg-gray-800 flex flex-col">
          {/* Template Info */}
          {currentTemplate && (
            <div className="p-4 border-b space-y-4">
              <div>
                <Label htmlFor="template-name">Template Name</Label>
                <Input
                  id="template-name"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Template name"
                />
              </div>
              <div>
                <Label htmlFor="template-description">Description</Label>
                <Textarea
                  id="template-description"
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  placeholder="Template description"
                  rows={2}
                />
              </div>
              <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
                <span>Size: {currentTemplate.width_mm}×{currentTemplate.height_mm}mm</span>
                <span>Last updated: {new Date(currentTemplate.updated_at).toLocaleDateString()}</span>
              </div>
            </div>
          )}

          {/* Code Editor */}
          <div className="flex-1 flex flex-col">
            <Tabs defaultValue="html" className="flex-1 flex flex-col">
              <TabsList className="grid w-full grid-cols-2 m-4 mb-0">
                <TabsTrigger value="html" className="flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  HTML Template
                </TabsTrigger>
                <TabsTrigger value="css" className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  CSS Styles
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="html" className="flex-1 m-4 mt-2">
                <div className="h-full border rounded-lg overflow-hidden">
                  <Editor
                    height="100%"
                    defaultLanguage="html"
                    value={htmlCode}
                    onChange={(value) => setHtmlCode(value || '')}
                    theme="vs-dark"
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      lineNumbers: 'on',
                      automaticLayout: true,
                      wordWrap: 'on',
                      formatOnPaste: true,
                      formatOnType: true,
                      tabSize: 2,
                    }}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="css" className="flex-1 m-4 mt-2">
                <div className="h-full border rounded-lg overflow-hidden">
                  <Editor
                    height="100%"
                    defaultLanguage="css"
                    value={cssCode}
                    onChange={(value) => setCssCode(value || '')}
                    theme="vs-dark"
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      lineNumbers: 'on',
                      automaticLayout: true,
                      wordWrap: 'on',
                      formatOnPaste: true,
                      formatOnType: true,
                      tabSize: 2,
                    }}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Right Panel - Live Preview */}
        <div className="w-1/2 bg-gray-50 dark:bg-gray-900 flex flex-col">
          <div className="p-4 border-b bg-white dark:bg-gray-800">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              <h2 className="font-semibold">Live Preview</h2>
              <span className="text-sm text-gray-500">Updates automatically</span>
            </div>
          </div>
          
          <div className="flex-1 p-4 overflow-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                  <p>Loading template...</p>
                </div>
              </div>
            ) : previewHtml ? (
              <div className="bg-white rounded-lg shadow-sm border h-full">
                <iframe
                  srcDoc={previewHtml}
                  className="w-full h-full border-0 rounded-lg"
                  title="Label Preview"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a template to start editing</p>
                  <p className="text-sm mt-2">Use Ctrl+S to save, Ctrl+R to refresh preview</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Variable Helper */}
      {currentTemplate && (
        <div className="border-t bg-white dark:bg-gray-800 p-4">
          <div className="text-sm">
            <h3 className="font-medium mb-2">Available Template Variables:</h3>
            <div className="grid grid-cols-4 gap-4 text-xs text-gray-600 dark:text-gray-400">
              <code>{'{{product_name}}'}</code>
              <code>{'{{description}}'}</code>
              <code>{'{{features}}'}</code>
              <code>{'{{signal_word}}'}</code>
              <code>{'{{hazard_statements}}'}</code>
              <code>{'{{application}}'}</code>
              <code>{'{{limitations}}'}</code>
              <code>{'{{shelf_life}}'}</code>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Use conditional blocks: <code>{'{{#if variable_name}}'}...content...{'{{/if}}'}</code>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}