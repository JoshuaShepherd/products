/**
 * CSV Dataset Merge Configuration
 * 
 * This configuration defines how to merge the two CSV datasets and map them
 * to the canonical database schema for SpecChem products.
 */

export const MERGE_CONFIG = {
  // Primary dataset (authoritative source for core product data)
  primary: {
    file: './public/data/products_rows.csv',
    description: 'Clean structured data aligned with database schema',
    keyField: 'product'
  },
  
  // Secondary dataset (enrichment data)
  secondary: {
    file: './public/data/SpecChem_Master_Database.csv', 
    description: 'Comprehensive dataset with competitor analysis and extended fields',
    keyField: 'product'
  },
  
  // Merge strategy
  strategy: {
    conflictResolution: 'primary_wins', // primary dataset takes precedence for core fields
    enrichmentMode: 'additive',         // add extended fields from secondary dataset
    duplicateHandling: 'merge',         // merge duplicate products by name
    missingDataHandling: 'report'       // report products not found in secondary dataset
  }
};

// Core database schema fields (mapped from products_rows.csv)
export const CORE_SCHEMA_MAPPING = {
  // Product identification
  'product': {
    dbField: 'name',
    type: 'string',
    required: true,
    maxLength: 255,
    description: 'Product name (primary identifier)'
  },
  
  // Multi-language descriptions  
  'short_description_english': {
    dbField: 'short_description_english',
    type: 'text',
    required: false,
    description: 'Short product description in English'
  },
  'short_description_french': {
    dbField: 'short_description_french', 
    type: 'text',
    required: false,
    description: 'Short product description in French'
  },
  'short_description_spanish': {
    dbField: 'short_description_spanish',
    type: 'text', 
    required: false,
    description: 'Short product description in Spanish'
  },
  
  // Product information
  'description': {
    dbField: 'description',
    type: 'text',
    required: false,
    description: 'Detailed product description'
  },
  'application': {
    dbField: 'application',
    type: 'text',
    required: false,
    description: 'Application instructions and usage'
  },
  'features': {
    dbField: 'features',
    type: 'text',
    required: false,
    description: 'Product features and benefits'
  },
  'coverage': {
    dbField: 'coverage',
    type: 'text',
    required: false,
    description: 'Coverage rates and area calculations'
  },
  'shelf_life': {
    dbField: 'shelf_life',
    type: 'string',
    required: false,
    maxLength: 255,
    description: 'Product shelf life information'
  },
  'limitations': {
    dbField: 'limitations',
    type: 'text',
    required: false,
    description: 'Product limitations and restrictions'
  },
  
  // Safety information (English)
  'signal_word': {
    dbField: 'signal_word',
    type: 'enum',
    required: false,
    enum: ['Danger', 'Warning', 'None'],
    description: 'GHS signal word'
  },
  'components_determining_hazard': {
    dbField: 'components_determining_hazard',
    type: 'text',
    required: false,
    description: 'Chemical components that determine hazard classification'
  },
  'hazard_statements': {
    dbField: 'hazard_statements',
    type: 'text',
    required: false,
    description: 'GHS hazard statements'
  },
  'precautionary_statements': {
    dbField: 'precautionary_statements',
    type: 'text',
    required: false,
    description: 'GHS precautionary statements'
  },
  'response_statements': {
    dbField: 'response_statements',
    type: 'text',
    required: false,
    description: 'Emergency response statements'
  },
  'first_aid': {
    dbField: 'first_aid',
    type: 'text',
    required: false,
    description: 'First aid instructions'
  },
  'storage': {
    dbField: 'storage',
    type: 'text',
    required: false,
    description: 'Storage requirements and conditions'
  },
  'disposal': {
    dbField: 'disposal',
    type: 'text',
    required: false,
    description: 'Disposal instructions and requirements'
  },
  
  // Safety information (French)
  'composants_determinant_le_danger': {
    dbField: 'composants_determinant_le_danger',
    type: 'text',
    required: false,
    description: 'French: Components determining hazard'
  },
  'mot_de_signalement': {
    dbField: 'mot_de_signalement',
    type: 'string',
    required: false,
    maxLength: 100,
    description: 'French: Signal word'
  },
  'mentions_de_danger': {
    dbField: 'mentions_de_danger',
    type: 'text',
    required: false,
    description: 'French: Hazard statements'
  },
  'conseils_de_prudence': {
    dbField: 'conseils_de_prudence',
    type: 'text',
    required: false,
    description: 'French: Precautionary statements'
  },
  'premiers_soins': {
    dbField: 'premiers_soins',
    type: 'text',
    required: false,
    description: 'French: First aid'
  },
  'mesures_de_premiers_secours': {
    dbField: 'mesures_de_premiers_secours',
    type: 'text',
    required: false,
    description: 'French: First aid measures'
  },
  'consignes_de_stockage': {
    dbField: 'consignes_de_stockage',
    type: 'text',
    required: false,
    description: 'French: Storage instructions'
  },
  'consignes_delimination': {
    dbField: 'consignes_delimination',
    type: 'text',
    required: false,
    description: 'French: Disposal instructions'
  },
  
  // Transportation and regulatory
  'proper_shipping_name': {
    dbField: 'proper_shipping_name',
    type: 'string',
    required: false,
    maxLength: 255,
    description: 'DOT proper shipping name'
  },
  'un_number': {
    dbField: 'un_number',
    type: 'string',
    required: false,
    maxLength: 10,
    description: 'UN identification number'
  },
  'hazard_class': {
    dbField: 'hazard_class',
    type: 'enum',
    required: false,
    enum: ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Not applicable'],
    description: 'DOT hazard class'
  },
  'packing_group': {
    dbField: 'packing_group',
    type: 'enum',
    required: false,
    enum: ['PG I', 'PG II', 'PG III', 'Not applicable'],
    description: 'DOT packing group'
  },
  'emergency_response_guide': {
    dbField: 'emergency_response_guide',
    type: 'string',
    required: false,
    maxLength: 10,
    description: 'Emergency response guide number'
  },
  
  // Product attributes
  'green_conscious': {
    dbField: 'green_conscious',
    type: 'boolean',
    required: false,
    default: false,
    description: 'Environmentally conscious product flag'
  },
  'do_not_freeze': {
    dbField: 'do_not_freeze',
    type: 'boolean',
    required: false,
    default: false,
    description: 'Freeze sensitivity flag'
  },
  'mix_well': {
    dbField: 'mix_well',
    type: 'boolean',
    required: false,
    default: false,
    description: 'Mixing requirement flag'
  },
  'used_by_date': {
    dbField: 'used_by_date',
    type: 'string',
    required: false,
    maxLength: 255,
    description: 'Use by date information'
  },
  'subtitle_1': {
    dbField: 'subtitle_1',
    type: 'string',
    required: false,
    maxLength: 255,
    description: 'Primary subtitle for labels'
  },
  'subtitle_2': {
    dbField: 'subtitle_2',
    type: 'string',
    required: false,
    maxLength: 255,
    description: 'Secondary subtitle for labels'
  },
  'voc_data': {
    dbField: 'voc_data',
    type: 'string',
    required: false,
    maxLength: 255,
    description: 'VOC (Volatile Organic Compounds) data'
  },
  'category': {
    dbField: 'category_id',
    type: 'uuid',
    required: false,
    description: 'Product category reference (mapped from category name)'
  },
  'pictograms': {
    dbField: 'pictograms', // Legacy field, will use product_pictograms table
    type: 'string',
    required: false,
    description: 'Comma-separated pictogram URLs (legacy field)'
  }
};

