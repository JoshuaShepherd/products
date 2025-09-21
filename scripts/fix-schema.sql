-- Fix schema constraints to accommodate CSV data

-- 1. Expand UN number field
ALTER TABLE products ALTER COLUMN un_number TYPE varchar(50);

-- 2. Drop existing enum types and recreate with proper values
DROP TYPE IF EXISTS hazard_class CASCADE;
CREATE TYPE hazard_class AS ENUM (
  'Not applicable',
  'Not regulated', 
  'None',
  'Class 3 - Flammable Liquid',
  'Class 3',
  '3 (Combustible Liquid)',
  'Class 8 – Corrosive', 
  'Class 8 - Corrosive',
  'Class 8',
  'PGIII',
  '9',
  'Packing Group III',
  '3',
  'Class 3 – Flammable Liquid',
  'Class 3 - Combustible Liquid',
  '3 (Flammable liquid)',
  'PGII', 
  'Class 3 – Combustible Liquid',
  'PG II',
  'PG III',
  'Class 3; Class 8',
  'Class 3 - Flammable Liquids',
  'Flammable Liquid',
  '3 – Flammable Liquid'
);

DROP TYPE IF EXISTS packing_group CASCADE;
CREATE TYPE packing_group AS ENUM (
  'Not applicable',
  'Not regulated',
  'None',
  'PG II',
  'III', 
  'PGII',
  '153',
  'NA ERG 153',
  'II',
  'PG III',
  '154',
  'PGIII',
  '128'
);

-- 3. Re-add the constraints to products table
ALTER TABLE products ALTER COLUMN hazard_class TYPE hazard_class USING hazard_class::text::hazard_class;
ALTER TABLE products ALTER COLUMN packing_group TYPE packing_group USING packing_group::text::packing_group;

-- 4. Expand other fields that might be too small
ALTER TABLE products ALTER COLUMN name TYPE varchar(500);
ALTER TABLE products ALTER COLUMN proper_shipping_name TYPE varchar(500);
ALTER TABLE products ALTER COLUMN emergency_response_guide TYPE varchar(50);
