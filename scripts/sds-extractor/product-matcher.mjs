import fs from 'fs';
import path from 'path';
import FuzzySet from 'fuzzyset.js';

class ProductMatcher {
  constructor() {
    this.productReference = null;
    this.fuzzySet = null;
    this.exactMatches = new Map();
    this.matchingStats = {
      totalFiles: 0,
      exactMatches: 0,
      fuzzyMatches: 0,
      noMatches: 0,
      lowConfidenceMatches: 0
    };
    
    this.loadProductReference();
  }

  loadProductReference() {
    try {
      const referencePath = path.join(process.cwd(), 'scripts', 'output', 'product-reference.json');
      const nameListPath = path.join(process.cwd(), 'scripts', 'output', 'product-names.json');
      
      if (!fs.existsSync(referencePath) || !fs.existsSync(nameListPath)) {
        throw new Error('Product reference files not found. Run generate-product-reference.mjs first.');
      }
      
      this.productReference = JSON.parse(fs.readFileSync(referencePath, 'utf8'));
      const productNames = JSON.parse(fs.readFileSync(nameListPath, 'utf8'));
      
      // Create fuzzy matching set
      this.fuzzySet = FuzzySet(productNames);
      
      // Create exact match lookup with variations
      for (const product of this.productReference.products) {
        // Add exact name
        this.exactMatches.set(product.name.toLowerCase(), {
          id: product.id,
          name: product.name,
          slug: product.slug,
          confidence: 1.0
        });
        
        // Add variations
        for (const variation of product.variations) {
          this.exactMatches.set(variation.toLowerCase(), {
            id: product.id,
            name: product.name,
            slug: product.slug,
            confidence: 1.0
          });
        }
      }
      
      console.log(`✅ Loaded ${this.productReference.products.length} products for matching`);
      console.log(`📊 Created ${this.exactMatches.size} exact match entries`);
      
    } catch (error) {
      console.error('❌ Error loading product reference:', error);
      throw error;
    }
  }

  matchProduct(sdsFileName) {
    this.matchingStats.totalFiles++;
    
    // Clean the filename to extract product name
    const cleanName = this.cleanProductName(sdsFileName);
    
    // Try exact match first
    const exactMatch = this.tryExactMatch(cleanName);
    if (exactMatch) {
      this.matchingStats.exactMatches++;
      return {
        ...exactMatch,
        method: 'exact',
        originalFileName: sdsFileName,
        cleanedName: cleanName
      };
    }
    
    // Try fuzzy matching
    const fuzzyMatch = this.tryFuzzyMatch(cleanName);
    if (fuzzyMatch) {
      if (fuzzyMatch.confidence >= 0.8) {
        this.matchingStats.fuzzyMatches++;
      } else {
        this.matchingStats.lowConfidenceMatches++;
      }
      
      return {
        ...fuzzyMatch,
        method: 'fuzzy',
        originalFileName: sdsFileName,
        cleanedName: cleanName
      };
    }
    
    // No match found
    this.matchingStats.noMatches++;
    return {
      id: null,
      name: null,
      slug: null,
      confidence: 0,
      method: 'none',
      originalFileName: sdsFileName,
      cleanedName: cleanName,
      suggestions: this.getSuggestions(cleanName)
    };
  }

  cleanProductName(fileName) {
    if (!fileName) return '';
    
    // Start with the filename
    let cleaned = fileName;
    
    // Remove file extension
    cleaned = cleaned.replace(/\.pdf$/i, '');
    cleaned = cleaned.replace(/-sds$/i, '');
    
    // Replace hyphens with spaces
    cleaned = cleaned.replace(/-/g, ' ');
    
    // Remove common suffixes that might not be in database names
    cleaned = cleaned.replace(/\b(sds|safety data sheet|concentrate|conc)\b/gi, '');
    
    // Clean up extra spaces
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    return cleaned;
  }

  tryExactMatch(cleanName) {
    // Try direct lookup
    const direct = this.exactMatches.get(cleanName.toLowerCase());
    if (direct) return direct;
    
    // Try without common modifiers
    const withoutModifiers = this.removeCommonModifiers(cleanName);
    if (withoutModifiers !== cleanName) {
      const match = this.exactMatches.get(withoutModifiers.toLowerCase());
      if (match) return { ...match, confidence: 0.95 };
    }
    
    // Try partial matches for compound names
    const words = cleanName.split(' ');
    if (words.length > 1) {
      // Try first part only
      const firstPart = words[0];
      const match = this.exactMatches.get(firstPart.toLowerCase());
      if (match) return { ...match, confidence: 0.9 };
      
      // Try without last word
      const withoutLast = words.slice(0, -1).join(' ');
      const matchWithoutLast = this.exactMatches.get(withoutLast.toLowerCase());
      if (matchWithoutLast) return { ...matchWithoutLast, confidence: 0.9 };
    }
    
    return null;
  }

