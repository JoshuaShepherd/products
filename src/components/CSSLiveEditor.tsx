'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Eye, Code, RotateCcw, Download, Upload, Palette, Save, Loader2 } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { Database } from '@/lib/database.types';

type Product = Database['public']['Tables']['products']['Row'];

interface CSSLiveEditorProps {
  labelSize?: '5x9' | '14x7';
  initialProduct?: Product;
}

export default function CSSLiveEditor({ 
  labelSize = '5x9', 
  initialProduct
}: CSSLiveEditorProps) {
  const [cssContent, setCssContent] = useState('');
  const [originalCss, setOriginalCss] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(initialProduct || null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewHtml, setPreviewHtml] = useState('');
  const [selectedHtmlField, setSelectedHtmlField] = useState<string>('full');
  const [activeTab, setActiveTab] = useState('editor');
  const [lastChangeTime, setLastChangeTime] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Load initial CSS from database based on label size
  useEffect(() => {
    const loadInitialCSS = async () => {
      try {
        const response = await fetch(`/api/label-css/template?labelSize=${labelSize}`);
        if (response.ok) {
          const data = await response.json();
          const css = data.template?.base_css || '';
          setCssContent(css);
          setOriginalCss(css);
        } else {
          // Fallback - load from our known CSS
          const fallbackCSS = getLabelCSS(labelSize);
          setCssContent(fallbackCSS);
          setOriginalCss(fallbackCSS);
        }
      } catch (error) {
        console.error('Error loading CSS:', error);
        const fallbackCSS = getLabelCSS(labelSize);
        setCssContent(fallbackCSS);
        setOriginalCss(fallbackCSS);
      }
    };

    loadInitialCSS();
  }, [labelSize]);

  // Load products for testing
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch('/api/products');
        if (response.ok) {
          const data = await response.json();
          const productList = Array.isArray(data) ? data : [];
          
          // Remove duplicates based on ID
          const uniqueProducts = productList.filter((product, index, self) => 
            index === self.findIndex(p => p.id === product.id)
          );
          
          setProducts(uniqueProducts);
          
          if (!selectedProduct && uniqueProducts.length > 0) {
            setSelectedProduct(uniqueProducts[0]);
          }
        }
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []); // Remove selectedProduct from dependency array

  // Generate preview HTML when product or CSS changes
  useEffect(() => {
    if (selectedProduct) {
      generatePreviewHTML();
    }
  }, [selectedProduct, cssContent, labelSize]);

  const generatePreviewHTML = async () => {
    if (!selectedProduct) return;

    try {
      // Generate the label HTML using our actual production API
      const labelTitle = encodeURIComponent(selectedProduct.name || '');
      const endpoint = `/api/label/${labelTitle}?size=${labelSize}`;
      
      console.log('Fetching label from production API:', endpoint);
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch label: ${response.status}`);
      }
      
      const productionHtml = await response.text();
      
      // Extract the body content and replace with our custom CSS
      const bodyMatch = productionHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      const bodyContent = bodyMatch ? bodyMatch[1] : productionHtml;
      
      // Create new HTML with our CSS
      const mockHTML = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <title>${selectedProduct.name}</title>
          <style id="live-css">/* CSS will be injected here */</style>
        </head>
        <body>
          ${bodyContent}
        </body>
        </html>
      `;
      
      setPreviewHtml(mockHTML);
      
      // Update iframe with new content
      updateIframeContent(mockHTML, cssContent);
    } catch (error) {
      console.error('Error generating preview:', error);
      // Fallback to mock HTML if API fails
      const mockHTML = createMockLabelHTML(selectedProduct, labelSize);
      setPreviewHtml(mockHTML);
      updateIframeContent(mockHTML, cssContent);
    }
  };

  const createMockLabelHTML = (product: Product, size: '5x9' | '14x7'): string => {
    // Helper function to create img tags from URLs
    const createImageFromUrl = (url: string, className: string, altText: string): string => {
      if (!url || url.trim() === '') return '';
      if (url.includes('<img')) return url; // Already HTML
      return `<img src="${url.trim()}" class="${className}" alt="${altText}">`;
    };

    // Helper function to decode HTML entities
    const decodeHtmlEntities = (str: string): string => {
      const textarea = document.createElement('textarea');
      textarea.innerHTML = str;
      return textarea.value;
    };

    // Helper function to create pictograms section
    const createPictogramsSection = (pictogramUrls: string, labelSize: '5x9' | '14x7' = '5x9'): string => {
      // Adjust sizes based on label format
      const size = labelSize === '5x9' ? '19.5px' : '26px';
      const gap = labelSize === '5x9' ? '5px' : '7px';
      const margin = labelSize === '5x9' ? '5px' : '7px';
      const wrapStyle = labelSize === '5x9' ? 'nowrap' : 'wrap';
      const overflow = labelSize === '5x9' ? 'overflow-x: auto;' : '';
      
      // For testing purposes, if no pictograms exist, show some test ones
      if (!pictogramUrls || pictogramUrls.trim() === '') {
        const testPictograms = [
          'https://firebasestorage.googleapis.com/v0/b/specchem-pwa-feb-25.firebasestorage.app/o/pictograms%2Fghs-exclamation-mark.png?alt=media',
          'https://firebasestorage.googleapis.com/v0/b/specchem-pwa-feb-25.firebasestorage.app/o/pictograms%2Fghs-health-hazard.png?alt=media',
          'https://firebasestorage.googleapis.com/v0/b/specchem-pwa-feb-25.firebasestorage.app/o/pictograms%2Fghs-environmental.png?alt=media'
        ];
        const imgTags = testPictograms.map(url => 
          `<img src="${url}" alt="Test Pictogram" style="width: ${size}; height: ${size}; object-fit: contain; border-radius: 4px; border: 1px solid #e3e8f1; background: #f7fafc; margin-right: ${gap}; display: inline-block; flex-shrink: 0;">`
        ).join('');
        return `<div class="pictograms" style="display: flex; gap: ${gap}; align-items: center; margin: 0 0 ${margin} 0; flex-wrap: ${wrapStyle}; ${overflow}">${imgTags}</div>`;
      }
      
      if (pictogramUrls.includes('<img')) {
        return pictogramUrls; // Already HTML
      }
      
      // Decode HTML entities first, then split URLs and create individual img tags
      const decodedUrls = decodeHtmlEntities(pictogramUrls);
      const urls = decodedUrls.split(/[,\n]/).map(url => url.trim()).filter(Boolean);
      if (urls.length === 0) return '';
      
      const imgTags = urls.map(url => 
        `<img src="${url}" alt="Pictogram" style="width: ${size}; height: ${size}; object-fit: contain; border-radius: 4px; border: 1px solid #e3e8f1; background: #f7fafc; margin-right: ${gap}; display: inline-block; flex-shrink: 0;">`
      ).join('');
      return `<div class="pictograms" style="display: flex; gap: ${gap}; align-items: center; margin: 0 0 ${margin} 0; flex-wrap: ${wrapStyle}; ${overflow}">${imgTags}</div>`;
    };

    // Helper function to get corner icons with proper URLs
    const createCornerIcons = (product: Product): string => {
      const icons: string[] = [];
      
      // Do Not Freeze icon
      if (product.do_not_freeze) {
        icons.push('<img src="https://firebasestorage.googleapis.com/v0/b/specchem-pwa-feb-25.firebasestorage.app/o/pictograms%2Fdo-not-freeze-pictogram.png?alt=media&token=example" class="corner-icon" alt="Do Not Freeze">');
      }
      
      // Mix Well icon  
      if (product.mix_well) {
        icons.push('<img src="https://firebasestorage.googleapis.com/v0/b/specchem-pwa-feb-25.firebasestorage.app/o/pictograms%2Fmix-well-pictogram.png?alt=media&token=example" class="corner-icon" alt="Mix Well">');
      }
      
      // Default rectangle icon
      icons.push('<img src="https://firebasestorage.googleapis.com/v0/b/specchem-pwa-feb-25.firebasestorage.app/o/pictograms%2Frectangle-pictogram.png?alt=media&token=a469c938-f942-4f1f-b825-444828d6a8f3" class="corner-icon-rectangle" alt="Rectangle Icon">');
      
      return icons.join('\n              ');
    };

    // Helper function to get Green Conscious icon
    const createGreenConsciousIcon = (product: Product): string => {
      if (!product.green_conscious) {
        return '<img src="https://via.placeholder.com/72/cccccc/666666?text=GC" class="green-conscious-icon" alt="Green Conscious">';
      }
      // Use a default green conscious icon URL since it's just a boolean in the database
      return '<img src="https://firebasestorage.googleapis.com/v0/b/specchem-pwa-feb-25.firebasestorage.app/o/pictograms%2Fgreen-conscious-icon.png?alt=media&token=example" class="green-conscious-icon" alt="Green Conscious">';
    };
    if (size === '5x9') {
      // For pictograms, we need to handle the new database structure
      // In the new schema, pictograms are in a relationship table, not a field
      // For mock data, we'll use an empty string for now
      const pictograms = createPictogramsSection('', '5x9');
      const cornerIcons = createCornerIcons(product);
      const greenConsciousIcon = createGreenConsciousIcon(product);
      
      return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <title>${product.name}</title>
          <style id="live-css">/* CSS will be injected here */</style>
        </head>
        <body>
          <div class="label-container label-5x9">
            <div class="columns-container">
              <div class="left-columns">
                <div class="lc-section">
                  <h4>Description</h4>
                  <p>${product.description || 'Sample description content for testing the CSS editor.'}</p>
                </div>
                <div class="lc-section">
                  <h4>VOC Data</h4>
                  <p><strong>${product.voc_data || 'Sample VOC data content'}</strong></p>
                </div>
                <div class="lc-section">
                  <h4>Application</h4>
                  <p>${product.application || 'Sample application instructions for testing.'}</p>
                </div>
                <div class="lc-section">
                  <h4>Features</h4>
                  <ul>
                    <li>Feature one for testing</li>
                    <li>Feature two for testing</li>
                    <li>Feature three for testing</li>
                  </ul>
                </div>
              </div>
              
              <div class="center-content">
                <div class="product-name">${product.name}</div>
                <div class="short-description-english">${product.short_description_english || 'English description'}</div>
                <div class="translated-short-description">${product.short_description_french || 'Description française'}</div>
              </div>
              
              <div class="right-columns">
                <div class="rc-section"><h4>Pictograms</h4>${pictograms}</div>
                <div class="rc-section">
                  <h4>Signal Word</h4>
                  <p><strong>${product.signal_word || 'WARNING'}</strong></p>
                </div>
                <div class="rc-section">
                  <h4>Hazard Statements</h4>
                  <ul>
                    <li>${product.hazard_statements || 'Sample hazard statement one'}</li>
                    <li>Sample hazard statement two</li>
                  </ul>
                </div>
                <div class="rc-section">
                  <h4>Precautionary Statements</h4>
                  <ul>
                    <li>${product.precautionary_statements || 'Sample precautionary statement'}</li>
                    <li>Keep out of reach of children</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div class="side-icons">
              ${cornerIcons}
            </div>
            
            <div class="bottom-vert-stack">
              <div class="logo-container">
                <img src="https://firebasestorage.googleapis.com/v0/b/specchem-pwa-feb-25.firebasestorage.app/o/branding%2Flogo-transparent.webp?alt=media&token=0b494edd-5a0a-4f37-8227-8e88356881f8" alt="SpecChem Logo">
              </div>
              <div class="batch-no-row">
                <label>Batch No:</label>
                <input type="text" name="batch-no" placeholder="Batch #" />
              </div>
              <div class="bottom-qrgc-row">
                <img src="https://firebasestorage.googleapis.com/v0/b/specchem-pwa-feb-25.firebasestorage.app/o/pictograms%2Fproduct-qr.png?alt=media&token=c832e9c2-525d-4dbf-984d-f8f249acf86e" class="qr-code" alt="QR Code" />
                ${greenConsciousIcon}
              </div>
              <div class="bottom-info-row">
                <span>5 Gallon/18.93L</span>
                <span class="bottom-info-divider">|</span>
                <span>Used by date: ${product.used_by_date || '2 years from batch date'}</span>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;
    } else {
      // 14x7 layout (landscape)
      const pictograms = createPictogramsSection('', '14x7');
      const cornerIcons = createCornerIcons(product);
      const greenConsciousIcon = createGreenConsciousIcon(product);
      
      return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <title>${product.name}</title>
          <style id="live-css">/* CSS will be injected here */</style>
        </head>
        <body>
          <div class="label-container">
            <div class="columns-container">
              <div class="left-columns" id="Font6">
                <div class="lc-section">
<h4>Description</h4>
${product.description || 'Sample description content for testing the 14x7 CSS editor. This is a longer description to test how content flows in the landscape format.'}
</div>
<div class="lc-section">
<h4>VOC Data</h4>
<strong>${product.voc_data || 'Sample VOC data content for testing'}</strong>
</div>
<div class="lc-section">
<h4>Application</h4>
${product.application || 'Sample application instructions for testing the layout and font sizes.'}
</div>
<div class="lc-section">
<h4>Features</h4>
${product.features || `High performance coating system
Excellent durability and adhesion  
Easy application process
Long-lasting protection`}
</div>
<div class="lc-section">
<h4>Coverage</h4>
${product.coverage || 'Approximately 200-250 sq ft per gallon depending on surface texture and application method.'}
</div>
<div class="lc-section">
<h4>Limitations</h4>
${product.limitations || `Do not apply in freezing conditions
Surface temperature must be above 50°F
Relative humidity should be below 85%`}
</div>
              </div>
              
              <div class="center-content">
                <div class="product-name">${product.name}</div>
                <div class="subtitle">${product.subtitle_1 || 'Professional Grade'}</div>
                <div class="subtitle subtitle-2">${product.subtitle_2 || 'Industrial Coating'}</div>
                <div class="short-description-english">${product.short_description_english || 'Premium Quality Industrial Coating'}</div>
                <div class="translated-short-description">${product.short_description_french || 'Revêtement industriel de qualité supérieure'}</div>
                
                <div class="logo-container">
                  <img src="https://firebasestorage.googleapis.com/v0/b/specchem-pwa-feb-25.firebasestorage.app/o/branding%2Flogo-transparent.webp?alt=media&token=0b494edd-5a0a-4f37-8227-8e88356881f8" alt="SpecChem Logo">
                </div>
              </div>
              
              <div class="right-columns">
                <div class="rc-section"><h4>Pictograms</h4>${pictograms}</div>
                <div class="rc-section">
                  <h4>Components Determining Hazard</h4>
                  <p>${product.components_determining_hazard || 'Proprietary blend of industrial grade components and additives for optimal performance.'}</p>
                </div>
                
                <div class="rc-section">
                  <h4>Signal Word</h4>
                  <p class="signal-word">${product.signal_word || 'WARNING'}</p>
                </div>
                
                <div class="rc-section">
                  <h4>Hazard Statements</h4>
                  <ul class="statement-list">
                    <li>${product.hazard_statements || 'May cause skin and eye irritation'}</li>
                    <li>May cause respiratory irritation if inhaled</li>
                    <li>Keep out of reach of children</li>
                  </ul>
                </div>
                
                <div class="rc-section">
                  <h4>Precautionary Statements</h4>
                  <ul class="statement-list">
                    <li>${product.precautionary_statements || 'Wear protective gloves and eye protection'}</li>
                    <li>Use only in well-ventilated areas</li>
                    <li>Wash hands thoroughly after handling</li>
                    <li>Store in original container only</li>
                  </ul>
                </div>
                
                <div class="rc-section">
                  <h4>Response</h4>
                  <ul class="statement-list">
                    <li>${product.response_statements || 'IF IN EYES: Rinse cautiously with water for several minutes'}</li>
                    <li>IF ON SKIN: Wash with plenty of water</li>
                    <li>IF INHALED: Remove person to fresh air</li>
                  </ul>
                </div>
                
                <div class="rc-section">
                  <h4>Storage</h4>
                  <ul class="statement-list">
                    <li>${product.storage || 'Store in a cool, dry place'}</li>
                    <li>Keep container tightly closed</li>
                    <li>Protect from freezing</li>
                  </ul>
                </div>
                
                <div class="rc-section">
                  <h4>Disposal</h4>
                  <ul class="statement-list">
                    <li>${product.disposal || 'Dispose of in accordance with local regulations'}</li>
                    <li>Do not pour down drains or sewers</li>
                  </ul>
                </div>
                
                <div class="rc-section">
                  <h4>Transport</h4>
                  <p>${product.proper_shipping_name || 'Transport in accordance with DOT regulations. Not regulated for ground transport.'}</p>
                </div>
              </div>
            </div>
            
            <!-- Corner Icons -->
            <div class="corner-icons">
              ${cornerIcons}
            </div>
            
            <!-- Code Row with QR, Batch, and Green Conscious -->
            <div class="code-row">
              <img src="https://firebasestorage.googleapis.com/v0/b/specchem-pwa-feb-25.firebasestorage.app/o/pictograms%2Fproduct-qr.png?alt=media&token=c832e9c2-525d-4dbf-984d-f8f249acf86e" class="qr-code" alt="QR Code">
              
              <div class="code-info">
                <div class="batch-field">
                  <label>Batch No:</label>
                  <input type="text" name="batch-no" placeholder="Enter batch number" style="border: none; border-bottom: 2px solid #223166; background: #f3f7ff; padding: 2px 5px; font-size: 13px;">
                </div>
                <div class="package-size">5 Gallon/18.93L</div>
                <div class="use-by">Used by date: ${product.used_by_date || '2 years from batch date'}</div>
              </div>
              
              ${greenConsciousIcon}
            </div>
          </div>
        </body>
        </html>
      `;
    }
  };

  const updateIframeContent = (html: string, css: string) => {
    if (!iframeRef.current) return;

    const iframe = iframeRef.current;
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    
    if (iframeDoc) {
      // Replace CSS placeholder with actual CSS
      const htmlWithCSS = html.replace('/* CSS will be injected here */', css);
      
      iframeDoc.open();
      iframeDoc.write(htmlWithCSS);
      iframeDoc.close();
    }
  };

  const handleCSSChange = (newCSS: string) => {
    setCssContent(newCSS);
    setLastChangeTime(new Date());
    setHasUnsavedChanges(newCSS !== originalCss);
  };

  const resetCSS = () => {
    setCssContent(originalCss);
    setHasUnsavedChanges(false);
  };

  const saveCSS = async () => {
    if (!hasUnsavedChanges) return;
    
    setSaving(true);
    try {
      const response = await fetch('/api/label-css', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          label_size: labelSize,
          css: cssContent
        }),
      });

      if (response.ok) {
        setOriginalCss(cssContent);
        setHasUnsavedChanges(false);
        // Show success notification (you can add toast here)
        console.log('CSS saved successfully');
      } else {
        throw new Error('Failed to save CSS');
      }
    } catch (error) {
      console.error('Error saving CSS:', error);
      // Show error notification (you can add toast here)
    } finally {
      setSaving(false);
    }
  };

  const downloadCSS = () => {
    const blob = new Blob([cssContent], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `label-${labelSize}-edited.css`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setCssContent(content);
    };
    reader.readAsText(file);
  };

  const getHtmlContent = (): string => {
    if (!selectedProduct) return '<!-- No product selected -->';
    
    // Helper function to safely get field content
    const getFieldContent = (field: keyof Product): string => {
      const content = selectedProduct[field];
      return content ? String(content).trim() : `<!-- No ${String(field).toLowerCase()} available -->`;
    };
    
    switch (selectedHtmlField) {
      case 'full':
        return previewHtml || '<!-- Full HTML not yet generated -->';
      case 'title':
        return `<!-- Title Section -->
<div class="title-section">
  <h1 class="product-title">${getFieldContent('name')}</h1>
  ${selectedProduct.subtitle_1 ? `  <h2 class="subtitle-1">${getFieldContent('subtitle_1')}</h2>` : ''}
  ${selectedProduct.subtitle_2 ? `  <h3 class="subtitle-2">${getFieldContent('subtitle_2')}</h3>` : ''}
</div>`;
      case 'description':
        return `<!-- Description Section -->
<div class="description-section">
  <div class="description-content">
    ${getFieldContent('description')}
  </div>
</div>`;
      case 'application':
        return `<!-- Application Section -->
<div class="application-section">
  <div class="application-content">
    ${getFieldContent('application')}
  </div>
</div>`;
      case 'features':
        return `<!-- Features Section -->
<div class="features-section">
  <div class="features-content">
    ${getFieldContent('features')}
  </div>
</div>`;
      case 'hazards':
        return `<!-- Hazard Information Section -->
<div class="hazard-section">
  ${selectedProduct.signal_word ? `  <div class="signal-word">${getFieldContent('signal_word')}</div>` : ''}
  ${selectedProduct.hazard_statements ? `  <div class="hazard-statements">${getFieldContent('hazard_statements')}</div>` : ''}
  ${selectedProduct.precautionary_statements ? `  <div class="precautionary-statements">${getFieldContent('precautionary_statements')}</div>` : ''}
  ${selectedProduct.response_statements ? `  <div class="response-statements">${getFieldContent('response_statements')}</div>` : ''}
</div>`;
      case 'pictograms':
        const pictogramUrls = '';
        return `<!-- Pictograms Section -->
<div class="pictograms-section">
  ${pictogramUrls ? `  <div class="pictogram-urls">${pictogramUrls}</div>` : '  <!-- No pictograms available -->'}
</div>`;
      default:
        return previewHtml || '<!-- Content not available -->';
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            CSS Live Editor - {labelSize} Labels
            <Badge variant="outline">{selectedProduct?.name || 'No Product'}</Badge>
          </CardTitle>
          
          <div className="flex items-center gap-4">
            <Select
              value={selectedProduct?.id || ''}
              onValueChange={(value) => {
                const product = products.find(p => p.id === value);
                setSelectedProduct(product || null);
              }}
            >
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select a product to preview" />
              </SelectTrigger>
              <SelectContent>
                {products
                  .filter((product, index, self) => 
                    // Additional safety filter to ensure unique entries in dropdown
                    index === self.findIndex(p => p.id === product.id && p.name === product.name)
                  )
                  .map((product) => (
                    <SelectItem key={`product-${product.id}`} value={product.id || ''}>
                      {product.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            
            <div className="flex gap-2">
              <Button 
                onClick={saveCSS} 
                variant={hasUnsavedChanges ? "default" : "outline"} 
                size="sm"
                disabled={saving || !hasUnsavedChanges}
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {saving ? 'Saving...' : 'Save to DB'}
              </Button>
              <Button onClick={resetCSS} variant="outline" size="sm">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button onClick={downloadCSS} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <label htmlFor="css-upload">
                <Button variant="outline" size="sm" asChild>
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </span>
                </Button>
              </label>
              <input
                id="css-upload"
                type="file"
                accept=".css"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Live Preview - Full Width at Top */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Eye className="h-5 w-5" />
            Live Preview
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex justify-center">
            <div className="border rounded-lg overflow-hidden" style={{
              width: labelSize === '5x9' ? '450px' : '700px',
              height: labelSize === '5x9' ? '250px' : '350px'
            }}>
              <iframe
                ref={iframeRef}
                className="w-full h-full border-0"
                title="Label Preview"
                style={{ 
                  transform: labelSize === '5x9' ? 'scale(0.5)' : 'scale(0.5)',
                  transformOrigin: 'top left',
                  width: '200%',
                  height: '200%'
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CSS Editor and HTML Content Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* CSS Editor */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                CSS Editor
                {hasUnsavedChanges && (
                  <Badge variant="destructive" className="text-xs">
                    Unsaved
                  </Badge>
                )}
              </CardTitle>
              <div className="flex items-center gap-2">
                {lastChangeTime && (
                  <Badge variant="outline" className="text-xs">
                    <Palette className="h-3 w-3 mr-1" />
                    Updated {lastChangeTime.toLocaleTimeString()}
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Editor
              height="450px"
              language="css"
              theme="vs-dark"
              value={cssContent}
              onChange={(value) => handleCSSChange(value || '')}
              options={{
                minimap: { enabled: true },
                fontSize: 14,
                lineNumbers: 'on',
                roundedSelection: false,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                formatOnPaste: true,
                formatOnType: true,
                tabSize: 2,
                insertSpaces: true,
                wordWrap: 'on',
                scrollbar: {
                  vertical: 'visible',
                  horizontal: 'visible',
                  useShadows: false,
                  verticalHasArrows: true,
                  horizontalHasArrows: true,
                },
              }}
            />
          </CardContent>
        </Card>

        {/* HTML Content Viewer */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Code className="h-5 w-5" />
                HTML Content
              </CardTitle>
              <Select value={selectedHtmlField} onValueChange={setSelectedHtmlField}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Full HTML</SelectItem>
                  <SelectItem value="title">Title Section</SelectItem>
                  <SelectItem value="description">Description</SelectItem>
                  <SelectItem value="application">Application</SelectItem>
                  <SelectItem value="features">Features</SelectItem>
                  <SelectItem value="hazards">Hazard Info</SelectItem>
                  <SelectItem value="pictograms">Pictograms</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Editor
              height="450px"
              language="html"
              theme="vs-dark"
              value={getHtmlContent()}
              options={{
                readOnly: true,
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                roundedSelection: false,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                insertSpaces: true,
                wordWrap: 'on',
                scrollbar: {
                  vertical: 'visible',
                  horizontal: 'visible',
                  useShadows: false,
                  verticalHasArrows: true,
                  horizontalHasArrows: true,
                },
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Fallback CSS content
function getLabelCSS(labelSize: '5x9' | '14x7'): string {
  if (labelSize === '5x9') {
    return `
/* ===== 5x9 LABEL STYLES ===== */
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700&family=Open+Sans:wght@400;600&display=swap');

@page {
  size: 9in 5in;
  margin: 0;
}

body {
  margin: 0;
  padding: 0;
  background: #e7eaf0;
  font-family: 'Open Sans', Arial, sans-serif;
}

.label-container {
  width: 9in;
  height: 5in;
  margin: 0 auto;
  background: url("https://firebasestorage.googleapis.com/v0/b/specchem-pwa-feb-25.firebasestorage.app/o/branding%2F5x9-label-template.png?alt=media&token=afc42346-5527-4c06-8c50-1aaef543e1ef") no-repeat center center;
  background-size: cover;
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
}

.columns-container {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
  height: 100%;
  padding: 0.33in 0.36in 0.11in 0.36in;
  box-sizing: border-box;
  z-index: 2;
}

.left-columns, .right-columns {
  width: 32%;
  min-width: 130px;
  max-width: 33%;
  line-height: 1.16;
  word-break: break-word;
}

.left-columns {
  color: #18335b;
  column-count: 2;
  column-gap: 0.25in;
  margin-top: .3in;
}

.right-columns {
  color: #232942;
  font-size: 4.7px;
  line-height: 1.12;
  margin-top: .5in;
  column-count: 2;
  column-gap: 0.19in;
}

.left-columns h4 {
  font-family: 'Montserrat', 'Open Sans', Arial, sans-serif;
  font-size: 8px;
  color: #1e3369;
  text-transform: uppercase;
  font-weight: 700;
  margin-bottom: 0.5px;
  margin-top: 11px;
  letter-spacing: 0.07em;
  padding-left: 5px;
}

.left-columns p, .left-columns ul, .left-columns li {
  font-size: 5.5px;
  color: inherit;
  font-family: 'Montserrat', 'Open Sans', Arial, sans-serif;
  margin: 0 0 3px 0;
}

.right-columns h4 {
  font-family: 'Montserrat', 'Open Sans', Arial, sans-serif;
  font-size: 6.3px;
  color: #1e3369;
  text-transform: uppercase;
  font-weight: 700;
  margin-bottom: 0.5px;
  margin-top: 11px;
  letter-spacing: 0.07em;
  padding-left: 5px;
}

.right-columns p, .right-columns ul, .right-columns li {
  font-size: 4.7px;
  color: inherit;
  font-family: 'Montserrat', 'Open Sans', Arial, sans-serif;
  margin: 0 0 3px 0;
}

.center-content {
  width: 31%;
  min-width: 110px;
  max-width: 32%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  z-index: 5;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: 120px;
}

.product-name {
  font-family: 'Montserrat', Arial, sans-serif;
  font-size: 24px;
  font-weight: 700;
  color: #21325b;
  letter-spacing: 0.01em;
  margin: 0 0 2px 0;
  line-height: 1.1;
}

.short-description-english {
  font-family: 'Montserrat', Arial, sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: #2453a6;
  margin: 0 0 1.7px 0;
  letter-spacing: 0.01em;
}

.translated-short-description {
  font-size: 8px;
  font-family: 'Open Sans', Arial, sans-serif;
  color: #395073;
  font-weight: 500;
  margin: 0 0 1.3px 0;
}

/* Bottom sections */
.bottom-vert-stack {
  position: absolute;
  left: 50%;
  bottom: 0.18in;
  transform: translateX(-50%);
  width: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 30;
}

.logo-container {
  margin-top: 100px;
  margin-bottom: 30px;
  display: flex;
  justify-content: center;
  width: 100%;
}

.logo-container img {
  width: 150px;
}

.batch-no-row {
  margin-bottom: 10px;
  font-size: 15px;
  color: #233066;
  font-family: 'Open Sans', Arial, sans-serif;
  display: flex;
  align-items: center;
  gap: 12px;
}

.batch-no-row input {
  width: 110px;
  font-size: 15px;
  border: none;
  border-bottom: 2px solid #223166;
  background: #f3f7ff;
  outline: none;
  padding: 3px 5px;
}

.bottom-qrgc-row {
  display: flex;
  flex-direction: row;
  gap: 40px;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
}

.qr-code {
  width: 50px;
}

.green-conscious-icon {
  width: 70px;
}

.bottom-info-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  color: #1b2754;
  font-family: 'Open Sans', Arial, sans-serif;
  margin-bottom: 20px;
}

.bottom-info-divider {
  color: #1b2754;
  font-weight: 700;
  font-size: 16px;
  margin: 0 9px;
}

.side-icons {
  position: absolute;
  right: 2in;
  bottom: 0.5in;
  z-index: 30;
  display: flex;
  flex-direction: row;
  gap: 14px;
}

.corner-icon-rectangle {
  width: 100px;
  height: 75px;
  object-fit: contain;
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 1px 3px #22316622;
  padding: 2px;
}
    `;
  } else {
    return `
/* ===== 14x7 LABEL STYLES (Landscape) ===== */
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700&family=Open+Sans:wght@400;600&display=swap');

@page {
  size: 14.875in 7.625in;
  margin: 0;
}

/* Dynamic Font Size Classes */
#Font6 p, #Font6 ul, #Font6 li {
  font-size: 6px !important;
}
#Font6-5 p, #Font6-5 ul, #Font6-5 li {
  font-size: 6.5px !important;
}
#Font7 p, #Font7 ul, #Font7 li {
  font-size: 7px !important;
}
#Font8 p, #Font8 ul, #Font8 li {
  font-size: 8px !important;
}
#Font9 p, #Font9 ul, #Font9 li {
  font-size: 9px !important;
}
#Font10 p, #Font10 ul, #Font10 li {
  font-size: 9px !important;
}
#Font11 p, #Font11 ul, #Font11 li {
  font-size: 9.5px !important;
}

