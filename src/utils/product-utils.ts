import { createClient } from '@/utils/supabase/client'

/**
 * Get a product ID by its title
 * This function searches for a product by title and returns its ID
 * Used for more reliable API calls when we have the title but need the ID
 */
export async function getProductIdByTitle(title: string): Promise<string | null> {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('products')
      .select('id')
      .ilike('name', title.trim())
      .single()
    
    if (error) {
      console.error('Error fetching product ID by title:', error)
      return null
    }
    
    return data?.id || null
  } catch (error) {
    console.error('Error in getProductIdByTitle:', error)
    return null
  }
}

/**
 * Get product details by ID
 */
export async function getProductById(id: string) {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      console.error('Error fetching product by ID:', error)
      return null
    }
    
    return data
  } catch (error) {
    console.error('Error in getProductById:', error)
    return null
  }
}

/**
 * Search products by name
 */
export async function searchProducts(query: string, limit = 10) {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('products')
      .select('id, name, sku, short_description_english')
      .ilike('name', `%${query.trim()}%`)
      .limit(limit)
    
    if (error) {
      console.error('Error searching products:', error)
      return []
    }
    
    return data || []
  } catch (error) {
    console.error('Error in searchProducts:', error)
    return []
  }
}
