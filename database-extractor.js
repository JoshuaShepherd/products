#!/usr/bin/env node

/**
 * SpecChem Database Schema & Data Extractor
 * 
 * This script extracts the complete database schema and data from Supabase
 * and generates comprehensive documentation for use in GitHub Copilot instructions.
 * 
 * Usage: node database-extractor.js
 * 
 * Environment variables required:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  console.error('   Make sure .env.local is configured correctly.');
  process.exit(1);
}

// Initialize Supabase client with service role key for full access
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Get all table names from the database
 */
async function getAllTables() {
  // Use direct SQL query via RPC or try known tables
  const knownTables = [
    'products',
    'categories', 
    'pictograms',
    'product_pictograms',
    'label_templates',
    'product_labels',
    'individual_label_templates',
    'product_media',
    'product_variants'
  ];
  
  // Test which tables actually exist
  const existingTables = [];
  
  for (const tableName of knownTables) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
        
      if (!error) {
        existingTables.push(tableName);
      }
    } catch (err) {
      // Table doesn't exist, skip it
      console.log(`Table ${tableName} does not exist or is not accessible`);
    }
  }
  
  return existingTables.sort();
}

/**
 * Get column information for a specific table
 */
async function getTableSchema(tableName) {
  // Since we can't access information_schema directly, we'll infer schema from actual data
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);

    if (error || !data || data.length === 0) {
      console.warn(`Could not fetch sample data for schema analysis of ${tableName}`);
      return [];
    }

    const sampleRow = data[0];
    const columns = [];
    
    for (const [columnName, value] of Object.entries(sampleRow)) {
      let dataType = 'unknown';
      let isNullable = 'YES';
      
      if (value !== null) {
        if (typeof value === 'string') {
          // Check if it's a UUID
          if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
            dataType = 'uuid';
          } else if (value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
            dataType = 'timestamp';
          } else {
            dataType = 'varchar';
          }
        } else if (typeof value === 'number') {
          dataType = Number.isInteger(value) ? 'integer' : 'decimal';
        } else if (typeof value === 'boolean') {
          dataType = 'boolean';
        } else if (value instanceof Date) {
          dataType = 'timestamp';
        }
        isNullable = 'NO';
      }
      
      columns.push({
        column_name: columnName,
        data_type: dataType,
        is_nullable: isNullable,
        column_default: null,
        character_maximum_length: null,
        numeric_precision: null,
        numeric_scale: null
      });
    }
    
    return columns;
  } catch (err) {
    console.error(`Error fetching schema for ${tableName}:`, err);
    return [];
  }
}

/**
 * Get foreign key relationships for a table
 */
async function getForeignKeys(tableName) {
  // Since we can't access system tables, we'll infer foreign keys from column names
  // Common patterns: column_id -> column table, *_id -> * table
  const foreignKeys = [];
  
  try {
    const schema = await getTableSchema(tableName);
    
    for (const column of schema) {
      const columnName = column.column_name;
      
      // Look for foreign key patterns
      if (columnName.endsWith('_id') && columnName !== 'id') {
        const referencedTable = columnName.replace('_id', '') + 's'; // products_id -> products
        const singularTable = columnName.replace('_id', ''); // category_id -> category
        
        // Try both plural and singular forms
        const possibleTables = [referencedTable, singularTable];
        
        for (const possibleTable of possibleTables) {
          try {
            const { data, error } = await supabase
              .from(possibleTable)
              .select('id')
              .limit(1);
              
            if (!error && data) {
              foreignKeys.push({
                column_name: columnName,
                referenced_table_name: possibleTable,
                referenced_column_name: 'id'
              });
              break;
            }
          } catch (err) {
            // Table doesn't exist, continue
          }
        }
      }
    }
    
    return foreignKeys;
  } catch (err) {
    console.warn(`Could not determine foreign keys for ${tableName}`);
    return [];
  }
}

/**
 * Get row count for a table
 */
async function getRowCount(tableName) {
  try {
    const { count, error } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.warn(`Could not get row count for ${tableName}:`, error.message);
      return 0;
    }

    return count || 0;
  } catch (err) {
    console.warn(`Could not get row count for ${tableName}:`, err.message);
    return 0;
  }
}

/**
 * Get sample data from a table
 */
async function getSampleData(tableName, limit = 3) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(limit);

    if (error) {
      console.warn(`Could not fetch sample data for ${tableName}:`, error.message);
      return [];
    }

    return data || [];
  } catch (err) {
    console.warn(`Could not fetch sample data for ${tableName}:`, err.message);
    return [];
  }
}

/**
 * Format data type for documentation
 */
function formatDataType(column) {
  let type = column.data_type.toUpperCase();
  
  if (column.character_maximum_length) {
    type += `(${column.character_maximum_length})`;
  } else if (column.numeric_precision && column.numeric_scale) {
    type += `(${column.numeric_precision},${column.numeric_scale})`;
  } else if (column.numeric_precision) {
    type += `(${column.numeric_precision})`;
  }

  if (column.is_nullable === 'YES') {
    type += ' (nullable)';
  }

  return type;
}

