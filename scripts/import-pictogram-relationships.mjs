import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// Read and parse CSV
const csvPath = path.join(process.cwd(), 'public/data/products_rows.csv');
const csvContent = fs.readFileSync(csvPath, 'utf-8');
const lines = csvContent.split('\n');
const headers = lines[0].split(',');

// Find column indices
const productNameIndex = headers.findIndex(h => h.trim() === 'product');
const pictogramUrlsIndex = headers.findIndex(h => h.trim() === 'pictogram_urls');

console.log(`Product name column: ${productNameIndex}`);
console.log(`Pictogram URLs column: ${pictogramUrlsIndex}`);

// Get all pictograms from database for URL matching
const { data: allPictograms } = await supabase
  .from('pictograms')
  .select('id, url, name, slug');

console.log(`Found ${allPictograms.length} pictograms in database`);

// Process each product row
for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;
  
  // Parse CSV line (handle quoted fields)
  const fields = [];
  let currentField = '';
  let inQuotes = false;
  
  for (let j = 0; j < line.length; j++) {
    const char = line[j];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      fields.push(currentField.trim());
      currentField = '';
    } else {
      currentField += char;
    }
  }
  fields.push(currentField.trim()); // Add last field
  
  if (fields.length <= Math.max(productNameIndex, pictogramUrlsIndex)) {
    console.log(`Skipping line ${i + 1}: insufficient fields`);
    continue;
  }
  
  const productName = fields[productNameIndex]?.replace(/"/g, '').trim();
  const pictogramUrls = fields[pictogramUrlsIndex]?.replace(/"/g, '').trim();
  
  if (!productName || !pictogramUrls) {
    console.log(`Skipping ${productName || 'unnamed product'}: no pictogram URLs`);
    continue;
  }
  
  console.log(`\nProcessing: ${productName}`);
  console.log(`Pictogram URLs: ${pictogramUrls}`);
  
  // Get product from database
  const { data: product } = await supabase
    .from('products')
    .select('id, name')
    .eq('name', productName)
    .single();
  
  if (!product) {
    console.log(`❌ Product not found in database: ${productName}`);
    continue;
  }
  
  // Clear existing pictogram relationships
  await supabase
    .from('product_pictograms')
    .delete()
    .eq('product_id', product.id);
  
  // Parse pictogram URLs (comma-separated)
  const urls = pictogramUrls.split(',').map(url => url.trim()).filter(url => url);
  
  let sortOrder = 0;
  for (const url of urls) {
    // Find matching pictogram by URL
    const pictogram = allPictograms.find(p => p.url === url);
    
    if (pictogram) {
      console.log(`  ✅ Matching pictogram: ${pictogram.name} (${pictogram.slug})`);
      
      // Create relationship
      const { error } = await supabase
        .from('product_pictograms')
        .insert({
          product_id: product.id,
          pictogram_id: pictogram.id,
          sort_order: sortOrder++
        });
      
      if (error) {
        console.log(`    ❌ Error creating relationship: ${error.message}`);
      } else {
        console.log(`    ✅ Created relationship`);
      }
    } else {
      console.log(`  ❌ No matching pictogram for URL: ${url}`);
    }
  }
}

console.log('\n🎉 Pictogram relationship import complete!');
