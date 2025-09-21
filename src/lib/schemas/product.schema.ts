import { z } from 'zod'
import { Database } from '@/types/database.types'

// Database enum types
const HazardSignalEnum = z.enum(['Danger', 'Warning', 'None'])
const HazardClassEnum = z.enum([
  'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Not applicable'
])
const PackingGroupEnum = z.enum(['PG I', 'PG II', 'PG III', 'Not applicable'])

// Product Insert Schema - matches database exactly
export const ProductInsertSchema = z.object({
  // Required fields (only name and slug are required in database)
  name: z.string().min(1, 'Product name is required'),
  slug: z.string().min(1, 'Slug is required'),
  
  // All other fields are optional/nullable to match database Insert type
  id: z.string().uuid().optional(),
  sku: z.string().optional().nullable(),
  category_id: z.string().uuid().optional().nullable(),
  
  // Descriptions (TEXT type after migration)
  short_description_english: z.string().optional().nullable(),
  short_description_french: z.string().optional().nullable(),
  short_description_spanish: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  
  // Technical specs (TEXT type after migration)
  application: z.string().optional().nullable(),
  features: z.string().optional().nullable(),
  coverage: z.string().optional().nullable(),
  limitations: z.string().optional().nullable(),
  shelf_life: z.string().optional().nullable(),
  voc_data: z.string().optional().nullable(),
  
  // Safety information - English
  signal_word: HazardSignalEnum.optional().nullable(),
  components_determining_hazard: z.string().optional().nullable(),
  hazard_statements: z.string().optional().nullable(),
  precautionary_statements: z.string().optional().nullable(),
  response_statements: z.string().optional().nullable(),
  first_aid: z.string().optional().nullable(),
  storage: z.string().optional().nullable(),
  disposal: z.string().optional().nullable(),
  
  // Safety information - French
  composants_determinant_le_danger: z.string().optional().nullable(),
  mot_de_signalement: z.string().optional().nullable(),
  mentions_de_danger: z.string().optional().nullable(),
  conseils_de_prudence: z.string().optional().nullable(),
  premiers_soins: z.string().optional().nullable(),
  mesures_de_premiers_secours: z.string().optional().nullable(),
  consignes_de_stockage: z.string().optional().nullable(),
  consignes_delimination: z.string().optional().nullable(),
  
  // Shipping/Regulatory (expanded after migration)
  proper_shipping_name: z.string().optional().nullable(),
  un_number: z.string().optional().nullable(),
  hazard_class: HazardClassEnum.optional().nullable(),
  packing_group: PackingGroupEnum.optional().nullable(),
  emergency_response_guide: z.string().optional().nullable(),
  
  // Product attributes
  subtitle_1: z.string().optional().nullable(),
  subtitle_2: z.string().optional().nullable(),
  do_not_freeze: z.boolean().optional().nullable(),
  mix_well: z.boolean().optional().nullable(),
  green_conscious: z.boolean().optional().nullable(),
  used_by_date: z.string().optional().nullable(),
  
  // New columns added during migration
  pictograms: z.string().optional().nullable(),
  pictogram_urls: z.string().optional().nullable(),
  test_data: z.string().optional().nullable(),
  cleaning_info: z.string().optional().nullable(),
  
  // System fields
  is_active: z.boolean().optional().nullable(),
  sort_order: z.number().int().optional().nullable(),
  created_at: z.string().optional().nullable(),
  updated_at: z.string().optional().nullable()
})

// Product Update Schema - matches database Update type (all fields optional)
export const ProductUpdateSchema = ProductInsertSchema.partial()

// Form-specific schema with better validation messages
export const ProductFormSchema = ProductInsertSchema.extend({
  name: z.string()
    .min(1, 'Product name is required')
    .max(255, 'Product name must be 255 characters or less'),
  slug: z.string()
    .min(1, 'URL slug is required')
    .max(255, 'URL slug must be 255 characters or less')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  sku: z.string()
    .max(100, 'SKU must be 100 characters or less')
    .optional()
    .nullable()
    .transform(val => val === '' ? null : val),
  category_id: z.string()
    .uuid('Please select a valid category')
    .optional()
    .nullable()
    .transform(val => val === '' ? null : val),
})

// Type inference
export type ProductInsert = z.infer<typeof ProductInsertSchema>
export type ProductUpdate = z.infer<typeof ProductUpdateSchema>
export type ProductFormData = z.infer<typeof ProductFormSchema>

// Database type validation - ensure our Zod schemas match database types
type DatabaseProductInsert = Database['public']['Tables']['products']['Insert']
type DatabaseProductUpdate = Database['public']['Tables']['products']['Update']

// Type assertion to ensure alignment (will cause TypeScript error if mismatched)
const _productInsertTypeCheck: ProductInsert = {} as DatabaseProductInsert
const _productUpdateTypeCheck: ProductUpdate = {} as DatabaseProductUpdate

// Export for external validation
export { HazardSignalEnum, HazardClassEnum, PackingGroupEnum }
