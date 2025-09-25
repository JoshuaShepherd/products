import fs from 'fs';
import path from 'path';

class SDSTextParser {
  constructor() {
    // Load patterns from config
    const configPath = path.join(process.cwd(), 'scripts', 'config', 'sds-patterns.json');
    this.config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    
    this.extractionStats = {
      signal_word: 0,
      hazard_statements: 0,
      precautionary_statements: 0,
      response_statements: 0,
      components_determining_hazard: 0,
      first_aid: 0,
      storage: 0,
      disposal: 0,
      un_number: 0,
      proper_shipping_name: 0,
      hazard_class: 0,
      packing_group: 0,
      emergency_response_guide: 0
    };
  }

  parseSDSText(text, fileName = '') {
    if (!text || text.trim().length === 0) {
      return this.createEmptyResult(fileName);
    }

    const cleanedText = this.preprocessText(text);
    
    const extractedData = {
      fileName,
      signal_word: this.extractSignalWord(cleanedText),
      hazard_statements: this.extractHazardStatements(cleanedText),
      precautionary_statements: this.extractPrecautionaryStatements(cleanedText),
      response_statements: this.extractResponseStatements(cleanedText),
      components_determining_hazard: this.extractComponentsDeterminingHazard(cleanedText),
      first_aid: this.extractFirstAid(cleanedText),
      storage: this.extractStorage(cleanedText),
      disposal: this.extractDisposal(cleanedText),
      un_number: this.extractUNNumber(cleanedText),
      proper_shipping_name: this.extractProperShippingName(cleanedText),
      hazard_class: this.extractHazardClass(cleanedText),
      packing_group: this.extractPackingGroup(cleanedText),
      emergency_response_guide: this.extractEmergencyResponseGuide(cleanedText),
      extraction_confidence: 0,
      processing_notes: []
    };

    // Calculate confidence and update stats
    extractedData.extraction_confidence = this.calculateConfidence(extractedData);
    this.updateStats(extractedData);

    return extractedData;
  }

  preprocessText(text) {
    // Clean up the text for better pattern matching
    let cleaned = text;

    // Remove page numbers and headers/footers
    cleaned = cleaned.replace(/Page \d+ of \d+/gi, '');
    cleaned = cleaned.replace(/Safety Data Sheet/gi, '');
    
    // Normalize section headers
    cleaned = cleaned.replace(/SECTION\s*(\d+)[:\s]*/gi, 'SECTION $1: ');
    cleaned = cleaned.replace(/Section\s*(\d+)[:\s]*/gi, 'Section $1: ');
    
    // Clean up whitespace
    cleaned = cleaned.replace(/\s+/g, ' ');
    cleaned = cleaned.replace(/\n\s*\n/g, '\n');
    
    return cleaned;
  }

  extractSignalWord(text) {
    const patterns = this.config.section_patterns.signal_word;
    
    for (const pattern of patterns) {
      const regex = new RegExp(pattern, 'gi');
      const match = text.match(regex);
      
      if (match && match[0]) {
        const extracted = match[0].replace(/Signal\s*[Ww]ord[:\s]*/gi, '').trim();
        return this.standardizeSignalWord(extracted);
      }
    }
    
    return 'NONE';
  }

  extractHazardStatements(text) {
    const patterns = this.config.section_patterns.hazard_statements;
    const candidates = [];
    
    for (const pattern of patterns) {
      const regex = new RegExp(pattern, 'gi');
      const matches = [...text.matchAll(regex)];
      
      for (const match of matches) {
        if (match[1]) {
          const cleaned = match[1].trim().replace(/\s+/g, ' ');
          if (cleaned.length > 3 && cleaned.length < 500) {
            candidates.push({
              text: cleaned,
              confidence: this.calculateFieldConfidence(cleaned, 'hazard_statements')
            });
          }
        }
      }
    }
    
    return this.selectBestCandidate(candidates, 'hazard_statements');
  }

  extractPrecautionaryStatements(text) {
    const patterns = this.config.section_patterns.precautionary_statements;
    const candidates = [];
    
    for (const pattern of patterns) {
      const regex = new RegExp(pattern, 'gi');
      const matches = [...text.matchAll(regex)];
      
      for (const match of matches) {
        if (match[1]) {
          const cleaned = match[1].trim().replace(/\s+/g, ' ');
          if (cleaned.length > 3 && cleaned.length < 500) {
            candidates.push({
              text: cleaned,
              confidence: this.calculateFieldConfidence(cleaned, 'precautionary_statements')
            });
          }
        }
      }
    }
    
    return this.selectBestCandidate(candidates, 'precautionary_statements');
  }

