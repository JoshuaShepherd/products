// Test the new-label-editor API endpoints directly
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testLabelEditorFlow() {
  console.log('🎯 Testing new-label-editor flow...\n');

  // Test 1: Get products (what the editor loads first)
  console.log('1. Loading products:');
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .limit(5);
    
    if (error) {
      console.error('❌ Error loading products:', error);
      return;
    }
    
    console.log('✅ Loaded products:', products.length);
    const testProduct = products[0];
    console.log('🧪 Test product:', testProduct.name, '(ID:', testProduct.id, ')');

    // Test 2: Load label templates (what happens when size changes)
    console.log('\n2. Loading label templates:');
    const templateResponse = await fetch('http://localhost:3002/api/templates?slug=enhanced-14x7-fixed');
    if (!templateResponse.ok) {
      console.error('❌ Template API failed:', templateResponse.status);
      
      // Try fallback
      const allTemplatesResponse = await fetch('http://localhost:3002/api/templates');
      const allTemplates = await allTemplatesResponse.json();
      console.log('📋 Available templates:', allTemplates.map(t => ({ name: t.name, slug: t.slug })));
    } else {
      const templateData = await templateResponse.json();
      console.log('✅ Template loaded:', templateData.length > 0 ? templateData[0].name : 'None');
    }

    // Test 3: Load individual templates for product (what loadTemplateCSS does)
    console.log('\n3. Loading individual template CSS for product:');
    const { data: individualTemplates, error: individualError } = await supabase
      .from('individual_label_templates')
      .select('custom_css, css_overrides, template_id, notes')
      .eq('product_id', testProduct.id);

    if (individualError) {
      console.error('❌ Error loading individual templates:', individualError);
    } else {
      console.log('✅ Individual templates query worked');
      console.log('📊 Found templates:', individualTemplates.length);
      if (individualTemplates.length > 0) {
        const template = individualTemplates[0];
        console.log('📝 Has css_overrides:', !!template.css_overrides);
        console.log('📝 Has custom_css:', !!template.custom_css);
      }
    }

    // Test 4: Try label generation API (what generatePreview does)
    console.log('\n4. Testing label generation API:');
    const labelTitle = encodeURIComponent(testProduct.name);
    const endpoint = `http://localhost:3002/api/label/${labelTitle}?size=14x7`;
    
    try {
      const labelResponse = await fetch(endpoint);
      if (!labelResponse.ok) {
        console.error('❌ Label API failed:', labelResponse.status, await labelResponse.text());
      } else {
        const html = await labelResponse.text();
        console.log('✅ Label generated successfully');
        console.log('📄 HTML length:', html.length);
        console.log('🎨 Contains CSS:', html.includes('<style>'));
      }
    } catch (fetchError) {
      console.error('❌ Fetch error:', fetchError.message);
    }

  } catch (error) {
    console.error('💥 Test failed:', error);
  }
}

testLabelEditorFlow().then(() => {
  console.log('\n🏁 Label editor flow test complete');
  process.exit(0);
}).catch(err => {
  console.error('💥 Flow test failed:', err);
  process.exit(1);
});