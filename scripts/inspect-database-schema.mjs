#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables
import dotenv from 'dotenv'
dotenv.config({ path: path.join(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey)
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

class DatabaseInspector {
  constructor() {
    this.schema = {
      tables: {},
      types: {},
      functions: {},
      indexes: {},
      constraints: {},
      triggers: {}
    }
  }

  async inspectDatabase() {
    console.log('🔍 Inspecting database schema...')
    
    try {
      await this.getTables()
      await this.getTypes()
      await this.getIndexes()
      await this.getConstraints()
      await this.getTriggers()
      await this.getFunctions()
      
      console.log('✅ Database inspection complete')
      return this.schema
    } catch (error) {
      console.error('❌ Error inspecting database:', error)
      throw error
    }
  }

  async getTables() {
    console.log('📋 Fetching table information...')
    
    try {
      // Get all tables in public schema using SQL query
      const { data: tableNames } = await supabase
        .rpc('get_tables_info') // This might not exist, so we'll use a raw query approach
        
      if (!tableNames) {
        // Use a different approach - get table names first
        const tables = [
          'products', 'categories', 'product_variants', 'pictograms', 
          'product_pictograms', 'label_templates', 'product_labels',
          'product_media', 'application_methods', 'product_specifications'
        ]
        
        for (const tableName of tables) {
          await this.getTableDetails(tableName)
        }
      }
    } catch (error) {
      console.warn('⚠️  Using fallback table discovery...')
      
      // Known tables from the schema
      const knownTables = [
        'products', 'categories', 'product_variants', 'pictograms', 
        'product_pictograms', 'label_templates', 'product_labels',
        'product_media', 'application_methods', 'product_specifications'
      ]
      
      for (const tableName of knownTables) {
        await this.getTableDetails(tableName)
      }
    }
  }

  async getTableDetails(tableName) {
    console.log(`  📊 Inspecting table: ${tableName}`)
    
    try {
      // Try to query the table to see if it exists and get basic info
      const { data: sampleData, error: queryError } = await supabase
        .from(tableName)
        .select('*')
        .limit(1)

      if (queryError) {
        console.warn(`  ⚠️  Table ${tableName} not accessible: ${queryError.message}`)
        this.schema.tables[tableName] = { 
          error: queryError.message,
          exists: false 
        }
        return
      }

      // Get row count
      const { count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true })

      // Get column structure from a sample record
      const columns = sampleData && sampleData.length > 0 
        ? Object.keys(sampleData[0]).map(key => ({
            column_name: key,
            data_type: typeof sampleData[0][key],
            sample_value: sampleData[0][key]
          }))
        : []

      this.schema.tables[tableName] = {
        exists: true,
        row_count: count || 0,
        columns: columns,
        sample_data: sampleData?.[0] || null
      }

      console.log(`    ✅ ${tableName}: ${count || 0} rows, ${columns.length} columns`)

    } catch (error) {
      console.warn(`  ⚠️  Could not inspect table ${tableName}:`, error.message)
      this.schema.tables[tableName] = { 
        error: error.message,
        exists: false 
      }
    }
  }

  async getTypes() {
    console.log('🏷️  Fetching custom types...')
    
    try {
      // Try to detect enum types by checking known enum columns
      const enumChecks = [
        { table: 'products', column: 'signal_word' },
        { table: 'products', column: 'hazard_class' },
        { table: 'products', column: 'packing_group' }
      ]
      
      for (const check of enumChecks) {
        try {
          const { data } = await supabase
            .from(check.table)
            .select(check.column)
            .not(check.column, 'is', null)
            .limit(100)
            
          if (data && data.length > 0) {
            const uniqueValues = [...new Set(data.map(row => row[check.column]).filter(Boolean))]
            this.schema.types[check.column] = uniqueValues
          }
        } catch (error) {
          console.warn(`    Could not check enum ${check.table}.${check.column}`)
        }
      }
    } catch (error) {
      console.warn('⚠️  Could not fetch custom types:', error.message)
    }
  }

  async getIndexes() {
    console.log('📇 Fetching indexes...')
    
    try {
      const { data: indexes } = await supabase
        .rpc('get_table_indexes')

      if (indexes) {
        this.schema.indexes = indexes
      }
    } catch (error) {
      console.warn('⚠️  Could not fetch indexes:', error.message)
    }
  }

  async getConstraints() {
    console.log('🔗 Fetching constraints...')
    
    try {
      const { data: constraints } = await supabase
        .rpc('get_table_constraints')

      if (constraints) {
        this.schema.constraints = constraints
      }
    } catch (error) {
      console.warn('⚠️  Could not fetch constraints:', error.message)
    }
  }

  async getTriggers() {
    console.log('⚡ Fetching triggers...')
    
    try {
      const { data: triggers } = await supabase
        .rpc('get_table_triggers')

      if (triggers) {
        this.schema.triggers = triggers
      }
    } catch (error) {
      console.warn('⚠️  Could not fetch triggers:', error.message)
    }
  }

  async getFunctions() {
    console.log('🔧 Fetching functions...')
    
    try {
      const { data: functions } = await supabase
        .rpc('get_custom_functions')

      if (functions) {
        this.schema.functions = functions
      }
    } catch (error) {
      console.warn('⚠️  Could not fetch functions:', error.message)
    }
  }

  generateDocumentation() {
    const timestamp = new Date().toISOString()
    
    let docs = `# Database Schema Documentation
    
**Generated**: ${timestamp}
**Source**: Live Supabase Database Inspection
**Environment**: ${supabaseUrl}

---

## Overview

This documentation was generated by inspecting the live Supabase database schema using Node.js.

## Tables

`

    // Document each table
    Object.entries(this.schema.tables).forEach(([tableName, tableInfo]) => {
      docs += `### ${tableName}\n\n`
      
      if (tableInfo.error) {
        docs += `❌ **Error**: ${tableInfo.error}\n\n`
        return
      }

      docs += `**Row Count**: ${tableInfo.row_count || 0}\n\n`
      
      if (tableInfo.columns && Array.isArray(tableInfo.columns)) {
        docs += `| Column | Type | Nullable | Default | Notes |\n`
        docs += `|--------|------|----------|---------|-------|\n`
        
        tableInfo.columns.forEach(col => {
          const nullable = col.is_nullable === 'YES' ? '✓' : '✗'
          const defaultVal = col.column_default || ''
          const typeInfo = col.character_maximum_length 
            ? `${col.data_type}(${col.character_maximum_length})`
            : col.data_type
            
          docs += `| ${col.column_name} | ${typeInfo} | ${nullable} | ${defaultVal} | |\n`
        })
        docs += `\n`
      }
    })

    // Document custom types
    if (Object.keys(this.schema.types).length > 0) {
      docs += `## Custom Types\n\n`
      
      Object.entries(this.schema.types).forEach(([typeName, values]) => {
        docs += `### ${typeName}\n\n`
        if (Array.isArray(values)) {
          docs += values.map(v => `- \`${v}\``).join('\n') + '\n\n'
        } else {
          docs += `${JSON.stringify(values, null, 2)}\n\n`
        }
      })
    }

    // Document indexes
    if (Object.keys(this.schema.indexes).length > 0) {
      docs += `## Indexes\n\n`
      docs += `${JSON.stringify(this.schema.indexes, null, 2)}\n\n`
    }

    // Document constraints
    if (Object.keys(this.schema.constraints).length > 0) {
      docs += `## Constraints\n\n`
      docs += `${JSON.stringify(this.schema.constraints, null, 2)}\n\n`
    }

    // Document triggers
    if (Object.keys(this.schema.triggers).length > 0) {
      docs += `## Triggers\n\n`
      docs += `${JSON.stringify(this.schema.triggers, null, 2)}\n\n`
    }

    // Document functions
    if (Object.keys(this.schema.functions).length > 0) {
      docs += `## Functions\n\n`
      docs += `${JSON.stringify(this.schema.functions, null, 2)}\n\n`
    }

    docs += `## Raw Schema Data\n\n`
    docs += `\`\`\`json\n${JSON.stringify(this.schema, null, 2)}\n\`\`\`\n`

    return docs
  }
}

// Main execution
async function main() {
  try {
    console.log('🚀 Starting database schema inspection...')
    
    const inspector = new DatabaseInspector()
    await inspector.inspectDatabase()
    
    const documentation = inspector.generateDocumentation()
    const outputPath = path.join(__dirname, '../docs/current-database-schema.md')
    
    // Ensure docs directory exists
    const docsDir = path.dirname(outputPath)
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true })
    }
    
    fs.writeFileSync(outputPath, documentation)
    
    console.log(`✅ Documentation generated: ${outputPath}`)
    console.log(`📊 Found ${Object.keys(inspector.schema.tables).length} tables`)
    console.log(`🏷️  Found ${Object.keys(inspector.schema.types).length} custom types`)
    
    // Also save raw schema as JSON
    const jsonPath = path.join(__dirname, '../docs/current-schema.json')
    fs.writeFileSync(jsonPath, JSON.stringify(inspector.schema, null, 2))
    console.log(`💾 Raw schema saved: ${jsonPath}`)
    
  } catch (error) {
    console.error('❌ Failed to inspect database:', error)
    process.exit(1)
  }
}

main()