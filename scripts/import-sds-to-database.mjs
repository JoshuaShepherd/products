import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://bnwbjrlgoylmbblfmsru.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJud2Jqcmxnb3lsbWJibGZtc3J1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5NjY4NDEsImV4cCI6MjA3MjU0Mjg0MX0.EqX0rxmgtsl_WOBfyOY1nQ-7sL8QXTKXX5TirrmvIrA';

const supabase = createClient(supabaseUrl, supabaseKey);

class SDSDatabaseImporter {
  constructor() {
    this.importStats = {
      totalRecords: 0,
      successfulUpdates: 0,
      failedUpdates: 0,
      skippedRecords: 0,
      updatedFields: {
        signal_word: 0,
        hazard_statements: 0,
        precautionary_statements: 0,
        response_statements: 0,
        components_determining_hazard: 0,
        first_aid: 0,
        storage: 0,
        disposal: 0,
        proper_shipping_name: 0,
        hazard_class: 0,
        packing_group: 0
      }
    };
  }

  async importSDSData(csvFilePath = null) {
    const csvPath = csvFilePath || path.join(process.cwd(), 'scripts', 'output', 'extracted-sds-data.csv');
    
    console.log('🔄 Starting SDS data import to database');
    console.log(`📄 Reading CSV: ${csvPath}`);

    try {
      // Read and parse CSV
      const csvData = fs.readFileSync(csvPath, 'utf8');
      const lines = csvData.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim());
      
      console.log(`📊 Found ${lines.length - 1} records to process`);
      this.importStats.totalRecords = lines.length - 1;

      // Process each record
      for (let i = 1; i < lines.length; i++) {
        const values = this.parseCSVLine(lines[i]);
        if (values.length !== headers.length) {
          console.warn(`⚠️  Skipping malformed line ${i + 1}`);
          this.importStats.skippedRecords++;
          continue;
        }

        const record = {};
        headers.forEach((header, index) => {
          record[header] = values[index] || '';
        });

        await this.updateProductWithSDSData(record, i);

        // Progress update
        if (i % 25 === 0) {
          console.log(`⏳ Processed ${i}/${this.importStats.totalRecords} records...`);
        }
      }

      this.printImportReport();
      
    } catch (error) {
      console.error('❌ Error importing SDS data:', error);
      throw error;
    }
  }

  async updateProductWithSDSData(record, lineNumber) {
    try {
      // Skip if no product match
      if (!record.database_match || record.match_confidence < 0.8) {
        this.importStats.skippedRecords++;
        return;
      }

      const productName = record.database_match.replace(/"/g, '').trim();
      
      // Build update object with only fields that have meaningful data
      const updateData = {};
      const fieldsToUpdate = [
        'signal_word',
        'hazard_statements', 
        'precautionary_statements',
        'response_statements',
        'components_determining_hazard',
        'first_aid',
        'storage',
        'disposal',
        'proper_shipping_name',
        'hazard_class',
        'packing_group'
      ];

      let hasUpdates = false;

      fieldsToUpdate.forEach(field => {
        let value = record[field] ? record[field].replace(/"/g, '').trim() : '';
        
        // Skip empty values and placeholder values
        if (value && 
            value !== '' && 
            value !== 'NONE' && 
            value !== 'Not applicable' && 
            value !== 'Not Applicable' &&
            value.length > 2) {
          
          // Clean up the value
          value = this.cleanFieldValue(value, field);
          
          if (value) {
            updateData[field] = value;
            this.importStats.updatedFields[field]++;
            hasUpdates = true;
          }
        }
      });

      if (!hasUpdates) {
        this.importStats.skippedRecords++;
        return;
      }

      // Add timestamp
      updateData.updated_at = new Date().toISOString();

      // Update the product in database
      const { data, error } = await supabase
        .from('products')
        .update(updateData)
        .eq('name', productName)
        .select('id, name');

      if (error) {
        console.error(`❌ Failed to update ${productName}:`, error.message);
        this.importStats.failedUpdates++;
      } else if (data && data.length > 0) {
        console.log(`✅ Updated ${productName} (${Object.keys(updateData).length - 1} fields)`);
        this.importStats.successfulUpdates++;
      } else {
        console.warn(`⚠️  No product found with name: ${productName}`);
        this.importStats.skippedRecords++;
      }

    } catch (error) {
      console.error(`❌ Error processing line ${lineNumber}:`, error.message);
      this.importStats.failedUpdates++;
    }
  }

  cleanFieldValue(value, fieldType) {
    if (!value) return '';

    // Remove extra quotes and normalize whitespace
    let cleaned = value.replace(/^"|"$/g, '').trim();
    cleaned = cleaned.replace(/\s+/g, ' ');

      // Field-specific cleaning
      switch (fieldType) {
        case 'signal_word':
          // Map to correct enum values: None, Warning, Danger
          const upperCleaned = cleaned.toUpperCase();
          if (upperCleaned.includes('DANGER')) {
            return 'Danger';
          } else if (upperCleaned.includes('WARNING')) {
            return 'Warning';
          } else {
            return 'None';
          }
          break;      case 'hazard_statements':
      case 'precautionary_statements':
        // Limit length to prevent overly long extractions
        if (cleaned.length > 1000) {
          cleaned = cleaned.substring(0, 1000).trim();
        }
        break;
        
      case 'proper_shipping_name':
        // Limit length and clean up
        if (cleaned.length > 200) {
          cleaned = cleaned.substring(0, 200).trim();
        }
        break;
        
        case 'hazard_class':
          // Standardize hazard class format to match database enum
          if (cleaned.includes('Class 3') || cleaned.toLowerCase().includes('flammable')) {
            return 'Class 3';
          } else if (cleaned.includes('Class 8') || cleaned.toLowerCase().includes('corrosive')) {
            return 'Class 8';
          } else {
            return 'Not applicable';
          }
          break;      case 'packing_group':
        // Standardize packing group to match database enum (PG format)
        if (cleaned.includes('III')) {
          return 'PG III';
        } else if (cleaned.includes('II') && !cleaned.includes('III')) {
          return 'PG II';
        } else if (cleaned.includes('I') && !cleaned.includes('II') && !cleaned.includes('III')) {
          return 'PG I';
        } else {
          return 'Not applicable';
        }
        break;
    }

    return cleaned;
  }

  parseCSVLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Escaped quote
          current += '"';
          i++; // Skip next quote
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // End of field
        values.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    // Add final field
    values.push(current);
    
    return values;
  }

  printImportReport() {
    const stats = this.importStats;
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 SDS DATABASE IMPORT COMPLETE');
    console.log('='.repeat(60));
    
    console.log(`📊 Import Statistics:`);
    console.log(`   Total records: ${stats.totalRecords}`);
    console.log(`   Successful updates: ${stats.successfulUpdates}`);
    console.log(`   Failed updates: ${stats.failedUpdates}`);
    console.log(`   Skipped records: ${stats.skippedRecords}`);
    console.log(`   Success rate: ${((stats.successfulUpdates / stats.totalRecords) * 100).toFixed(1)}%`);
    
    console.log(`\n📋 Field Update Counts:`);
    Object.entries(stats.updatedFields).forEach(([field, count]) => {
      if (count > 0) {
        console.log(`   ${field}: ${count} products updated`);
      }
    });
    
    console.log('\n✅ Database import completed!');
    console.log('='.repeat(60));
  }

  // Preview mode - show what would be updated without making changes
  async previewImport(csvFilePath = null, limit = 10) {
    const csvPath = csvFilePath || path.join(process.cwd(), 'scripts', 'output', 'extracted-sds-data.csv');
    
    console.log('👀 PREVIEW MODE - No database changes will be made');
    console.log(`📄 Reading CSV: ${csvPath}`);

    try {
      const csvData = fs.readFileSync(csvPath, 'utf8');
      const lines = csvData.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim());
      
      console.log(`📊 Preview of first ${limit} records:\n`);

      for (let i = 1; i <= Math.min(limit, lines.length - 1); i++) {
        const values = this.parseCSVLine(lines[i]);
        if (values.length !== headers.length) continue;

        const record = {};
        headers.forEach((header, index) => {
          record[header] = values[index] || '';
        });

        if (record.database_match && record.match_confidence >= 0.8) {
          console.log(`${i}. Product: ${record.database_match}`);
          console.log(`   Match confidence: ${(record.match_confidence * 100).toFixed(1)}%`);
          console.log(`   Signal word: ${record.signal_word}`);
          console.log(`   Hazard class: ${record.hazard_class}`);
          console.log(`   Extraction confidence: ${record.extraction_confidence}%`);
          console.log('');
        }
      }
      
    } catch (error) {
      console.error('❌ Error previewing import:', error);
    }
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const importer = new SDSDatabaseImporter();
  
  const mode = process.argv[2] || 'import';
  
  try {
    if (mode === 'preview') {
      await importer.previewImport();
    } else if (mode === 'import') {
      console.log('⚠️  WARNING: This will update your database with SDS data');
      console.log('💾 Make sure you have a database backup before proceeding');
      console.log('⏳ Starting import in 3 seconds...\n');
      
      await new Promise(resolve => setTimeout(resolve, 3000));
      await importer.importSDSData();
    } else {
      console.log('Usage: node import-sds-to-database.mjs [preview|import]');
    }
  } catch (error) {
    console.error('\n❌ Import process failed:', error);
    process.exit(1);
  }
}

export { SDSDatabaseImporter };