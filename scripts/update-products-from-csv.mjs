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

async function updateProductsFromCSV() {
  try {
    console.log('🔄 Starting product updates from CSV...');
    
    // Read the CSV file
    const csvPath = path.join(process.cwd(), 'public', 'data', 'products_rows.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    
    // Parse CSV
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      relax_column_count: true
    });
    
    console.log(`📊 Found ${records.length} products in CSV`);
    
    let updatedCount = 0;
    let errorCount = 0;
    
    for (const record of records) {
      try {
        const productName = record.product?.trim();
        const slug = createSlug(productName);
        
        if (!productName) {
          console.log('⚠️  Skipping row with empty product name');
          continue;
        }
        
        // Prepare the update data focusing on the columns that had issues
        const updateData = {
          description: record.description || null,
          limitations: record.limitations || null,
          shelf_life: record.shelf_life || null,
          // Also update other important fields while we're at it
          application: record.application || null,
          features: record.features || null,
          coverage: record.coverage || null,
          voc_data: record.voc_data || null,
          short_description_english: record.short_description_english || null,
          short_description_french: record.short_description_french || null,
          short_description_spanish: record.short_description_spanish || null,
        };
        
        // Update the product by slug (assuming slug is unique)
        const { data, error } = await supabase
          .from('products')
          .update(updateData)
          .eq('slug', slug)
          .select('id, name');
        
        if (error) {
          console.error(`❌ Error updating ${productName}:`, error.message);
          errorCount++;
          continue;
        }
        
        if (data && data.length > 0) {
          console.log(`✅ Updated: ${productName} (${slug})`);
          updatedCount++;
        } else {
          console.log(`⚠️  No product found with slug: ${slug} (${productName})`);
        }
        
      } catch (rowError) {
        console.error(`❌ Error processing row for ${record.product}:`, rowError.message);
        errorCount++;
      }
    }
    
    console.log('\n📋 Update Summary:');
    console.log(`✅ Successfully updated: ${updatedCount} products`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📊 Total processed: ${records.length} records`);
    
  } catch (error) {
    console.error('💥 Fatal error:', error.message);
    process.exit(1);
  }
}

// Run the update
updateProductsFromCSV();
