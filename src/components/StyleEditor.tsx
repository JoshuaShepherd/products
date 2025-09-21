// src/components/StyleEditor.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StyleManager, StyleTemplate, CSSVariable } from '@/lib/styleManager';

interface StyleEditorProps {
  templateId?: string;
  productId?: string; // For product-specific overrides
  onSave?: (success: boolean) => void;
}

export function StyleEditor({ templateId, productId, onSave }: StyleEditorProps) {
  const [styleManager] = useState(() => new StyleManager());
  const [template, setTemplate] = useState<StyleTemplate | null>(null);
  const [cssContent, setCssContent] = useState('');
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [cssVariables, setCssVariables] = useState<CSSVariable[]>([]);
  const [previewHtml, setPreviewHtml] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadTemplate();
  }, [templateId]);

  const loadTemplate = async () => {
    try {
      setLoading(true);
      const loadedTemplate = templateId 
        ? await styleManager.getTemplate(templateId)
        : await styleManager.getDefaultTemplate();
      
      if (loadedTemplate) {
        setTemplate(loadedTemplate);
        setCssContent(loadedTemplate.css_content);
        setVariables(loadedTemplate.variables || {});
        
        const cssVars = await styleManager.getCSSVariables(loadedTemplate.id);
        setCssVariables(cssVars);
        
        // Generate preview
        generatePreview(loadedTemplate.css_content);
      }
    } catch (error) {
      console.error('Error loading template:', error);
      alert('Failed to load CSS template');
    } finally {
      setLoading(false);
    }
  };

  const generatePreview = (css: string) => {
    // Simple preview with your label structure
    const sampleHtml = `
      <div class="label-container">
        <div class="header-section">
          <h1 class="product-name">Sample Product Name</h1>
        </div>
        <div class="content-wrapper">
          <div class="left-columns">
            <div class="lc-section">
              <h4>Description</h4>
              <p>This is a sample description to show the CSS styling.</p>
            </div>
          </div>
          <div class="right-columns">
            <div class="rc-section">
              <h4>Precautionary Statements</h4>
              <p class="rc-statement">Sample precautionary statement text.</p>
            </div>
          </div>
        </div>
      </div>
    `;

    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>${css}</style>
        </head>
        <body>
          ${sampleHtml}
        </body>
      </html>
    `;

    setPreviewHtml(fullHtml);
  };

  const handleSave = async () => {
    if (!template) return;
    
    try {
      setSaving(true);
      
      if (productId) {
        // Save as product-specific override
        await styleManager.saveProductStyleOverride(
          productId,
          template.id,
          cssContent,
          variables
        );
      } else {
        // Update the template
        await styleManager.updateTemplate(template.id, cssContent, variables);
      }

      alert('CSS template saved successfully');
      onSave?.(true);
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Failed to save CSS template');
      onSave?.(false);
    } finally {
      setSaving(false);
    }
  };

  const handleCssChange = (newCss: string) => {
    setCssContent(newCss);
    generatePreview(newCss);
  };

  const extractVariables = () => {
    const extracted = styleManager.extractVariablesFromCSS(cssContent);
    setVariables({ ...variables, ...extracted });
    alert(`Found ${Object.keys(extracted).length} variables`);
  };

  if (loading) {
    return <div className="p-4">Loading CSS template...</div>;
  }

  if (!template) {
    return <div className="p-4">No CSS template found</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>CSS Style Editor</CardTitle>
          <CardDescription>
            {productId 
              ? `Editing product-specific overrides for ${template.name}`
              : `Editing template: ${template.name} (Version ${template.version})`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="css" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="css">CSS Editor</TabsTrigger>
              <TabsTrigger value="variables">Variables</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
            
            <TabsContent value="css" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="css-editor">CSS Content</Label>
                <textarea
                  id="css-editor"
                  value={cssContent}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleCssChange(e.target.value)}
                  className="font-mono text-sm min-h-[500px] w-full p-3 border rounded-md"
                  placeholder="Enter your CSS here..."
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={extractVariables} variant="outline">
                  Extract Variables
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="variables" className="space-y-4">
              <div className="grid gap-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">CSS Variables</h3>
                  <Button 
                    onClick={() => setVariables({ ...variables, [`new-var-${Date.now()}`]: '#000000' })}
                    variant="outline"
                    size="sm"
                  >
                    Add Variable
                  </Button>
                </div>
                
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {Object.entries(variables).map(([key, value]) => (
                    <div key={key} className="flex gap-2 items-center">
                      <Input
                        value={key}
                        onChange={(e) => {
                          const newVars = { ...variables };
                          delete newVars[key];
                          newVars[e.target.value] = value;
                          setVariables(newVars);
                        }}
                        className="flex-1"
                        placeholder="Variable name"
                      />
                      <Input
                        value={value}
                        onChange={(e) => setVariables({ ...variables, [key]: e.target.value })}
                        className="flex-1"
                        placeholder="Variable value"
                      />
                      <Button
                        onClick={() => {
                          const newVars = { ...variables };
                          delete newVars[key];
                          setVariables(newVars);
                        }}
                        variant="destructive"
                        size="sm"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="preview" className="space-y-4">
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="text-lg font-semibold mb-4">Live Preview</h3>
                <div className="border bg-white" style={{ transform: 'scale(0.3)', transformOrigin: 'top left', height: '2000px', width: '3000px' }}>
                  <iframe
                    srcDoc={previewHtml}
                    className="w-full h-full border-0"
                    title="CSS Preview"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