/**
 * Generate sample value for documentation
 */
function getSampleValue(sampleData, columnName, dataType) {
  if (!sampleData || sampleData.length === 0) return null;
  
  for (const row of sampleData) {
    const value = row[columnName];
    if (value !== null && value !== undefined) {
      if (typeof value === 'string' && value.length > 50) {
        return `${value.substring(0, 50)}...`;
      }
      return value;
    }
  }
  
  return null;
}

/**
 * Generate markdown documentation for the database
 */
async function generateDocumentation() {
  console.log('🔍 Extracting database schema and data...\n');

  const tables = await getAllTables();
  
  if (tables.length === 0) {
    console.error('❌ No tables found in the database');
    return null;
  }

  console.log(`📊 Found ${tables.length} tables: ${tables.join(', ')}\n`);

  let totalRecords = 0;
  const tableDetails = [];

  // Process each table
  for (const tableName of tables) {
    console.log(`📋 Processing table: ${tableName}`);
    
    const schema = await getTableSchema(tableName);
    const foreignKeys = await getForeignKeys(tableName);
    const rowCount = await getRowCount(tableName);
    const sampleData = await getSampleData(tableName, 2);
    
    totalRecords += rowCount;
    
    tableDetails.push({
      name: tableName,
      schema,
      foreignKeys,
      rowCount,
      sampleData
    });
    
    console.log(`   ✓ ${schema.length} columns, ${rowCount} records`);
  }

  console.log(`\n📈 Total records across all tables: ${totalRecords.toLocaleString()}`);

  // Generate timestamp
  const timestamp = new Date().toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short'
  });

  // Build markdown content
  let markdown = `# SpecChem Products Database - Live Schema Documentation

**Generated**: ${timestamp}  
**Database**: ${supabaseUrl}  
**Total Tables**: ${tables.length}  
**Total Records**: ${totalRecords.toLocaleString()}  
**Status**: ✅ Live Production Schema

## Executive Summary

This database powers the SpecChem Products system, supporting:
- **Product Management**: Core product catalog and specifications
- **Safety Compliance**: GHS pictogram library and associations  
- **Label Generation**: Template-based label system with customization
- **Multi-language Support**: English, French, Spanish product data

## Database Overview

| Table | Records | Purpose | Status |
|-------|---------|---------|--------|
`;

  // Add table overview
  for (const table of tableDetails) {
    const status = table.rowCount > 0 ? '🟢 Active' : '🟡 Empty';
    const purpose = getPurposeDescription(table.name);
    markdown += `| \`${table.name}\` | ${table.rowCount.toLocaleString()} | ${purpose} | ${status} |\n`;
  }

  markdown += `\n\n## Detailed Table Specifications\n\n`;

  // Add detailed table documentation
  for (const table of tableDetails) {
    markdown += generateTableDocumentation(table);
  }

  // Add system architecture section
  markdown += `
## System Architecture

### Label Generation Pipeline

1. **Template Selection**: Based on size parameter (14x7 or 5x9)
2. **Data Retrieval**: Product data + related pictograms + categories
3. **Customization Check**: Look for individual CSS overrides
4. **Variable Substitution**: Replace Handlebars placeholders
5. **HTML Generation**: Complete label with embedded CSS
6. **PDF Generation**: Via Puppeteer for download/print

### CSS Customization Hierarchy

1. **Individual Customizations** (\`individual_label_templates.css_overrides\`)
2. **Base Templates** (\`label_templates.css_template\`)
3. **Default CSS** (fallback in application code)

### Data Flow Diagram

\`\`\`
[Products] ←→ [Categories]
     ↓
[Product_Pictograms] ←→ [Pictograms]
     ↓
[Label_Templates] + [Individual_Label_Templates]
     ↓
[Generated Labels] → [PDF Output]
\`\`\`

## Key Features

### Multi-language Support
- **English**: Primary language for all products
- **French**: \`*_french\` fields for Quebec compliance
- **Spanish**: \`*_spanish\` fields for international markets

### Safety Compliance
- **GHS Pictograms**: Standard hazard communication symbols
- **Signal Words**: DANGER, WARNING, CAUTION classifications
- **Hazard Statements**: Standardized safety warnings
- **Precautionary Statements**: Safety handling instructions

### Label Customization
- **Base Templates**: Professional designs for 14x7" and 5x9" labels
- **Individual Overrides**: Product-specific CSS customizations
- **Real-time Preview**: Live editing with immediate feedback
- **Version Control**: Timestamps and notes for change tracking

## Performance Considerations

### Indexes
- Primary keys (UUID) on all tables
- Foreign key indexes for relationships
- Product lookup optimizations
- Label template caching

### Optimization Opportunities
- Consider materialized views for complex product queries
- Implement caching for frequently accessed label templates
- Add full-text search indexes for product descriptions
- Consider partitioning for large datasets

## Security Model

### Row Level Security (RLS)
- Enabled on \`individual_label_templates\`
- Public read access for label generation
- Authenticated write access for customizations

### API Access
- Anonymous read access for public product catalogs
- Service role for administrative operations
- Authenticated users for label customization

## Maintenance Notes

### Regular Tasks
- Monitor table growth and performance
- Update pictogram URLs if hosting changes
- Validate foreign key integrity
- Archive old label versions if implemented

### Backup Strategy
- Critical tables: \`products\`, \`label_templates\`
- Moderate priority: \`categories\`, \`pictograms\`
- Regenerable: \`product_labels\`, \`individual_label_templates\`

---

**Last Updated**: ${new Date().toISOString()}  
**Next Review**: ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}  
**Maintainer**: SpecChem Development Team
`;

  return markdown;
}

