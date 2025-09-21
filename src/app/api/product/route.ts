import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const title = searchParams.get('title')

    const supabase = await createClient()

    if (title) {
      // Get specific product by title
      const { data: product, error } = await supabase
        .from('products')
        .select('*')
        .ilike('name', title.trim())
        .single()

      if (error) {
        console.error('Error fetching product by title:', error)
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        )
      }

      // Check for 'format' query parameter to determine response format
      const format = searchParams.get('format')
      
      if (format === 'raw' || format === 'canonical') {
        // Return canonical database format (new standardized approach)
        return NextResponse.json({ product })
      }
      
      // Legacy transformed format for backward compatibility
      const transformedProduct = {
        ID: product.id,
        Title: product.name,
        "Short Description English": product.short_description_english,
        Description: product.description,
        Application: product.application,
        Features: product.features,
        Coverage: product.coverage,
        Limitations: product.limitations,
        "Shelf Life": product.shelf_life,
        "VOC Data": product.voc_data,
        "Signal Word": product.signal_word,
        "Components Determining Hazard": product.components_determining_hazard,
        "Hazard Statements": product.hazard_statements,
        "Precautionary Statements": product.precautionary_statements,
        "Response Statements": product.response_statements,
        "First Aid": product.first_aid,
        Storage: product.storage,
        Disposal: product.disposal,
        "Proper Shipping Name": product.proper_shipping_name,
        "UN Number": product.un_number,
        "Hazard Class": product.hazard_class,
        "Packing Group": product.packing_group,
        "Emergency Response Guide": product.emergency_response_guide,
        "Do Not Freeze": product.do_not_freeze ? "true" : "false",
        "Mix Well": product.mix_well ? "true" : "false",
        "Green Conscious": product.green_conscious ? "true" : "false",
        "Used By Date": product.used_by_date
      };

      return NextResponse.json({ product: transformedProduct })
    } else {
      // Get all products
      const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .order('name')

      if (error) {
        console.error('Error fetching all products:', error)
        return NextResponse.json(
          { error: 'Failed to fetch products' },
          { status: 500 }
        )
      }

      // Check for 'format' query parameter to determine response format
      const format = searchParams.get('format')
      
      if (format === 'raw' || format === 'canonical') {
        // Return canonical database format (new standardized approach)
        return NextResponse.json(products || [])
      }
      
      // Legacy transformed format for backward compatibility
      const transformedProducts = (products || []).map(product => ({
        ID: product.id,
        Title: product.name,
        "Short Description English": product.short_description_english,
        Description: product.description,
        Application: product.application,
        Features: product.features,
        Coverage: product.coverage,
        Limitations: product.limitations,
        "Shelf Life": product.shelf_life,
        "VOC Data": product.voc_data,
        "Signal Word": product.signal_word,
        "Components Determining Hazard": product.components_determining_hazard,
        "Hazard Statements": product.hazard_statements,
        "Precautionary Statements": product.precautionary_statements,
        "Response Statements": product.response_statements,
        "First Aid": product.first_aid,
        Storage: product.storage,
        Disposal: product.disposal,
        "Proper Shipping Name": product.proper_shipping_name,
        "UN Number": product.un_number,
        "Hazard Class": product.hazard_class,
        "Packing Group": product.packing_group,
        "Emergency Response Guide": product.emergency_response_guide,
        "Do Not Freeze": product.do_not_freeze ? "true" : "false",
        "Mix Well": product.mix_well ? "true" : "false",
        "Green Conscious": product.green_conscious ? "true" : "false",
        "Used By Date": product.used_by_date
      }));

      return NextResponse.json({ products: transformedProducts })
    }
  } catch (error) {
    console.error('Error in product API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
