-- Update emergency_response_guide column with full content from CSV
-- Run this to fix truncated emergency response guide values

-- Berry Clean
UPDATE products 
SET emergency_response_guide = '128'
WHERE name = 'Berry Clean';

-- All Shield EX  
UPDATE products 
SET emergency_response_guide = 'Not applicable.

In containers of 119 gallons or less this product is not regulated by DOT. Shipments in containers of more than 119 gallons, this product is regulated by DOT and must ship as flammable liquid.'
WHERE name = 'All Shield EX';

-- Clean Lift 20/20
UPDATE products 
SET emergency_response_guide = 'Not applicable'
WHERE name = 'Clean Lift 20/20';

-- IntraHard
UPDATE products 
SET emergency_response_guide = 'Not regulated'
WHERE name = 'IntraHard';

-- For any products where emergency_response_guide is truncated to 'Not applic', update to full text
UPDATE products 
SET emergency_response_guide = 'Not applicable'
WHERE emergency_response_guide = 'Not applic';

-- Verify the updates
SELECT name, emergency_response_guide 
FROM products 
WHERE name IN ('Berry Clean', 'All Shield EX', 'Clean Lift 20/20', 'IntraHard')
ORDER BY name;