body {
  margin: 0;
  padding: 0;
  background: #e7eaf0;
  font-family: 'Open Sans', Arial, sans-serif;
}

.label-container {
  width: 14.875in;
  height: 7.625in;
  margin: 0 auto;
  background: url("https://firebasestorage.googleapis.com/v0/b/specchem-pwa-feb-25.firebasestorage.app/o/branding%2Fblank-tapered-label.png?alt=media&token=930baa3f-38d5-46fa-81a3-0df0c1eb15a8") no-repeat center center;
  background-size: cover;
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
}

.columns-container {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex: 1 1 0;
  width: 100%;
  height: 100%;
  padding: 0.60in 0.68in 0.24in 0.68in;
  box-sizing: border-box;
  z-index: 2;
  margin-top: .6in;
}

.left-columns, .right-columns {
  width: 31.5%;
  min-width: 320px;
  max-width: 35%;
  line-height: 1.22;
  column-count: 2;
  column-gap: 0.25in;
}

.left-columns li, .right-columns li, .left-columns ul, .right-columns ul {
  line-height: 1.22;
}

.left-columns {
  color: #18335b;
}

.right-columns {
  color: #232942;
  line-height: 1.14;
  column-gap: 0.15in;
}

.left-columns h4 {
  font-family: 'Montserrat', Arial, sans-serif;
  font-size: 11px;
  color: #233066;
  text-transform: uppercase;
  font-weight: 700;
  margin-bottom: 2px;
  letter-spacing: 0.06em;
  margin-top: 5px;
  break-after: avoid;
  page-break-after: avoid;
}