// Extended fields from SpecChem_Master_Database.csv (for competitive analysis and enrichment)
export const EXTENDED_FIELDS_MAPPING = {
  // DOT and regulatory extended data
  'dot_approved_states': {
    dbField: 'dot_approved_states',
    type: 'text',
    description: 'DOT approved states list',
    category: 'regulatory'
  },
  'dot_states_count': {
    dbField: 'dot_states_count',
    type: 'integer',
    description: 'Number of DOT approved states',
    category: 'regulatory'
  },
  
  // Competitive analysis (major competitors only)
  'competitor_BASF': {
    dbField: 'competitor_basf',
    type: 'text',
    description: 'BASF competitive product information',
    category: 'competitive_analysis'
  },
  'competitor_SIKA': {
    dbField: 'competitor_sika',
    type: 'text',
    description: 'SIKA competitive product information',
    category: 'competitive_analysis'
  },
  'competitor_Mapei': {
    dbField: 'competitor_mapei',
    type: 'text',
    description: 'Mapei competitive product information',
    category: 'competitive_analysis'
  },
  'competitor_Prosoco': {
    dbField: 'competitor_prosoco',
    type: 'text',
    description: 'Prosoco competitive product information',
    category: 'competitive_analysis'
  },
  'competitor_W.R. Meadows': {
    dbField: 'competitor_wr_meadows',
    type: 'text',
    description: 'W.R. Meadows competitive product information',
    category: 'competitive_analysis'
  },
  'competitor_Euclid/Tamms': {
    dbField: 'competitor_euclid_tamms',
    type: 'text',
    description: 'Euclid/Tamms competitive product information',
    category: 'competitive_analysis'
  },
  'competitor_Laticrete': {
    dbField: 'competitor_laticrete',
    type: 'text',
    description: 'Laticrete competitive product information',
    category: 'competitive_analysis'
  },
  
  // Custom fields from legacy system
  'custom_fields_csv_data_id_specchemcomplete': {
    dbField: 'legacy_id',
    type: 'string',
    description: 'Legacy system ID',
    category: 'legacy_data'
  },
  'custom_fields_csv_data_pictogram_urls_specchemcomplete': {
    dbField: 'pictogram_urls',
    type: 'text',
    description: 'Pictogram URLs from legacy system',
    category: 'legacy_data'
  },
  'custom_fields_csv_data_left_font_specchemcomplete': {
    dbField: 'label_left_font',
    type: 'string',
    description: 'Left font setting for labels',
    category: 'label_design'
  },
  'custom_fields_csv_data_right_font_specchemcomplete': {
    dbField: 'label_right_font',
    type: 'string',
    description: 'Right font setting for labels',
    category: 'label_design'
  },
  
  // Additional metadata
  'product_video_link_ProductsMerged': {
    dbField: 'video_link',
    type: 'text',
    description: 'Product demonstration video URL',
    category: 'media'
  },
  'thumbnailUrl_ProductsMerged': {
    dbField: 'thumbnail_url',
    type: 'text',
    description: 'Product thumbnail image URL',
    category: 'media'
  },
  'standards_ProductsMerged': {
    dbField: 'standards',
    type: 'text',
    description: 'Industry standards and certifications',
    category: 'technical'
  },
  'test_data_ProductsMerged': {
    dbField: 'test_data',
    type: 'text',
    description: 'Laboratory test data and results',
    category: 'technical'
  },
  'uses_ProductsMerged': {
    dbField: 'uses',
    type: 'text',
    description: 'Specific use cases and applications',
    category: 'application'
  },
  'cleaning_ProductsMerged': {
    dbField: 'cleaning_info',
    type: 'text',
    description: 'Cleaning and maintenance information',
    category: 'application'
  }
};

