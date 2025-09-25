import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Initialize Supabase client
const supabaseUrl = 'https://bnwbjrlgoylmbblfmsru.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJud2Jqcmxnb3lsbWJibGZtc3J1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5NjY4NDEsImV4cCI6MjA3MjU0Mjg0MX0.EqX0rxmgtsl_WOBfyOY1nQ-7sL8QXTKXX5TirrmvIrA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function generateProductReference() {
  try {
    console.log('🔍 Fetching products from database...');
    
    // Fetch all active products
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, slug')
      .eq('is_active', true)
      .order('name');

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    console.log(`✅ Retrieved ${products.length} products from database`);

    // Create product reference mapping
    const productReference = {
      total_products: products.length,
      last_updated: new Date().toISOString(),
      products: products.map(product => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        // Generate variations for fuzzy matching
        variations: generateNameVariations(product.name)
      }))
    };

    // Save to output directory
    const outputPath = path.join(process.cwd(), 'scripts', 'output', 'product-reference.json');
    fs.writeFileSync(outputPath, JSON.stringify(productReference, null, 2));

    console.log(`📄 Product reference saved to: ${outputPath}`);
    
    // Also create a simple name list for fuzzy matching
    const nameList = products.map(p => p.name);
    const nameListPath = path.join(process.cwd(), 'scripts', 'output', 'product-names.json');
    fs.writeFileSync(nameListPath, JSON.stringify(nameList, null, 2));
    
    console.log(`📄 Product names list saved to: ${nameListPath}`);
    
    return productReference;

  } catch (error) {
    console.error('❌ Error generating product reference:', error);
    process.exit(1);
  }
}

function generateNameVariations(productName) {
  const variations = new Set([productName]);
  
  // Common variations
  variations.add(productName.replace(/\s+/g, '-'));
  variations.add(productName.replace(/\s+/g, ''));
  variations.add(productName.replace(/-/g, ' '));
  variations.add(productName.toLowerCase());
  variations.add(productName.toUpperCase());
  
  // Remove common suffixes/prefixes
  const cleaned = productName
    .replace(/\b(WB|SB|EX|Concentrate)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  if (cleaned && cleaned !== productName) {
    variations.add(cleaned);
    variations.add(cleaned.replace(/\s+/g, '-'));
  }
  
  return Array.from(variations);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateProductReference();
}

export { generateProductReference };