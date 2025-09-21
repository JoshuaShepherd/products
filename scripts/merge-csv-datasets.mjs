#!/usr/bin/env node

/**
 * CSV Dataset Merger for SpecChem Products
 * 
 * This script merges two CSV datasets:
 * 1. SpecChem_Master_Database.csv (comprehensive with competitor data)
 * 2. products_rows.csv (clean structured data aligned with database schema)
 * 
 * Strategy: Use products_rows.csv as the authoritative source for core product data,
 * then enrich with additional fields from SpecChem_Master_Database.csv
 * 
 * Output: A unified CSV ready for database import with proper column mapping
 */

import { readFileSync, writeFileSync } from 'fs';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import path from 'path';

// Database schema mapping based on canonical schema
const DATABASE_SCHEMA_MAPPING = {
  // Core product fields (from products_rows.csv - authoritative)
  'product': 'name',
  'short_description_english': 'short_description_english',
  'short_description_french': 'short_description_french', 
  'short_description_spanish': 'short_description_spanish',
  'description': 'description',
  'application': 'application',
  'features': 'features',
  'coverage': 'coverage',
  'shelf_life': 'shelf_life',
  'limitations': 'limitations',
  'signal_word': 'signal_word',
  'components_determining_hazard': 'components_determining_hazard',
  'hazard_statements': 'hazard_statements',
  'precautionary_statements': 'precautionary_statements',
  'response_statements': 'response_statements',
  'first_aid': 'first_aid',
  'storage': 'storage',
  'disposal': 'disposal',
  
  // French fields
  'composants_determinant_le_danger': 'composants_determinant_le_danger',
  'mot_de_signalement': 'mot_de_signalement',
  'mentions_de_danger': 'mentions_de_danger',
  'conseils_de_prudence': 'conseils_de_prudence',
  'premiers_soins': 'premiers_soins',
  'mesures_de_premiers_secours': 'mesures_de_premiers_secours',
  'consignes_de_stockage': 'consignes_de_stockage',
  'consignes_delimination': 'consignes_delimination',
  
  // Transportation fields
  'proper_shipping_name': 'proper_shipping_name',
  'un_number': 'un_number',
  'hazard_class': 'hazard_class',
  'packing_group': 'packing_group',
  'emergency_response_guide': 'emergency_response_guide',
  
  // Product attributes
  'green_conscious': 'green_conscious',
  'do_not_freeze': 'do_not_freeze',
  'mix_well': 'mix_well',
  'used_by_date': 'used_by_date',
  'subtitle_1': 'subtitle_1',
  'subtitle_2': 'subtitle_2',
  'voc_data': 'voc_data',
  'category': 'category',
  'pictograms': 'pictograms'
};

// Extended fields from SpecChem_Master_Database.csv (competitive analysis, etc.)
const EXTENDED_FIELDS_MAPPING = {
  // DOT/Regulatory
  'dot_approved_states': 'dot_approved_states',
  'dot_states_count': 'dot_states_count',
  
  // Competitor analysis fields (selective - most valuable ones)
  'competitor_BASF': 'competitor_basf',
  'competitor_SIKA': 'competitor_sika',
  'competitor_Mapei': 'competitor_mapei',
  'competitor_Prosoco': 'competitor_prosoco',
  'competitor_W.R. Meadows': 'competitor_wr_meadows',
  'competitor_Euclid/Tamms': 'competitor_euclid_tamms',
  'competitor_Laticrete': 'competitor_laticrete',
  
  // Custom fields from specchemcomplete dataset
  'custom_fields_csv_data_id_specchemcomplete': 'legacy_id',
  'custom_fields_csv_data_pictogram_urls_specchemcomplete': 'pictogram_urls',
  'custom_fields_csv_data_left_font_specchemcomplete': 'label_left_font',
  'custom_fields_csv_data_right_font_specchemcomplete': 'label_right_font',
  
  // Additional metadata
  'product_video_link_ProductsMerged': 'video_link',
  'thumbnailUrl_ProductsMerged': 'thumbnail_url',
  'standards_ProductsMerged': 'standards',
  'test_data_ProductsMerged': 'test_data',
  'uses_ProductsMerged': 'uses',
  'cleaning_ProductsMerged': 'cleaning_info'
};

