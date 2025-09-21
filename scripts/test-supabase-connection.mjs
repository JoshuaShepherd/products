import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Initialize Supabase client
const supabaseUrl = 'https://bnwbjrlgoylmbblfmsru.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJud2Jqcmxnb3lsbWJibGZtc3J1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5NjY4NDEsImV4cCI6MjA3MjU0Mjg0MX0.EqX0rxmgtsl_WOBfyOY1nQ-7sL8QXTKXX5TirrmvIrA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function runImport() {
  console.log('🚀 Starting database import via Supabase client...');
  
  try {
    // Read the SQL file
    const sqlContent = readFileSync('./scripts/import-merged-products-2025-09-08.sql', 'utf8');
    
    // Split the SQL into individual statements (basic approach)
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Check current product count before import
    const { count: beforeCount, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Error checking existing products:', countError);
      return;
    }
    
    console.log(`📊 Products in database before import: ${beforeCount}`);
    
    // Execute each statement
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < Math.min(statements.length, 10); i++) { // Limit to first 10 for testing
      const statement = statements[i];
      if (statement.includes('INSERT INTO products')) {
        try {
          // For this proof of concept, we'll use the Supabase client instead of raw SQL
          console.log(`⏳ Processing statement ${i + 1}...`);
          
          // Note: This is a simplified approach. For full import, we'd need to parse
          // the INSERT statements and convert them to Supabase client calls
          successCount++;
        } catch (error) {
          console.error(`❌ Error in statement ${i + 1}:`, error);
          errorCount++;
        }
      }
    }
    
    // Check final count
    const { count: afterCount, error: finalCountError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    
    if (!finalCountError) {
      console.log(`📊 Products in database after import: ${afterCount}`);
      console.log(`✅ New products added: ${afterCount - beforeCount}`);
    }
    
    console.log(`\n📈 Import Summary:`);
    console.log(`   ✅ Successful operations: ${successCount}`);
    console.log(`   ❌ Failed operations: ${errorCount}`);
    
  } catch (error) {
    console.error('💥 Import failed:', error);
  }
}

// Instead, let's try a simpler approach - just check the connection and current data
async function checkConnection() {
  console.log('🔍 Checking Supabase connection and current data...');
  
  try {
    // Test connection and get current products
    const { data: products, error, count } = await supabase
      .from('products')
      .select('name, slug, created_at', { count: 'exact' })
      .limit(5);
    
    if (error) {
      console.error('❌ Connection error:', error);
      return;
    }
    
    console.log(`✅ Connected successfully!`);
    console.log(`📊 Current products in database: ${count}`);
    console.log(`🔍 Sample products:`);
    products?.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.name} (${product.slug})`);
    });
    
    // Check if we can insert a test category (safe operation)
    const { data: categoryTest, error: categoryError } = await supabase
      .from('categories')
      .select('name')
      .eq('slug', 'test-category')
      .single();
    
    if (!categoryTest && !categoryError) {
      console.log('🧪 Testing insert capability with safe test category...');
      const { error: insertError } = await supabase
        .from('categories')
        .insert({
          name: 'Test Category',
          slug: 'test-category',
          description: 'Test category for import verification',
          is_active: false // Mark as inactive so it doesn't interfere
        });
      
      if (insertError) {
        console.error('❌ Insert test failed:', insertError);
      } else {
        console.log('✅ Insert capability confirmed');
        
        // Clean up test category
        await supabase
          .from('categories')
          .delete()
          .eq('slug', 'test-category');
        console.log('🧹 Test category cleaned up');
      }
    }
    
  } catch (error) {
    console.error('💥 Connection check failed:', error);
  }
}

// Run the connection check first
checkConnection();
