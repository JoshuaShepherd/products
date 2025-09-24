// Test script to check individual_label_templates table
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'SET' : 'MISSING');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? 'SET' : 'MISSING');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabase() {
  console.log('🔍 Testing individual_label_templates table...\n');

  // Test 1: Check if table exists and structure
  console.log('1. Checking table structure:');
  try {
    const { data, error } = await supabase
      .from('individual_label_templates')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Error querying table:', error);
    } else {
      console.log('✅ Table exists and is queryable');
      console.log('📊 Sample data structure:', data);
    }
  } catch (err) {
    console.error('❌ Exception:', err.message);
  }

  // Test 2: Check specific columns the code expects
  console.log('\n2. Testing specific columns:');
  try {
    const { data, error } = await supabase
      .from('individual_label_templates')
      .select('custom_css, css_overrides, template_id, notes')
      .limit(1);
    
    if (error) {
      console.error('❌ Error selecting specific columns:', error);
    } else {
      console.log('✅ All expected columns exist');
    }
  } catch (err) {
    console.error('❌ Exception selecting columns:', err.message);
  }

  // Test 3: Try to query by product_id (what the app does)
  console.log('\n3. Testing product_id query:');
  try {
    const { data, error } = await supabase
      .from('individual_label_templates')
      .select('custom_css, css_overrides, template_id, notes')
      .eq('product_id', '00000000-0000-0000-0000-000000000000'); // Dummy UUID
    
    if (error) {
      console.error('❌ Error querying by product_id:', error);
    } else {
      console.log('✅ Product_id query works (returned empty as expected)');
    }
  } catch (err) {
    console.error('❌ Exception querying by product_id:', err.message);
  }

  // Test 4: Check label_templates table too
  console.log('\n4. Testing label_templates table:');
  try {
    const { data, error } = await supabase
      .from('label_templates')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Error querying label_templates:', error);
    } else {
      console.log('✅ Label_templates table works');
      console.log('📊 Available templates:', data?.length || 0);
    }
  } catch (err) {
    console.error('❌ Exception querying label_templates:', err.message);
  }
}

testDatabase().then(() => {
  console.log('\n🏁 Database test complete');
  process.exit(0);
}).catch(err => {
  console.error('💥 Test failed:', err);
  process.exit(1);
});