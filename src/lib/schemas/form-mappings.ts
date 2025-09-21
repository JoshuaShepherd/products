import { ProductFormData } from './product.schema'

/**
 * Maps form field names to database column names
 * This handles the legacy form structure that uses display names instead of database column names
 */
export const FORM_FIELD_MAPPINGS: Record<string, keyof ProductFormData> = {
  // Basic Information
  'Title': 'name',
  'SKU': 'sku',
  'Category': 'category_id',
  
  // Descriptions
  'Short Description (EN)': 'short_description_english',
  'Short Description (FR)': 'short_description_french', 
  'Short Description (SP)': 'short_description_spanish',
  'Description': 'description',
  
  // Technical Information
  'Application': 'application',
  'Features': 'features',
  'Coverage': 'coverage',
  'Shelf Life': 'shelf_life',
  'Limitations': 'limitations',
  'VOC Data': 'voc_data',
  
  // Safety Information - English
  'Signal Word': 'signal_word',
  'Components Determining Hazard': 'components_determining_hazard',
  'Hazard Statements': 'hazard_statements',
  'Precautionary Statements': 'precautionary_statements',
  'Response Statements': 'response_statements',
  'First Aid': 'first_aid',
  'Storage': 'storage',
  'Disposal': 'disposal',
  
  // Safety Information - French
  'Composants Déterminant le Danger': 'composants_determinant_le_danger',
  'Mot de Signalement': 'mot_de_signalement',
  'Mentions de Danger': 'mentions_de_danger',
  'Conseils de Prudence': 'conseils_de_prudence',
  'Premiers Soins': 'premiers_soins',
  'Mesures de Premiers Secours': 'mesures_de_premiers_secours',
  'Consignes de Stockage': 'consignes_de_stockage',
  'Consignes d\'Élimination': 'consignes_delimination',
  
  // Regulatory Information
  'UN Number': 'un_number',
  'Hazard Class': 'hazard_class',
  'Packing Group': 'packing_group',
  'Emergency Response Guide': 'emergency_response_guide',
  'Proper Shipping Name': 'proper_shipping_name',
  
  // Product Attributes
  'Green Conscious': 'green_conscious',
  'Do Not Freeze': 'do_not_freeze',
  'Mix Well': 'mix_well',
  'Used By Date': 'used_by_date',
  'Subtitle 1': 'subtitle_1',
  'Subtitle 2': 'subtitle_2',
}

/**
 * Converts legacy form data to database-compatible format
 */
export function mapFormDataToDatabase(legacyFormData: Record<string, any>): Partial<ProductFormData> {
  const mappedData: Partial<ProductFormData> = {}
  
  for (const [formField, value] of Object.entries(legacyFormData)) {
    const dbField = FORM_FIELD_MAPPINGS[formField]
    
    if (dbField) {
      // Handle empty strings - convert to undefined for optional fields
      if (value === '' || value === undefined) {
        mappedData[dbField] = undefined
      } else {
        mappedData[dbField] = value
      }
    } else {
      console.warn(`Unknown form field: ${formField}`)
    }
  }
  
  // Auto-generate slug from name if not provided
  if (mappedData.name && !mappedData.slug) {
    mappedData.slug = generateSlug(mappedData.name)
  }
  
  return mappedData
}

/**
 * Converts database data to legacy form format for editing
 */
export function mapDatabaseToFormData(dbData: Partial<ProductFormData>): Record<string, any> {
  const formData: Record<string, any> = {}
  
  // Create reverse mapping
  const reverseMapping = Object.fromEntries(
    Object.entries(FORM_FIELD_MAPPINGS).map(([form, db]) => [db, form])
  )
  
  for (const [dbField, value] of Object.entries(dbData)) {
    const formField = reverseMapping[dbField as keyof ProductFormData]
    
    if (formField) {
      // Convert null to empty string for form display
      formData[formField] = value ?? ''
    }
  }
  
  return formData
}

/**
 * Generates a URL-friendly slug from a product name
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

/**
 * Default form values with proper field names
 */
export const DEFAULT_FORM_VALUES: Record<string, any> = {
  'Title': '',
  'SKU': '',
  'Category': '',
  'Short Description (EN)': '',
  'Short Description (FR)': '',
  'Short Description (SP)': '',
  'Description': '',
  'Application': '',
  'Features': '',
  'Coverage': '',
  'Shelf Life': '',
  'Limitations': '',
  'VOC Data': '',
  'Signal Word': 'None',
  'Components Determining Hazard': '',
  'Hazard Statements': '',
  'Precautionary Statements': '',
  'Response Statements': '',
  'First Aid': '',
  'Storage': '',
  'Disposal': '',
  'Composants Déterminant le Danger': '',
  'Mot de Signalement': '',
  'Mentions de Danger': '',
  'Conseils de Prudence': '',
  'Premiers Soins': '',
  'Mesures de Premiers Secours': '',
  'Consignes de Stockage': '',
  'Consignes d\'Élimination': '',
  'UN Number': '',
  'Hazard Class': 'Not applicable',
  'Packing Group': 'Not applicable',
  'Emergency Response Guide': '',
  'Proper Shipping Name': '',
  'Green Conscious': false,
  'Do Not Freeze': false,
  'Mix Well': false,
  'Used By Date': '',
  'Subtitle 1': '',
  'Subtitle 2': ''
}
