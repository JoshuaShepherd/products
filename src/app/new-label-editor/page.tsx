'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Save, 
  Search,
  Palette, 
  Layout, 
  RefreshCw,
  Type,
  Move,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Trash2
} from 'lucide-react';

import { ProductAPI, Product } from '@/lib/product-api'
import { Database } from '@/lib/database.types'
import { supabase } from '@/lib/supabase'
import Editor from '@monaco-editor/react'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'

type LabelTemplate = Database['public']['Tables']['label_templates']['Row']

interface LabelElement {
  id: string;
  type: 'text' | 'image';
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize?: number;
  fontWeight?: string;
  textAlign?: string;
  color?: string;
  backgroundColor?: string;
}

export default function NewLabelEditorPage() {
  // State management
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedTemplateSize, setSelectedTemplateSize] = useState<'14x7' | '5x9'>('14x7');
  const [template, setTemplate] = useState<LabelTemplate | null>(null);
  const [elements, setElements] = useState<LabelElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<LabelElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [cssContent, setCssContent] = useState<string>('');
  const [originalCss, setOriginalCss] = useState<string>('');
  const [showCssEditor, setShowCssEditor] = useState(false);
  const [labelHtml, setLabelHtml] = useState<string>('');
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [showSavePreview, setShowSavePreview] = useState(false);
  const [savePreviewData, setSavePreviewData] = useState<any>(null);

  // Template dimensions based on size (mm to pixels conversion)
  const templateDimensions = {
    '14x7': { width: 14 * 37.8, height: 7 * 37.8 },
    '5x9': { width: 5 * 37.8, height: 9 * 37.8 }
  };

  // Load products on mount
  useEffect(() => {
    loadProducts();
  }, []);

  // Load template when size changes
  useEffect(() => {
    if (selectedTemplateSize) {
      loadTemplate();
    }
  }, [selectedTemplateSize]);

  // Generate preview when elements, product, or CSS changes
  useEffect(() => {
    if (selectedProduct) {
      generatePreview();
    }
  }, [elements, selectedProduct, template, cssContent]);

  // Load initial CSS when product or size changes
  useEffect(() => {
    if (selectedProduct) {
      loadTemplateCSS();
    }
  }, [selectedProduct, selectedTemplateSize]);

  const loadProducts = async () => {
    try {
      // Use standardized ProductAPI for consistent canonical data access
      const products = await ProductAPI.getProducts();
      setProducts(products);
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  };

  const loadTemplate = async () => {
    try {
      setLoading(true);
      const templateSlug = selectedTemplateSize === '14x7' ? 'enhanced-14x7-fixed' : 'biostrip-5x9';
      console.log('🔍 Loading template with slug:', templateSlug);
      
      const response = await fetch(`/api/templates?slug=${templateSlug}`);
      const data = await response.json();
      
      console.log('📦 Template API response:', data);
      
      if (data.length > 0) {
        console.log('✅ Setting template:', data[0].name, 'CSS length:', data[0].css_template?.length || 0);
        setTemplate(data[0]);
        initializeElements();
      } else {
        console.log('❌ No templates found for slug:', templateSlug);
        console.log('🔍 Let me try loading all templates to see what\'s available...');
        
        // Fallback: load all templates to see what's available
        const allResponse = await fetch('/api/templates');
        const allData = await allResponse.json();
        console.log('📋 All available templates:', allData.map((t: any) => ({ name: t.name, slug: t.slug })));
        
        // Try to find a template by partial name match
        const fallbackTemplate = allData.find((t: any) => 
          t.slug.includes(selectedTemplateSize) || t.name.toLowerCase().includes(selectedTemplateSize)
        );
        
        if (fallbackTemplate) {
          console.log('🎯 Using fallback template:', fallbackTemplate.name);
          setTemplate(fallbackTemplate);
          initializeElements();
        }
      }
    } catch (error) {
      console.error('❌ Failed to load template:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeElements = () => {
    const dimensions = templateDimensions[selectedTemplateSize];
    const initialElements: LabelElement[] = [
      {
        id: 'product-name',
        type: 'text',
        content: '{{name}}',
        x: 20,
        y: 20,
        width: dimensions.width - 40,
        height: 40,
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'left',
        color: '#000000'
      },
      {
        id: 'description',
        type: 'text',
        content: '{{short_description_english}}',
        x: 20,
        y: 70,
        width: dimensions.width - 40,
        height: 60,
        fontSize: 12,
        textAlign: 'left',
        color: '#333333'
      }
    ];
    setElements(initialElements);
  };

  const loadTemplateCSS = async () => {
    if (!selectedProduct) {
      console.log('⚠️ Cannot load CSS - missing product');
      return;
    }

    try {
      setLoading(true);
      console.log('🎨 Loading CSS for:', selectedProduct.name, 'size:', selectedTemplateSize);
      
      // Try to load product-specific CSS from individual_label_templates (without requiring template_id)
      const { data: individualTemplates, error: individualError } = await supabase
        .from('individual_label_templates')
        .select('custom_css, css_overrides, template_id, notes')
        .eq('product_id', selectedProduct.id);

      let css = '';
      
      // Look for any existing customizations for this product
      const existingCustomization = individualTemplates?.find(t => 
        t.css_overrides || t.custom_css
      );
      
      if (existingCustomization?.css_overrides) {
        console.log('✅ Found CSS overrides (', existingCustomization.css_overrides.length, 'chars)');
        css = existingCustomization.css_overrides;
      } else if (existingCustomization?.custom_css) {
        console.log('✅ Found custom CSS (', existingCustomization.custom_css.length, 'chars)');
        css = existingCustomization.custom_css;
      } else {
        console.log('📋 No individual template found, using default CSS');
        css = getDefaultCSS(selectedTemplateSize);
        console.log('🎨 Default CSS length:', css.length);
      }
      
      setCssContent(css);
      setOriginalCss(getDefaultCSS(selectedTemplateSize));
      
      console.log('✅ CSS loaded successfully - Content length:', css.length);
      
    } catch (error) {
      console.error('❌ Failed to load template CSS:', error);
      const fallbackCSS = getDefaultCSS(selectedTemplateSize);
      console.log('🔄 Using fallback CSS, length:', fallbackCSS.length);
      setCssContent(fallbackCSS);
      setOriginalCss(fallbackCSS);
    } finally {
      setLoading(false);
    }
  };

  const generatePreview = async () => {
    if (!selectedProduct) return;

    setIsGeneratingPreview(true);
    try {
      // Use the existing label API to get real label HTML
      const labelTitle = encodeURIComponent(selectedProduct.name);
      const endpoint = `/api/label/${labelTitle}?size=${selectedTemplateSize}`;
      
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`Failed to generate label: ${response.status}`);
      }
      
      const productionHtml = await response.text();
      
      // If we have custom CSS, inject it into the HTML
      let finalHtml = productionHtml;
      if (cssContent && cssContent !== originalCss) {
        // Replace the CSS in the HTML with our custom CSS
        finalHtml = productionHtml.replace(
          /<style[^>]*>[\s\S]*?<\/style>/i,
          `<style>${cssContent}</style>`
        );
      }
      
      setLabelHtml(finalHtml);
      setPreviewHtml(finalHtml);
    } catch (error) {
      console.error('Failed to generate preview:', error);
      // Create a simple fallback preview
      const mockHtml = createMockPreview();
      setLabelHtml(mockHtml);
      setPreviewHtml(mockHtml);
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  const createMockPreview = (): string => {
    if (!selectedProduct) return '';
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            ${cssContent || getDefaultCSS(selectedTemplateSize)}
          </style>
        </head>
        <body>
          <div class="label-container">
            <div class="header-section">
              <h1 class="product-name">${selectedProduct.name}</h1>
              ${selectedProduct.subtitle_1 ? `<h2 class="subtitle-1">${selectedProduct.subtitle_1}</h2>` : ''}
            </div>
            <div class="content-wrapper">
              <div class="left-columns">
                <div class="description">
                  ${selectedProduct.short_description_english || 'Product description'}
                </div>
                ${selectedProduct.features ? `<div class="features"><strong>Features:</strong> ${selectedProduct.features}</div>` : ''}
              </div>
              <div class="right-columns">
                ${selectedProduct.signal_word ? `<div class="signal-word ${selectedProduct.signal_word?.toLowerCase()}">${selectedProduct.signal_word}</div>` : ''}
                ${selectedProduct.hazard_statements ? `<div class="hazard-statements">${selectedProduct.hazard_statements}</div>` : ''}
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  };

  const getDefaultCSS = (labelSize: '14x7' | '5x9'): string => {
    if (labelSize === '5x9') {
      return `@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700&family=Open+Sans:wght@400;600&family=Lato:wght@400;700&display=swap');

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

.watermark {
    position: absolute;
    top: 54%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 215px;
    opacity: 0.14;
    z-index: 1;
    pointer-events: none;
    mix-blend-mode: multiply;
    filter: blur(0.2px);
    max-width: 60%;
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
    margin-top: .2in;
    column-count: 2;
    column-gap: 0.19in;
}

.right-columns {
    color: #232942;
    font-size: 4.7px;
    line-height: 1.12;
    margin-top: .5in;
    column-count: 2;
    column-gap: 0.19in;
}

.contact-block {
    font-size: 4px;
    line-height: 1.25;
    margin-bottom: 2px;
    color: #1a2340;
    font-family: 'Open Sans', Arial, sans-serif;
    word-break: break-word;
}

.left-columns h4 {
    font-family: 'Montserrat', 'Open Sans', Arial, sans-serif;
    font-size: 8.8px;
    color: #1e3369;
    text-transform: uppercase;
    font-weight: 700;
    margin-bottom: 0.5px;
    margin-top: 11px;
    letter-spacing: 0.07em;
    padding-left: 5px; 
}

.left-columns p, .left-columns ul, .left-columns li {
    font-size: 6.2px;
    color: inherit;
    font-family: 'Montserrat', 'Open Sans', Arial, sans-serif;
    margin: 0 0 3px 0;
}

.left-columns ul {
    padding-left: 12px;
}

.right-columns h4 {
    font-family: 'Montserrat', Arial, sans-serif;
    font-size: 6.3px;
    color: #233066;
    text-transform: uppercase;
    font-weight: 700;
    margin-bottom: 0.5px;
    margin-top: 4px;
    letter-spacing: 0.04em;
}

.right-columns p,
.right-columns ul,
.right-columns li,
.right-columns .statement-list {
    font-size: 4px;
    color: inherit;
    font-family: 'Open Sans', Arial, sans-serif;
    margin: 0 0 1.4px 0;
    list-style: none;
    padding-left: 0;
}

.right-columns .statement-list {
    margin-bottom: 0.5em;
}

.right-columns .statement-list > div {
    margin-bottom: 1px;
}

.right-columns .signal-word {
    font-size: 4.7px;
    font-weight: 700;
    font-family: 'Montserrat', Arial, sans-serif;
    margin-top: 0;
    margin-bottom: 0.6px;
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

.center-content .product-name {
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

.logo-container {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    bottom: 38%;
    margin: 0;
    width: 100%;
    display: flex;
    justify-content: center;
}

.logo-container img {
    width: 150px;
    filter: drop-shadow(0 2px 8px #132e5712);
}

.center-content .subtitle {
    font-family: 'Montserrat', Arial, sans-serif;
    font-size: 10px;
    color: #294b88;
    font-weight: 500;
    letter-spacing: 0.015em;
    margin: 1px 0 1px 0;
}

.center-content .subtitle.subtitle-2 {
    font-size: 8px;
    color: #466db2;
    font-weight: 400;
    margin-bottom: 1px;
}

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
}`;
    } else {
      // 14x7 landscape template
      return `@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700&family=Open+Sans:wght@400;600&family=Lato:wght@400;700&display=swap');

@page {
    size: 14.875in 7.625in;
    margin: 0;
}

#Font6 p, #Font6 ul, #Font6 li { font-size: 6px !important; }
#Font6-5 p, #Font6-5 ul, #Font6-5 li { font-size: 6.5px !important; }
#Font7 p, #Font7 ul, #Font7 li { font-size: 7px !important; }
#Font8 p, #Font8 ul, #Font8 li { font-size: 8px !important; }
#Font9 p, #Font9 ul, #Font9 li { font-size: 9px !important; }
#Font10 p, #Font10 ul, #Font10 li { font-size: 9px !important; }
#Font11 p, #Font11 ul, #Font11 li { font-size: 9.5px !important; }

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
    z-index: 10;
}

.left-columns li, .right-columns li, .left-columns ul, .right-columns ul {
    line-height: 1.22;
}

.right-columns {
    color: #232942;
    line-height: 1.14;
    column-gap: 0.15in;
}

.left-columns {
    color: #18335b;
}

.left-columns h4, .right-columns h4 {
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

.left-columns p, .left-columns ul, .left-columns li {
    font-size: 8px;
    color: inherit;
    font-family: 'Open Sans', Arial, sans-serif;
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

.contact-block {
    font-size: 6px;
    line-height: 1.3;
    margin-bottom: 4px;
    color: #1a2340;
    font-family: 'Open Sans', Arial, sans-serif;
    word-break: break-word;
}

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
    font-family: 'Verdana', Arial, sans-serif;
    font-size: 54px;
    font-weight: 700;
    color: #013A81;
    letter-spacing: 0.03em;
    margin: 0 0 2px 0;
    line-height: 1.1;
}

.short-description-english {
    font-family: 'Lato', Arial, sans-serif;
    font-size: 12px;
    font-weight: 700;
    color: #013A81;
    margin: 0 0 2px 0;
    letter-spacing: 0.02em;
}

.translated-short-description {
    font-size: 12px;
    font-family: 'Lato', Arial, sans-serif;
    color: #013A81;
    font-weight: 400;
    margin: 0 0 2px 0;
}

.logo-container img {
    height: .85in;
    width: auto;
    margin: 11px 0 4px 0;
    filter: drop-shadow(0 2px 8px #132e5712);
}

.signal-word {
    font-weight: 700;
    font-family: 'Montserrat', Arial, sans-serif;
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
}`;
    }
  };

  const previewSaveChanges = async () => {
    if (!selectedProduct) return;

    try {
      // Check if an individual template already exists for this product
      const { data: existingTemplates } = await supabase
        .from('individual_label_templates')
        .select('id, css_overrides, custom_css, notes, created_at, updated_at')
        .eq('product_id', selectedProduct.id);

      const existingTemplate = existingTemplates?.[0];
      const isUpdate = !!existingTemplate;
      
      // Prepare the data that will be sent to the database
      const saveData = {
        operation: isUpdate ? 'UPDATE' : 'INSERT',
        table: 'individual_label_templates',
        product_info: {
          id: selectedProduct.id,
          name: selectedProduct.name,
          sku: selectedProduct.sku
        },
        template_size: selectedTemplateSize,
        existing_record: existingTemplate || null,
        payload: isUpdate ? {
          css_overrides: cssContent,
          notes: `CSS customization for ${selectedProduct.name} - ${selectedTemplateSize} label - Updated ${new Date().toISOString()}`,
          updated_at: new Date().toISOString()
        } : {
          product_id: selectedProduct.id,
          template_id: null,
          css_overrides: cssContent,
          notes: `CSS customization for ${selectedProduct.name} - ${selectedTemplateSize} label - Created ${new Date().toISOString()}`
        },
        css_length: cssContent.length,
        has_changes: cssContent !== originalCss,
        timestamp: new Date().toISOString()
      };

      setSavePreviewData(saveData);
      setShowSavePreview(true);
      
      // Log the preview data for verification
      console.log('📋 SAVE PREVIEW DATA (Schema Verification)');
      console.log('==========================================');
      console.log('Operation:', saveData.operation);
      console.log('Table:', saveData.table);
      console.log('Product ID:', saveData.product_info.id);
      console.log('Product Name:', saveData.product_info.name);
      console.log('Template Size:', saveData.template_size);
      console.log('CSS Length:', saveData.css_length, 'characters');
      console.log('Has Changes:', saveData.has_changes);
      
      if (isUpdate) {
        console.log('📝 UPDATE Operation:');
        console.log('- Existing Record ID:', existingTemplate?.id);
        console.log('- Current CSS Length:', existingTemplate?.css_overrides?.length || 0);
        console.log('- New CSS Length:', cssContent.length);
        console.log('- Last Updated:', existingTemplate?.updated_at);
      } else {
        console.log('🆕 INSERT Operation:');
        console.log('- New record will be created');
        console.log('- product_id:', selectedProduct.id);
        console.log('- template_id: null (no base template)');
      }
      
      console.log('🔍 Payload Preview:');
      console.log(JSON.stringify(saveData.payload, null, 2));
      console.log('==========================================');
      
    } catch (error) {
      console.error('❌ Failed to prepare save preview:', error);
      alert('Failed to prepare save preview. Please try again.');
    }
  };

  const confirmSaveTemplate = async () => {
    if (!selectedProduct || !savePreviewData) return;

    try {
      setSaving(true);
      
      console.log('🚀 EXECUTING SAVE OPERATION');
      console.log('============================');
      console.log('Timestamp:', new Date().toISOString());
      console.log('Operation Type:', savePreviewData.operation);
      
      if (savePreviewData.operation === 'UPDATE') {
        console.log('📝 Executing UPDATE...');
        console.log('Target Record ID:', savePreviewData.existing_record.id);
        console.log('Update Payload:', JSON.stringify(savePreviewData.payload, null, 2));
        
        const { data, error } = await supabase
          .from('individual_label_templates')
          .update(savePreviewData.payload)
          .eq('id', savePreviewData.existing_record.id)
          .select();

        if (error) {
          console.error('❌ UPDATE Error:', error);
          throw error;
        }
        
        console.log('✅ UPDATE Success - Record Updated:', data);
        console.log('✅ Updated existing CSS customization for:', savePreviewData.product_info.name);
        
      } else {
        console.log('🆕 Executing INSERT...');
        console.log('Insert Payload:', JSON.stringify(savePreviewData.payload, null, 2));
        
        const { data, error } = await supabase
          .from('individual_label_templates')
          .insert(savePreviewData.payload)
          .select();

        if (error) {
          console.error('❌ INSERT Error:', error);
          throw error;
        }
        
        console.log('✅ INSERT Success - New Record Created:', data);
        console.log('✅ Created new CSS customization for:', savePreviewData.product_info.name);
      }

      // Update original CSS to reflect saved state
      setOriginalCss(cssContent);
      setShowSavePreview(false);
      setSavePreviewData(null);
      
      console.log('💾 Save operation completed successfully!');
      console.log('============================');
      
    } catch (error) {
      console.error('❌ SAVE OPERATION FAILED:', error);
      console.error('Error Details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        code: (error as any)?.code || 'N/A',
        details: (error as any)?.details || 'N/A',
        hint: (error as any)?.hint || 'N/A'
      });
      alert(`Failed to save template: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCssChange = (value: string | undefined) => {
    const newCss = value || '';
    setCssContent(newCss);
  };

  const resetCSS = () => {
    setCssContent(originalCss);
  };

  const hasUnsavedChanges = cssContent !== originalCss;

  const generateHtmlFromElements = (): string => {
    return elements.map(element => {
      switch (element.type) {
        case 'text':
          return `<div class="element-${element.id}" style="position: absolute; left: ${element.x}px; top: ${element.y}px; width: ${element.width}px; height: ${element.height}px;">${element.content}</div>`;
        case 'image':
          return `<img class="element-${element.id}" src="${element.content}" style="position: absolute; left: ${element.x}px; top: ${element.y}px; width: ${element.width}px; height: ${element.height}px;" />`;
        default:
          return '';
      }
    }).join('\n');
  };

  const generateCssFromElements = (): string => {
    return elements.map(element => {
      const styles = [];
      if (element.fontSize) styles.push(`font-size: ${element.fontSize}px`);
      if (element.fontWeight) styles.push(`font-weight: ${element.fontWeight}`);
      if (element.textAlign) styles.push(`text-align: ${element.textAlign}`);
      if (element.color) styles.push(`color: ${element.color}`);
      if (element.backgroundColor) styles.push(`background-color: ${element.backgroundColor}`);
      
      return `.element-${element.id} { ${styles.join('; ')}; }`;
    }).join('\n');
  };

  const addElement = (type: 'text' | 'image') => {
    const newElement: LabelElement = {
      id: `element-${Date.now()}`,
      type,
      content: type === 'text' ? 'New Text' : '/placeholder.png',
      x: 50,
      y: 50,
      width: type === 'text' ? 200 : 100,
      height: type === 'text' ? 30 : 100,
      fontSize: type === 'text' ? 14 : undefined,
      textAlign: type === 'text' ? 'left' : undefined,
      color: type === 'text' ? '#000000' : undefined
    };
    setElements([...elements, newElement]);
  };

  const updateElement = (id: string, updates: Partial<LabelElement>) => {
    setElements(elements.map(el => el.id === id ? { ...el, ...updates } : el));
  };

  const deleteElement = (id: string) => {
    setElements(elements.filter(el => el.id !== id));
    if (selectedElement?.id === id) {
      setSelectedElement(null);
    }
  };

  if (!selectedProduct) {
    return (
      <div className="container mx-auto p-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">Label Editor</h1>
            <p className="text-gray-600 mb-8">Select a product to start editing its label template</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Select Product
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select onValueChange={(value) => {
                const product = products.find(p => p.id === value);
                setSelectedProduct(product || null);
              }}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Search and select a product..." />
                </SelectTrigger>
                <SelectContent>
                  {products?.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  )) || []}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Label Editor</h1>
          <p className="text-gray-600">Editing: {selectedProduct.name}</p>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => setSelectedProduct(null)}
          >
            Change Product
          </Button>
          {hasUnsavedChanges && (
            <Badge variant="destructive" className="animate-pulse">
              Unsaved Changes
            </Badge>
          )}
          <Button 
            onClick={previewSaveChanges}
            disabled={saving || !hasUnsavedChanges}
            className={hasUnsavedChanges ? "bg-green-600 hover:bg-green-700" : ""}
            variant={hasUnsavedChanges ? "default" : "outline"}
          >
            {saving && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
            {hasUnsavedChanges ? "💾 Preview & Save Changes" : "✅ Saved"}
          </Button>
        </div>
      </div>

      {/* Template Size Selector */}
          <Card>
            <CardContent className="space-y-4">
              <div>
                <Label>Template Size</Label>
                <Select value={selectedTemplateSize} onValueChange={(value: '14x7' | '5x9') => setSelectedTemplateSize(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="14x7">14×7" (Landscape)</SelectItem>
                    <SelectItem value="5x9">5×9" (Portrait)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="pt-2">
                <Button 
                  variant={showCssEditor ? "default" : "outline"}
                  onClick={() => setShowCssEditor(!showCssEditor)}
                  className="w-full"
                >
                  <Palette className="h-4 w-4 mr-2" />
                  {showCssEditor ? 'Hide CSS Editor' : 'Open CSS Editor'}
                </Button>
              </div>
            </CardContent>
          </Card>

      {/* Full-Width Preview */}
      <div className="mb-6">
        <Card className="h-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">Live Preview</CardTitle>
                <Badge variant="secondary">{selectedTemplateSize}</Badge>
                {(loading || isGeneratingPreview) && <RefreshCw className="h-4 w-4 animate-spin" />}
              </div>
              <div className="text-sm text-gray-500">
                Full-width preview • CSS editing {showCssEditor ? 'enabled' : 'available'} below
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-6 bg-white min-h-[500px] flex items-center justify-center">
              {labelHtml ? (
                <iframe
                  srcDoc={labelHtml}
                  className="w-full h-full border-0 min-h-[450px] max-w-full"
                  title="Label Preview"
                />
              ) : previewHtml ? (
                <div
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                  className="transform-gpu"
                  style={{ 
                    transform: 'scale(0.8)',
                    transformOrigin: 'center'
                  }}
                />
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <div className="text-6xl text-gray-300 mb-4">🏷️</div>
                  <p>Loading label preview...</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section - CSS Editor (when enabled) */}
      {showCssEditor && (
        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  <CardTitle className="text-lg">CSS Editor</CardTitle>
                  <Badge variant="outline">Live Editing</Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCssChange(originalCss)}
                    disabled={!hasUnsavedChanges}
                  >
                    ↩️ Reset to Original
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCssEditor(false)}
                  >
                    Hide Editor
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[400px]">
                <Editor
                  height="100%"
                  defaultLanguage="css"
                  value={cssContent}
                  onChange={(value) => handleCssChange(value || '')}
                  theme="vs-light"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    wordWrap: 'on',
                    automaticLayout: true,
                    scrollBeyondLastLine: false,
                    folding: true,
                    lineNumbers: 'on'
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Save Preview Modal */}
      <Dialog open={showSavePreview} onOpenChange={setShowSavePreview}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Preview Save Changes</DialogTitle>
            <DialogDescription>
              Review the changes that will be saved to the database for {selectedProduct.name}
            </DialogDescription>
          </DialogHeader>
          
          {savePreviewData && (
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Operation Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-muted-foreground">Operation</Label>
                      <div className="font-mono font-medium">
                        {savePreviewData.operation === 'UPDATE' ? '📝 UPDATE' : '🆕 INSERT'}
                      </div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Table</Label>
                      <div className="font-mono">{savePreviewData.table}</div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Product</Label>
                      <div className="font-medium">{savePreviewData.product_info.name}</div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Template Size</Label>
                      <div>{savePreviewData.template_size}</div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">CSS Length</Label>
                      <div>{savePreviewData.css_length.toLocaleString()} characters</div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Has Changes</Label>
                      <div>{savePreviewData.has_changes ? '✅ Yes' : '❌ No'}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Database Payload</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted p-3 rounded-md">
                    <pre className="text-xs overflow-auto max-h-48">
{JSON.stringify(savePreviewData.payload, null, 2)}
                    </pre>
                  </div>
                </CardContent>
              </Card>

              {savePreviewData.existing_record && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Existing Record</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm space-y-2">
                      <div><strong>ID:</strong> {savePreviewData.existing_record.id}</div>
                      <div><strong>Current CSS Length:</strong> {savePreviewData.existing_record.css_overrides?.length || 0} characters</div>
                      <div><strong>Last Updated:</strong> {new Date(savePreviewData.existing_record.updated_at).toLocaleString()}</div>
                      <div><strong>Notes:</strong> {savePreviewData.existing_record.notes}</div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSavePreview(false)}>
              Cancel
            </Button>
            <Button 
              onClick={confirmSaveTemplate}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700"
            >
              {saving && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
              {saving ? 'Saving...' : 'Confirm Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
