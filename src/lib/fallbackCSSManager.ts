// Fallback Enhanced CSS Manager (File-based)
import { isEnhancedCSSEnabled, type LabelSizeKey } from '@/lib/enhancedCSSManager';
import { PRODUCTION_14X7_CSS, PRODUCTION_5X9_CSS } from '@/lib/productionCSSConstants';
import path from 'path';
import fs from 'fs';

// Default CSS templates as constants (fallback when database is not available)
const DEFAULT_TEMPLATES = {
  '14x7': `
/* SpecChem 14x7 Label Template CSS */
@page {
  size: 14in 7in;
  margin: 0;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: white;
  color: black;
  width: 14in;
  height: 7in;
  overflow: hidden;
  position: relative;
}

.label-container {
  width: 100%;
  height: 100%;
  padding: 0.5in;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: 3px solid #003366;
  position: relative;
}

/* Header Section */
.header-section {
  display: flex;
  align-items: center;
  margin-bottom: 0.3in;
  padding-bottom: 0.2in;
  border-bottom: 2px solid #003366;
}

.logo-container {
  width: 2in;
  height: 1in;
  margin-right: 0.3in;
}

.logo {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.title-container {
  flex: 1;
  text-align: center;
}

.product-title {
  font-size: 36px;
  font-weight: bold;
  color: #003366;
  text-transform: uppercase;
  letter-spacing: 2px;
  line-height: 1.1;
  margin: 0;
}

/* Content Section */
.content-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.field-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(3in, 1fr));
  gap: 0.2in;
  align-items: start;
}

.field-item {
  display: flex;
  flex-direction: column;
  margin-bottom: 0.15in;
}

.field-label {
  font-size: 14px;
  font-weight: bold;
  color: #666;
  text-transform: uppercase;
  margin-bottom: 0.05in;
}

.field-value {
  font-size: 16px;
  color: #000;
  font-weight: 500;
  word-break: break-word;
}

/* Footer Section */
.footer-section {
  margin-top: 0.2in;
  padding-top: 0.2in;
  border-top: 1px solid #ccc;
  text-align: center;
}

.brand-info {
  font-size: 14px;
  color: #666;
}

.company-name {
  font-weight: bold;
  color: #003366;
}

.separator {
  margin: 0 0.2in;
  color: #999;
}

.website {
  color: #0066cc;
}

/* Print Styles */
@media print {
  body {
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }
  
  .label-container {
    page-break-inside: avoid;
  }
}
`,

  '5x9': `
/* SpecChem 5x9 Label Template CSS */
@page {
  size: 5in 9in;
  margin: 0;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: white;
  color: black;
  width: 5in;
  height: 9in;
  overflow: hidden;
  position: relative;
}

.label-container {
  width: 100%;
  height: 100%;
  padding: 0.3in;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: 2px solid #003366;
  position: relative;
}

/* Header Section */
.header-section {
  text-align: center;
  margin-bottom: 0.3in;
  padding-bottom: 0.2in;
  border-bottom: 2px solid #003366;
}

.logo-container {
  width: 1.5in;
  height: 0.8in;
  margin: 0 auto 0.2in;
}

.logo {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.title-container {
  text-align: center;
}

.product-title {
  font-size: 24px;
  font-weight: bold;
  color: #003366;
  text-transform: uppercase;
  letter-spacing: 1px;
  line-height: 1.1;
  margin: 0;
}

/* Content Section */
.content-section {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.field-list {
  display: flex;
  flex-direction: column;
  gap: 0.15in;
}

.field-row {
  display: flex;
  flex-direction: column;
  margin-bottom: 0.1in;
}

.field-label {
  font-size: 12px;
  font-weight: bold;
  color: #666;
  text-transform: uppercase;
  margin-bottom: 0.05in;
}

.field-value {
  font-size: 14px;
  color: #000;
  font-weight: 500;
  word-break: break-word;
  line-height: 1.2;
}

/* Footer Section */
.footer-section {
  margin-top: 0.2in;
  padding-top: 0.2in;
  border-top: 1px solid #ccc;
  text-align: center;
}

.brand-info {
  font-size: 12px;
  color: #666;
}

.company-name {
  font-weight: bold;
  color: #003366;
}

/* Print Styles */
@media print {
  body {
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }
  
  .label-container {
    page-break-inside: avoid;
  }
}
`
} as const;

