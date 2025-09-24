'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SearchableSelect, SearchableSelectOption } from '@/components/ui/searchable-select';
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
  const [showCssEditor, setShowCssEditor] = useState(true); // Open by default
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
      const templateSlug = selectedTemplateSize === '14x7' ? '14x7-enhanced' : '5x9-compact';
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
    if (!selectedProduct || !template) return;

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
      
      // Create the merged CSS (base template + custom overrides)
      let mergedCss = template.css_template;
      
      if (cssContent && cssContent !== originalCss) {
        // Add custom CSS overrides to the base template CSS
        mergedCss = `${template.css_template}\n\n/* INDIVIDUAL CUSTOMIZATIONS */\n${cssContent}`;
      }
      
      // Replace the CSS in the HTML with our merged CSS
      const finalHtml = productionHtml.replace(
        /<style[^>]*>[\s\S]*?<\/style>/i,
        `<style>${mergedCss}</style>`
      );
      
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
      return `/* 🎯 FREQUENTLY ADJUSTED: Product name size for fitting different product names */
.center-content .product-name {
    font-family: 'Montserrat', Arial, sans-serif;
    font-size: 24px; /* Adjust this value to fit product names */
    font-weight: 700;
    color: #21325b;
    letter-spacing: 0.01em;
    margin: 0 0 2px 0;
    line-height: 1.1;
}

/* 🎯 FREQUENTLY ADJUSTED: Column text sizes for content volume */
.left-columns p,
.left-columns ul,
.left-columns li {
    font-size: 6.2px; /* Increase for readability, decrease for more content */
    color: inherit;
    font-family: 'Montserrat', 'Open Sans', Arial, sans-serif;
    margin: 0 0 3px 0;
}

.right-columns p,
.right-columns ul,
.right-columns li,
.right-columns .statement-list {
    font-size: 4px; /* Increase for readability, decrease for more content */
    color: inherit;
    font-family: 'Open Sans', Arial, sans-serif;
    margin: 0 0 1.4px 0;
    list-style: none;
    padding-left: 0;
}

/* 🎯 FREQUENTLY ADJUSTED: Column header sizes */
.left-columns h4 {
    font-family: 'Montserrat', 'Open Sans', Arial, sans-serif;
    font-size: 8.8px; /* Adjust for header prominence */
    color: #1e3369;
    text-transform: uppercase;
    font-weight: 700;
    margin-bottom: 0.5px;
    margin-top: 11px;
    letter-spacing: 0.07em;
    padding-left: 5px; 
}

.right-columns h4 {
    font-family: 'Montserrat', Arial, sans-serif;
    font-size: 6.3px; /* Adjust for header prominence */
    color: #233066;
    text-transform: uppercase;
    font-weight: 700;
    margin-bottom: 0.5px;
    margin-top: 4px;
    letter-spacing: 0.04em;
}

/* 🎯 FREQUENTLY ADJUSTED: Column layout positioning */
.columns-container {
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    width: 100%;
    height: 100%;
    padding: 0.33in 0.36in 0.11in 0.36in; /* Adjust padding for content fitting */
    box-sizing: border-box;
    z-index: 2;
}

/* 🎯 FREQUENTLY ADJUSTED: Product descriptions */
.short-description-english {
    font-family: 'Montserrat', Arial, sans-serif;
    font-size: 12px; /* Adjust for description length */
    font-weight: 600;
    color: #2453a6;
    margin: 0 0 1.7px 0;
    letter-spacing: 0.01em;
}

.translated-short-description {
    font-size: 8px; /* Match or adjust relative to English description */
    font-family: 'Open Sans', Arial, sans-serif;
    color: #395073;
    font-weight: 500;
    margin: 0 0 1.3px 0;
}

/* ==========================================================================
   📐 LAYOUT STRUCTURE - Occasionally adjusted
   ========================================================================== */

/* Label Container and Page Setup */
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
/* Watermark Element */
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

/* Column Layout Structure */
.left-columns,
.right-columns {
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

/* Center Content Layout */
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

/* Special Elements */
.contact-block {
    font-size: 4px;
    line-height: 1.25;
    margin-bottom: 2px;
    color: #1a2340;
    font-family: 'Open Sans', Arial, sans-serif;
    word-break: break-word;
}

.left-columns ul {
    padding-left: 12px;
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

/* Typography Components */
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

.product-name-badge-wrap {
    display: flex;
    align-items: baseline;
    justify-content: center;
    gap: 7px;
}

.product-name-badge-wrap img {
    width: 30px;
    height: 30px;
    margin-top: 2px;
}

.eco-badge {
    margin-top: -10px;
    vertical-align: baseline;
}

/* ==========================================================================
   🖼️ VISUAL ELEMENTS - Moderately adjusted
   ========================================================================== */

/* Logo and Branding */
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

/* Center Content Additional Elements */
.center-bottom-content {
    display: flex;
    flex-direction: row;
    gap: 8px;
    justify-content: space-between;
    align-items: center;
    margin-top: 17px;
    width: 100%;
}

/* Pictograms */
.pictograms {
    display: flex;
    gap: 4px;
    align-items: center;
    margin: 0 0 3px 0;
}

.pictograms img {
    width: 13px;
    height: 13px;
    object-fit: contain;
    border-radius: 3px;
    border: 1px solid #e3e8f1;
    background: #f7fafc;
}

/* Bottom Elements - Corner Icons and Bars */
.label-bottom-bar {
    position: absolute;
    left: .1in;
    bottom: .3in;
    width: 100%;
    display: flex;
    align-items: flex-end;
    z-index: 15;
    height: 88px;
}

.corner-icon-danger {
    width: 100px;
    height: 60px;
    object-fit: contain;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 2px 6px #22316622;
    padding: 4px;
    margin-left: 4px;
}

.corner-icon {
    width: 60px;
    height: 60px;
    object-fit: contain;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 2px 6px #22316622;
    padding: 4px;
    margin-left: 13px;
}

/* Bottom Elements - Code Row */
.code-row {
    position: absolute;
    left: 50%;
    bottom: 0.53in;
    transform: translateX(-50%);
    width: auto;
    z-index: 20;
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    justify-content: center;
    gap: 35px;
}

.code-info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    font-size: 13px;
    color: #1b2754;
    font-family: 'Open Sans', Arial, sans-serif;
    gap: 4px;
    min-width: 175px;
}

.batch-info-column {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.batch-field,
.package-size,
.use-by {
    text-align: left;
    margin-left: 0;
    font-size: 13px;
    color: #1b2754;
    font-family: 'Open Sans', Arial, sans-serif;
}

.batch-field label {
    display: inline-block;
    min-width: 74px;
    padding: 0;
    margin: 0;
}

.batch-field input {
    width: 84px;
    font-size: 13px;
    border: none;
    border-bottom: 1.5px solid #223166;
    background: #f3f7ff;
    outline: none;
    padding: 2px 3px;
    border-radius: 2.5px 2.5px 0 0;
    margin-left: 0;
    vertical-align: middle;
}

.qr-code {
    width: 38px;
    height: 38px;
    flex-shrink: 0;
    filter: drop-shadow(0 2px 4px #25408014);
}

.green-conscious-icon {
    width: 38px;
    position: absolute;
    right: -15%;
    top: 50%;
    transform: translateY(-50%);
}

/* ==========================================================================
   📋 LEGAL & COMPLIANCE SECTIONS - Occasionally adjusted
   ========================================================================== */

/* Manufacturing and Safety Notices */
.manufacturing-safety-notices {
    margin-top: 4px;
}

.manufacturing-safety-notices .rc-section {
    margin-bottom: 2px;
}

.manufacturing-safety-notices .rc-section h4 {
    font-size: 5px;
    margin-bottom: 0.5px;
    margin-top: 2px;
}

.manufacturing-safety-notices .rc-section p {
    font-size: 3.5px;
    line-height: 1.1;
    margin: 0 0 1px 0;
    font-weight: 500;
}

.manufacturing-notice {
    color: #1a5b2e !important;
    font-weight: 600 !important;
}

.safety-notice {
    font-weight: 600 !important;
}

/* Manufacturing Footer */
.manufacturing-footer {
    position: absolute;
    bottom: 0.02in;
    left: 50%;
    transform: translateX(-50%);
    z-index: 25;
    text-align: center;
}

.manufacturing-footer .manufacturing-notice {
    font-size: 6px;
    font-family: 'Lato', Arial, sans-serif;
    color: #1a5b2e;
    font-weight: 600;
    margin: 0;
}

/* Warranty Conditions Right Column */
.warranty-conditions-right {
    margin-top: 4px;
}

.warranty-conditions-right .rc-section {
    margin-bottom: 2px;
}

.warranty-conditions-right .rc-section h4 {
    font-size: 5px;
    margin-bottom: 0.5px;
    margin-top: 2px;
}

.warranty-conditions-right .rc-section p {
    font-size: 3.2px;
    line-height: 1.1;
    margin: 0 0 1px 0;
}

/* ==========================================================================
   ⚙️ FOUNDATION STYLES - Rarely modified
   ========================================================================== */

/* ⚠️ CRITICAL: Font imports - Do not modify */
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700&family=Open+Sans:wght@400;600&family=Lato:wght@400;700&display=swap');

/* ⚠️ CRITICAL: Page setup - Do not modify print dimensions */
@page {
    size: 9in 5in;
    margin: 0;
}

/* Base Body Styles */
body {
    margin: 0;
    padding: 0;
    background: #e7eaf0;
    font-family: 'Open Sans', Arial, sans-serif;
}

/* ⚠️ CRITICAL: Print styles - Do not modify */
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
      return `/* 🎯 FREQUENTLY ADJUSTED: Product name size for fitting different product names */
