// Check label_templates table specifically
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLabelTemplates() {
  console.log('🔍 Checking label_templates table...\n');

  // Check all templates
  console.log('1. All templates:');
  try {
    const { data: allTemplates, error } = await supabase
      .from('label_templates')
      .select('*');
    
    if (error) {
      console.error('❌ Error:', error);
    } else {
      console.log('✅ Total templates:', allTemplates.length);
      allTemplates.forEach(t => {
        console.log(`  - ${t.name} (slug: ${t.slug}, active: ${t.is_active})`);
      });
    }
  } catch (err) {
    console.error('❌ Exception:', err.message);
  }

  // Check specific slug
  console.log('\n2. Checking specific slug "enhanced-14x7-fixed":');
  try {
    const { data: specificTemplate, error } = await supabase
      .from('label_templates')
      .select('*')
      .eq('slug', 'enhanced-14x7-fixed');
    
    if (error) {
      console.error('❌ Error:', error);
    } else {
      console.log('✅ Found templates:', specificTemplate.length);
      specificTemplate.forEach(t => {
        console.log(`  - ${t.name} (active: ${t.is_active})`);
      });
    }
  } catch (err) {
    console.error('❌ Exception:', err.message);
  }

  // Check what the API query actually does (with join)
  console.log('\n3. Testing API query (with join to label_template_versions):');
  try {
    const { data: apiResult, error } = await supabase
      .from('label_templates')
      .select(`
        *,
        label_template_versions!inner(
          id,
          version_number,
          is_published,
          created_at,
          change_notes
        )
      `)
      .eq('is_active', true)
      .eq('slug', 'enhanced-14x7-fixed')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ API query error:', error);
    } else {
      console.log('✅ API query result:', apiResult.length);
      apiResult.forEach(t => {
        console.log(`  - ${t.name} (versions: ${t.label_template_versions?.length || 0})`);
      });
    }
  } catch (err) {
    console.error('❌ API query exception:', err.message);
  }

  // Check if label_template_versions table exists
  console.log('\n4. Checking label_template_versions table:');
  try {
    const { data: versions, error } = await supabase
      .from('label_template_versions')
      .select('*')
      .limit(5);
    
    if (error) {
      console.error('❌ Error:', error);
    } else {
      console.log('✅ Template versions exist:', versions.length);
    }
  } catch (err) {
    console.error('❌ Exception:', err.message);
  }
}

checkLabelTemplates().then(() => {
  console.log('\n🏁 Label templates check complete');
  process.exit(0);
}).catch(err => {
  console.error('💥 Check failed:', err);
  process.exit(1);
});