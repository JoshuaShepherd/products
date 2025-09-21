import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import { parse } from 'csv-parse';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Found' : 'Missing');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Found' : 'Missing');
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Found' : 'Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Function to create slug from name
function createSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
// Function to clean UN numbers
function cleanUnNumber(value) {
  if (!value || value.trim() === '') return null;
  
  const cleaned = value.trim();
  
  // Filter out non-UN number values
  if (cleaned.includes('Not applicable') || 
      cleaned.includes('Not regulated') || 
      cleaned.includes('None') ||
      cleaned.includes('Class') ||
      cleaned.includes('Hazard')) {
    return null;
  }
  
  return cleaned.length > 50 ? cleaned.substring(0, 50) : cleaned;
}

// Function to truncate text fields
function truncateText(value, maxLength) {
  if (!value) return value;
  return value.length > maxLength ? value.substring(0, maxLength) : value;
}

// Function to map signal word
function mapSignalWord(signalWord) {
  if (!signalWord || signalWord.toLowerCase() === 'not applicable') return 'None';
  if (signalWord.toLowerCase() === 'warning') return 'Warning';
  if (signalWord.toLowerCase() === 'danger') return 'Danger';
  return 'None';
}

// Function to map hazard class
function mapHazardClass(value) {
  if (!value || value.trim() === '') return 'Not applicable';
  
  // Clean up the value
  const cleaned = value.trim();
  
  // Map variations to standard values
  const mappings = {
    'Class 3 - Flammable Liquid': 'Class 3',
    'Class 3 – Flammable Liquid': 'Class 3',
    'Class 3 - Combustible Liquid': 'Class 3',  
    'Class 3 – Combustible Liquid': 'Class 3',
    'Class 3 - Flammable Liquids': 'Class 3',
    '3 (Combustible Liquid)': 'Class 3',
    '3 (Flammable liquid)': 'Class 3',
    '3 – Flammable Liquid': 'Class 3',
    'Flammable Liquid': 'Class 3',
    'Class 8 – Corrosive': 'Class 8',
    'Class 8 - Corrosive': 'Class 8',
    'Hazard Class 8': 'Class 8',
    'Class 3; Class 8': 'Class 3',
    'Packing Group III': 'Not applicable',
    'PGIII': 'Not applicable',
    'PGII': 'Not applicable',
    'PG II': 'Not applicable',
    'PG III': 'Not applicable'
  };
  
  return mappings[cleaned] || cleaned;
}

// Function to map packing group
function mapPackingGroup(value) {
  if (!value || value.trim() === '') return 'Not applicable';
  
  const cleaned = value.trim();
  
  // Map variations to standard values
  const mappings = {
    'PGII': 'II',
    'PGIII': 'III', 
    'PG II': 'II',
    'PG III': 'III',
    'Packing Group III': 'III',
    'NA ERG 153': 'Not applicable',
    '153': 'Not applicable',
    '154': 'Not applicable',
    '128': 'Not applicable'
  };
  
  return mappings[cleaned] || cleaned;
}

async function insertCategories(categories) {
  console.log('\n=== Inserting Categories ===');
  
  for (const category of categories) {
    if (!category) continue;
    
    const slug = createSlug(category);
    
    const { data, error } = await supabase
      .from('categories')
      .upsert({
        name: category,
        slug: slug,
        description: `${category} products`,
        is_active: true
      }, {
        onConflict: 'slug',
        ignoreDuplicates: false
      })
      .select();

    if (error) {
      console.error(`Error inserting category ${category}:`, error);
    } else {
      console.log(`✓ Category: ${category}`);
    }
  }
}

async function insertProducts(products) {
  console.log('\n=== Inserting Products ===');
  
  // First, get all categories to map category names to IDs
  const { data: categoriesData, error: categoriesError } = await supabase
    .from('categories')
    .select('id, name');
    
  if (categoriesError) {
    console.error('Error fetching categories:', categoriesError);
    return;
  }
  
  const categoryMap = new Map();
  categoriesData?.forEach(cat => {
    categoryMap.set(cat.name, cat.id);
  });

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    
    try {
      const slug = createSlug(product.product);
      const categoryId = product.category ? categoryMap.get(product.category) : null;
      
      const productData = {
        name: product.product,
        slug: slug,
        category_id: categoryId,
        short_description_english: product.short_description_english || null,
        short_description_french: product.short_description_french || null,
        short_description_spanish: product.short_description_spanish || null,
        description: product.Description || null,
        application: product.application || null,
        features: product.features || null,
        coverage: product.coverage || null,
        limitations: product.Limitations || null,
        shelf_life: product['Shelf Life'] || null,
        voc_data: product.voc_data || null,
        signal_word: mapSignalWord(product.signal_word),
        components_determining_hazard: product.components_determining_hazard || null,
        hazard_statements: product.hazard_statements || null,
        precautionary_statements: product.precautionary_statements || null,
        response_statements: product.response_statements || null,
        first_aid: product.first_aid || null,
        storage: product.storage || null,
        disposal: product.disposal || null,
        composants_determinant_le_danger: product['composants_déterminant_le_danger'] || null,
        mot_de_signalement: product.mot_de_signalement || null,
        mentions_de_danger: product.mentions_de_danger || null,
        conseils_de_prudence: product.conseils_de_prudence || null,
        premiers_soins: product.premiers_soins || null,
        mesures_de_premiers_secours: product.mesures_de_premiers_secours || null,
        consignes_de_stockage: product.consignes_de_stockage || null,
        consignes_delimination: product.consignes_delimination || null,
        proper_shipping_name: product.proper_shipping_name || null,
        un_number: product.un_number || null,
        hazard_class: mapHazardClass(product.hazard_class),
        packing_group: mapPackingGroup(product.packing_group),
        emergency_response_guide: product.emergency_response_guide || null,
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
        console.error(`Error inserting product ${product.product}:`, error);
      } else {
        console.log(`✓ Product ${i + 1}/${products.length}: ${product.product}`);
      }
    } catch (err) {
      console.error(`Error processing product ${product.product}:`, err);
    }
  }
}

