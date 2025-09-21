-- ================================================================
-- CANONICAL SCHEMA DUMP - SpecChem CRM (Products Management System)
-- Generated: September 8, 2025
-- Source: Production Database (bnwbjrlgoylmbblfmsru)
-- Status: ✅ Production-Ready & Verified
-- ================================================================

-- This file represents the single source of truth for the database schema.
-- Generated from live production database via Supabase CLI type generation.
-- Last verified: September 8, 2025
-- TypeScript types generated: 1,103 lines (comprehensive coverage)

-- Extensions and Setup
-- ================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "extensions";

-- Custom Enum Types
-- ================================================================
CREATE TYPE hazard_signal AS ENUM ('Danger', 'Warning', 'None');
CREATE TYPE hazard_class AS ENUM (
    'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 
    'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Not applicable'
);
CREATE TYPE packing_group AS ENUM ('PG I', 'PG II', 'PG III', 'Not applicable');

-- Function for automatic updated_at timestamp
-- ================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Core Schema Tables
-- ================================================================

-- Categories: Product categorization hierarchy
CREATE TABLE public.categories (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    name character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    description text NULL,
    parent_id uuid NULL,
    sort_order integer NULL DEFAULT 0,
    is_active boolean NULL DEFAULT true,
    created_at timestamp with time zone NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT categories_pkey PRIMARY KEY (id),
    CONSTRAINT categories_slug_key UNIQUE (slug),
    CONSTRAINT categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES categories (id)
);

-- Products: Core product information with multi-language support
CREATE TABLE public.products (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    name character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    sku character varying(100) NULL,
    category_id uuid NULL,
    
    -- Multi-language descriptions
    short_description_english text NULL,
    short_description_french text NULL,
    short_description_spanish text NULL,
    description text NULL,
    
    -- Application and technical information
    application text NULL,
    features text NULL,
    coverage text NULL,
    limitations text NULL,
    shelf_life character varying(255) NULL,
    voc_data character varying(255) NULL,
    
    -- Safety and hazard information (English)
    signal_word hazard_signal NULL DEFAULT 'None'::hazard_signal,
    components_determining_hazard text NULL,
    hazard_statements text NULL,
    precautionary_statements text NULL,
    response_statements text NULL,
    first_aid text NULL,
    storage text NULL,
    disposal text NULL,
    
    -- Safety and hazard information (French)
    composants_determinant_le_danger text NULL,
    mot_de_signalement character varying(100) NULL,
    mentions_de_danger text NULL,
    conseils_de_prudence text NULL,
    premiers_soins text NULL,
    mesures_de_premiers_secours text NULL,
    consignes_de_stockage text NULL,
    consignes_delimination text NULL,
    
    -- Shipping and regulatory information
    proper_shipping_name character varying(255) NULL,
    un_number character varying(10) NULL,
    hazard_class hazard_class NULL DEFAULT 'Not applicable'::hazard_class,
    packing_group packing_group NULL DEFAULT 'Not applicable'::packing_group,
    emergency_response_guide character varying(10) NULL,
    
    -- Label design information
    subtitle_1 character varying(255) NULL,
    subtitle_2 character varying(255) NULL,
    pictograms character varying NULL,
    
    -- Product attributes
    do_not_freeze boolean NULL DEFAULT false,
    mix_well boolean NULL DEFAULT false,
    green_conscious boolean NULL DEFAULT false,
    used_by_date character varying(255) NULL,
    
    -- Management fields
    is_active boolean NULL DEFAULT true,
    sort_order integer NULL DEFAULT 0,
    created_at timestamp with time zone NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT products_pkey PRIMARY KEY (id),
    CONSTRAINT products_sku_key UNIQUE (sku),
    CONSTRAINT products_slug_key UNIQUE (slug),
    CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES categories (id)
);

