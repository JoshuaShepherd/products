import fs from 'fs';
import path from 'path';
import { PDFProcessor } from './pdf-processor.mjs';
import { SDSTextParser } from './text-parser.mjs';
import { ProductMatcher } from './product-matcher.mjs';

class SDSDataExtractor {
  constructor() {
    this.pdfProcessor = new PDFProcessor();
    this.textParser = new SDSTextParser();
    this.productMatcher = new ProductMatcher();
    
    this.extractionResults = [];
    this.processingLog = {
      startTime: new Date().toISOString(),
      endTime: null,
      totalFiles: 0,
      processedFiles: 0,
      failedFiles: 0,
      successfulExtractions: 0,
      qualityMetrics: {}
    };
  }

  async extractAllSDS(sdsDirectory = null) {
    const sdsPath = sdsDirectory || path.join(process.cwd(), 'public', 'data', 'sds');
    
    console.log('🚀 Starting SDS Data Extraction Process');
    console.log(`📁 Source directory: ${sdsPath}`);
    
    try {
      // Verify directory exists
      if (!fs.existsSync(sdsPath)) {
        throw new Error(`SDS directory not found: ${sdsPath}`);
      }

      // Get list of PDF files
      const pdfFiles = fs.readdirSync(sdsPath)
        .filter(file => file.toLowerCase().endsWith('.pdf'))
        .sort();

      if (pdfFiles.length === 0) {
        throw new Error('No PDF files found in SDS directory');
      }

      console.log(`📄 Found ${pdfFiles.length} SDS files to process`);
      this.processingLog.totalFiles = pdfFiles.length;

      // Process each file
      for (let i = 0; i < pdfFiles.length; i++) {
        const fileName = pdfFiles[i];
        const filePath = path.join(sdsPath, fileName);
        
        console.log(`\n📋 Processing ${i + 1}/${pdfFiles.length}: ${fileName}`);
        
        try {
          const result = await this.processSingleSDS(filePath, fileName);
          this.extractionResults.push(result);
          
          if (result.pdfExtraction.success && result.extractionData.extraction_confidence > 0) {
            this.processingLog.successfulExtractions++;
          }
          
          this.processingLog.processedFiles++;
          
        } catch (error) {
          console.error(`❌ Failed to process ${fileName}:`, error.message);
          this.processingLog.failedFiles++;
          
          // Add failed result to maintain file count
          this.extractionResults.push({
            fileName,
            filePath,
            pdfExtraction: { success: false, error: error.message },
            extractionData: this.textParser.createEmptyResult(fileName),
            productMatch: { confidence: 0, method: 'none' },
            processingNotes: [`Failed to process: ${error.message}`]
          });
        }

        // Progress update
        if ((i + 1) % 10 === 0) {
          console.log(`⏳ Progress: ${i + 1}/${pdfFiles.length} files processed`);
        }
      }

      // Finalize processing
      this.processingLog.endTime = new Date().toISOString();
      this.calculateQualityMetrics();
      
      // Generate outputs
      await this.generateCSVOutput();
      await this.generateProcessingReport();
      await this.generateValidationReport();
      
      this.printFinalReport();
      
      return this.extractionResults;

    } catch (error) {
      console.error('❌ Critical error in extraction process:', error);
      throw error;
    }
  }

  async processSingleSDS(filePath, fileName) {
    // Step 1: Extract text from PDF
    const pdfResult = await this.pdfProcessor.extractTextFromFile(filePath);
    
    // Step 2: Parse SDS sections from text
    const extractionData = this.textParser.parseSDSText(
      pdfResult.text || '', 
      fileName
    );
    
    // Step 3: Match to database product
    const productMatch = this.productMatcher.matchProduct(fileName);
    
    // Step 4: Combine results
    const result = {
      fileName,
      filePath,
      pdfExtraction: pdfResult,
      extractionData,
      productMatch,
      processingTimestamp: new Date().toISOString(),
      processingNotes: []
    };

    // Add processing notes
    if (!pdfResult.success) {
      result.processingNotes.push('PDF text extraction failed');
    }
    
    if (extractionData.extraction_confidence < 50) {
      result.processingNotes.push('Low extraction confidence');
    }
    
    if (productMatch.confidence < 0.8) {
      result.processingNotes.push('Low product match confidence');
    }
    
    if (productMatch.method === 'none') {
      result.processingNotes.push('No product match found');
    }

    return result;
  }

