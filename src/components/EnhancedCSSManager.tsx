'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Eye, 
  Save, 
  RefreshCw, 
  Download, 
  Upload, 
  Trash2, 
  Copy, 
  Layers,
  Clock,
  AlertCircle,
  CheckCircle,
  FileText,
  Settings,
  Zap,
  ExternalLink
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { LabelCSSCompiler, CSSLayer, CompilationResult } from '@/lib/css-compiler';
import { PRODUCTION_14X7_CSS, PRODUCTION_5X9_CSS } from '@/lib/productionCSSConstants';

interface Product {
  id: string;
  name: string;
  category_id?: string;
  // Legacy support for API compatibility
  ID?: string;
  Title?: string;
  Category?: string;
}

interface LabelTemplate {
  id: number;
  label_size: string;
  description: string;
  base_css: string;
  is_active: boolean;
  created_at: string;
}

interface CategoryOverride {
  id: number;
  category: string;
  label_size: string;
  css_overrides: string;
  description?: string;
  is_active: boolean;
  created_at: string;
}

interface ProductOverride {
  id: number;
  product_id: number;
  label_size: string;
  css_overrides: string;
  description?: string;
  is_active: boolean;
  created_at: string;
}

interface CSSManagerProps {
  initialProduct?: Product;
  initialLabelSize?: string;
}

