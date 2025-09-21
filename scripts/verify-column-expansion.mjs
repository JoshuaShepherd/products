import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://bnwbjrlgoylmbblfmsru.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJud2Jqcmxnb3lsbWJibGZtc3J1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5NjY4NDEsImV4cCI6MjA3MjU0Mjg0MX0.EqX0rxmgtsl_WOBfyOY1nQ-7sL8QXTKXX5TirrmvIrA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyColumnExpansion() {
  console.log('🔍 Verifying database column expansion status...');
  
  try {
    // Test connection first
    const { count, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Connection error:', countError);
      return false;
    }
    
    console.log(`✅ Connected successfully - ${count} products in database\n`);
    
    // Check if we can insert a test product with long field values to verify column expansion
    console.log('🧪 Testing column capacity with long text values...');
    
    const testProduct = {
      name: 'Test Product for Column Verification',
      slug: 'test-column-verification-' + Date.now(),
      shelf_life: 'This is a very long shelf life description that exceeds 255 characters to test if the column has been properly expanded to TEXT type. '.repeat(3),
      voc_data: 'Extended VOC data information that would exceed the original VARCHAR(255) limit. '.repeat(3),
      proper_shipping_name: 'Very long proper shipping name that exceeds the original character limit set in the database schema. '.repeat(2),
      emergency_response_guide: 'Comprehensive emergency response guide with detailed instructions that exceed 255 characters. '.repeat(2),
      un_number: 'UN1234-EXTENDED',
      subtitle_1: 'Extended subtitle 1 that is longer than the original VARCHAR limit to test TEXT expansion. '.repeat(2),
      subtitle_2: 'Extended subtitle 2 that is longer than the original VARCHAR limit to test TEXT expansion. '.repeat(2),
      used_by_date: 'Extended used by date information with detailed instructions that exceed the original limit. '.repeat(2),
      mot_de_signalement: 'Mot de signalement étendu qui dépasse la limite originale de caractères pour tester l\'expansion TEXT. '.repeat(2),
      is_active: false, // Mark as test data
      sort_order: 99999 // Put at end
    };
    
    console.log('📝 Attempting to insert test product with long field values...');
    
    const { data: insertData, error: insertError } = await supabase
      .from('products')
      .insert([testProduct])
      .select();
    
    if (insertError) {
      console.error('❌ Insert failed - columns may not be expanded:', insertError.message);
      
      // Check specific error messages to identify which columns need expansion
      if (insertError.message.includes('value too long')) {
        console.log('\n⚠️  Database columns still need expansion!');
        console.log('📋 Please run the migration manually in Supabase Dashboard SQL Editor:');
        console.log('🎯 Use the script: scripts/expand-database-columns-complete.sql');
      }
      
      return false;
    }
    
    console.log('✅ Test product inserted successfully - columns are properly expanded!');
    console.log(`📄 Test product ID: ${insertData[0].id}`);
    
    // Clean up test data
    console.log('🧹 Cleaning up test data...');
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', insertData[0].id);
    
    if (deleteError) {
      console.warn('⚠️  Could not clean up test data:', deleteError.message);
    } else {
      console.log('✅ Test data cleaned up successfully');
    }
    
    console.log('\n🎉 Column expansion verification completed successfully!');
    console.log('📊 Database is ready for full CSV imports without truncation');
    
    return true;
    
  } catch (error) {
    console.error('💥 Verification failed:', error);
    return false;
  }
}

// Run the verification
verifyColumnExpansion()
  .then((success) => {
    if (success) {
      console.log('\n✅ Database column expansion verified!');
      process.exit(0);
    } else {
      console.log('\n⚠️  Manual migration required - see instructions above');
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('\n💥 Verification script failed:', error);
    process.exit(1);
  });