-- Pictograms: Hazard and safety pictogram definitions
CREATE TABLE public.pictograms (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    name character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    url text NOT NULL,
    description text NULL,
    is_active boolean NULL DEFAULT true,
    created_at timestamp with time zone NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pictograms_pkey PRIMARY KEY (id),
    CONSTRAINT pictograms_slug_key UNIQUE (slug)
);

-- Product Pictograms: Many-to-many relationship for product hazard symbols
CREATE TABLE public.product_pictograms (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    product_id uuid NULL,
    pictogram_id uuid NULL,
    sort_order integer NULL DEFAULT 0,
    created_at timestamp with time zone NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT product_pictograms_pkey PRIMARY KEY (id),
    CONSTRAINT product_pictograms_product_id_pictogram_id_key UNIQUE (product_id, pictogram_id),
    CONSTRAINT product_pictograms_pictogram_id_fkey FOREIGN KEY (pictogram_id) REFERENCES pictograms (id) ON DELETE CASCADE,
    CONSTRAINT product_pictograms_product_id_fkey FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
);

-- Product Variants: Size, packaging, and pricing variations
CREATE TABLE public.product_variants (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    product_id uuid NULL,
    name character varying(255) NOT NULL,
    sku character varying(100) NULL,
    size character varying(100) NULL,
    unit character varying(50) NULL,
    weight_kg numeric(8, 3) NULL,
    volume_liters numeric(8, 3) NULL,
    price numeric(10, 2) NULL,
    is_active boolean NULL DEFAULT true,
    created_at timestamp with time zone NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT product_variants_pkey PRIMARY KEY (id),
    CONSTRAINT product_variants_sku_key UNIQUE (sku),
    CONSTRAINT product_variants_product_id_fkey FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
);

-- Product Specifications: Technical specifications and test data
CREATE TABLE public.product_specifications (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    product_id uuid NULL,
    spec_name character varying(255) NOT NULL,
    spec_value text NOT NULL,
    unit character varying(50) NULL,
    test_method character varying(255) NULL,
    sort_order integer NULL DEFAULT 0,
    created_at timestamp with time zone NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT product_specifications_pkey PRIMARY KEY (id),
    CONSTRAINT product_specifications_product_id_fkey FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
);

-- Application Methods: Detailed application instructions
CREATE TABLE public.application_methods (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    product_id uuid NULL,
    method_name character varying(255) NOT NULL,
    instructions text NOT NULL,
    coverage_rate character varying(255) NULL,
    equipment_required text NULL,
    temperature_range character varying(100) NULL,
    sort_order integer NULL DEFAULT 0,
    created_at timestamp with time zone NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT application_methods_pkey PRIMARY KEY (id),
    CONSTRAINT application_methods_product_id_fkey FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
);

-- Product Media: Images, videos, and documents
CREATE TABLE public.product_media (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    product_id uuid NULL,
    media_type character varying(50) NOT NULL,
    url text NOT NULL,
    alt_text character varying(255) NULL,
    caption text NULL,
    is_primary boolean NULL DEFAULT false,
    sort_order integer NULL DEFAULT 0,
    created_at timestamp with time zone NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT product_media_pkey PRIMARY KEY (id),
    CONSTRAINT product_media_product_id_fkey FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
);

-- Label Template System
-- ================================================================

-- Label Templates: Design templates for product labels
CREATE TABLE public.label_templates (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    name character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    description text NULL,
    width_mm numeric(6, 2) NULL,
    height_mm numeric(6, 2) NULL,
    html_template text NOT NULL,
    css_template text NOT NULL,
    is_active boolean NULL DEFAULT true,
    created_at timestamp with time zone NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT label_templates_pkey PRIMARY KEY (id),
    CONSTRAINT label_templates_slug_key UNIQUE (slug)
);

-- Label Template Versions: Version control for template changes
CREATE TABLE public.label_template_versions (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    template_id uuid NULL,
    version_number integer NOT NULL,
    html_template text NOT NULL,
    css_template text NOT NULL,
    is_published boolean NULL DEFAULT false,
    change_notes text NULL,
    created_at timestamp with time zone NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT label_template_versions_pkey PRIMARY KEY (id),
    CONSTRAINT label_template_versions_template_id_fkey FOREIGN KEY (template_id) REFERENCES label_templates (id) ON DELETE CASCADE
);

