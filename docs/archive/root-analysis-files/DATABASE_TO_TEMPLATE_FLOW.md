# Database to Template Flow Documentation

## Overview

This document explains how product data flows from the Supabase database to generated HTML labels in the SpecChem Products system. This guide will help you understand the architecture, diagnose issues, and maintain the template system.

## System Architecture

```
┌─────────────┐    ┌──────────────┐    ┌─────────────────┐    ┌──────────────┐
│  Supabase   │    │   Product    │    │   Label API     │    │  Generated   │
│  Database   │───▶│   API        │───▶│  Processing     │───▶│  HTML Label  │
│             │    │              │    │                 │    │              │
└─────────────┘    └──────────────┘    └─────────────────┘    └──────────────┘
```

## Database Schema

### Products Table (`products`)

Key fields used in label generation:

```sql
-- Core Product Information
name varchar(255)                    -- Product title
description text                     -- Long product description
application text                     -- Application instructions
features text                        -- Product features
limitations text                     -- Usage limitations
shelf_life varchar(255)              -- Storage/shelf life info
voc_data varchar(255)                -- VOC compliance data

-- Short Descriptions (Multilingual)
short_description_english text       -- English short description
short_description_french text        -- French short description  
short_description_spanish text       -- Spanish short description

-- SDS (Safety Data Sheet) Information
signal_word hazard_signal            -- 'None', 'Warning', 'Danger'
components_determining_hazard text   -- Hazardous components
hazard_statements text               -- H-codes and statements
precautionary_statements text        -- P-codes and statements
response_statements text             -- Emergency response info
first_aid text                      -- First aid instructions
storage text                        -- Storage requirements
disposal text                       -- Disposal instructions

-- Transportation Data
proper_shipping_name varchar(255)    -- DOT shipping name
un_number varchar(10)                -- UN identification number
hazard_class hazard_class            -- Transportation hazard class
packing_group packing_group          -- Packing group classification
emergency_response_guide varchar(10) -- ERG guide number

-- Product Features (Boolean flags)
do_not_freeze boolean                -- Temperature sensitivity
mix_well boolean                     -- Mixing requirement
green_conscious boolean              -- Environmental designation
used_by_date varchar(255)            -- Expiration information

-- French SDS Fields
composants_determinant_le_danger text
mot_de_signalement varchar(100)
mentions_de_danger text
conseils_de_prudence text
premiers_soins text
mesures_de_premiers_secours text
consignes_de_stockage text
consignes_delimination text
```

### Label Templates Table (`label_templates`)

```sql
-- Template Storage
name varchar(255)                    -- Template identifier
html_template text                   -- HTML with Handlebars variables
css_template text                    -- CSS styles
width_mm numeric(6,2)                -- Physical width
height_mm numeric(6,2)               -- Physical height
```

## API Layer

### 1. Product API (`/src/app/api/product/route.ts`)

**Purpose**: Provides transformed product data for frontend components

**Flow**:
1. Receives product title via query parameter: `?title=All Shield SB`
2. Queries Supabase: `SELECT * FROM products WHERE name ILIKE 'All Shield SB'`
3. Transforms database field names to display-friendly names
4. Returns JSON response

**Field Transformations**:
```javascript
// Database → API Response
name → "Title"
short_description_english → "Short Description English"
signal_word → "Signal Word"
components_determining_hazard → "Components Determining Hazard"
// ... etc
```

### 2. Label API (`/src/app/api/label/[title]/route.ts`)

**Purpose**: Generates HTML labels by processing templates with product data

**Flow**:
1. Receives product title from URL path and size from query: `/api/label/All Shield SB?size=14x7`
2. Fetches product data directly from database (no field transformation)
3. Loads appropriate template from `label_templates` table
4. Creates comprehensive `templateVars` object
5. Processes Handlebars template syntax
6. Returns rendered HTML

**Template Variable Mapping**:
```javascript
const templateVars = {
  // Product identification (multiple aliases for compatibility)
  product_name: product.name,
  name: product.name,
  title: product.name,
  
  // Core content
  description: product.description,
  application: product.application,
  features: product.features,
  limitations: product.limitations,
  
  // SDS fields
  signal_word: product.signal_word,
  hazard_statements: product.hazard_statements,
  // ... 36+ total variables
};
```

## Template Processing

### Template Syntax

The system uses Handlebars-style template syntax:

#### Simple Variables
```html
<div class="product-name">{{name}}</div>
<p>{{description}}</p>
```

#### Conditional Sections
```html
{{#if description}}
<div class="lc-section">
    <h4>Description</h4>
    <p>{{description}}</p>
</div>
{{/if}}
```

#### CSS Injection
```html
<style>{{css_styles}}</style>
```

### Available Templates

1. **14x7 Enhanced Large Format** (`14x7-enhanced`)
   - Size: 14.875" × 7.625"
   - Layout: Three-column with detailed content sections
   - Use case: Comprehensive product information

2. **5x9 Compact Format** (`5x9-compact`)
   - Size: 9" × 5"
   - Layout: Two-column compact design
   - Use case: Essential information only

