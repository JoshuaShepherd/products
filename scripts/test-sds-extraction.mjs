import { PDFProcessor } from './sds-extractor/pdf-processor.mjs';
import { SDSTextParser } from './sds-extractor/text-parser.mjs';
import { ProductMatcher } from './sds-extractor/product-matcher.mjs';
import path from 'path';

async function testSampleFiles() {
  console.log('🧪 Testing SDS extraction system with sample files');
  
  // Initialize components
  const pdfProcessor = new PDFProcessor();
  const textParser = new SDSTextParser();
  const productMatcher = new ProductMatcher();
  
  // Test with a few sample files
  const sampleFiles = [
    'All-Shield-EX-sds.pdf',
    'Bio-Strip-WB-sds.pdf',
    'Acetone-sds.pdf'
  ];
  
  const sdsPath = path.join(process.cwd(), 'public', 'data', 'sds');
  
  for (const fileName of sampleFiles) {
    const filePath = path.join(sdsPath, fileName);
    
    console.log(`\n${'='.repeat(50)}`);
    console.log(`📋 Testing: ${fileName}`);
    console.log(`${'='.repeat(50)}`);
    
    try {
      // Test PDF extraction
      console.log('\n1️⃣ PDF Text Extraction:');
      const pdfResult = await pdfProcessor.analyzePDF(filePath);
      
      if (pdfResult.success) {
        // Test text parsing
        console.log('\n2️⃣ SDS Section Parsing:');
        const extractedData = textParser.parseSDSText(pdfResult.text, fileName);
        
        console.log(`📊 Extraction Results:`);
        console.log(`   Signal Word: "${extractedData.signal_word}"`);
        console.log(`   Hazard Statements: "${extractedData.hazard_statements.substring(0, 80)}${extractedData.hazard_statements.length > 80 ? '...' : ''}"`);
        console.log(`   UN Number: "${extractedData.un_number}"`);
        console.log(`   Hazard Class: "${extractedData.hazard_class}"`);
        console.log(`   Confidence: ${extractedData.extraction_confidence}%`);
        
        // Test product matching
        console.log('\n3️⃣ Product Matching:');
        const productMatch = productMatcher.testMatch(fileName);
        
      } else {
        console.log('❌ PDF extraction failed, skipping further tests');
      }
      
    } catch (error) {
      console.error(`❌ Error testing ${fileName}:`, error.message);
    }
  }
  
  console.log('\n🎉 Sample testing complete!');
}

// Run the test
if (import.meta.url === `file://${process.argv[1]}`) {
  testSampleFiles().catch(console.error);
}

export { testSampleFiles };