import { Database } from './database.types';
import { createClient } from '@/utils/supabase/client'

// Type aliases for convenience
type Product = Database['public']['Tables']['products']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];
type Pictogram = Database['public']['Tables']['pictograms']['Row'];
type LabelTemplate = Database['public']['Tables']['label_templates']['Row'];
type ProductWithCategory = Database['public']['Views']['products_with_category']['Row'];
type ProductWithPictograms = Database['public']['Views']['products_with_pictograms']['Row'];

// Response types
type ProductsResponse = { data: Product[] | null; error: string | null; count?: number };
type ProductResponse = { data: Product | null; error: string | null };
type CategoriesResponse = { data: Category[] | null; error: string | null };
type PictogramsResponse = { data: Pictogram[] | null; error: string | null };

// Products API functions
export class ProductsAPI {
  
  // Get all products with optional filtering
  static async getProducts(params?: {
    categoryId?: string
    search?: string
    isActive?: boolean
    limit?: number
    offset?: number
  }): Promise<ProductsResponse> {
    try {
      const supabase = createClient();
      let query = supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          pictograms:product_pictograms(
            sort_order,
            pictogram:pictograms(*)
          )
        `)
        .order('name', { ascending: true })

      // Apply filters
      if (params?.categoryId) {
        query = query.eq('category_id', params.categoryId)
      }

      if (params?.isActive !== undefined) {
        query = query.eq('is_active', params.isActive)
      }

      if (params?.search) {
        query = query.or(`name.ilike.%${params.search}%,short_description_english.ilike.%${params.search}%`)
      }

      if (params?.limit) {
        query = query.limit(params.limit)
      }

      if (params?.offset) {
        query = query.range(params.offset, params.offset + (params.limit || 50) - 1)
      }

      const { data, error, count } = await query

      if (error) {
        console.error('Error fetching products:', error)
        return { data: null, error: error.message }
      }

      // Transform the data to flatten pictograms
      const transformedData = data?.map(product => ({
        ...product,
        pictograms: product.pictograms?.map((pp: any) => pp.pictogram) || []
      })) as ProductWithCategory[]

      return { data: transformedData as any, error: null, count: count || undefined }
    } catch (error) {
      console.error('Error in getProducts:', error)
      return { data: null, error: 'Failed to fetch products' }
    }
  }

  // Get a single product by ID or slug
  static async getProduct(identifier: string, bySlug = false): Promise<ProductResponse> {
    try {
      const supabase = createClient();
      const query = supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          pictograms:product_pictograms(
            sort_order,
            pictogram:pictograms(*)
          ),
          variants:product_variants(*),
          specifications:product_specifications(*),
          application_methods:application_methods(*)
        `)

      if (bySlug) {
        query.eq('slug', identifier)
      } else {
        query.eq('id', identifier)
      }

      const { data, error } = await query.single()

      if (error) {
        console.error('Error fetching product:', error)
        return { data: null, error: error.message }
      }

      // Transform the data to flatten pictograms
      const transformedData = {
        ...data,
        pictograms: data.pictograms?.map((pp: any) => pp.pictogram) || []
      } as ProductWithCategory

      return { data: transformedData as any, error: null }
    } catch (error) {
      console.error('Error in getProduct:', error)
      return { data: null, error: 'Failed to fetch product' }
    }
  }

  // Search products with full-text search
  static async searchProducts(query: string, limit: number = 100): Promise<ProductsResponse> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .rpc('search_products', { 
          search_term: query,
          result_limit: limit 
        })

      if (error) {
        console.error('Error searching products:', error)
        return { data: null, error: error.message }
      }

      return { data: data as any, error: null }
    } catch (error) {
      console.error('Error in searchProducts:', error)
      return { data: null, error: 'Failed to search products' }
    }
  }

  // Create a new product
  static async createProduct(productData: Partial<Product>): Promise<ProductResponse> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('products')
        .insert(productData)
        .select()
        .single()

      if (error) {
        console.error('Error creating product:', error)
        return { data: null, error: error.message }
      }

      return { data: data as any, error: null }
    } catch (error) {
      console.error('Error in createProduct:', error)
      return { data: null, error: 'Failed to create product' }
    }
  }

  // Update a product
  static async updateProduct(id: string, updates: Partial<Product>): Promise<ProductResponse> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating product:', error)
        return { data: null, error: error.message }
      }

      return { data: data as any, error: null }
    } catch (error) {
      console.error('Error in updateProduct:', error)
      return { data: null, error: 'Failed to update product' }
    }
  }

  // Delete a product
  static async deleteProduct(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting product:', error)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Error in deleteProduct:', error)
      return { success: false, error: 'Failed to delete product' }
    }
  }
}

