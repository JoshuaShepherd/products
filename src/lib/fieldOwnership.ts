// Map "DB column -> owner"
export const FIELD_OWNER: Record<string, 'TDS' | 'SDS'> = {
  // TDS-owned (based on your schema)
  short_description_english: 'TDS',
  description: 'TDS',
  application: 'TDS',
  features: 'TDS',
  coverage: 'TDS',
  limitations: 'TDS',
  shelf_life: 'TDS',
  voc_data: 'TDS',                       // high-level VOC/region notes from TDS
  test_data: 'TDS',                      // if you store TYPICAL/TECHNICAL DATA text blobs
  cleaning_info: 'TDS',                  // if present on TDS
  conditions_of_sale: 'TDS',             // TDS footer text
  warranty_limitation: 'TDS',            // TDS footer text
  inherent_risk: 'TDS',                  // TDS footer text
  additional_terms: 'TDS',
  manufacturing_notice: 'TDS',
  safety_notice: 'TDS',

  // SDS-owned (safety + transport)
  signal_word: 'SDS',
  components_determining_hazard: 'SDS',
  hazard_statements: 'SDS',
  precautionary_statements: 'SDS',
  response_statements: 'SDS',
  first_aid: 'SDS',
  storage: 'SDS',
  disposal: 'SDS',
  proper_shipping_name: 'SDS',
  un_number: 'SDS',
  hazard_class: 'SDS',
  packing_group: 'SDS',
  emergency_response_guide: 'SDS',
  pictograms: 'SDS',                     // store codes as text (CSV/JSON)
  pictogram_urls: 'SDS'
};

// Convenience allowlists for doc-type filtering
export const TDS_COLUMNS = new Set(Object.entries(FIELD_OWNER)
  .filter(([_, owner]) => owner === 'TDS').map(([k]) => k));

export const SDS_COLUMNS = new Set(Object.entries(FIELD_OWNER)
  .filter(([_, owner]) => owner === 'SDS').map(([k]) => k));

// Helper function to get allowed fields for a document type
export function getAllowedFields(documentType: string): string[] {
  switch (documentType.toUpperCase()) {
    case 'TDS':
      return Array.from(TDS_COLUMNS);
    case 'SDS':
      return Array.from(SDS_COLUMNS);
    case 'BOTH':
      return Array.from(new Set([...TDS_COLUMNS, ...SDS_COLUMNS]));
    default:
      return Array.from(new Set([...TDS_COLUMNS, ...SDS_COLUMNS]));
  }
}

// Helper function to check if a field is allowed for a document type
export function isFieldAllowed(field: string, documentType: string): boolean {
  const allowedFields = getAllowedFields(documentType);
  return allowedFields.includes(field);
}

// Helper function to get field owner
export function getFieldOwner(field: string): 'TDS' | 'SDS' | null {
  return FIELD_OWNER[field] || null;
}
