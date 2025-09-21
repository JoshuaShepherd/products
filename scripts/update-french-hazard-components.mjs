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

async function updateComposantsDeterminantDanger() {
  try {
    console.log('🔄 Starting composants_determinant_le_danger updates from CSV...');
    console.log('📁 Working directory:', process.cwd());
    
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
    let skippedCount = 0;
    
    for (const record of records) {
      try {
        const productName = record.product?.trim();
        const slug = createSlug(productName);
        
        if (!productName) {
          console.log('⚠️  Skipping row with empty product name');
          skippedCount++;
          continue;
        }
        
        // Check if there's data for composants_determinant_le_danger
        const composantsData = record.composants_determinant_le_danger?.trim();
        
        if (!composantsData) {
          console.log(`⏭️  Skipping ${productName} - no French hazard components data`);
          skippedCount++;
          continue;
        }
        
        // Prepare the update data focusing on the French hazard components column
        const updateData = {
          composants_determinant_le_danger: composantsData
        };
        
        // Update the product by slug
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
          console.log(`   📝 French components: ${composantsData.substring(0, 100)}${composantsData.length > 100 ? '...' : ''}`);
          updatedCount++;
        } else {
          console.log(`⚠️  No product found with slug: ${slug} (${productName})`);
          skippedCount++;
        }
        
      } catch (rowError) {
        console.error(`❌ Error processing row for ${record.product}:`, rowError.message);
        errorCount++;
      }
    }
    
    console.log('\n📋 Update Summary for composants_determinant_le_danger:');
    console.log(`✅ Successfully updated: ${updatedCount} products`);
    console.log(`⏭️  Skipped (no data or not found): ${skippedCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📊 Total processed: ${records.length} records`);
    
  } catch (error) {
    console.error('💥 Fatal error:', error.message);
    process.exit(1);
  }
}

// Run the update
updateComposantsDeterminantDanger();