.center-content .product-name {
    font-family: 'Verdana', Arial, sans-serif;
    font-size: 54px; /* Adjust this value to fit product names */
    font-weight: 700;
    color: #013A81;
    letter-spacing: 0.03em;
    margin: 0 0 2px 0;
    line-height: 1.1;
}

/* 🎯 FREQUENTLY ADJUSTED: Column text sizes for content volume */
.left-columns p,
.left-columns ul,
.left-columns li {
    font-size: 8px; /* Increase for readability, decrease for more content */
    color: inherit;
    font-family: 'Open Sans', Arial, sans-serif;
    margin: 0 0 3px 0;
}

.right-columns p,
.right-columns ul,
.right-columns li {
    font-size: 7px; /* Increase for readability, decrease for more content */
    color: inherit;
    font-family: 'Open Sans', Arial, sans-serif;
    margin: 0 0 2px 0;
}

/* 🎯 FREQUENTLY ADJUSTED: Column header sizes */
.left-columns h4,
.right-columns h4 {
    font-family: 'Montserrat', Arial, sans-serif;
    font-size: 11px; /* Adjust for header prominence */
    color: #233066;
    text-transform: uppercase;
    font-weight: 700;
    margin-bottom: 2px;
    letter-spacing: 0.06em;
    margin-top: 5px;
    break-after: avoid;
    page-break-after: avoid;
}

