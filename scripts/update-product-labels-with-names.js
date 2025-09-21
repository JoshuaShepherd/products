const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Read env file
const envContent = fs.readFileSync('.env.local', 'utf8');
const supabaseUrl = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)[1];
const supabaseKey = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)[1];

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAndUpdate() {
  try {
    // Check current structure
    console.log('Checking current product_labels structure...');
    const { data: sample } = await supabase.table('product_labels').select('*').limit(1);
    
    if (sample && sample.length > 0) {
      console.log('Current columns:', Object.keys(sample[0]));
      
      // Check if we have product_name and template_name columns
      const hasProductName = 'product_name' in sample[0];
      const hasTemplateName = 'template_name' in sample[0];
      
      console.log('Has product_name column:', hasProductName);
      console.log('Has template_name column:', hasTemplateName);
      
      if (!hasProductName || !hasTemplateName) {
        console.log('\nNeed to add missing columns. Cannot add via Supabase client.');
        console.log('Will update the generated_html with identifiers instead...');
        await updateWithIdentifiers();
      } else {
        console.log('\nColumns exist! Updating with names...');
        await updateWithNames();
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

async function updateWithIdentifiers() {
  try {
    // Get all data needed
    const [labelsResp, productsResp, templatesResp] = await Promise.all([
      supabase.table('product_labels').select('id, product_id, template_id, generated_html'),
      supabase.table('products').select('id, name'),
      supabase.table('label_templates').select('id, name')
    ]);
    
    const labels = labelsResp.data;
    const products = Object.fromEntries(productsResp.data.map(p => [p.id, p.name]));
    const templates = Object.fromEntries(templatesResp.data.map(t => [t.id, t.name]));
    
    console.log(`Found ${labels.length} labels to update with identifiers`);
    
    // Update in batches
    let updated = 0;
    for (let i = 0; i < labels.length; i += 10) {
      const batch = labels.slice(i, i + 10);
      console.log(`Updating batch ${Math.floor(i/10) + 1}...`);
      
      for (const label of batch) {
        const productName = products[label.product_id] || 'Unknown';
        const templateName = templates[label.template_id] || 'Unknown';
        
        // Create identification comment
        const identifier = `<!-- LABEL: ${productName} (${templateName}) -->`;
        
        // Add identifier to beginning if not already there
        let html = label.generated_html || '';
        if (!html.includes(productName)) {
          html = identifier + '\n' + html;
          
          const { error } = await supabase
            .table('product_labels')
            .update({ generated_html: html })
            .eq('id', label.id);
            
          if (!error) {
            updated++;
            if (updated % 25 === 0) console.log(`  Updated ${updated} labels...`);
          }
        }
      }
    }
    
    console.log(`\n✅ Updated ${updated} labels with identifiers!`);
    
    // Show sample
    const { data: samples } = await supabase
      .table('product_labels')
      .select('generated_html')
      .limit(3);
      
    console.log('\nSample results:');
    samples.forEach((s, i) => {
      const preview = s.generated_html ? s.generated_html.substring(0, 100) : 'No HTML';
      console.log(`${i + 1}. ${preview}...`);
    });
  } catch (error) {
    console.error('Update error:', error.message);
  }
}

async function updateWithNames() {
  try {
    // Get all data needed
    const [labelsResp, productsResp, templatesResp] = await Promise.all([
      supabase.table('product_labels').select('id, product_id, template_id'),
      supabase.table('products').select('id, name'),
      supabase.table('label_templates').select('id, name')
    ]);
    
    const labels = labelsResp.data;
    const products = Object.fromEntries(productsResp.data.map(p => [p.id, p.name]));
    const templates = Object.fromEntries(templatesResp.data.map(t => [t.id, t.name]));
    
    console.log(`Found ${labels.length} labels to update`);
    
    // Update in batches
    let updated = 0;
    for (let i = 0; i < labels.length; i += 10) {
      const batch = labels.slice(i, i + 10);
      console.log(`Updating batch ${Math.floor(i/10) + 1}...`);
      
      for (const label of batch) {
        const productName = products[label.product_id] || 'Unknown';
        const templateName = templates[label.template_id] || 'Unknown';
        
        const { error } = await supabase
          .table('product_labels')
          .update({
            product_name: productName,
            template_name: templateName
          })
          .eq('id', label.id);
          
        if (!error) {
          updated++;
          if (updated % 50 === 0) console.log(`  Updated ${updated} labels...`);
        }
      }
    }
    
    console.log(`\n✅ Updated ${updated} labels with names!`);
    
    // Show sample
    const { data: samples } = await supabase
      .table('product_labels')
      .select('product_name, template_name')
      .limit(5);
      
    console.log('\nSample results:');
    samples.forEach(s => console.log(`- ${s.product_name} (${s.template_name})`));
  } catch (error) {
    console.error('Update error:', error.message);
  }
}

checkAndUpdate();