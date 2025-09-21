-- Add manufacturing and safety notice columns to products table
-- Date: September 9, 2025
-- Purpose: Add columns for "Made in America" and safety notices

-- Step 1: Add the two new columns to the products table
ALTER TABLE public.products 
ADD COLUMN manufacturing_notice TEXT,
ADD COLUMN safety_notice TEXT;

-- Step 2: Populate all existing products with the standard text
UPDATE public.products 
SET 
  manufacturing_notice = 'Made in America',
  safety_notice = 'DO NOT EXPOSE TO OR APPLY NEAR FIRE OR FLAMES. FOR WELL VENTILATED OR EXTERIOR USE ONLY!'
WHERE id IS NOT NULL;

-- Step 3: Add comments to document the columns
COMMENT ON COLUMN public.products.manufacturing_notice IS 'Manufacturing location notice for product labels (e.g., "Made in America")';
COMMENT ON COLUMN public.products.safety_notice IS 'General safety notice text for product labels and documentation';

-- Step 4: Create index for potential future searching (optional)
CREATE INDEX IF NOT EXISTS idx_products_notices_search ON public.products USING gin (
  to_tsvector('english', 
    COALESCE(manufacturing_notice, '') || ' ' || 
    COALESCE(safety_notice, '')
  )
);

-- Verification query to check the update worked
-- SELECT 
--   name,
--   manufacturing_notice,
--   safety_notice
-- FROM public.products 
-- LIMIT 5;
