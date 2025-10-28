import { pgTable, uuid, text, boolean, integer, numeric, timestamp, jsonb, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { pgEnum } from 'drizzle-orm/pg-core';

// Enums
export const hazardSignalEnum = pgEnum('hazard_signal', ['Danger', 'Warning', 'None']);
export const hazardClassEnum = pgEnum('hazard_class', [
  'Class 1',
  'Class 2', 
  'Class 3',
  'Class 4',
  'Class 5',
  'Class 6',
  'Class 7',
  'Class 8',
  'Class 9',
  'Not applicable'
]);
export const packingGroupEnum = pgEnum('packing_group', ['PG I', 'PG II', 'PG III', 'Not applicable']);

// Categories table
export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  parentId: uuid('parent_id'),
  sortOrder: integer('sort_order').default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// Pictograms table
export const pictograms = pgTable('pictograms', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  url: text('url').notNull(),
  description: text('description'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// Products table
export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name').notNull(),
  slug: varchar('slug').notNull().unique(),
  sku: varchar('sku').unique(),
  categoryId: uuid('category_id').references(() => categories.id),
  
  // Multi-language descriptions
  shortDescriptionEnglish: text('short_description_english'),
  shortDescriptionFrench: text('short_description_french'),
  shortDescriptionSpanish: text('short_description_spanish'),
  description: text('description'),
  
  // Product information
  application: text('application'),
  features: text('features'),
  coverage: text('coverage'),
  limitations: text('limitations'),
  shelfLife: text('shelf_life'),
  vocData: text('voc_data'),
  
  // Hazard information
  signalWord: hazardSignalEnum('signal_word').default('None'),
  componentsDeterminingHazard: text('components_determining_hazard'),
  hazardStatements: text('hazard_statements'),
  precautionaryStatements: text('precautionary_statements'),
  responseStatements: text('response_statements'),
  firstAid: text('first_aid'),
  storage: text('storage'),
  disposal: text('disposal'),
  
  // French hazard information
  composantsDeterminantLeDanger: text('composants_determinant_le_danger'),
  motDeSignalement: text('mot_de_signalement'),
  mentionsDeDanger: text('mentions_de_danger'),
  conseilsDePrudence: text('conseils_de_prudence'),
  premiersSoins: text('premiers_soins'),
  mesuresDePremiersSecours: text('mesures_de_premiers_secours'),
  consignesDeStockage: text('consignes_de_stockage'),
  consignesDelimination: text('consignes_delimination'),
  
  // Shipping information
  properShippingName: text('proper_shipping_name'),
  unNumber: text('un_number'),
  hazardClass: hazardClassEnum('hazard_class').default('Not applicable'),
  packingGroup: packingGroupEnum('packing_group').default('Not applicable'),
  emergencyResponseGuide: text('emergency_response_guide'),
  
  // Additional product info
  subtitle1: text('subtitle_1'),
  subtitle2: text('subtitle_2'),
  doNotFreeze: boolean('do_not_freeze').default(false),
  mixWell: boolean('mix_well').default(false),
  greenConscious: boolean('green_conscious').default(false),
  usedByDate: text('used_by_date'),
  
  // Status and ordering
  isActive: boolean('is_active').default(true),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  
  // Pictogram data
  pictograms: text('pictograms'),
  pictogramUrls: text('pictogram_urls'),
  
  // Additional fields
  testData: text('test_data'),
  cleaningInfo: text('cleaning_info'),
  
  // Legal and compliance text
  conditionsOfSale: text('conditions_of_sale'),
  warrantyLimitation: text('warranty_limitation'),
  inherentRisk: text('inherent_risk'),
  additionalTerms: text('additional_terms'),
  manufacturingNotice: text('manufacturing_notice'),
  safetyNotice: text('safety_notice'),
});

// Product pictograms junction table
export const productPictograms = pgTable('product_pictograms', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').references(() => products.id),
  pictogramId: uuid('pictogram_id').references(() => pictograms.id),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// Product media table
export const productMedia = pgTable('product_media', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').references(() => products.id),
  mediaType: text('media_type').notNull(),
  url: text('url').notNull(),
  altText: text('alt_text'),
  caption: text('caption'),
  isPrimary: boolean('is_primary').default(false),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// Label templates table
export const labelTemplates = pgTable('label_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  widthMm: numeric('width_mm'),
  heightMm: numeric('height_mm'),
  htmlTemplate: text('html_template').notNull(),
  cssTemplate: text('css_template').notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// Product labels table
export const productLabels = pgTable('product_labels', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').references(() => products.id),
  templateId: uuid('template_id').references(() => labelTemplates.id),
  generatedHtml: text('generated_html'),
  pdfUrl: text('pdf_url'),
  language: varchar('language').default('en'),
  version: integer('version').default(1),
  isCurrent: boolean('is_current').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  productName: text('product_name'),
  templateName: text('template_name'),
});

// Product variants table
export const productVariants = pgTable('product_variants', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').references(() => products.id),
  name: varchar('name').notNull(),
  sku: varchar('sku').unique(),
  size: varchar('size'),
  unit: varchar('unit'),
  weightKg: numeric('weight_kg'),
  volumeLiters: numeric('volume_liters'),
  price: numeric('price'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// Product specifications table
export const productSpecifications = pgTable('product_specifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').references(() => products.id),
  specName: varchar('spec_name').notNull(),
  specValue: text('spec_value').notNull(),
  unit: varchar('unit'),
  testMethod: varchar('test_method'),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// Application methods table
export const applicationMethods = pgTable('application_methods', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').references(() => products.id),
  methodName: varchar('method_name').notNull(),
  instructions: text('instructions').notNull(),
  coverageRate: varchar('coverage_rate'),
  equipmentRequired: text('equipment_required'),
  temperatureRange: varchar('temperature_range'),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// Label template versions table
export const labelTemplateVersions = pgTable('label_template_versions', {
  id: uuid('id').primaryKey().defaultRandom(),
  templateId: uuid('template_id').references(() => labelTemplates.id),
  versionNumber: integer('version_number').notNull(),
  htmlTemplate: text('html_template').notNull(),
  cssTemplate: text('css_template').notNull(),
  isPublished: boolean('is_published').default(false),
  createdBy: uuid('created_by'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  changeNotes: text('change_notes'),
});

// Template components table
export const templateComponents = pgTable('template_components', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name').notNull(),
  componentType: varchar('component_type').notNull(),
  htmlTemplate: text('html_template').notNull(),
  cssTemplate: text('css_template'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// Template CSS variables table
export const templateCssVariables = pgTable('template_css_variables', {
  id: uuid('id').primaryKey().defaultRandom(),
  templateId: uuid('template_id').references(() => labelTemplates.id),
  variableName: varchar('variable_name').notNull(),
  variableValue: text('variable_value').notNull(),
  variableType: varchar('variable_type').default('custom'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// Layout presets table
export const layoutPresets = pgTable('layout_presets', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name').notNull(),
  description: text('description'),
  gridTemplate: text('grid_template'),
  flexTemplate: text('flex_template'),
  presetCss: text('preset_css'),
  thumbnailUrl: text('thumbnail_url'),
  isActive: boolean('is_active').default(true),
});

// Migrations log table
export const migrationsLog = pgTable('migrations_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  migrationName: varchar('migration_name').notNull().unique(),
  appliedAt: timestamp('applied_at', { withTimezone: true }).defaultNow(),
});

// Individual label templates table
export const individualLabelTemplates = pgTable('individual_label_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').notNull().unique().references(() => products.id),
  templateId: uuid('template_id').references(() => labelTemplates.id),
  cssOverrides: text('css_overrides'),
  customCss: text('custom_css'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// Extraction runs table
export const extractionRuns = pgTable('extraction_runs', {
  id: uuid('id').primaryKey().defaultRandom(),
  productCandidate: text('product_candidate'),
  productId: uuid('product_id'),
  documentType: text('document_type'),
  sourceFilePath: text('source_file_path').notNull(),
  rawText: text('raw_text'),
  extractedJson: jsonb('extracted_json').notNull(),
  confidence: text('confidence'),
  needsManualReview: boolean('needs_manual_review').default(false),
  status: text('status').notNull(),
  error: text('error'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// Audit log table
export const auditLog = pgTable('audit_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  runId: uuid('run_id').notNull().references(() => extractionRuns.id),
  productId: uuid('product_id'),
  field: text('field').notNull(),
  oldValue: jsonb('old_value'),
  newValue: jsonb('new_value'),
  action: text('action').notNull(),
  reason: text('reason').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// Products combined table - comprehensive product data from multiple sources
export const productsCombined = pgTable('products_combined', {
  id: uuid('id').primaryKey().defaultRandom(),
  productName: text('product_name').notNull(),
  hasSds: boolean('has_sds').default(false),
  hasTds: boolean('has_tds').default(false),
  hasWebsite: boolean('has_website').default(false),
  sdsFileCount: integer('sds_file_count').default(0),
  tdsFileCount: integer('tds_file_count').default(0),
  websiteFileCount: integer('website_file_count').default(0),
  tradeName: text('trade_name'),
  synonyms: text('synonyms'),
  casNumber: text('cas_number'),
  productUse: text('product_use'),
  dateOfLastRevision: text('date_of_last_revision'),
  dateOfCurrentRevision: text('date_of_current_revision'),
  preparedBy: text('prepared_by'),
  productUrl: text('product_url'),
  scrapedDate: timestamp('scraped_date', { withTimezone: true }),
  categories: jsonb('categories').default([]),
  shortDescription: text('short_description'),
  fullDescription: text('full_description'),
  productImages: jsonb('product_images').default([]),
  sdsFiles: jsonb('sds_files').default([]),
  tdsFiles: jsonb('tds_files').default([]),
  websiteFiles: jsonb('website_files').default([]),
  sdsData: jsonb('sds_data').default({}),
  tdsData: jsonb('tds_data').default({}),
  websiteData: jsonb('website_data').default({}),
  emergencyOverview: text('emergency_overview'),
  healthHazards: text('health_hazards'),
  flammabilityHazards: text('flammability_hazards'),
  reactivityHazards: text('reactivity_hazards'),
  environmentalHazards: text('environmental_hazards'),
  signalWord: text('signal_word'),
  ghsHazardClassifications: jsonb('ghs_hazard_classifications').default([]),
  hazardStatements: jsonb('hazard_statements').default([]),
  precautionaryStatements: jsonb('precautionary_statements').default([]),
  compositionIngredients: jsonb('composition_ingredients').default({}),
  firstAidMeasures: text('first_aid_measures'),
  fireFightingMeasures: text('fire_fighting_measures'),
  accidentalReleaseMeasures: text('accidental_release_measures'),
  handlingAndStorage: text('handling_and_storage'),
  exposureControls: text('exposure_controls'),
  physicalChemicalProperties: jsonb('physical_chemical_properties').default({}),
  stabilityReactivity: text('stability_reactivity'),
  toxicologyInformation: text('toxicology_information'),
  ecologicalInformation: text('ecological_information'),
  disposalConsiderations: text('disposal_considerations'),
  transportationInformation: text('transportation_information'),
  regulatoryInformation: text('regulatory_information'),
  otherInformation: text('other_information'),
  productDescription: text('product_description'),
  featuresBenefits: text('features_benefits'),
  applicationInstructions: text('application_instructions'),
  technicalSpecifications: jsonb('technical_specifications').default({}),
  testData: jsonb('test_data').default({}),
  coverage: text('coverage'),
  shelfLife: text('shelf_life'),
  packaging: text('packaging'),
  limitationsPrecautions: text('limitations_precautions'),
  warranty: text('warranty'),
  cleanup: text('cleanup'),
  standardsCompliance: jsonb('standards_compliance').default([]),
  price: text('price'),
  tags: jsonb('tags').default([]),
  attributes: jsonb('attributes').default([]),
  averageRating: numeric('average_rating'),
  reviewCount: integer('review_count'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// Relations
export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
  }),
  children: many(categories),
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  pictograms: many(productPictograms),
  media: many(productMedia),
  labels: many(productLabels),
  variants: many(productVariants),
  specifications: many(productSpecifications),
  applicationMethods: many(applicationMethods),
  individualLabelTemplate: one(individualLabelTemplates),
}));

export const pictogramsRelations = relations(pictograms, ({ many }) => ({
  products: many(productPictograms),
}));

export const productPictogramsRelations = relations(productPictograms, ({ one }) => ({
  product: one(products, {
    fields: [productPictograms.productId],
    references: [products.id],
  }),
  pictogram: one(pictograms, {
    fields: [productPictograms.pictogramId],
    references: [pictograms.id],
  }),
}));

export const productMediaRelations = relations(productMedia, ({ one }) => ({
  product: one(products, {
    fields: [productMedia.productId],
    references: [products.id],
  }),
}));

export const labelTemplatesRelations = relations(labelTemplates, ({ many }) => ({
  versions: many(labelTemplateVersions),
  cssVariables: many(templateCssVariables),
  productLabels: many(productLabels),
  individualTemplates: many(individualLabelTemplates),
}));

export const productLabelsRelations = relations(productLabels, ({ one }) => ({
  product: one(products, {
    fields: [productLabels.productId],
    references: [products.id],
  }),
  template: one(labelTemplates, {
    fields: [productLabels.templateId],
    references: [labelTemplates.id],
  }),
}));

export const productVariantsRelations = relations(productVariants, ({ one }) => ({
  product: one(products, {
    fields: [productVariants.productId],
    references: [products.id],
  }),
}));

export const productSpecificationsRelations = relations(productSpecifications, ({ one }) => ({
  product: one(products, {
    fields: [productSpecifications.productId],
    references: [products.id],
  }),
}));

export const applicationMethodsRelations = relations(applicationMethods, ({ one }) => ({
  product: one(products, {
    fields: [applicationMethods.productId],
    references: [products.id],
  }),
}));

export const labelTemplateVersionsRelations = relations(labelTemplateVersions, ({ one }) => ({
  template: one(labelTemplates, {
    fields: [labelTemplateVersions.templateId],
    references: [labelTemplates.id],
  }),
}));

export const templateCssVariablesRelations = relations(templateCssVariables, ({ one }) => ({
  template: one(labelTemplates, {
    fields: [templateCssVariables.templateId],
    references: [labelTemplates.id],
  }),
}));

export const individualLabelTemplatesRelations = relations(individualLabelTemplates, ({ one }) => ({
  product: one(products, {
    fields: [individualLabelTemplates.productId],
    references: [products.id],
  }),
  template: one(labelTemplates, {
    fields: [individualLabelTemplates.templateId],
    references: [labelTemplates.id],
  }),
}));

export const extractionRunsRelations = relations(extractionRuns, ({ many }) => ({
  auditLogs: many(auditLog),
}));

export const auditLogRelations = relations(auditLog, ({ one }) => ({
  run: one(extractionRuns, {
    fields: [auditLog.runId],
    references: [extractionRuns.id],
  }),
}));

// TDS Products table
export const tdsProducts = pgTable('tds_products', {
  id: integer('id').primaryKey(),
  productName: text('product_name').notNull(),
  category: text('category').notNull(),
  shortDescription: text('short_description'),
  descriptionFull: text('description_full'),
  featuresBenefits: text('features_benefits'),
  applicationInstructions: text('application_instructions'),
  packagingInfo: text('packaging_info'),
  shelfLifeStorage: text('shelf_life_storage'),
  limitations: text('limitations'),
  warrantyInfo: text('warranty_info'),
  cleanupInstructions: text('cleanup_instructions'),
  documentId: text('document_id').unique(),
  originalFilename: text('original_filename'),
  extractionDate: timestamp('extraction_date').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// SDS Products table
export const sdsProducts = pgTable('sds_products', {
  id: integer('id').primaryKey(),
  productName: text('product_name').notNull(),
  category: text('category').notNull(),
  fileName: text('file_name').notNull(),
  filePath: text('file_path').notNull(),
  revisionDate: text('revision_date'), // Using text to match actual database type
  documentId: text('document_id').notNull().unique(),
  originalCsvRow: integer('original_csv_row'),
  uploadTimestamp: timestamp('upload_timestamp').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  sdsContentFull: text('sds_content_full'),
  section1Identification: text('section_1_identification'),
  section2Hazards: text('section_2_hazards'),
  section3Composition: text('section_3_composition'),
  section4FirstAid: text('section_4_first_aid'),
  section5FireFighting: text('section_5_fire_fighting'),
  section6AccidentalRelease: text('section_6_accidental_release'),
  section7HandlingStorage: text('section_7_handling_storage'),
  section8ExposureControls: text('section_8_exposure_controls'),
  section9PhysicalProperties: text('section_9_physical_properties'),
  section10Stability: text('section_10_stability'),
  section11Toxicological: text('section_11_toxicological'),
  section12Ecological: text('section_12_ecological'),
  section13Disposal: text('section_13_disposal'),
  section14Transport: text('section_14_transport'),
  section15Regulatory: text('section_15_regulatory'),
  section16Other: text('section_16_other'),
  emergencyPhone: text('emergency_phone'),
  manufacturer: text('manufacturer'),
  lastRevisionDate: text('last_revision_date'), // Using text to match actual database type  
});

// SDS Products Complete table
export const sdsProductsComplete = pgTable('sds_products_complete', {
  id: integer('id').primaryKey(),
  filePath: text('file_path'),
  fileName: text('file_name'),
  productName: text('product_name'),
  category: text('category'),
  originalPdf: text('original_pdf'),
  pages: integer('pages'),
  tradeName: text('trade_name'),
  synonyms: text('synonyms'),
  casNo: text('cas_no'),
  productUse: text('product_use'),
  companyName: text('company_name'),
  companyAddress: text('company_address'),
  businessPhone: text('business_phone'),
  website: text('website'),
  emergencyPhone: text('emergency_phone'),
  dateLastRevision: text('date_last_revision'),
  dateCurrentRevision: text('date_current_revision'),
  emergencyOverview: text('emergency_overview'),
  healthHazards: text('health_hazards'),
  flammabilityHazards: text('flammability_hazards'),
  reactivityHazards: text('reactivity_hazards'),
  environmentalHazards: text('environmental_hazards'),
  signalWord: text('signal_word'),
  ghsHazardClassifications: text('ghs_hazard_classifications'),
  hazardStatements: text('hazard_statements'),
  precautionaryStatements: text('precautionary_statements'),
  responseStatements: text('response_statements'),
  storageStatements: text('storage_statements'),
  disposalStatements: text('disposal_statements'),
  compositionIngredients: text('composition_ingredients'),
  firstAidEye: text('first_aid_eye'),
  firstAidSkin: text('first_aid_skin'),
  firstAidInhalation: text('first_aid_inhalation'),
  firstAidIngestion: text('first_aid_ingestion'),
  fireExtinguishing: text('fire_extinguishing'),
  fireHazards: text('fire_hazards'),
  fireProcedures: text('fire_procedures'),
  spillPrecautions: text('spill_precautions'),
  spillEnvironmental: text('spill_environmental'),
  spillResponse: text('spill_response'),
  handlingPrecautions: text('handling_precautions'),
  storagePractices: text('storage_practices'),
  specificUses: text('specific_uses'),
  exposureLimits: text('exposure_limits'),
  ventilationControls: text('ventilation_controls'),
  respiratoryProtection: text('respiratory_protection'),
  eyeProtection: text('eye_protection'),
  handProtection: text('hand_protection'),
  bodyProtection: text('body_protection'),
  appearance: text('appearance'),
  odor: text('odor'),
  ph: text('ph'),
  boilingPoint: text('boiling_point'),
  flashPoint: text('flash_point'),
  specificGravity: text('specific_gravity'),
  solubility: text('solubility'),
  vaporDensity: text('vapor_density'),
  reactivity: text('reactivity'),
  stability: text('stability'),
  hazardousReactions: text('hazardous_reactions'),
  conditionsToAvoid: text('conditions_to_avoid'),
  incompatibleSubstances: text('incompatible_substances'),
  hazardousDecomposition: text('hazardous_decomposition'),
  toxicityData: text('toxicity_data'),
  suspectedCancerAgent: text('suspected_cancer_agent'),
  irritancy: text('irritancy'),
  sensitization: text('sensitization'),
  germCellMutagenicity: text('germ_cell_mutagenicity'),
  reproductiveToxicity: text('reproductive_toxicity'),
  ecotoxicity: text('ecotoxicity'),
  persistenceDegradability: text('persistence_degradability'),
  bioaccumulativePotential: text('bioaccumulative_potential'),
  mobilitySoil: text('mobility_soil'),
  wasteTreatmentMethods: text('waste_treatment_methods'),
  euWasteCode: text('eu_waste_code'),
  dotShippingInfo: text('dot_shipping_info'),
  unIdentification: text('un_identification'),
  properShippingName: text('proper_shipping_name'),
  hazardClass: text('hazard_class'),
  packingGroup: text('packing_group'),
  marinePollutant: text('marine_pollutant'),
  saraReporting: text('sara_reporting'),
  sara311312: text('sara_311_312'),
  cerclaReportable: text('cercla_reportable'),
  tscaInventory: text('tsca_inventory'),
  proposition65: text('proposition_65'),
  canadianRegulations: text('canadian_regulations'),
  whmisClassification: text('whmis_classification'),
  europeanRegulations: text('european_regulations'),
  australianRegulations: text('australian_regulations'),
  japaneseRegulations: text('japanese_regulations'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// TDS Products relations
export const tdsProductsRelations = relations(tdsProducts, ({ }) => ({}));

// SDS Products relations  
export const sdsProductsRelations = relations(sdsProducts, ({ }) => ({}));

// SDS Products Complete relations
export const sdsProductsCompleteRelations = relations(sdsProductsComplete, ({ }) => ({}));

// Export all tables for easy access
export const schema = {
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
  migrationsLog,
  individualLabelTemplates,
  extractionRuns,
  auditLog,
  productsCombined,
  tdsProducts,
  sdsProducts,
  sdsProductsComplete,
};

// Export enums
export const enums = {
  hazardSignalEnum,
  hazardClassEnum,
  packingGroupEnum,
};
