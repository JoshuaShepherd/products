# SpecChem Products Database - Authoritative Schema Documentation

**Generated**: September 19, 2025
**Source**: Live Node.js Database Inspection
**Environment**: Supabase Production (bnwbjrlgoylmbblfmsru.supabase.co)
**Status**: ✅ Current & Verified

## Executive Summary

This is the **single source of truth** for the SpecChem Products database schema, generated through direct Node.js inspection of the live Supabase database. All information has been verified against the current production environment.

### Current Database Status
- **Total Tables**: 10 (6 active with data, 4 empty but ready)
- **Total Records**: 816 across all tables
- **Primary Language**: English with French/Spanish support
- **Environment**: Production Supabase PostgreSQL

## Database Overview

### Active Tables (With Data)
1. **products** - 259 records (Main product catalog)
2. **categories** - 36 records (Product categorization) 
3. **pictograms** - 22 records (Hazard pictograms)
4. **product_pictograms** - 499 records (Product-pictogram relationships)
5. **label_templates** - 2 records (Label generation templates)

### Ready Tables (Empty)
6. **product_variants** - Product size/packaging variants
7. **product_labels** - Generated PDF labels cache
8. **product_media** - Product images and media
9. **application_methods** - Product application instructions
10. **product_specifications** - Technical specifications

## Detailed Table Structures

### 1. Products (Core Entity)
**Records**: 259 | **Columns**: 56

**Key Fields**:
- `id` (string) - UUID primary key
- `name` (string) - Product name
- `slug` (string) - URL-friendly identifier
- `sku` (nullable) - Stock keeping unit
- `category_id` (string) - Links to categories table

**Content Fields** (Multi-language):
- `description` - Main product description
- `application` - Usage instructions
- `features` - Product features
- `coverage` - Coverage information
- `limitations` - Usage limitations
- `shelf_life` - Product shelf life

**Safety & Regulatory**:
- `signal_word` (enum) - Hazard signal ("None", "Warning", "Danger")
- `hazard_statements` - Safety hazard information
- `precautionary_statements` - Safety precautions
- `first_aid` - First aid instructions
- `storage` - Storage requirements
- `disposal` - Disposal instructions

**French Language Fields**:
- `short_description_french`
- `composants_determinant_le_danger`
- `mot_de_signalement` 
- `mentions_de_danger`
- `conseils_de_prudence`
- `premiers_soins`
- `mesures_de_premiers_secours`
- `consignes_de_stockage`
- `consignes_delimination`

**Shipping Information**:
- `proper_shipping_name`
- `un_number`
- `hazard_class` (enum)
- `packing_group` (enum)
- `emergency_response_guide`

**Product Attributes**:
- `do_not_freeze` (boolean)
- `mix_well` (boolean) 
- `green_conscious` (boolean)
- `used_by_date`

### 2. Categories
**Records**: 36 | **Columns**: 9

**Structure**:
- `id` (string) - UUID primary key
- `name` (string) - Category name
- `slug` (string) - URL-friendly identifier
- `description` - Category description
- `parent_id` (nullable) - For hierarchical categories
- `sort_order` (number) - Display ordering
- `is_active` (boolean) - Active status
- `created_at` / `updated_at` - Timestamps

### 3. Pictograms
**Records**: 22 | **Columns**: 7

**Structure**:
- `id` (string) - UUID primary key
- `name` (string) - Pictogram name
- `slug` (string) - URL-friendly identifier
- `url` (string) - Image URL
- `description` - Pictogram description
- `is_active` (boolean) - Active status
- `created_at` - Timestamp

### 4. Product Pictograms (Junction Table)
**Records**: 499 | **Columns**: 5

**Purpose**: Links products to their hazard pictograms
**Structure**:
- `id` (string) - UUID primary key
- `product_id` (string) - References products.id
- `pictogram_id` (string) - References pictograms.id
- `sort_order` (number) - Display order
- `created_at` - Timestamp

### 5. Label Templates
**Records**: 2 | **Columns**: 11

