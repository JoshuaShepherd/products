// LabelMaker extraction schema configuration
// Maps TDS/SDS sections to database columns and identifies label-relevant fields

export interface ExtractionSchema {
  [key: string]: {
    dbColumn: string;
    isLabelRelevant: boolean;
    dataType: 'text' | 'number' | 'boolean' | 'url';
    validation?: {
      required?: boolean;
      maxLength?: number;
      pattern?: string;
    };
  };
}

export const LABELMAKER_SCHEMA: ExtractionSchema = {
  // Product Information
  "product_name": {
    dbColumn: "Title",
    isLabelRelevant: true,
    dataType: "text",
    validation: { required: true, maxLength: 200 }
  },
  "short_description_en": {
    dbColumn: "Short Description (EN)",
    isLabelRelevant: true,
    dataType: "text",
    validation: { maxLength: 500 }
  },
  "short_description_fr": {
    dbColumn: "Short Description (FR)",
    isLabelRelevant: true,
    dataType: "text",
    validation: { maxLength: 500 }
  },
  "short_description_sp": {
    dbColumn: "Short Description (SP)",
    isLabelRelevant: true,
    dataType: "text",
    validation: { maxLength: 500 }
  },
  
  // Content Sections
  "description": {
    dbColumn: "Description",
    isLabelRelevant: true,
    dataType: "text"
  },
  "application": {
    dbColumn: "Application",
    isLabelRelevant: true,
    dataType: "text"
  },
  "features": {
    dbColumn: "Features",
    isLabelRelevant: true,
    dataType: "text"
  },
  "coverage": {
    dbColumn: "Coverage",
    isLabelRelevant: true,
    dataType: "text"
  },
  "shelf_life": {
    dbColumn: "Shelf Life",
    isLabelRelevant: true,
    dataType: "text"
  },
  "limitations": {
    dbColumn: "Limitations",
    isLabelRelevant: true,
    dataType: "text"
  },
  
  // Safety Information (SDS)
  "signal_word": {
    dbColumn: "Signal Word",
    isLabelRelevant: true,
    dataType: "text",
    validation: { required: true }
  },
  "components_determining_hazard": {
    dbColumn: "Components Determining Hazard",
    isLabelRelevant: true,
    dataType: "text"
  },
  "hazard_statements": {
    dbColumn: "Hazard Statements",
    isLabelRelevant: true,
    dataType: "text",
    validation: { required: true }
  },
  "precautionary_statements": {
    dbColumn: "Precautionary Statements",
    isLabelRelevant: true,
    dataType: "text",
    validation: { required: true }
  },
  "response_statements": {
    dbColumn: "Response Statements",
    isLabelRelevant: true,
    dataType: "text"
  },
  "first_aid": {
    dbColumn: "First Aid",
    isLabelRelevant: true,
    dataType: "text",
    validation: { required: true }
  },
  "storage": {
    dbColumn: "Storage",
    isLabelRelevant: true,
    dataType: "text",
    validation: { required: true }
  },
  "disposal": {
    dbColumn: "Disposal",
    isLabelRelevant: true,
    dataType: "text"
  },
  
  // Add VOC Data mapping
  "voc_data": {
    dbColumn: "VOC Data",
    isLabelRelevant: true,
    dataType: "text"
  },
  
  // Icons & Metadata
  "pictograms": {
    dbColumn: "Pictograms",
    isLabelRelevant: true,
    dataType: "text"
  },
  "pictogram_urls": {
    dbColumn: "Pictogram URLs",
    isLabelRelevant: true,
    dataType: "text"
  },
  "green_conscious": {
    dbColumn: "Green Conscious",
    isLabelRelevant: true,
    dataType: "text"
  },
  "do_not_freeze": {
    dbColumn: "Do Not Freeze",
    isLabelRelevant: true,
    dataType: "text"
  },
  "mix_well": {
    dbColumn: "Mix Well",
    isLabelRelevant: true,
    dataType: "text"
  },
  "used_by_date": {
    dbColumn: "Used By Date",
    isLabelRelevant: true,
    dataType: "text"
  },
  
  // Transport Information
  "transport_proper_shipping_name": {
    dbColumn: "Transport: Proper Shipping Name",
    isLabelRelevant: false,
    dataType: "text"
  },
  "transport_un_number": {
    dbColumn: "Transport: UN Number",
    isLabelRelevant: false,
    dataType: "text"
  },
  "transport_hazard_class": {
    dbColumn: "Transport: Hazard Class",
    isLabelRelevant: false,
    dataType: "text"
  },
  "transport_packing_group": {
    dbColumn: "Transport: Packing Group",
    isLabelRelevant: false,
    dataType: "text"
  },
  "transport_emergency_response_guide": {
    dbColumn: "Transport: Emergency Response Guide",
    isLabelRelevant: false,
    dataType: "text"
  },
  
  // French Translations
  "composants_determinant_danger": {
    dbColumn: "Composants Déterminant le Danger",
    isLabelRelevant: true,
    dataType: "text"
  },
  "mot_signalement": {
    dbColumn: "Mot de Signalement",
    isLabelRelevant: true,
    dataType: "text"
  },
  "mentions_danger": {
    dbColumn: "Mentions de Danger",
    isLabelRelevant: true,
    dataType: "text"
  },
  "conseils_prudence": {
    dbColumn: "Conseils de Prudence",
    isLabelRelevant: true,
    dataType: "text"
  },
  "premiers_soins": {
    dbColumn: "Premiers Soins",
    isLabelRelevant: true,
    dataType: "text"
  },
  "mesures_premiers_secours": {
    dbColumn: "Mesures de Premiers Secours",
    isLabelRelevant: true,
    dataType: "text"
  },
  "consignes_stockage": {
    dbColumn: "Consignes de Stockage",
    isLabelRelevant: true,
    dataType: "text"
  },
  "consignes_elimination": {
    dbColumn: "Consignes d'Élimination",
    isLabelRelevant: true,
    dataType: "text"
  },
  
  // Label Customization
  "left_font": {
    dbColumn: "Left Font",
    isLabelRelevant: true,
    dataType: "text"
  },
  "right_font": {
    dbColumn: "Right Font",
    isLabelRelevant: true,
    dataType: "text"
  },
  "subtitle_1": {
    dbColumn: "Subtitle 1",
    isLabelRelevant: true,
    dataType: "text"
  },
  "subtitle_2": {
    dbColumn: "Subtitle 2",
    isLabelRelevant: true,
    dataType: "text"
  }
};

