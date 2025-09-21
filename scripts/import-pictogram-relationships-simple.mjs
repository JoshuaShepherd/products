import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// Define pictogram URLs for key products from the CSV data
const productPictogramData = {
  'Berry Clean': [
    'https://firebasestorage.googleapis.com/v0/b/specchem-pwa-feb-25.firebasestorage.app/o/pictograms%2Fenvironmental-hazard.png?alt=media&token=6bca89fe-4727-4d17-b3e6-c52e36a6be53',
    'https://firebasestorage.googleapis.com/v0/b/specchem-pwa-feb-25.firebasestorage.app/o/pictograms%2Fexclamation.png?alt=media&token=a0120ae4-b4d0-482c-aca9-1400dbd294b9',
    'https://firebasestorage.googleapis.com/v0/b/specchem-pwa-feb-25.firebasestorage.app/o/pictograms%2Fflame.png?alt=media&token=3691deab-dcab-4803-8c2b-150c141e95a1',
    'https://firebasestorage.googleapis.com/v0/b/specchem-pwa-feb-25.firebasestorage.app/o/pictograms%2Fhealth-hazard.png?alt=media&token=6afae00b-0abb-47d6-9740-364dd060e28e'
  ],
  'All Shield EX': [
    'https://firebasestorage.googleapis.com/v0/b/specchem-pwa-feb-25.firebasestorage.app/o/pictograms%2Fflame.png?alt=media&token=3691deab-dcab-4803-8c2b-150c141e95a1',
    'https://firebasestorage.googleapis.com/v0/b/specchem-pwa-feb-25.firebasestorage.app/o/pictograms%2Fexclamation.png?alt=media&token=a0120ae4-b4d0-482c-aca9-1400dbd294b9',
    'https://firebasestorage.googleapis.com/v0/b/specchem-pwa-feb-25.firebasestorage.app/o/pictograms%2Fhealth-hazard.png?alt=media&token=6afae00b-0abb-47d6-9740-364dd060e28e'
  ],
  'Clean Lift 20/20': [
    'https://firebasestorage.googleapis.com/v0/b/specchem-pwa-feb-25.firebasestorage.app/o/pictograms%2Fexclamation.png?alt=media&token=a0120ae4-b4d0-482c-aca9-1400dbd294b9'
  ],
  'Crystal Shine SC Matte': [
    'https://firebasestorage.googleapis.com/v0/b/specchem-pwa-feb-25.firebasestorage.app/o/pictograms%2Fenvironmental-hazard.png?alt=media&token=6bca89fe-4727-4d17-b3e6-c52e36a6be53',
    'https://firebasestorage.googleapis.com/v0/b/specchem-pwa-feb-25.firebasestorage.app/o/pictograms%2Fexclamation.png?alt=media&token=a0120ae4-b4d0-482c-aca9-1400dbd294b9',
    'https://firebasestorage.googleapis.com/v0/b/specchem-pwa-feb-25.firebasestorage.app/o/pictograms%2Fflame.png?alt=media&token=3691deab-dcab-4803-8c2b-150c141e95a1',
    'https://firebasestorage.googleapis.com/v0/b/specchem-pwa-feb-25.firebasestorage.app/o/pictograms%2Fhealth-hazard.png?alt=media&token=6afae00b-0abb-47d6-9740-364dd060e28e'
  ],
  'Crystal Shine HS SC Matte': [
    'https://firebasestorage.googleapis.com/v0/b/specchem-pwa-feb-25.firebasestorage.app/o/pictograms%2Fenvironmental-hazard.png?alt=media&token=6bca89fe-4727-4d17-b3e6-c52e36a6be53',
    'https://firebasestorage.googleapis.com/v0/b/specchem-pwa-feb-25.firebasestorage.app/o/pictograms%2Fexclamation.png?alt=media&token=a0120ae4-b4d0-482c-aca9-1400dbd294b9',
    'https://firebasestorage.googleapis.com/v0/b/specchem-pwa-feb-25.firebasestorage.app/o/pictograms%2Fflame.png?alt=media&token=3691deab-dcab-4803-8c2b-150c141e95a1',
    'https://firebasestorage.googleapis.com/v0/b/specchem-pwa-feb-25.firebasestorage.app/o/pictograms%2Fhealth-hazard.png?alt=media&token=6afae00b-0abb-47d6-9740-364dd060e28e'
  ],
  'Cure Shield WB': [
    'https://firebasestorage.googleapis.com/v0/b/specchem-pwa-feb-25.firebasestorage.app/o/pictograms%2Fenvironmental-hazard.png?alt=media&token=6bca89fe-4727-4d17-b3e6-c52e36a6be53',
    'https://firebasestorage.googleapis.com/v0/b/specchem-pwa-feb-25.firebasestorage.app/o/pictograms%2Fexclamation.png?alt=media&token=a0120ae4-b4d0-482c-aca9-1400dbd294b9',
    'https://firebasestorage.googleapis.com/v0/b/specchem-pwa-feb-25.firebasestorage.app/o/pictograms%2Fhealth-hazard.png?alt=media&token=6afae00b-0abb-47d6-9740-364dd060e28e'
  ]
};

// Get all pictograms from database for URL matching
const { data: allPictograms } = await supabase
  .from('pictograms')
  .select('id, url, name, slug');

console.log(`Found ${allPictograms.length} pictograms in database`);

// Process each product
for (const [productName, urls] of Object.entries(productPictogramData)) {
  console.log(`\nProcessing: ${productName}`);
  
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
  
  console.log(`  Cleared existing relationships for ${productName}`);
  
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
