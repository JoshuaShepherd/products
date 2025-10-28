/**
 * Simplified Schema Layer (Layer 2)
 * 
 * Auto-generated Zod schemas using drizzle-zod
 * Following the Simplified 6-Layer Type Safety Chain
 * 
 * Four Schema Pattern per entity:
 * 1. SelectSchema - for reading data  
 * 2. InsertSchema - for creating data
 * 3. UpdateSchema - for updating data  
 * 4. FiltersSchema - for query parameters (manual)
 */

import { z } from 'zod';
import { createSelectSchema, createInsertSchema, createUpdateSchema } from 'drizzle-zod';
import { 
  categories,
  pictograms,
  products,
  productPictograms,
  productMedia,
  labelTemplates,
  productLabels,
  productVariants,
  productSpecifications,
  applicationMethods,
  labelTemplateVersions,
  templateComponents,
  templateCssVariables,
  layoutPresets,
  sdsProductsComplete,
  migrationsLog,
  individualLabelTemplates,
  extractionRuns,
  auditLog,
  productsCombined,
  tdsProducts,
  sdsProducts
} from '../schema/index';

// ============================================================================
// BASE SCHEMAS AND UTILITIES
// ============================================================================

export const BaseFiltersSchema = z.object({
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
});

export const IdSchema = z.string().uuid();

// ============================================================================
// AUTO-GENERATED SCHEMAS FROM DRIZZLE
// ============================================================================

// Categories
export const CategoriesSelectSchema = createSelectSchema(categories);
export const CategoriesInsertSchema = createInsertSchema(categories);
export const CategoriesUpdateSchema = createUpdateSchema(categories);

// Manual filters schema
export const CategoriesFiltersSchema = BaseFiltersSchema.extend({
  id: IdSchema.optional(),
  name: z.string().optional(),
  slug: z.string().optional(),
  parentId: IdSchema.optional(),
  isActive: z.boolean().optional(),
});

// Pictograms  
export const PictogramsSelectSchema = createSelectSchema(pictograms);
export const PictogramsInsertSchema = createInsertSchema(pictograms);
export const PictogramsUpdateSchema = createUpdateSchema(pictograms);

export const PictogramsFiltersSchema = BaseFiltersSchema.extend({
  id: IdSchema.optional(),
  name: z.string().optional(),
  slug: z.string().optional(),
  isActive: z.boolean().optional(),
});

// Products
export const ProductsSelectSchema = createSelectSchema(products);
export const ProductsInsertSchema = createInsertSchema(products);
export const ProductsUpdateSchema = createUpdateSchema(products);

export const ProductsFiltersSchema = BaseFiltersSchema.extend({
  id: IdSchema.optional(),
  name: z.string().optional(),
  slug: z.string().optional(),
  sku: z.string().optional(),
  categoryId: IdSchema.optional(),
  signalWord: z.enum(['Danger', 'Warning', 'None']).optional(),
  hazardClass: z.string().optional(),
  isActive: z.boolean().optional(),
});

// ProductPictograms
export const ProductPictogramsSelectSchema = createSelectSchema(productPictograms);
export const ProductPictogramsInsertSchema = createInsertSchema(productPictograms);
export const ProductPictogramsUpdateSchema = createUpdateSchema(productPictograms);

export const ProductPictogramsFiltersSchema = BaseFiltersSchema.extend({
  id: IdSchema.optional(),
  productId: IdSchema.optional(),
  pictogramId: IdSchema.optional(),
});

// ProductMedia
export const ProductMediaSelectSchema = createSelectSchema(productMedia);
export const ProductMediaInsertSchema = createInsertSchema(productMedia);
export const ProductMediaUpdateSchema = createUpdateSchema(productMedia);

export const ProductMediaFiltersSchema = BaseFiltersSchema.extend({
  id: IdSchema.optional(),
  productId: IdSchema.optional(),
  mediaType: z.string().optional(),
  isPrimary: z.boolean().optional(),
});

// LabelTemplates
export const LabelTemplatesSelectSchema = createSelectSchema(labelTemplates);
export const LabelTemplatesInsertSchema = createInsertSchema(labelTemplates);
export const LabelTemplatesUpdateSchema = createUpdateSchema(labelTemplates);

export const LabelTemplatesFiltersSchema = BaseFiltersSchema.extend({
  id: IdSchema.optional(),
  name: z.string().optional(),
  slug: z.string().optional(),
  isActive: z.boolean().optional(),
});

