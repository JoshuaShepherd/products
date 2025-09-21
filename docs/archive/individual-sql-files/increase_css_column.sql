-- Increase css_template column size to handle larger CSS files
ALTER TABLE label_templates 
ALTER COLUMN css_template TYPE TEXT;

-- Also increase html_template if needed
ALTER TABLE label_templates 
ALTER COLUMN html_template TYPE TEXT;

-- Check current column types
\d+ label_templates;
