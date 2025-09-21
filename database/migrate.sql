-- Data migration script to import CSV data into the structured database
-- This script processes the products_rows.csv data into the normalized schema

-- Create a temporary table to hold the raw CSV data
CREATE TEMP TABLE temp_csv_import (
    product TEXT,
    short_description_english TEXT,
    short_description_french TEXT,
    short_description_spanish TEXT,
    description TEXT,
    application TEXT,
    features TEXT,
    coverage TEXT,
    shelf_life TEXT,
    limitations TEXT,
    pictograms TEXT,
    signal_word TEXT,
    components_determining_hazard TEXT,
    hazard_statements TEXT,
    precautionary_statements TEXT,
    response_statements TEXT,
    first_aid TEXT,
    storage TEXT,
    disposal TEXT,
    composants_determinant_le_danger TEXT,
    mot_de_signalement TEXT,
    mentions_de_danger TEXT,
    conseils_de_prudence TEXT,
    premiers_soins TEXT,
    mesures_de_premiers_secours TEXT,
    consignes_de_stockage TEXT,
    consignes_delimination TEXT,
    pictogram_urls TEXT,
    proper_shipping_name TEXT,
    un_number TEXT,
    hazard_class TEXT,
    packing_group TEXT,
    emergency_response_guide TEXT,
    green_conscious TEXT,
    do_not_freeze TEXT,
    mix_well TEXT,
    used_by_date TEXT,
    subtitle_1 TEXT,
    subtitle_2 TEXT,
    voc_data TEXT,
    category TEXT
);

