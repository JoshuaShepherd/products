import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { Database } from '@/lib/database.types'

type ProductInsert = Database['public']['Tables']['products']['Insert']

// CSV field mapping to database columns
const CSV_FIELD_MAPPING: { [key: string]: keyof ProductInsert } = {
  'Title': 'name',
  'Name': 'name',
  'Product Name': 'name',
  'Short Description (EN)': 'short_description_english',
  'Short Description English': 'short_description_english',
  'Short Description (FR)': 'short_description_french',
  'Short Description French': 'short_description_french',
  'Short Description (SP)': 'short_description_spanish',
  'Short Description Spanish': 'short_description_spanish',
  'Description': 'description',
  'Application': 'application',
  'Features': 'features',
  'Coverage': 'coverage',
  'Limitations': 'limitations',
  'Shelf Life': 'shelf_life',
  'VOC Data': 'voc_data',
  'SKU': 'sku',
  'Signal Word': 'signal_word',
  'Components Determining Hazard': 'components_determining_hazard',
  'Hazard Statements': 'hazard_statements',
  'Precautionary Statements': 'precautionary_statements',
  'First Aid': 'first_aid',
  'Storage': 'storage',
  'Disposal': 'disposal',
  'Subtitle 1': 'subtitle_1',
  'Subtitle 2': 'subtitle_2'
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

function parseCSV(csvText: string): any[] {
  const lines = csvText.split('\n').filter(line => line.trim())
  if (lines.length < 2) return []

  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
  const rows = []

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
    const row: any = {}
    
    headers.forEach((header, index) => {
      row[header] = values[index] || ''
    })
    
    rows.push(row)
  }

  return rows
}

function mapRowToProduct(row: any): Partial<ProductInsert> {
  const product: Partial<ProductInsert> = {
    is_active: true,
    sort_order: 0
  }

  // Map CSV fields to database columns
  Object.entries(row).forEach(([csvField, value]) => {
    const dbField = CSV_FIELD_MAPPING[csvField]
    if (dbField && value && typeof value === 'string' && value.trim()) {
      if (dbField === 'name') {
        product.name = value.trim()
        product.slug = generateSlug(value.trim())
      } else if (dbField === 'green_conscious' || dbField === 'do_not_freeze' || dbField === 'mix_well') {
        product[dbField] = value.toLowerCase() === 'true' || value.toLowerCase() === 'yes'
      } else {
        (product as any)[dbField] = value.trim()
      }
    }
  })

  return product
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!file.name.endsWith('.csv')) {
      return NextResponse.json(
        { error: 'Only CSV files are supported' },
        { status: 400 }
      )
    }

    const csvText = await file.text()
    const rows = parseCSV(csvText)

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'No valid data found in CSV file' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const results = {
      total_processed: rows.length,
      new_products_created: 0,
      duplicates_skipped: 0,
      errors: [] as string[],
      created_products: [] as any[],
      duplicates: [] as string[]
    }

    // Process each row
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      
      try {
        const productData = mapRowToProduct(row)
        
        if (!productData.name) {
          results.errors.push(`Row ${i + 2}: Missing product name`)
          continue
        }

        // Check for existing product by name or slug
        const { data: existingProduct } = await supabase
          .from('products')
          .select('id, name')
          .or(`name.eq.${productData.name},slug.eq.${productData.slug}`)
          .single()

        if (existingProduct) {
          results.duplicates_skipped++
          results.duplicates.push(productData.name!)
          continue
        }

        // Create the product
        const { data, error } = await supabase
          .from('products')
          .insert(productData)
          .select('id, name')
          .single()

        if (error) {
          results.errors.push(`Row ${i + 2} (${productData.name}): ${error.message}`)
          continue
        }

        results.new_products_created++
        results.created_products.push({
          ID: data.id,
          Title: data.name
        })

      } catch (error) {
        results.errors.push(`Row ${i + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        total_processed: results.total_processed,
        new_products_created: results.new_products_created,
        duplicates_skipped: results.duplicates_skipped,
        created_products: results.created_products
      },
      duplicates: results.duplicates,
      errors: results.errors
    })

  } catch (error) {
    console.error('Error in bulk import API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
