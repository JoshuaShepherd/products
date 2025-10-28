/**
 * Simplified Hooks Index (Layer 5)
 * 
 * Barrel export for all React Query hooks following the 6-Layer Type Safety Chain
 * Uses the simplified API routes from Layer 4
 */

// Export Products hooks
export {
  useProductsQuery,
  useProductQuery,
  useProductsSearchQuery,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useInvalidateProducts,
  usePrefetchProducts,
  productsKeys,
} from './products';

// Export Categories hooks
export {
  useCategoriesQuery,
  useRootCategoriesQuery,
  useChildCategoriesQuery,
  useCategoryQuery,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useInvalidateCategories,
  usePrefetchCategories,
  useCategoryTree,
  categoriesKeys,
} from './categories';

// Export TDS Products hooks
export {
  useTdsProductsQuery,
  useTdsProductQuery,
  useTdsProductByDocumentIdQuery,
  useTdsProductsByCategoryQuery,
  useCreateTdsProduct,
  useUpdateTdsProduct,
  useDeleteTdsProduct,
  useInvalidateTdsProducts,
  usePrefetchTdsProducts,
  tdsProductsKeys,
} from './tds-products';

// Export SDS Products hooks
export {
  useSdsProductsQuery,
  useSdsProductQuery,
  useSdsProductByDocumentIdQuery,
  useSdsProductsByCategoryQuery,
  useSdsProductsByManufacturerQuery,
  useSdsProductByFileNameQuery,
  useCreateSdsProduct,
  useUpdateSdsProduct,
  useDeleteSdsProduct,
  useInvalidateSdsProducts,
  usePrefetchSdsProducts,
  sdsProductsKeys,
} from './sds-products';

// Export SDS Products Complete hooks
export {
  useSdsProductsCompleteQuery,
  useSdsProductCompleteQuery,
  useSdsProductsCompleteByCategoryQuery,
  useCreateSdsProductComplete,
  useUpdateSdsProductComplete,
  useDeleteSdsProductComplete,
  useInvalidateSdsProductsComplete,
  usePrefetchSdsProductsComplete,
  sdsProductsCompleteKeys,
} from './sds-products-complete';

// Export React Query provider and client setup
export { ReactQueryProvider, queryClient } from './provider';