-- Function to clean and normalize text data
CREATE OR REPLACE FUNCTION clean_text(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
    IF input_text IS NULL OR input_text = '' THEN
        RETURN NULL;
    END IF;
    
    -- Remove HTML entities and tags, trim whitespace
    RETURN TRIM(
        regexp_replace(
            regexp_replace(
                regexp_replace(input_text, '&amp;', '&', 'g'),
                '&lt;', '<', 'g'
            ),
            '&gt;', '>', 'g'
        )
    );
END;
$$ LANGUAGE plpgsql;

-- Function to generate slug from name
CREATE OR REPLACE FUNCTION generate_slug(input_name TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN lower(
        regexp_replace(
            regexp_replace(
                regexp_replace(input_name, '[^a-zA-Z0-9\s-]', '', 'g'),
                '\s+', '-', 'g'
            ),
            '-+', '-', 'g'
        )
    );
END;
$$ LANGUAGE plpgsql;

-- Function to map signal word to enum
CREATE OR REPLACE FUNCTION map_signal_word(input_word TEXT)
RETURNS hazard_signal AS $$
BEGIN
    CASE UPPER(TRIM(COALESCE(input_word, '')))
        WHEN 'DANGER' THEN RETURN 'Danger'::hazard_signal;
        WHEN 'WARNING' THEN RETURN 'Warning'::hazard_signal;
        ELSE RETURN 'None'::hazard_signal;
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- Function to map hazard class to enum
CREATE OR REPLACE FUNCTION map_hazard_class(input_class TEXT)
RETURNS hazard_class AS $$
BEGIN
    CASE 
        WHEN input_class ILIKE '%class 1%' THEN RETURN 'Class 1'::hazard_class;
        WHEN input_class ILIKE '%class 2%' THEN RETURN 'Class 2'::hazard_class;
        WHEN input_class ILIKE '%class 3%' THEN RETURN 'Class 3'::hazard_class;
        WHEN input_class ILIKE '%class 4%' THEN RETURN 'Class 4'::hazard_class;
        WHEN input_class ILIKE '%class 5%' THEN RETURN 'Class 5'::hazard_class;
        WHEN input_class ILIKE '%class 6%' THEN RETURN 'Class 6'::hazard_class;
        WHEN input_class ILIKE '%class 7%' THEN RETURN 'Class 7'::hazard_class;
        WHEN input_class ILIKE '%class 8%' THEN RETURN 'Class 8'::hazard_class;
        WHEN input_class ILIKE '%class 9%' THEN RETURN 'Class 9'::hazard_class;
        ELSE RETURN 'Not applicable'::hazard_class;
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- Function to map packing group to enum
CREATE OR REPLACE FUNCTION map_packing_group(input_pg TEXT)
RETURNS packing_group AS $$
BEGIN
    CASE UPPER(TRIM(COALESCE(input_pg, '')))
        WHEN 'PG I', 'I' THEN RETURN 'PG I'::packing_group;
        WHEN 'PG II', 'II' THEN RETURN 'PG II'::packing_group;
        WHEN 'PG III', 'III' THEN RETURN 'PG III'::packing_group;
        ELSE RETURN 'Not applicable'::packing_group;
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- After importing CSV data via COPY command or application, 
-- process the data into the normalized schema:

-- Insert categories from CSV data
INSERT INTO categories (name, slug, description)
SELECT DISTINCT 
    clean_text(category) as name,
    generate_slug(clean_text(category)) as slug,
    'Product category imported from CSV data' as description
FROM temp_csv_import 
WHERE clean_text(category) IS NOT NULL
    AND clean_text(category) != ''
ON CONFLICT (slug) DO NOTHING;

-- Insert products from CSV data
INSERT INTO products (
    name, slug, category_id, short_description_english, short_description_french, 
    short_description_spanish, description, application, features, coverage, 
    limitations, shelf_life, voc_data, signal_word, components_determining_hazard,
    hazard_statements, precautionary_statements, response_statements, first_aid,
    storage, disposal, composants_determinant_le_danger, mot_de_signalement,
    mentions_de_danger, conseils_de_prudence, premiers_soins, 
    mesures_de_premiers_secours, consignes_de_stockage, consignes_delimination,
    proper_shipping_name, un_number, hazard_class, packing_group, 
    emergency_response_guide, subtitle_1, subtitle_2, do_not_freeze, mix_well,
    green_conscious, used_by_date
)
SELECT 
    clean_text(t.product) as name,
    generate_slug(clean_text(t.product)) as slug,
    c.id as category_id,
    clean_text(t.short_description_english),
    clean_text(t.short_description_french),
    clean_text(t.short_description_spanish),
    clean_text(t.description),
    clean_text(t.application),
    clean_text(t.features),
    clean_text(t.coverage),
    clean_text(t.limitations),
    clean_text(t.shelf_life),
    clean_text(t.voc_data),
    map_signal_word(t.signal_word),
    clean_text(t.components_determining_hazard),
    clean_text(t.hazard_statements),
    clean_text(t.precautionary_statements),
    clean_text(t.response_statements),
    clean_text(t.first_aid),
    clean_text(t.storage),
    clean_text(t.disposal),
    clean_text(t.composants_determinant_le_danger),
    clean_text(t.mot_de_signalement),
    clean_text(t.mentions_de_danger),
    clean_text(t.conseils_de_prudence),
    clean_text(t.premiers_soins),
    clean_text(t.mesures_de_premiers_secours),
    clean_text(t.consignes_de_stockage),
    clean_text(t.consignes_delimination),
    clean_text(t.proper_shipping_name),
    clean_text(t.un_number),
    map_hazard_class(t.hazard_class),
    map_packing_group(t.packing_group),
    clean_text(t.emergency_response_guide),
    clean_text(t.subtitle_1),
    clean_text(t.subtitle_2),
    CASE WHEN t.do_not_freeze ILIKE '%freeze%' THEN true ELSE false END,
    CASE WHEN t.mix_well ILIKE '%mix%' THEN true ELSE false END,
    CASE WHEN t.green_conscious IS NOT NULL AND t.green_conscious != '' THEN true ELSE false END,
    clean_text(t.used_by_date)
FROM temp_csv_import t
LEFT JOIN categories c ON c.slug = generate_slug(clean_text(t.category))
WHERE clean_text(t.product) IS NOT NULL
    AND clean_text(t.product) != ''
ON CONFLICT (slug) DO NOTHING;

-- Function to extract pictogram URLs and create associations
CREATE OR REPLACE FUNCTION process_product_pictograms()
RETURNS void AS $$
DECLARE
    product_record RECORD;
    pictogram_record RECORD;
    url_array TEXT[];
    single_url TEXT;
    pictogram_name TEXT;
BEGIN
    -- Loop through products with pictogram URLs
    FOR product_record IN 
        SELECT p.id as product_id, t.pictogram_urls
        FROM products p
        JOIN temp_csv_import t ON p.slug = generate_slug(clean_text(t.product))
        WHERE t.pictogram_urls IS NOT NULL AND t.pictogram_urls != ''
    LOOP
        -- Split URLs by comma
        url_array := string_to_array(product_record.pictogram_urls, ',');
        
        -- Process each URL
        FOREACH single_url IN ARRAY url_array
        LOOP
            single_url := TRIM(single_url);
            
            IF single_url != '' THEN
                -- Extract pictogram name from URL
                pictogram_name := 
                    CASE 
                        WHEN single_url ILIKE '%environmental-hazard%' THEN 'Environmental Hazard'
                        WHEN single_url ILIKE '%exclamation%' THEN 'Exclamation'
                        WHEN single_url ILIKE '%flame%' THEN 'Flame'
                        WHEN single_url ILIKE '%health-hazard%' THEN 'Health Hazard'
                        WHEN single_url ILIKE '%corrosion%' THEN 'Corrosion'
                        WHEN single_url ILIKE '%green-conscious%' THEN 'Green Conscious'
                        WHEN single_url ILIKE '%do-not-freeze%' THEN 'Do Not Freeze'
                        ELSE 'Unknown Pictogram'
                    END;
                
                -- Find or create the pictogram
                SELECT id INTO pictogram_record.id 
                FROM pictograms 
                WHERE name = pictogram_name;
                
                -- If pictogram found, create the association
                IF pictogram_record.id IS NOT NULL THEN
                    INSERT INTO product_pictograms (product_id, pictogram_id)
                    VALUES (product_record.product_id, pictogram_record.id)
                    ON CONFLICT (product_id, pictogram_id) DO NOTHING;
                END IF;
            END IF;
        END LOOP;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the pictogram processing
SELECT process_product_pictograms();

-- Clean up temporary functions and tables
DROP FUNCTION IF EXISTS clean_text(TEXT);
DROP FUNCTION IF EXISTS generate_slug(TEXT);
DROP FUNCTION IF EXISTS map_signal_word(TEXT);
DROP FUNCTION IF EXISTS map_hazard_class(TEXT);
DROP FUNCTION IF EXISTS map_packing_group(TEXT);
DROP FUNCTION IF EXISTS process_product_pictograms();
DROP TABLE IF EXISTS temp_csv_import;
