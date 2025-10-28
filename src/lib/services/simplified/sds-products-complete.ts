/**
 * SDS Products Complete Simplified Service (Layer 3)
 * 
 * Simplified service for SDS products complete entity following the 6-Layer Type Safety Chain
 * Extends SimplifiedService base class with SDS-specific business logic
 */

import { SimplifiedService } from './base';
import { sdsProductsComplete } from '../../schema/index';
import { 
  SdsProductsCompleteSelectSchema, 
  SdsProductsCompleteInsertSchema, 
  SdsProductsCompleteUpdateSchema, 
  SdsProductsCompleteFiltersSchema,
  SdsProductsComplete,
  SdsProductsCompleteCreate,
  SdsProductsCompleteUpdate,
  SdsProductsCompleteFilters
} from '../../schemas/index';

export class SdsProductsCompleteService extends SimplifiedService<
  typeof sdsProductsComplete,
  SdsProductsComplete,
  SdsProductsCompleteCreate,
  SdsProductsCompleteUpdate,
  SdsProductsCompleteFilters
> {
  // Base class properties
  protected table = sdsProductsComplete;
  protected selectSchema = SdsProductsCompleteSelectSchema;
  protected insertSchema = SdsProductsCompleteInsertSchema;
  protected updateSchema = SdsProductsCompleteUpdateSchema;
  protected filtersSchema = SdsProductsCompleteFiltersSchema;
}

// Export singleton instance
export const sdsProductsCompleteService = new SdsProductsCompleteService();

