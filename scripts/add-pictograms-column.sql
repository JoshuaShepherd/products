-- Add pictograms column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS pictograms TEXT;
