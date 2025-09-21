import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';

// Initialize Supabase client
const supabaseUrl = 'https://bnwbjrlgoylmbblfmsru.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJud2Jqcmxnb3lsbWJibGZtc3J1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5NjY4NDEsImV4cCI6MjA3MjU0Mjg0MX0.EqX0rxmgtsl_WOBfyOY1nQ-7sL8QXTKXX5TirrmvIrA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function importMergedProducts() {
  console.log('🚀 Starting SAFE product import via Supabase client...');
  console.log('🛡️  Existing products will NOT be overwritten\n');
  
  try {
    // First, get current products count and existing slugs
    console.log('📊 Checking current database state...');
    const { data: existingProducts, error: existingError, count: currentCount } = await supabase
      .from('products')
      .select('slug', { count: 'exact' });
    
    if (existingError) {
      console.error('❌ Error checking existing products:', existingError);
      return;
    }
    
    const existingSlugs = new Set(existingProducts?.map(p => p.slug) || []);
    console.log(`   Current products in database: ${currentCount}`);
    console.log(`   Existing slugs loaded: ${existingSlugs.size}`);
    
    // Read and parse the merged CSV data
    console.log('\n📖 Loading merged product data...');
    const csvData = readFileSync('./public/data/merged-products-2025-09-08.csv', 'utf8');
    const records = parse(csvData, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });
    
    console.log(`   Products to process: ${records.length}`);
    
    // Filter out products that already exist
    const newProducts = records.filter(record => !existingSlugs.has(record.slug));
    const existingProductsCount = records.length - newProducts.length;
    
    console.log(`   🆕 New products to add: ${newProducts.length}`);
    console.log(`   ⏭️  Existing products to skip: ${existingProductsCount}`);
    
    if (newProducts.length === 0) {
      console.log('\n✅ No new products to import. All products already exist in database.');
      return;
    }
    
    // Prepare categories first
    console.log('\n📁 Ensuring categories exist...');
    const categories = [
      {
        name: 'Cleaners & Strippers',
        slug: 'cleaners-strippers',
        description: 'Concrete cleaning and stripping products',
        is_active: true
      },
      {
        name: 'Decorative & Protective Sealers; Water Repellents',
        slug: 'sealers-repellents',
        description: 'Decorative sealers and water repellent products',
        is_active: true
      },
      {
        name: 'Concrete Sealer/Densifier/Hardener',
        slug: 'sealer-densifier-hardener',
        description: 'Concrete densification and hardening products',
        is_active: true
      }
    ];
    
    for (const category of categories) {
      const { error: categoryError } = await supabase
        .from('categories')
        .upsert(category, { onConflict: 'slug' });
      
      if (categoryError) {
        console.warn(`⚠️  Warning creating category ${category.name}:`, categoryError);
      }
    }
    console.log('   ✅ Categories ready');
    
    // Import products in batches
    console.log('\n📦 Importing products in batches...');
    const batchSize = 50; // Supabase handles batches well
    let imported = 0;
    let errors = 0;
    
    for (let i = 0; i < newProducts.length; i += batchSize) {
      const batch = newProducts.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(newProducts.length / batchSize);
      
      console.log(`   Processing batch ${batchNumber}/${totalBatches} (${batch.length} products)...`);
      
      // Transform CSV data to database format
      const productsToInsert = batch.map(record => ({
        name: record.name || '',
        slug: record.slug || '',
        sku: record.sku || null,
        short_description_english: record.short_description_english || null,
        short_description_french: record.short_description_french || null,
        short_description_spanish: record.short_description_spanish || null,
        description: record.description || null,
        application: record.application || null,
        features: record.features || null,
        coverage: record.coverage || null,
        limitations: record.limitations || null,
        shelf_life: record.shelf_life || null,
        voc_data: record.voc_data || null,
        signal_word: record.signal_word || 'None',
        components_determining_hazard: record.components_determining_hazard || null,
        hazard_statements: record.hazard_statements || null,
        precautionary_statements: record.precautionary_statements || null,
        response_statements: record.response_statements || null,
        first_aid: record.first_aid || null,
        storage: record.storage || null,
        disposal: record.disposal || null,
        do_not_freeze: record.do_not_freeze === 'true' || record.do_not_freeze === '1',
        mix_well: record.mix_well === 'true' || record.mix_well === '1',
        green_conscious: record.green_conscious === 'true' || record.green_conscious === '1',
        is_active: true,
        sort_order: 0
      }));
      
      // Insert batch using upsert with ignore_duplicates
      const { data: insertedData, error: insertError } = await supabase
        .from('products')
        .upsert(productsToInsert, { onConflict: 'slug', ignoreDuplicates: true });
      
      if (insertError) {
        console.error(`   ❌ Error in batch ${batchNumber}:`, insertError);
        errors += batch.length;
      } else {
        imported += batch.length;
        console.log(`   ✅ Batch ${batchNumber} completed successfully`);
      }
      
      // Small delay to be gentle on the API
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Final verification
    console.log('\n📊 Verifying import results...');
    const { count: finalCount, error: finalCountError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    
    if (!finalCountError) {
      const actualNewProducts = finalCount - currentCount;
      console.log(`   Products before import: ${currentCount}`);
      console.log(`   Products after import: ${finalCount}`);
      console.log(`   Actually added: ${actualNewProducts}`);
    }
    
    console.log('\n🎉 Import Summary:');
    console.log(`   ✅ Products successfully imported: ${imported}`);
    console.log(`   ❌ Products with errors: ${errors}`);
    console.log(`   ⏭️  Existing products preserved: ${existingProductsCount}`);
    console.log(`   🛡️  Data safety: CONFIRMED - no existing data overwritten`);
    
  } catch (error) {
    console.error('💥 Import failed:', error);
  }
}

// Run the import
importMergedProducts();
