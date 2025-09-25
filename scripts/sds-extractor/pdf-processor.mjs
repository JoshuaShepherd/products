import fs from 'fs';
import path from 'path';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

class PDFProcessor {
  constructor() {
    this.processingStats = {
      totalFiles: 0,
      successfulExtractions: 0,
      failedExtractions: 0,
      emptyExtractions: 0
    };
  }

  async extractTextFromFile(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }

      const dataBuffer = fs.readFileSync(filePath);
      this.processingStats.totalFiles++;

      // Convert Buffer to Uint8Array for pdfjs-dist
      const uint8Array = new Uint8Array(dataBuffer);

      // Extract text using pdfjs-dist
      const loadingTask = pdfjsLib.getDocument({
        data: uint8Array,
        verbosity: 0 // Suppress console output
      });
      
      const pdfDocument = await loadingTask.promise;
      let fullText = '';
      const numPages = pdfDocument.numPages;

      // Extract text from each page
      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdfDocument.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        // Combine text items
        const pageText = textContent.items
          .map(item => item.str)
          .join(' ');
        
        fullText += pageText + '\n';
      }

      if (!fullText || fullText.trim().length < 50) {
        this.processingStats.emptyExtractions++;
        console.warn(`⚠️  Very little text extracted from: ${path.basename(filePath)}`);
        return {
          success: false,
          text: fullText || '',
          error: 'Minimal text extracted - possibly image-based PDF',
          metadata: {
            pages: numPages,
            textLength: fullText ? fullText.length : 0
          }
        };
      }

      this.processingStats.successfulExtractions++;
      return {
        success: true,
        text: this.cleanText(fullText),
        metadata: {
          pages: numPages,
          textLength: fullText.length
        }
      };

    } catch (error) {
      this.processingStats.failedExtractions++;
      console.error(`❌ Failed to extract text from ${path.basename(filePath)}:`, error.message);
      
      return {
        success: false,
        text: '',
        error: error.message,
        metadata: {}
      };
    }
  }

  cleanText(text) {
    if (!text) return '';

    return text
      // Normalize line endings
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      // Remove excessive whitespace but preserve structure
      .replace(/[ \t]+/g, ' ')
      // Remove page breaks and form feeds
      .replace(/\f/g, '\n')
      // Remove multiple consecutive newlines (keep max 2)
      .replace(/\n{3,}/g, '\n\n')
      // Trim each line
      .split('\n')
      .map(line => line.trim())
      .join('\n')
      // Final trim
      .trim();
  }

  async extractFromDirectory(directoryPath) {
    const results = [];
    
    try {
      const files = fs.readdirSync(directoryPath)
        .filter(file => file.toLowerCase().endsWith('.pdf'))
        .sort();

      console.log(`📁 Found ${files.length} PDF files in ${directoryPath}`);

      for (let i = 0; i < files.length; i++) {
        const fileName = files[i];
        const filePath = path.join(directoryPath, fileName);
        
        console.log(`📄 Processing ${i + 1}/${files.length}: ${fileName}`);
        
        const result = await this.extractTextFromFile(filePath);
        results.push({
          fileName,
          filePath,
          ...result
        });

        // Progress indicator
        if ((i + 1) % 10 === 0) {
          console.log(`⏳ Processed ${i + 1}/${files.length} files...`);
        }
      }

      console.log(`\n✅ PDF Processing Complete:`);
      console.log(`   Total files: ${this.processingStats.totalFiles}`);
      console.log(`   Successful: ${this.processingStats.successfulExtractions}`);
      console.log(`   Failed: ${this.processingStats.failedExtractions}`);
      console.log(`   Empty/Minimal: ${this.processingStats.emptyExtractions}`);
      console.log(`   Success rate: ${((this.processingStats.successfulExtractions / this.processingStats.totalFiles) * 100).toFixed(1)}%`);

      return results;

    } catch (error) {
      console.error('❌ Error processing directory:', error);
      throw error;
    }
  }

  getStats() {
    return { ...this.processingStats };
  }

  // Test function to analyze a single PDF
  async analyzePDF(filePath) {
    console.log(`🔍 Analyzing: ${path.basename(filePath)}`);
    
    const result = await this.extractTextFromFile(filePath);
    
    if (result.success) {
      const preview = result.text.substring(0, 500);
      console.log(`✅ Success - ${result.metadata.textLength} characters extracted`);
      console.log(`📖 Preview:\n${preview}${result.text.length > 500 ? '...' : ''}`);
    } else {
      console.log(`❌ Failed: ${result.error}`);
    }
    
    return result;
  }
}

export { PDFProcessor };