#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function investigateIdMismatch() {
  console.log('🔍 Investigating ID relationships...\n');

  try {
    // Get All Shield EX from products table
    console.log('1. Looking for "All Shield EX" in products table:');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, slug')
      .ilike('name', '%All Shield EX%');

    if (productsError) throw productsError;
    
    if (products && products.length > 0) {
      products.forEach(product => {
        console.log(`   📦 Product: ${product.name}`);
        console.log(`   🆔 Product ID: ${product.id}`);
        console.log(`   🔗 Slug: ${product.slug}\n`);
      });
    } else {
      console.log('   ❌ No products found with "All Shield EX" in name\n');
    }

    // Get All Shield EX from label_templates table
    console.log('2. Looking for "All Shield EX" in label_templates table:');
    const { data: templates, error: templatesError } = await supabase
      .from('label_templates')
      .select('id, name, slug')
      .ilike('name', '%All Shield EX%');

    if (templatesError) throw templatesError;
    
    if (templates && templates.length > 0) {
      templates.forEach(template => {
        console.log(`   📄 Template: ${template.name}`);
        console.log(`   🆔 Template ID: ${template.id}`);
        console.log(`   🔗 Slug: ${template.slug}\n`);
      });
    } else {
      console.log('   ❌ No templates found with "All Shield EX" in name\n');
    }

    // Get entries from individual_label_templates
    console.log('3. Checking individual_label_templates table:');
    const { data: individual, error: individualError } = await supabase
      .from('individual_label_templates')
      .select('*');

    if (individualError) throw individualError;
    
    if (individual && individual.length > 0) {
      individual.forEach(record => {
        console.log(`   🎨 Individual Template ID: ${record.id}`);
        console.log(`   🔗 Product ID: ${record.product_id}`);
        console.log(`   📄 Template ID: ${record.template_id}`);
        console.log(`   📝 Notes: ${record.notes || 'None'}`);
        console.log(`   📅 Created: ${record.created_at}`);
        console.log(`   📅 Updated: ${record.updated_at}\n`);
      });
    } else {
      console.log('   ❌ No records found in individual_label_templates\n');
    }

    // Cross-reference the IDs
    console.log('4. Cross-referencing IDs:');
    if (individual && individual.length > 0) {
      for (const record of individual) {
        console.log(`\n   🔍 Analyzing record ${record.id}:`);
        
        // Check if product_id exists in products table
        const { data: productCheck } = await supabase
          .from('products')
          .select('id, name')
          .eq('id', record.product_id)
          .single();
        
        if (productCheck) {
          console.log(`   ✅ product_id ${record.product_id} found in products: ${productCheck.name}`);
        } else {
          console.log(`   ❌ product_id ${record.product_id} NOT found in products table`);
          
          // Check if it matches a template ID instead
          const { data: templateCheck } = await supabase
            .from('label_templates')
            .select('id, name')
            .eq('id', record.product_id)
            .single();
          
          if (templateCheck) {
            console.log(`   ⚠️  product_id ${record.product_id} MATCHES template: ${templateCheck.name}`);
            console.log(`   🚨 DATA INTEGRITY ISSUE: product_id points to template, not product!`);
          }
        }

        // Check if template_id exists in label_templates
        const { data: templateCheck } = await supabase
          .from('label_templates')
          .select('id, name')
          .eq('id', record.template_id)
          .single();
        
        if (templateCheck) {
          console.log(`   ✅ template_id ${record.template_id} found in templates: ${templateCheck.name}`);
        } else {
          console.log(`   ❌ template_id ${record.template_id} NOT found in label_templates table`);
        }
      }
    }

    // Show all products for reference
    console.log('\n5. All products in database (first 10):');
    const { data: allProducts } = await supabase
      .from('products')
      .select('id, name')
      .limit(10);
    
    if (allProducts) {
      allProducts.forEach(product => {
        console.log(`   📦 ${product.name} (${product.id})`);
      });
    }

    // Show all templates for reference
    console.log('\n6. All label templates in database:');
    const { data: allTemplates } = await supabase
      .from('label_templates')
      .select('id, name');
    
    if (allTemplates) {
      allTemplates.forEach(template => {
        console.log(`   📄 ${template.name} (${template.id})`);
      });
    }

  } catch (error) {
    console.error('❌ Error investigating ID relationships:', error);
  }
}

investigateIdMismatch();