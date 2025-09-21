-- Increase column lengths to prevent truncation
-- Run this script to remove character limits that are causing truncation

-- First, we need to handle any views that depend on the products table
-- Drop all views that depend on products table columns
DO $$ 
DECLARE 
    view_rec RECORD;
BEGIN
    -- Find and drop all views that depend on the products table
    FOR view_rec IN 
        SELECT schemaname, viewname 
        FROM pg_views 
        WHERE schemaname = 'public' 
        AND (viewname LIKE '%product%' OR definition LIKE '%products%')
    LOOP
        EXECUTE 'DROP VIEW IF EXISTS ' || quote_ident(view_rec.schemaname) || '.' || quote_ident(view_rec.viewname) || ' CASCADE';
        RAISE NOTICE 'Dropped view %.%', view_rec.schemaname, view_rec.viewname;
    END LOOP;
END $$;

-- Fix products table VARCHAR limitations
ALTER TABLE products 
    ALTER COLUMN proper_shipping_name TYPE TEXT,
    ALTER COLUMN emergency_response_guide TYPE TEXT,
    ALTER COLUMN shelf_life TYPE TEXT,
    ALTER COLUMN voc_data TYPE TEXT,
    ALTER COLUMN subtitle_1 TYPE TEXT,
    ALTER COLUMN subtitle_2 TYPE TEXT,
    ALTER COLUMN used_by_date TYPE TEXT,
    ALTER COLUMN un_number TYPE TEXT,
    ALTER COLUMN mot_de_signalement TYPE TEXT;

-- Fix categories table
ALTER TABLE categories 
    ALTER COLUMN name TYPE TEXT,
    ALTER COLUMN slug TYPE TEXT;

-- Fix pictograms table
ALTER TABLE pictograms 
    ALTER COLUMN name TYPE TEXT,
    ALTER COLUMN slug TYPE TEXT;

-- Fix product_media table
ALTER TABLE product_media 
    ALTER COLUMN media_type TYPE TEXT,
    ALTER COLUMN alt_text TYPE TEXT;

-- Fix label_templates table
ALTER TABLE label_templates 
    ALTER COLUMN name TYPE TEXT,
    ALTER COLUMN slug TYPE TEXT;

-- Fix product_labels table
ALTER TABLE product_labels 
    ALTER COLUMN language TYPE TEXT;

-- Add comment explaining the change
COMMENT ON TABLE products IS 'Column lengths increased to TEXT to prevent truncation issues during CSV import';

-- Recreate common product views with updated column types
CREATE OR REPLACE VIEW products_with_category AS
SELECT 
    p.*,
    c.name as category_name,
    c.slug as category_slug,
    c.description as category_description
FROM products p
LEFT JOIN categories c ON p.category_id = c.id;

-- Recreate products with pictograms view
CREATE OR REPLACE VIEW products_with_pictograms AS
SELECT 
    p.*,
    array_agg(pg.url ORDER BY pp.sort_order) as pictogram_urls,
    array_agg(pg.name ORDER BY pp.sort_order) as pictogram_names
FROM products p
LEFT JOIN product_pictograms pp ON p.id = pp.product_id
LEFT JOIN pictograms pg ON pp.pictogram_id = pg.id
GROUP BY p.id;

-- Create a comprehensive view combining category and pictograms
CREATE OR REPLACE VIEW products_complete AS
SELECT 
    p.*,
    c.name as category_name,
    c.slug as category_slug,
    c.description as category_description,
    array_agg(pg.url ORDER BY pp.sort_order) FILTER (WHERE pg.url IS NOT NULL) as pictogram_urls,
    array_agg(pg.name ORDER BY pp.sort_order) FILTER (WHERE pg.name IS NOT NULL) as pictogram_names
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN product_pictograms pp ON p.id = pp.product_id
LEFT JOIN pictograms pg ON pp.pictogram_id = pg.id
GROUP BY p.id, c.name, c.slug, c.description;

-- Grant appropriate permissions on all views
GRANT SELECT ON products_with_category TO authenticated, anon;
GRANT SELECT ON products_with_pictograms TO authenticated, anon;
GRANT SELECT ON products_complete TO authenticated, anon;

-- Verify changes
SELECT 
    column_name, 
    data_type, 
    character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'products' 
    AND table_schema = 'public'
    AND column_name IN ('proper_shipping_name', 'emergency_response_guide', 'shelf_life', 'voc_data')
ORDER BY ordinal_position;