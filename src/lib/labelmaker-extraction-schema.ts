// LabelMaker Structured Output Schema
// Defines the JSON schema for consistent OpenAI extraction results

export const LABELMAKER_EXTRACTION_SCHEMA = {
  type: "object",
  properties: {
    extracted_data: {
      type: "object",
      properties: {
        // Product Information
        product_name: { type: "string" },
        short_description_en: { type: "string" },
        short_description_fr: { type: "string" },
        short_description_sp: { type: "string" },
        
        // Content Sections
        description: { type: "string" },
        application: { type: "string" },
        features: { type: "string" },
        coverage: { type: "string" },
        shelf_life: { type: "string" },
        limitations: { type: "string" },
        
        // Safety Information (SDS)
        signal_word: { type: "string" },
        components_determining_hazard: { type: "string" },
        hazard_statements: { type: "string" },
        precautionary_statements: { type: "string" },
        response_statements: { type: "string" },
        storage_disposal: { type: "string" },
        
        // Physical Properties
        appearance: { type: "string" },
        color: { type: "string" },
        odor: { type: "string" },
        ph: { type: "string" },
        flash_point: { type: "string" },
        autoignition_temperature: { type: "string" },
        viscosity: { type: "string" },
        vapor_pressure: { type: "string" },
        specific_gravity: { type: "string" },
        solubility_water: { type: "string" },
        
        // Regulatory Information
        sara_title_iii: { type: "string" },
        tsca_status: { type: "string" },
        cercla_rq: { type: "string" },
        california_prop_65: { type: "string" },
        
        // Additional Fields
        preparation_date: { type: "string" },
        revision_date: { type: "string" },
        cas_numbers: { type: "string" },
        ec_numbers: { type: "string" },
        manufacturer: { type: "string" },
        emergency_phone: { type: "string" },
        technical_phone: { type: "string" },
        website: { type: "string" }
      },
      required: [
        "product_name", "short_description_en", "short_description_fr", "short_description_sp",
        "description", "application", "features", "coverage", "shelf_life", "limitations",
        "signal_word", "components_determining_hazard", "hazard_statements", "precautionary_statements",
        "response_statements", "storage_disposal", "appearance", "color", "odor", "ph",
        "flash_point", "autoignition_temperature", "viscosity", "vapor_pressure", "specific_gravity",
        "solubility_water", "sara_title_iii", "tsca_status", "cercla_rq", "california_prop_65",
        "preparation_date", "revision_date", "cas_numbers", "ec_numbers", "manufacturer",
        "emergency_phone", "technical_phone", "website"
      ],
      additionalProperties: false
    },
    confidence_scores: {
      type: "object",
      additionalProperties: {
        type: "number",
        minimum: 0,
        maximum: 1
      }
    },
    flagged_for_review: { type: "boolean" },
    review_reasons: {
      type: "array",
      items: { type: "string" }
    },
    source_locations: {
      type: "object",
      additionalProperties: { type: "string" }
    },
    ai_confidence_score: {
      type: "number",
      minimum: 0,
      maximum: 1
    },
    extraction_timestamp: { type: "string" }
  },
  required: [
    "extracted_data",
    "confidence_scores", 
    "flagged_for_review",
    "review_reasons",
    "source_locations",
    "ai_confidence_score",
    "extraction_timestamp"
  ],
  additionalProperties: false
};
