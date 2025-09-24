#!/usr/bin/env node

/**
 * Generate HTML labels for all products using both 14x7 and 5x9 templates
 * Saves HTML files to labels-html/ directory
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables from .env.local
function loadEnvFile() {
  const envPath = path.join(__dirname, '.env.local')
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8')
    const lines = envContent.split('\n')
    
    lines.forEach(line => {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=')
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=')
          process.env[key] = value
        }
      }
    })
  }
}

// Load environment variables
loadEnvFile()

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('Please check your .env.local file contains:')
  console.error('- NEXT_PUBLIC_SUPABASE_URL')
  console.error('- NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Output directory
const outputDir = path.join(__dirname, 'labels-html')

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

/**
 * Process conditional sections in HTML template
 * Handles {{#if variable}}content{{/if}} syntax
 */
function processConditionals(html, vars) {
  // Handle nested conditionals by processing from innermost to outermost
  let processed = html
  let maxIterations = 10
  let iteration = 0
  
  while (processed.includes('{{#if') && iteration < maxIterations) {
    iteration++
    
    // Find the innermost conditional block (one that doesn't contain other {{#if blocks)
    const ifPattern = /\{\{#if\s+([^}]+)\}\}((?:(?!\{\{#if).)*?)\{\{\/if\}\}/s
    
    processed = processed.replace(ifPattern, (match, variable, content) => {
      const trimmedVar = variable.trim()
      const value = vars[trimmedVar]
      
      // Return content if variable exists and is truthy, empty string otherwise
      if (value && value !== '' && value !== 'No' && value !== 'false') {
        return content
      }
      return ''
    })
  }
  
  return processed
}

/**
 * Generate label HTML for a single product
 */
async function generateLabelHTML(product, template, templateSize) {
  try {
    console.log(`  📄 Generating ${templateSize} label for: ${product.name}`)

    // Get pictograms for this product
    const { data: pictogramData, error: pictogramError } = await supabase
      .from('product_pictograms')
      .select(`
        pictograms(
          id,
          name,
          url,
          description
        )
      `)
      .eq('product_id', product.id)
      .order('sort_order')

    const pictograms = pictogramData?.map(pp => pp.pictograms) || []

    // Check for individual CSS overrides
    const { data: individualTemplate } = await supabase
      .from('individual_label_templates')
      .select('custom_css, css_overrides, template_id, notes')
      .eq('product_id', product.id)
      .maybeSingle()

    // Create template variables mapping
    const templateVars = {
      product_name: product.name || '',
      name: product.name || '',
      description: product.description || '',
      application: product.application || '',
      features: product.features || '',
      limitations: product.limitations || '',
      shelf_life: product.shelf_life || '',
      short_description_english: product.short_description_english || '',
      short_description_french: product.short_description_french || '',
      short_description_spanish: product.short_description_spanish || '',
      subtitle_1: product.subtitle_1 || '',
      subtitle_2: product.subtitle_2 || '',
      signal_word: product.signal_word || '',
      hazard_statements: product.hazard_statements || '',
      precautionary_statements: product.precautionary_statements || '',
      response_statements: product.response_statements || '',
      first_aid: product.first_aid || '',
      storage: product.storage || '',
      disposal: product.disposal || '',
      proper_shipping_name: product.proper_shipping_name || '',
      un_number: product.un_number || '',
      hazard_class: product.hazard_class || '',
      packing_group: product.packing_group || '',
      emergency_response_guide: product.emergency_response_guide || '',
      components_determining_hazard: product.components_determining_hazard || '',
      coverage: product.coverage || '',
      voc_data: product.voc_data || '',
      used_by_date: product.used_by_date || '',
      conditions_of_sale: product.conditions_of_sale || '',
      warranty_limitation: product.warranty_limitation || '',
      inherent_risk: product.inherent_risk || '',
      additional_terms: product.additional_terms || '',
      manufacturing_notice: product.manufacturing_notice || '',
      safety_notice: product.safety_notice || '',
      // Boolean flags converted to Yes/No
      do_not_freeze: product.do_not_freeze ? 'Yes' : '',
      mix_well: product.mix_well ? 'Yes' : '',
      green_conscious: product.green_conscious ? 'Yes' : '',
      // French fields
      composants_determinant_le_danger: product.composants_determinant_le_danger || '',
      mot_de_signalement: product.mot_de_signalement || '',
      mentions_de_danger: product.mentions_de_danger || '',
      conseils_de_prudence: product.conseils_de_prudence || '',
      premiers_soins: product.premiers_soins || '',
      mesures_de_premiers_secours: product.mesures_de_premiers_secours || '',
      consignes_de_stockage: product.consignes_de_stockage || '',
      consignes_delimination: product.consignes_delimination || '',
    }

    // Generate pictogram HTML if pictograms exist
    if (pictograms && pictograms.length > 0) {
      const pictogramHTML = pictograms.map(p => 
        `<img src="${p.url}" alt="${p.name}" class="pictogram" />`
      ).join('')
      templateVars.pictograms = pictogramHTML

      // Corner pictograms (first 3)
      const cornerPictogramHTML = pictograms.slice(0, 3).map(p => 
        `<img src="${p.url}" alt="${p.name}" class="corner-icon" />`
      ).join(' ')
      templateVars.corner_pictograms = cornerPictogramHTML
    }

    // Start with template HTML
    let html = template.html_template || ''

    // Process conditional blocks first
    html = processConditionals(html, templateVars)

    // Replace simple template variables
    Object.keys(templateVars).forEach(key => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
      html = html.replace(regex, templateVars[key] || '')
    })

    // Build final CSS with individual overrides if they exist
    let finalCSS = template.css_template || ''
    
    if (individualTemplate && individualTemplate.css_overrides) {
      finalCSS += `\n\n/* Individual Product CSS Overrides */\n${individualTemplate.css_overrides}`
    }

    // Replace CSS placeholder
    html = html.replace(/\{\{css_styles\}\}/g, finalCSS)

    // Create final HTML document
    const finalHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${product.name} - ${templateSize} Label | SpecChem</title>
    <style>
${finalCSS}
    </style>
</head>
<body>
${html}
</body>
</html>`

    return finalHTML

  } catch (error) {
    console.error(`    ❌ Error generating label for ${product.name}:`, error.message)
    return null
  }
}

/**
 * Create a safe filename from product name
 */
function createSafeFilename(productName, templateSize) {
  // Remove or replace unsafe characters
  const safeName = productName
    .replace(/[\/\\\?%\*:|"<>]/g, '-') // Replace unsafe chars with dash
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/\.+/g, '-') // Replace periods with dash
    .replace(/^-+|-+$/g, '') // Remove leading/trailing dashes
    .substring(0, 100) // Limit length
  
  return `${safeName}_${templateSize}.html`
}

/**
 * Main function to generate all labels
 */
async function generateAllLabels() {
  console.log('🏷️  SpecChem Label HTML Generator')
  console.log('=====================================')
  
  try {
    // Get all active products
    console.log('📊 Fetching products from database...')
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (productsError) {
      throw new Error(`Failed to fetch products: ${productsError.message}`)
    }

    console.log(`✅ Found ${products.length} active products`)

    // Get both label templates
    console.log('📋 Fetching label templates...')
    const { data: templates, error: templatesError } = await supabase
      .from('label_templates')
      .select('*')
      .eq('is_active', true)
      .in('name', ['14x7 Enhanced Large Format', '5x9 Compact Format'])

    if (templatesError) {
      throw new Error(`Failed to fetch templates: ${templatesError.message}`)
    }

    const template14x7 = templates.find(t => t.name === '14x7 Enhanced Large Format')
    const template5x9 = templates.find(t => t.name === '5x9 Compact Format')

    if (!template14x7 || !template5x9) {
      throw new Error('Required label templates not found in database')
    }

    console.log('✅ Found both label templates')
    console.log(`   - 14x7: ${template14x7.name}`)
    console.log(`   - 5x9:  ${template5x9.name}`)

    // Create subdirectories for each template size
    const dir14x7 = path.join(outputDir, '14x7')
    const dir5x9 = path.join(outputDir, '5x9')
    
    if (!fs.existsSync(dir14x7)) fs.mkdirSync(dir14x7, { recursive: true })
    if (!fs.existsSync(dir5x9)) fs.mkdirSync(dir5x9, { recursive: true })

    console.log('\n🏭 Generating label HTML files...')
    
    let successCount14x7 = 0
    let successCount5x9 = 0
    let errorCount = 0

    // Process each product
    for (let i = 0; i < products.length; i++) {
      const product = products[i]
      const progress = `[${i + 1}/${products.length}]`
      
      console.log(`\n${progress} Processing: ${product.name}`)

      // Generate 14x7 label
      try {
        const html14x7 = await generateLabelHTML(product, template14x7, '14x7')
        if (html14x7) {
          const filename14x7 = createSafeFilename(product.name, '14x7')
          const filepath14x7 = path.join(dir14x7, filename14x7)
          fs.writeFileSync(filepath14x7, html14x7, 'utf8')
          successCount14x7++
          console.log(`  ✅ Saved: 14x7/${filename14x7}`)
        }
      } catch (error) {
        console.error(`  ❌ Failed 14x7 for ${product.name}:`, error.message)
        errorCount++
      }

      // Generate 5x9 label
      try {
        const html5x9 = await generateLabelHTML(product, template5x9, '5x9')
        if (html5x9) {
          const filename5x9 = createSafeFilename(product.name, '5x9')
          const filepath5x9 = path.join(dir5x9, filename5x9)
          fs.writeFileSync(filepath5x9, html5x9, 'utf8')
          successCount5x9++
          console.log(`  ✅ Saved: 5x9/${filename5x9}`)
        }
      } catch (error) {
        console.error(`  ❌ Failed 5x9 for ${product.name}:`, error.message)
        errorCount++
      }

      // Small delay to avoid overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 50))
    }

    // Generate summary report
    const summaryReport = `# Label Generation Summary Report
Generated: ${new Date().toISOString()}

## Statistics
- Total Products Processed: ${products.length}
- 14x7 Labels Generated: ${successCount14x7}
- 5x9 Labels Generated: ${successCount5x9}
- Total Successful: ${successCount14x7 + successCount5x9}
- Errors: ${errorCount}

## Templates Used
- 14x7: ${template14x7.name} (${template14x7.width_mm}×${template14x7.height_mm}mm)
- 5x9: ${template5x9.name} (${template5x9.width_mm}×${template5x9.height_mm}mm)

## Output Structure
\`\`\`
labels-html/
├── 14x7/           # Large format labels (${successCount14x7} files)
├── 5x9/            # Compact format labels (${successCount5x9} files)
└── README.md       # This report
\`\`\`

## Notes
- All HTML files are complete standalone documents
- CSS is embedded inline for portability
- Pictograms and images use external URLs
- Individual CSS overrides are applied where configured
- File names are sanitized for filesystem compatibility
`

    fs.writeFileSync(path.join(outputDir, 'README.md'), summaryReport, 'utf8')

    console.log('\n🎉 Label generation complete!')
    console.log('=====================================')
    console.log(`📊 Final Results:`)
    console.log(`   - 14x7 Labels: ${successCount14x7}/${products.length}`)
    console.log(`   - 5x9 Labels:  ${successCount5x9}/${products.length}`)
    console.log(`   - Errors:      ${errorCount}`)
    console.log(`   - Output dir:  ${outputDir}`)
    console.log(`   - Summary:     ${path.join(outputDir, 'README.md')}`)

  } catch (error) {
    console.error('❌ Fatal error:', error.message)
    process.exit(1)
  }
}

// Run the generator
generateAllLabels()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Unhandled error:', error)
    process.exit(1)
  })