### Template Variable Processing

The label API processes templates in this order:

1. **Load template** from database by name
2. **Create templateVars** object with all product data
3. **Process conditionals**: `{{#if variable}}...{{/if}}` blocks
4. **Replace variables**: `{{variable}}` with actual values
5. **Inject CSS**: Replace `{{css_styles}}` with template CSS
6. **Return HTML**: Complete rendered label

## File Structure

```
src/
├── app/api/
│   ├── product/route.ts          # Product data API (with transformations)
│   └── label/[title]/route.ts    # Label generation API
├── components/
│   ├── app-sidebar.tsx           # Navigation with field categories
│   └── FieldViewer.tsx           # Field display with mapping functions
└── lib/
    └── supabase.ts               # Database client configuration

database/
├── schema.sql                    # Complete database schema
└── seed.sql                      # Sample data

insert_label_templates.sql        # Template definitions
setup_database.mjs               # Database initialization script
```

## Debugging Common Issues

### Issue: Wrong Product Data in Labels

**Symptoms**: Label shows incorrect product name or content

**Diagnosis**:
1. Check product exists: `SELECT * FROM products WHERE name ILIKE 'Product Name'`
2. Verify API response: `curl "http://localhost:3000/api/product?title=Product Name"`
3. Test label generation: `curl "http://localhost:3000/api/label/Product Name?size=14x7"`

### Issue: Template Variables Not Replacing

**Symptoms**: Labels show `{{variable}}` instead of actual values

**Diagnosis**:
1. Verify template exists: `SELECT name FROM label_templates`
2. Check template syntax: Variables must use exact names from `templateVars`
3. Ensure no typos: `{{name}}` not `{{product_name}}` for product title

### Issue: Missing Template Sections

**Symptoms**: Empty sections or missing content

**Diagnosis**:
1. Check conditional logic: `{{#if variable}}` requires non-empty variable
2. Verify data exists: Product field must have content for section to appear
3. Test variable population: Add console.log to label API

## Field Mapping Reference

### Database Field → Template Variable

| Database Field | Template Variable | Display Name |
|---------------|------------------|--------------|
| `name` | `name`, `product_name`, `title` | Product Name |
| `description` | `description` | Description |
| `application` | `application` | Application |
| `features` | `features` | Features |
| `limitations` | `limitations` | Limitations |
| `signal_word` | `signal_word` | Signal Word |
| `short_description_english` | `short_description_english` | Short Description |
| `hazard_statements` | `hazard_statements` | Hazard Statements |
| `first_aid` | `first_aid` | First Aid |
| `storage` | `storage` | Storage |
| `disposal` | `disposal` | Disposal |

### Boolean Field Handling

Boolean fields are converted to Yes/No strings:
```javascript
do_not_freeze: product.do_not_freeze ? 'Yes' : 'No'
mix_well: product.mix_well ? 'Yes' : 'No'
green_conscious: product.green_conscious ? 'Yes' : 'No'
```

## Testing the Flow

### 1. Test Product Data Retrieval
```bash
curl "http://localhost:3000/api/product?title=All Shield SB"
```

### 2. Test Label Generation
```bash
curl "http://localhost:3000/api/label/All Shield SB?size=14x7"
```

### 3. Verify Template Variables
Add debug logging to `/src/app/api/label/[title]/route.ts`:
```javascript
console.log('Template variables:', Object.keys(templateVars));
console.log('Product name:', templateVars.name);
```

## Maintenance Tasks

### Adding New Template Variables

1. **Update templateVars object** in `/src/app/api/label/[title]/route.ts`
2. **Add field mapping** in `/src/components/FieldViewer.tsx` if needed
3. **Update template HTML** in database or `insert_label_templates.sql`
4. **Test with sample product**

### Adding New Templates

1. **Create HTML template** with Handlebars syntax
2. **Add to `insert_label_templates.sql`**
3. **Update template selection logic** in label API
4. **Test rendering with various products**

### Modifying Field Mappings

1. **Check database schema** for correct field names
2. **Update API transformations** if needed
3. **Verify template variables** match expectations
4. **Test end-to-end flow**

## Performance Considerations

- **Database queries**: Single query per label generation
- **Template caching**: Templates loaded from database each time
- **Variable processing**: 36+ variables processed per label
- **HTML generation**: String replacement operations

## Security Notes

- **Input sanitization**: Product titles are URL-decoded
- **SQL injection**: Using Supabase parameterized queries
- **XSS prevention**: Template variables should be sanitized if user-editable
- **Access control**: APIs use Supabase Row Level Security (if configured)

## Conclusion

The database-to-template flow is a robust system that:
1. ✅ Fetches accurate product data from Supabase
2. ✅ Processes templates with comprehensive variable mapping
3. ✅ Generates HTML labels with proper content substitution
4. ✅ Supports multiple template formats and sizes
5. ✅ Handles conditional content and CSS injection

The system architecture separates concerns effectively, making debugging systematic and maintenance straightforward.