.right-columns h4 {
  font-family: 'Montserrat', Arial, sans-serif;
  font-size: 11px;
  color: #233066;
  text-transform: uppercase;
  font-weight: 700;
  margin-bottom: 2px;
  letter-spacing: 0.04em;
  margin-top: 5px;
  break-after: avoid;
  page-break-after: avoid;
}

.left-columns p, .left-columns ul, .left-columns li {
  font-size: 8px;
  color: inherit;
  font-family: 'Open Sans', Arial, sans-serif;
  margin: 0 0 3px 0;
}

/* CRITICAL FIX - Target text directly in lc-section divs */
.left-columns .lc-section {
  font-size: 8px !important;
  color: inherit;
  font-family: 'Open Sans', Arial, sans-serif;
  line-height: 1.22;
  margin: 0 0 3px 0;
}

/* Font ID overrides for left-columns content */
#Font6 .lc-section {
  font-size: 6px !important;
}

#Font6-5 .lc-section {
  font-size: 6.5px !important;
}

#Font7 .lc-section {
  font-size: 7px !important;
}

#Font8 .lc-section {
  font-size: 8px !important;
}

#Font9 .lc-section {
  font-size: 9px !important;
}

#Font10 .lc-section {
  font-size: 9px !important;
}

#Font11 .lc-section {
  font-size: 9.5px !important;
}

