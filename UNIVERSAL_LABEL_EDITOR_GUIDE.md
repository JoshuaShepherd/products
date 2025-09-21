# Universal Label Editor with Real-Time Preview Guide

## Overview

This guide outlines how to build a sophisticated label editor that provides real-time HTML/CSS editing with live preview functionality. The editor allows users to modify label templates for both 14x7 and 5x9 formats, see changes instantly, and save updates directly to the `label_templates` database table.

## Architecture Overview

### System Components

1. **Label Template Editor Page** - Main editing interface
2. **Monaco Editor Integration** - Professional code editing experience
3. **Live Preview System** - Real-time template rendering
4. **Template Management API** - CRUD operations for templates
5. **Database Integration** - Direct updates to `label_templates` table

### Data Flow
```
Database (label_templates) → Load Template → Monaco Editor → Live Preview → Save Changes → Database Update
```

## Database Schema Reference

The editor works with the existing `label_templates` table:

```sql
create table public.label_templates (
  id uuid not null default extensions.uuid_generate_v4 (),
  name text not null,
  slug text not null,
  description text null,
  width_mm numeric(6, 2) null,
  height_mm numeric(6, 2) null,
  html_template text not null,
  css_template text not null,
  is_active boolean null default true,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  updated_at timestamp with time zone null default CURRENT_TIMESTAMP,
  constraint label_templates_pkey primary key (id),
  constraint label_templates_slug_key unique (slug)
) TABLESPACE pg_default;
```

## Implementation Guide

### Step 1: Create API Routes for Template Management

#### `/src/app/api/label-templates/route.ts` - List Templates

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: templates, error } = await supabase
      .from('label_templates')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