export const EnhancedCSSManager: React.FC<CSSManagerProps> = ({ 
  initialProduct, 
  initialLabelSize = '5x9' 
}) => {
  // State management
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(initialProduct || null);
  const [selectedLabelSize, setSelectedLabelSize] = useState(initialLabelSize);
  const [activeTab, setActiveTab] = useState<'template' | 'category' | 'product' | 'preview'>('preview');
  
  // CSS Data
  const [template, setTemplate] = useState<LabelTemplate | null>(null);
  const [categoryOverride, setCategoryOverride] = useState<CategoryOverride | null>(null);
  const [productOverride, setProductOverride] = useState<ProductOverride | null>(null);
  
  // Editor State
  const [templateCSS, setTemplateCSS] = useState('');
  const [categoryCSS, setCategoryCSS] = useState('');
  const [productCSS, setProductCSS] = useState('');
  
  // Compilation State
  const [compilationResult, setCompilationResult] = useState<CompilationResult | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [autoCompile, setAutoCompile] = useState(true);
  
  // UI State
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{[key: string]: 'saving' | 'saved' | 'error' | undefined}>({});
  
  // Label Preview State
  const [labelHTML, setLabelHTML] = useState<string>('');
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState<string>('');

  // Available label sizes
  const labelSizes = ['5x9', '14x7', '4x6', '8x10'];

  const compiler = new LabelCSSCompiler();

  // Load initial data
  useEffect(() => {
    loadProducts();
  }, []);

  // Load CSS data when product or label size changes
  useEffect(() => {
    if (selectedProduct) {
      loadCSSData();
    }
  }, [selectedProduct, selectedLabelSize]);

  // Auto-compile when CSS changes
  useEffect(() => {
    if (autoCompile && selectedProduct) {
      const delayedCompile = setTimeout(() => {
        compileCSS();
      }, 1000); // Debounce compilation
      
      return () => clearTimeout(delayedCompile);
    }
  }, [templateCSS, categoryCSS, productCSS, autoCompile, selectedProduct]);

  // Auto-load preview when compilation result changes
  useEffect(() => {
    if (compilationResult && compilationResult.success && selectedProduct) {
      console.log('[Enhanced CSS Manager] Compilation result changed, loading preview...');
      loadLabelPreview();
    }
  }, [compilationResult, selectedProduct]);

  /**
   * Load all products for selection
   */
  const loadProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      
      // Filter out products with duplicate IDs to prevent React key conflicts
      const uniqueProducts = products.filter((product, index, array) => 
        array.findIndex(p => p.id === product.id) === index
      );
      
      setProducts(uniqueProducts);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  /**
   * Load CSS data for current product and label size
   */
  const loadCSSData = async () => {
    if (!selectedProduct) return;

    setIsLoading(true);
    try {
      // Use production CSS as base template instead of loading from API
      const productionCSS = selectedLabelSize === '14x7' ? PRODUCTION_14X7_CSS : PRODUCTION_5X9_CSS;
      
      setTemplate({
        id: 1,
        label_size: selectedLabelSize,
        description: `Production ${selectedLabelSize} template from generateLabelHtml.ts`,
        base_css: productionCSS,
        is_active: true,
        created_at: new Date().toISOString()
      });
      setTemplateCSS(productionCSS);

      // Load category override (if the API exists)
      if (selectedProduct.Category) {
        try {
          const categoryResponse = await fetch(`/api/label-css/category?category=${encodeURIComponent(selectedProduct.Category)}&labelSize=${selectedLabelSize}`);
          const categoryData = await categoryResponse.json();
          if (categoryData.override) {
            setCategoryOverride(categoryData.override);
            setCategoryCSS(categoryData.override.css_overrides);
          } else {
            setCategoryOverride(null);
            setCategoryCSS('');
          }
        } catch (error) {
          console.log('Category API not available:', error);
          setCategoryOverride(null);
          setCategoryCSS('');
        }
      } else {
        setCategoryOverride(null);
        setCategoryCSS('');
      }

      // Load product override (if the API exists)
      try {
        const productResponse = await fetch(`/api/label-css/product?productId=${selectedProduct.id}&labelSize=${selectedLabelSize}`);
        const productData = await productResponse.json();
        if (productData.override) {
          setProductOverride(productData.override);
          setProductCSS(productData.override.css_overrides);
        } else {
          setProductOverride(null);
          setProductCSS('');
        }
      } catch (error) {
        console.log('Product override API not available:', error);
        setProductOverride(null);
        setProductCSS('');
      }

    } catch (error) {
      console.error('Error loading CSS data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Compile CSS and update preview
   */
  const compileCSS = async () => {
    if (!selectedProduct) return;

    setIsCompiling(true);
    console.log('[Enhanced CSS Manager] Compiling CSS for preview...');
    
    try {
      // Force use of production CSS for now (skip database compilation)
      const productionCSS = selectedLabelSize === '14x7' ? PRODUCTION_14X7_CSS : PRODUCTION_5X9_CSS;
      
      const result = {
        success: true,
        css: productionCSS,
        errors: [],
        warnings: []
      };
      
      console.log('[Enhanced CSS Manager] Using production CSS, length:', productionCSS.length);
      setCompilationResult(result);
    } catch (error) {
      console.error('Error compiling CSS:', error);
      setCompilationResult({
        success: false,
        css: '',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        warnings: []
      });
    } finally {
      setIsCompiling(false);
    }
  };

  /**
   * Save CSS changes
   */
  const saveCSS = async (type: 'template' | 'category' | 'product') => {
    if (!selectedProduct) return;

    setSaveStatus({ ...saveStatus, [type]: 'saving' });

    try {
      let endpoint = '';
      let payload: any = {};

      switch (type) {
        case 'template':
          endpoint = '/api/label-css/template';
          payload = {
            labelSize: selectedLabelSize,
            baseCSS: templateCSS,
            description: `${selectedLabelSize} label template`
          };
          break;

        case 'category':
          if (!selectedProduct.Category) {
            throw new Error('Product has no category');
          }
          endpoint = '/api/label-css/category';
          payload = {
            category: selectedProduct.Category,
            labelSize: selectedLabelSize,
            cssOverrides: categoryCSS,
            description: `${selectedProduct.Category} category overrides`
          };
          break;

        case 'product':
          endpoint = '/api/label-css/product';
          payload = {
            productId: selectedProduct.id,
            labelSize: selectedLabelSize,
            cssOverrides: productCSS,
            description: `Custom styles for ${selectedProduct.name}`
          };
          break;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Failed to save ${type} CSS`);
      }

      setSaveStatus({ ...saveStatus, [type]: 'saved' });
      
      // Reload data to get latest IDs and timestamps
      await loadCSSData();
      
      // Clear saved status after delay
      setTimeout(() => {
        setSaveStatus(prev => ({ ...prev, [type]: undefined }));
      }, 2000);

    } catch (error) {
      console.error(`Error saving ${type} CSS:`, error);
      setSaveStatus({ ...saveStatus, [type]: 'error' });
      
      setTimeout(() => {
        setSaveStatus(prev => ({ ...prev, [type]: undefined }));
      }, 3000);
    }
  };

  /**
   * Clear cache for current product
   */
  const clearCache = async () => {
    if (!selectedProduct) return;

    try {
      await compiler.invalidateCache(selectedProduct.id, selectedLabelSize);
      await compileCSS(); // Recompile to update preview
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  };

  /**
   * Load label HTML with current product data
   */
  const loadLabelPreview = async () => {
    if (!selectedProduct) return;

    setIsLoadingPreview(true);
    setPreviewError('');
    
    try {
      // Get the label HTML for this product and size
      const response = await fetch(`/api/label/${encodeURIComponent(selectedProduct.name || '')}?size=${selectedLabelSize}`);
      
      if (!response.ok) {
        throw new Error(`Failed to load label: ${response.statusText}`);
      }
      
      const html = await response.text();
      
      // Force CSS compilation if not done yet
      if (!compilationResult || !compilationResult.success) {
        console.log('Compiling CSS for preview...');
        await compileCSS();
      }
      
      // Inject the compiled CSS or use production CSS as fallback
      let cssToInject = '';
      if (compilationResult?.success && compilationResult.css) {
        cssToInject = compilationResult.css;
        console.log('Using compiled CSS:', cssToInject.length, 'characters');
      } else {
        // Fallback to production CSS
        cssToInject = selectedLabelSize === '14x7' ? PRODUCTION_14X7_CSS : PRODUCTION_5X9_CSS;
        console.log('Using fallback production CSS:', cssToInject.length, 'characters');
      }
      
      // Replace existing styles with our enhanced CSS
      let cssInjectedHTML = html;
      
      // Remove existing style tags from the head
      cssInjectedHTML = cssInjectedHTML.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
      
      // Inject our CSS right before closing head tag
      cssInjectedHTML = cssInjectedHTML.replace(
        '</head>',
        `<style id="enhanced-css-manager">\n${cssToInject}\n</style>\n</head>`
      );
      
      setLabelHTML(cssInjectedHTML);
      console.log('Preview HTML updated with CSS injection');
      
    } catch (error) {
      console.error('Error loading label preview:', error);
      setPreviewError(error instanceof Error ? error.message : 'Failed to load label preview');
      setLabelHTML('');
    } finally {
      setIsLoadingPreview(false);
    }
  };

  /**
   * Render save button with status
   */
  const renderSaveButton = (type: 'template' | 'category' | 'product', onSave: () => void) => {
    const status = saveStatus[type];
    
    return (
      <Button 
        onClick={onSave} 
        size="sm" 
        disabled={status === 'saving'}
        variant={status === 'saved' ? 'default' : status === 'error' ? 'destructive' : 'outline'}
      >
        {status === 'saving' && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
        {status === 'saved' && <CheckCircle className="w-4 h-4 mr-2" />}
        {status === 'error' && <AlertCircle className="w-4 h-4 mr-2" />}
        {!status && <Save className="w-4 h-4 mr-2" />}
        {status === 'saving' ? 'Saving...' : status === 'saved' ? 'Saved' : status === 'error' ? 'Error' : 'Save'}
      </Button>
    );
  };

  /**
   * Render CSS layer info
   */
  const renderLayerInfo = (layers: CSSLayer[] | Array<{ source: string; css: string; priority: number; description: string; }>) => {
    return (
      <div className="space-y-2">
        {layers.map((layer, index) => {
          // Handle both CSSLayer and CompilationResult layer formats
          const layerInfo = 'id' in layer ? {
            source: layer.source || 'unknown',
            description: layer.description || layer.name,
            priority: layer.priority
          } : {
            source: layer.source,
            description: layer.description,
            priority: layer.priority
          };
          
          return (
            <div key={index} className="flex items-center gap-2 text-sm">
              <Badge variant={layerInfo.source === 'template' ? 'secondary' : layerInfo.source === 'category' ? 'default' : 'destructive'}>
                {layerInfo.source}
              </Badge>
              <span className="flex-1">{layerInfo.description || `${layerInfo.source} styles`}</span>
              <span className="text-muted-foreground">Priority: {layerInfo.priority}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Enhanced CSS Manager</h1>
          <p className="text-muted-foreground">Hierarchical CSS management for product labels</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch 
              checked={autoCompile} 
              onCheckedChange={setAutoCompile}
              id="auto-compile"
            />
            <Label htmlFor="auto-compile">Auto-compile</Label>
          </div>
          {selectedProduct && compilationResult?.success && (
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  onClick={loadLabelPreview} 
                  disabled={isLoadingPreview}
                  variant="default" 
                  size="sm"
                >
                  {isLoadingPreview ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <ExternalLink className="w-4 h-4 mr-2" />
                  )}
                  Label View
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[90vw] h-[90vh] max-w-none max-h-none flex flex-col">
                <DialogHeader className="flex-shrink-0">
                  <DialogTitle>Label Preview - {selectedProduct?.name || selectedProduct?.Title}</DialogTitle>
                  <DialogDescription>
                    Preview of {selectedLabelSize}" label with your custom CSS applied
                  </DialogDescription>
                </DialogHeader>
                <div className="flex-1 overflow-auto mt-4">
                  {previewError ? (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-800">
                        <strong>Error loading preview:</strong> {previewError}
                      </p>
                    </div>
                  ) : isLoadingPreview ? (
                    <div className="flex items-center justify-center p-8">
                      <RefreshCw className="w-8 h-8 animate-spin" />
                      <span className="ml-2">Loading label preview...</span>
                    </div>
                  ) : labelHTML ? (
                    <div className="border rounded-lg overflow-hidden bg-white">
                      <div 
                        className="label-preview-container"
                        dangerouslySetInnerHTML={{ __html: labelHTML }}
                        style={{
                          transform: 'scale(0.75)',
                          transformOrigin: 'top left',
                          width: '133%',
                          height: 'auto'
                        }}
                      />
                    </div>
                  ) : (
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <p className="text-gray-600">
                        Click "Label View" to load the preview
                      </p>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          )}
          <Button onClick={clearCache} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Clear Cache
          </Button>
        </div>
      </div>

      {/* Product Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Product</Label>
              <Select 
                value={selectedProduct?.id || selectedProduct?.ID || ''} 
                onValueChange={(value) => {
                  const product = products.find(p => (p.id || p.ID) === value);
                  setSelectedProduct(product || null);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a product..." />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product, index) => (
                    <SelectItem key={`product-${product.id}-${index}`} value={product.id || ''}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Label Size</Label>
              <Select value={selectedLabelSize} onValueChange={setSelectedLabelSize}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {labelSizes.map(size => (
                    <SelectItem key={size} value={size}>{size}"</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedProduct && (
            <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
              <div>
                <strong>Product:</strong> {selectedProduct.name}
              </div>
              {selectedProduct.Category && (
                <div>
                  <strong>Category:</strong> {selectedProduct.Category}
                </div>
              )}
              <div>
                <strong>Label Size:</strong> {selectedLabelSize}"
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* CSS Management Tabs */}
      {selectedProduct && (
        <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="preview">
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="template">
              <FileText className="w-4 h-4 mr-2" />
              Template
            </TabsTrigger>
            <TabsTrigger value="category">
              <Layers className="w-4 h-4 mr-2" />
              Category
            </TabsTrigger>
            <TabsTrigger value="product">
              <Zap className="w-4 h-4 mr-2" />
              Product
            </TabsTrigger>
          </TabsList>

          {/* Preview Tab */}
          <TabsContent value="preview">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Compiled CSS Preview</CardTitle>
                    <CardDescription>Final compiled CSS with all layers merged</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          onClick={loadLabelPreview} 
                          disabled={!compilationResult?.success || isLoadingPreview}
                          variant="secondary" 
                          size="sm"
                        >
                          {isLoadingPreview ? (
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <ExternalLink className="w-4 h-4 mr-2" />
                          )}
                          Label View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto">
                        <DialogHeader>
                          <DialogTitle>Label Preview - {selectedProduct?.Title}</DialogTitle>
                          <DialogDescription>
                            Preview of {selectedLabelSize}" label with your custom CSS applied
                          </DialogDescription>
                        </DialogHeader>
                        <div className="mt-4">
                          {previewError ? (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                              <p className="text-red-800">
                                <strong>Error loading preview:</strong> {previewError}
                              </p>
                            </div>
                          ) : isLoadingPreview ? (
                            <div className="flex items-center justify-center p-8">
                              <RefreshCw className="w-8 h-8 animate-spin" />
                              <span className="ml-2">Loading label preview...</span>
                            </div>
                          ) : labelHTML ? (
                            <div className="border rounded-lg overflow-hidden bg-white">
                              <div 
                                className="label-preview-container"
                                dangerouslySetInnerHTML={{ __html: labelHTML }}
                                style={{
                                  transform: 'scale(0.8)',
                                  transformOrigin: 'top left',
                                  width: '125%',
                                  height: 'auto'
                                }}
                              />
                            </div>
                          ) : (
                            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                              <p className="text-gray-600">
                                Click "Label View" to load the preview
                              </p>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button onClick={compileCSS} disabled={isCompiling} size="sm">
                      {isCompiling ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4 mr-2" />
                      )}
                      Compile
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {compilationResult && (
                  <>
                    {/* Compilation Info */}
                    <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                      <div className="flex items-center gap-2">
                        {compilationResult.success ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-500" />
                        )}
                        <span className="font-medium">
                          {compilationResult.success ? 'Compilation Successful' : 'Compilation Failed'}
                        </span>
                      </div>
                      <Badge variant={compilationResult.cacheHit ? 'secondary' : 'default'}>
                        {compilationResult.cacheHit ? 'Cache Hit' : 'Fresh Compile'}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {compilationResult.compilationTimeMs}ms
                      </div>
                    </div>

                    {/* CSS Layers */}
                    {compilationResult.layers && compilationResult.layers.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">CSS Layers Applied:</h4>
                        {renderLayerInfo(compilationResult.layers || [])}
                      </div>
                    )}

                    {/* Error Display */}
                    {!compilationResult.success && compilationResult.errors && compilationResult.errors.length > 0 && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-800">
                          <strong>Errors:</strong> {compilationResult.errors.join(', ')}
                        </p>
                      </div>
                    )}

                    {/* Compiled CSS */}
                    {compilationResult.success && (
                      <div className="space-y-2">
                        <Label>Compiled CSS</Label>
                        <Textarea
                          value={compilationResult.css}
                          readOnly
                          className="h-[400px] max-h-[400px] font-mono text-sm overflow-auto resize-none"
                        />
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Template Tab */}
          <TabsContent value="template">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Base Template CSS</CardTitle>
                    <CardDescription>
                      Global template styles for {selectedLabelSize}" labels (Priority: 1 - Lowest)
                    </CardDescription>
                  </div>
                  {renderSaveButton('template', () => saveCSS('template'))}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {template && (
                  <div className="text-sm text-muted-foreground">
                    <p>Template ID: {template.id}</p>
                    <p>Created: {new Date(template.created_at).toLocaleString()}</p>
                    {template.description && <p>Description: {template.description}</p>}
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Template CSS</Label>
                  <Textarea
                    value={templateCSS}
                    onChange={(e) => setTemplateCSS(e.target.value)}
                    className="h-[400px] max-h-[400px] font-mono text-sm overflow-auto resize-none"
                    placeholder="/* Base template styles for all products using this label size */"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Category Tab */}
          <TabsContent value="category">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Category CSS Overrides</CardTitle>
                    <CardDescription>
                      Category-specific styles for "{selectedProduct.Category}" (Priority: 2 - Medium)
                    </CardDescription>
                  </div>
                  {selectedProduct.Category && renderSaveButton('category', () => saveCSS('category'))}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {!selectedProduct.Category ? (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800">
                      This product has no category assigned. Category overrides are not available.
                    </p>
                  </div>
                ) : (
                  <>
                    {categoryOverride && (
                      <div className="text-sm text-muted-foreground">
                        <p>Override ID: {categoryOverride.id}</p>
                        <p>Created: {new Date(categoryOverride.created_at).toLocaleString()}</p>
                        {categoryOverride.description && <p>Description: {categoryOverride.description}</p>}
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label>Category Override CSS</Label>
                      <Textarea
                        value={categoryCSS}
                        onChange={(e) => setCategoryCSS(e.target.value)}
                        className="h-[400px] max-h-[400px] font-mono text-sm overflow-auto resize-none"
                        placeholder={`/* Category-specific styles for ${selectedProduct.Category} products */`}
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Product Tab */}
          <TabsContent value="product">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Product CSS Overrides</CardTitle>
                    <CardDescription>
                      Product-specific styles for "{selectedProduct.name}" (Priority: 3 - Highest)
                    </CardDescription>
                  </div>
                  {renderSaveButton('product', () => saveCSS('product'))}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {productOverride && (
                  <div className="text-sm text-muted-foreground">
                    <p>Override ID: {productOverride.id}</p>
                    <p>Created: {new Date(productOverride.created_at).toLocaleString()}</p>
                    {productOverride.description && <p>Description: {productOverride.description}</p>}
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Product Override CSS</Label>
                  <Textarea
                    value={productCSS}
                    onChange={(e) => setProductCSS(e.target.value)}
                    className="h-[400px] max-h-[400px] font-mono text-sm overflow-auto resize-none"
                    placeholder={`/* Custom styles specific to ${selectedProduct.name} */`}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center p-8">
          <RefreshCw className="w-8 h-8 animate-spin" />
          <span className="ml-2">Loading CSS data...</span>
        </div>
      )}
    </div>
  );
};
