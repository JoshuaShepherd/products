import { createClient } from '@supabase/supabase-js';
import { parse } from 'csv-parse/sync';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function createSlug(name) {
  return name.toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
}

function truncateText(value, maxLength) {
  if (!value) return value;
  return value.length > maxLength ? value.substring(0, maxLength) : value;
}

async function fixLongShelfLifeValues() {
  try {
    console.log('🔧 Fixing products with long shelf_life values...');
    
    // Read the CSV file
    const csvPath = path.join(process.cwd(), 'public', 'data', 'products_rows.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    
    // Parse CSV
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      relax_column_count: true
    });
    
    // List of products that had errors in the previous run
    const problematicProducts = [
      'Clean Lift 20/20',
      'Muriatic Acid',
      'Poly Fix (Part A)',
      'Poly Fix (Part B)',
      'Duo Patch',
      'MVM Prime 5000 (Part A)',
      'RevCrete™',
      'SC Metallic Grout',
      'SC Multipurpose Grout',
      'SpecCity White',
      'SpecPatch 15',
      'SpecPatch 5',
      'SpecPatch Light',
      'Xylene',
      'Spec Tilt 100',
      'SpecTilt 100 QD',
      'SpecTilt 100',
      'SpecStrip Citrus Winter Grade'
    ];
    
    let fixedCount = 0;
    
    for (const record of records) {
      const productName = record.product?.trim();
      
      if (!productName || !problematicProducts.includes(productName)) {
        continue;
      }
      
      const slug = createSlug(productName);
      console.log(`🔍 Processing: ${productName} (${slug})`);
      console.log(`📏 Original shelf_life length: ${record.shelf_life?.length || 0}`);
      
      // Prepare the update data with truncated shelf_life
      const updateData = {
        description: record.description || null,
        limitations: record.limitations || null,
        shelf_life: truncateText(record.shelf_life, 255), // Truncate to 255 chars
        application: record.application || null,
        features: record.features || null,
        coverage: record.coverage || null,
        voc_data: record.voc_data || null,
        short_description_english: record.short_description_english || null,
        short_description_french: record.short_description_french || null,
        short_description_spanish: record.short_description_spanish || null,
      };
      
      console.log(`✂️  Truncated shelf_life length: ${updateData.shelf_life?.length || 0}`);
      
      // Update the product by slug
      const { data, error } = await supabase
        .from('products')
        .update(updateData)
        .eq('slug', slug)
        .select('id, name');
      
      if (error) {
        console.error(`❌ Error updating ${productName}:`, error.message);
        continue;
      }
      
      if (data && data.length > 0) {
        console.log(`✅ Fixed: ${productName} (${slug})`);
        fixedCount++;
      } else {
        console.log(`⚠️  No product found with slug: ${slug} (${productName})`);
      }
    }
    
    console.log('\n📋 Fix Summary:');
    console.log(`✅ Successfully fixed: ${fixedCount} products`);
    
  } catch (error) {
    console.error('💥 Fatal error:', error.message);
    process.exit(1);
  }
}

// Run the fix
fixLongShelfLifeValues();
