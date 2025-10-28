/**
 * Categories Simplified Service (Layer 3)
 * 
 * Simplified service for categories entity following the 6-Layer Type Safety Chain
 * Extends SimplifiedService base class with category-specific business logic
 */

import { SimplifiedService } from './base';
import { categories } from '../../schema/index';
import { 
  CategoriesSelectSchema, 
  CategoriesInsertSchema, 
  CategoriesUpdateSchema, 
  CategoriesFiltersSchema,
  Categories,
  CategoriesCreate,
  CategoriesUpdate,
  CategoriesFilters
} from '../../schemas/index';
import { eq, isNull, ilike } from 'drizzle-orm';
import { db } from '../../drizzle';

export class CategoriesService extends SimplifiedService<
  typeof categories,
  Categories,
  CategoriesCreate,
  CategoriesUpdate,
  CategoriesFilters
> {
  // Base class properties
  protected table = categories;
  protected selectSchema = CategoriesSelectSchema;
  protected insertSchema = CategoriesInsertSchema;
  protected updateSchema = CategoriesUpdateSchema;
  protected filtersSchema = CategoriesFiltersSchema;

  // ============================================================================
  // BUSINESS-SPECIFIC METHODS
  // ============================================================================

  /**
   * Find category by slug
   */
  async findBySlug(slug: string) {
    try {
      const result = await db.select().from(this.table).where(eq(this.table.slug, slug));
      
      if (!result[0]) {
        return this.fail('NOT_FOUND', `Category with slug '${slug}' not found`);
      }

      const validated = this.validateOutput(this.selectSchema, result[0]);
      return this.ok(validated);
    } catch (error) {
      return this.fail('DB_ERROR', error instanceof Error ? error.message : 'Unknown database error');
    }
  }

  /**
   * Find root categories (no parent)
   */
  async findRootCategories(filters?: CategoriesFilters) {
    try {
      const rootFilters: CategoriesFilters = {
        ...filters,
        parentId: undefined // This will be handled in the query
      };

      let query = db.select().from(this.table).where(isNull(this.table.parentId));

      // Apply active filter if specified
      if (typeof filters?.isActive === 'boolean') {
        query = query.where(eq(this.table.isActive, filters.isActive)) as any;
      }

      // Apply pagination
      const page = filters?.page || 1;
      const limit = Math.min(filters?.limit || 10, 100);
      const offset = (page - 1) * limit;

      query = query.limit(limit).offset(offset) as any;

      const results = await query;

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
   * Find child categories of a parent
   */
  async findByParent(parentId: string, filters?: CategoriesFilters) {
    try {
      const parentFilters: CategoriesFilters = {
        ...filters,
        parentId
      };

      return await this.findMany(parentFilters);
    } catch (error) {
      return this.fail('DB_ERROR', error instanceof Error ? error.message : 'Unknown database error');
    }
  }

  /**
   * Search categories by name or description
   */
  async search(query: string, filters?: CategoriesFilters) {
    try {
      // Validate filters if provided
      const validatedFilters = filters 
        ? this.validateInput(this.filtersSchema, filters)
        : {} as CategoriesFilters;

      // Build search query
      let searchQuery = db.select().from(this.table).where(
        ilike(this.table.name, `%${query}%`)
      );

      // Apply additional filters
      if (validatedFilters.parentId) {
        searchQuery = searchQuery.where(eq(this.table.parentId, validatedFilters.parentId)) as any;
      }

      if (typeof validatedFilters.isActive === 'boolean') {
        searchQuery = searchQuery.where(eq(this.table.isActive, validatedFilters.isActive)) as any;
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
   * Get active categories only
   */
  async findActive(filters?: CategoriesFilters) {
    try {
      const activeFilters: CategoriesFilters = {
        ...filters,
        isActive: true
      };

      return await this.findMany(activeFilters);
    } catch (error) {
      return this.fail('DB_ERROR', error instanceof Error ? error.message : 'Unknown database error');
    }
  }

  /**
   * Create category with slug generation
   */
  async createWithSlug(data: Omit<CategoriesCreate, 'slug'> & { name: string }) {
    try {
      // Generate slug from name
      const slug = this.generateSlug(data.name);
      
      // Check if slug already exists
      const existing = await this.findBySlug(slug);
      if (existing.ok) {
        return this.fail('SLUG_EXISTS', `Category with slug '${slug}' already exists`);
      }

      // Create category with generated slug
      const categoryData: CategoriesCreate = {
        ...data,
        slug
      };

      return await this.create(categoryData);
    } catch (error) {
      return this.fail('DB_ERROR', error instanceof Error ? error.message : 'Unknown database error');
    }
  }

  /**
   * Update category slug when name changes
   */
  async updateWithSlugRefresh(id: string, data: CategoriesUpdate) {
    try {
      const updateData = { ...data };

      // If name is being updated, also update the slug
      if (data.name) {
        const newSlug = this.generateSlug(data.name);
        
        // Check if new slug conflicts with existing categories (excluding current one)
        const existing = await this.findBySlug(newSlug);
        if (existing.ok && existing.data.id !== id) {
          return this.fail('SLUG_EXISTS', `Category with slug '${newSlug}' already exists`);
        }

        updateData.slug = newSlug;
      }

      return await this.update(id, updateData);
    } catch (error) {
      return this.fail('DB_ERROR', error instanceof Error ? error.message : 'Unknown database error');
    }
  }

  /**
   * Get category tree (category with its children)
   */
  async getCategoryTree(categoryId?: string) {
    try {
      let categories: Categories[];

      if (categoryId) {
        // Get specific category and its children
        const categoryResult = await this.findById(categoryId);
        if (!categoryResult.ok) {
          return categoryResult as any;
        }

        const childrenResult = await this.findByParent(categoryId);
        if (!childrenResult.ok) {
          return childrenResult as any;
        }

        categories = [categoryResult.data, ...childrenResult.data];
      } else {
        // Get all root categories and their children
        const rootResult = await this.findRootCategories();
        if (!rootResult.ok) {
          return rootResult as any;
        }

        categories = [...rootResult.data];

        // Get children for each root category
        for (const rootCategory of rootResult.data) {
          const childrenResult = await this.findByParent(rootCategory.id);
          if (childrenResult.ok) {
            categories.push(...childrenResult.data);
          }
        }
      }

      return this.ok(categories);
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
export const categoriesService = new CategoriesService();