/* Also fix paragraph content if it exists */
.left-columns .lc-section p,
.left-columns .lc-section ul,
.left-columns .lc-section li {
  font-size: inherit !important;
  color: inherit;
  font-family: inherit;
  line-height: inherit;
  margin: 0 0 3px 0;
}

.right-columns p, .right-columns ul, .right-columns li {
  font-size: 7px;
  color: inherit;
  font-family: 'Open Sans', Arial, sans-serif;
  margin: 0 0 2px 0;
}

.rc-statement {
  font-size: 7px;
  color: inherit;
  font-family: 'Open Sans', Arial, sans-serif;
  margin: 0 0 3px 0;
}

.right-columns ul, .right-columns .statement-list {
  list-style: none;
  padding-left: 0;
  margin-left: 0;
  margin-bottom: 2px;
  font-size: 7px;
  color: inherit;
  font-family: 'Open Sans', Arial, sans-serif;
  line-height: 1.16;
}

.right-columns li, .right-columns .statement-list li {
  margin: 0 0 2px 0;
  padding-left: 0;
  font-size: inherit;
  color: inherit;
  font-family: inherit;
  line-height: inherit;
  background: none;
  border: none;
  display: block;
}

.statement-list {
  margin: 0 0 2px 0;
  padding-left: 13px;
  color: #183363;
}

