#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔧 Fixing template structure to support proper CSS columns...');

// Get the current template
const { data: template, error } = await supabase
  .from('label_templates')
  .select('*')
  .eq('name', '14x7 Enhanced Large Format')
  .single();

if (error || !template) {
  console.error('❌ Template not found:', error);
  process.exit(1);
}

console.log('📋 Current template found:', template.name);

// Create the new HTML template that works with CSS columns
const newHtmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>{{product_name}}</title>
    <style>
        {{css_styles}}
    </style>
</head>
<body>
    <div class="label-container">
        <div class="columns-container">
            <!-- Left Columns -->
            <div class="left-columns" id="Font6">
                {{#if description}}
                <h4>Description</h4>
                <p>{{description}}</p>
                {{/if}}
                
                {{#if voc_data}}
                <h4>VOC Data</h4>
                <p>{{voc_data}}</p>
                {{/if}}
                
                {{#if application}}
                <h4>Application</h4>
                <p>{{application}}</p>
                {{/if}}
                
                {{#if features}}
                <h4>Features</h4>
                <p>{{features}}</p>
                {{/if}}
                
                {{#if limitations}}
                <h4>Limitations</h4>
                <p>{{limitations}}</p>
                {{/if}}
                
                {{#if shelf_life}}
                <h4>Shelf Life</h4>
                <p>{{shelf_life}}</p>
                {{/if}}
            </div>
            
            <!-- Center Content -->
            <div class="center-content">
                <div class="product-name">{{product_name}}</div>
                {{#if short_description_english}}
                <div class="short-description-english">{{short_description_english}}</div>
                {{/if}}
                {{#if short_description_french}}
                <div class="translated-short-description">{{short_description_french}}</div>
                {{/if}}
                {{#if short_description_spanish}}
                <div class="translated-short-description">{{short_description_spanish}}</div>
                {{/if}}
                <div class="logo-container">
                    <img src="https://firebasestorage.googleapis.com/v0/b/specchem-pwa-feb-25.firebasestorage.app/o/branding%2Flogo-transparent.webp?alt=media&token=0b494edd-5a0a-4f37-8227-8e88356881f8" alt="SpecChem Logo">
                </div>
            </div>
            
            <!-- Right Columns -->
            <div class="right-columns" id="Font6">
                {{#if pictograms}}
                <h4>Pictograms</h4>
                <div class="pictograms" style="display: flex; gap: 7px; align-items: center; margin: 0 0 7px 0;">
                    {{pictograms}}
                </div>
                {{/if}}
                
                {{#if components_determining_hazard}}
                <h4>Components Determining Hazard</h4>
                <p>{{components_determining_hazard}}</p>
                {{/if}}
                
                {{#if signal_word}}
                <h4>Signal Word</h4>
                <p>{{signal_word}}</p>
                {{/if}}
                
                {{#if hazard_statements}}
                <h4>Hazard Statements</h4>
                <p>{{hazard_statements}}</p>
                {{/if}}
                
                {{#if precautionary_statements}}
                <h4>Precautionary Statements</h4>
                <p>{{precautionary_statements}}</p>
                {{/if}}
                
                {{#if response_statements}}
                <h4>Response Statements</h4>
                <p>{{response_statements}}</p>
                {{/if}}
                
                {{#if storage}}
                <h4>Storage</h4>
                <p>{{storage}}</p>
                {{/if}}
                
                {{#if disposal}}
                <h4>Disposal</h4>
                <p>{{disposal}}</p>
                {{/if}}
                
                {{#if proper_shipping_name}}
                <h4>Transport</h4>
                <p><b>Proper Shipping Name:</b> {{proper_shipping_name}}</p>
                {{#if un_number}}<p><b>UN Number:</b> {{un_number}}</p>{{/if}}
                {{#if hazard_class}}<p><b>Hazard Class:</b> {{hazard_class}}</p>{{/if}}
                {{#if packing_group}}<p><b>Packing Group:</b> {{packing_group}}</p>{{/if}}
                {{#if emergency_response_guide}}<p><b>Emergency Response Guide:</b> {{emergency_response_guide}}</p>{{/if}}
                {{/if}}
            </div>
        </div>
        
        <div class="code-row">
            <img src="https://firebasestorage.googleapis.com/v0/b/specchem-pwa-feb-25.firebasestorage.app/o/pictograms%2Fproduct-qr.png?alt=media&token=c832e9c2-525d-4dbf-984d-f8f249acf86e" class="qr-code" alt="QR Code" />
            <div class="code-info">
                <div class="batch-field"><label style="display:inline-block; min-width:105px;">Batch No:</label> {{package_size}}</div>
                <div class="package-size">{{package_size}}</div>
                <div class="use-by">Used by date: {{used_by_date}}</div>
            </div>
        </div>
    </div>
</body>
</html>`;

// Update the template
const { error: updateError } = await supabase
  .from('label_templates')
  .update({ 
    html_template: newHtmlTemplate 
  })
  .eq('name', '14x7 Enhanced Large Format');

if (updateError) {
  console.error('❌ Failed to update template:', updateError);
  process.exit(1);
}

console.log('✅ Successfully updated template structure!');
console.log('📝 Changes made:');
console.log('  - Removed individual section divs that break CSS column flow');
console.log('  - Content now flows naturally within left-columns and right-columns');
console.log('  - CSS column-count: 2 will automatically create the column layout');
console.log('  - Added proper pictogram placeholder');
console.log('  - Transport section now groups all shipping information');

process.exit(0);
