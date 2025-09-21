#!/usr/bin/env node

// Check if the conditional fields have data in the database
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bnwbjrlgoylmbblfmsru.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJud2Jqcmxnb3lsbWJibGZtc3J1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Njk2Njg0MSwiZXhwIjoyMDcyNTQyODQxfQ.Mu9GFonaN_tyIFWod9X8GYg_kyGN4HW8mbXU9OmEL_M';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkConditionalFields() {
  console.log('🔍 Checking conditional template fields...\n');

  // Check for the fields that control the sections that aren't rendering
  const { data: products, error } = await supabase
    .from('products')
    .select('name, safety_notice, conditions_of_sale, warranty_limitation, inherent_risk, additional_terms, manufacturing_notice')
    .limit(10);

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log('📊 Sample products and their conditional field values:\n');
  
  products.forEach((product, index) => {
    console.log(`${index + 1}. ${product.name}`);
    console.log(`   safety_notice: ${product.safety_notice || 'NULL'}`);
    console.log(`   conditions_of_sale: ${product.conditions_of_sale || 'NULL'}`);
    console.log(`   warranty_limitation: ${product.warranty_limitation || 'NULL'}`);
    console.log(`   inherent_risk: ${product.inherent_risk || 'NULL'}`);
    console.log(`   additional_terms: ${product.additional_terms || 'NULL'}`);
    console.log(`   manufacturing_notice: ${product.manufacturing_notice || 'NULL'}`);
    console.log('');
  });

  // Count how many products have data in these fields
  const { data: counts, error: countError } = await supabase
    .from('products')
    .select('id')
    .not('safety_notice', 'is', null)
    .neq('safety_notice', '');

  const { data: salesCounts, error: salesError } = await supabase
    .from('products')  
    .select('id')
    .not('conditions_of_sale', 'is', null)
    .neq('conditions_of_sale', '');

  if (!countError && !salesError) {
    console.log(`🔢 Products with safety_notice: ${counts?.length || 0}`);
    console.log(`🔢 Products with conditions_of_sale: ${salesCounts?.length || 0}`);
  }
}

async function checkSpecificProduct() {
  console.log('\n🎯 Checking specific product (All Shield EX)...\n');
  
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .ilike('name', '%All Shield EX%')
    .single();

  if (error) {
    console.error('❌ Product not found:', error);
    return;
  }

  console.log('📋 All Shield EX field values:');
  console.log(`name: "${product.name}"`);
  console.log(`safety_notice: ${product.safety_notice ? `"${product.safety_notice}"` : 'NULL'}`);
  console.log(`conditions_of_sale: ${product.conditions_of_sale ? `"${product.conditions_of_sale}"` : 'NULL'}`);
  console.log(`warranty_limitation: ${product.warranty_limitation ? `"${product.warranty_limitation}"` : 'NULL'}`);
  console.log(`inherent_risk: ${product.inherent_risk ? `"${product.inherent_risk}"` : 'NULL'}`);
  console.log(`additional_terms: ${product.additional_terms ? `"${product.additional_terms}"` : 'NULL'}`);
  console.log(`manufacturing_notice: ${product.manufacturing_notice ? `"${product.manufacturing_notice}"` : 'NULL'}`);
}

async function main() {
  await checkConditionalFields();
  await checkSpecificProduct();
}

main().catch(console.error);