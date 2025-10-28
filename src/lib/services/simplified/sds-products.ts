/**
 * SDS Products Simplified Service (Layer 3)
 * 
 * Simplified service for SDS products entity following the 6-Layer Type Safety Chain
 * Extends SimplifiedService base class with SDS-specific business logic
 */

import { SimplifiedService } from './base';
import { sdsProducts } from '../../schema/index';
import { 
  SdsProductsSelectSchema, 
  SdsProductsInsertSchema, 
  SdsProductsUpdateSchema, 
  SdsProductsFiltersSchema,
  SdsProducts,
  SdsProductsCreate,
  SdsProductsUpdate,
  SdsProductsFilters
} from '../../schemas/index';
import { eq, ilike, or, and } from 'drizzle-orm';
import { db } from '../../drizzle';

export class SdsProductsService extends SimplifiedService<
  typeof sdsProducts,
  SdsProducts,
  SdsProductsCreate,
  SdsProductsUpdate,
  SdsProductsFilters
> {
  // Base class properties
  protected table = sdsProducts;
  protected selectSchema = SdsProductsSelectSchema;
  protected insertSchema = SdsProductsInsertSchema;
  protected updateSchema = SdsProductsUpdateSchema;
  protected filtersSchema = SdsProductsFiltersSchema;

  // ============================================================================
  // BUSINESS-SPECIFIC METHODS
  // ============================================================================

  /**
   * Find SDS product by document ID
   */
  async findByDocumentId(documentId: string) {
    try {
      const result = await db.select().from(this.table).where(eq(this.table.documentId, documentId));
      
      if (!result[0]) {
        return this.fail('NOT_FOUND', `SDS Product with document ID '${documentId}' not found`);
      }

      return this.success(result[0]);
    } catch (error) {
      return this.fail('QUERY_ERROR', `Failed to find SDS product by document ID: ${error}`);
    }
  }

  /**
   * Find SDS products by category
   */
  async findByCategory(category: string, filters?: Partial<SdsProductsFilters>) {
    try {
      const validation = this.filtersSchema.safeParse({ ...filters, category });
      if (!validation.success) {
        return this.fail('VALIDATION_ERROR', validation.error.message);
      }

      const validatedFilters = validation.data;

      const result = await this.buildFilteredQuery(validatedFilters);
      return result;
    } catch (error) {
      return this.fail('QUERY_ERROR', `Failed to find SDS products by category: ${error}`);
    }
  }

  /**
   * Find SDS products by manufacturer
   */
  async findByManufacturer(manufacturer: string, filters?: Partial<SdsProductsFilters>) {
    try {
      const validation = this.filtersSchema.safeParse({ ...filters, manufacturer });
      if (!validation.success) {
        return this.fail('VALIDATION_ERROR', validation.error.message);
      }

      const validatedFilters = validation.data;

      const result = await this.buildFilteredQuery(validatedFilters);
      return result;
    } catch (error) {
      return this.fail('QUERY_ERROR', `Failed to find SDS products by manufacturer: ${error}`);
    }
  }

  /**
   * Search SDS products by name or SDS content
   */
  async search(searchTerm: string, filters?: Partial<SdsProductsFilters>) {
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
        ilike(this.table.sdsContentFull, `%${searchTerm}%`),
        ilike(this.table.section1Identification, `%${searchTerm}%`),
        ilike(this.table.manufacturer, `%${searchTerm}%`)
      );

      query = query.where(searchConditions);

      // Apply additional filters
      if (validatedFilters.category) {
        query = query.where(eq(this.table.category, validatedFilters.category));
      }

      if (validatedFilters.manufacturer) {
        query = query.where(eq(this.table.manufacturer, validatedFilters.manufacturer));
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
      return this.fail('QUERY_ERROR', `Failed to search SDS products: ${error}`);
    }
  }

  /**
   * Find SDS products by hazard section content
   */
  async findByHazardContent(searchTerm: string, filters?: Partial<SdsProductsFilters>) {
    try {
      const validation = this.filtersSchema.safeParse(filters || {});
      if (!validation.success) {
        return this.fail('VALIDATION_ERROR', validation.error.message);
      }

      let query = db.select().from(this.table);

      // Search in hazard-related sections
      const hazardConditions = or(
        ilike(this.table.section2Hazards, `%${searchTerm}%`),
        ilike(this.table.section4FirstAid, `%${searchTerm}%`),
        ilike(this.table.section5FireFighting, `%${searchTerm}%`),
        ilike(this.table.section6AccidentalRelease, `%${searchTerm}%`)
      );

      query = query.where(hazardConditions);

      const result = await this.buildFilteredQuery(validation.data, query);
      return result;
    } catch (error) {
      return this.fail('QUERY_ERROR', `Failed to find SDS products by hazard content: ${error}`);
    }
  }

  /**
   * Find SDS products by file name
   */
  async findByFileName(fileName: string) {
    try {
      const result = await db.select().from(this.table).where(eq(this.table.fileName, fileName));
      
      if (!result[0]) {
        return this.fail('NOT_FOUND', `SDS Product with file name '${fileName}' not found`);
      }

      return this.success(result[0]);
    } catch (error) {
      return this.fail('QUERY_ERROR', `Failed to find SDS product by file name: ${error}`);
    }
  }

  /**
   * Get SDS products with complete safety data (all sections)
   */
  async findWithCompleteSafetyData(filters?: Partial<SdsProductsFilters>) {
    try {
      const validation = this.filtersSchema.safeParse(filters || {});
      if (!validation.success) {
        return this.fail('VALIDATION_ERROR', validation.error.message);
      }

      const query = db.select().from(this.table)
        .where(and(
          this.table.section2Hazards !== null,
          this.table.section4FirstAid !== null,
          this.table.section5FireFighting !== null,
          this.table.section8ExposureControls !== null
        ));

      const result = await this.buildFilteredQuery(validation.data, query);
      return result;
    } catch (error) {
      return this.fail('QUERY_ERROR', `Failed to find SDS products with complete safety data: ${error}`);
    }
  }
}

// Export singleton instance
export const sdsProductsService = new SdsProductsService();
