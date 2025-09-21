#!/usr/bin/env node

// Test the label generation with the missing fields fix
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bnwbjrlgoylmbblfmsru.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJud2Jqcmxnb3lsbWJibGZtc3J1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Njk2Njg0MSwiZXhwIjoyMDcyNTQyODQxfQ.Mu9GFonaN_tyIFWod9X8GYg_kyGN4HW8mbXU9OmEL_M';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testLabelGeneration() {
  console.log('🧪 Testing label generation for All Shield EX...\n');

  // Get All Shield EX product
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('name', 'All Shield EX')
    .single();

  if (error || !product) {
    console.error('❌ Product not found:', error);
    return;
  }

  // Create template vars like the API does
  const templateVars = {
    safety_notice: product.safety_notice || '',
    conditions_of_sale: product.conditions_of_sale || '',
    warranty_limitation: product.warranty_limitation || '',
    inherent_risk: product.inherent_risk || '',
    additional_terms: product.additional_terms || '',
    manufacturing_notice: product.manufacturing_notice || ''
  };

  console.log('📋 Template variables for conditional sections:');
  Object.entries(templateVars).forEach(([key, value]) => {
    const preview = value.length > 50 ? `${value.substring(0, 50)}...` : value;
    console.log(`  ${key}: ${value ? `"${preview}"` : 'NULL/EMPTY'}`);
  });

  // Test conditional logic
  console.log('\n🔍 Testing conditional logic:');
  Object.entries(templateVars).forEach(([key, value]) => {
    const shouldShow = (value && value.trim() !== '');
    console.log(`  {{#if ${key}}}: ${shouldShow ? '✅ WILL SHOW' : '❌ WILL HIDE'}`);
  });

  // Simulate template processing
  const testTemplate = `
<!-- Manufacturing and Safety Notices -->
{{#if safety_notice}}
<div class="manufacturing-safety-notices">
    <div class="rc-section">
        <h4>Safety Notice</h4>
        <p class="safety-notice">{{safety_notice}}</p>
    </div>
</div>
{{/if}}

<!-- Warranty/Conditions Section -->
{{#if conditions_of_sale}}
<div class="warranty-conditions-right">
    <div class="rc-section">
        <h4>Conditions of Sale</h4>
        <p>{{conditions_of_sale}}</p>
    </div>
    {{#if warranty_limitation}}
    <div class="rc-section">
        <h4>Warranty Limitation</h4>
        <p>{{warranty_limitation}}</p>
    </div>
    {{/if}}
    {{#if inherent_risk}}
    <div class="rc-section">
        <h4>Inherent Risk</h4>
        <p>{{inherent_risk}}</p>
    </div>
    {{/if}}
</div>
{{/if}}`;

  console.log('\n📄 Test template:\n', testTemplate);
  
  // Simple simulation of conditional processing
  let processed = testTemplate;
  Object.entries(templateVars).forEach(([key, value]) => {
    const shouldShow = (value && value.trim() !== '');
    const pattern = new RegExp(`\\{\\{#if\\s+${key}\\}\\}([\\s\\S]*?)\\{\\{/if\\}\\}`, 'g');
    processed = processed.replace(pattern, shouldShow ? '$1' : '');
    
    // Replace variable placeholders
    const varPattern = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    processed = processed.replace(varPattern, value);
  });

  console.log('\n🎨 Processed result:\n', processed);
}

testLabelGeneration().catch(console.error);