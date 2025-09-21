import { createClient } from '@supabase/supabase-js';
import { parse } from 'csv-parse/sync';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Helper functions
function createSlug(name) {
  return name.toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
}

function cleanUnNumber(value) {
  if (!value || value.trim() === '') return null;
  
  const cleaned = value.trim();
  
  // Filter out non-UN number values and return null for anything too long
  if (cleaned.includes('Not applicable') || 
      cleaned.includes('Not regulated') || 
      cleaned.includes('None') ||
      cleaned.includes('Class') ||
      cleaned.includes('Hazard') ||
      cleaned.length > 10) {
    return null; // Return null instead of truncating to avoid constraint errors
  }
  
  return cleaned;
}

function truncateText(value, maxLength) {
  if (!value) return value;
  return value.length > maxLength ? value.substring(0, maxLength) : value;
}

function mapSignalWord(signalWord) {
  if (!signalWord || signalWord.toLowerCase() === 'not applicable') return 'None';
  if (signalWord.toLowerCase() === 'warning') return 'Warning';
  if (signalWord.toLowerCase() === 'danger') return 'Danger';
  return 'None';
}

function mapHazardClass(value) {
  if (!value || value.trim() === '') return 'Not applicable';
  
  const cleaned = value.trim();
  
  // Map to the correct enum values: 'Class 1', 'Class 2', etc.
  if (cleaned.includes('Class 3') || cleaned.includes('Flammable') || cleaned === '3') return 'Class 3';
  if (cleaned.includes('Class 8') || cleaned.includes('Corrosive') || cleaned === '8') return 'Class 8';
  if (cleaned.includes('Class 6') || cleaned === '6.1') return 'Class 6';
  if (cleaned.includes('Class 1') || cleaned === '1') return 'Class 1';
  if (cleaned.includes('Class 2') || cleaned === '2') return 'Class 2';
  if (cleaned.includes('Class 4') || cleaned === '4') return 'Class 4';
  if (cleaned.includes('Class 5') || cleaned === '5') return 'Class 5';
  if (cleaned.includes('Class 7') || cleaned === '7') return 'Class 7';
  if (cleaned.includes('Class 9') || cleaned === '9') return 'Class 9';
  
  return 'Not applicable';
}

function mapPackingGroup(value) {
  if (!value || value.trim() === '') return 'Not applicable';
  
  const cleaned = value.trim();
  
  // Map to the correct enum values: 'PG I', 'PG II', 'PG III', 'Not applicable'
  if (cleaned.includes('III') || cleaned === 'III') return 'PG III';
  if (cleaned.includes('II') || cleaned === 'II') return 'PG II';  
  if (cleaned === 'I') return 'PG I';
  
  return 'Not applicable';
}

async function getCategoryId(categoryName) {
  if (!categoryName || categoryName.trim() === '') return null;
  
  const { data, error } = await supabase
    .from('categories')
    .select('id')
    .eq('name', categoryName.trim())
    .single();
  
  if (error || !data) {
    console.warn(`Category not found: ${categoryName}`);
    return null;
  }
  
  return data.id;
}

async function insertCategories(products) {
  console.log('\n=== Inserting Categories ===');
  
  const categories = [...new Set(products
    .map(product => product.category?.trim())
    .filter(category => category && category !== '')
  )];
  
  console.log(`Found ${categories.length} unique categories`);
  
  for (const categoryName of categories) {
    try {
      const categoryData = {
        name: categoryName,
        slug: createSlug(categoryName),
        description: `Category for ${categoryName} products`,
        is_active: true
      };
      
      const { error } = await supabase
        .from('categories')
        .upsert(categoryData, {
          onConflict: 'slug',
          ignoreDuplicates: false
        });
      
      if (error) {
        console.error(`Error inserting category ${categoryName}:`, error);
      } else {
        console.log(`✓ Category: ${categoryName}`);
      }
    } catch (err) {
      console.error(`Error processing category ${categoryName}:`, err);
    }
  }
}