.statement-list li {
  margin: 0 0 2px 0;
  list-style: disc;
  font-size: inherit;
}

.contact-block {
  font-size: 6px;
  line-height: 1.3;
  margin-bottom: 4px;
  color: #1a2340;
  font-family: 'Open Sans', Arial, sans-serif;
  word-break: break-word;
}

/* Center Column Styling */
.center-content {
  width: 27%;
  min-width: 240px;
  max-width: 28%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  z-index: 5;
  position: absolute;
  top: 15%;
  left: 50%;
  transform: translateX(-50%);
}

.center-content .product-name {
  font-family: 'Montserrat', Arial, sans-serif;
  font-size: 48px;
  font-weight: 700;
  color: #21325b;
  letter-spacing: 0.03em;
  margin: 0 0 2px 0;
  line-height: 1.1;
}

.center-content .subtitle {
  font-family: 'Montserrat', Arial, sans-serif;
  font-size: 16px;
  color: #294b88;
  font-weight: 500;
  letter-spacing: 0.015em;
  margin: 2px 0 2px 0;
}

.center-content .subtitle.subtitle-2 {
  font-size: 13px;
  color: #466db2;
  font-weight: 400;
  margin-bottom: 2px;
}

.short-description-english {
  font-family: 'Montserrat', Arial, sans-serif;
  font-size: 18px;
  font-weight: 600;
  color: #2453a6;
  margin: 0 0 2px 0;
  letter-spacing: 0.02em;
}