// ProductLabels
export const ProductLabelsSelectSchema = createSelectSchema(productLabels);
export const ProductLabelsInsertSchema = createInsertSchema(productLabels);
export const ProductLabelsUpdateSchema = createUpdateSchema(productLabels);

export const ProductLabelsFiltersSchema = BaseFiltersSchema.extend({
  id: IdSchema.optional(),
  productId: IdSchema.optional(),
  templateId: IdSchema.optional(),
  language: z.string().optional(),
  isCurrent: z.boolean().optional(),
});

// ProductVariants
export const ProductVariantsSelectSchema = createSelectSchema(productVariants);
export const ProductVariantsInsertSchema = createInsertSchema(productVariants);
export const ProductVariantsUpdateSchema = createUpdateSchema(productVariants);

export const ProductVariantsFiltersSchema = BaseFiltersSchema.extend({
  id: IdSchema.optional(),
  productId: IdSchema.optional(),
  name: z.string().optional(),
  sku: z.string().optional(),
  isActive: z.boolean().optional(),
});

// ProductSpecifications
export const ProductSpecificationsSelectSchema = createSelectSchema(productSpecifications);
export const ProductSpecificationsInsertSchema = createInsertSchema(productSpecifications);
export const ProductSpecificationsUpdateSchema = createUpdateSchema(productSpecifications);

export const ProductSpecificationsFiltersSchema = BaseFiltersSchema.extend({
  id: IdSchema.optional(),
  productId: IdSchema.optional(),
  specName: z.string().optional(),
});

// ApplicationMethods
export const ApplicationMethodsSelectSchema = createSelectSchema(applicationMethods);
export const ApplicationMethodsInsertSchema = createInsertSchema(applicationMethods);
export const ApplicationMethodsUpdateSchema = createUpdateSchema(applicationMethods);

export const ApplicationMethodsFiltersSchema = BaseFiltersSchema.extend({
  id: IdSchema.optional(),
  productId: IdSchema.optional(),
  methodName: z.string().optional(),
});

// LabelTemplateVersions
export const LabelTemplateVersionsSelectSchema = createSelectSchema(labelTemplateVersions);
export const LabelTemplateVersionsInsertSchema = createInsertSchema(labelTemplateVersions);
export const LabelTemplateVersionsUpdateSchema = createUpdateSchema(labelTemplateVersions);

export const LabelTemplateVersionsFiltersSchema = BaseFiltersSchema.extend({
  id: IdSchema.optional(),
  templateId: IdSchema.optional(),
  versionNumber: z.number().int().optional(),
  isPublished: z.boolean().optional(),
});

// TemplateComponents
export const TemplateComponentsSelectSchema = createSelectSchema(templateComponents);
export const TemplateComponentsInsertSchema = createInsertSchema(templateComponents);
export const TemplateComponentsUpdateSchema = createUpdateSchema(templateComponents);

export const TemplateComponentsFiltersSchema = BaseFiltersSchema.extend({
  id: IdSchema.optional(),
  name: z.string().optional(),
  componentType: z.string().optional(),
  isActive: z.boolean().optional(),
});

// TemplateCssVariables
export const TemplateCssVariablesSelectSchema = createSelectSchema(templateCssVariables);
export const TemplateCssVariablesInsertSchema = createInsertSchema(templateCssVariables);
export const TemplateCssVariablesUpdateSchema = createUpdateSchema(templateCssVariables);

export const TemplateCssVariablesFiltersSchema = BaseFiltersSchema.extend({
  id: IdSchema.optional(),
  templateId: IdSchema.optional(),
  variableName: z.string().optional(),
  variableType: z.string().optional(),
});

// LayoutPresets
export const LayoutPresetsSelectSchema = createSelectSchema(layoutPresets);
export const LayoutPresetsInsertSchema = createInsertSchema(layoutPresets);
export const LayoutPresetsUpdateSchema = createUpdateSchema(layoutPresets);

export const LayoutPresetsFiltersSchema = BaseFiltersSchema.extend({
  id: IdSchema.optional(),
  name: z.string().optional(),
  isActive: z.boolean().optional(),
});

// MigrationsLog
export const MigrationsLogSelectSchema = createSelectSchema(migrationsLog);
export const MigrationsLogInsertSchema = createInsertSchema(migrationsLog);
export const MigrationsLogUpdateSchema = createUpdateSchema(migrationsLog);