function loadCSV(filePath) {
  console.log(`📂 Loading CSV: ${path.basename(filePath)}`);
  const content = readFileSync(filePath, 'utf-8');
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    quote: '"',
    escape: '"'
  });
  console.log(`   ✅ Loaded ${records.length} records`);
  return records;
}

function normalizeProductName(name) {
  return name
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/['"]/g, '')
    .toLowerCase();
}

function createProductSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function cleanValue(value) {
  if (!value || value === '' || value === 'null' || value === 'undefined') {
    return null;
  }
  
  // Handle boolean-like values
  if (typeof value === 'string') {
    const lower = value.toLowerCase().trim();
    if (lower === 'true' || lower === 'yes' || lower === '1') return true;
    if (lower === 'false' || lower === 'no' || lower === '0') return false;
  }
  
  return typeof value === 'string' ? value.trim() : value;
}

function mergePictograms(primary, secondary) {
  const pictograms = new Set();
  
  // Parse primary pictograms
  if (primary) {
    const primaryUrls = primary.split(/[,;]/).map(url => url.trim()).filter(Boolean);
    primaryUrls.forEach(url => pictograms.add(url));
  }
  
  // Parse secondary pictograms
  if (secondary) {
    const secondaryUrls = secondary.split(/[,;]/).map(url => url.trim()).filter(Boolean);
    secondaryUrls.forEach(url => pictograms.add(url));
  }
  
  return Array.from(pictograms).join(',');
}

function mergeDatasets() {
  console.log('🔄 Starting CSV dataset merge process...');
  console.log('==========================================');
  
  // Load both datasets
  const productsRows = loadCSV('./public/data/products_rows.csv');
  const masterDatabase = loadCSV('./public/data/SpecChem_Master_Database.csv');
  
  console.log('\n📊 Dataset Analysis:');
  console.log(`   products_rows.csv: ${productsRows.length} records`);
  console.log(`   SpecChem_Master_Database.csv: ${masterDatabase.length} records`);
  
  // Create lookup map for master database by normalized product name
  const masterLookup = new Map();
  masterDatabase.forEach(record => {
    const normalizedName = normalizeProductName(record.product || '');
    if (normalizedName) {
      masterLookup.set(normalizedName, record);
    }
  });
  
  console.log(`   Created lookup map with ${masterLookup.size} entries`);
  
  // Merge datasets
  const mergedData = [];
  const notFoundInMaster = [];
  const conflictReport = [];
  
  productsRows.forEach((primaryRecord, index) => {
    const productName = primaryRecord.product || '';
    const normalizedName = normalizeProductName(productName);
    
    if (!normalizedName) {
      console.warn(`⚠️  Row ${index + 1}: Empty product name, skipping`);
      return;
    }
    
    // Start with primary record as base
    const mergedRecord = {
      // Generate database-friendly fields
      slug: createProductSlug(productName),
      sort_order: index,
      is_active: true,
      
      // Map core fields from products_rows.csv (authoritative)
      name: cleanValue(productName),
      short_description_english: cleanValue(primaryRecord.short_description_english),
      short_description_french: cleanValue(primaryRecord.short_description_french),
      short_description_spanish: cleanValue(primaryRecord.short_description_spanish),
      description: cleanValue(primaryRecord.description),
      application: cleanValue(primaryRecord.application),
      features: cleanValue(primaryRecord.features),
      coverage: cleanValue(primaryRecord.coverage),
      shelf_life: cleanValue(primaryRecord.shelf_life),
      limitations: cleanValue(primaryRecord.limitations),
      signal_word: cleanValue(primaryRecord.signal_word),
      components_determining_hazard: cleanValue(primaryRecord.components_determining_hazard),
      hazard_statements: cleanValue(primaryRecord.hazard_statements),
      precautionary_statements: cleanValue(primaryRecord.precautionary_statements),
      response_statements: cleanValue(primaryRecord.response_statements),
      first_aid: cleanValue(primaryRecord.first_aid),
      storage: cleanValue(primaryRecord.storage),
      disposal: cleanValue(primaryRecord.disposal),
      
      // French fields
      composants_determinant_le_danger: cleanValue(primaryRecord.composants_determinant_le_danger),
      mot_de_signalement: cleanValue(primaryRecord.mot_de_signalement),
      mentions_de_danger: cleanValue(primaryRecord.mentions_de_danger),
      conseils_de_prudence: cleanValue(primaryRecord.conseils_de_prudence),
      premiers_soins: cleanValue(primaryRecord.premiers_soins),
      mesures_de_premiers_secours: cleanValue(primaryRecord.mesures_de_premiers_secours),
      consignes_de_stockage: cleanValue(primaryRecord.consignes_de_stockage),
      consignes_delimination: cleanValue(primaryRecord.consignes_delimination),
      
      // Transportation
      proper_shipping_name: cleanValue(primaryRecord.proper_shipping_name),
      un_number: cleanValue(primaryRecord.un_number),
      hazard_class: cleanValue(primaryRecord.hazard_class),
      packing_group: cleanValue(primaryRecord.packing_group),
      emergency_response_guide: cleanValue(primaryRecord.emergency_response_guide),
      
      // Product attributes
      green_conscious: cleanValue(primaryRecord.green_conscious),
      do_not_freeze: cleanValue(primaryRecord.do_not_freeze),
      mix_well: cleanValue(primaryRecord.mix_well),
      used_by_date: cleanValue(primaryRecord.used_by_date),
      subtitle_1: cleanValue(primaryRecord.subtitle_1),
      subtitle_2: cleanValue(primaryRecord.subtitle_2),
      voc_data: cleanValue(primaryRecord.voc_data),
      category: cleanValue(primaryRecord.category),
      pictograms: cleanValue(primaryRecord.pictograms)
    };
    
    // Enrich with data from master database if found
    const masterRecord = masterLookup.get(normalizedName);
    if (masterRecord) {
      // Add extended fields from master database
      mergedRecord.dot_approved_states = cleanValue(masterRecord.dot_approved_states);
      mergedRecord.dot_states_count = cleanValue(masterRecord.dot_states_count);
      
      // Competitor analysis (selective)
      mergedRecord.competitor_basf = cleanValue(masterRecord.competitor_BASF);
      mergedRecord.competitor_sika = cleanValue(masterRecord.competitor_SIKA);
      mergedRecord.competitor_mapei = cleanValue(masterRecord.competitor_Mapei);
      mergedRecord.competitor_prosoco = cleanValue(masterRecord.competitor_Prosoco);
      mergedRecord.competitor_wr_meadows = cleanValue(masterRecord['competitor_W.R. Meadows']);
      mergedRecord.competitor_euclid_tamms = cleanValue(masterRecord['competitor_Euclid/Tamms']);
      mergedRecord.competitor_laticrete = cleanValue(masterRecord.competitor_Laticrete);
      
      // Custom fields
      mergedRecord.legacy_id = cleanValue(masterRecord.custom_fields_csv_data_id_specchemcomplete);
      mergedRecord.pictogram_urls = cleanValue(masterRecord.custom_fields_csv_data_pictogram_urls_specchemcomplete);
      mergedRecord.label_left_font = cleanValue(masterRecord.custom_fields_csv_data_left_font_specchemcomplete);
      mergedRecord.label_right_font = cleanValue(masterRecord.custom_fields_csv_data_right_font_specchemcomplete);
      
      // Additional metadata
      mergedRecord.video_link = cleanValue(masterRecord.product_video_link_ProductsMerged);
      mergedRecord.thumbnail_url = cleanValue(masterRecord.thumbnailUrl_ProductsMerged);
      mergedRecord.standards = cleanValue(masterRecord.standards_ProductsMerged);
      mergedRecord.test_data = cleanValue(masterRecord.test_data_ProductsMerged);
      mergedRecord.uses = cleanValue(masterRecord.uses_ProductsMerged);
      mergedRecord.cleaning_info = cleanValue(masterRecord.cleaning_ProductsMerged);
      
      // Merge pictograms from both sources
      const primaryPictograms = primaryRecord.pictograms;
      const masterPictograms = masterRecord.custom_fields_csv_data_pictogram_urls_specchemcomplete;
      if (primaryPictograms || masterPictograms) {
        mergedRecord.pictograms = mergePictograms(primaryPictograms, masterPictograms);
      }
      
      // Check for conflicts in core fields (for reporting)
      const conflicts = [];
      ['description', 'application', 'features', 'signal_word'].forEach(field => {
        const primaryValue = cleanValue(primaryRecord[field]);
        const masterValue = cleanValue(masterRecord[`custom_fields_csv_data_${field}_specchemcomplete`]);
        if (primaryValue && masterValue && primaryValue !== masterValue) {
          conflicts.push({
            field,
            primary: primaryValue.substring(0, 100) + '...',
            master: masterValue.substring(0, 100) + '...'
          });
        }
      });
      
      if (conflicts.length > 0) {
        conflictReport.push({
          product: productName,
          conflicts
        });
      }
      
    } else {
      notFoundInMaster.push(productName);
    }
    
    mergedData.push(mergedRecord);
  });
  
  console.log('\n📈 Merge Results:');
  console.log(`   ✅ Successfully merged: ${mergedData.length} products`);
  console.log(`   ⚠️  Not found in master DB: ${notFoundInMaster.length} products`);
  console.log(`   🔍 Conflicts detected: ${conflictReport.length} products`);
  
  // Generate output files
  const timestamp = new Date().toISOString().split('T')[0];
  
  // 1. Main merged dataset
  const mergedCsv = stringify(mergedData, { 
    header: true,
    quoted_string: true,
    quote: '"',
    escape: '"'
  });
  writeFileSync(`./public/data/merged-products-${timestamp}.csv`, mergedCsv);
  console.log(`\n💾 Saved merged dataset: merged-products-${timestamp}.csv`);
  
  // 2. Not found report
  if (notFoundInMaster.length > 0) {
    const notFoundCsv = stringify(
      notFoundInMaster.map(name => ({ product_name: name })), 
      { header: true }
    );
    writeFileSync(`./public/data/not-found-report-${timestamp}.csv`, notFoundCsv);
    console.log(`📋 Saved not found report: not-found-report-${timestamp}.csv`);
  }
  
  // 3. Conflicts report
  if (conflictReport.length > 0) {
    const conflictsCsv = stringify(
      conflictReport.flatMap(item => 
        item.conflicts.map(conflict => ({
          product_name: item.product,
          field: conflict.field,
          primary_value: conflict.primary,
          master_value: conflict.master
        }))
      ), 
      { header: true }
    );
    writeFileSync(`./public/data/conflicts-report-${timestamp}.csv`, conflictsCsv);
    console.log(`⚠️  Saved conflicts report: conflicts-report-${timestamp}.csv`);
  }
  
  // 4. Database import script
  generateDatabaseImportScript(mergedData, timestamp);
  
  console.log('\n🎯 Summary:');
  console.log('==========================================');
  console.log(`Total products processed: ${mergedData.length}`);
  console.log(`Core database fields: ${Object.keys(DATABASE_SCHEMA_MAPPING).length}`);
  console.log(`Extended analysis fields: ${Object.keys(EXTENDED_FIELDS_MAPPING).length}`);
  console.log(`Data completeness: ${Math.round((mergedData.length - notFoundInMaster.length) / mergedData.length * 100)}%`);
  console.log('==========================================');
  
  return {
    mergedData,
    notFoundInMaster,
    conflictReport,
    timestamp
  };
}

function generateDatabaseImportScript(mergedData, timestamp) {
  const importScript = `-- Generated Database Import Script (SAFE MODE - No Overwrites)
-- Date: ${new Date().toISOString()}
-- Products: ${mergedData.length}
-- Source: CSV merge of products_rows.csv + SpecChem_Master_Database.csv
-- 
-- SAFETY NOTICE: This script uses ON CONFLICT DO NOTHING to preserve existing data
-- Only NEW products will be added - existing products will NOT be overwritten
--

-- First, ensure categories exist
INSERT INTO categories (name, slug, description, is_active) VALUES
  ('Cleaners & Strippers', 'cleaners-strippers', 'Concrete cleaning and stripping products', true),
  ('Decorative & Protective Sealers; Water Repellents', 'sealers-repellents', 'Decorative sealers and water repellent products', true),
  ('Concrete Sealer/Densifier/Hardener', 'sealer-densifier-hardener', 'Concrete densification and hardening products', true)
ON CONFLICT (slug) DO NOTHING;

-- Import products with proper category mapping (SAFE MODE - Only new products)
${mergedData.map(product => {
  const categorySlug = product.category ? 
    product.category.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-') : 
    'uncategorized';
  
  return `-- Product: ${product.name}
INSERT INTO products (
    name, slug, short_description_english, short_description_french, short_description_spanish,
    description, application, features, coverage, shelf_life, limitations,
    signal_word, components_determining_hazard, hazard_statements, precautionary_statements,
    response_statements, first_aid, storage, disposal,
    composants_determinant_le_danger, mot_de_signalement, mentions_de_danger, conseils_de_prudence,
    premiers_soins, mesures_de_premiers_secours, consignes_de_stockage, consignes_delimination,
    proper_shipping_name, un_number, hazard_class, packing_group, emergency_response_guide,
    green_conscious, do_not_freeze, mix_well, used_by_date, subtitle_1, subtitle_2, voc_data,
    category_id, sort_order, is_active
  ) VALUES (
    ${[
      product.name,
      product.slug,
      product.short_description_english,
      product.short_description_french,
      product.short_description_spanish,
      product.description,
      product.application,
      product.features,
      product.coverage,
      product.shelf_life,
      product.limitations,
      product.signal_word,
      product.components_determining_hazard,
      product.hazard_statements,
      product.precautionary_statements,
      product.response_statements,
      product.first_aid,
      product.storage,
      product.disposal,
      product.composants_determinant_le_danger,
      product.mot_de_signalement,
      product.mentions_de_danger,
      product.conseils_de_prudence,
      product.premiers_soins,
      product.mesures_de_premiers_secours,
      product.consignes_de_stockage,
      product.consignes_delimination,
      product.proper_shipping_name,
      product.un_number,
      product.hazard_class,
      product.packing_group,
      product.emergency_response_guide,
      product.green_conscious,
      product.do_not_freeze,
      product.mix_well,
      product.used_by_date,
      product.subtitle_1,
      product.subtitle_2,
      product.voc_data
    ].map(val => val === null ? 'NULL' : `'${String(val).replace(/'/g, "''")}'`).join(', ')},
    (SELECT id FROM categories WHERE slug = '${categorySlug}'),
    ${product.sort_order || 0},
    ${product.is_active || true}
  ) ON CONFLICT (slug) DO NOTHING;  -- SAFE: Will not overwrite existing products`;
}).join('\n\n')}

-- Log completion
SELECT 'Import completed successfully' as status, 
       COUNT(*) as total_products,
       COUNT(*) FILTER (WHERE created_at >= CURRENT_TIMESTAMP - INTERVAL '1 minute') as new_products_added
FROM products;
`;
  
  writeFileSync(`./scripts/import-merged-products-${timestamp}.sql`, importScript);
  console.log(`🗃️  Generated SAFE SQL import script: import-merged-products-${timestamp}.sql`);
  console.log(`     ✅ Uses ON CONFLICT DO NOTHING - existing data will NOT be overwritten`);
  
  // Also generate an UPDATE script for when you DO want to update existing records
  const updateScript = importScript.replace(
    /ON CONFLICT \(slug\) DO NOTHING;  -- SAFE: Will not overwrite existing products/g,
    `ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    short_description_english = EXCLUDED.short_description_english,
    short_description_french = EXCLUDED.short_description_french,
    short_description_spanish = EXCLUDED.short_description_spanish,
    description = EXCLUDED.description,
    application = EXCLUDED.application,
    features = EXCLUDED.features,
    updated_at = CURRENT_TIMESTAMP;  -- WARNING: This WILL overwrite existing data`
  ).replace(
    'Generated Database Import Script (SAFE MODE - No Overwrites)',
    'Generated Database Import Script (UPDATE MODE - WILL OVERWRITE EXISTING DATA)'
  ).replace(
    'SAFETY NOTICE: This script uses ON CONFLICT DO NOTHING to preserve existing data\n-- Only NEW products will be added - existing products will NOT be overwritten',
    'WARNING: This script uses ON CONFLICT DO UPDATE SET to overwrite existing data\n-- EXISTING products WILL be updated with CSV data - USE WITH CAUTION'
  );
  
  writeFileSync(`./scripts/update-merged-products-${timestamp}.sql`, updateScript);
  console.log(`⚠️  Generated UPDATE SQL script: update-merged-products-${timestamp}.sql`);
  console.log(`     🚨 Uses ON CONFLICT DO UPDATE - existing data WILL be overwritten`);
}

// Execute the merge if this script is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    mergeDatasets();
  } catch (error) {
    console.error('❌ Error during merge process:', error);
    process.exit(1);
  }
}

export { mergeDatasets };