// Category-specific overrides
const CATEGORY_OVERRIDES = {
  'Decorative & Protective Sealers': {
    '14x7': `
/* Sealers Category Overrides */
.label-container {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  border-color: #1976d2;
}

.product-title {
  color: #1976d2;
}

.field-label {
  color: #1565c0;
}
    `,
    '5x9': `
/* Sealers Category Overrides for 5x9 */
.label-container {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  border-color: #1976d2;
}

.product-title {
  color: #1976d2;
}

.field-label {
  color: #1565c0;
}
    `
  },
  'Water Repellents': {
    '14x7': `
/* Water Repellents Category Overrides */
.label-container {
  background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%);
  border-color: #2e7d32;
}

.product-title {
  color: #2e7d32;
}

.field-label {
  color: #1b5e20;
}
    `,
    '5x9': `
/* Water Repellents Category Overrides for 5x9 */
.label-container {
  background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%);
  border-color: #2e7d32;
}

.product-title {
  color: #2e7d32;
}

.field-label {
  color: #1b5e20;
}
    `
  },
  'Cleaners & Strippers': {
    '14x7': `
/* Cleaners Category Overrides */
.label-container {
  background: linear-gradient(135deg, #fff3e0 0%, #ffcc80 100%);
  border-color: #ef6c00;
}

.product-title {
  color: #ef6c00;
}

.field-label {
  color: #e65100;
}
    `,
    '5x9': `
/* Cleaners Category Overrides for 5x9 */
.label-container {
  background: linear-gradient(135deg, #fff3e0 0%, #ffcc80 100%);
  border-color: #ef6c00;
}

.product-title {
  color: #ef6c00;
}

.field-label {
  color: #e65100;
}
    `
  }
} as const;

/**
 * Fallback Enhanced CSS Manager using in-memory templates
 */
export class FallbackLabelCSSCompiler {
  /**
   * Get compiled CSS for a product with category-based styling
   */
  async getCompiledCSS(productId: string, labelSize: LabelSizeKey, category?: string): Promise<string> {
    try {
      // Start with base template
      let css = DEFAULT_TEMPLATES[labelSize] || DEFAULT_TEMPLATES['14x7'];
      
      // Apply category override if available and category is provided
      if (category) {
        console.log('Looking for category override for:', category);
        
        // Check for exact match first
        let categoryOverride = CATEGORY_OVERRIDES[category as keyof typeof CATEGORY_OVERRIDES];
        
        // If no exact match, try partial matches
        if (!categoryOverride) {
          for (const [key, override] of Object.entries(CATEGORY_OVERRIDES)) {
            if (category.includes(key) || key.includes(category)) {
              console.log('Found partial match:', key);
              categoryOverride = override;
              break;
            }
          }
        }
        
        if (categoryOverride && categoryOverride[labelSize]) {
          console.log('Applying category override for', category);
          css = css + '\n\n' + categoryOverride[labelSize];
        } else {
          console.log('No category override found for', category);
        }
      }
      
      return css;
    } catch (error) {
      console.error('Error getting fallback CSS:', error);
      return DEFAULT_TEMPLATES[labelSize] || DEFAULT_TEMPLATES['14x7'];
    }
  }
}

/**
 * Enhanced CSS utility functions with fallback
 */
export async function getFallbackCSS(productId: string, labelSize: LabelSizeKey, category?: string): Promise<string> {
  const compiler = new FallbackLabelCSSCompiler();
  return await compiler.getCompiledCSS(productId, labelSize, category);
}

/**
 * Enhanced CSS getter that uses fallback templates directly
 */
export async function getEnhancedCSSWithFallback(productId: string, labelSize: LabelSizeKey, category?: string): Promise<string> {
  if (!isEnhancedCSSEnabled()) {
    return '';
  }
  
  try {
    // First try to use the Enhanced CSS Manager for product-specific overrides
    const { LabelCSSCompiler } = await import('@/lib/enhancedCSSManager');
    const compiler = new LabelCSSCompiler();
    const compiledCSS = await compiler.getCompiledCSS(productId, labelSize);
    
    if (compiledCSS && compiledCSS !== '/* Template CSS not found */') {
      console.log('Using Enhanced CSS system for product', productId, 'with size:', labelSize);
      return compiledCSS;
    }
  } catch (error) {
    console.error('Enhanced CSS Manager failed, falling back to production CSS:', error);
  }
  
  // Fallback to production CSS if Enhanced CSS system fails
  console.log('Using production CSS fallback for', labelSize, 'with category:', category);
  return labelSize === '14x7' ? PRODUCTION_14X7_CSS : PRODUCTION_5X9_CSS;
}
