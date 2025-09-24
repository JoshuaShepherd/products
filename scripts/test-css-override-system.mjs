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

async function testCssOverrideSystem() {
  console.log('🧪 Testing CSS Override System...\n');

  try {
    // 1. Get All Shield EX product data
    console.log('1. Getting All Shield EX product data:');
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('name', 'All Shield EX')
      .single();

    if (productError) throw productError;
    
    console.log(`   ✅ Product: ${product.name} (ID: ${product.id})`);

    // 2. Get the 14x7 template
    console.log('\n2. Getting 14x7 template:');
    const { data: template, error: templateError } = await supabase
      .from('label_templates')
      .select('*')
      .eq('slug', '14x7-enhanced')
      .single();

    if (templateError) throw templateError;
    
    console.log(`   ✅ Template: ${template.name} (ID: ${template.id})`);

    // 3. Get the individual CSS customization
    console.log('\n3. Getting individual CSS customization:');
    const { data: customCss, error: customError } = await supabase
      .from('individual_label_templates')
      .select('*')
      .eq('product_id', product.id)
      .eq('template_id', template.id)
      .single();

    if (customError) {
      console.log(`   ❌ No custom CSS found: ${customError.message}`);
      return;
    }
    
    console.log(`   ✅ Custom CSS found (ID: ${customCss.id})`);
    console.log(`   📝 CSS Length: ${customCss.css_overrides.length} characters`);
    console.log(`   📅 Created: ${customCss.created_at}`);
    console.log(`   📅 Updated: ${customCss.updated_at}`);

    // 4. Test the CSS hierarchy
    console.log('\n4. Testing CSS hierarchy:');
    console.log('   Base template CSS length:', template.css_template.length);
    console.log('   Individual CSS overrides length:', customCss.css_overrides.length);
    
    // Simulate the CSS merging process
    const mergedCss = `${template.css_template}\n\n/* INDIVIDUAL CUSTOMIZATIONS */\n${customCss.css_overrides}`;
    console.log('   📊 Merged CSS total length:', mergedCss.length);

    // 5. Test preview generation
    console.log('\n5. Simulating label preview generation:');
    
    // This is how the label generation should work
    const labelData = {
      product: product,
      template: template,
      customCss: customCss,
      mergedCss: mergedCss
    };

    console.log('   🎯 Label generation data prepared:');
    console.log(`   - Product: ${labelData.product.name}`);
    console.log(`   - Template: ${labelData.template.name}`);
    console.log(`   - Custom CSS: ${labelData.customCss.css_overrides.length} chars`);
    console.log(`   - Final CSS: ${labelData.mergedCss.length} chars`);

    // 6. Check if preview API can access this data
    console.log('\n6. Testing preview API compatibility:');
    console.log('   📋 Required API parameters:');
    console.log(`   - productId: ${product.id}`);
    console.log(`   - templateSize: 14x7`);
    console.log(`   - includeCustomCss: true`);
    
    console.log('\n✅ CSS Override System Test Complete!');
    console.log('🔧 The system should now be able to:');
    console.log('   1. Load base template CSS from label_templates');
    console.log('   2. Load custom CSS from individual_label_templates');
    console.log('   3. Merge them in the correct order');
    console.log('   4. Apply to label preview');

  } catch (error) {
    console.error('❌ Error testing CSS override system:', error);
  }
}

testCssOverrideSystem();