// Data validation rules
export const VALIDATION_RULES = {
  required_fields: ['name'],
  
  max_lengths: {
    name: 255,
    short_description_english: 1000,
    short_description_french: 1000,
    short_description_spanish: 1000,
    shelf_life: 255,
    proper_shipping_name: 255,
    un_number: 10,
    emergency_response_guide: 10,
    used_by_date: 255,
    subtitle_1: 255,
    subtitle_2: 255,
    voc_data: 255,
    mot_de_signalement: 100
  },
  
  enum_values: {
    signal_word: ['Danger', 'Warning', 'None'],
    hazard_class: ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Not applicable'],
    packing_group: ['PG I', 'PG II', 'PG III', 'Not applicable']
  },
  
  boolean_fields: ['green_conscious', 'do_not_freeze', 'mix_well', 'is_active'],
  
  url_fields: ['pictograms', 'pictogram_urls', 'video_link', 'thumbnail_url']
};

// Category mapping (for creating category relationships)
export const CATEGORY_MAPPING = {
  'Cleaners & Strippers': {
    slug: 'cleaners-strippers',
    description: 'Concrete cleaning and stripping products'
  },
  'Decorative & Protective Sealers; Water Repellents': {
    slug: 'sealers-repellents',
    description: 'Decorative sealers and water repellent products'
  },
  'Concrete Sealer/Densifier/Hardener': {
    slug: 'sealer-densifier-hardener',
    description: 'Concrete densification and hardening products'
  },
  'Curing Compounds': {
    slug: 'curing-compounds',
    description: 'Concrete curing compounds and membrane systems'
  },
  'Form Release Agents': {
    slug: 'form-release-agents',
    description: 'Form release agents and bond breakers'
  },
  'Repair & Rehabilitation': {
    slug: 'repair-rehabilitation',
    description: 'Concrete repair and rehabilitation products'
  },
  'Admixtures': {
    slug: 'admixtures',
    description: 'Concrete admixtures and additives'
  }
};

// Output configuration
export const OUTPUT_CONFIG = {
  merged_csv: {
    filename_pattern: 'merged-products-{timestamp}.csv',
    include_extended_fields: true,
    format: 'csv_with_headers'
  },
  
  reports: {
    conflicts: 'conflicts-report-{timestamp}.csv',
    not_found: 'not-found-report-{timestamp}.csv',
    validation_errors: 'validation-errors-{timestamp}.csv'
  },
  
  database_import: {
    filename_pattern: 'import-merged-products-{timestamp}.sql',
    include_categories: true,
    include_pictograms: true,
    batch_size: 100
  }
};

export default {
  MERGE_CONFIG,
  CORE_SCHEMA_MAPPING,
  EXTENDED_FIELDS_MAPPING,
  VALIDATION_RULES,
  CATEGORY_MAPPING,
  OUTPUT_CONFIG
};
