import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkPictograms() {
  try {
    console.log('🔍 Checking pictograms data...\n')
    
    // Check pictograms table
    console.log('1. Checking pictograms table:')
    const { data: pictograms, error: pictError } = await supabase
      .from('pictograms')
      .select('*')
      .limit(5)
    
    if (pictError) {
      console.error('❌ Error fetching pictograms:', pictError)
    } else {
      console.log(`✅ Found ${pictograms?.length} pictograms (showing first 5):`)
      pictograms?.forEach(p => {
        console.log(`   - ${p.id}: ${p.name} (${p.ghs_code})`)
      })
    }
    
    console.log('\n2. Checking product_pictograms relationships:')
    const { data: relationships, error: relError } = await supabase
      .from('product_pictograms')
      .select(`
        id,
        product_id,
        pictogram_id,
        products(name),
        pictograms(name)
      `)
      .limit(10)
    
    if (relError) {
      console.error('❌ Error fetching relationships:', relError)
    } else {
      console.log(`✅ Found ${relationships?.length} product-pictogram relationships (showing first 5):`)
      relationships?.forEach(r => {
        console.log(`   - Product: ${r.products?.name} → Pictogram: ${r.pictograms?.name} (${r.pictograms?.ghs_code})`)
      })
    }
    
    console.log('\n3. ALL PRODUCT-PICTOGRAM RELATIONSHIPS:')
    const { data: allRelationships, error: allRelError } = await supabase
      .from('product_pictograms')
      .select(`
        id,
        product_id,
        pictogram_id,
        products(name),
        pictograms(name)
      `)
      
    if (allRelError) {
      console.error('❌ Error fetching all relationships:', allRelError)
    } else {
      console.log(`TOTAL RELATIONSHIPS FOUND: ${allRelationships?.length || 0}`)
      if (allRelationships?.length > 0) {
        allRelationships.forEach(r => {
          console.log(`   - ${r.products?.name} → ${r.pictograms?.name}`)
        })
      } else {
        console.log('   - ❌ NO RELATIONSHIPS EXIST AT ALL')
      }
    }

    console.log('\n4. Checking products with the actual pictograms column:')
    const { data: productsWithPictograms, error: prodError } = await supabase
      .from('products')
      .select('id, name, pictograms')
      .not('pictograms', 'is', null)
      .neq('pictograms', '')
      .limit(10)
    
    if (prodError) {
      console.error('❌ Error fetching products with pictograms:', prodError)
    } else {
      console.log(`✅ Found ${productsWithPictograms?.length} products with pictograms column data:`)
      if (productsWithPictograms?.length > 0) {
        productsWithPictograms.forEach(p => {
          console.log(`   - ${p.name}: pictograms = "${p.pictograms}"`)
        })
      } else {
        console.log('   - ❌ NO PRODUCTS HAVE PICTOGRAMS COLUMN DATA')
      }
    }
    
    console.log('\n5. Testing the API route logic:')
    // Test the same query that the API routes use
    const testProductName = 'Deco Shine'
    const { data: testProduct, error: testError } = await supabase
      .from('products')
      .select(`
        *,
        product_pictograms(
          pictograms(*)
        )
      `)
      .eq('name', testProductName)
      .single()
    
    if (testError) {
      console.error(`❌ Error fetching ${testProductName}:`, testError)
    } else {
      console.log(`✅ Product "${testProductName}":`)
      console.log(`   - Product ID: ${testProduct.id}`)
      console.log(`   - Pictogram relationships: ${testProduct.product_pictograms?.length || 0}`)
      
      if (testProduct.product_pictograms?.length > 0) {
        console.log('   - Pictograms found:')
        testProduct.product_pictograms.forEach((pp, index) => {
          console.log(`     ${index + 1}. ${pp.pictograms?.name} (${pp.pictograms?.ghs_code})`)
          console.log(`        Image: ${pp.pictograms?.image_url}`)
        })
      } else {
        console.log('   - ❌ NO PICTOGRAMS FOUND for this product')
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

// Run the check
checkPictograms()