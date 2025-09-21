#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSchema() {
  console.log('🔍 Checking live database schema...\n');

  try {
    // Query the information_schema to get column details for products table
    const { data: columns, error } = await supabase
      .rpc('get_table_columns', {
        table_name: 'products',
        schema_name: 'public'
      })
      .select();

    if (error) {
      // Fallback - try a direct query to get some column info
      console.log('📋 Using fallback method to check schema...');
      
      // Check if we can get some sample data to infer types
      const { data: sampleData, error: sampleError } = await supabase
        .from('products')
        .select('name, proper_shipping_name, emergency_response_guide, shelf_life, voc_data')
        .limit(1);

      if (sampleError) {
        console.error('❌ Error accessing products table:', sampleError);
        return;
      }

      console.log('📊 Sample data from products table:');
      console.log(JSON.stringify(sampleData, null, 2));

      // Try to get column information another way
      const { data: schemaData, error: schemaError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, character_maximum_length')
        .eq('table_name', 'products')
        .eq('table_schema', 'public')
        .order('ordinal_position');

      if (!schemaError && schemaData) {
        console.log('\n📋 Products table schema:');
        console.log('Column Name | Data Type | Max Length');
        console.log('------------|-----------|----------');
        
        schemaData.forEach(col => {
          const maxLen = col.character_maximum_length || 'unlimited';
          console.log(`${col.column_name.padEnd(15)} | ${col.data_type.padEnd(12)} | ${maxLen}`);
        });
      } else {
        console.log('❌ Could not retrieve schema information:', schemaError);
      }
    } else {
      console.log('✅ Retrieved column information:', columns);
    }

    // Check enum types
    console.log('\n🏷️  Checking enum types...');
    const { data: enums, error: enumError } = await supabase
      .from('information_schema.check_constraints')
      .select('constraint_name, check_clause')
      .like('constraint_name', '%_check')
      .limit(10);

    if (!enumError && enums) {
      console.log('Enum constraints found:', enums.length);
      enums.forEach(enumDef => {
        console.log(`- ${enumDef.constraint_name}: ${enumDef.check_clause}`);
      });
    }

    // Check for recent data in problematic fields
    console.log('\n🔬 Checking for truncation in emergency_response_guide...');
    const { data: emergencyData, error: emergencyError } = await supabase
      .from('products')
      .select('name, emergency_response_guide')
      .not('emergency_response_guide', 'is', null)
      .limit(5);

    if (!emergencyError && emergencyData) {
      console.log('Sample emergency response guide values:');
      emergencyData.forEach(product => {
        console.log(`- ${product.name}: "${product.emergency_response_guide}"`);
      });
    }

  } catch (error) {
    console.error('❌ Error checking schema:', error);
  }
}

// Also check what tables exist
async function checkTables() {
  console.log('\n📊 Checking available tables...');
  
  const { data: tables, error } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .order('table_name');

  if (!error && tables) {
    console.log('Available tables:');
    tables.forEach(table => {
      console.log(`- ${table.table_name}`);
    });
  } else {
    console.log('❌ Error getting table list:', error);
  }
}

async function main() {
  await checkTables();
  await checkSchema();
}

main().catch(console.error);