  calculateQualityMetrics() {
    const total = this.extractionResults.length;
    const successful = this.extractionResults.filter(r => r.pdfExtraction.success);
    const highConfidence = this.extractionResults.filter(r => r.extractionData.extraction_confidence >= 70);
    const matched = this.extractionResults.filter(r => r.productMatch.confidence >= 0.8);
    
    // Field completion rates
    const fieldStats = {};
    const fields = [
      'signal_word', 'hazard_statements', 'precautionary_statements',
      'un_number', 'proper_shipping_name', 'hazard_class', 'packing_group',
      'first_aid', 'storage', 'disposal', 'emergency_response_guide'
    ];
    
    fields.forEach(field => {
      const completed = this.extractionResults.filter(r => 
        r.extractionData[field] && 
        r.extractionData[field].toString().trim() !== '' && 
        r.extractionData[field] !== 'NONE'
      ).length;
      
      fieldStats[field] = {
        completed,
        percentage: ((completed / total) * 100).toFixed(1)
      };
    });

    this.processingLog.qualityMetrics = {
      pdfExtractionRate: ((successful.length / total) * 100).toFixed(1),
      highConfidenceRate: ((highConfidence.length / total) * 100).toFixed(1),
      productMatchRate: ((matched.length / total) * 100).toFixed(1),
      fieldCompletionRates: fieldStats
    };
  }

  async generateCSVOutput() {
    const csvPath = path.join(process.cwd(), 'scripts', 'output', 'extracted-sds-data.csv');
    
    // Define CSV headers
    const headers = [
      'product_name',
      'sds_filename',
      'database_match',
      'match_confidence',
      'signal_word',
      'hazard_statements',
      'precautionary_statements',
      'response_statements',
      'components_determining_hazard',
      'first_aid',
      'storage',
      'disposal',
      'un_number',
      'proper_shipping_name',
      'hazard_class',
      'packing_group',
      'emergency_response_guide',
      'extraction_confidence',
      'processing_notes',
      'processing_timestamp'
    ];

    // Generate CSV content
    let csvContent = headers.join(',') + '\n';
    
    for (const result of this.extractionResults) {
      const row = [
        this.escapeCsvValue(result.productMatch.name || ''),
        this.escapeCsvValue(result.fileName),
        this.escapeCsvValue(result.productMatch.name || ''),
        result.productMatch.confidence,
        this.escapeCsvValue(result.extractionData.signal_word),
        this.escapeCsvValue(result.extractionData.hazard_statements),
        this.escapeCsvValue(result.extractionData.precautionary_statements),
        this.escapeCsvValue(result.extractionData.response_statements),
        this.escapeCsvValue(result.extractionData.components_determining_hazard),
        this.escapeCsvValue(result.extractionData.first_aid),
        this.escapeCsvValue(result.extractionData.storage),
        this.escapeCsvValue(result.extractionData.disposal),
        this.escapeCsvValue(result.extractionData.un_number),
        this.escapeCsvValue(result.extractionData.proper_shipping_name),
        this.escapeCsvValue(result.extractionData.hazard_class),
        this.escapeCsvValue(result.extractionData.packing_group),
        this.escapeCsvValue(result.extractionData.emergency_response_guide),
        result.extractionData.extraction_confidence,
        this.escapeCsvValue(result.processingNotes.join('; ')),
        result.processingTimestamp
      ];
      
      csvContent += row.join(',') + '\n';
    }

    fs.writeFileSync(csvPath, csvContent);
    console.log(`📄 CSV output saved to: ${csvPath}`);
  }