// Categories API functions
export class CategoriesAPI {
  
  // Get all categories
  static async getCategories(): Promise<CategoriesResponse> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true })

      if (error) {
        console.error('Error fetching categories:', error)
        return { data: null, error: error.message }
      }

      return { data: data as Category[], error: null }
    } catch (error) {
      console.error('Error in getCategories:', error)
      return { data: null, error: 'Failed to fetch categories' }
    }
  }

  // Get category hierarchy (parent-child relationships)
  static async getCategoryHierarchy(): Promise<CategoriesResponse> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('categories')
        .select(`
          *,
          children:categories!parent_id(*)
        `)
        .is('parent_id', null)
        .eq('is_active', true)
        .order('sort_order', { ascending: true })

      if (error) {
        console.error('Error fetching category hierarchy:', error)
        return { data: null, error: error.message }
      }

      return { data: data as Category[], error: null }
    } catch (error) {
      console.error('Error in getCategoryHierarchy:', error)
      return { data: null, error: 'Failed to fetch category hierarchy' }
    }
  }
}

// Pictograms API functions  
export class PictogramsAPI {
  
  // Get all pictograms
  static async getPictograms(): Promise<PictogramsResponse> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('pictograms')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true })

      if (error) {
        console.error('Error fetching pictograms:', error)
        return { data: null, error: error.message }
      }

      return { data: data as Pictogram[], error: null }
    } catch (error) {
      console.error('Error in getPictograms:', error)
      return { data: null, error: 'Failed to fetch pictograms' }
    }
  }
}

// Label generation functions
export class LabelsAPI {
  
  // Generate HTML label for a product
  static async generateLabel(
    productId: string, 
    templateId: string, 
    language: 'en' | 'fr' | 'es' = 'en'
  ): Promise<{ data: string | null, error: string | null }> {
    try {
      // Get product with pictograms
      const productResult = await ProductsAPI.getProduct(productId)
      if (productResult.error || !productResult.data) {
        return { data: null, error: 'Product not found' }
      }

      // Get template
      const supabase = createClient();
      const { data: template, error: templateError } = await supabase
        .from('label_templates')
        .select('*')
        .eq('id', templateId)
        .single()

      if (templateError || !template) {
        return { data: null, error: 'Template not found' }
      }

      // Process template with product data
      const processedHtml = this.processTemplate(
        template.html_template, 
        productResult.data as any, 
        language
      )

      // Save generated label
      await supabase
        .from('product_labels')
        .upsert({
          product_id: productId,
          template_id: templateId,
          generated_html: processedHtml,
          language,
          is_current: true
        })

      return { data: processedHtml, error: null }
    } catch (error) {
      console.error('Error in generateLabel:', error)
      return { data: null, error: 'Failed to generate label' }
    }
  }

  // Process template with product data (simple string replacement)
  private static processTemplate(
    template: string, 
    product: ProductWithPictograms, 
    language: 'en' | 'fr' | 'es'
  ): string {
    let processed = template

    // Basic replacements
    const replacements = {
      '{{product_name}}': product.name,
      '{{short_description}}': this.getLocalizedDescription(product, language),
      '{{signal_word}}': product.signal_word,
      '{{signal_word_class}}': product.signal_word?.toLowerCase() || '',
      '{{hazard_statements}}': product.hazard_statements || '',
      '{{precautionary_statements}}': product.precautionary_statements || '',
      '{{shelf_life}}': product.shelf_life || '',
      '{{voc_data}}': product.voc_data || ''
    }

    // Apply replacements
    Object.entries(replacements).forEach(([key, value]) => {
      processed = processed.replace(new RegExp(key, 'g'), value || '')
    })

    // Handle pictograms using the database view structure
    if (product.pictogram_urls?.length) {
      const pictogramHtml = product.pictogram_urls
        .map((url: string, index: number) => `<img src="${url}" alt="${product.pictogram_names?.[index] || ''}" class="pictogram">`)
        .join('')
      processed = processed.replace(new RegExp('{{#each pictograms}}.*?{{/each}}', 's'), pictogramHtml)
    }

    return processed
  }

  // Get localized description based on language
  private static getLocalizedDescription(product: ProductWithPictograms, language: 'en' | 'fr' | 'es'): string {
    switch (language) {
      case 'fr':
        return product.short_description_french || product.short_description_english || ''
      case 'es':
        return product.short_description_spanish || product.short_description_english || ''
      default:
        return product.short_description_english || ''
    }
  }
}

// Utility functions
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
