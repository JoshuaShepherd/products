# Label Template System Guide: Dynamic Product Label Generation

## Table of Contents
1. [Overview](#overview)
2. [Template System Architecture](#template-system-architecture)
3. [Template Syntax Breakdown](#template-syntax-breakdown)
4. [Database Field Mapping](#database-field-mapping)
5. [Template Processing Flow](#template-processing-flow)
6. [Multi-Language Support](#multi-language-support)
7. [Conditional Rendering Logic](#conditional-rendering-logic)

## Overview

Your label templating system is a sophisticated mail-merge solution for generating printable chemical product labels. It combines HTML templates with product data from your Supabase database to create compliance-ready labels in multiple formats (14x7 and 5x9 inches).

## Template System Architecture

### Database Tables Involved
- **`label_templates`** - Stores HTML and CSS template definitions
- **`products`** - Contains all product data (names, descriptions, safety info, etc.)
- **`product_pictograms`** - Links products to safety pictograms
- **`pictograms`** - Safety pictogram images and metadata
- **`product_labels`** (optional) - Stores generated HTML for caching

### Processing Pipeline
1. **Template Selection**: Based on size parameter (14x7 or 5x9)
2. **Data Retrieval**: Fetch product data and related pictograms
3. **Variable Substitution**: Replace template placeholders with actual data
4. **Conditional Processing**: Show/hide sections based on available data
5. **HTML Generation**: Return ready-to-render HTML with embedded CSS

## Template Syntax Breakdown

### 14x7 Large Format Template

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <title>{{product_name}} | SpecChem</title>
    <style>{{css_styles}}</style>
</head>
  <body>
    <div class="label-container">
    <div class="columns-container">
      <!-- Left Columns -->
      <div class="left-columns" id="Font6">
        {{#if description}}<div class="lc-section"><h4>Description</h4><p>{{description}}</p></div>{{/if}}
        {{#if voc_data}}<div class="lc-section"><h4>VOC Data</h4><p>{{voc_data}}</p></div>{{/if}}
        {{#if application}}<div class="lc-section"><h4>Application</h4><p>{{application}}</p></div>{{/if}}
        {{#if features}}<div class="lc-section"><h4>Features</h4><p>{{features}}</p></div>{{/if}}
        {{#if limitations}}<div class="lc-section"><h4>Limitations</h4><p>{{limitations}}</p></div>{{/if}}
        {{#if shelf_life}}<div class="lc-section"><h4>Shelf Life</h4><p>{{shelf_life}}</p></div>{{/if}}
      </div>
      <!-- Center Content -->
      <div class="center-content">
        <div class="product-name">{{name}}</div>
        {{#if short_description_english}}<div class="short-description-english">{{short_description_english}}</div>{{/if}}
        {{#if short_description_french}}<div class="translated-short-description">{{short_description_french}}</div>{{/if}}
        {{#if short_description_spanish}}<div class="translated-short-description">{{short_description_spanish}}</div>{{/if}}
        {{#if subtitle_1}}<div class="subtitle">{{subtitle_1}}</div>{{/if}}
        {{#if subtitle_2}}<div class="subtitle subtitle-2">{{subtitle_2}}</div>{{/if}}
        <div class="logo-container">
<img src="https://firebasestorage.googleapis.com/v0/b/specchem-pwa-feb-25.firebasestorage.app/o/branding%2Flogo-transparent.webp?alt=media&token=0b494edd-5a0a-4f37-8227-8e88356881f8" alt="SpecChem Logo">
</div>
      </div>
      <!-- Right Columns -->
      <div class="right-columns" id="Font6">
        {{#if pictograms}}<div class="rc-section"><h4>Pictograms</h4><div class="pictograms" style="display: flex; gap: 7px; align-items: center; margin: 0 0 7px 0;">{{pictograms}}</div></div>{{/if}}
        {{#if components_determining_hazard}}<div class="rc-section"><h4>Components Determining Hazard{{#if composants_determinant_le_danger}} / Français{{/if}}</h4><p>{{components_determining_hazard}}</p>{{#if composants_determinant_le_danger}}<p>{{composants_determinant_le_danger}}</p>{{/if}}</div>{{/if}}
        {{#if signal_word}}<div class="rc-section"><h4>Signal Word{{#if mot_de_signalement}} / Français{{/if}}</h4><p>{{signal_word}}</p>{{#if mot_de_signalement}}<p>{{mot_de_signalement}}</p>{{/if}}</div>{{/if}}
        {{#if hazard_statements}}<div class="rc-section"><h4>Hazard Statements{{#if mentions_de_danger}} / Français{{/if}}</h4><p>{{hazard_statements}}</p>{{#if mentions_de_danger}}<p>{{mentions_de_danger}}</p>{{/if}}</div>{{/if}}
        {{#if precautionary_statements}}<div class="rc-section"><h4>Precautionary Statements{{#if conseils_de_prudence}} / Français{{/if}}</h4><p>{{precautionary_statements}}</p>{{#if conseils_de_prudence}}<p>{{conseils_de_prudence}}</p>{{/if}}</div>{{/if}}
        {{#if response_statements}}<div class="rc-section"><h4>Response Statements{{#if premiers_soins}} / Français{{/if}}</h4><p>{{response_statements}}</p>{{#if premiers_soins}}<p>{{premiers_soins}}</p>{{/if}}</div>{{/if}}
        {{#if storage}}<div class="rc-section"><h4>Storage{{#if consignes_de_stockage}} / Français{{/if}}</h4><p>{{storage}}</p>{{#if consignes_de_stockage}}<p>{{consignes_de_stockage}}</p>{{/if}}</div>{{/if}}
        {{#if disposal}}<div class="rc-section"><h4>Disposal{{#if consignes_delimination}} / Français{{/if}}</h4><p>{{disposal}}</p>{{#if consignes_delimination}}<p>{{consignes_delimination}}</p>{{/if}}</div>{{/if}}
        {{#if proper_shipping_name}}<div class="rc-section"><h4>Transport</h4><p><b>Proper Shipping Name:</b> {{proper_shipping_name}}</p>{{#if un_number}}<p><b>UN Number:</b> {{un_number}}</p>{{/if}}{{#if hazard_class}}<p><b>Hazard Class:</b> {{hazard_class}}</p>{{/if}}{{#if packing_group}}<p><b>Packing Group:</b> {{packing_group}}</p>{{/if}}{{#if emergency_response_guide}}<p><b>N.A. Emergency Response Guidebook #:</b> {{emergency_response_guide}}</p>{{/if}}</div>{{/if}}
      </div>
    </div>
    {{#if corner_icons}}<div class="corner-icons">{{corner_icons}}</div>{{/if}}
    <div class="code-row">
      <img src="https://firebasestorage.googleapis.com/v0/b/specchem-pwa-feb-25.firebasestorage.app/o/pictograms%2Fproduct-qr.png?alt=media&token=c832e9c2-525d-4dbf-984d-f8f249acf86e" class="qr-code" alt="QR Code" />
      <div class="code-info">
<div class="batch-field"><label style="display:inline-block; min-width:105px;">Batch No:</label></div>
{{#if package_size}}<div class="package-size">{{package_size}}</div>{{/if}}
{{#if used_by_date}}<div class="use-by">Used by date: {{used_by_date}}</div>{{/if}}
</div>
      {{#if green_conscious}}<img src="https://firebasestorage.googleapis.com/v0/b/specchem-pwa-feb-25.firebasestorage.app/o/pictograms%2Fgreen-conscious.png?alt=media&token=green-conscious-icon" class="green-conscious-icon" alt="Green Conscious" />{{/if}}
    </div>
    </div>
  </body>
</html>
```

### 5x9 Compact Format Template

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <title>{{product_name}} | SpecChem</title>
    <style>{{css_styles}}</style>
</head>
<body>
    <div class="label-container">
        <div class="columns-container">
            <div class="left-columns">
                {{#if description}}<div class="lc-section"><h4>Description</h4><p>{{description}}</p></div>{{/if}}
                {{#if application}}<div class="lc-section"><h4>Application</h4><p>{{application}}</p></div>{{/if}}
                {{#if features}}<div class="lc-section"><h4>Features</h4><p>{{features}}</p></div>{{/if}}
                {{#if limitations}}<div class="lc-section"><h4>Limitations</h4><p>{{limitations}}</p></div>{{/if}}
                {{#if shelf_life}}<div class="lc-section"><h4>Shelf Life</h4><p>{{shelf_life}}</p></div>{{/if}}
            </div>
            <div class="center-content">
                <div class="product-name">{{name}}</div>
                {{#if short_description_english}}<div class="short-description-english">{{short_description_english}}</div>{{/if}}
                {{#if short_description_french}}<div class="translated-short-description">{{short_description_french}}</div>{{/if}}
                {{#if short_description_spanish}}<div class="translated-short-description">{{short_description_spanish}}</div>{{/if}}
            </div>
            <div class="right-columns">
                {{#if components_determining_hazard}}<div class="rc-section"><h4>Components Determining Hazard</h4><p>{{components_determining_hazard}}</p></div>{{/if}}
                {{#if signal_word}}<div class="rc-section"><h4>Signal Word</h4><p>{{signal_word}}</p></div>{{/if}}
                {{#if hazard_statements}}<div class="rc-section"><h4>Hazard Statements</h4><p>{{hazard_statements}}</p></div>{{/if}}
                {{#if precautionary_statements}}<div class="rc-section"><h4>Precautionary Statements</h4><p>{{precautionary_statements}}</p></div>{{/if}}
                {{#if storage}}<div class="rc-section"><h4>Storage</h4><p>{{storage}}</p></div>{{/if}}
                {{#if disposal}}<div class="rc-section"><h4>Disposal</h4><p>{{disposal}}</p></div>{{/if}}
            </div>
        </div>
        <div class="logo-container">
            <img src="https://firebasestorage.googleapis.com/v0/b/specchem-pwa-feb-25.firebasestorage.app/o/branding%2Flogo-transparent.webp?alt=media&token=0b494edd-5a0a-4f37-8227-8e88356881f8" alt="SpecChem Logo">
        </div>
        <div class="code-row">
            <img src="https://firebasestorage.googleapis.com/v0/b/specchem-pwa-feb-25.firebasestorage.app/o/pictograms%2Fproduct-qr.png?alt=media&token=c832e9c2-525d-4dbf-984d-f8f249acf86e" class="qr-code" alt="QR Code" />
            <div class="code-info">
                <label>Batch No:</label>
                <div class="package-size">{{package_size}}</div>
                {{#if used_by_date}}<div class="use-by">Used by date: {{used_by_date}}</div>{{/if}}
            </div>
        </div>
    </div>
</body>
</html>
```

## Database Field Mapping

### How Template Variables Map to Database Columns

| Template Variable | Database Column | Description |
|-------------------|-----------------|-------------|
| `{{product_name}}` | `products.name` | Product title for page title |
| `{{name}}` | `products.name` | Main product name display |
| `{{css_styles}}` | `label_templates.css_template` | Embedded CSS styling |
| `{{description}}` | `products.description` | Product description |
| `{{voc_data}}` | `products.voc_data` | Volatile Organic Compounds data |
| `{{application}}` | `products.application` | How to use the product |
| `{{features}}` | `products.features` | Product features and benefits |
| `{{limitations}}` | `products.limitations` | Usage limitations |
| `{{shelf_life}}` | `products.shelf_life` | Product expiration info |
| `{{short_description_english}}` | `products.short_description_english` | English short description |
| `{{short_description_french}}` | `products.short_description_french` | French short description |
| `{{short_description_spanish}}` | `products.short_description_spanish` | Spanish short description |
| `{{subtitle_1}}` | `products.subtitle_1` | First subtitle |
| `{{subtitle_2}}` | `products.subtitle_2` | Second subtitle |
| `{{pictograms}}` | Generated HTML from `product_pictograms` join | Safety pictogram images |

### Safety Data Sheet (SDS) Fields

| Template Variable | Database Column | French Equivalent |
|-------------------|-----------------|-------------------|
| `{{components_determining_hazard}}` | `products.components_determining_hazard` | `{{composants_determinant_le_danger}}` |
| `{{signal_word}}` | `products.signal_word` | `{{mot_de_signalement}}` |
| `{{hazard_statements}}` | `products.hazard_statements` | `{{mentions_de_danger}}` |
| `{{precautionary_statements}}` | `products.precautionary_statements` | `{{conseils_de_prudence}}` |
| `{{response_statements}}` | `products.response_statements` | `{{premiers_soins}}` |
| `{{storage}}` | `products.storage` | `{{consignes_de_stockage}}` |
| `{{disposal}}` | `products.disposal` | `{{consignes_delimination}}` |

### Transportation/Shipping Fields

| Template Variable | Database Column | Description |
|-------------------|-----------------|-------------|
| `{{proper_shipping_name}}` | `products.proper_shipping_name` | DOT shipping classification |
| `{{un_number}}` | `products.un_number` | UN identification number |
| `{{hazard_class}}` | `products.hazard_class` | DOT hazard classification |
| `{{packing_group}}` | `products.packing_group` | DOT packing group |
| `{{emergency_response_guide}}` | `products.emergency_response_guide` | Emergency response guide number |

### Additional Fields

| Template Variable | Database Column | Type | Description |
|-------------------|-----------------|------|-------------|
| `{{package_size}}` | `products.package_size` | String | Container size information |
| `{{used_by_date}}` | `products.used_by_date` | String | Expiration date info |
| `{{green_conscious}}` | `products.green_conscious` | Boolean | Eco-friendly flag |
| `{{corner_icons}}` | Generated | HTML | Special corner icons (if applicable) |

## Template Processing Flow

### 1. Template Selection
```typescript
const templateName = size === '14x7' ? '14x7 Enhanced Large Format' : '5x9 Compact Format';
```
The system chooses between two templates based on the `size` parameter.

### 2. Data Compilation
Your API route in `/api/label/[title]/route.ts` creates a comprehensive mapping object:

```typescript
const templateVars: Record<string, string> = {
  product_name: product.name || '',
  name: product.name || '',
  title: product.name || '',
  description: product.description || '',
  // ... all other fields
};
```

### 3. Pictogram Processing
Special handling for pictograms involves a database join and HTML generation:

```typescript
const { data: productPictograms } = await supabase
  .from('product_pictograms')
  .select(`pictograms (name, slug, url, description)`)
  .eq('product_id', product.id);

const pictogramHtml = productPictograms
  .map((pp: any) => {
    const p = pp.pictograms;
    return `<img src="${p.url}" alt="${p.description || p.name}" 
            style="width: 26px; height: 26px; object-fit: contain; 
                   border-radius: 5px; border: 1px solid #e3e8f1; 
                   background: #f7fafc;">`;
  }).join('');
```

## Multi-Language Support

### Bilingual Headers
The templates implement smart bilingual headers that only show the French designation when French content exists:

```html
<h4>Components Determining Hazard{{#if composants_determinant_le_danger}} / Français{{/if}}</h4>
<p>{{components_determining_hazard}}</p>
{{#if composants_determinant_le_danger}}<p>{{composants_determinant_le_danger}}</p>{{/if}}
```

**How it works:**
1. Always show English header and content
2. If French content exists, append " / Français" to header
3. If French content exists, display French content below English

### Language Priority
- **Primary**: English content (always displayed if available)
- **Secondary**: French content (displayed when available)
- **Tertiary**: Spanish content (displayed when available)

## Conditional Rendering Logic

### Handlebars-Style Conditionals
The system uses `{{#if variable}}...{{/if}}` blocks for conditional content rendering.

### Processing Algorithm
Your API implements a sophisticated multi-pass conditional processor:

```typescript
const ifBlockRegex = /\{\{#if\s+([^}]+)\}\}([\s\S]*?)\{\{\/if\}\}/g;
let processedHTML = html;
let passCount = 0;

// Keep processing until no more conditionals are found (handles nesting)
while (processedHTML.length !== lastLength && passCount < 10) {
  processedHTML = processedHTML.replace(ifBlockRegex, (match, varName, content) => {
    const value = templateVars[varName.trim()];
    const shouldShow = (value && value.trim() !== '');
    return shouldShow ? content : '';
  });
  passCount++;
}
```

### Conditional Examples

#### Simple Conditional
```html
{{#if description}}<div class="lc-section"><h4>Description</h4><p>{{description}}</p></div>{{/if}}
```
**Result**: Only renders the description section if the product has description data.

#### Nested Conditional with Bilingual Support
```html
{{#if components_determining_hazard}}
  <div class="rc-section">
    <h4>Components Determining Hazard{{#if composants_determinant_le_danger}} / Français{{/if}}</h4>
    <p>{{components_determining_hazard}}</p>
    {{#if composants_determinant_le_danger}}<p>{{composants_determinant_le_danger}}</p>{{/if}}
  </div>
{{/if}}
```
**Result**: 
- Renders entire section only if English content exists
- Adds French header designation only if French content exists
- Displays French content only if it exists

#### Complex Transport Section
```html
{{#if proper_shipping_name}}
  <div class="rc-section">
    <h4>Transport</h4>
    <p><b>Proper Shipping Name:</b> {{proper_shipping_name}}</p>
    {{#if un_number}}<p><b>UN Number:</b> {{un_number}}</p>{{/if}}
    {{#if hazard_class}}<p><b>Hazard Class:</b> {{hazard_class}}</p>{{/if}}
    {{#if packing_group}}<p><b>Packing Group:</b> {{packing_group}}</p>{{/if}}
    {{#if emergency_response_guide}}<p><b>N.A. Emergency Response Guidebook #:</b> {{emergency_response_guide}}</p>{{/if}}
  </div>
{{/if}}
```
**Result**: Creates a comprehensive transport section that only shows fields with data.

## System Benefits

### 1. **Compliance-Ready Output**
- Automatically includes required safety information
- Follows regulatory formatting standards
- Supports multilingual requirements

### 2. **Dynamic Content Management**
- Only displays sections with actual data
- Prevents empty fields from appearing on labels
- Maintains professional appearance regardless of data completeness

### 3. **Scalability**
- Easy to add new fields to templates
- Template modifications apply to all products
- Database-driven approach allows for easy template updates

### 4. **Multi-Format Support**
- 14x7 format for comprehensive information display
- 5x9 format for space-constrained applications
- Consistent branding across all formats

This template system effectively bridges your comprehensive chemical product database with professional, regulatory-compliant label output, providing a flexible and maintainable solution for product labeling needs.

## Recent Fix: Nested Conditional Processing

### The Problem
The original template processor was incorrectly handling nested conditionals, particularly in cases like:

```html
<h4>Components Determining Hazard{{#if composants_determinant_le_danger}} / Français{{/if}}</h4>
```

The regex-based approach was breaking HTML structure because it couldn't properly parse nested `{{#if}}...{{/if}}` blocks within other conditional blocks.

### The Solution
Implemented a proper nested conditional parser that:

1. **Counts Nesting Levels**: Properly matches opening `{{#if}}` tags with their corresponding `{{/if}}` tags
2. **Processes from Innermost Out**: Handles deeply nested conditionals correctly
3. **Maintains HTML Integrity**: Preserves proper HTML tag structure during processing
4. **Handles Edge Cases**: Works with conditionals embedded within HTML attributes and complex structures

### Code Implementation
The new `processConditionals()` function:
- Uses level counting to match conditional pairs
- Processes conditionals in reverse order to maintain string positions
- Handles multiple passes until no more conditionals remain
- Provides detailed debug logging for troubleshooting

This ensures that complex bilingual headers and nested conditional content render correctly without breaking HTML structure.
