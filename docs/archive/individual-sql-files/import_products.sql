-- First create a temporary table to import CSV data
CREATE TEMP TABLE temp_products (
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
    composants_déterminant_le_danger TEXT,
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

-- Import CSV data into temp table
-- Note: This would need to be executed with proper CSV import command
-- \COPY temp_products FROM 'public/data/products_rows.csv' WITH CSV HEADER;

-- Insert data from temp table to products table with proper type conversions
INSERT INTO products (
    name,
    slug,
    short_description_english,
    short_description_french,
    short_description_spanish,
    description,
    application,
    features,
    coverage,
    shelf_life,
    limitations,
    voc_data,
    signal_word,
    components_determining_hazard,
    hazard_statements,
    precautionary_statements,
    response_statements,
    first_aid,
    storage,
    disposal,
    composants_determinant_le_danger,
    mot_de_signalement,
    mentions_de_danger,
    conseils_de_prudence,
    premiers_soins,
    mesures_de_premiers_secours,
    consignes_de_stockage,
    consignes_delimination,
    proper_shipping_name,
    un_number,
    hazard_class,
    packing_group,
    emergency_response_guide,
    green_conscious,
    do_not_freeze,
    mix_well,
    used_by_date,
    subtitle_1,
    subtitle_2,
    is_active
)
SELECT 
    product as name,
    LOWER(REPLACE(REPLACE(REPLACE(product, ' ', '-'), '®', ''), '™', '')) as slug,
    NULLIF(short_description_english, '') as short_description_english,
    NULLIF(short_description_french, '') as short_description_french,
    NULLIF(short_description_spanish, '') as short_description_spanish,
    NULLIF(description, '') as description,
    NULLIF(application, '') as application,
    NULLIF(features, '') as features,
    NULLIF(coverage, '') as coverage,
    NULLIF(shelf_life, '') as shelf_life,
    NULLIF(limitations, '') as limitations,
    NULLIF(voc_data, '') as voc_data,
    CASE 
        WHEN NULLIF(signal_word, '') IS NULL OR LOWER(signal_word) IN ('none', 'not applicable', 'n/a') 
        THEN 'None'::hazard_signal
        WHEN LOWER(signal_word) = 'warning' THEN 'Warning'::hazard_signal
        WHEN LOWER(signal_word) = 'danger' THEN 'Danger'::hazard_signal
        ELSE 'None'::hazard_signal
    END as signal_word,
    NULLIF(components_determining_hazard, '') as components_determining_hazard,
    NULLIF(hazard_statements, '') as hazard_statements,
    NULLIF(precautionary_statements, '') as precautionary_statements,
    NULLIF(response_statements, '') as response_statements,
    NULLIF(first_aid, '') as first_aid,
    NULLIF(storage, '') as storage,
    NULLIF(disposal, '') as disposal,
    NULLIF(composants_déterminant_le_danger, '') as composants_determinant_le_danger,
    NULLIF(mot_de_signalement, '') as mot_de_signalement,
    NULLIF(mentions_de_danger, '') as mentions_de_danger,
    NULLIF(conseils_de_prudence, '') as conseils_de_prudence,
    NULLIF(premiers_soins, '') as premiers_soins,
    NULLIF(mesures_de_premiers_secours, '') as mesures_de_premiers_secours,
    NULLIF(consignes_de_stockage, '') as consignes_de_stockage,
    NULLIF(consignes_delimination, '') as consignes_delimination,
    NULLIF(proper_shipping_name, '') as proper_shipping_name,
    NULLIF(un_number, '') as un_number,
    CASE 
        WHEN NULLIF(hazard_class, '') IS NULL OR LOWER(hazard_class) IN ('not applicable', 'n/a') 
        THEN 'Not applicable'::hazard_class
        WHEN LOWER(hazard_class) LIKE '%class 3%' OR LOWER(hazard_class) = '3' 
        THEN 'Class 3'::hazard_class
        WHEN LOWER(hazard_class) LIKE '%class 8%' OR LOWER(hazard_class) = '8'
        THEN 'Class 8'::hazard_class
        WHEN LOWER(hazard_class) LIKE '%class 9%' OR LOWER(hazard_class) = '9'
        THEN 'Class 9'::hazard_class
        ELSE 'Not applicable'::hazard_class
    END as hazard_class,
    CASE 
        WHEN NULLIF(packing_group, '') IS NULL OR LOWER(packing_group) IN ('not applicable', 'n/a')
        THEN 'Not applicable'::packing_group
        WHEN LOWER(packing_group) IN ('i', '1', 'group i')
        THEN 'I'::packing_group
        WHEN LOWER(packing_group) IN ('ii', '2', 'group ii')
        THEN 'II'::packing_group
        WHEN LOWER(packing_group) IN ('iii', '3', 'group iii')
        THEN 'III'::packing_group
        ELSE 'Not applicable'::packing_group
    END as packing_group,
    NULLIF(emergency_response_guide, '') as emergency_response_guide,
    CASE 
        WHEN LOWER(green_conscious) IN ('true', 'yes', '1', 'y') THEN true
        ELSE false
    END as green_conscious,
    CASE 
        WHEN LOWER(do_not_freeze) IN ('true', 'yes', '1', 'y') THEN true
        ELSE false
    END as do_not_freeze,
    CASE 
        WHEN LOWER(mix_well) IN ('true', 'yes', '1', 'y') THEN true
        ELSE false
    END as mix_well,
    NULLIF(used_by_date, '') as used_by_date,
    NULLIF(subtitle_1, '') as subtitle_1,
    NULLIF(subtitle_2, '') as subtitle_2,
    true as is_active
FROM temp_products
WHERE product IS NOT NULL AND product != '';

-- Clean up temp table
DROP TABLE temp_products;
