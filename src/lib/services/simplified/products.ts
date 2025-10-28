/**
 * Products Simplified Service (Layer 3)
 * 
 * Simplified service for products entity following the 6-Layer Type Safety Chain
 * Extends SimplifiedService base class with product-specific business logic
 */

import { SimplifiedService } from './base';
import { products } from '../../schema/index';
import { 
  ProductsSelectSchema, 
  ProductsInsertSchema, 
  ProductsUpdateSchema, 
  ProductsFiltersSchema,
  Products,
  ProductsCreate,
  ProductsUpdate,
  ProductsFilters
} from '../../schemas/index';
import { eq, ilike, or, and } from 'drizzle-orm';
import { db } from '../../drizzle';

export class ProductsService extends SimplifiedService<
  typeof products,
  Products,
  ProductsCreate,
  ProductsUpdate,
  ProductsFilters
> {
  // Base class properties
  protected table = products;
  protected selectSchema = ProductsSelectSchema;
  protected insertSchema = ProductsInsertSchema;
  protected updateSchema = ProductsUpdateSchema;
  protected filtersSchema = ProductsFiltersSchema;

  // ============================================================================
  // BUSINESS-SPECIFIC METHODS
  // ============================================================================

  /**
   * Find product by slug
   */
  async findBySlug(slug: string) {
    try {
      const result = await db.select().from(this.table).where(eq(this.table.slug, slug));
      
      if (!result[0]) {
        return this.fail('NOT_FOUND', `Product with slug '${slug}' not found`);
      }

      const validated = this.validateOutput(this.selectSchema, result[0]);
      return this.ok(validated);
    } catch (error) {
      return this.fail('DB_ERROR', error instanceof Error ? error.message : 'Unknown database error');
    }
  }

  /**
   * Find product by SKU
   */
  async findBySku(sku: string) {
    try {
      const result = await db.select().from(this.table).where(eq(this.table.sku, sku));
      
      if (!result[0]) {
        return this.fail('NOT_FOUND', `Product with SKU '${sku}' not found`);
      }

      const validated = this.validateOutput(this.selectSchema, result[0]);
      return this.ok(validated);
    } catch (error) {
      return this.fail('DB_ERROR', error instanceof Error ? error.message : 'Unknown database error');
    }
  }

  /**
   * Search products by name or description
   */
  async search(query: string, filters?: ProductsFilters) {
    try {
      // Validate filters if provided
      const validatedFilters = filters 
        ? this.validateInput(this.filtersSchema, filters)
        : {} as ProductsFilters;

      // Build search conditions
      const searchConditions = [
        ilike(this.table.name, `%${query}%`),
        ilike(this.table.description, `%${query}%`),
        ilike(this.table.shortDescriptionEnglish, `%${query}%`),
        ilike(this.table.features, `%${query}%`)
      ];

      let searchQuery = db.select().from(this.table).where(or(...searchConditions));

      // Apply additional filters
      const additionalConditions = [];

      if (validatedFilters.categoryId) {
        additionalConditions.push(eq(this.table.categoryId, validatedFilters.categoryId));
      }

      if (validatedFilters.signalWord) {
        additionalConditions.push(eq(this.table.signalWord, validatedFilters.signalWord));
      }

      if (typeof validatedFilters.isActive === 'boolean') {
        additionalConditions.push(eq(this.table.isActive, validatedFilters.isActive));
      }

      if (additionalConditions.length > 0) {
        searchQuery = searchQuery.where(and(or(...searchConditions), ...additionalConditions)) as any;
      }

      // Apply pagination
      const page = validatedFilters.page || 1;
      const limit = Math.min(validatedFilters.limit || 10, 100);
      const offset = (page - 1) * limit;

      searchQuery = searchQuery.limit(limit).offset(offset) as any;

      // Execute query
      const results = await searchQuery;

      // Validate results
      const validated = results.map(result => 
        this.validateOutput(this.selectSchema, result)
      );

      return this.ok(validated);
    } catch (error) {
      return this.fail('DB_ERROR', error instanceof Error ? error.message : 'Unknown database error');
    }
  }

  /**
   * Find products by category
   */
  async findByCategory(categoryId: string, filters?: ProductsFilters) {
    try {
      const categoryFilters: ProductsFilters = {
        ...filters,
        categoryId
      };

      return await this.findMany(categoryFilters);
    } catch (error) {
      return this.fail('DB_ERROR', error instanceof Error ? error.message : 'Unknown database error');
    }
  }

  /**
   * Find products by hazard class
   */
  async findByHazardClass(hazardClass: string, filters?: ProductsFilters) {
    try {
      const hazardFilters: ProductsFilters = {
        ...filters,
        hazardClass
      };

      return await this.findMany(hazardFilters);
    } catch (error) {
      return this.fail('DB_ERROR', error instanceof Error ? error.message : 'Unknown database error');
    }
  }

  /**
   * Get active products only
   */
  async findActive(filters?: ProductsFilters) {
    try {
      const activeFilters: ProductsFilters = {
        ...filters,
        isActive: true
      };

      return await this.findMany(activeFilters);
    } catch (error) {
      return this.fail('DB_ERROR', error instanceof Error ? error.message : 'Unknown database error');
    }
  }

  /**
   * Create product with slug generation
   */
  async createWithSlug(data: Omit<ProductsCreate, 'slug'> & { name: string }) {
    try {
      // Generate slug from name
      const slug = this.generateSlug(data.name);
      
      // Check if slug already exists
      const existing = await this.findBySlug(slug);
      if (existing.ok) {
        return this.fail('SLUG_EXISTS', `Product with slug '${slug}' already exists`);
      }

      // Create product with generated slug
      const productData: ProductsCreate = {
        ...data,
        slug
      };

      return await this.create(productData);
    } catch (error) {
      return this.fail('DB_ERROR', error instanceof Error ? error.message : 'Unknown database error');
    }
  }

  /**
   * Update product slug when name changes
   */
  async updateWithSlugRefresh(id: string, data: ProductsUpdate) {
    try {
      const updateData = { ...data };

      // If name is being updated, also update the slug
      if (data.name) {
        const newSlug = this.generateSlug(data.name);
        
        // Check if new slug conflicts with existing products (excluding current one)
        const existing = await this.findBySlug(newSlug);
        if (existing.ok && existing.data.id !== id) {
          return this.fail('SLUG_EXISTS', `Product with slug '${newSlug}' already exists`);
        }

        updateData.slug = newSlug;
      }

      return await this.update(id, updateData);
    } catch (error) {
      return this.fail('DB_ERROR', error instanceof Error ? error.message : 'Unknown database error');
    }
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  }
}

// Export singleton instance
export const productsService = new ProductsService();
