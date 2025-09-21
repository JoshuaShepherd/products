import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get search query from URL parameters
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    


    let query = supabase
      .from('products')
      .select(`
        id,
        name,
        subtitle_1,
        subtitle_2,
        sku,
        short_description_english,
        category:categories(name)
      `)
      .eq('is_active', true)
      .order('name') // Order by name alphabetically

    // Add search functionality if search param exists
    if (search && search.trim()) {
      const searchTerm = search.trim()
      query = query.or(`name.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%,short_description_english.ilike.%${searchTerm}%`)
    }

    const { data: products, error } = await query

    if (error) {
      console.error('Error fetching products:', error)
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 500 }
      )
    }



    // Return products with original property names to match Product type
    const transformedProducts = products?.map(product => ({
      id: product.id,
      name: product.name,
      subtitle_1: product.subtitle_1,
      subtitle_2: product.subtitle_2,
      sku: product.sku,
      description: product.short_description_english,
      short_description_english: product.short_description_english,
      category: Array.isArray(product.category) && product.category.length > 0 
        ? product.category[0].name 
        : null
    })) || []

    return NextResponse.json({ products: transformedProducts })
  } catch (error) {
    console.error('Error in product-titles API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