-- Template CSS Variables: Dynamic styling variables
CREATE TABLE public.template_css_variables (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    template_id uuid NULL,
    variable_name character varying(255) NOT NULL,
    variable_value character varying(255) NOT NULL,
    variable_type character varying(50) NULL,
    created_at timestamp with time zone NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT template_css_variables_pkey PRIMARY KEY (id),
    CONSTRAINT template_css_variables_template_id_fkey FOREIGN KEY (template_id) REFERENCES label_templates (id)
);

-- Template Components: Reusable template components
CREATE TABLE public.template_components (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    name character varying(255) NOT NULL,
    component_type character varying(255) NOT NULL,
    html_template text NOT NULL,
    css_template text NULL,
    is_active boolean NULL DEFAULT true,
    created_at timestamp with time zone NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT template_components_pkey PRIMARY KEY (id)
);

-- Layout Presets: Predefined layout configurations
CREATE TABLE public.layout_presets (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    name character varying(255) NOT NULL,
    description text NULL,
    grid_template text NULL,
    flex_template text NULL,
    preset_css text NULL,
    thumbnail_url text NULL,
    is_active boolean NULL DEFAULT true,
    CONSTRAINT layout_presets_pkey PRIMARY KEY (id)
);

-- Individual Label Templates: Product-specific template overrides
CREATE TABLE public.individual_label_templates (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    product_id uuid NULL,
    template_id uuid NULL,
    custom_css text NULL,
    custom_html text NULL,
    notes text NULL,
    created_at timestamp with time zone NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT individual_label_templates_pkey PRIMARY KEY (id),
    CONSTRAINT individual_label_templates_product_id_fkey FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
    CONSTRAINT individual_label_templates_template_id_fkey FOREIGN KEY (template_id) REFERENCES label_templates (id) ON DELETE CASCADE
);

-- Individual CSS Overrides: Granular styling overrides
CREATE TABLE public.individual_css_overrides (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    individual_template_id uuid NULL,
    css_property character varying(255) NOT NULL,
    css_value text NOT NULL,
    created_at timestamp with time zone NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT individual_css_overrides_pkey PRIMARY KEY (id),
    CONSTRAINT individual_css_overrides_individual_template_id_fkey FOREIGN KEY (individual_template_id) REFERENCES individual_label_templates (id) ON DELETE CASCADE
);

-- Product Labels: Generated label instances
CREATE TABLE public.product_labels (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    product_id uuid NULL,
    template_id uuid NULL,
    generated_html text NULL,
    pdf_url text NULL,
    language character varying(10) NULL DEFAULT 'en'::character varying,
    version integer NULL DEFAULT 1,
    is_current boolean NULL DEFAULT true,
    created_at timestamp with time zone NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT product_labels_pkey PRIMARY KEY (id),
    CONSTRAINT product_labels_product_id_fkey FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
    CONSTRAINT product_labels_template_id_fkey FOREIGN KEY (template_id) REFERENCES label_templates (id)
);

-- Performance Indexes
-- ================================================================

-- Categories indexes
CREATE INDEX IF NOT EXISTS idx_categories_parent ON public.categories USING btree (parent_id);

