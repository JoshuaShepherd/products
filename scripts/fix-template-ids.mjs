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

async function fixTemplateIds() {
  console.log('🔧 Fixing template_id relationships...\n');

  try {
    // Get all label templates
    console.log('1. Available templates:');
    const { data: templates, error: templatesError } = await supabase
      .from('label_templates')
      .select('id, name, slug');

    if (templatesError) throw templatesError;
    
    console.log('📄 Templates available:');
    templates.forEach(template => {
      console.log(`   - ${template.name} (${template.slug}) [ID: ${template.id}]`);
    });

    // Get all individual_label_templates records with null template_id
    console.log('\n2. Records with null template_id:');
    const { data: individualRecords, error: individualError } = await supabase
      .from('individual_label_templates')
      .select('*')
      .is('template_id', null);

    if (individualError) throw individualError;
    
    if (!individualRecords || individualRecords.length === 0) {
      console.log('   ✅ No records with null template_id found!');
      return;
    }

    console.log(`   Found ${individualRecords.length} records with null template_id:`);
    individualRecords.forEach(record => {
      console.log(`   - Record ${record.id} for product ${record.product_id}`);
      console.log(`     Notes: ${record.notes}`);
    });

    // Determine which template to use based on notes
    console.log('\n3. Determining correct template_id for each record:');
    
    for (const record of individualRecords) {
      let templateId = null;
      
      // Check notes for size indication
      if (record.notes && record.notes.includes('14x7')) {
        // Find 14x7 template
        const template14x7 = templates.find(t => 
          t.slug.includes('14x7') || 
          t.name.toLowerCase().includes('14x7') || 
          t.slug.includes('enhanced') ||
          t.name.toLowerCase().includes('enhanced')
        );
        templateId = template14x7?.id;
        console.log(`   📏 Record ${record.id}: 14x7 format detected → template_id: ${templateId}`);
      } else if (record.notes && record.notes.includes('5x9')) {
        // Find 5x9 template
        const template5x9 = templates.find(t => 
          t.slug.includes('5x9') || 
          t.name.toLowerCase().includes('5x9') ||
          t.slug.includes('compact') ||
          t.name.toLowerCase().includes('compact')
        );
        templateId = template5x9?.id;
        console.log(`   📏 Record ${record.id}: 5x9 format detected → template_id: ${templateId}`);
      } else {
        // Default to 14x7 if we can't determine
        const defaultTemplate = templates.find(t => 
          t.slug.includes('14x7') || 
          t.name.toLowerCase().includes('enhanced')
        );
        templateId = defaultTemplate?.id;
        console.log(`   📏 Record ${record.id}: No size detected, defaulting to 14x7 → template_id: ${templateId}`);
      }

      if (templateId) {
        console.log(`   🔧 Updating record ${record.id} with template_id: ${templateId}`);
        
        const { data: updateData, error: updateError } = await supabase
          .from('individual_label_templates')
          .update({ template_id: templateId })
          .eq('id', record.id)
          .select();

        if (updateError) {
          console.error(`   ❌ Failed to update record ${record.id}:`, updateError);
        } else {
          console.log(`   ✅ Successfully updated record ${record.id}`);
        }
      } else {
        console.log(`   ❌ Could not determine template_id for record ${record.id}`);
      }
    }

    console.log('\n4. Verification - checking records after update:');
    const { data: verifyRecords } = await supabase
      .from('individual_label_templates')
      .select('id, product_id, template_id, notes');

    if (verifyRecords) {
      verifyRecords.forEach(record => {
        const status = record.template_id ? '✅' : '❌';
        console.log(`   ${status} Record ${record.id}: template_id = ${record.template_id || 'null'}`);
      });
    }

  } catch (error) {
    console.error('❌ Error fixing template IDs:', error);
  }
}

fixTemplateIds();