.translated-short-description {
  font-size: 12px;
  font-family: 'Open Sans', Arial, sans-serif;
  color: #395073;
  font-weight: 500;
  margin: 0 0 2px 0;
}

.logo-container img {
  width: 200px;
  margin: 11px 0 4px 0;
  filter: drop-shadow(0 2px 8px #132e5712);
}

/* Pictograms */
.pictograms {
  display: flex;
  gap: 7px;
  align-items: center;
  margin: 0 0 7px 0;
}

.pictograms img {
  width: 26px;
  height: 26px;
  object-fit: contain;
  border-radius: 5px;
  border: 1px solid #e3e8f1;
  background: #f7fafc;
}

.signal-word {
  font-weight: 700;
  font-family: 'Montserrat', Arial, sans-serif;
}

/* Bottom Code Row */
.code-row {
  position: absolute;
  left: 50%;
  bottom: 0.75in;
  transform: translateX(-50%);
  width: 700px;
  height: 80px;
  z-index: 20;
  margin: 0;
}

.code-info {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: flex-start !important;
  min-width: 200px;
  font-size: 13px;
  color: #1b2754;
  font-family: 'Open Sans', Arial, sans-serif;
  gap: 4px;
  z-index: 2;
}

.qr-code {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 72px;
}

.green-conscious-icon {
  position: absolute;
  right: 20%;
  top: 50%;
  transform: translateY(-50%);
  width: 72px;
}

.batch-field {
  font-size: 13px;
  font-family: 'Open Sans', Arial, sans-serif;
  color: #233066;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 3px;
  text-align: left !important;
  margin-left: 0 !important;
}

.batch-field label {
  display: inline-block !important;
  min-width: 105px !important;
  padding: 0 !important;
  margin: 0 !important;
}

.batch-field input {
  margin-left: 0 !important;
}

.package-size, .use-by {
  font-size: 12px;
  margin-bottom: 2px;
  color: #1b2754;
  text-align: left !important;
  margin-left: 0 !important;
  font-family: 'Open Sans', Arial, sans-serif !important;
}

/* Corner Icons */
.corner-icons {
  position: absolute;
  left: .5in;
  bottom: 0.75in;
  display: flex;
  flex-direction: row;
  gap: 14px;
  z-index: 12;
}

.corner-icon {
  width: 75px;
  height: 75px;
  object-fit: contain;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1.5px 6px #22316622;
  padding: 3px;
}

.corner-icon-rectangle {
  width: 125px;
  height: 75px;
  object-fit: contain;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1.5px 6px #22316622;
  padding: 3px;
}

.legal-section {
  font-size: 6px;
  color: #49516f;
  opacity: 0.84;
  font-family: 'Open Sans', Arial, sans-serif;
  line-height: 1.3;
}

/* Print Styles */
@media print {
  body {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    background: none !important;
  }
  .label-container { 
    box-shadow: none !important; 
    border-radius: 0 !important; 
  }
}
    `;
  }
}