/* 🎯 FREQUENTLY ADJUSTED: Column layout positioning */
.columns-container {
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex: 1 1 0;
    width: 100%;
    height: 100%;
    padding: 0.60in 0.68in 0.24in 0.68in; /* Adjust padding for content fitting */
    box-sizing: border-box;
    z-index: 2;
    margin-top: .6in;
}

/* 🎯 FREQUENTLY ADJUSTED: Product descriptions */
.short-description-english {
    font-family: 'Lato', Arial, sans-serif;
    font-size: 12px; /* Adjust for description length */
    font-weight: 700;
    color: #013A81;
    margin: 0 0 2px 0;
    letter-spacing: 0.02em;
}

.translated-short-description {
    font-size: 12px; /* Match or adjust relative to English description */
    font-family: 'Lato', Arial, sans-serif;
    color: #013A81;
    font-weight: 400;
    margin: 0 0 2px 0;
}

/* ==========================================================================
   📐 LAYOUT STRUCTURE - Occasionally adjusted
   ========================================================================== */

/* Label Container and Page Setup */
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
/* Column Layout Structure */
.left-columns,
.right-columns { 
    width: 31.5%;
    min-width: 320px;
    max-width: 35%;
    line-height: 1.22;
    column-count: 2;
    column-gap: 0.25in;
    z-index: 10;
}