// Helper functions
export function getLabelRelevantFields(): string[] {
  return Object.keys(LABELMAKER_SCHEMA).filter(key => 
    LABELMAKER_SCHEMA[key].isLabelRelevant
  );
}

export function validateExtractedData(data: Record<string, any>): { 
  isValid: boolean; 
  errors: string[]; 
  warnings: string[] 
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const [fieldKey, fieldConfig] of Object.entries(LABELMAKER_SCHEMA)) {
    const value = data[fieldKey];
    const validation = fieldConfig.validation;

    if (validation?.required && (!value || value.trim() === '')) {
      errors.push(`Required field '${fieldKey}' is missing or empty`);
    }

    if (value && validation?.maxLength && value.length > validation.maxLength) {
      warnings.push(`Field '${fieldKey}' exceeds maximum length of ${validation.maxLength} characters`);
    }

    if (value && validation?.pattern && !new RegExp(validation.pattern).test(value)) {
      warnings.push(`Field '${fieldKey}' does not match expected pattern`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

export function mapToSupabaseColumns(extractedData: Record<string, any>): Record<string, any> {
  const mapped: Record<string, any> = {};
  
  for (const [fieldKey, value] of Object.entries(extractedData)) {
    const schema = LABELMAKER_SCHEMA[fieldKey];
    if (schema && value !== undefined && value !== null) {
      mapped[schema.dbColumn] = value;
    }
  }
  
  return mapped;
}
