# Products & Label M## 📊 Database Schema

**Live Documentation**: [LIVE_DATABASE_SCHEMA.md](./LIVE_DATABASE_SCHEMA.md) - Always current, auto-generated database documentation

### Database Extractor Tool

The database schema is automatically documented using our custom extraction tool:

```bash
# Extract current database schema and data
npm run extract-schema

# Extract with documentation update
npm run update-docs
```

This tool:
- ✅ Analyzes live production data
- ✅ Generates comprehensive table documentation  
- ✅ Tracks record counts and relationships
- ✅ Provides sample data for each field
- ✅ Maintains version control with timestamps

### Key Tablesgement System

A comprehensive database-driven product and label management system designed for concrete chemical companies. This system manages hundreds of chemical products with complete safety data, regulatory information, and generates professional labels in multiple formats.

## 🏗️ Architecture Overview

This application is built with a **database-first approach** using a fully normalized PostgreSQL schema to handle complex chemical product data, safety information, and multi-language support.

### **Core Database Design**

The system uses a sophisticated relational database schema with the following key entities:

- **Products** - Core product information with multi-language support
- **Categories** - Hierarchical product categorization  
- **Pictograms** - Hazard symbols and safety pictograms
- **Label Templates** - HTML/CSS templates for different label sizes
- **Product Variants** - Size and packaging variations
- **Application Methods** - Usage instructions and procedures
- **Specifications** - Technical data and test results

## �️ Database Schema

### Key Tables

```sql
-- Core Products Table
products (
  id, name, slug, sku, category_id,
  short_description_english, short_description_french, short_description_spanish,
  description, application, features, coverage, limitations,
  signal_word, hazard_statements, precautionary_statements,
  proper_shipping_name, un_number, hazard_class, packing_group,
  shelf_life, voc_data, green_conscious, do_not_freeze
)

-- Hierarchical Categories
categories (
  id, name, slug, description, parent_id, sort_order
)

-- Safety Pictograms
pictograms (
  id, name, slug, url, description
)

-- Label Templates  
label_templates (
  id, name, html_template, css_template, width_mm, height_mm
)
```

### Database Features

- **Multi-language Support**: English, French, and Spanish content
- **Safety Compliance**: Complete GHS hazard classification system
- **Regulatory Data**: UN numbers, hazard classes, packing groups
- **Template System**: HTML/CSS templates for label generation
- **Full-text Search**: Optimized search across product content
- **Audit Trail**: Created/updated timestamps on all entities

## � Getting Started

### Prerequisites

- Node.js 18.17 or later
- Supabase account and project
- PostgreSQL database access

### 1. Database Setup

First, create your database schema:

```bash
# Connect to your Supabase/PostgreSQL database
psql -h your-db-host -U your-username -d your-database

# Create the complete schema
\i database/schema.sql

# Insert seed data (categories, pictograms, templates)
\i database/seed.sql
```

### 2. Data Migration

Import your existing CSV product data:

```bash
# Prepare your products_rows.csv file in public/data/
# Then run the migration script
\i database/migrate.sql
```

### 3. Environment Configuration