  extractResponseStatements(text) {
    const patterns = this.config.section_patterns.response_statements;
    const candidates = [];
    
    for (const pattern of patterns) {
      const regex = new RegExp(pattern, 'gi');
      const matches = [...text.matchAll(regex)];
      
      for (const match of matches) {
        if (match[1]) {
          const cleaned = match[1].trim().replace(/\s+/g, ' ');
          if (cleaned.length > 3 && cleaned.length < 300) {
            candidates.push({
              text: cleaned,
              confidence: this.calculateFieldConfidence(cleaned, 'response_statements')
            });
          }
        }
      }
    }
    
    return this.selectBestCandidate(candidates, 'response_statements');
  }

  extractComponentsDeterminingHazard(text) {
    const patterns = this.config.section_patterns.components_determining_hazard;
    const candidates = [];
    
    for (const pattern of patterns) {
      const regex = new RegExp(pattern, 'gi');
      const matches = [...text.matchAll(regex)];
      
      for (const match of matches) {
        if (match[1]) {
          const cleaned = this.cleanLongText(match[1]);
          if (cleaned.length > 10 && cleaned.length < 1000) {
            candidates.push({
              text: cleaned,
              confidence: this.calculateFieldConfidence(cleaned, 'components_determining_hazard')
            });
          }
        }
      }
    }
    
    return this.selectBestCandidate(candidates, 'components_determining_hazard');
  }

  extractFirstAid(text) {
    const patterns = this.config.section_patterns.first_aid;
    const candidates = [];
    
    for (const pattern of patterns) {
      const regex = new RegExp(pattern, 'gi');
      const matches = [...text.matchAll(regex)];
      
      for (const match of matches) {
        if (match[1]) {
          const cleaned = this.cleanLongText(match[1]);
          if (cleaned.length > 20 && cleaned.length < 2000) {
            candidates.push({
              text: cleaned,
              confidence: this.calculateFieldConfidence(cleaned, 'first_aid')
            });
          }
        }
      }
    }
    
    return this.selectBestCandidate(candidates, 'first_aid');
  }

  extractStorage(text) {
    const patterns = this.config.section_patterns.storage;
    const candidates = [];
    
    for (const pattern of patterns) {
      const regex = new RegExp(pattern, 'gi');
      const matches = [...text.matchAll(regex)];
      
      for (const match of matches) {
        if (match[1]) {
          const cleaned = this.cleanLongText(match[1]);
          if (cleaned.length > 10 && cleaned.length < 1000) {
            candidates.push({
              text: cleaned,
              confidence: this.calculateFieldConfidence(cleaned, 'storage')
            });
          }
        }
      }
    }
    
    return this.selectBestCandidate(candidates, 'storage');
  }

  extractDisposal(text) {
    const patterns = this.config.section_patterns.disposal;
    const candidates = [];
    
    for (const pattern of patterns) {
      const regex = new RegExp(pattern, 'gi');
      const matches = [...text.matchAll(regex)];
      
      for (const match of matches) {
        if (match[1]) {
          const cleaned = this.cleanLongText(match[1]);
          if (cleaned.length > 10 && cleaned.length < 1000) {
            candidates.push({
              text: cleaned,
              confidence: this.calculateFieldConfidence(cleaned, 'disposal')
            });
          }
        }
      }
    }
    
    return this.selectBestCandidate(candidates, 'disposal');
  }

  extractUNNumber(text) {
    const patterns = this.config.section_patterns.un_number;
    
    for (const pattern of patterns) {
      const regex = new RegExp(pattern, 'gi');
      const match = text.match(regex);
      
      if (match && match[1]) {
        const unNumber = match[1].trim();
        if (/^[0-9]{4}$/.test(unNumber)) {
          return unNumber;
        }
      }
    }
    
    return '';
  }

  extractProperShippingName(text) {
    const patterns = this.config.section_patterns.proper_shipping_name;
    const candidates = [];
    
    for (const pattern of patterns) {
      const regex = new RegExp(pattern, 'gi');
      const matches = [...text.matchAll(regex)];
      
      for (const match of matches) {
        if (match[1]) {
          const cleaned = match[1].trim().replace(/\s+/g, ' ');
          if (cleaned.length > 5 && cleaned.length < 200) {
            candidates.push({
              text: cleaned,
              confidence: this.calculateFieldConfidence(cleaned, 'proper_shipping_name')
            });
          }
        }
      }
    }
    
    return this.selectBestCandidate(candidates, 'proper_shipping_name');
  }

  extractHazardClass(text) {
    const patterns = this.config.section_patterns.hazard_class;
    const candidates = [];
    
    for (const pattern of patterns) {
      const regex = new RegExp(pattern, 'gi');
      const matches = [...text.matchAll(regex)];
      
      for (const match of matches) {
        if (match[1]) {
          const cleaned = match[1].trim().replace(/\s+/g, ' ');
          if (cleaned.length > 1 && cleaned.length < 100) {
            candidates.push({
              text: cleaned,
              confidence: this.calculateFieldConfidence(cleaned, 'hazard_class')
            });
          }
        }
      }
    }
    
    return this.selectBestCandidate(candidates, 'hazard_class');
  }

