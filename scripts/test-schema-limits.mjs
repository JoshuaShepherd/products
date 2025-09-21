#!/usr/bin/env node

// Simple script to check actual database schema via SQL queries
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bnwbjrlgoylmbblfmsru.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJud2Jqcmxnb3lsbWJibGZtc3J1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Njk2Njg0MSwiZXhwIjoyMDcyNTQyODQxfQ.Mu9GFonaN_tyIFWod9X8GYg_kyGN4HW8mbXU9OmEL_M';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkColumnTypes() {
  console.log('🔍 Checking column types for critical fields...\n');

  // Use raw SQL to get column information
  const { data, error } = await supabase.rpc('sql', {
    query: `
      SELECT 
        column_name, 
        data_type, 
        character_maximum_length,
        is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'products' 
        AND table_schema = 'public'
        AND column_name IN (
          'name', 'proper_shipping_name', 'emergency_response_guide', 
          'shelf_life', 'voc_data', 'subtitle_1', 'subtitle_2', 'un_number'
        )
      ORDER BY column_name;
    `
  });

  if (error) {
    console.log('❌ SQL query not available, trying alternative approach...');
    
    // Let's try to understand the schema by testing long strings
    console.log('🧪 Testing column constraints by attempting to insert long values...');
    
    const testData = {
      name: 'Test Product - Very Long Name That Might Get Truncated If VARCHAR Limits Still Exist',
      proper_shipping_name: 'This is a very long proper shipping name that would definitely be truncated if there were still VARCHAR(255) constraints in place',
      emergency_response_guide: 'Not applicable - this should be the full text and not truncated to "Not applic"',
      shelf_life: 'This is a very long shelf life description that should not be truncated if the column was properly expanded to TEXT type',
      voc_data: 'Very long VOC data string that would be truncated if VARCHAR constraints still exist',
      subtitle_1: 'Very long subtitle 1 that would be truncated',
      subtitle_2: 'Very long subtitle 2 that would be truncated',
      slug: 'test-long-fields-' + Date.now()
    };

    // Try to insert test data to see what gets truncated
    const { data: insertResult, error: insertError } = await supabase
      .from('products')
      .insert(testData)
      .select()
      .single();

    if (insertError) {
      console.log('❌ Insert failed:', insertError.message);
    } else {
      console.log('✅ Test record inserted successfully');
      console.log('📊 Checking for truncation in inserted data...\n');
      
      Object.keys(testData).forEach(field => {
        if (typeof testData[field] === 'string') {
          const original = testData[field];
          const stored = insertResult[field];
          const truncated = original !== stored;
          
          console.log(`${field}:`);
          console.log(`  Original length: ${original.length}`);
          console.log(`  Stored length: ${stored ? stored.length : 0}`);
          console.log(`  Truncated: ${truncated ? '❌ YES' : '✅ NO'}`);
          if (truncated) {
            console.log(`  Stored value: "${stored}"`);
          }
          console.log('');
        }
      });

      // Clean up test record
      await supabase
        .from('products')
        .delete()
        .eq('id', insertResult.id);
      
      console.log('🧹 Test record cleaned up');
    }
  } else {
    console.log('✅ Column information retrieved:');
    console.log('');
    console.log('Column Name              | Data Type | Max Length | Nullable');
    console.log('-------------------------|-----------|------------|----------');
    
    data.forEach(col => {
      const maxLen = col.character_maximum_length || 'unlimited';
      const nullable = col.is_nullable === 'YES' ? 'YES' : 'NO';
      console.log(`${col.column_name.padEnd(24)} | ${col.data_type.padEnd(9)} | ${String(maxLen).padEnd(10)} | ${nullable}`);
    });
  }
}

async function checkExistingData() {
  console.log('\n🔬 Checking existing data for truncation patterns...');
  
  const { data: products, error } = await supabase
    .from('products')
    .select('name, emergency_response_guide, proper_shipping_name, shelf_life')
    .not('emergency_response_guide', 'is', null)
    .limit(10);

  if (!error && products) {
    console.log('\nSample emergency_response_guide values:');
    products.forEach(product => {
      const guide = product.emergency_response_guide;
      if (guide && guide.length > 0) {
        const possiblyTruncated = guide.endsWith('applic') || guide.length === 10;
        console.log(`- "${guide}" ${possiblyTruncated ? '❌ (possibly truncated)' : '✅'}`);
      }
    });
  }
}

async function main() {
  await checkColumnTypes();
  await checkExistingData();
}

main().catch(console.error);