export const MigrationsLogFiltersSchema = BaseFiltersSchema.extend({
  id: IdSchema.optional(),
  migrationName: z.string().optional(),
});

// IndividualLabelTemplates
export const IndividualLabelTemplatesSelectSchema = createSelectSchema(individualLabelTemplates);
export const IndividualLabelTemplatesInsertSchema = createInsertSchema(individualLabelTemplates);
export const IndividualLabelTemplatesUpdateSchema = createUpdateSchema(individualLabelTemplates);

export const IndividualLabelTemplatesFiltersSchema = BaseFiltersSchema.extend({
  id: IdSchema.optional(),
  productId: IdSchema.optional(),
  templateId: IdSchema.optional(),
});

// ExtractionRuns
export const ExtractionRunsSelectSchema = createSelectSchema(extractionRuns);
export const ExtractionRunsInsertSchema = createInsertSchema(extractionRuns);
export const ExtractionRunsUpdateSchema = createUpdateSchema(extractionRuns);

export const ExtractionRunsFiltersSchema = BaseFiltersSchema.extend({
  id: IdSchema.optional(),
  productCandidate: z.string().optional(),
  productId: IdSchema.optional(),
  documentType: z.string().optional(),
  status: z.string().optional(),
  needsManualReview: z.boolean().optional(),
});

// AuditLog
export const AuditLogSelectSchema = createSelectSchema(auditLog);
export const AuditLogInsertSchema = createInsertSchema(auditLog);
export const AuditLogUpdateSchema = createUpdateSchema(auditLog);

export const AuditLogFiltersSchema = BaseFiltersSchema.extend({
  id: IdSchema.optional(),
  runId: IdSchema.optional(),
  productId: IdSchema.optional(),
  field: z.string().optional(),
  action: z.string().optional(),
});

// ProductsCombined
export const ProductsCombinedSelectSchema = createSelectSchema(productsCombined);
export const ProductsCombinedInsertSchema = createInsertSchema(productsCombined);
export const ProductsCombinedUpdateSchema = createUpdateSchema(productsCombined);

export const ProductsCombinedFiltersSchema = BaseFiltersSchema.extend({
  id: IdSchema.optional(),
  productName: z.string().optional(),
  hasSds: z.boolean().optional(),
  hasTds: z.boolean().optional(),
  hasWebsite: z.boolean().optional(),
});

// TdsProducts
export const TdsProductsSelectSchema = createSelectSchema(tdsProducts);
export const TdsProductsInsertSchema = createInsertSchema(tdsProducts);
export const TdsProductsUpdateSchema = createUpdateSchema(tdsProducts);

export const TdsProductsFiltersSchema = BaseFiltersSchema.extend({
  id: z.number().int().optional(),
  productName: z.string().optional(),
  category: z.string().optional(),
  documentId: z.string().optional(),
});

// SdsProducts
export const SdsProductsSelectSchema = createSelectSchema(sdsProducts);
export const SdsProductsInsertSchema = createInsertSchema(sdsProducts);
export const SdsProductsUpdateSchema = createUpdateSchema(sdsProducts);

export const SdsProductsFiltersSchema = BaseFiltersSchema.extend({
  id: z.number().int().optional(),
  productName: z.string().optional(),
  category: z.string().optional(),
  fileName: z.string().optional(),
  documentId: z.string().optional(),
  manufacturer: z.string().optional(),
});

// SdsProductsComplete
export const SdsProductsCompleteSelectSchema = createSelectSchema(sdsProductsComplete);
export const SdsProductsCompleteInsertSchema = createInsertSchema(sdsProductsComplete);
export const SdsProductsCompleteUpdateSchema = createUpdateSchema(sdsProductsComplete);

export const SdsProductsCompleteFiltersSchema = BaseFiltersSchema.extend({
  id: z.number().int().optional(),
  productName: z.string().optional(),
  category: z.string().optional(),
  fileName: z.string().optional(),
});

// ============================================================================
// TYPE EXPORTS (AUTO-GENERATED FROM ZOD)
// ============================================================================

// Categories
export type Categories = z.infer<typeof CategoriesSelectSchema>;
export type CategoriesCreate = z.infer<typeof CategoriesInsertSchema>;
export type CategoriesUpdate = z.infer<typeof CategoriesUpdateSchema>;
export type CategoriesFilters = z.infer<typeof CategoriesFiltersSchema>;

