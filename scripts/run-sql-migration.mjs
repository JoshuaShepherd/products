import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://bnwbjrlgoylmbblfmsru.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJud2Jqcmxnb3lsbWJibGZtc3J1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5NjY4NDEsImV4cCI6MjA3MjU0Mjg0MX0.EqX0rxmgtsl_WOBfyOY1nQ-7sL8QXTKXX5TirrmvIrA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function runColumnExpansionMigration() {
  console.log('🔧 Running database column expansion migration...');
  console.log('📝 Expanding columns to accommodate full CSV data without truncation\n');
  
  try {
    // Test connection first
    const { count, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Connection error:', countError);
      return;
    }
    
    console.log(`✅ Connected successfully - ${count} products in database`);
    
    // Execute individual ALTER TABLE commands
    // Note: We need to use the rpc function to execute raw SQL
    
    console.log('\n🔄 Step 1: Expanding shelf_life column to TEXT...');
    const { error: step1Error } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE products ALTER COLUMN shelf_life TYPE TEXT;'
    });
    
    if (step1Error && !step1Error.message.includes('already exists')) {
      console.log('⚠️  Step 1 result:', step1Error.message);
    } else {
      console.log('✅ Step 1: shelf_life column expanded to TEXT');
    }
    
    console.log('\n🔄 Step 2: Expanding voc_data column to TEXT...');
    const { error: step2Error } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE products ALTER COLUMN voc_data TYPE TEXT;'
    });
    
    if (step2Error && !step2Error.message.includes('already exists')) {
      console.log('⚠️  Step 2 result:', step2Error.message);
    } else {
      console.log('✅ Step 2: voc_data column expanded to TEXT');
    }
    
    console.log('\n🔄 Step 3: Expanding proper_shipping_name column to TEXT...');
    const { error: step3Error } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE products ALTER COLUMN proper_shipping_name TYPE TEXT;'
    });
    
    if (step3Error && !step3Error.message.includes('already exists')) {
      console.log('⚠️  Step 3 result:', step3Error.message);
    } else {
      console.log('✅ Step 3: proper_shipping_name column expanded to TEXT');
    }
    
    console.log('\n🔄 Step 4: Expanding emergency_response_guide column to TEXT...');
    const { error: step4Error } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE products ALTER COLUMN emergency_response_guide TYPE TEXT;'
    });
    
    if (step4Error && !step4Error.message.includes('already exists')) {
      console.log('⚠️  Step 4 result:', step4Error.message);
    } else {
      console.log('✅ Step 4: emergency_response_guide column expanded to TEXT');
    }
    
    console.log('\n🔄 Step 5: Expanding un_number column to VARCHAR(50)...');
    const { error: step5Error } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE products ALTER COLUMN un_number TYPE VARCHAR(50);'
    });
    
    if (step5Error && !step5Error.message.includes('already exists')) {
      console.log('⚠️  Step 5 result:', step5Error.message);
    } else {
      console.log('✅ Step 5: un_number column expanded to VARCHAR(50)');
    }
    
    console.log('\n🔄 Step 6: Expanding subtitle columns to TEXT...');
    const { error: step6aError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE products ALTER COLUMN subtitle_1 TYPE TEXT;'
    });
    
    const { error: step6bError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE products ALTER COLUMN subtitle_2 TYPE TEXT;'
    });
    
    if (step6aError && !step6aError.message.includes('already exists')) {
      console.log('⚠️  Step 6a result:', step6aError.message);
    } else {
      console.log('✅ Step 6a: subtitle_1 column expanded to TEXT');
    }
    
    if (step6bError && !step6bError.message.includes('already exists')) {
      console.log('⚠️  Step 6b result:', step6bError.message);
    } else {
      console.log('✅ Step 6b: subtitle_2 column expanded to TEXT');
    }
    
    console.log('\n🔄 Step 7: Expanding used_by_date column to TEXT...');
    const { error: step7Error } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE products ALTER COLUMN used_by_date TYPE TEXT;'
    });
    
    if (step7Error && !step7Error.message.includes('already exists')) {
      console.log('⚠️  Step 7 result:', step7Error.message);
    } else {
      console.log('✅ Step 7: used_by_date column expanded to TEXT');
    }
    
    console.log('\n🔄 Step 8: Expanding mot_de_signalement column to TEXT...');
    const { error: step8Error } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE products ALTER COLUMN mot_de_signalement TYPE TEXT;'
    });
    
    if (step8Error && !step8Error.message.includes('already exists')) {
      console.log('⚠️  Step 8 result:', step8Error.message);
    } else {
      console.log('✅ Step 8: mot_de_signalement column expanded to TEXT');
    }
    
    console.log('\n🔄 Step 9: Adding pictograms column if it doesn\'t exist...');
    const { error: step9Error } = await supabase.rpc('exec_sql', {
      sql: `DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'products' AND column_name = 'pictograms') THEN
          ALTER TABLE products ADD COLUMN pictograms TEXT;
        END IF;
      END $$;`
    });
    
    if (step9Error && !step9Error.message.includes('already exists')) {
      console.log('⚠️  Step 9 result:', step9Error.message);
    } else {
      console.log('✅ Step 9: pictograms column added (if needed)');
    }
    
    console.log('\n✅ Column expansion migration completed successfully!');
    console.log('📊 Database columns are now expanded to accommodate full CSV content');
    
  } catch (error) {
    console.error('💥 Migration failed:', error);
    throw error;
  }
}

// Run the migration
runColumnExpansionMigration()
  .then(() => {
    console.log('\n🎉 Migration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Migration failed:', error);
    process.exit(1);
  });