  tryFuzzyMatch(cleanName) {
    if (!this.fuzzySet) return null;
    
    // Try fuzzy matching with different variations
    const variations = [
      cleanName,
      this.removeCommonModifiers(cleanName),
      cleanName.replace(/\s+/g, ''),
      cleanName.replace(/\s+/g, '-')
    ];
    
    let bestMatch = null;
    
    for (const variation of variations) {
      if (!variation || variation.length < 2) continue;
      
      const results = this.fuzzySet.get(variation);
      if (results && results.length > 0) {
        const [confidence, matchedName] = results[0];
        
        if (!bestMatch || confidence > bestMatch.confidence) {
          // Find the product info for this matched name
          const productInfo = this.findProductByName(matchedName);
          if (productInfo) {
            bestMatch = {
              ...productInfo,
              confidence: confidence
            };
          }
        }
      }
    }
    
    return bestMatch;
  }

  removeCommonModifiers(name) {
    return name
      .replace(/\b(WB|SB|EX|WL|LV|HV|Ultra|Plus|Pro|Max|Super)\b/gi, '')
      .replace(/\b(Concentrate|Conc|Ready to Use|RTU)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  findProductByName(name) {
    const product = this.productReference.products.find(p => 
      p.name.toLowerCase() === name.toLowerCase()
    );
    
    if (product) {
      return {
        id: product.id,
        name: product.name,
        slug: product.slug
      };
    }
    
    return null;
  }

  getSuggestions(cleanName, limit = 3) {
    if (!this.fuzzySet || !cleanName) return [];
    
    const results = this.fuzzySet.get(cleanName);
    if (!results) return [];
    
    return results
      .slice(0, limit)
      .map(([confidence, name]) => ({
        name,
        confidence: confidence,
        product: this.findProductByName(name)
      }))
      .filter(suggestion => suggestion.product);
  }

  // Process multiple files
  matchProducts(fileNames) {
    const results = [];
    
    console.log(`🔍 Matching ${fileNames.length} products...`);
    
    for (let i = 0; i < fileNames.length; i++) {
      const fileName = fileNames[i];
      const match = this.matchProduct(fileName);
      results.push(match);
      
      if ((i + 1) % 25 === 0) {
        console.log(`⏳ Processed ${i + 1}/${fileNames.length} matches...`);
      }
    }
    
    this.printMatchingReport();
    
    return results;
  }

  printMatchingReport() {
    const stats = this.matchingStats;
    const total = stats.totalFiles;
    
    console.log(`\n📊 Product Matching Results:`);
    console.log(`   Total files: ${total}`);
    console.log(`   Exact matches: ${stats.exactMatches} (${((stats.exactMatches / total) * 100).toFixed(1)}%)`);
    console.log(`   Fuzzy matches: ${stats.fuzzyMatches} (${((stats.fuzzyMatches / total) * 100).toFixed(1)}%)`);
    console.log(`   Low confidence: ${stats.lowConfidenceMatches} (${((stats.lowConfidenceMatches / total) * 100).toFixed(1)}%)`);
    console.log(`   No matches: ${stats.noMatches} (${((stats.noMatches / total) * 100).toFixed(1)}%)`);
    console.log(`   Overall success: ${(((stats.exactMatches + stats.fuzzyMatches) / total) * 100).toFixed(1)}%`);
  }

  getStats() {
    return { ...this.matchingStats };
  }

  // Test a single product match
  testMatch(fileName) {
    console.log(`🧪 Testing match for: ${fileName}`);
    
    const result = this.matchProduct(fileName);
    
    console.log(`📋 Results:`);
    console.log(`   Method: ${result.method}`);
    console.log(`   Confidence: ${(result.confidence * 100).toFixed(1)}%`);
    console.log(`   Cleaned name: "${result.cleanedName}"`);
    
    if (result.name) {
      console.log(`   ✅ Matched to: ${result.name} (${result.id})`);
    } else {
      console.log(`   ❌ No match found`);
      if (result.suggestions && result.suggestions.length > 0) {
        console.log(`   💡 Suggestions:`);
        result.suggestions.forEach((suggestion, i) => {
          console.log(`      ${i + 1}. ${suggestion.name} (${(suggestion.confidence * 100).toFixed(1)}%)`);
        });
      }
    }
    
    return result;
  }
}

export { ProductMatcher };