// Pictograms
export type Pictograms = z.infer<typeof PictogramsSelectSchema>;
export type PictogramsCreate = z.infer<typeof PictogramsInsertSchema>;
export type PictogramsUpdate = z.infer<typeof PictogramsUpdateSchema>;
export type PictogramsFilters = z.infer<typeof PictogramsFiltersSchema>;

// Products
export type Products = z.infer<typeof ProductsSelectSchema>;
export type ProductsCreate = z.infer<typeof ProductsInsertSchema>;
export type ProductsUpdate = z.infer<typeof ProductsUpdateSchema>;
export type ProductsFilters = z.infer<typeof ProductsFiltersSchema>;

// ProductPictograms
export type ProductPictograms = z.infer<typeof ProductPictogramsSelectSchema>;
export type ProductPictogramsCreate = z.infer<typeof ProductPictogramsInsertSchema>;
export type ProductPictogramsUpdate = z.infer<typeof ProductPictogramsUpdateSchema>;
export type ProductPictogramsFilters = z.infer<typeof ProductPictogramsFiltersSchema>;

// ProductMedia
export type ProductMedia = z.infer<typeof ProductMediaSelectSchema>;
export type ProductMediaCreate = z.infer<typeof ProductMediaInsertSchema>;
export type ProductMediaUpdate = z.infer<typeof ProductMediaUpdateSchema>;
export type ProductMediaFilters = z.infer<typeof ProductMediaFiltersSchema>;

// LabelTemplates
export type LabelTemplates = z.infer<typeof LabelTemplatesSelectSchema>;
export type LabelTemplatesCreate = z.infer<typeof LabelTemplatesInsertSchema>;
export type LabelTemplatesUpdate = z.infer<typeof LabelTemplatesUpdateSchema>;
export type LabelTemplatesFilters = z.infer<typeof LabelTemplatesFiltersSchema>;

// ProductLabels
export type ProductLabels = z.infer<typeof ProductLabelsSelectSchema>;
export type ProductLabelsCreate = z.infer<typeof ProductLabelsInsertSchema>;
export type ProductLabelsUpdate = z.infer<typeof ProductLabelsUpdateSchema>;
export type ProductLabelsFilters = z.infer<typeof ProductLabelsFiltersSchema>;

// ProductVariants
export type ProductVariants = z.infer<typeof ProductVariantsSelectSchema>;
export type ProductVariantsCreate = z.infer<typeof ProductVariantsInsertSchema>;
export type ProductVariantsUpdate = z.infer<typeof ProductVariantsUpdateSchema>;
export type ProductVariantsFilters = z.infer<typeof ProductVariantsFiltersSchema>;

// ProductSpecifications
export type ProductSpecifications = z.infer<typeof ProductSpecificationsSelectSchema>;
export type ProductSpecificationsCreate = z.infer<typeof ProductSpecificationsInsertSchema>;
export type ProductSpecificationsUpdate = z.infer<typeof ProductSpecificationsUpdateSchema>;
export type ProductSpecificationsFilters = z.infer<typeof ProductSpecificationsFiltersSchema>;

// ApplicationMethods
export type ApplicationMethods = z.infer<typeof ApplicationMethodsSelectSchema>;
export type ApplicationMethodsCreate = z.infer<typeof ApplicationMethodsInsertSchema>;
export type ApplicationMethodsUpdate = z.infer<typeof ApplicationMethodsUpdateSchema>;
export type ApplicationMethodsFilters = z.infer<typeof ApplicationMethodsFiltersSchema>;

// LabelTemplateVersions
export type LabelTemplateVersions = z.infer<typeof LabelTemplateVersionsSelectSchema>;
export type LabelTemplateVersionsCreate = z.infer<typeof LabelTemplateVersionsInsertSchema>;
export type LabelTemplateVersionsUpdate = z.infer<typeof LabelTemplateVersionsUpdateSchema>;
export type LabelTemplateVersionsFilters = z.infer<typeof LabelTemplateVersionsFiltersSchema>;

// TemplateComponents
export type TemplateComponents = z.infer<typeof TemplateComponentsSelectSchema>;
export type TemplateComponentsCreate = z.infer<typeof TemplateComponentsInsertSchema>;
export type TemplateComponentsUpdate = z.infer<typeof TemplateComponentsUpdateSchema>;
export type TemplateComponentsFilters = z.infer<typeof TemplateComponentsFiltersSchema>;

