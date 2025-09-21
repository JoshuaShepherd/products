// Enhanced CSS Manager Integration
import { createClient } from '@/utils/supabase/server';

export interface LabelSize {
  width: number;
  height: number;
  name: string;
}

export const LABEL_SIZES = {
  '5x9': { width: 5, height: 9, name: '5x9' },
  '14x7': { width: 14, height: 7, name: '14x7' }
} as const;

export type LabelSizeKey = keyof typeof LABEL_SIZES;

export class LabelCSSCompiler {
  private async getSupabase() {
    return await createClient();
  }

  /**
   * Get compiled CSS for a product, with hierarchical inheritance
   * Template → Category → Product
   */
  async getCompiledCSS(productId: string, labelSize: LabelSizeKey): Promise<string> {
    try {
      // Check cache first
      const cachedCSS = await this.getCachedCSS(productId, labelSize);
      if (cachedCSS) {
        return cachedCSS;
      }

      // Compile fresh CSS
      const compiledCSS = await this.compileCSS(productId, labelSize);
      
      // Cache the result
      await this.cacheCSS(productId, labelSize, compiledCSS);
      
      return compiledCSS;
    } catch (error) {
      console.error('Error getting compiled CSS:', error);
      // Fallback to template CSS
      return await this.getTemplateCSS(labelSize);
    }
  }

  /**
   * Check for cached CSS
   */
  private async getCachedCSS(productId: string, labelSize: LabelSizeKey): Promise<string | null> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('compiled_css_cache')
      .select('compiled_css, created_at')
      .eq('product_id', productId)
      .eq('label_size', labelSize)
      .single();

    if (error || !data) return null;

    // Check if cache is still fresh (within 1 hour)
    const cacheAge = Date.now() - new Date(data.created_at).getTime();
    const maxCacheAge = 60 * 60 * 1000; // 1 hour

    if (cacheAge > maxCacheAge) {
      // Cache expired, delete it
      await supabase
        .from('compiled_css_cache')
        .delete()
        .eq('product_id', productId)
        .eq('label_size', labelSize);
      return null;
    }

    return data.compiled_css;
  }

  /**
   * Compile CSS with hierarchical inheritance
   */
  private async compileCSS(productId: string, labelSize: LabelSizeKey): Promise<string> {
    // Get template CSS
    const templateCSS = await this.getTemplateCSS(labelSize);
    
    // Get product info to determine category
    const supabase = await this.getSupabase();
    const { data: product } = await supabase
      .from('products')
      .select('id, title, category')
      .eq('id', productId)
      .single();

    if (!product) {
      return templateCSS;
    }

    let finalCSS = templateCSS;

    // Apply category CSS if exists
    if (product.category) {
      const categoryCSS = await this.getCategoryCSS(product.category, labelSize);
      if (categoryCSS) {
        finalCSS = this.mergeCSS(finalCSS, categoryCSS);
      }
    }

    // Apply product-specific CSS if exists
    const productCSS = await this.getProductCSS(productId, labelSize);
    if (productCSS) {
      finalCSS = this.mergeCSS(finalCSS, productCSS);
    }

    return finalCSS;
  }

  /**
   * Get template CSS
   */
  private async getTemplateCSS(labelSize: LabelSizeKey): Promise<string> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('label_templates')
      .select('base_css')
      .eq('label_size', labelSize)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      console.error('Error getting template CSS:', error);
      return '/* Template CSS not found */';
    }

    return data.base_css;
  }

  /**
   * Get category CSS
   */
  private async getCategoryCSS(category: string, labelSize: LabelSizeKey): Promise<string | null> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('category_css_overrides')
      .select('css_overrides')
      .eq('category', category)
      .eq('label_size', labelSize)
      .eq('is_active', true)
      .single();

    if (error || !data) return null;
    return data.css_overrides;
  }

  /**
   * Get product CSS
   */
  private async getProductCSS(productId: string, labelSize: LabelSizeKey): Promise<string | null> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('product_css_overrides')
      .select('css_overrides')
      .eq('product_id', productId)
      .eq('label_size', labelSize)
      .eq('is_active', true)
      .single();

    if (error || !data) return null;
    return data.css_overrides;
  }

  /**
   * Merge CSS strings - later CSS overrides earlier CSS
   */
  private mergeCSS(baseCSS: string, overrideCSS: string): string {
    return `${baseCSS}\n\n/* Override CSS */\n${overrideCSS}`;
  }

  /**
   * Cache compiled CSS
   */
  private async cacheCSS(productId: string, labelSize: LabelSizeKey, compiledCSS: string): Promise<void> {
    const supabase = await this.getSupabase();
    // First delete any existing cache
    await supabase
      .from('compiled_css_cache')
      .delete()
      .eq('product_id', productId)
      .eq('label_size', labelSize);

    // Insert new cache
    const { error } = await supabase
      .from('compiled_css_cache')
      .insert({
        product_id: productId,
        label_size: labelSize,
        compiled_css: compiledCSS,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error caching CSS:', error);
    }
  }

  /**
   * Invalidate cache for a product
   */
  async invalidateCache(productId: string, labelSize?: LabelSizeKey): Promise<void> {
    const supabase = await this.getSupabase();
    let query = supabase
      .from('compiled_css_cache')
      .delete()
      .eq('product_id', productId);

    if (labelSize) {
      query = query.eq('label_size', labelSize);
    }

    const { error } = await query;
    if (error) {
      console.error('Error invalidating cache:', error);
    }
  }
}

/**
 * Enhanced CSS utility functions
 */
export async function getEnhancedCSS(productId: string, labelSize: LabelSizeKey): Promise<string> {
  const compiler = new LabelCSSCompiler();
  return await compiler.getCompiledCSS(productId, labelSize);
}

/**
 * Check if Enhanced CSS is enabled
 */
export function isEnhancedCSSEnabled(): boolean {
  return process.env.USE_ENHANCED_CSS === 'true';
}

/**
 * Get CSS for label generation - switches between enhanced and legacy
 */
export async function getLabelCSS(productId: string, labelSize: LabelSizeKey): Promise<string> {
  if (isEnhancedCSSEnabled()) {
    return await getEnhancedCSS(productId, labelSize);
  } else {
    // Return empty string - legacy system embeds CSS directly
    return '';
  }
}
