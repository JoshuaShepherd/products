/**
 * Simplified Service Base Class (Layer 3)
 * 
 * Base class for all simplified services following the 6-Layer Type Safety Chain
 * Provides common CRUD operations with built-in validation and error handling
 */

import { eq, and, or, asc, desc, sql, count } from 'drizzle-orm';
import { PgTable, PgColumn } from 'drizzle-orm/pg-core';
import { z } from 'zod';
import { db } from '../../drizzle';

// ============================================================================
// RESULT TYPE
// ============================================================================

export type Result<T> = 
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string } };

// ============================================================================
// BASE FILTERS INTERFACE
// ============================================================================

export interface BaseFilters {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ============================================================================
// SIMPLIFIED SERVICE BASE CLASS
// ============================================================================

export abstract class SimplifiedService<
  TTable extends PgTable,
  TSelect extends Record<string, any>,
  TInsert extends Record<string, any>,
  TUpdate extends Record<string, any>,
  TFilters extends BaseFilters
> {
  // Abstract properties that must be implemented by subclasses
  protected abstract table: TTable;
  protected abstract selectSchema: z.ZodSchema<TSelect>;
  protected abstract insertSchema: z.ZodSchema<TInsert>;
  protected abstract updateSchema: z.ZodSchema<TUpdate>;
  protected abstract filtersSchema: z.ZodSchema<TFilters>;

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  protected ok<T>(data: T): Result<T> {
    return { ok: true, data };
  }

  protected fail(code: string, message: string): Result<never> {
    return { ok: false, error: { code, message } };
  }

  protected validateInput<T>(schema: z.ZodSchema<T>, data: unknown): T {
    try {
      return schema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Validation failed: ${error.message}`);
      }
      throw error;
    }
  }

  protected validateOutput<T>(schema: z.ZodSchema<T>, data: unknown): T {
    try {
      return schema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Output validation failed: ${error.message}`);
      }
      throw error;
    }
  }

  private buildFilters(filters: TFilters) {
    const conditions = [];
    
    // Handle common filter fields
    if ('id' in filters && filters.id) {
      const idColumn = this.table.id as PgColumn;
      conditions.push(eq(idColumn, filters.id as string | number));
    }

    if ('isActive' in filters && typeof filters.isActive === 'boolean') {
      const isActiveColumn = (this.table as any).isActive as PgColumn;
      if (isActiveColumn) {
        conditions.push(eq(isActiveColumn, filters.isActive));
      }
    }

    return conditions.length > 0 ? and(...conditions) : undefined;
  }

  private getSortColumn(sortBy?: string) {
    if (!sortBy) {
      // Try created_at first (snake_case), then createdAt (camelCase)
      return (this.table as any).created_at || (this.table as any).createdAt || (this.table as any).id;
    }
    
    // Return the column if it exists, otherwise default to created_at/createdAt/id
    const column = (this.table as any)[sortBy];
    return column || (this.table as any).created_at || (this.table as any).createdAt || (this.table as any).id;
  }

  // ============================================================================
  // CORE CRUD OPERATIONS
  // ============================================================================

  async findById(id: string | number): Promise<Result<TSelect>> {
    try {
      const idColumn = this.table.id as PgColumn;
      const result = await db.select().from(this.table).where(eq(idColumn, id));
      
      if (!result[0]) {
        return this.fail('NOT_FOUND', `Record with id ${id} not found`);
      }

      const validated = this.validateOutput(this.selectSchema, result[0]);
      return this.ok(validated);
    } catch (error) {
      return this.fail('DB_ERROR', error instanceof Error ? error.message : 'Unknown database error');
    }
  }

  async findMany(filters?: TFilters): Promise<Result<TSelect[]>> {
    try {
      // Validate filters
      const validatedFilters = filters 
        ? this.validateInput(this.filtersSchema, filters)
        : {} as TFilters;

      // Build query
      let query = db.select().from(this.table);

      // Apply filters
      const whereCondition = this.buildFilters(validatedFilters);
      if (whereCondition) {
        query = query.where(whereCondition) as any;
      }

      // Apply sorting
      const sortColumn = this.getSortColumn(validatedFilters.sortBy);
      const sortOrder = validatedFilters.sortOrder === 'desc' ? desc(sortColumn) : asc(sortColumn);
      query = query.orderBy(sortOrder) as any;

      // Apply pagination
      const page = validatedFilters.page || 1;
      const limit = Math.min(validatedFilters.limit || 10, 100); // Max 100 items
      const offset = (page - 1) * limit;

      query = query.limit(limit).offset(offset) as any;

      // Execute query
      const results = await query;

      // Validate each result
      const validated = results.map(result => 
        this.validateOutput(this.selectSchema, result)
      );

      return this.ok(validated);
    } catch (error) {
      return this.fail('DB_ERROR', error instanceof Error ? error.message : 'Unknown database error');
    }
  }

  async create(data: TInsert): Promise<Result<TSelect>> {
    try {
      // Validate input
      const validated = this.validateInput(this.insertSchema, data);

      // Insert record
      const result = await db.insert(this.table).values(validated as any).returning();

      if (!result[0]) {
        return this.fail('CREATE_FAILED', 'Failed to create record');
      }

      // Validate output
      const output = this.validateOutput(this.selectSchema, result[0]);
      return this.ok(output);
    } catch (error) {
      return this.fail('DB_ERROR', error instanceof Error ? error.message : 'Unknown database error');
    }
  }

  async update(id: string | number, data: TUpdate): Promise<Result<TSelect>> {
    try {
      // Validate input
      const validated = this.validateInput(this.updateSchema, data);

      // Update record
      const idColumn = this.table.id as PgColumn;
      const result = await db
        .update(this.table)
        .set({ ...validated, updatedAt: new Date().toISOString() } as any)
        .where(eq(idColumn, id))
        .returning();

      if (!result[0]) {
        return this.fail('NOT_FOUND', `Record with id ${id} not found`);
      }

      // Validate output
      const output = this.validateOutput(this.selectSchema, result[0]);
      return this.ok(output);
    } catch (error) {
      return this.fail('DB_ERROR', error instanceof Error ? error.message : 'Unknown database error');
    }
  }

  async delete(id: string | number): Promise<Result<boolean>> {
    try {
      const idColumn = this.table.id as PgColumn;
      const result = await db.delete(this.table).where(eq(idColumn, id)).returning();

      if (!result[0]) {
        return this.fail('NOT_FOUND', `Record with id ${id} not found`);
      }

      return this.ok(true);
    } catch (error) {
      return this.fail('DB_ERROR', error instanceof Error ? error.message : 'Unknown database error');
    }
  }

  async count(filters?: TFilters): Promise<Result<number>> {
    try {
      // Validate filters
      const validatedFilters = filters 
        ? this.validateInput(this.filtersSchema, filters)
        : {} as TFilters;

      // Build query
      let query = db.select({ count: count() }).from(this.table);

      // Apply filters
      const whereCondition = this.buildFilters(validatedFilters);
      if (whereCondition) {
        query = query.where(whereCondition) as any;
      }

      // Execute query
      const result = await query;
      return this.ok(result[0]?.count || 0);
    } catch (error) {
      return this.fail('DB_ERROR', error instanceof Error ? error.message : 'Unknown database error');
    }
  }

  // ============================================================================
  // BULK OPERATIONS
  // ============================================================================

  async bulkCreate(data: TInsert[]): Promise<Result<TSelect[]>> {
    try {
      // Validate all inputs
      const validated = data.map(item => this.validateInput(this.insertSchema, item));

      // Insert records
      const results = await db.insert(this.table).values(validated as any).returning();

      // Validate all outputs
      const outputs = results.map(result => 
        this.validateOutput(this.selectSchema, result)
      );

      return this.ok(outputs);
    } catch (error) {
      return this.fail('DB_ERROR', error instanceof Error ? error.message : 'Unknown database error');
    }
  }

  async bulkUpdate(updates: Array<{ id: string | number; data: TUpdate }>): Promise<Result<TSelect[]>> {
    try {
      const results: TSelect[] = [];

      // Process updates sequentially to maintain transaction integrity
      for (const update of updates) {
        const result = await this.update(update.id, update.data);
        if (!result.ok) {
          return result as Result<TSelect[]>;
        }
        results.push(result.data);
      }

      return this.ok(results);
    } catch (error) {
      return this.fail('DB_ERROR', error instanceof Error ? error.message : 'Unknown database error');
    }
  }

  async bulkDelete(ids: (string | number)[]): Promise<Result<number>> {
    try {
      const idColumn = this.table.id as PgColumn;
      const result = await db.delete(this.table).where(
        or(...ids.map(id => eq(idColumn, id)))
      );

      return this.ok(result.rowCount || 0);
    } catch (error) {
      return this.fail('DB_ERROR', error instanceof Error ? error.message : 'Unknown database error');
    }
  }

  // ============================================================================
  // HELPER METHODS FOR CHILD CLASSES
  // ============================================================================

  /**
   * Build a filtered query with common patterns
   * Used by child classes for complex filtering
   */
  protected async buildFilteredQuery(filters: TFilters, baseQuery?: any): Promise<Result<TSelect[]>> {
    try {
      // Start with base query or create new one
      let query = baseQuery || db.select().from(this.table);

      // Apply common filters
      const whereCondition = this.buildFilters(filters);
      if (whereCondition) {
        query = query.where(whereCondition);
      }

      // Apply sorting
      const sortColumn = this.getSortColumn(filters.sortBy);
      const sortOrder = filters.sortOrder === 'desc' ? desc(sortColumn) : asc(sortColumn);
      query = query.orderBy(sortOrder);

      // Apply pagination
      const page = filters.page || 1;
      const limit = Math.min(filters.limit || 10, 100); // Max 100 items
      const offset = (page - 1) * limit;

      query = query.limit(limit).offset(offset);

      // Execute query
      const results = await query;

      // Validate each result
      const validated = results.map(result => 
        this.validateOutput(this.selectSchema, result)
      );

      return this.ok(validated);
    } catch (error) {
      return this.fail('DB_ERROR', error instanceof Error ? error.message : 'Unknown database error');
    }
  }

  /**
   * Helper methods for result handling
   */
  protected success<T>(data: T): Result<T> {
    return this.ok(data);
  }

  protected fail(code: string, message: string): Result<never> {
    return { ok: false, error: { code, message } };
  }
}