.left-columns li,
.right-columns li,
.left-columns ul,
.right-columns ul {
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

/* Center Content Layout */
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
/* Special Elements */
.rc-statement {
    font-size: 7px;
    color: inherit;
    font-family: 'Open Sans', Arial, sans-serif;
    margin: 0 0 3px 0;
}

.right-columns ul,
.right-columns .statement-list {
    list-style: none;
    padding-left: 0;
    margin-left: 0;
    margin-bottom: 2px;
    font-size: 7px;
    color: inherit;
    font-family: 'Open Sans', Arial, sans-serif;
    line-height: 1.16;
}

.right-columns li,
.right-columns .statement-list li {
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

/* Typography Components */
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
/* ==========================================================================
   🖼️ VISUAL ELEMENTS - Moderately adjusted
   ========================================================================== */

/* Logo and Branding */
.logo-container img {
    height: .85in;
    width: auto;
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

/* Bottom Elements - Code Row */
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
    flex-direction: row;
    align-items: center !important;
    min-width: 200px;
    font-size: 13px;
    color: #1b2754;
    font-family: 'Open Sans', Arial, sans-serif;
    gap: 15px;
    z-index: 2;
}

.qr-code {
    width: 72px;
    height: 72px;
    flex-shrink: 0;
}

.batch-info-column {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.batch-field {
    font-size: 13px;
    font-family: 'Open Sans', Arial, sans-serif;
    color: #233066;
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 3px;
}

.batch-field label {
    display: inline-block !important;
    min-width: 105px !important;
    padding: 0 !important;
    margin: 0 !important;
}

.package-size,
.use-by {
    font-size: 12px;
    margin-bottom: 2px;
    color: #1b2754;
    text-align: left !important;
    margin-left: 0 !important;
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

.green-conscious-icon {
    position: absolute;
    right: 20%;
    top: 50%;
    transform: translateY(-50%);
    width: 72px;
}
/* ==========================================================================
   📋 LEGAL & COMPLIANCE SECTIONS - Occasionally adjusted
   ========================================================================== */

/* Warranty and Conditions Footer */
.warranty-conditions-footer {
    position: absolute;
    bottom: 0.15in;
    left: 0.5in;
    right: 0.5in;
    z-index: 15;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 4px;
    padding: 6px 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.warranty-section {
    font-size: 5px;
    line-height: 1.2;
    color: #2c3e50;
    font-family: 'Open Sans', Arial, sans-serif;
    margin-bottom: 3px;
}

.warranty-section:last-child {
    margin-bottom: 0;
}

.warranty-section .section-title {
    font-weight: 600;
    color: #1a252f;
    margin-right: 3px;
}

/* Warranty Conditions Right Column */
.warranty-conditions-right {
    margin-top: 8px;
}

.warranty-conditions-right .rc-section {
    margin-bottom: 4px;
}

.warranty-conditions-right .rc-section h4 {
    font-size: 9px;
    margin-bottom: 1px;
    margin-top: 3px;
}

.warranty-conditions-right .rc-section p {
    font-size: 6px;
    line-height: 1.15;
    margin: 0 0 2px 0;
}

/* Manufacturing and Safety Notices */
.manufacturing-safety-notices {
    margin-top: 8px;
}

.manufacturing-safety-notices .rc-section {
    margin-bottom: 4px;
}

.manufacturing-safety-notices .rc-section h4 {
    font-size: 9px;
    margin-bottom: 1px;
    margin-top: 3px;
}

.manufacturing-safety-notices .rc-section p {
    font-size: 6.5px;
    line-height: 1.2;
    margin: 0 0 2px 0;
    font-weight: 500;
}

.manufacturing-notice {
    color: #1a5b2e !important;
    font-weight: 600 !important;
}

.safety-notice {
    font-weight: 600 !important;
}

/* ==========================================================================
   ⚙️ FOUNDATION STYLES - Rarely modified
   ========================================================================== */

/* ⚠️ CRITICAL: Font imports - Do not modify */
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700&family=Open+Sans:wght@400;600&family=Lato:wght@400;700&display=swap');

/* ⚠️ CRITICAL: Page setup - Do not modify print dimensions */
@page {
    size: 14.875in 7.625in;
    margin: 0;
}

/* Font Size Utility Classes */
#Font6 p, #Font6 ul, #Font6 li { font-size: 6px !important; }
#Font6-5 p, #Font6-5 ul, #Font6-5 li { font-size: 6.5px !important; }
#Font7 p, #Font7 ul, #Font7 li { font-size: 7px !important; }
#Font8 p, #Font8 ul, #Font8 li { font-size: 8px !important; }
#Font9 p, #Font9 ul, #Font9 li { font-size: 9px !important; }
#Font10 p, #Font10 ul, #Font10 li { font-size: 9px !important; }
#Font11 p, #Font11 ul, #Font11 li { font-size: 9.5px !important; }

/* Base Body Styles */
body {
    margin: 0;
    padding: 0;
    background: #e7eaf0;
    font-family: 'Open Sans', Arial, sans-serif;
}

/* ⚠️ CRITICAL: Print styles - Do not modify */
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
          template_id: template?.id || null,
          css_overrides: cssContent,
          notes: `CSS customization for ${selectedProduct.name} - ${selectedTemplateSize} label - Updated ${new Date().toISOString()}`,
          updated_at: new Date().toISOString()
        } : {
          product_id: selectedProduct.id,
          template_id: template?.id || null,
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

  // Create options for the searchable select
  const productOptions: SearchableSelectOption[] = products.map(product => ({
    value: product.id,
    label: product.name,
    subtitle: product.short_description_english || undefined
  }));

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
      <div className="h-screen flex flex-col">
        {/* Compact Header */}
        <div className="border-b bg-white px-6 py-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div>
              <h1 className="text-xl font-semibold">Label Editor</h1>
              <p className="text-sm text-gray-600">Select a product to start editing</p>
            </div>
          </div>
        </div>

        {/* Center Selection */}
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Select Product
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SearchableSelect
                options={productOptions}
                value={undefined}
                onValueChange={(value) => {
                  const product = products.find(p => p.id === value);
                  setSelectedProduct(product || null);
                }}
                placeholder="Search products..."
                className="w-full"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Compact Top Bar */}
      <div className="border-b bg-white px-6 py-3 flex-shrink-0">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Left: Product Search & Size Selector */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold">Label Editor</h1>
              <div className="w-px h-6 bg-gray-300"></div>
            </div>
            
            <div className="flex items-center gap-3">
              <SearchableSelect
                options={productOptions}
                value={selectedProduct ? selectedProduct.id : undefined}
                onValueChange={(value) => {
                  const product = products.find(p => p.id === value);
                  setSelectedProduct(product || null);
                }}
                placeholder="Search products..."
                className="w-80"
              />
              
              <Select value={selectedTemplateSize} onValueChange={(value: '14x7' | '5x9') => setSelectedTemplateSize(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="14x7">14×7"</SelectItem>
                  <SelectItem value="5x9">5×9"</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Right: Status & Actions */}
          <div className="flex items-center gap-3">
            {(loading || isGeneratingPreview) && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Updating...
              </div>
            )}
            
            {hasUnsavedChanges && (
              <Badge variant="destructive" className="animate-pulse">
                Unsaved Changes
              </Badge>
            )}
            
            <Button 
              onClick={previewSaveChanges}
              disabled={saving || !hasUnsavedChanges}
              size="sm"
              className={hasUnsavedChanges ? "bg-green-600 hover:bg-green-700" : ""}
              variant={hasUnsavedChanges ? "default" : "outline"}
            >
              {saving && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
              {hasUnsavedChanges ? "Save Changes" : "✅ Saved"}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area - Full Width Label */}
      <div className="flex-1 bg-gray-50 overflow-auto">
        <div className="p-6">
          <div className="bg-white rounded-lg shadow-sm border min-h-[500px] flex items-center justify-center">
            {labelHtml ? (
              <iframe
                srcDoc={labelHtml}
                className="w-full h-full border-0 min-h-[500px]"
                title="Label Preview"
              />
            ) : previewHtml ? (
              <div
                dangerouslySetInnerHTML={{ __html: previewHtml }}
                className="transform-gpu"
                style={{ 
                  transform: selectedTemplateSize === '14x7' ? 'scale(0.8)' : 'scale(0.9)',
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
        </div>
      </div>

      {/* CSS Editor - Full Width Below Label */}
      <div className="h-[400px] border-t bg-white flex flex-col">
        {/* CSS Editor Header */}
        <div className="border-b px-6 py-3 flex-shrink-0">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              <h3 className="font-medium">CSS Editor</h3>
              <Badge variant="outline" className="text-xs">Live</Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCssChange(originalCss)}
              disabled={!hasUnsavedChanges}
            >
              Reset
            </Button>
          </div>
        </div>
        
        {/* CSS Editor Content */}
        <div className="flex-1">
          <Editor
            height="100%"
            defaultLanguage="css"
            value={cssContent}
            onChange={(value) => handleCssChange(value || '')}
            theme="vs-light"
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              wordWrap: 'on',
              automaticLayout: true,
              scrollBeyondLastLine: false,
              folding: true,
              lineNumbers: 'on',
              padding: { top: 16, bottom: 16 }
            }}
          />
        </div>
      </div>

      {/* Save Preview Modal */}
      <Dialog open={showSavePreview} onOpenChange={setShowSavePreview}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Save className="h-5 w-5" />
              Save CSS Customization
            </DialogTitle>
            <DialogDescription>
              Save custom CSS styling for <strong>{selectedProduct?.name}</strong>
            </DialogDescription>
          </DialogHeader>
          
          {savePreviewData && (
            <div className="space-y-4 py-4">
              {/* Operation Summary */}
              <div className="bg-slate-50 p-4 rounded-lg border">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-sm">
                    {savePreviewData.operation === 'UPDATE' ? 'Update Existing Customization' : 'Create New Customization'}
                  </h4>
                  <Badge variant={savePreviewData.operation === 'UPDATE' ? 'default' : 'secondary'}>
                    {savePreviewData.operation}
                  </Badge>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Product:</span>
                    <span className="font-medium">{savePreviewData.product_info.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Label Size:</span>
                    <span>{savePreviewData.template_size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">CSS Length:</span>
                    <span>{savePreviewData.css_length.toLocaleString()} characters</span>
                  </div>
                  {savePreviewData.existing_record && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Updated:</span>
                      <span>{new Date(savePreviewData.existing_record.updated_at).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Warning if no changes */}
              {!savePreviewData.has_changes && (
                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-yellow-800">
                    <span className="text-sm font-medium">⚠️ No changes detected</span>
                  </div>
                  <p className="text-xs text-yellow-700 mt-1">
                    The CSS content appears to be the same as before.
                  </p>
                </div>
              )}

              {/* Success indicator if changes exist */}
              {savePreviewData.has_changes && (
                <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-green-800">
                    <span className="text-sm font-medium">✅ Ready to save</span>
                  </div>
                  <p className="text-xs text-green-700 mt-1">
                    Your CSS customization will {savePreviewData.operation === 'UPDATE' ? 'update the existing' : 'create a new'} template.
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowSavePreview(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmSaveTemplate}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {saving ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {savePreviewData?.operation === 'UPDATE' ? 'Update Template' : 'Create Template'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