**Purpose**: HTML/CSS templates for PDF label generation
**Structure**:
- `id` (string) - UUID primary key
- `name` (string) - Template name
- `slug` (string) - URL-friendly identifier
- `description` - Template description
- `width_mm` (number) - Label width in millimeters
- `height_mm` (number) - Label height in millimeters
- `html_template` (text) - HTML template with variables
- `css_template` (text) - CSS styling
- `is_active` (boolean) - Active status
- `created_at` / `updated_at` - Timestamps

**Current Templates**:
1. "14x7 Enhanced Large Format" 
2. "5x9 Compact Format"

## Custom Data Types

Based on live data inspection, the following enum types are in use:

### signal_word
- "None" (most common)
- "Warning" 
- "Danger"

### hazard_class  
- "Not applicable" (default)
- Various numbered classes (1-9)

### packing_group
- "Not applicable" (default)
- "I", "II", "III" (packaging groups)

## System Features

### Multi-Language Support
- **English**: Primary language for all content
- **French**: Complete translations for safety and regulatory content
- **Spanish**: Basic support (short descriptions)

### PDF Generation
- **Status**: ✅ Fully Functional (Fixed Sept 19, 2025)
- **Technology**: Puppeteer with Chrome browser
- **Formats**: 14x7mm, 5x9mm label sizes
- **Content**: Dynamic HTML/CSS with product data injection

### Safety & Regulatory Compliance
- Complete hazard classification system
- Multi-language safety information
- Shipping and transportation data
- Emergency response information

## Environment Configuration

### Required .env.local Variables
```bash
NEXT_PUBLIC_SUPABASE_URL=https://bnwbjrlgoylmbblfmsru.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Database Connection
- **Provider**: Supabase (PostgreSQL)
- **Client**: @supabase/supabase-js
- **Architecture**: Next.js App Router with TypeScript

## API Status

### Functional Endpoints
- ✅ `/api/label/[title]/pdf` - PDF generation (Recently fixed)
- ✅ All CRUD operations via Supabase client
- ✅ Real-time data access

### Recent Fixes (Sept 19, 2025)
- Fixed Puppeteer Chrome browser installation
- Enhanced error handling for PDF generation
- Added fallback Chrome executable paths
- Automatic Chrome installation via postinstall script

## Data Relationships

```
categories (1) ──────── (*) products
                            │
products (1) ────────── (*) product_pictograms ────────── (*) pictograms
    │                                                          
    │                                                          
    └────────── (*) product_variants (ready)
    └────────── (*) product_labels (ready)  
    └────────── (*) product_media (ready)
    └────────── (*) application_methods (ready)
    └────────── (*) product_specifications (ready)
```

## Data Integrity

### Foreign Key Constraints
- `products.category_id` → `categories.id`
- `product_pictograms.product_id` → `products.id` (CASCADE DELETE)
- `product_pictograms.pictogram_id` → `pictograms.id` (CASCADE DELETE)

### Unique Constraints
- `products.slug` (unique)
- `products.sku` (unique, nullable)
- `categories.slug` (unique)
- `pictograms.slug` (unique)

## Performance Optimizations

### Indexes (Inferred from Usage)
- Primary keys (automatic UUIDs)
- Foreign key relationships
- Slug fields for URL routing
- Active status fields for filtering

## Backup & Archive

### Outdated Documentation (Archived Sept 19, 2025)
- `docs/canonical-database-schema-2025-09-08.md` → `docs/archive/outdated-2025-09-19/`
- `docs/canonical-schema-dump-2025-09-08.sql` → `docs/archive/outdated-2025-09-19/`
- `docs/forms-schema-analysis-report-2025-09-08.md` → `docs/archive/outdated-2025-09-19/`

### Current Authoritative Sources
- This document: `docs/database-schema-authoritative.md`
- Raw inspection data: `docs/current-schema.json`
- Generated inspection: `docs/current-database-schema.md`

---

**Last Updated**: September 19, 2025
**Next Review**: When schema changes occur
**Inspection Script**: `scripts/inspect-database-schema.mjs`