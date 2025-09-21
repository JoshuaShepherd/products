-- Add warranty and conditions columns to products table
-- Date: September 9, 2025
-- Purpose: Add modular warranty/conditions text columns

-- Step 1: Add the four new columns to the products table
ALTER TABLE public.products 
ADD COLUMN conditions_of_sale TEXT,
ADD COLUMN warranty_limitation TEXT,
ADD COLUMN inherent_risk TEXT,
ADD COLUMN additional_terms TEXT;

-- Step 2: Populate all existing products with the standard text
UPDATE public.products 
SET 
  conditions_of_sale = 'CONDITIONS OF SALE - SpecChem offers this product for sale subject to and limited by the warranty which may only be varied by written agreement of a duly authorized corporate officer of Spec-Chem. No other representative of or for SpecChem is authorized to grant any warranty or to waive limitation of liability set forth below.',
  
  warranty_limitation = 'WARRANTY LIMITATION - SpecChem warrants this product to be free of manufacturing defects. If the product when purchased was defective and was within use period indicated on container or carton, when used, SpecChem will replace the defective product with new product without charge to the purchaser. SpecChem makes no other warranty, either expressed or implied, concerning this product. There is no warranty of merchantability. NO CLAIM OF ANY KIND SHALL BE GREATER THAN THE PURCHASE PRICE OF THE PRODUCT IN RESPECT OF WHICH DAMAGES ARE CLAIMED.',
  
  inherent_risk = 'INHERENT RISK - Purchaser assumes all risk associated with the use or application of the product.',
  
  additional_terms = NULL -- Leave empty for future use
WHERE id IS NOT NULL;

-- Step 3: Add comments to document the columns
COMMENT ON COLUMN public.products.conditions_of_sale IS 'Standard conditions of sale text for product labels and documentation';
COMMENT ON COLUMN public.products.warranty_limitation IS 'Standard warranty limitation text for product labels and documentation';
COMMENT ON COLUMN public.products.inherent_risk IS 'Standard inherent risk disclaimer text for product labels and documentation';
COMMENT ON COLUMN public.products.additional_terms IS 'Optional additional terms or conditions specific to individual products';

-- Step 4: Create indexes for potential future searching (optional)
CREATE INDEX IF NOT EXISTS idx_products_conditions_search ON public.products USING gin (
  to_tsvector('english', 
    COALESCE(conditions_of_sale, '') || ' ' || 
    COALESCE(warranty_limitation, '') || ' ' || 
    COALESCE(inherent_risk, '') || ' ' ||
    COALESCE(additional_terms, '')
  )
);

-- Verification query to check the update worked
-- SELECT 
--   name,
--   length(conditions_of_sale) as conditions_length,
--   length(warranty_limitation) as warranty_length,
--   length(inherent_risk) as risk_length,
--   additional_terms
-- FROM public.products 
-- LIMIT 5;
