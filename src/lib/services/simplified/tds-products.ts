/**
 * TDS Products Simplified Service (Layer 3)
 * 
 * Simplified service for TDS products entity following the 6-Layer Type Safety Chain
 * Extends SimplifiedService base class with TDS-specific business logic
 */

import { SimplifiedService } from './base';
import { tdsProducts } from '../../schema/index';
import { 
  TdsProductsSelectSchema, 
  TdsProductsInsertSchema, 
  TdsProductsUpdateSchema, 
  TdsProductsFiltersSchema,
  TdsProducts,
  TdsProductsCreate,
  TdsProductsUpdate,
  TdsProductsFilters
} from '../../schemas/index';
import { eq, ilike, or, and } from 'drizzle-orm';
import { db } from '../../drizzle';

export class TdsProductsService extends SimplifiedService<
  typeof tdsProducts,
  TdsProducts,
  TdsProductsCreate,
  TdsProductsUpdate,
  TdsProductsFilters
> {
  // Base class properties
  protected table = tdsProducts;
  protected selectSchema = TdsProductsSelectSchema;
  protected insertSchema = TdsProductsInsertSchema;
  protected updateSchema = TdsProductsUpdateSchema;
  protected filtersSchema = TdsProductsFiltersSchema;

  // ============================================================================
  // BUSINESS-SPECIFIC METHODS
  // ============================================================================

  /**
   * Find TDS product by document ID
   */
  async findByDocumentId(documentId: string) {
    try {
      const result = await db.select().from(this.table).where(eq(this.table.documentId, documentId));
      
      if (!result[0]) {
        return this.fail('NOT_FOUND', `TDS Product with document ID '${documentId}' not found`);
      }

      return this.success(result[0]);
    } catch (error) {
      return this.fail('QUERY_ERROR', `Failed to find TDS product by document ID: ${error}`);
    }
  }

  /**
   * Find TDS products by category
   */
  async findByCategory(category: string, filters?: Partial<TdsProductsFilters>) {
    try {
      const validation = this.filtersSchema.safeParse({ ...filters, category });
      if (!validation.success) {
        return this.fail('VALIDATION_ERROR', validation.error.message);
      }

      const validatedFilters = validation.data;

      const result = await this.buildFilteredQuery(validatedFilters);
      return result;
    } catch (error) {
      return this.fail('QUERY_ERROR', `Failed to find TDS products by category: ${error}`);
    }
  }

  /**
   * Search TDS products by name or description
   */
  async search(searchTerm: string, filters?: Partial<TdsProductsFilters>) {
    try {
      const validation = this.filtersSchema.safeParse(filters || {});
      if (!validation.success) {
        return this.fail('VALIDATION_ERROR', validation.error.message);
      }

      const validatedFilters = validation.data;

      let query = db.select().from(this.table);

      // Add search conditions
      const searchConditions = or(
        ilike(this.table.productName, `%${searchTerm}%`),
        ilike(this.table.shortDescription, `%${searchTerm}%`),
        ilike(this.table.descriptionFull, `%${searchTerm}%`)
      );

      query = query.where(searchConditions);

      // Apply additional filters
      if (validatedFilters.category) {
        query = query.where(eq(this.table.category, validatedFilters.category));
      }

      if (validatedFilters.documentId) {
        query = query.where(eq(this.table.documentId, validatedFilters.documentId));
      }

      // Apply pagination
      const offset = (validatedFilters.page - 1) * validatedFilters.limit;
      query = query.limit(validatedFilters.limit).offset(offset);

      const result = await query;
      return this.success(result);
    } catch (error) {
      return this.fail('QUERY_ERROR', `Failed to search TDS products: ${error}`);
    }
  }

  /**
   * Get TDS products with packaging information
   */
  async findWithPackagingInfo(filters?: Partial<TdsProductsFilters>) {
    try {
      const validation = this.filtersSchema.safeParse(filters || {});
      if (!validation.success) {
        return this.fail('VALIDATION_ERROR', validation.error.message);
      }

      const query = db.select().from(this.table)
        .where(and(
          this.table.packagingInfo !== null,
          this.table.packagingInfo !== ''
        ));

      const result = await this.buildFilteredQuery(validation.data, query);
      return result;
    } catch (error) {
      return this.fail('QUERY_ERROR', `Failed to find TDS products with packaging info: ${error}`);
    }
  }

  /**
   * Find TDS products by original filename
   */
  async findByOriginalFilename(filename: string) {
    try {
      const result = await db.select().from(this.table).where(eq(this.table.originalFilename, filename));
      
      if (!result[0]) {
        return this.fail('NOT_FOUND', `TDS Product with filename '${filename}' not found`);
      }

      return this.success(result[0]);
    } catch (error) {
      return this.fail('QUERY_ERROR', `Failed to find TDS product by filename: ${error}`);
    }
  }
}

// Export singleton instance
export const tdsProductsService = new TdsProductsService();