```bash
# Copy the environment template
cp .env.local.example .env.local

# Configure your Supabase connection
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Start Development

```bash
npm run dev
```

## 📊 Data Import Process

The system includes a comprehensive data migration process to transform your CSV data into the normalized database schema:

### CSV to Database Mapping

Your existing CSV data is automatically processed and normalized:

- **Product Information** → `products` table
- **Category Names** → `categories` table with slugs
- **Pictogram URLs** → `pictograms` table with associations
- **Multi-language Fields** → Separate columns for EN/FR/ES content
- **Safety Data** → Structured hazard classification fields

### Migration Features

- **Data Cleaning**: Removes HTML entities, normalizes text
- **Slug Generation**: Creates URL-friendly identifiers
- **Enum Mapping**: Maps text values to proper database enums
- **Relationship Building**: Creates proper foreign key relationships
- **Duplicate Handling**: Prevents data duplication during import

## 🏷️ Label Generation System

### Template Architecture

The label system uses HTML/CSS templates stored in the database:

```html
<!-- Example Label Template -->
<div class="label-container">
  <h1 class="product-name">{{product_name}}</h1>
  <div class="hazard-section">
    <span class="signal-word {{signal_word_class}}">{{signal_word}}</span>
    <div class="pictograms">
      {{#each pictograms}}
      <img src="{{url}}" alt="{{name}}" class="pictogram">
      {{/each}}
    </div>
  </div>
  <div class="hazard-statements">{{hazard_statements}}</div>
</div>
```

### Label Sizes Supported

- **Standard 4x6 inch** - Full product labels with complete safety information
- **Compact 3x2 inch** - Essential information for small containers
- **Custom Sizes** - Configurable dimensions for specific requirements

### Multi-language Labels

Generate labels in English, French, or Spanish with automatic field mapping:

```typescript
// Generate French label
const label = await LabelsAPI.generateLabel(productId, templateId, 'fr')

// Language-specific content is automatically selected:
// - short_description_french
// - mentions_de_danger  
// - conseils_de_prudence
```

## 🔍 API and Data Access

### Type-Safe API Layer

The system provides a complete TypeScript API layer:

```typescript
import { ProductsAPI } from '@/lib/api'

// Get products with relationships
const products = await ProductsAPI.getProducts({
  categoryId: 'uuid',
  search: 'concrete sealer',
  limit: 20
})

// Get single product with all related data
const product = await ProductsAPI.getProduct(productId)

// Search with full-text search
const results = await ProductsAPI.searchProducts('epoxy repair')
```

### Database Views

Pre-built views for common queries:

- `products_with_category` - Products joined with category information
- `products_with_pictograms` - Products with aggregated pictogram data

## 📋 Product Data Structure

### Core Product Fields

- **Identification**: Name, SKU, category, slug
- **Descriptions**: Multi-language short and long descriptions  
- **Technical**: Application instructions, coverage rates, features
- **Safety**: Hazard statements, precautionary measures, first aid
- **Regulatory**: UN numbers, hazard classes, shipping names
- **Physical**: VOC data, shelf life, storage requirements

### Safety & Regulatory Compliance

- **GHS Classification**: Complete hazard communication system
- **Signal Words**: Danger, Warning, or None classifications
- **Pictograms**: Standard hazard symbols with URLs
- **Multi-language Safety**: French and Spanish translations
- **Shipping Data**: UN numbers, hazard classes, packing groups

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler check

### Tech Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (ready for implementation)
- **File Storage**: Supabase Storage (for images/PDFs)

## 📈 Scalability & Performance

### Database Optimization

- **Indexes**: Optimized indexes on frequently queried fields
- **Full-text Search**: PostgreSQL full-text search capabilities
- **Views**: Pre-computed joins for common queries
- **Partitioning**: Ready for table partitioning if needed

### Caching Strategy

- **Static Generation**: Next.js static site generation for product pages
- **API Caching**: Response caching for product listings
- **CDN Ready**: Optimized for CDN deployment

## � Security Considerations

### Data Protection

- **Row Level Security**: Supabase RLS policies (configurable)
- **Type Safety**: Full TypeScript coverage prevents data errors
- **Input Validation**: Comprehensive validation on all inputs
- **SQL Injection Prevention**: Parameterized queries via Supabase

### Compliance

- **Chemical Safety**: Designed for chemical product regulatory compliance
- **Multi-region**: Support for different regional requirements
- **Audit Trail**: Complete change tracking capabilities

## 🚀 Deployment

### Vercel Deployment (Recommended)

```bash
# Deploy to Vercel
npm run build
vercel deploy
```

### Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 📚 Next Steps

1. **Configure Supabase** - Set up your database and get credentials
2. **Import Data** - Use the migration scripts to import your product data
3. **Customize Templates** - Modify label templates to match your requirements
4. **Add Authentication** - Implement user management if needed
5. **Deploy** - Deploy to Vercel or your preferred platform

## 🤝 Support

For questions about this database schema and implementation, please refer to:

- Database schema: `database/schema.sql`
- Migration scripts: `database/migrate.sql`  
- API documentation: `src/lib/api.ts`
- Type definitions: `src/lib/database.types.ts`

---

**Built for concrete chemical companies requiring comprehensive product data management with professional label generation capabilities.**