// TemplateCssVariables
export type TemplateCssVariables = z.infer<typeof TemplateCssVariablesSelectSchema>;
export type TemplateCssVariablesCreate = z.infer<typeof TemplateCssVariablesInsertSchema>;
export type TemplateCssVariablesUpdate = z.infer<typeof TemplateCssVariablesUpdateSchema>;
export type TemplateCssVariablesFilters = z.infer<typeof TemplateCssVariablesFiltersSchema>;

// LayoutPresets
export type LayoutPresets = z.infer<typeof LayoutPresetsSelectSchema>;
export type LayoutPresetsCreate = z.infer<typeof LayoutPresetsInsertSchema>;
export type LayoutPresetsUpdate = z.infer<typeof LayoutPresetsUpdateSchema>;
export type LayoutPresetsFilters = z.infer<typeof LayoutPresetsFiltersSchema>;

// MigrationsLog
export type MigrationsLog = z.infer<typeof MigrationsLogSelectSchema>;
export type MigrationsLogCreate = z.infer<typeof MigrationsLogInsertSchema>;
export type MigrationsLogUpdate = z.infer<typeof MigrationsLogUpdateSchema>;
export type MigrationsLogFilters = z.infer<typeof MigrationsLogFiltersSchema>;

// IndividualLabelTemplates
export type IndividualLabelTemplates = z.infer<typeof IndividualLabelTemplatesSelectSchema>;
export type IndividualLabelTemplatesCreate = z.infer<typeof IndividualLabelTemplatesInsertSchema>;
export type IndividualLabelTemplatesUpdate = z.infer<typeof IndividualLabelTemplatesUpdateSchema>;
export type IndividualLabelTemplatesFilters = z.infer<typeof IndividualLabelTemplatesFiltersSchema>;

// ExtractionRuns
export type ExtractionRuns = z.infer<typeof ExtractionRunsSelectSchema>;
export type ExtractionRunsCreate = z.infer<typeof ExtractionRunsInsertSchema>;
export type ExtractionRunsUpdate = z.infer<typeof ExtractionRunsUpdateSchema>;
export type ExtractionRunsFilters = z.infer<typeof ExtractionRunsFiltersSchema>;

// AuditLog
export type AuditLog = z.infer<typeof AuditLogSelectSchema>;
export type AuditLogCreate = z.infer<typeof AuditLogInsertSchema>;
export type AuditLogUpdate = z.infer<typeof AuditLogUpdateSchema>;
export type AuditLogFilters = z.infer<typeof AuditLogFiltersSchema>;

// ProductsCombined
export type ProductsCombined = z.infer<typeof ProductsCombinedSelectSchema>;
export type ProductsCombinedCreate = z.infer<typeof ProductsCombinedInsertSchema>;
export type ProductsCombinedUpdate = z.infer<typeof ProductsCombinedUpdateSchema>;
export type ProductsCombinedFilters = z.infer<typeof ProductsCombinedFiltersSchema>;

// TdsProducts
export type TdsProducts = z.infer<typeof TdsProductsSelectSchema>;
export type TdsProductsCreate = z.infer<typeof TdsProductsInsertSchema>;
export type TdsProductsUpdate = z.infer<typeof TdsProductsUpdateSchema>;
export type TdsProductsFilters = z.infer<typeof TdsProductsFiltersSchema>;

// SdsProducts
export type SdsProducts = z.infer<typeof SdsProductsSelectSchema>;
export type SdsProductsCreate = z.infer<typeof SdsProductsInsertSchema>;
export type SdsProductsUpdate = z.infer<typeof SdsProductsUpdateSchema>;
export type SdsProductsFilters = z.infer<typeof SdsProductsFiltersSchema>;

// SdsProductsComplete
export type SdsProductsComplete = z.infer<typeof SdsProductsCompleteSelectSchema>;
export type SdsProductsCompleteCreate = z.infer<typeof SdsProductsCompleteInsertSchema>;
export type SdsProductsCompleteUpdate = z.infer<typeof SdsProductsCompleteUpdateSchema>;
export type SdsProductsCompleteFilters = z.infer<typeof SdsProductsCompleteFiltersSchema>;

// ============================================================================
// VALIDATION HELPER FUNCTIONS
// ============================================================================

export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (!result.success) {
    return { success: false, error: result.error.message };
  }
  return { success: true, data: result.data };
}

export function validateOutput<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}
