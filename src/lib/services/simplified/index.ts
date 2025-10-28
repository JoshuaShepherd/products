/**
 * Simplified Services Index (Layer 3)
 * 
 * Barrel export for all simplified services following the 6-Layer Type Safety Chain
 * Exports both service classes and singleton instances
 */

// Export base classes and types
export { SimplifiedService, type Result, type BaseFilters } from './base';

// Export service classes
export { ProductsService } from './products';
export { CategoriesService } from './categories';
export { TdsProductsService } from './tds-products';
export { SdsProductsService } from './sds-products';

// Export singleton instances (ready to use)
export { productsService } from './products';
export { categoriesService } from './categories';
export { tdsProductsService } from './tds-products';
export { sdsProductsService } from './sds-products';