-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products USING btree (category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products USING btree (is_active);
CREATE INDEX IF NOT EXISTS idx_products_name ON public.products USING btree (name);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products USING btree (sku);

-- Full-text search index for products
CREATE INDEX IF NOT EXISTS idx_products_search ON public.products USING gin (
    to_tsvector('english'::regconfig, 
        COALESCE(name, '') || ' ' || 
        COALESCE(short_description_english, '') || ' ' || 
        COALESCE(description, '') || ' ' || 
        COALESCE(features, '')
    )
);

-- Product relationships indexes
CREATE INDEX IF NOT EXISTS idx_product_pictograms_product ON public.product_pictograms USING btree (product_id);
CREATE INDEX IF NOT EXISTS idx_product_media_product ON public.product_media USING btree (product_id);
CREATE INDEX IF NOT EXISTS idx_product_labels_product ON public.product_labels USING btree (product_id);
CREATE INDEX IF NOT EXISTS idx_product_labels_current ON public.product_labels USING btree (is_current);

-- Triggers for Updated At Timestamps
-- ================================================================
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_variants_updated_at BEFORE UPDATE ON product_variants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_label_templates_updated_at BEFORE UPDATE ON label_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Database Views
-- ================================================================

-- Products with Category Information
CREATE OR REPLACE VIEW products_with_category AS
SELECT 
    p.*,
    c.name as category_name,
    c.slug as category_slug
FROM products p
LEFT JOIN categories c ON p.category_id = c.id;

-- Products with Pictograms (Aggregated)
CREATE OR REPLACE VIEW products_with_pictograms AS
SELECT 
    p.*,
    ARRAY_AGG(pg.name ORDER BY pp.sort_order) as pictogram_names,
    ARRAY_AGG(pg.url ORDER BY pp.sort_order) as pictogram_urls
FROM products p
LEFT JOIN product_pictograms pp ON p.id = pp.product_id
LEFT JOIN pictograms pg ON pp.pictogram_id = pg.id AND pg.is_active = true
GROUP BY p.id;

-- Verification Queries (for maintenance)
-- ================================================================
/*
-- Table row counts (uncomment to run)
SELECT 'products' as table_name, COUNT(*) as row_count FROM products
UNION ALL SELECT 'categories', COUNT(*) FROM categories
UNION ALL SELECT 'pictograms', COUNT(*) FROM pictograms
UNION ALL SELECT 'product_pictograms', COUNT(*) FROM product_pictograms
UNION ALL SELECT 'product_variants', COUNT(*) FROM product_variants
UNION ALL SELECT 'product_specifications', COUNT(*) FROM product_specifications
UNION ALL SELECT 'application_methods', COUNT(*) FROM application_methods
UNION ALL SELECT 'product_media', COUNT(*) FROM product_media
UNION ALL SELECT 'label_templates', COUNT(*) FROM label_templates
UNION ALL SELECT 'label_template_versions', COUNT(*) FROM label_template_versions
UNION ALL SELECT 'template_css_variables', COUNT(*) FROM template_css_variables
UNION ALL SELECT 'template_components', COUNT(*) FROM template_components
UNION ALL SELECT 'layout_presets', COUNT(*) FROM layout_presets
UNION ALL SELECT 'individual_label_templates', COUNT(*) FROM individual_label_templates
UNION ALL SELECT 'individual_css_overrides', COUNT(*) FROM individual_css_overrides
UNION ALL SELECT 'product_labels', COUNT(*) FROM product_labels
ORDER BY table_name;

-- Foreign key integrity check
SELECT 
    p.name as product_name,
    c.name as category_name
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.category_id IS NOT NULL AND c.id IS NULL;

-- Active products without pictograms
SELECT p.name, p.slug 
FROM products p
LEFT JOIN product_pictograms pp ON p.id = pp.product_id
WHERE p.is_active = true AND pp.product_id IS NULL;
*/

-- ================================================================
-- END OF CANONICAL SCHEMA
-- ================================================================
-- 
-- For development use:
-- - Primary reference: docs/canonical-database-schema-2025-09-08.md
-- - TypeScript types: src/lib/database.types.ts (1,103 lines)
-- - Last verified: September 8, 2025
-- - Production database: bnwbjrlgoylmbblfmsru
--
-- Maintenance notes:
-- - Regenerate types: supabase gen types typescript --linked > src/lib/database.types.ts
-- - Update this file when major schema changes occur
-- - Cross-validate with live database quarterly
-- ================================================================
