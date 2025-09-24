-- =====================================================
-- CREATE INDIVIDUAL_LABEL_TEMPLATES TABLE
-- =====================================================
-- This table stores product-specific CSS customizations
-- for the new label editor system.

-- Create the main table
CREATE TABLE IF NOT EXISTS individual_label_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  template_id UUID REFERENCES label_templates(id) ON DELETE SET NULL,
  css_overrides TEXT,
  custom_css TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Ensure one customization per product (for now)
  UNIQUE(product_id)
);

-- Create index for faster lookups by product_id
CREATE INDEX IF NOT EXISTS idx_individual_label_templates_product_id 
ON individual_label_templates(product_id);

-- Add Row Level Security (RLS)
ALTER TABLE individual_label_templates ENABLE ROW LEVEL SECURITY;

-- Allow all users (authenticated and anonymous) to perform all operations
-- Note: This is permissive for development - tighten security for production
CREATE POLICY "Allow all operations for all users" 
ON individual_label_templates 
FOR ALL 
TO public 
USING (true) 
WITH CHECK (true);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check if table was created successfully
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'individual_label_templates' 
ORDER BY ordinal_position;

-- Check foreign key constraints
SELECT 
  tc.table_name, 
  tc.constraint_name, 
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.table_name = 'individual_label_templates';

-- Check indexes
SELECT 
  tablename, 
  indexname, 
  indexdef 
FROM pg_indexes 
WHERE tablename = 'individual_label_templates';

-- Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'individual_label_templates';