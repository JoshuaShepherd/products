#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory (for ES modules)
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // This would be needed for admin operations
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase configuration. Please check .env.local file.');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function executeSQL() {
  try {
    console.log('🚀 Starting database operations...');
    
    // 1. Insert label templates
    console.log('📝 Inserting label templates...');
    
    // 14x7 Enhanced Large Format Template
    const template14x7 = {
      name: '14x7 Enhanced Large Format',
      slug: '14x7-enhanced',
      description: 'Large 14.875" x 7.625" label template for detailed product information with columns layout',
      width_mm: 377.82, // 14.875 inches in mm
      height_mm: 193.68, // 7.625 inches in mm
      html_template: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <title>{{product_name}}</title>
    <style>{{css_styles}}</style>
</head>
<body>
    <div class="label-container">
        <div class="columns-container">
            <!-- Left Columns -->
            <div class="left-columns" id="Font6">
                {{#if description}}
                <div class="lc-section">
                    <h4>Description</h4>
                    <p>{{description}}</p>
                </div>
                {{/if}}
                {{#if voc_data}}
                <div class="lc-section">
                    <h4>VOC Data</h4>
                    <p>{{voc_data}}</p>
                </div>
                {{/if}}
                {{#if application}}
                <div class="lc-section">
                    <h4>Application</h4>
                    <p>{{application}}</p>
                </div>
                {{/if}}
                {{#if features}}
                <div class="lc-section">
                    <h4>Features</h4>
                    <p>{{features}}</p>
                </div>
                {{/if}}
                {{#if limitations}}
                <div class="lc-section">
                    <h4>Limitations</h4>
                    <p>{{limitations}}</p>
                </div>
                {{/if}}
                {{#if shelf_life}}
                <div class="lc-section">
                    <h4>Shelf Life</h4>
                    <p>{{shelf_life}}</p>
                </div>
                {{/if}}
            </div>
            <!-- Center Content -->
            <div class="center-content">
                <div class="product-name">{{name}}</div>
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
                {{#if components_determining_hazard}}
                <div class="rc-section">
                    <h4>Components Determining Hazard</h4>
                    <p>{{components_determining_hazard}}</p>
                </div>
                {{/if}}
                {{#if signal_word}}
                <div class="rc-section">
                    <h4>Signal Word</h4>
                    <p>{{signal_word}}</p>
                </div>
                {{/if}}
                {{#if hazard_statements}}
                <div class="rc-section">
                    <h4>Hazard Statements</h4>
                    <p>{{hazard_statements}}</p>
                </div>
                {{/if}}
                {{#if precautionary_statements}}
                <div class="rc-section">
                    <h4>Precautionary Statements</h4>
                    <p>{{precautionary_statements}}</p>
                </div>
                {{/if}}
                {{#if response_statements}}
                <div class="rc-section">
                    <h4>Response Statements</h4>
                    <p>{{response_statements}}</p>
                </div>
                {{/if}}
                {{#if storage}}
                <div class="rc-section">
                    <h4>Storage</h4>
                    <p>{{storage}}</p>
                </div>
                {{/if}}
                {{#if disposal}}
                <div class="rc-section">
                    <h4>Disposal</h4>
                    <p>{{disposal}}</p>
                </div>
                {{/if}}
                {{#if proper_shipping_name}}
                <div class="rc-section">
                    <h4>Transport</h4>
                    <p><b>Proper Shipping Name:</b> {{proper_shipping_name}}</p>
                    {{#if un_number}}<p><b>UN Number:</b> {{un_number}}</p>{{/if}}
                    {{#if hazard_class}}<p><b>Hazard Class:</b> {{hazard_class}}</p>{{/if}}
                    {{#if packing_group}}<p><b>Packing Group:</b> {{packing_group}}</p>{{/if}}
                </div>
                {{/if}}
            </div>
        </div>
        <div class="code-row">
            <img src="https://firebasestorage.googleapis.com/v0/b/specchem-pwa-feb-25.firebasestorage.app/o/pictograms%2Fproduct-qr.png?alt=media&token=c832e9c2-525d-4dbf-984d-f8f249acf86e" class="qr-code" alt="QR Code" />
            <div class="code-info">
                <div class="batch-field"><label>Batch No:</label></div>
                <div class="package-size">{{package_size}}</div>
                {{#if used_by_date}}<div class="use-by">Used by date: {{used_by_date}}</div>{{/if}}
            </div>
        </div>
    </div>
</body>
</html>`,
      css_template: `@import url("https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700&family=Open+Sans:wght@400;600&display=swap");
@page { size: 14.875in 7.625in; margin: 0; }
body { margin: 0; padding: 0; background: #e7eaf0; font-family: "Open Sans", Arial, sans-serif; }
.label-container { width: 14.875in; height: 7.625in; margin: 0 auto; background: url("https://firebasestorage.googleapis.com/v0/b/specchem-pwa-feb-25.firebasestorage.app/o/branding%2Fblank-tapered-label.png?alt=media&token=930baa3f-38d5-46fa-81a3-0df0c1eb15a8") no-repeat center center; background-size: cover; position: relative; display: flex; flex-direction: column; overflow: hidden; box-sizing: border-box; }
.columns-container { position: relative; display: flex; justify-content: space-between; align-items: flex-start; flex: 1 1 0; width: 100%; height: 100%; padding: 0.60in 0.68in 0.24in 0.68in; box-sizing: border-box; z-index: 2; margin-top: .6in; }
.left-columns, .right-columns { width: 31.5%; min-width: 320px; line-height: 1.16; word-break: break-word; }
.center-content { width: 31%; display: flex; flex-direction: column; align-items: center; text-align: center; z-index: 5; position: absolute; top: 15%; left: 50%; transform: translateX(-50%); }
.center-content .product-name { font-family: "Montserrat", Arial, sans-serif; font-size: 48px; font-weight: 700; color: #21325b; margin: 0 0 2px 0; line-height: 1.1; }
.short-description-english { font-family: "Montserrat", Arial, sans-serif; font-size: 18px; font-weight: 600; color: #2453a6; margin: 0 0 2px 0; }
.translated-short-description { font-size: 12px; font-family: "Open Sans", Arial, sans-serif; color: #395073; margin: 0 0 2px 0; }
.logo-container img { width: 200px; margin: 11px 0 4px 0; }
.code-row { position: absolute; left: 50%; bottom: 0.75in; transform: translateX(-50%); width: 700px; height: 80px; z-index: 20; }
.code-info { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); display: flex; flex-direction: column; font-size: 13px; color: #1b2754; font-family: "Open Sans", Arial, sans-serif; }
.qr-code { position: absolute; left: 0; top: 50%; transform: translateY(-50%); width: 72px; }
.left-columns h4, .right-columns h4 { font-family: "Montserrat", Arial, sans-serif; color: #1e3369; text-transform: uppercase; font-weight: 700; margin: 11px 0 2px 0; }
.left-columns p, .right-columns p { font-size: 7px; font-family: "Open Sans", Arial, sans-serif; margin: 0 0 4px 0; }`,
      is_active: true
    };

    const { data: template14x7Data, error: template14x7Error } = await supabase
      .from('label_templates')
      .insert(template14x7);
      
    if (template14x7Error) {
      console.error('❌ Error inserting 14x7 template:', template14x7Error);
    } else {
      console.log('✅ Inserted 14x7 Enhanced template');
    }

    // 5x9 Compact Format Template  
    const template5x9 = {
      name: '5x9 Compact Format',
      slug: '5x9-compact',
      description: 'Compact 9" x 5" label template for smaller product containers',
      width_mm: 228.6, // 9 inches in mm
      height_mm: 127.0, // 5 inches in mm
      html_template: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <title>{{product_name}} | SpecChem</title>
    <style>{{css_styles}}</style>
</head>
<body>
    <div class="label-container">
        <div class="columns-container">
            <div class="left-columns">
                {{#if description}}<div class="lc-section"><h4>Description</h4><p>{{description}}</p></div>{{/if}}
                {{#if application}}<div class="lc-section"><h4>Application</h4><p>{{application}}</p></div>{{/if}}
                {{#if features}}<div class="lc-section"><h4>Features</h4><p>{{features}}</p></div>{{/if}}
                {{#if limitations}}<div class="lc-section"><h4>Limitations</h4><p>{{limitations}}</p></div>{{/if}}
                {{#if shelf_life}}<div class="lc-section"><h4>Shelf Life</h4><p>{{shelf_life}}</p></div>{{/if}}
            </div>
            <div class="center-content">
                <div class="product-name">{{name}}</div>
                {{#if short_description_english}}<div class="short-description-english">{{short_description_english}}</div>{{/if}}
                {{#if short_description_french}}<div class="translated-short-description">{{short_description_french}}</div>{{/if}}
                {{#if short_description_spanish}}<div class="translated-short-description">{{short_description_spanish}}</div>{{/if}}
            </div>
            <div class="right-columns">
                {{#if components_determining_hazard}}<div class="rc-section"><h4>Components Determining Hazard</h4><p>{{components_determining_hazard}}</p></div>{{/if}}
                {{#if signal_word}}<div class="rc-section"><h4>Signal Word</h4><p>{{signal_word}}</p></div>{{/if}}
                {{#if hazard_statements}}<div class="rc-section"><h4>Hazard Statements</h4><p>{{hazard_statements}}</p></div>{{/if}}
                {{#if precautionary_statements}}<div class="rc-section"><h4>Precautionary Statements</h4><p>{{precautionary_statements}}</p></div>{{/if}}
                {{#if storage}}<div class="rc-section"><h4>Storage</h4><p>{{storage}}</p></div>{{/if}}
                {{#if disposal}}<div class="rc-section"><h4>Disposal</h4><p>{{disposal}}</p></div>{{/if}}
            </div>
        </div>
        <div class="logo-container">
            <img src="https://firebasestorage.googleapis.com/v0/b/specchem-pwa-feb-25.firebasestorage.app/o/branding%2Flogo-transparent.webp?alt=media&token=0b494edd-5a0a-4f37-8227-8e88356881f8" alt="SpecChem Logo">
        </div>
        <div class="code-row">
            <img src="https://firebasestorage.googleapis.com/v0/b/specchem-pwa-feb-25.firebasestorage.app/o/pictograms%2Fproduct-qr.png?alt=media&token=c832e9c2-525d-4dbf-984d-f8f249acf86e" class="qr-code" alt="QR Code" />
            <div class="code-info">
                <label>Batch No:</label>
                <div class="package-size">{{package_size}}</div>
                {{#if used_by_date}}<div class="use-by">Used by date: {{used_by_date}}</div>{{/if}}
            </div>
        </div>
    </div>
</body>
</html>`,
      css_template: `@import url("https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700&family=Open+Sans:wght@400;600&display=swap");
@page { size: 9in 5in; margin: 0; }
body { margin: 0; padding: 0; background: #e7eaf0; font-family: "Open Sans", Arial, sans-serif; }
.label-container { width: 9in; height: 5in; background: url("https://firebasestorage.googleapis.com/v0/b/specchem-pwa-feb-25.firebasestorage.app/o/branding%2F5x9-label-template.png?alt=media&token=afc42346-5527-4c06-8c50-1aaef543e1ef") no-repeat center center; background-size: cover; position: relative; display: flex; flex-direction: column; }
.columns-container { display: flex; justify-content: space-between; padding: 0.33in 0.36in; z-index: 2; }
.left-columns, .right-columns { width: 32%; column-count: 2; column-gap: 0.19in; }
.center-content { position: absolute; left: 50%; top: 120px; transform: translateX(-50%); text-align: center; z-index: 5; }
.center-content .product-name { font-family: "Montserrat", Arial, sans-serif; font-size: 24px; font-weight: 700; color: #21325b; }
.short-description-english { font-family: "Montserrat", Arial, sans-serif; font-size: 12px; font-weight: 600; color: #2453a6; }
.translated-short-description { font-size: 8px; font-family: "Open Sans", Arial, sans-serif; color: #395073; }
.logo-container { position: absolute; left: 50%; bottom: 38%; transform: translateX(-50%); }
.logo-container img { width: 150px; }
.code-row { position: absolute; left: 50%; bottom: 38px; transform: translateX(-50%); display: flex; align-items: center; z-index: 20; }
.qr-code { width: 52px; margin-right: 20px; }
.left-columns h4, .right-columns h4 { font-family: "Montserrat", Arial, sans-serif; font-size: 8px; color: #1e3369; text-transform: uppercase; font-weight: 700; }
.left-columns p, .right-columns p { font-size: 6px; font-family: "Open Sans", Arial, sans-serif; }`,
      is_active: true
    };

    const { data: template5x9Data, error: template5x9Error } = await supabase
      .from('label_templates')
      .insert(template5x9);
      
    if (template5x9Error) {
      console.error('❌ Error inserting 5x9 template:', template5x9Error);
    } else {
      console.log('✅ Inserted 5x9 Compact template');
    }

    console.log('✅ Label templates inserted successfully');
    
    // 2. Import products data from CSV
    console.log('📊 Reading products CSV data...');
    const csvData = fs.readFileSync(path.join(__dirname, 'public/data/products_rows.csv'), 'utf8');
    const lines = csvData.split('\n').filter(line => line.trim()); // Filter empty lines
    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
    
    console.log(`📋 Found ${lines.length - 1} product records to import`);
    console.log(`📋 CSV Headers: ${headers.slice(0, 5).join(', ')}...`);
    
    // Process CSV data and insert products (first 5 as test)
    for (let i = 1; i < Math.min(lines.length, 6); i++) {
      const line = lines[i];
      if (!line.trim()) continue;
      
      // Split CSV properly handling quoted values
      const values = [];
      let current = '';
      let inQuotes = false;
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim()); // Add last value
      
      if (values.length >= 5 && values[0]) { // Ensure we have enough columns and a product name
        const cleanValue = (val) => val ? val.replace(/^"|"$/g, '') : null; // Remove surrounding quotes
        
        const productData = {
          name: cleanValue(values[0]),
          slug: cleanValue(values[0])?.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-') || 'unknown',
          short_description_english: cleanValue(values[1]),
          short_description_french: cleanValue(values[2]),
          short_description_spanish: cleanValue(values[3]),
          description: cleanValue(values[4]),
          application: cleanValue(values[5]),
          features: cleanValue(values[6]),
          coverage: cleanValue(values[7]),
          shelf_life: cleanValue(values[8]),
          limitations: cleanValue(values[9]),
          voc_data: cleanValue(values[40]) || cleanValue(values[values.length - 2]), // Try last columns for VOC data
          signal_word: cleanValue(values[11]) === 'Danger' ? 'Danger' : 
                      cleanValue(values[11]) === 'Warning' ? 'Warning' : 'None',
          components_determining_hazard: cleanValue(values[12]),
          hazard_statements: cleanValue(values[13]),
          precautionary_statements: cleanValue(values[14]),
          response_statements: cleanValue(values[15]),
          first_aid: cleanValue(values[16]),
          storage: cleanValue(values[17]),
          disposal: cleanValue(values[18]),
          proper_shipping_name: cleanValue(values[28]) || cleanValue(values[29]),
          un_number: cleanValue(values[29]) || cleanValue(values[30]),
          hazard_class: cleanValue(values[30]) === 'Class 3' ? 'Class 3' : 'Not applicable',
          packing_group: cleanValue(values[31]) === 'III' ? 'III' : 'Not applicable',
          green_conscious: cleanValue(values[33])?.toLowerCase().includes('true') || false,
          do_not_freeze: cleanValue(values[34])?.toLowerCase().includes('true') || false,
          mix_well: cleanValue(values[35])?.toLowerCase().includes('true') || false,
          used_by_date: cleanValue(values[36]),
          is_active: true
        };
        
        console.log(`🔄 Processing: ${productData.name}`);
        
        const { data, error } = await supabase
          .from('products')
          .insert(productData);
          
        if (error) {
          console.error(`❌ Error inserting product ${productData.name}:`, error.message);
        } else {
          console.log(`✅ Inserted product: ${productData.name}`);
        }
      }
    }
    
    console.log('🎉 Database operations completed successfully!');
    
    // 3. Verify data insertion
    console.log('🔍 Verifying data...');
    const { data: templates, error: templateError } = await supabase
      .from('label_templates')
      .select('*');
      
    const { data: products, error: productError } = await supabase
      .from('products')
      .select('*')
      .limit(5);
    
    if (templateError || productError) {
      console.error('❌ Error verifying data:', templateError || productError);
    } else {
      console.log(`📊 Verified: ${templates?.length || 0} label templates and ${products?.length || 0} products`);
      if (templates?.length) {
        console.log('Label templates:', templates.map(t => t.name));
      }
      if (products?.length) {
        console.log('Sample products:', products.map(p => p.name));
      }
    }
    
  } catch (error) {
    console.error('❌ Script execution error:', error);
    process.exit(1);
  }
}

// Execute the script
executeSQL();