async function insertPictograms(products) {
  console.log('\n=== Inserting Pictograms ===');
  
  const pictogramUrls = new Set();
  
  // Collect all unique pictogram URLs
  products.forEach(product => {
    if (product.pictogram_urls) {
      const urls = product.pictogram_urls.split(',').map(url => url.trim());
      urls.forEach(url => {
        if (url) pictogramUrls.add(url);
      });
    }
  });

  // Insert pictograms
  for (const url of pictogramUrls) {
    try {
      // Extract filename from URL for name
      const filename = url.split('/').pop()?.split('?')[0] || url;
      const name = filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      const slug = createSlug(name);
      
      const { data, error } = await supabase
        .from('pictograms')
        .upsert({
          name: name,
          slug: slug,
          url: url,
          description: `${name} pictogram`,
          is_active: true
        }, {
          onConflict: 'slug',
          ignoreDuplicates: false
        })
        .select();

      if (error) {
        console.error(`Error inserting pictogram ${name}:`, error);
      } else {
        console.log(`✓ Pictogram: ${name}`);
      }
    } catch (err) {
      console.error(`Error processing pictogram ${url}:`, err);
    }
  }
}

async function linkProductPictograms(products) {
  console.log('\n=== Linking Product Pictograms ===');
  
  // Get all products and pictograms
  const { data: productsData, error: productsError } = await supabase
    .from('products')
    .select('id, name');
    
  const { data: pictogramsData, error: pictogramsError } = await supabase
    .from('pictograms')
    .select('id, url');

  if (productsError || pictogramsError) {
    console.error('Error fetching products or pictograms for linking');
    return;
  }

  const productMap = new Map();
  productsData?.forEach(p => productMap.set(p.name, p.id));
  
  const pictogramMap = new Map();
  pictogramsData?.forEach(p => pictogramMap.set(p.url, p.id));

  for (const product of products) {
    if (!product.pictogram_urls) continue;
    
    const productId = productMap.get(product.product);
    if (!productId) continue;
    
    const urls = product.pictogram_urls.split(',').map(url => url.trim());
    
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      const pictogramId = pictogramMap.get(url);
      
      if (pictogramId) {
        const { error } = await supabase
          .from('product_pictograms')
          .upsert({
            product_id: productId,
            pictogram_id: pictogramId,
            sort_order: i
          }, {
            onConflict: 'product_id,pictogram_id',
            ignoreDuplicates: true
          });

        if (error) {
          console.error(`Error linking pictogram to ${product.product}:`, error);
        }
      }
    }
  }
}

async function main() {
  const csvPath = path.join(process.cwd(), 'public', 'data', 'products_rows.csv');
  
  console.log('🚀 Starting product import from CSV...');
  console.log(`Reading CSV from: ${csvPath}`);
  
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  
  parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  }, async (err, records) => {
    if (err) {
      console.error('Error parsing CSV:', err);
      return;
    }

    console.log(`📊 Found ${records.length} products in CSV`);
    
    // Extract unique categories
    const categories = new Set(records.map(record => record.category).filter(Boolean));
    console.log(`📂 Found ${categories.size} unique categories`);
    
    try {
      // Insert categories first
      await insertCategories(categories);
      
      // Insert pictograms
      await insertPictograms(records);
      
      // Insert products
      await insertProducts(records);
      
      // Link products to pictograms
      await linkProductPictograms(records);
      
      console.log('\n🎉 Import completed successfully!');
      
      // Show summary
      const { count: productCount } = await supabase
        .from('products')
        .select('id', { count: 'exact', head: true });
        
      const { count: categoryCount } = await supabase
        .from('categories')
        .select('id', { count: 'exact', head: true });
        
      const { count: pictogramCount } = await supabase
        .from('pictograms')
        .select('id', { count: 'exact', head: true });
      
      console.log('\n📈 Final Database Summary:');
      console.log(`- Products: ${productCount}`);
      console.log(`- Categories: ${categoryCount}`);
      console.log(`- Pictograms: ${pictogramCount}`);
      
    } catch (error) {
      console.error('Error during import:', error);
    }
  });
}

main().catch(console.error);
