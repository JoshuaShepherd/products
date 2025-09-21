-- Database Column Expansion Migration (View-Safe)
-- Date: 2025-09-08
-- Purpose: Expand column limits to accommodate full CSV data without truncation
-- NEVER truncate authoritative CSV content - expand database to fit the data

-- First, drop dependent views to allow column type changes
DROP VIEW IF EXISTS products_with_category;

-- Expand VARCHAR columns that are too restrictive
-- These columns had 255 character limits but CSV data is longer

-- Expand shelf_life column (had 362 chars in CSV)  
ALTER TABLE products ALTER COLUMN shelf_life TYPE TEXT;

-- Expand voc_data column (may have long technical specifications)
ALTER TABLE products ALTER COLUMN voc_data TYPE TEXT;

-- Expand proper_shipping_name column (213+ chars found in CSV)
ALTER TABLE products ALTER COLUMN proper_shipping_name TYPE TEXT;

-- Expand emergency_response_guide column (213+ chars found in CSV)
ALTER TABLE products ALTER COLUMN emergency_response_guide TYPE TEXT;

-- Expand un_number column (may have longer identifiers)
ALTER TABLE products ALTER COLUMN un_number TYPE VARCHAR(50);

-- Expand subtitle columns (may have longer descriptions)
ALTER TABLE products ALTER COLUMN subtitle_1 TYPE TEXT;
ALTER TABLE products ALTER COLUMN subtitle_2 TYPE TEXT;

-- Expand used_by_date column (may have detailed date information)
ALTER TABLE products ALTER COLUMN used_by_date TYPE TEXT;

-- Expand French translation columns that may be longer
ALTER TABLE products ALTER COLUMN mot_de_signalement TYPE TEXT;

-- Add any missing columns that appeared in the CSV but aren't in the schema
-- Based on the CSV analysis, we may need these additional columns:

-- Check if pictograms column exists (for storing comma-separated pictogram URLs)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'products' AND column_name = 'pictograms') THEN
    ALTER TABLE products ADD COLUMN pictograms TEXT;
  END IF;
END $$;

-- Check if pictogram_urls column exists 
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'products' AND column_name = 'pictogram_urls') THEN
    ALTER TABLE products ADD COLUMN pictogram_urls TEXT;
  END IF;
END $$;

-- Check if test_data column exists (for technical specifications)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'products' AND column_name = 'test_data') THEN
    ALTER TABLE products ADD COLUMN test_data TEXT;
  END IF;
END $$;

-- Check if cleaning_info column exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'products' AND column_name = 'cleaning_info') THEN
    ALTER TABLE products ADD COLUMN cleaning_info TEXT;
  END IF;
END $$;

-- Recreate the products_with_category view with updated column types
CREATE VIEW products_with_category AS
SELECT 
    p.*,
    c.name as category_name,
    c.slug as category_slug
FROM products p
LEFT JOIN categories c ON p.category_id = c.id;

-- Update the updated_at trigger to include new columns if they were added
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at 
  BEFORE UPDATE ON products 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Add indexes for the new columns to maintain performance
CREATE INDEX IF NOT EXISTS idx_products_pictograms ON products USING gin(to_tsvector('english', COALESCE(pictograms, '')));
CREATE INDEX IF NOT EXISTS idx_products_test_data ON products USING gin(to_tsvector('english', COALESCE(test_data, '')));

-- Create migrations_log table if it doesn't exist
CREATE TABLE IF NOT EXISTS migrations_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  migration_name VARCHAR(255) UNIQUE NOT NULL,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Log the migration completion
INSERT INTO migrations_log (migration_name, applied_at) 
VALUES ('expand_product_columns_2025_09_08', CURRENT_TIMESTAMP)
ON CONFLICT (migration_name) DO UPDATE SET applied_at = CURRENT_TIMESTAMP;

-- Create a view to verify column types after migration
CREATE OR REPLACE VIEW product_column_info AS
SELECT 
  column_name,
  data_type,
  character_maximum_length,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'products' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Final verification query
SELECT 'Column expansion migration completed' as status,
       COUNT(*) as total_columns
FROM information_schema.columns 
WHERE table_name = 'products' AND table_schema = 'public';
