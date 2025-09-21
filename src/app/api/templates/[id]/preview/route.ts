import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

// Template processor class
class TemplateProcessor {
  replaceVariables(template: string, data: Record<string, any>): string {
    let processed = template
    
    // Replace simple variables like {{product_name}}
    Object.entries(data).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g')
      processed = processed.replace(regex, String(value || ''))
    })
    
    return processed
  }

  processConditionals(template: string, data: Record<string, any>): string {
    let processed = template
    
    // Handle {{#if field}}...{{/if}} blocks
    const ifRegex = /\{\{#if\s+([^}]+)\}\}([\s\S]*?)\{\{\/if\}\}/g
    processed = processed.replace(ifRegex, (match, condition, content) => {
      const field = condition.trim()
      const value = data[field]
      return (value && value !== '' && value !== 'false') ? content : ''
    })
    
    // Handle {{#unless field}}...{{/unless}} blocks
    const unlessRegex = /\{\{#unless\s+([^}]+)\}\}([\s\S]*?)\{\{\/unless\}\}/g
    processed = processed.replace(unlessRegex, (match, condition, content) => {
      const field = condition.trim()
      const value = data[field]
      return (!value || value === '' || value === 'false') ? content : ''
    })
    
    return processed
  }

  processCSSVariables(css: string, variables: Record<string, string>): string {
    let processed = css
    
    Object.entries(variables).forEach(([name, value]) => {
      const regex = new RegExp(`var\\(--${name}\\)`, 'g')
      processed = processed.replace(regex, value)
    })
    
    return processed
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { product_id, version_id } = await request.json()
    const resolvedParams = await params
    
    const supabase = await createClient()
    
    // Get template version
    let versionQuery = supabase
      .from('label_template_versions')
      .select('*')
      .eq('template_id', resolvedParams.id)

    if (version_id) {
      versionQuery = versionQuery.eq('id', version_id)
    } else {
      versionQuery = versionQuery
        .eq('is_published', true)
        .order('version_number', { ascending: false })
        .limit(1)
    }
    
    const { data: version, error: versionError } = await versionQuery.single()
    if (versionError) throw versionError
    
    // Get CSS variables
    const { data: cssVariables, error: cssError } = await supabase
      .from('template_css_variables')
      .select('*')
      .eq('template_id', resolvedParams.id)
    
    if (cssError) throw cssError
    
    // Get product data
    let productData = {}
    if (product_id) {
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', product_id)
        .single()
      
      if (productError) throw productError
      
      // Transform to match your existing API format
      productData = {
        product_name: product.name,
        title: product.name,
        description: product.description,
        application: product.application,
        features: product.features,
        coverage: product.coverage,
        limitations: product.limitations,
        shelf_life: product.shelf_life,
        voc_data: product.voc_data,
        signal_word: product.signal_word,
        components_determining_hazard: product.components_determining_hazard,
        hazard_statements: product.hazard_statements,
        precautionary_statements: product.precautionary_statements,
        response_statements: product.response_statements,
        first_aid: product.first_aid,
        storage: product.storage,
        disposal: product.disposal,
        proper_shipping_name: product.proper_shipping_name,
        un_number: product.un_number,
        hazard_class: product.hazard_class,
        packing_group: product.packing_group,
        emergency_response_guide: product.emergency_response_guide,
        subtitle_1: product.subtitle_1,
        subtitle_2: product.subtitle_2,
        do_not_freeze: product.do_not_freeze ? 'true' : 'false',
        mix_well: product.mix_well ? 'true' : 'false',
        green_conscious: product.green_conscious ? 'true' : 'false',
        used_by_date: product.used_by_date
      }
    } else {
      // Use sample data for preview
      productData = {
        product_name: 'Sample Product',
        title: 'Sample Product',
        description: 'This is a sample product description for preview purposes.',
        application: 'Sample application instructions',
        features: 'Sample features list',
        coverage: '200-400 sq ft per gallon',
        shelf_life: '2 years from manufacture date',
        signal_word: 'Warning',
        hazard_statements: 'H315: Causes skin irritation',
        precautionary_statements: 'P280: Wear protective gloves',
        first_aid: 'If skin irritation occurs, wash with soap and water',
        storage: 'Store in cool, dry place',
        subtitle_1: 'Professional Grade',
        subtitle_2: 'Fast Setting'
      }
    }
    
    // Process template
    const processor = new TemplateProcessor()
    
    let processedHtml = processor.replaceVariables(version.html_template, productData)
    processedHtml = processor.processConditionals(processedHtml, productData)
    
    // Process CSS variables
    const variablesMap: Record<string, string> = {}
    cssVariables?.forEach(variable => {
      variablesMap[variable.variable_name.replace('--', '')] = variable.variable_value
    })
    
    const processedCss = processor.processCSSVariables(version.css_template, variablesMap)
    
    // Inject processed CSS into HTML
    const finalHtml = `
      <style>${processedCss}</style>
      ${processedHtml}
    `
    
    return NextResponse.json({
      html: finalHtml,
      css: processedCss,
      raw_html: processedHtml,
      variables_used: Object.keys(variablesMap)
    })
  } catch (error) {
    console.error('Error generating preview:', error)
    return NextResponse.json(
      { error: 'Failed to generate preview' },
      { status: 500 }
    )
  }
}