  async generateProcessingReport() {
    const reportPath = path.join(process.cwd(), 'scripts', 'output', 'processing-log.json');
    
    const report = {
      ...this.processingLog,
      pdfProcessorStats: this.pdfProcessor.getStats(),
      textParserStats: this.textParser.getStats(),
      productMatcherStats: this.productMatcher.getStats()
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📊 Processing report saved to: ${reportPath}`);
  }

  async generateValidationReport() {
    const validationPath = path.join(process.cwd(), 'scripts', 'output', 'validation-errors.csv');
    const unmatchedPath = path.join(process.cwd(), 'scripts', 'output', 'unmatched-products.csv');
    
    // Validation errors
    const validationErrors = [];
    const unmatchedProducts = [];
    
    for (const result of this.extractionResults) {
      // Check for validation issues
      if (result.extractionData.extraction_confidence < 30) {
        validationErrors.push({
          fileName: result.fileName,
          issue: 'Low extraction confidence',
          confidence: result.extractionData.extraction_confidence,
          notes: result.processingNotes.join('; ')
        });
      }
      
      // Check for unmatched products
      if (result.productMatch.confidence < 0.8) {
        unmatchedProducts.push({
          fileName: result.fileName,
          cleanedName: result.productMatch.cleanedName || '',
          confidence: result.productMatch.confidence,
          method: result.productMatch.method,
          suggestions: result.productMatch.suggestions ? 
            result.productMatch.suggestions.map(s => s.name).join('; ') : ''
        });
      }
    }
    
    // Write validation errors CSV
    if (validationErrors.length > 0) {
      let validationCsv = 'fileName,issue,confidence,notes\n';
      validationErrors.forEach(error => {
        validationCsv += [
          this.escapeCsvValue(error.fileName),
          this.escapeCsvValue(error.issue),
          error.confidence,
          this.escapeCsvValue(error.notes)
        ].join(',') + '\n';
      });
      fs.writeFileSync(validationPath, validationCsv);
      console.log(`⚠️  Validation errors saved to: ${validationPath}`);
    }
    
    // Write unmatched products CSV
    if (unmatchedProducts.length > 0) {
      let unmatchedCsv = 'fileName,cleanedName,confidence,method,suggestions\n';
      unmatchedProducts.forEach(product => {
        unmatchedCsv += [
          this.escapeCsvValue(product.fileName),
          this.escapeCsvValue(product.cleanedName),
          product.confidence,
          this.escapeCsvValue(product.method),
          this.escapeCsvValue(product.suggestions)
        ].join(',') + '\n';
      });
      fs.writeFileSync(unmatchedPath, unmatchedCsv);
      console.log(`🔍 Unmatched products saved to: ${unmatchedPath}`);
    }
  }

  escapeCsvValue(value) {
    if (value === null || value === undefined) return '';
    
    const stringValue = value.toString();
    
    // If the value contains comma, newline, or quotes, wrap in quotes and escape existing quotes
    if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
      return '"' + stringValue.replace(/"/g, '""') + '"';
    }
    
    return stringValue;
  }

  printFinalReport() {
    const log = this.processingLog;
    const metrics = log.qualityMetrics;
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 SDS EXTRACTION COMPLETE');
    console.log('='.repeat(60));
    
    console.log(`📊 Overall Statistics:`);
    console.log(`   Total files: ${log.totalFiles}`);
    console.log(`   Successfully processed: ${log.processedFiles}`);
    console.log(`   Failed: ${log.failedFiles}`);
    console.log(`   High-quality extractions: ${log.successfulExtractions}`);
    
    console.log(`\n📈 Quality Metrics:`);
    console.log(`   PDF extraction rate: ${metrics.pdfExtractionRate}%`);
    console.log(`   High confidence rate: ${metrics.highConfidenceRate}%`);
    console.log(`   Product match rate: ${metrics.productMatchRate}%`);
    
    console.log(`\n📋 Field Completion Rates:`);
    Object.entries(metrics.fieldCompletionRates).forEach(([field, stats]) => {
      console.log(`   ${field}: ${stats.completed}/${log.totalFiles} (${stats.percentage}%)`);
    });
    
    console.log(`\n📄 Output Files:`);
    console.log(`   ✅ extracted-sds-data.csv - Main dataset`);
    console.log(`   📊 processing-log.json - Detailed statistics`);
    console.log(`   ⚠️  validation-errors.csv - Quality issues`);
    console.log(`   🔍 unmatched-products.csv - Matching issues`);
    
    console.log('\n' + '='.repeat(60));
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const extractor = new SDSDataExtractor();
  
  try {
    await extractor.extractAllSDS();
    console.log('\n✅ SDS extraction completed successfully!');
  } catch (error) {
    console.error('\n❌ SDS extraction failed:', error);
    process.exit(1);
  }
}

export { SDSDataExtractor };