/**
 * Generate documentation for a single table
 */
function generateTableDocumentation(table) {
  const { name, schema, foreignKeys, rowCount, sampleData } = table;
  
  let markdown = `### ${name}\n\n`;
  markdown += `**Records**: ${rowCount.toLocaleString()} | **Columns**: ${schema.length}\n\n`;
  markdown += `**Purpose**: ${getPurposeDescription(name)}\n\n`;
  
  // Schema documentation
  markdown += `**Structure**:\n`;
  for (const column of schema) {
    const dataType = formatDataType(column);
    const sampleValue = getSampleValue(sampleData, column.column_name, column.data_type);
    const sampleText = sampleValue !== null ? ` - Sample: \`${JSON.stringify(sampleValue)}\`` : '';
    
    // Check if this column is a primary key (common naming convention)
    const isPrimaryKey = column.column_name === 'id' && column.column_default?.includes('gen_random_uuid');
    const pkText = isPrimaryKey ? ' (Primary Key)' : '';
    
    // Check if this column is a foreign key
    const fk = foreignKeys.find(fk => fk.column_name === column.column_name);
    const fkText = fk ? ` (Foreign Key)` : '';
    
    markdown += `- \`${column.column_name}\` (${dataType})${pkText}${fkText}${sampleText}\n`;
  }
  
  // Relationships
  if (foreignKeys.length > 0) {
    markdown += `\n**Relationships**:\n`;
    for (const fk of foreignKeys) {
      markdown += `- \`${fk.column_name}\` → \`${fk.referenced_table_name}(${fk.referenced_column_name})\`\n`;
    }
  }
  
  // Sample record
  if (sampleData && sampleData.length > 0) {
    markdown += `\n**Sample Record**:\n`;
    markdown += `\`\`\`json\n${JSON.stringify(sampleData[0], null, 2)}\`\`\`\n`;
  }
  
  markdown += `\n---\n\n`;
  
  return markdown;
}

/**
 * Get purpose description for a table
 */
function getPurposeDescription(tableName) {
  const purposes = {
    'products': 'Core product catalog and specifications',
    'categories': 'Product categorization and hierarchy',
    'pictograms': 'Safety pictogram library (GHS compliant)',
    'product_pictograms': 'Product-to-pictogram relationships',
    'label_templates': 'Base HTML/CSS templates for label generation',
    'product_labels': 'Generated label cache and history',
    'individual_label_templates': 'Product-specific CSS customizations',
    'product_media': 'Product images and documentation',
    'product_variants': 'Size/formulation variants'
  };
  
  return purposes[tableName] || 'Database table for application functionality';
}

/**
 * Main execution function
 */
async function main() {
  try {
    console.log('🚀 Starting SpecChem Database Extraction...\n');
    
    // Test database connection
    const { data: testData, error: testError } = await supabase
      .from('products')
      .select('count')
      .limit(1);
      
    if (testError) {
      console.error('❌ Database connection failed:', testError.message);
      process.exit(1);
    }
    
    console.log('✅ Database connection successful\n');
    
    // Generate documentation
    const documentation = await generateDocumentation();
    
    if (!documentation) {
      console.error('❌ Failed to generate documentation');
      process.exit(1);
    }
    
    // Save to file
    const outputPath = path.join(__dirname, 'LIVE_DATABASE_SCHEMA.md');
    await fs.writeFile(outputPath, documentation, 'utf8');
    
    console.log(`\n✅ Database documentation generated successfully!`);
    console.log(`📄 Saved to: ${outputPath}`);
    console.log(`📊 Document size: ${(documentation.length / 1024).toFixed(1)} KB`);
    
    // Update timestamp for next run tracking
    const timestampPath = path.join(__dirname, '.db-extract-timestamp');
    await fs.writeFile(timestampPath, new Date().toISOString(), 'utf8');
    
    console.log('\n🎯 Next steps:');
    console.log('   1. Review the generated LIVE_DATABASE_SCHEMA.md file');
    console.log('   2. Update GitHub Copilot instructions to reference this file');
    console.log('   3. Set up automated runs of this script when database changes');
    
  } catch (error) {
    console.error('❌ Extraction failed:', error);
    process.exit(1);
  }
}

// Run the extraction
main();