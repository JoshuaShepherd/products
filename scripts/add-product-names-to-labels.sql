-- Add product_name and template_name columns to product_labels table
-- This makes it much easier to identify which product labels we're working with

-- Add the columns if they don't exist
ALTER TABLE product_labels 
ADD COLUMN IF NOT EXISTS product_name VARCHAR(255);

ALTER TABLE product_labels 
ADD COLUMN IF NOT EXISTS template_name VARCHAR(255);

-- Update all product labels with the actual product and template names
UPDATE product_labels 
SET 
    product_name = p.name,
    template_name = lt.name
FROM products p, label_templates lt
WHERE product_labels.product_id = p.id 
  AND product_labels.template_id = lt.id;

-- Show sample results
SELECT 
    id,
    product_name,
    template_name,
    product_id,
    template_id,
    created_at
FROM product_labels 
ORDER BY product_name, template_name
LIMIT 10;