  extractPackingGroup(text) {
    const patterns = this.config.section_patterns.packing_group;
    
    for (const pattern of patterns) {
      const regex = new RegExp(pattern, 'gi');
      const match = text.match(regex);
      
      if (match && match[1]) {
        const packingGroup = match[1].trim();
        return this.standardizePackingGroup(packingGroup);
      }
    }
    
    return '';
  }

  extractEmergencyResponseGuide(text) {
    const patterns = this.config.section_patterns.emergency_response_guide;
    
    for (const pattern of patterns) {
      const regex = new RegExp(pattern, 'gi');
      const match = text.match(regex);
      
      if (match && match[1]) {
        const ergNumber = match[1].trim();
        if (/^[0-9]+$/.test(ergNumber)) {
          return ergNumber;
        }
      }
    }
    
    return '';
  }

  // Helper methods
  cleanLongText(text) {
    if (!text) return '';
    
    return text
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, ' ')
      .trim()
      .substring(0, 2000); // Limit length
  }

  standardizeSignalWord(word) {
    if (!word) return 'NONE';
    
    const normalized = word.toLowerCase().trim();
    const map = this.config.validation_rules.signal_word.standardize_map;
    
    return map[normalized] || word.toUpperCase();
  }

  standardizePackingGroup(group) {
    if (!group) return '';
    
    const normalized = group.toLowerCase().trim();
    if (normalized.includes('none') || normalized.includes('n/a') || normalized.includes('not applicable')) {
      return 'Not applicable';
    }
    
    return group.trim();
  }

  calculateFieldConfidence(text, fieldType) {
    let confidence = 0.5; // Base confidence
    
    // Field-specific confidence adjustments
    switch (fieldType) {
      case 'hazard_statements':
        if (text.match(/H[0-9]{3}/g)) confidence += 0.3;
        if (text.includes('hazard') || text.includes('H-')) confidence += 0.1;
        break;
      case 'precautionary_statements':
        if (text.match(/P[0-9]{3}/g)) confidence += 0.3;
        if (text.includes('precautionary') || text.includes('P-')) confidence += 0.1;
        break;
      case 'first_aid':
        if (text.includes('eye') || text.includes('skin') || text.includes('inhaled')) confidence += 0.2;
        break;
      case 'storage':
        if (text.includes('store') || text.includes('temperature') || text.includes('cool')) confidence += 0.2;
        break;
      case 'disposal':
        if (text.includes('dispose') || text.includes('waste') || text.includes('container')) confidence += 0.2;
        break;
    }
    
    // Length-based confidence
    if (text.length > 50) confidence += 0.1;
    if (text.length > 100) confidence += 0.1;
    
    return Math.min(confidence, 1.0);
  }

  selectBestCandidate(candidates, fieldType) {
    if (candidates.length === 0) return '';
    
    // Sort by confidence
    candidates.sort((a, b) => b.confidence - a.confidence);
    
    // Return the highest confidence candidate
    const best = candidates[0];
    return best.confidence > 0.3 ? best.text : '';
  }

  calculateConfidence(extractedData) {
    const fields = [
      'signal_word', 'hazard_statements', 'precautionary_statements',
      'un_number', 'proper_shipping_name', 'hazard_class', 'packing_group'
    ];
    
    let filledFields = 0;
    let totalFields = fields.length;
    
    for (const field of fields) {
      if (extractedData[field] && extractedData[field].toString().trim() !== '' && extractedData[field] !== 'NONE') {
        filledFields++;
      }
    }
    
    return Math.round((filledFields / totalFields) * 100);
  }

  updateStats(extractedData) {
    for (const [field, value] of Object.entries(this.extractionStats)) {
      if (extractedData[field] && extractedData[field].toString().trim() !== '' && extractedData[field] !== 'NONE') {
        this.extractionStats[field]++;
      }
    }
  }

  createEmptyResult(fileName) {
    return {
      fileName,
      signal_word: 'NONE',
      hazard_statements: '',
      precautionary_statements: '',
      response_statements: '',
      components_determining_hazard: '',
      first_aid: '',
      storage: '',
      disposal: '',
      un_number: '',
      proper_shipping_name: '',
      hazard_class: '',
      packing_group: '',
      emergency_response_guide: '',
      extraction_confidence: 0,
      processing_notes: ['No text extracted from PDF']
    };
  }

  getStats() {
    return { ...this.extractionStats };
  }
}

export { SDSTextParser };