#### `/src/app/api/label-templates/[id]/route.ts` - Get/Update Template

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    
    const { data: template, error } = await supabase
      .from('label_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    return NextResponse.json(template);
  } catch (error) {
    console.error('Error fetching template:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { html_template, css_template, name, description } = body;

    const supabase = await createClient();
    
    const { data: template, error } = await supabase
      .from('label_templates')
      .update({
        html_template,
        css_template,
        name,
        description,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(template);
  } catch (error) {
    console.error('Error updating template:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

#### `/src/app/api/label-templates/preview/route.ts` - Live Preview

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { html_template, css_template, sample_data } = await request.json();
    
    // Process template with sample data (similar to existing label generation)
    let processedHTML = html_template;
    
    // Replace template variables with sample data
    if (sample_data) {
      Object.keys(sample_data).forEach(key => {
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        processedHTML = processedHTML.replace(regex, sample_data[key] || '');
      });
    }

    // Create complete HTML document
    const completeHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Label Preview</title>
          <style>
            ${css_template}
            
            /* Preview-specific styles */
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 10px;
              background: #f5f5f5;
            }
            
            .preview-container {
              background: white;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
              max-width: 100%;
              overflow: auto;
            }
          </style>
        </head>
        <body>
          <div class="preview-container">
            ${processedHTML}
          </div>
        </body>
      </html>
    `;

    return new NextResponse(completeHTML, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error('Preview generation error:', error);
    return NextResponse.json({ error: 'Preview generation failed' }, { status: 500 });
  }
}
```

### Step 2: Create the Label Editor Component

#### `/src/components/LabelEditor.tsx`

```typescript
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
import { Save, RefreshCw, Eye, Code, Palette } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

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
  // Add more sample fields as needed
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
  const { toast } = useToast();

  // Sample data for preview
  const [sampleData] = useState<SampleData>({
    product_name: 'Sample Product Name',
    description: 'This is a sample product description for preview purposes.',
    features: 'Sample features include durability, reliability, and effectiveness.',
    signal_word: 'WARNING',
    hazard_statements: 'May cause eye irritation. Keep out of reach of children.',
    proper_shipping_name: 'Sample Shipping Name',
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

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/label-templates');
      if (!response.ok) throw new Error('Failed to load templates');
      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast({
        title: "Error",
        description: "Failed to load templates",
        variant: "destructive",
      });
    }
  };

  const loadTemplate = async (templateId: string) => {
    if (!templateId) return;
    
    setLoading(true);
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
      toast({
        title: "Error",
        description: "Failed to load template",
        variant: "destructive",
      });
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

      toast({
        title: "Success",
        description: "Template saved successfully",
      });
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: "Error",
        description: "Failed to save template",
        variant: "destructive",
      });
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
              disabled={saving || !currentTemplate}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Template'}
            </Button>
          </div>
        </div>
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
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Step 3: Create the Editor Page

#### `/src/app/label-editor/page.tsx`

```typescript
import { LabelEditor } from '@/components/LabelEditor';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Label Editor | SpecChem',
  description: 'Edit label templates with live preview',
};

export default function LabelEditorPage() {
  return <LabelEditor />;
}
```

### Step 4: Advanced Features

#### Template Variable Helper Component

```typescript
const TemplateVariableHelper = () => {
  const variables = [
    { name: 'product_name', description: 'Product name' },
    { name: 'description', description: 'Product description' },
    { name: 'features', description: 'Product features' },
    { name: 'signal_word', description: 'Safety signal word' },
    { name: 'hazard_statements', description: 'Hazard information' },
    { name: 'proper_shipping_name', description: 'Shipping name' },
    // Add more variables as needed
  ];

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-sm">Available Variables</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-2 text-xs">
          {variables.map((variable) => (
            <div key={variable.name} className="flex flex-col">
              <code className="bg-gray-100 px-1 rounded">{`{{${variable.name}}}`}</code>
              <span className="text-gray-600 text-xs">{variable.description}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
```

#### Conditional Logic Helper

```typescript
const ConditionalHelper = () => (
  <Card className="mt-4">
    <CardHeader>
      <CardTitle className="text-sm">Conditional Sections</CardTitle>
    </CardHeader>
    <CardContent className="pt-0">
      <div className="text-xs space-y-2">
        <div>
          <code className="bg-gray-100 px-1 rounded block">
            {`{{#if variable_name}}`}<br/>
            {`  Content to show if variable exists`}<br/>
            {`{{/if}}`}
          </code>
        </div>
        <p className="text-gray-600">
          Use conditional blocks to show/hide content based on data availability.
        </p>
      </div>
    </CardContent>
  </Card>
);
```

### Step 5: Enhanced Preview with Real Product Data

#### Add Product Selector for Preview

```typescript
const [previewProduct, setPreviewProduct] = useState<string>('');
const [products, setProducts] = useState<any[]>([]);

// Load products for preview
useEffect(() => {
  const loadProducts = async () => {
    try {
      const response = await fetch('/api/products?limit=10');
      const data = await response.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };
  loadProducts();
}, []);

// Update preview with real product data
const updatePreviewWithProduct = async (productName: string) => {
  if (!productName || !htmlCode) return;

  try {
    const response = await fetch(`/api/label/${encodeURIComponent(productName)}`);
    if (response.ok) {
      const html = await response.text();
      setPreviewHtml(html);
    }
  } catch (error) {
    console.error('Product preview error:', error);
  }
};
```

### Step 6: Keyboard Shortcuts and UX Improvements

#### Add Keyboard Shortcuts

```typescript
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
}, [saveTemplate, updatePreview]);
```

#### Auto-save functionality

```typescript
const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

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

// Auto-save every 30 seconds if there are changes
useEffect(() => {
  if (!hasUnsavedChanges) return;

  const autoSaveTimer = setTimeout(() => {
    saveTemplate();
  }, 30000);

  return () => clearTimeout(autoSaveTimer);
}, [hasUnsavedChanges, saveTemplate]);
```

## Usage Guide

### Getting Started

1. **Access the Editor**: Navigate to `/label-editor`
2. **Select Template**: Choose between "14x7 Enhanced Large Format" or "5x9 Compact Format"
3. **Edit Code**: Switch between HTML and CSS tabs to modify templates
4. **Live Preview**: See changes instantly in the right panel
5. **Save Changes**: Click "Save Template" or use Ctrl/Cmd+S

### Best Practices

1. **Template Variables**: Use `{{variable_name}}` syntax for dynamic content
2. **Conditional Logic**: Implement `{{#if condition}}...{{/if}}` for optional sections
3. **CSS Organization**: Keep styles modular and well-commented
4. **Preview Testing**: Test with different product data to ensure compatibility
5. **Version Control**: Template updates are automatically timestamped

### Advanced Features

- **Real-time Preview**: Changes appear instantly without manual refresh
- **Syntax Highlighting**: Full Monaco Editor with IntelliSense
- **Auto-save**: Changes saved automatically every 30 seconds
- **Keyboard Shortcuts**: Ctrl/Cmd+S to save, Ctrl/Cmd+R to refresh preview
- **Template Validation**: Automatic syntax checking and error reporting

## Deployment Considerations

### Database Permissions
Ensure the application has appropriate permissions to update the `label_templates` table:

```sql
GRANT SELECT, UPDATE ON label_templates TO your_app_user;
```

### Performance Optimization
- Implement debounced preview updates (500ms delay)
- Cache frequently accessed templates
- Use Monaco Editor's built-in optimization features
- Limit preview iframe size for better performance

### Security Measures
- Validate all template updates server-side
- Sanitize HTML input to prevent XSS attacks
- Implement proper authentication for editor access
- Add audit logging for template changes

This comprehensive label editor provides a professional development experience for managing label templates while maintaining the existing template system's compatibility and functionality.