async function insertProducts(products) {
  console.log('\n=== Inserting Products ===');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    
    if (!product.product || product.product.trim() === '') {
      console.warn(`Skipping product at row ${i + 1}: no name`);
      continue;
    }
    
    try {
      const productData = {
        slug: createSlug(product.product),
        name: truncateText(product.product, 500),
        sku: product.sku || null,
        category_id: await getCategoryId(product.category),
        short_description_english: truncateText(product.short_description_english, 500),
        short_description_french: truncateText(product.short_description_french, 500), 
        short_description_spanish: truncateText(product.short_description_spanish, 500),
        description: product.description || null,
        application: product.application || null,
        features: product.features || null,
        coverage: product.coverage || null,
        limitations: product.limitations || null,
        shelf_life: product.shelf_life || null,
        voc_data: product.voc_data || null,
        signal_word: mapSignalWord(product.signal_word),
        components_determining_hazard: product.components_determining_hazard || null,
        hazard_statements: product.hazard_statements || null,
        precautionary_statements: product.precautionary_statements || null,
        response_statements: product.response_statements || null,
        first_aid: product.first_aid || null,
        storage: product.storage || null,
        disposal: product.disposal || null,
        composants_determinant_le_danger: product.composants_determinant_le_danger || null,
        mot_de_signalement: product.mot_de_signalement || null,
        mentions_de_danger: product.mentions_de_danger || null,
        conseils_de_prudence: product.conseils_de_prudence || null,
        premiers_soins: product.premiers_soins || null,
        mesures_de_premiers_secours: product.mesures_de_premiers_secours || null,
        consignes_de_stockage: product.consignes_de_stockage || null,
        consignes_delimination: product.consignes_delimination || null,
        proper_shipping_name: truncateText(product.proper_shipping_name, 500),
        un_number: cleanUnNumber(product.un_number),
        hazard_class: mapHazardClass(product.hazard_class),
        packing_group: mapPackingGroup(product.packing_group),
        emergency_response_guide: truncateText(product.emergency_response_guide, 10),
        subtitle_1: product.subtitle_1 || null,
        subtitle_2: product.subtitle_2 || null,
        do_not_freeze: product.do_not_freeze === 'true' || product.do_not_freeze === '1',
        mix_well: product.mix_well === 'true' || product.mix_well === '1',
        green_conscious: Boolean(product.green_conscious),
        used_by_date: product.used_by_date || null,
        is_active: true
      };

      const { data, error } = await supabase
        .from('products')
        .upsert(productData, {
          onConflict: 'slug',
          ignoreDuplicates: false
        })
        .select();

      if (error) {
        console.error(`✗ Product ${i + 1}/${products.length}: ${product.product}`, error.message);
        errorCount++;
      } else {
        console.log(`✓ Product ${i + 1}/${products.length}: ${product.product}`);
        successCount++;
      }
    } catch (err) {
      console.error(`✗ Product ${i + 1}/${products.length}: ${product.product}`, err.message);
      errorCount++;
    }
  }
  
  console.log(`\nProducts: ${successCount} successful, ${errorCount} failed`);
}

async function insertPictograms(products) {
  console.log('\n=== Inserting Pictograms ===');
  
  const pictogramUrls = new Set();
  
  products.forEach(product => {
    if (product.pictogram_urls) {
      const urls = product.pictogram_urls.split(',').map(url => url.trim());
      urls.forEach(url => {
        if (url) pictogramUrls.add(url);
      });
    }
  });

  console.log(`Found ${pictogramUrls.size} unique pictograms`);

  for (const url of pictogramUrls) {
    try {
      const filename = url.split('/').pop().split('?')[0];
      const nameFromUrl = filename.replace('.png', '').replace(/[-_]/g, ' ');
      
      const pictogramData = {
        name: nameFromUrl,
        slug: createSlug(nameFromUrl),
        url: url,
        is_active: true
      };
      
      const { error } = await supabase
        .from('pictograms')
        .upsert(pictogramData, {
          onConflict: 'slug',
          ignoreDuplicates: false
        });
      
      if (error) {
        console.error(`Error inserting pictogram ${nameFromUrl}:`, error);
      } else {
        console.log(`✓ Pictogram: ${nameFromUrl}`);
      }
    } catch (err) {
      console.error(`Error processing pictogram ${url}:`, err);
    }
  }
}

async function linkProductPictograms(products) {
  console.log('\n=== Linking Product Pictograms ===');
  
  for (const product of products) {
    if (!product.pictogram_urls) continue;
    
    try {
      const { data: productData } = await supabase
        .from('products')
        .select('id')
        .eq('slug', createSlug(product.product))
        .single();
      
      if (!productData) continue;
      
      const urls = product.pictogram_urls.split(',').map(url => url.trim());
      
      for (const url of urls) {
        if (!url) continue;
        
        try {
          const filename = url.split('/').pop().split('?')[0];
          const nameFromUrl = filename.replace('.png', '').replace(/[-_]/g, ' ');
          
          const { data: pictogramData } = await supabase
            .from('pictograms')
            .select('id')
            .eq('slug', createSlug(nameFromUrl))
            .single();
          
          if (pictogramData) {
            const { error } = await supabase
              .from('product_pictograms')
              .upsert({
                product_id: productData.id,
                pictogram_id: pictogramData.id
              }, {
                onConflict: 'product_id,pictogram_id',
                ignoreDuplicates: false
              });
            
            if (error) {
              console.error(`Error linking pictogram to ${product.product}:`, error);
            }
          }
        } catch (error) {
          console.error(`Error linking pictogram to ${product.product}:`, error);
        }
      }
    } catch (error) {
      console.error(`Error linking pictogram to ${product.product}:`, error);
    }
  }
}

async function main() {
  const csvPath = path.join(process.cwd(), 'public', 'data', 'products_rows.csv');
  
  console.log('🚀 Starting product import from CSV...');
  console.log(`Reading CSV from: ${csvPath}`);
  
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  });

  console.log(`Found ${records.length} records in CSV`);

  try {
    await insertCategories(records);
    await insertPictograms(records);
    await insertProducts(records);
    await linkProductPictograms(records);

    const { count: productCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    
    const { count: categoryCount } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true });
    
    const { count: pictogramCount } = await supabase
      .from('pictograms')
      .select('*', { count: 'exact', head: true });

    console.log('\n🎉 Import completed!');
    console.log(`Final counts:`);
    console.log(`- Products: ${productCount}`);
    console.log(`- Categories: ${categoryCount}`);
    console.log(`- Pictograms: ${pictogramCount}`);
    
  } catch (error) {
    console.error('Error during import:', error);
  }
}

main().catch(console.error);
